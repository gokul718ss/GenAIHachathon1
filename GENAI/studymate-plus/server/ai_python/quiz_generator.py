#!/usr/bin/env python3
"""
Quiz Generator for StudyMate+
Generates quiz questions from document content using IBM Watsonx
"""

import os
import sys
import json
import logging
import random
from typing import List, Dict, Any
from ibm_watsonx_ai import APIClient
from ibm_watsonx_ai.foundation_models.utils.enums import ModelTypes
from ibm_watsonx_ai.foundation_models import Model
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QuizGenerator:
    def __init__(self):
        """Initialize quiz generator with IBM Watsonx"""
        self.watsonx_client = None
        self.model = None
        self._initialize_watsonx()

    def _initialize_watsonx(self):
        """Initialize IBM Watsonx client and model"""
        try:
            credentials = {
                "url": os.getenv("IBM_WATSONX_URL"),
                "apikey": os.getenv("IBM_WATSONX_API_KEY")
            }

            self.watsonx_client = APIClient(credentials)

            # Initialize the model for quiz generation
            model_id = ModelTypes.MIXTRAL_8X7B_INSTRUCT_V01
            parameters = {
                "decoding_method": "sample",
                "max_new_tokens": 800,
                "temperature": 0.7,
                "top_p": 0.9,
                "repetition_penalty": 1.1
            }

            self.model = Model(
                model_id=model_id,
                params=parameters,
                credentials=credentials,
                project_id=os.getenv("IBM_WATSONX_PROJECT_ID")
            )

            logger.info("IBM Watsonx initialized for quiz generation")

        except Exception as e:
            logger.error(f"Error initializing Watsonx: {str(e)}")
            raise

    def generate_quiz_questions(self, content: str, options: Dict[str, Any]) -> Dict[str, Any]:
        """Generate quiz questions from content"""
        try:
            num_questions = options.get('num_questions', 10)
            difficulty = options.get('difficulty', 'medium')
            question_types = options.get('question_types', ['multiple-choice', 'true-false'])
            topic = options.get('topic', None)

            # Prepare the prompt for quiz generation
            topic_context = f"Focus on the topic: {topic}\n" if topic else ""

            prompt = f"""You are an educational AI assistant creating quiz questions from course material.

{topic_context}
Content to create questions from:
{content[:3000]}...

Generate {num_questions} quiz questions at {difficulty} difficulty level.

Question Types to Use: {', '.join(question_types)}

For each question, provide:
1. Question text
2. Question type (multiple-choice, true-false, or open-ended)
3. Correct answer
4. For multiple-choice: 4 options (A, B, C, D)
5. Brief explanation of the correct answer
6. Difficulty level
7. Points (1-3 based on difficulty)

Format as JSON array:
[
  {{
    "question": "What is the main concept discussed?",
    "type": "multiple-choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "Brief explanation here",
    "difficulty": "medium",
    "points": 2,
    "tags": ["topic1", "topic2"]
  }}
]

Questions:"""

            # Generate response
            response = self.model.generate_text(prompt=prompt)

            # Try to parse JSON response
            try:
                questions_data = json.loads(response.strip())

                # Validate and format questions
                formatted_questions = []
                for i, q in enumerate(questions_data):
                    if i >= num_questions:
                        break

                    formatted_q = self._format_question(q, question_types)
                    if formatted_q:
                        formatted_questions.append(formatted_q)

                return {
                    'status': 'success',
                    'questions': formatted_questions,
                    'total_generated': len(formatted_questions)
                }

            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract questions manually
                logger.warning("Failed to parse JSON, attempting manual extraction")
                questions = self._extract_questions_from_text(response, num_questions, question_types)

                return {
                    'status': 'success',
                    'questions': questions,
                    'total_generated': len(questions)
                }

        except Exception as e:
            logger.error(f"Error generating quiz questions: {str(e)}")
            return {
                'status': 'error',
                'message': str(e)
            }

    def _format_question(self, question_data: Dict, allowed_types: List[str]) -> Dict:
        """Format and validate a single question"""
        try:
            q_type = question_data.get('type', 'multiple-choice')
            if q_type not in allowed_types:
                q_type = allowed_types[0]

            formatted = {
                'question': question_data.get('question', ''),
                'type': q_type,
                'correct_answer': question_data.get('correct_answer', ''),
                'explanation': question_data.get('explanation', ''),
                'difficulty': question_data.get('difficulty', 'medium'),
                'points': question_data.get('points', 1),
                'tags': question_data.get('tags', [])
            }

            # Add options for multiple choice
            if q_type == 'multiple-choice':
                options = question_data.get('options', [])
                if len(options) < 4:
                    # Generate default options if not provided
                    options = self._generate_default_options(formatted['correct_answer'])
                formatted['options'] = options[:4]

            # Validate true-false questions
            elif q_type == 'true-false':
                if formatted['correct_answer'].lower() not in ['true', 'false']:
                    formatted['correct_answer'] = 'true'
                formatted['options'] = ['True', 'False']

            return formatted if formatted['question'] else None

        except Exception as e:
            logger.error(f"Error formatting question: {str(e)}")
            return None

    def _generate_default_options(self, correct_answer: str) -> List[str]:
        """Generate default multiple choice options"""
        # This is a simple fallback - in a real implementation,
        # you might want more sophisticated option generation
        options = [correct_answer]

        # Add some generic wrong options
        generic_options = [
            "None of the above",
            "All of the above",
            "Cannot be determined",
            "Not applicable"
        ]

        for option in generic_options:
            if len(options) < 4 and option not in options:
                options.append(option)

        # Shuffle to randomize position of correct answer
        random.shuffle(options)
        return options

    def _extract_questions_from_text(self, text: str, num_questions: int, question_types: List[str]) -> List[Dict]:
        """Extract questions from text when JSON parsing fails"""
        questions = []

        # Simple regex patterns to extract questions
        # This is a fallback method and might not be perfect
        question_pattern = r'\d+\.?\s*(.+?\?)'
        matches = re.findall(question_pattern, text)

        for i, match in enumerate(matches[:num_questions]):
            q_type = random.choice(question_types)

            question = {
                'question': match.strip(),
                'type': q_type,
                'correct_answer': 'To be determined',
                'explanation': 'Generated from text extraction',
                'difficulty': 'medium',
                'points': 1,
                'tags': []
            }

            if q_type == 'multiple-choice':
                question['options'] = self._generate_default_options('To be determined')
            elif q_type == 'true-false':
                question['options'] = ['True', 'False']
                question['correct_answer'] = 'true'

            questions.append(question)

        return questions

# Main execution
def main():
    if len(sys.argv) < 2:
        print(json.dumps({'status': 'error', 'message': 'No command specified'}))
        return

    try:
        quiz_gen = QuizGenerator()
        command = sys.argv[1]

        if command == 'generate_quiz':
            if len(sys.argv) < 4:
                result = {'status': 'error', 'message': 'Document ID and options required'}
            else:
                document_id = sys.argv[2]
                options = json.loads(sys.argv[3])

                # In a real implementation, you would load the document content
                # from the database using the document_id
                # For now, we'll use placeholder content
                content = "Sample content for quiz generation..."

                result = quiz_gen.generate_quiz_questions(content, options)

        else:
            result = {'status': 'error', 'message': f'Unknown command: {command}'}

        print(json.dumps(result))

    except Exception as e:
        logger.error(f"Main execution error: {str(e)}")
        print(json.dumps({'status': 'error', 'message': str(e)}))

if __name__ == "__main__":
    main()
