const express = require('express');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// JWT secret key (should match the one in auth.js)
const JWT_SECRET = 'your-secret-key-here';

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/messages/public - Get recent public messages
router.get('/public', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Get recent public messages
    const messages = await Message.find({
      isPrivate: false,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'username avatar')
    .exec();

    // Reverse to show oldest first
    const reversedMessages = messages.reverse();

    res.json({
      success: true,
      messages: reversedMessages.map(msg => msg.toPublicJSON()),
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    });

  } catch (error) {
    console.error('Get public messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/messages/send - Send a new message
router.post('/send', authenticateUser, async (req, res) => {
  try {
    const { content, messageType = 'text', isPrivate = false, recipientId } = req.body;

    // Validate input
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message content is too long (max 1000 characters)'
      });
    }

    // Create message object
    const messageData = {
      sender: req.user._id,
      senderUsername: req.user.username,
      content: content.trim(),
      messageType,
      isPrivate
    };

    // If it's a private message, validate recipient
    if (isPrivate) {
      if (!recipientId) {
        return res.status(400).json({
          success: false,
          message: 'Recipient ID is required for private messages'
        });
      }

      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: 'Recipient not found'
        });
      }

      messageData.recipient = recipientId;
      messageData.recipientUsername = recipient.username;
    }

    // Save message to database
    const message = new Message(messageData);
    await message.save();

    // Populate sender information
    await message.populate('sender', 'username avatar');
    if (isPrivate) {
      await message.populate('recipient', 'username avatar');
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message.toPublicJSON()
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/messages/private/:userId - Get private messages with a specific user
router.get('/private/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Validate recipient user exists
    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get private messages between current user and specified user
    const messages = await Message.find({
      isPrivate: true,
      isDeleted: false,
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'username avatar')
    .populate('recipient', 'username avatar')
    .exec();

    // Reverse to show oldest first
    const reversedMessages = messages.reverse();

    res.json({
      success: true,
      messages: reversedMessages.map(msg => msg.toPublicJSON()),
      recipient: {
        id: recipient._id,
        username: recipient.username,
        avatar: recipient.avatar,
        isOnline: recipient.isOnline
      },
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    });

  } catch (error) {
    console.error('Get private messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/messages/:messageId - Edit a message
router.put('/:messageId', authenticateUser, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    // Validate input
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message content is too long (max 1000 characters)'
      });
    }

    // Find message and check ownership
    const message = await Message.findOne({
      _id: messageId,
      sender: req.user._id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you do not have permission to edit it'
      });
    }

    // Update message
    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: message.toPublicJSON()
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/messages/:messageId - Delete a message
router.delete('/:messageId', authenticateUser, async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find message and check ownership
    const message = await Message.findOne({
      _id: messageId,
      sender: req.user._id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you do not have permission to delete it'
      });
    }

    // Soft delete the message
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

