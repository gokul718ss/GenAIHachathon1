#!/usr/bin/env python3
"""
RAG Service for StudyMate+
Handles document processing, embedding generation, and AI-powered responses
"""

import os
import sys
import json
import logging
from typing import List, Dict, Any, Optional
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from ibm_watsonx_ai import APIClient
from ibm_watsonx_ai.foundation_models.utils.enums import ModelTypes
from ibm_watsonx_ai.foundation_models import Model
from dotenv import load_dotenv
import pickle

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        """Initialize the RAG service with models and configurations"""
        self.embedding_model = None
        self.faiss_index = None
        self.document_chunks = {}
        self.watsonx_client = None
        self.model = None
        self.index_path = "faiss_index.pkl"
        self.chunks_path = "document_chunks.pkl"

        self._initialize_models()

    def _initialize_models(self):
        """Initialize all required models and services"""
        try:
            # Initialize sentence transformer for embeddings
            logger.info("Loading sentence transformer model...")
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Sentence transformer loaded successfully")

            # Initialize IBM Watsonx
            logger.info("Initializing IBM Watsonx client...")
            credentials = {
                "url": os.getenv("IBM_WATSONX_URL"),
                "apikey": os.getenv("IBM_WATSONX_API_KEY")
            }

            self.watsonx_client = APIClient(credentials)

            # Initialize the model
            model_id = ModelTypes.MIXTRAL_8X7B_INSTRUCT_V01
            parameters = {
                "decoding_method": "greedy",
                "max_new_tokens": 300,
                "temperature": 0.5,
                "repetition_penalty": 1.1
            }

            self.model = Model(
                model_id=model_id,
                params=parameters,
                credentials=credentials,
                project_id=os.getenv("IBM_WATSONX_PROJECT_ID")
            )

            logger.info("IBM Watsonx initialized successfully")

            # Load existing index if available
            self._load_existing_index()

        except Exception as e:
            logger.error(f"Error initializing models: {str(e)}")
            raise

    def _load_existing_index(self):
        """Load existing FAISS index and document chunks"""
        try:
            if os.path.exists(self.index_path):
                with open(self.index_path, 'rb') as f:
                    self.faiss_index = pickle.load(f)
                logger.info("Loaded existing FAISS index")

            if os.path.exists(self.chunks_path):
                with open(self.chunks_path, 'rb') as f:
                    self.document_chunks = pickle.load(f)
                logger.info("Loaded existing document chunks")

        except Exception as e:
            logger.warning(f"Could not load existing index: {str(e)}")
            self.faiss_index = None
            self.document_chunks = {}

    def _save_index(self):
        """Save FAISS index and document chunks to disk"""
        try:
            if self.faiss_index is not None:
                with open(self.index_path, 'wb') as f:
                    pickle.dump(self.faiss_index, f)

            with open(self.chunks_path, 'wb') as f:
                pickle.dump(self.document_chunks, f)

        except Exception as e:
            logger.error(f"Error saving index: {str(e)}")

    def add_document_chunks(self, document_id: str, chunks: List[str], metadata: Dict = None):
        """Add document chunks to the vector database"""
        try:
            logger.info(f"Adding {len(chunks)} chunks for document {document_id}")

            # Generate embeddings for chunks
            embeddings = self.embedding_model.encode(chunks)
            embeddings = np.array(embeddings).astype('float32')

            # Initialize FAISS index if not exists
            if self.faiss_index is None:
                dimension = embeddings.shape[1]
                self.faiss_index = faiss.IndexFlatIP(dimension)
                logger.info(f"Created new FAISS index with dimension {dimension}")

            # Add embeddings to index
            start_id = self.faiss_index.ntotal
            self.faiss_index.add(embeddings)

            # Store document chunks with metadata
            for i, chunk in enumerate(chunks):
                chunk_id = start_id + i
                self.document_chunks[chunk_id] = {
                    'document_id': document_id,
                    'content': chunk,
                    'metadata': metadata or {},
                    'chunk_index': i
                }

            # Save index
            self._save_index()

            return {
                'status': 'success',
                'chunks_added': len(chunks),
                'total_chunks': self.faiss_index.ntotal
            }

        except Exception as e:
            logger.error(f"Error adding document chunks: {str(e)}")
            return {'status': 'error', 'message': str(e)}

    def query_documents(self, query: str, course_id: str = None, k: int = 5) -> Dict:
        """Query documents using similarity search"""
        try:
            if self.faiss_index is None or self.faiss_index.ntotal == 0:
                return {
                    'status': 'success',
                    'results': [],
                    'message': 'No documents indexed yet'
                }

            # Generate query embedding
            query_embedding = self.embedding_model.encode([query])
            query_embedding = np.array(query_embedding).astype('float32')

            # Search for similar chunks
            scores, indices = self.faiss_index.search(query_embedding, min(k, self.faiss_index.ntotal))

            # Format results
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx in self.document_chunks:
                    chunk_data = self.document_chunks[idx]

                    # Filter by course if specified
                    if course_id and chunk_data.get('metadata', {}).get('course_id') != course_id:
                        continue

                    results.append({
                        'content': chunk_data['content'],
                        'score': float(score),
                        'document_id': chunk_data['document_id'],
                        'chunk_index': chunk_data['chunk_index'],
                        'metadata': chunk_data.get('metadata', {})
                    })

            return {
                'status': 'success',
                'results': results[:k],
                'query': query
            }

        except Exception as e:
            logger.error(f"Error querying documents: {str(e)}")
            return {'status': 'error', 'message': str(e)}

    def generate_answer(self, query: str, context: List[Dict], course_info: Dict = None) -> Dict:
        """Generate answer using IBM Watsonx with retrieved context"""
        try:
            # Prepare context text
            context_text = "\n\n".join([
                f"Context {i+1}: {item.get('content', '')}"
                for i, item in enumerate(context[:3])  # Use top 3 contexts
            ])

            # Prepare course context
            course_context = ""
            if course_info:
                course_context = f"\nCourse: {course_info.get('title', '')}\nInstructor: {course_info.get('instructor', '')}\n"

            # Create prompt
            prompt = f"""You are an AI teaching assistant for StudyMate+. Answer the student's question based on the provided context from their course materials.

{course_context}
Context from course materials:
{context_text}

Student Question: {query}

Instructions:
1. Answer based primarily on the provided context
2. Be helpful and educational
3. If the context doesn't contain enough information, acknowledge this
4. Keep the answer concise but informative
5. Use a friendly, supportive tone

Answer:"""

            # Generate response using Watsonx
            response = self.model.generate_text(prompt=prompt)

            return {
                'status': 'success',
                'answer': response,
                'context_used': len(context),
                'query': query
            }

        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            return {'status': 'error', 'message': str(e)}

    def generate_schedule(self, user_preferences: Dict, courses: List[Dict], current_schedule: Dict = None) -> Dict:
        """Generate personalized study schedule using AI"""
        try:
            # Prepare schedule context
            preferences_text = json.dumps(user_preferences, indent=2)
            courses_text = json.dumps([{
                'title': course.get('title', ''),
                'difficulty': course.get('difficulty', ''),
                'duration': course.get('duration', {}),
                'category': course.get('category', '')
            } for course in courses], indent=2)

            current_schedule_text = ""
            if current_schedule:
                current_schedule_text = f"\nCurrent Schedule: {json.dumps(current_schedule, indent=2)}\n"

            prompt = f"""You are an AI study scheduler for StudyMate+. Create a personalized study schedule based on the student's preferences and enrolled courses.

Student Preferences:
{preferences_text}

Enrolled Courses:
{courses_text}
{current_schedule_text}

Create a weekly study schedule that:
1. Respects the student's available time slots
2. Balances different subjects appropriately
3. Includes breaks and variety
4. Considers course difficulty levels
5. Allows time for assignments and review

Return the schedule as a JSON object with this structure:
{{
  "title": "Personalized Study Schedule",
  "items": [
    {{
      "title": "Math Study Session",
      "type": "study",
      "course": "course_id",
      "startTime": "2024-01-15T09:00:00Z",
      "endTime": "2024-01-15T10:30:00Z",
      "isRecurring": true,
      "recurrencePattern": {{
        "frequency": "weekly",
        "daysOfWeek": [1]
      }},
      "priority": "high",
      "notes": "Focus on algebra concepts"
    }}
  ]
}}

Schedule:"""

            response = self.model.generate_text(prompt=prompt)

            # Try to parse JSON response
            try:
                schedule_data = json.loads(response.strip())
                return {
                    'status': 'success',
                    'schedule': schedule_data
                }
            except json.JSONDecodeError:
                # If JSON parsing fails, return text response
                return {
                    'status': 'success',
                    'schedule': {
                        'title': 'AI Generated Schedule',
                        'description': response,
                        'items': []
                    }
                }

        except Exception as e:
            logger.error(f"Error generating schedule: {str(e)}")
            return {'status': 'error', 'message': str(e)}

    def health_check(self) -> Dict:
        """Check if all services are healthy"""
        try:
            # Test embedding model
            test_embedding = self.embedding_model.encode(["test"])

            # Test Watsonx connection (simple test)
            test_response = self.model.generate_text(prompt="Say 'OK' if you're working")

            return {
                'status': 'ok',
                'embedding_model': 'healthy',
                'watsonx_model': 'healthy',
                'faiss_index': 'ready' if self.faiss_index else 'empty',
                'total_documents': self.faiss_index.ntotal if self.faiss_index else 0
            }

        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {'status': 'error', 'message': str(e)}

# Main execution
def main():
    if len(sys.argv) < 2:
        print(json.dumps({'status': 'error', 'message': 'No command specified'}))
        return

    try:
        rag_service = RAGService()
        command = sys.argv[1]

        if command == 'health_check':
            result = rag_service.health_check()

        elif command == 'query_documents':
            if len(sys.argv) < 3:
                result = {'status': 'error', 'message': 'Query not provided'}
            else:
                query = sys.argv[2]
                course_id = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != 'null' else None
                limit = int(sys.argv[4]) if len(sys.argv) > 4 else 5
                result = rag_service.query_documents(query, course_id, limit)

        elif command == 'generate_answer':
            if len(sys.argv) < 4:
                result = {'status': 'error', 'message': 'Insufficient arguments'}
            else:
                query = sys.argv[2]
                context = json.loads(sys.argv[3])
                course_info = json.loads(sys.argv[4]) if len(sys.argv) > 4 else None
                result = rag_service.generate_answer(query, context, course_info)

        elif command == 'generate_schedule':
            if len(sys.argv) < 4:
                result = {'status': 'error', 'message': 'Insufficient arguments'}
            else:
                user_preferences = json.loads(sys.argv[2])
                courses = json.loads(sys.argv[3])
                current_schedule = json.loads(sys.argv[4]) if len(sys.argv) > 4 else None
                result = rag_service.generate_schedule(user_preferences, courses, current_schedule)

        else:
            result = {'status': 'error', 'message': f'Unknown command: {command}'}

        print(json.dumps(result))

    except Exception as e:
        logger.error(f"Main execution error: {str(e)}")
        print(json.dumps({'status': 'error', 'message': str(e)}))

if __name__ == "__main__":
    main()
