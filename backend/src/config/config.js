import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // GitHub
  github: {
    token: process.env.GITHUB_TOKEN,
    apiUrl: 'https://api.github.com',
  },

  // Google Gemini (FREE AI)
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.0-flash-exp', // Gemini 2.5 Flash
    temperature: 0.7,
    maxOutputTokens: 2048,
  },

  // Database (PostgreSQL)
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'gitgrade',
    user: process.env.DB_USER || 'gitgrade_user',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: 3,
  },

  // Analysis Limits
  analysis: {
    maxFiles: parseInt(process.env.MAX_FILES || '1000'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '1048576'), // 1MB
    timeout: parseInt(process.env.ANALYSIS_TIMEOUT || '180000'), // 3 minutes
    maxCommits: parseInt(process.env.MAX_COMMITS || '500'),
    maxReadmeLength: 50000,
    cacheExpiry: 3600, // 1 hour
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '3600000'), // 1 hour
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'),
  },

  // Scoring Weights (Total: 100)
  scoring: {
    weights: {
      codeQuality: 20,
      projectStructure: 15,
      documentation: 15,
      testing: 12,
      gitPractices: 12,
      security: 10,
      cicd: 8,
      dependencies: 5,
      containerization: 3,
    },
    ratings: {
      beginner: { min: 0, max: 40, badge: 'Bronze' },
      intermediate: { min: 41, max: 75, badge: 'Silver' },
      advanced: { min: 76, max: 100, badge: 'Gold' },
    },
  },
};

// Validation
if (!config.github.token) {
  console.warn('⚠️  WARNING: GITHUB_TOKEN not set. API rate limit will be 60/hour instead of 5000/hour');
}

if (!config.gemini.apiKey) {
  console.warn('⚠️  WARNING: GEMINI_API_KEY not set. Will use template-based summaries');
}

if (!config.database.password) {
  console.error('❌ ERROR: DB_PASSWORD is required');
  process.exit(1);
}

export default config;
