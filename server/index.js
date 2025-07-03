import express from 'express';
import cors from './config/cors.js';
import sequelize from './config/db.js';
import { configDotenv } from 'dotenv';
import router from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import setupAssociations from './config/associations.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';


configDotenv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(compression());
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors);
app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));
console.log('Serving static files from:', path.join(__dirname, 'public/avatars'));
app.use('/api', router);
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Настраиваем связи после инициализации моделей
    setupAssociations();

    await sequelize.sync({ force: false });
    console.log('Database synced successfully');

    // Настройка вебсокета
    const server = http.createServer(app);
    const io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });
    io.on('connection', (socket) => {
      console.log('\x1b[32m%s\x1b[0m', 'WebSocket подключен:', socket.id);
    
      socket.on('join_user_chat', ({ userId }) => {
        const room = `room-${userId}`;
        socket.join(room);
        console.log('\x1b[32m%s\x1b[0m', `Пользователь ${userId} вошел в комнату ${room}`);
      });
    
      socket.on('join_support_chat', ({ userId }) => {
        const room = `room-${userId}`;
        socket.join(room);
        console.log('\x1b[32m%s\x1b[0m', `Менеджер присоединился к комнате ${room}`);
      });
    
      socket.on('send_message', ({ userId, sender, text, userEmail }) => {
        const message = {
          userId,
          sender,
          text,
          userEmail,
          timestamp: new Date()
        };
        io.to(`room-${userId}`).emit('receive_message', message);
      });
    
      socket.on('disconnect', () => {
        console.log('\x1b[31m%s\x1b[0m', 'Отключен:', socket.id);
      });
    });
    io.on('error', (err) => {
      console.error('\x1b[31m%s\x1b[0m', 'Socket.IO error:', err);
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();