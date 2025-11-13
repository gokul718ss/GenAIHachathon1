const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join user to their room
  socket.on('join', (userId) => {
    socket.join(userId);
    socket.userId = userId;
    logger.info(`User ${userId} joined room`);
  });

  // Handle quiz approval
  socket.on('quiz-approved', (data) => {
    io.to(data.userId).emit('quiz-approved', data);
  });

  // Handle schedule approval
  socket.on('schedule-approved', (data) => {
    io.to(data.userId).emit('schedule-approved', data);
  });

  // Handle real-time notifications
  socket.on('notification', (data) => {
    io.to(data.userId).emit('notification', data);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Make io available throughout the app
app.set('io', io);

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = server;
