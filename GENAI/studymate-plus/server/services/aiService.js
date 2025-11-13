const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');
const { BadRequestError } = require('../middleware/errorHandler');

class AIService {
  constructor() {
    this.pythonPath = path.join(__dirname, '../ai_python');
    this.ragServicePath = path.join(this.pythonPath, 'rag_service.py');
    this.quizGeneratorPath = path.join(this.pythonPath, 'quiz_generator.py');
  }

  /**
   * Process a PDF document and create embeddings
   */
  async processDocument(filePath, documentId) {
    try {
      const options = {
        mode: 'json',
        pythonPath: process.env.PYTHON_PATH || 'python',
        scriptPath: this.pythonPath,
        args: ['process_document', filePath, documentId]
      };

      const results = await PythonShell.run('pdf_processor.py', options);
      const result = results[results.length - 1];

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      return result;
    } catch (error) {
      logger.error('Document processing error:', error);
      throw new BadRequestError(`Failed to process document: ${error.message}`);
    }
  }

  /**
   * Generate quiz questions from document content
   */
  async generateQuiz(documentId, options = {}) {
    try {
      const {
        numQuestions = 10,
        difficulty = 'medium',
        questionTypes = ['multiple-choice', 'true-false'],
        topic = null
      } = options;

      const pythonOptions = {
        mode: 'json',
        pythonPath: process.env.PYTHON_PATH || 'python',
        scriptPath: this.pythonPath,
        args: [
          'generate_quiz',
          documentId,
          JSON.stringify({
            num_questions: numQuestions,
            difficulty,
            question_types: questionTypes,
            topic
          })
        ]
      };

      const results = await PythonShell.run('quiz_generator.py', pythonOptions);
      const result = results[results.length - 1];

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      return this.formatQuizQuestions(result.questions);
    } catch (error) {
      logger.error('Quiz generation error:', error);
      throw new BadRequestError(`Failed to generate quiz: ${error.message}`);
    }
  }

  /**
   * Query documents using RAG (Retrieval-Augmented Generation)
   */
  async queryDocuments(query, courseId = null, limit = 5) {
    try {
      const options = {
        mode: 'json',
        pythonPath: process.env.PYTHON_PATH || 'python',
        scriptPath: this.pythonPath,
        args: [
          'query_documents',
          query,
          courseId || 'null',
          limit.toString()
        ]
      };

      const results = await PythonShell.run('rag_service.py', options);
      const result = results[results.length - 1];

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      return result;
    } catch (error) {
      logger.error('Document query error:', error);
      throw new BadRequestError(`Failed to query documents: ${error.message}`);
    }
  }

  /**
   * Generate answer using IBM Watsonx
   */
  async generateAnswer(query, context, courseInfo = null) {
    try {
      const options = {
        mode: 'json',
        pythonPath: process.env.PYTHON_PATH || 'python',
        scriptPath: this.pythonPath,
        args: [
          'generate_answer',
          query,
          JSON.stringify(context),
          JSON.stringify(courseInfo)
        ]
      };

      const results = await PythonShell.run('rag_service.py', options);
      const result = results[results.length - 1];

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      return result.answer;
    } catch (error) {
      logger.error('Answer generation error:', error);
      throw new BadRequestError(`Failed to generate answer: ${error.message}`);
    }
  }

  /**
   * Generate personalized study schedule
   */
  async generateSchedule(userPreferences, courses, currentSchedule = null) {
    try {
      const options = {
        mode: 'json',
        pythonPath: process.env.PYTHON_PATH || 'python',
        scriptPath: this.pythonPath,
        args: [
          'generate_schedule',
          JSON.stringify(userPreferences),
          JSON.stringify(courses),
          JSON.stringify(currentSchedule)
        ]
      };

      const results = await PythonShell.run('rag_service.py', options);
      const result = results[results.length - 1];

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      return result.schedule;
    } catch (error) {
      logger.error('Schedule generation error:', error);
      throw new BadRequestError(`Failed to generate schedule: ${error.message}`);
    }
  }

  /**
   * Format quiz questions to match our schema
   */
  formatQuizQuestions(questions) {
    return questions.map(q => ({
      question: q.question,
      type: q.type,
      options: q.options || [],
      correctAnswer: q.correct_answer,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'medium',
      points: q.points || 1,
      tags: q.tags || []
    }));
  }

  /**
   * Check if Python AI services are available
   */
  async checkAvailability() {
    try {
      const options = {
        mode: 'json',
        pythonPath: process.env.PYTHON_PATH || 'python',
        scriptPath: this.pythonPath,
        args: ['health_check']
      };

      const results = await PythonShell.run('rag_service.py', options);
      const result = results[results.length - 1];

      return result.status === 'ok';
    } catch (error) {
      logger.error('AI service health check failed:', error);
      return false;
    }
  }
}

module.exports = new AIService();
