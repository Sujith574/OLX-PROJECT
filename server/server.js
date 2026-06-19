require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const seedCategories = require('./utils/seedCategories');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const claimRoutes = require('./routes/claimRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// ============ Socket.io Setup ============
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Track connected users: userId → socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User joins their personal room
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`👤 User ${userId} joined their room`);
    }
  });

  // Join a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conv_${conversationId}`);
  });

  // Typing indicator
  socket.on('typing', ({ conversationId, userId }) => {
    socket.to(`conv_${conversationId}`).emit('user_typing', { userId });
  });

  socket.on('stop_typing', ({ conversationId }) => {
    socket.to(`conv_${conversationId}`).emit('user_stopped_typing');
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Make io available in request handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ============ Security Middleware ============
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(mongoSanitize());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ Logging ============
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============ Rate Limiting ============
app.use('/api', apiLimiter);

// ============ API Routes ============
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// ============ Health Check ============
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🔍 FindIt API is running!',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ============ Error Handling ============
app.use(notFound);
app.use(errorHandler);

// ============ Start Server ============
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedCategories();

  server.listen(PORT, () => {
    console.log(`\n🚀 FindIt Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
    console.log(`\n📋 API Endpoints:`);
    console.log(`   Auth:          /api/auth`);
    console.log(`   Items:         /api/items`);
    console.log(`   Claims:        /api/claims`);
    console.log(`   Categories:    /api/categories`);
    console.log(`   Reports:       /api/reports`);
    console.log(`   Admin:         /api/admin`);
    console.log(`   Messages:      /api/messages`);
    console.log(`   Notifications: /api/notifications\n`);
  });
};

startServer();

module.exports = { app, server, io };
