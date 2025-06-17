# Deployment Guide

This guide covers different deployment options for the MERN Chat Application.

## Quick Local Setup

### Option 1: Using the Start Script (Recommended)
```bash
# Make sure you're in the project root directory
cd chat-app

# Run the quick start script
./start.sh
```

### Option 2: Manual Setup
```bash
# Install all dependencies
npm run install-all

# Start backend (in one terminal)
npm run backend

# Start frontend (in another terminal)
npm run frontend
```

## Production Deployment

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Backend Environment Variables
PORT=5000
MONGODB_URI=mongodb+srv://Ankit1207:kana1207@cluster0.8hun53n.mongodb.net/chat-app
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production

# Frontend Environment Variables (create .env in frontend/chat-frontend)
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

### Backend Deployment (Node.js/Express)

#### Option 1: Heroku
```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create your-chat-app-backend

# Set environment variables
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set NODE_ENV=production

# Deploy
git subtree push --prefix=backend heroku main
```

#### Option 2: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option 3: DigitalOcean App Platform
1. Connect your GitHub repository
2. Select the backend folder
3. Set environment variables in the dashboard
4. Deploy

### Frontend Deployment (React)

#### Option 1: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend/chat-frontend

# Deploy
vercel
```

#### Option 2: Netlify
```bash
# Build the project
npm run build

# Deploy to Netlify (drag and drop dist folder)
# Or use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Option 3: GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

## Docker Deployment

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb+srv://Ankit1207:kana1207@cluster0.8hun53n.mongodb.net/chat-app
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - mongodb

  frontend:
    build: ./frontend/chat-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## SSL/HTTPS Configuration

### Using Let's Encrypt with Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Performance Optimization

### Backend Optimizations
- Enable gzip compression
- Use PM2 for process management
- Implement rate limiting
- Add request logging
- Use connection pooling for MongoDB

### Frontend Optimizations
- Enable code splitting
- Optimize bundle size
- Use CDN for static assets
- Implement service workers
- Add performance monitoring

## Monitoring and Logging

### Backend Monitoring
```javascript
// Add to server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Health Check Endpoint
```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Configure properly for production
3. **Rate Limiting**: Implement to prevent abuse
4. **Input Validation**: Sanitize all user inputs
5. **HTTPS**: Always use SSL in production
6. **JWT Security**: Use strong secrets and proper expiration
7. **Database Security**: Use MongoDB Atlas security features

## Troubleshooting

### Common Deployment Issues

1. **CORS Errors**: Update CORS configuration for production domains
2. **Socket.io Connection Issues**: Ensure WebSocket support is enabled
3. **Environment Variables**: Double-check all required variables are set
4. **Build Failures**: Check Node.js version compatibility
5. **Database Connection**: Verify MongoDB URI and network access

### Debugging Tips

1. Check application logs
2. Monitor network requests
3. Verify environment variables
4. Test API endpoints individually
5. Check database connections

---

**Happy Deploying! 🚀**

