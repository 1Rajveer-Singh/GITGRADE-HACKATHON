import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import config from './config/config.js';
import logger from './utils/logger.js';
import db from './db/database.js';
import analyzeRoutes from './routes/analyze.routes.js';
import apiKeyRoutes from './routes/apiKey.routes.js';
import { validateApiKey, trackApiUsage } from './middleware/apiKey.middleware.js';

// Initialize Express app
const app = express();

// Trust proxy (if behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 1 hour
  max: config.rateLimit.maxRequests,    // 10 requests per hour
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to analysis endpoint only
app.use('/api/analyze', limiter);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// API key validation and usage tracking
app.use('/api', validateApiKey);
app.use('/api', trackApiUsage);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbHealthy = await db.testConnection();

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealthy ? 'connected' : 'disconnected',
      environment: config.nodeEnv,
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
    });
  }
});

// API routes
app.use('/api', analyzeRoutes);
app.use('/api/keys', apiKeyRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'GitGrade API',
    version: '1.0.0',
    description: 'AI-Powered GitHub Repository Analyzer',
    endpoints: {
      health: '/health',
      analyze: 'POST /api/analyze',
      getAnalysis: 'GET /api/analysis/:id',
      history: 'GET /api/history',
      registerKey: 'POST /api/keys/register',
      usage: 'GET /api/keys/usage',
      deactivate: 'POST /api/keys/deactivate',
    },
    authentication: {
      method: 'API Key',
      header: 'X-API-Key',
      register: 'POST /api/keys/register',
      limits: {
        free: {
          daily: 50,
          monthly: 1000,
        },
      },
    },
    documentation: 'https://github.com/yourusername/gitgrade',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await db.testConnection();

    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    // Start listening
    app.listen(config.port, () => {
      logger.info(`🚀 GitGrade API server started`);
      logger.info(`📍 Server running on http://localhost:${config.port}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 CORS enabled for: ${config.frontendUrl}`);
      logger.info(`⏱️  Rate limit: ${config.rateLimit.maxRequests} requests per hour`);
      
      if (!config.github.token) {
        logger.warn('⚠️  WARNING: GitHub token not configured. Rate limits will be restrictive.');
      }
      
      if (!config.gemini.apiKey) {
        logger.warn('⚠️  WARNING: Gemini API key not configured. Using fallback summaries.');
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
