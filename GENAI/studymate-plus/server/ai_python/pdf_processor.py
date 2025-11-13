#!/usr/bin/env python3
"""
PDF Processor for StudyMate+
Handles PDF text extraction and chunking using PyMuPDF
"""

import os
import sys
import json
import logging
import fitz  # PyMuPDF
import re
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFProcessor:
    def __init__(self):
        """Initialize PDF processor"""
        self.chunk_size = 500  # words per chunk
        self.chunk_overlap = 100  # words overlap between chunks

    def extract_text_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Extract text from PDF file"""
        try:
            doc = fitz.open(pdf_path)

            # Extract metadata
            metadata = {
                'title': doc.metadata.get('title', ''),
                'author': doc.metadata.get('author', ''),
                'subject': doc.metadata.get('subject', ''),
                'page_count': doc.page_count
            }

            # Extract text from all pages
            full_text = ""
            for page_num in range(doc.page_count):
                page = doc[page_num]
                page_text = page.get_text()
                full_text += f"\n\n--- Page {page_num + 1} ---\n\n{page_text}"

            doc.close()

            return {
                'status': 'success',
                'metadata': metadata,
                'full_text': full_text
            }

        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return {
                'status': 'error',
                'message': str(e)
            }

    def create_chunks(self, text: str, metadata: Dict = None) -> List[Dict[str, Any]]:
        """Create overlapping text chunks"""
        try:
            # Split into sentences
            sentences = re.split(r'(?<=[.!?])\s+', text)

            chunks = []
            current_chunk = []
            current_word_count = 0

            for sentence in sentences:
                sentence_words = len(sentence.split())

                if current_word_count + sentence_words > self.chunk_size and current_chunk:
                    # Create chunk
                    chunk_text = ' '.join(current_chunk)
                    chunks.append({
                        'content': chunk_text,
                        'word_count': current_word_count,
                        'metadata': metadata or {}
                    })

                    # Start new chunk with overlap
                    current_chunk = current_chunk[-3:] if len(current_chunk) > 3 else []
                    current_word_count = sum(len(s.split()) for s in current_chunk)

                current_chunk.append(sentence)
                current_word_count += sentence_words

            # Add the last chunk
            if current_chunk:
                chunk_text = ' '.join(current_chunk)
                chunks.append({
                    'content': chunk_text,
                    'word_count': current_word_count,
                    'metadata': metadata or {}
                })

            return chunks

        except Exception as e:
            logger.error(f"Error creating chunks: {str(e)}")
            return []

# Main execution
def main():
    if len(sys.argv) < 2:
        print(json.dumps({'status': 'error', 'message': 'No command specified'}))
        return

    try:
        processor = PDFProcessor()
        command = sys.argv[1]

        if command == 'process_document':
            if len(sys.argv) < 4:
                result = {'status': 'error', 'message': 'PDF path and document ID required'}
            else:
                pdf_path = sys.argv[2]
                document_id = sys.argv[3]

                if not os.path.exists(pdf_path):
                    result = {'status': 'error', 'message': f'PDF file not found: {pdf_path}'}
                else:
                    extraction_result = processor.extract_text_from_pdf(pdf_path)
                    if extraction_result['status'] == 'success':
                        chunks = processor.create_chunks(extraction_result['full_text'])
                        result = {
                            'status': 'success',
                            'document_id': document_id,
                            'metadata': extraction_result['metadata'],
                            'chunks': chunks,
                            'total_chunks': len(chunks)
                        }
                    else:
                        result = extraction_result

        else:
            result = {'status': 'error', 'message': f'Unknown command: {command}'}

        print(json.dumps(result))

    except Exception as e:
        logger.error(f"Main execution error: {str(e)}")
        print(json.dumps({'status': 'error', 'message': str(e)}))

if __name__ == "__main__":
    main()
