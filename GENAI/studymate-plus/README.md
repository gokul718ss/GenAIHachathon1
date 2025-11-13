# StudyMate+: AI-Powered MERN Learning App

StudyMate+ is a comprehensive learning management system built with the MERN stack, featuring AI-powered quiz generation, course management, and personalized scheduling.

## 🚀 Features

### Core Features
- **AI-Powered Quiz Generation**: Automatically generate quizzes from uploaded PDFs using IBM Watsonx
- **Course Management**: Complete CRUD operations for courses with AI teaching assistants
- **Personalized Scheduling**: AI-generated study schedules with conflict detection
- **Real-time Integration**: Seamless approval workflows between chat and web app
- **Student Dashboard**: Comprehensive progress tracking and analytics

### AI Integration
- **RAG Pipeline**: PyMuPDF + SentenceTransformers + FAISS + IBM Watsonx
- **Document Processing**: Intelligent PDF parsing and content extraction
- **Semantic Search**: FAISS-powered similarity search
- **AI Responses**: Contextual answers using IBM Watsonx Mixtral-8x7B

### Technical Features
- **JWT Authentication**: Secure user authentication and authorization
- **Real-time Communication**: Socket.io for live updates
- **File Upload**: Robust PDF handling with Multer
- **Error Handling**: Comprehensive error management
- **Performance**: Optimized queries and caching

## 🛠 Tech Stack

### Frontend
- **React 18**: Modern React with Hooks and Context API
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **React Query**: Server state management
- **React Router**: Client-side routing

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Socket.io**: Real-time communication
- **JWT**: JSON Web Token authentication
- **Multer**: File upload handling

### AI & ML
- **IBM Watsonx**: Large language model
- **PyMuPDF**: PDF text extraction
- **SentenceTransformers**: Text embeddings
- **FAISS**: Vector similarity search
- **Python**: AI service backend

### Deployment
- **Vercel**: Frontend hosting
- **Render**: Backend hosting
- **MongoDB Atlas**: Database hosting

## 📋 Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- MongoDB
- IBM Watsonx API credentials

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/studymate-plus.git
cd studymate-plus
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm run install-deps

# Install Python dependencies
npm run ai:install
```

### 3. Environment Variables

Create `.env` files in both `server/` and `client/` directories:

**server/.env**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/studymate-plus

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_LIFETIME=7d

# IBM Watsonx
IBM_WATSONX_API_KEY=your_api_key
IBM_WATSONX_PROJECT_ID=your_project_id
IBM_WATSONX_URL=https://us-south.ml.cloud.ibm.com

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Python
PYTHON_PATH=python3
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Run the Application

```bash
# Development mode (runs both client and server)
npm run dev

# Or run separately
npm run server  # Backend only
npm run client  # Frontend only
```

## 📁 Project Structure

```
studymate-plus/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── ai_python/          # Python AI services
│   └── package.json
├── README.md
├── package.json            # Root package.json
└── vercel.json            # Deployment config
```

## 🎯 Usage

### For Students

1. **Register/Login**: Create an account or log in
2. **Add Courses**: Create or enroll in courses
3. **Upload Materials**: Upload PDFs (syllabus, notes, textbooks)
4. **Generate Quizzes**: Let AI create quizzes from your materials
5. **Take Quizzes**: Complete quizzes and track your progress
6. **Schedule Study**: Get AI-generated personalized study schedules
7. **Chat with AI**: Ask course-specific questions

### For Developers

#### Adding New Features

1. **Backend**: Add models, routes, and controllers
2. **Frontend**: Create components and pages
3. **AI Integration**: Extend Python services
4. **Database**: Update schemas and migrations

#### API Endpoints

- `POST /api/auth/login` - User login
- `GET /api/courses` - Get courses
- `POST /api/documents/upload` - Upload PDF
- `POST /api/quizzes/generate` - Generate quiz
- `GET /api/schedules` - Get schedules
- `POST /api/ai/query` - Query AI assistant

## 🧪 Testing

```bash
# Backend tests
cd server && npm test

# Frontend tests  
cd client && npm test

# Run all tests
npm run test
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with `npm run deploy:vercel`

### Manual Deployment

1. **Backend**: Deploy to Render, Railway, or AWS
2. **Frontend**: Deploy to Vercel, Netlify, or AWS S3
3. **Database**: Use MongoDB Atlas

## 🔧 Configuration

### IBM Watsonx Setup

1. Create an IBM Cloud account
2. Set up Watsonx.ai service
3. Get API key and project ID
4. Configure in environment variables

### MongoDB Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Create database and collections
3. Configure connection string

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- IBM Watsonx for AI capabilities
- Facebook Research for FAISS
- Hugging Face for SentenceTransformers
- The MERN stack community

## 📞 Support

For support, email support@studymateplus.com or create an issue on GitHub.

---

Made with ❤️ by the StudyMate+ Team
