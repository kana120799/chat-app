# MERN Stack Chat Application with Socket.io

A real-time chat application built with MongoDB, Express.js, React, and Node.js (MERN stack) featuring Socket.io for real-time communication, user authentication, and a responsive UI with an online users sidebar.

## Features

### 🚀 Core Features
- **Real-time messaging** with Socket.io
- **User authentication** (registration and login)
- **Online users sidebar** showing who's currently active
- **Responsive design** that works on desktop and mobile
- **Message timestamps** with relative time display
- **Typing indicators** to show when users are typing
- **User avatars** with color-coded initials
- **Connection status** indicator
- **Auto-scroll** to latest messages

### 🎨 UI/UX Features
- Modern, clean interface using Tailwind CSS and shadcn/ui components
- Smooth animations and transitions
- Mobile-responsive design with collapsible sidebar
- Professional color scheme with proper contrast
- Loading states and error handling
- Form validation with helpful error messages

### 🔧 Technical Features
- JWT-based authentication with secure token storage
- Password hashing with bcrypt
- MongoDB integration with Mongoose ODM
- CORS enabled for cross-origin requests
- Real-time user presence tracking
- Message persistence in database
- Comprehensive error handling
- Clean, commented codebase

## Project Structure

```
chat-app/
├── backend/                 # Node.js/Express backend
│   ├── models/             # MongoDB models
│   │   ├── User.js         # User model with authentication
│   │   └── Message.js      # Message model with relationships
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   └── messages.js     # Message handling routes
│   ├── server.js           # Main server file with Socket.io
│   └── package.json        # Backend dependencies
└── frontend/
    └── chat-frontend/      # React frontend
        ├── src/
        │   ├── components/ # React components
        │   │   ├── ui/     # shadcn/ui components
        │   │   ├── AuthForm.jsx      # Login/Register form
        │   │   └── ChatInterface.jsx # Main chat interface
        │   ├── contexts/   # React contexts
        │   │   ├── AuthContext.jsx   # Authentication state
        │   │   └── SocketContext.jsx # Socket.io management
        │   ├── services/   # API services
        │   │   └── authService.js    # API calls
        │   ├── utils/      # Utility functions
        │   │   └── helpers.js        # Helper functions
        │   ├── App.jsx     # Main App component
        │   └── main.jsx    # Entry point
        └── package.json    # Frontend dependencies
```

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm
- MongoDB Atlas account (URI provided)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd chat-app/backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend server will start on `http://localhost:5000` and connect to the provided MongoDB Atlas database.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd chat-app/frontend/chat-frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm run dev --host
```

The frontend will be available at `http://localhost:5173`

## Usage

### Getting Started

1. **Registration**: Create a new account with username, email, and password
2. **Login**: Sign in with your username/email and password
3. **Chat**: Start sending messages in the public chat room
4. **Online Users**: View who's currently online in the sidebar
5. **Real-time**: Messages appear instantly for all connected users

### Key Components

#### Authentication System
- Secure user registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Form validation and error handling

#### Chat Interface
- Real-time message sending and receiving
- Message timestamps and user identification
- Typing indicators for active users
- Auto-scroll to latest messages
- Character limit with counter

#### Online Users Sidebar
- Live list of connected users
- User avatars with color-coded initials
- Online status indicators
- Responsive design for mobile

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /me` - Get current user info
- `GET /users` - Get all users

### Message Routes (`/api/messages`)
- `GET /public` - Get recent public messages
- `POST /send` - Send a new message
- `GET /private/:userId` - Get private messages with user
- `PUT /:messageId` - Edit a message
- `DELETE /:messageId` - Delete a message

## Socket.io Events

### Client to Server
- `join` - User joins the chat room
- `sendMessage` - Send a public message
- `sendPrivateMessage` - Send a private message
- `typing` - Typing indicator

### Server to Client
- `onlineUsers` - Updated list of online users
- `receiveMessage` - New message received
- `userJoined` - User joined notification
- `userLeft` - User left notification
- `userTyping` - Typing indicator
- `receivePrivateMessage` - Private message received

## Database Schema

### User Model
```javascript
{
  username: String (unique, 3-20 chars),
  email: String (unique, valid email),
  password: String (hashed),
  isOnline: Boolean,
  lastSeen: Date,
  avatar: String (URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  sender: ObjectId (ref: User),
  senderUsername: String,
  content: String (max 1000 chars),
  messageType: String (text/image/file/system),
  isPrivate: Boolean,
  recipient: ObjectId (ref: User, optional),
  recipientUsername: String (optional),
  isEdited: Boolean,
  editedAt: Date,
  isDeleted: Boolean,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - UI component library
- **Lucide React** - Icons
- **Socket.io Client** - Real-time client
- **Axios** - HTTP client

## Security Features

- Password hashing with bcrypt (cost factor 12)
- JWT token authentication with expiration
- Input validation and sanitization
- CORS configuration for secure cross-origin requests
- Protected API routes requiring authentication
- XSS prevention with proper input handling

## Performance Optimizations

- Efficient MongoDB queries with proper indexing
- Real-time updates only for necessary data
- Optimized React rendering with proper state management
- Lazy loading and code splitting
- Responsive images and optimized assets
- Connection pooling for database operations

## Future Enhancements

- Private messaging between users
- File and image sharing
- Message reactions and emojis
- User profiles and settings
- Chat rooms/channels
- Message search functionality
- Push notifications
- Voice and video calling
- Message encryption
- Admin panel and moderation tools

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Ensure MongoDB URI is correct
   - Check if ports 5000 and 5173 are available
   - Verify CORS settings

2. **Authentication Problems**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify user credentials

3. **Real-time Issues**
   - Check Socket.io connection status
   - Verify backend server is running
   - Check browser console for errors

### Development Tips

- Use browser developer tools to monitor network requests
- Check backend console for server logs
- Monitor MongoDB Atlas for database connections
- Use React Developer Tools for component debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper comments
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the code comments for implementation details
3. Test with the provided MongoDB URI
4. Ensure all dependencies are properly installed

---

**Built with ❤️ using the MERN stack and Socket.io**

