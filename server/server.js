const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');
const fileRoutes = require('./routes/files');

const { initializeWebSocket } = require('./websocket/socketHandler');
const { initializeWebRTC } = require('./webrtc/signalingServer');
const errorHandler = require('./middleware/errorHandler');

// Distributed system services
const ServiceRegistry = require('./services/serviceRegistry');
const DistributedSessionManager = require('./services/sessionManager');
const DistributedMessageQueue = require('./services/messageQueue');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize distributed services
const serviceRegistry = new ServiceRegistry();
const sessionManager = new DistributedSessionManager();
const messageQueue = new DistributedMessageQueue();

// Make services available globally
app.locals.serviceRegistry = serviceRegistry;
app.locals.sessionManager = sessionManager;
app.locals.messageQueue = messageQueue;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);

// Enhanced health check
app.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const memUsage = process.memoryUsage();
    const healthyServices = await serviceRegistry.getHealthyServices();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      serverId: process.env.SERVER_ID || 'unknown',
      database: dbStatus,
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
      },
      cluster: {
        mode: process.env.CLUSTER_MODE === 'true',
        healthyServices: healthyServices.length
      }
    };
    
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Initialize distributed services
async function initializeDistributedServices() {
  try {
    await serviceRegistry.initialize();
    await sessionManager.initialize();
    await messageQueue.initialize();
    
    console.log('✅ All distributed services initialized');
  } catch (error) {
    console.error('❌ Failed to initialize distributed services:', error);
  }
}

// Initialize WebSocket and WebRTC with distributed support
initializeWebSocket(io, messageQueue);
initializeWebRTC(io, messageQueue);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🎥 WebRTC signaling server ready`);
  console.log(`🆔 Server ID: ${process.env.SERVER_ID || 'unknown'}`);
  console.log(`🔗 Cluster Mode: ${process.env.CLUSTER_MODE === 'true' ? 'Enabled' : 'Disabled'}`);
  
  // Initialize distributed services after server starts
  await initializeDistributedServices();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  
  // Shutdown distributed services
  await serviceRegistry.shutdown();
  await messageQueue.shutdown();
  
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  
  // Shutdown distributed services
  await serviceRegistry.shutdown();
  await messageQueue.shutdown();
  
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close().then(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    }).catch((err) => {
      console.error('Error closing MongoDB:', err);
      process.exit(1);
    });
  });
});

module.exports = { app, server, io };
