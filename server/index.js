const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const queueRoutes = require('./routes/queues');
const bookingRoutes = require('./routes/bookings');
const analyticsRoutes = require('./routes/analytics');
const feedbackRoutes = require('./routes/feedback');
const { startNotificationJobs } = require('./jobs/notifications');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(helmet());
app.use(limiter);
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopqueue')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('join-shop', (shopId) => {
    socket.join(`shop-${shopId}`);
  });
  
  socket.on('join-queue', (queueId) => {
    socket.join(`queue-${queueId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

global.io = io;

// Start notification cron jobs
startNotificationJobs();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});