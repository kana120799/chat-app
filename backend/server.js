const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// MongoDB connection using the provided URI
const MONGODB_URI = "mongodb+srv://Ankit1207:kana1207@cluster0.8hun53n.mongodb.net/chat-app";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Store online users
const onlineUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining the chat
  socket.on('join', (userData) => {
    // Store user information with socket ID
    onlineUsers.set(socket.id, {
      id: userData.userId,
      username: userData.username,
      socketId: socket.id
    });
    
    // Broadcast updated online users list to all clients
    io.emit('onlineUsers', Array.from(onlineUsers.values()));
    
    // Notify all users that someone joined
    socket.broadcast.emit('userJoined', {
      username: userData.username,
      message: `${userData.username} joined the chat`
    });
  });

  // Handle sending messages
  socket.on('sendMessage', (messageData) => {
    // Broadcast message to all connected clients
    io.emit('receiveMessage', {
      id: Date.now(), // Simple ID generation
      username: messageData.username,
      message: messageData.message,
      timestamp: new Date(),
      userId: messageData.userId
    });
  });

  // Handle private messages (optional feature)
  socket.on('sendPrivateMessage', (data) => {
    const targetUser = Array.from(onlineUsers.values()).find(user => user.id === data.targetUserId);
    if (targetUser) {
      // Send message to specific user
      io.to(targetUser.socketId).emit('receivePrivateMessage', {
        id: Date.now(),
        from: data.from,
        message: data.message,
        timestamp: new Date()
      });
    }
  });

  // Handle user typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.emit('userTyping', {
      username: data.username,
      isTyping: data.isTyping
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      // Remove user from online users
      onlineUsers.delete(socket.id);
      
      // Broadcast updated online users list
      io.emit('onlineUsers', Array.from(onlineUsers.values()));
      
      // Notify all users that someone left
      socket.broadcast.emit('userLeft', {
        username: user.username,
        message: `${user.username} left the chat`
      });
    }
    console.log('User disconnected:', socket.id);
  });
});

// Basic route for health check
app.get('/', (req, res) => {
  res.json({ message: 'Chat App Backend is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

