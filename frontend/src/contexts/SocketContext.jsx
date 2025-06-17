import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Create socket context
const SocketContext = createContext();

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Socket provider component
export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !socketRef.current) {
      // Connect to socket server
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket'],
        autoConnect: true
      });

      const socket = socketRef.current;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('Connected to socket server');
        setIsConnected(true);
        
        // Join the chat with user information
        socket.emit('join', {
          userId: user.id,
          username: user.username
        });
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setIsConnected(false);
      });

      // Chat event handlers
      socket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      socket.on('receiveMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on('userJoined', (data) => {
        // Add system message for user joining
        const systemMessage = {
          id: Date.now(),
          username: 'System',
          message: data.message,
          timestamp: new Date(),
          isSystem: true
        };
        setMessages(prev => [...prev, systemMessage]);
      });

      socket.on('userLeft', (data) => {
        // Add system message for user leaving
        const systemMessage = {
          id: Date.now(),
          username: 'System',
          message: data.message,
          timestamp: new Date(),
          isSystem: true
        };
        setMessages(prev => [...prev, systemMessage]);
      });

      socket.on('userTyping', (data) => {
        if (data.isTyping) {
          setTypingUsers(prev => {
            if (!prev.includes(data.username)) {
              return [...prev, data.username];
            }
            return prev;
          });
        } else {
          setTypingUsers(prev => prev.filter(username => username !== data.username));
        }
      });

      socket.on('receivePrivateMessage', (message) => {
        // Handle private messages (optional feature)
        setMessages(prev => [...prev, { ...message, isPrivate: true }]);
      });

      // Error handling
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      return () => {
        if (socket) {
          socket.disconnect();
          socketRef.current = null;
          setIsConnected(false);
          setOnlineUsers([]);
          setMessages([]);
          setTypingUsers([]);
        }
      };
    }
  }, [isAuthenticated, user]);

  // Cleanup socket on logout
  useEffect(() => {
    if (!isAuthenticated && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setOnlineUsers([]);
      setMessages([]);
      setTypingUsers([]);
    }
  }, [isAuthenticated]);

  // Send message function
  const sendMessage = (messageText) => {
    if (socketRef.current && isConnected && messageText.trim()) {
      const messageData = {
        userId: user.id,
        username: user.username,
        message: messageText.trim()
      };
      
      socketRef.current.emit('sendMessage', messageData);
      return true;
    }
    return false;
  };

  // Send private message function
  const sendPrivateMessage = (targetUserId, messageText) => {
    if (socketRef.current && isConnected && messageText.trim()) {
      const messageData = {
        targetUserId,
        from: user.username,
        message: messageText.trim()
      };
      
      socketRef.current.emit('sendPrivateMessage', messageData);
      return true;
    }
    return false;
  };

  // Typing indicator functions
  const startTyping = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', {
        username: user.username,
        isTyping: true
      });
    }
  };

  const stopTyping = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', {
        username: user.username,
        isTyping: false
      });
    }
  };

  // Clear messages function
  const clearMessages = () => {
    setMessages([]);
  };

  // Context value
  const value = {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    messages,
    typingUsers,
    sendMessage,
    sendPrivateMessage,
    startTyping,
    stopTyping,
    clearMessages
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

