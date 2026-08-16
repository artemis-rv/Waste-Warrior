const { Server } = require('socket.io');
const cookie = require('cookie');
const { verifyToken } = require('../utils/jwt');
const authService = require('../services/auth.service');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const cookies = socket.request.headers.cookie;
      if (!cookies) {
        return next(new Error('Authentication error: No cookies'));
      }

      const parsedCookies = cookie.parse(cookies);
      const token = parsedCookies[process.env.COOKIE_NAME || 'waste_warrior_token'];

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Authentication error: Invalid token'));
      }

      const user = await authService.findUserById(decoded.sub);
      if (!user || user.isBanned) {
        return next(new Error('Authentication error: User invalid or banned'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.id}, Role: ${socket.user.role})`);
    
    // Join standard rooms
    socket.join(`user:${socket.user.id}`);
    socket.join(`role:${socket.user.role}`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
