const mongoose = require('mongoose');

// Message schema definition
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: true
  },
  senderUsername: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000 // Limit message length
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'], // Different types of messages
    default: 'text'
  },
  isPrivate: {
    type: Boolean,
    default: false // false for public messages, true for private messages
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Only used for private messages
    default: null
  },
  recipientUsername: {
    type: String,
    default: null // Only used for private messages
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Index for better query performance
messageSchema.index({ createdAt: -1 }); // For sorting messages by time
messageSchema.index({ sender: 1 }); // For finding messages by sender
messageSchema.index({ recipient: 1 }); // For finding private messages by recipient

// Instance method to get public message data
messageSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    sender: this.sender,
    senderUsername: this.senderUsername,
    content: this.content,
    messageType: this.messageType,
    isPrivate: this.isPrivate,
    recipient: this.recipient,
    recipientUsername: this.recipientUsername,
    isEdited: this.isEdited,
    editedAt: this.editedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to get recent public messages
messageSchema.statics.getRecentPublicMessages = function(limit = 50) {
  return this.find({
    isPrivate: false,
    isDeleted: false
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('sender', 'username avatar')
  .exec();
};

// Static method to get private messages between two users
messageSchema.statics.getPrivateMessages = function(userId1, userId2, limit = 50) {
  return this.find({
    isPrivate: true,
    isDeleted: false,
    $or: [
      { sender: userId1, recipient: userId2 },
      { sender: userId2, recipient: userId1 }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('sender', 'username avatar')
  .populate('recipient', 'username avatar')
  .exec();
};

// Pre-save middleware to set sender username
messageSchema.pre('save', async function(next) {
  if (this.isNew && this.sender) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.sender);
      if (user) {
        this.senderUsername = user.username;
      }
    } catch (error) {
      console.error('Error setting sender username:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);

