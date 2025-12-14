import crypto from 'crypto';
import db from '../db/database.js';
import logger from '../utils/logger.js';

/**
 * Generate a secure API key
 */
export function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware to validate API key and check usage limits
 */
export async function validateApiKey(req, res, next) {
  try {
    // Get API key from header or query parameter
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    // If no API key provided, allow limited access with IP-based rate limiting
    if (!apiKey) {
      req.apiKeyData = null;
      req.isAuthenticated = false;
      return next();
    }

    // Validate API key format
    if (!/^[a-f0-9]{64}$/.test(apiKey)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key format',
      });
    }

    // Fetch API key from database
    const result = await db.query(
      'SELECT * FROM api_keys WHERE api_key = $1',
      [apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key',
      });
    }

    const keyData = result.rows[0];

    // Check if key is active
    if (!keyData.is_active) {
      return res.status(403).json({
        success: false,
        error: 'API key has been deactivated',
      });
    }

    // Check if key has expired
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return res.status(403).json({
        success: false,
        error: 'API key has expired',
      });
    }

    // Reset daily counter if needed
    const lastResetDaily = new Date(keyData.last_reset_daily);
    const now = new Date();
    const hoursSinceLastReset = (now - lastResetDaily) / (1000 * 60 * 60);

    if (hoursSinceLastReset >= 24) {
      await db.query(
        `UPDATE api_keys 
         SET daily_analyses = 0, last_reset_daily = NOW() 
         WHERE id = $1`,
        [keyData.id]
      );
      keyData.daily_analyses = 0;
    }

    // Reset monthly counter if needed
    const lastResetMonthly = new Date(keyData.last_reset_monthly);
    const daysSinceLastReset = (now - lastResetMonthly) / (1000 * 60 * 60 * 24);

    if (daysSinceLastReset >= 30) {
      await db.query(
        `UPDATE api_keys 
         SET monthly_analyses = 0, last_reset_monthly = NOW() 
         WHERE id = $1`,
        [keyData.id]
      );
      keyData.monthly_analyses = 0;
    }

    // Check daily limit
    if (keyData.daily_analyses >= keyData.daily_limit) {
      return res.status(429).json({
        success: false,
        error: 'Daily API limit reached',
        limit: keyData.daily_limit,
        used: keyData.daily_analyses,
        resetsIn: `${Math.ceil(24 - hoursSinceLastReset)} hours`,
      });
    }

    // Check monthly limit
    if (keyData.monthly_analyses >= keyData.monthly_limit) {
      return res.status(429).json({
        success: false,
        error: 'Monthly API limit reached',
        limit: keyData.monthly_limit,
        used: keyData.monthly_analyses,
        resetsIn: `${Math.ceil(30 - daysSinceLastReset)} days`,
      });
    }

    // Attach API key data to request
    req.apiKeyData = keyData;
    req.isAuthenticated = true;

    // Update last used timestamp
    await db.query(
      'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
      [keyData.id]
    );

    next();
  } catch (error) {
    logger.error('API key validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication',
    });
  }
}

/**
 * Middleware to track API usage
 */
export async function trackApiUsage(req, res, next) {
  const startTime = Date.now();

  // Capture original send function
  const originalSend = res.send;

  res.send = function (data) {
    res.send = originalSend;

    // Track usage asynchronously
    (async () => {
      try {
        const responseTime = Date.now() - startTime;

        if (req.apiKeyData) {
          // Increment usage counters
          await db.query(
            `UPDATE api_keys 
             SET total_analyses = total_analyses + 1,
                 daily_analyses = daily_analyses + 1,
                 monthly_analyses = monthly_analyses + 1
             WHERE id = $1`,
            [req.apiKeyData.id]
          );

          // Log usage
          await db.query(
            `INSERT INTO usage_logs 
             (api_key_id, analysis_id, ip_address, user_agent, endpoint, status_code, response_time)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              req.apiKeyData.id,
              req.analysisId || null,
              req.ip,
              req.get('user-agent'),
              req.path,
              res.statusCode,
              responseTime,
            ]
          );
        }
      } catch (error) {
        logger.error('Usage tracking error:', error);
      }
    })();

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware to require authentication
 */
export function requireAuth(req, res, next) {
  if (!req.isAuthenticated) {
    return res.status(401).json({
      success: false,
      error: 'API key required. Get your free API key at /api/keys/register',
    });
  }
  next();
}

/**
 * Middleware to require admin privileges
 */
export function requireAdmin(req, res, next) {
  if (!req.isAuthenticated || !req.apiKeyData.is_admin) {
    return res.status(403).json({
      success: false,
      error: 'Admin privileges required',
    });
  }
  next();
}
