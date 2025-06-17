#!/bin/bash

# MERN Chat App Quick Start Script
# This script starts both backend and frontend servers

echo "🚀 Starting MERN Chat Application..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Function to start backend
start_backend() {
    echo "📡 Starting backend server..."
    cd backend
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    echo "🔥 Backend server starting on http://localhost:5000"
    npm start &
    BACKEND_PID=$!
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting frontend server..."
    cd frontend/chat-frontend
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        pnpm install
    fi
    echo "🌐 Frontend server starting on http://localhost:5173"
    pnpm run dev --host &
    FRONTEND_PID=$!
    cd ../..
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "👋 Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start both servers
start_backend
sleep 3
start_frontend

echo ""
echo "🎉 Chat application is starting up!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "💡 Tips:"
echo "   - Register a new account or login"
echo "   - Open multiple browser tabs to test real-time chat"
echo "   - Check the online users sidebar"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

