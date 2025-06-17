import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Users, 
  LogOut, 
  MessageCircle, 
  Circle,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { formatTime, generateAvatarColor, getInitials } from '../utils/helpers';

// Individual message component
const Message = ({ message, currentUser }) => {
  const isOwnMessage = message.username === currentUser?.username;
  const isSystemMessage = message.isSystem;
  
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {message.message}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback 
            style={{ backgroundColor: generateAvatarColor(message.username) }}
            className="text-white text-xs"
          >
            {getInitials(message.username)}
          </AvatarFallback>
        </Avatar>
        
        {/* Message content */}
        <div className={`mx-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block p-3 rounded-lg ${
            isOwnMessage 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            <p className="text-sm">{message.message}</p>
          </div>
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <span className="mr-2">{message.username}</span>
            <span>{formatTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Online users sidebar component
const OnlineUsersSidebar = ({ onlineUsers, currentUser, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 right-0 h-full w-80 bg-white border-l border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Online Users</h3>
            <Badge variant="secondary" className="ml-2">
              {onlineUsers.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-3">
            {onlineUsers.map((user) => (
              <div
                key={user.socketId}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback 
                      style={{ backgroundColor: generateAvatarColor(user.username) }}
                      className="text-white"
                    >
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <Circle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 fill-current" />
                </div>
                
                <div className="ml-3 flex-1">
                  <p className="font-medium text-gray-900">{user.username}</p>
                  <p className="text-sm text-green-600">Online</p>
                </div>
                
                {user.username === currentUser?.username && (
                  <Badge variant="outline" className="text-xs">You</Badge>
                )}
              </div>
            ))}
            
            {onlineUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No users online</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

// Main chat interface component
const ChatInterface = () => {
  const { user, logout } = useAuth();
  const { 
    messages, 
    onlineUsers, 
    isConnected, 
    sendMessage, 
    typingUsers,
    startTyping,
    stopTyping
  } = useSocket();
  
  const [messageText, setMessageText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message submission
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (messageText.trim() && isConnected) {
      sendMessage(messageText);
      setMessageText('');
      stopTyping();
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setMessageText(e.target.value);
    
    if (e.target.value.trim()) {
      startTyping();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 1000);
    } else {
      stopTyping();
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Chat Room</h1>
                <div className="flex items-center text-sm text-gray-500">
                  <Circle className={`h-2 w-2 mr-2 ${isConnected ? 'text-green-500 fill-current' : 'text-red-500 fill-current'}`} />
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <div className="hidden sm:flex items-center text-sm text-gray-600 mr-4">
                <span>Welcome, {user?.username}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                  <p>Start the conversation by sending a message!</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <Message
                      key={message.id}
                      message={message}
                      currentUser={user}
                    />
                  ))}
                  
                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-center bg-gray-100 text-gray-600 text-sm px-3 py-2 rounded-lg">
                        <div className="flex space-x-1 mr-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span>
                          {typingUsers.length === 1 
                            ? `${typingUsers[0]} is typing...`
                            : `${typingUsers.length} people are typing...`
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Message input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              type="text"
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
              value={messageText}
              onChange={handleTyping}
              disabled={!isConnected}
              className="flex-1"
              maxLength={1000}
            />
            <Button 
              type="submit" 
              disabled={!messageText.trim() || !isConnected}
              className="px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          {messageText.length > 900 && (
            <p className="text-xs text-gray-500 mt-1">
              {1000 - messageText.length} characters remaining
            </p>
          )}
        </div>
      </div>

      {/* Online users sidebar */}
      <OnlineUsersSidebar
        onlineUsers={onlineUsers}
        currentUser={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};

export default ChatInterface;

