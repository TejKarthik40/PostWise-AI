const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { connectDB, getDBStatus } = require('./config/db');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const setupSwagger = require('./config/swagger');

// Load env vars
dotenv.config();

const app = express();

// Connect to MongoDB (or enable mock store fallback automatically)
connectDB();

// Security & Middleware
app.use(helmet());
app.use(express.json());
app.use(cors());

// Global API Rate Limiting
app.use('/api/', apiLimiter);

// Swagger API Documentation
setupSwagger(app);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/calendars', require('./routes/calendarRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/pexels', require('./routes/pexels'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'ok',
    service: 'PostWise-AI API Server',
    database: dbStatus,
    swaggerDocs: 'http://localhost:5000/api/docs',
    timestamp: new Date().toISOString(),
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Global Error Handler caught exception', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { error: err.message } : {}),
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`[PostWise-AI Backend] Server running on port ${PORT}`);
    logger.info(`[Swagger UI] API Documentation available at http://localhost:${PORT}/api/docs`);
  });
}

module.exports = app;
