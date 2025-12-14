import express from 'express';
import { generateApiKey } from '../middleware/apiKey.middleware.js';
import { requireAuth, requireAdmin } from '../middleware/apiKey.middleware.js';
import db from '../db/database.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/keys/register
 * Register for a new API key (FREE)
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required',
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Check if email already has an active key
    const existing = await db.query(
      'SELECT id FROM api_keys WHERE email = $1 AND is_active = TRUE',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'An active API key already exists for this email. Check your email or contact support.',
      });
    }

    // Generate new API key
    const apiKey = generateApiKey();

    // Insert into database
    const result = await db.query(
      `INSERT INTO api_keys (api_key, name, email, daily_limit, monthly_limit)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, api_key, name, email, daily_limit, monthly_limit, created_at`,
      [apiKey, name, email, 50, 1000] // FREE tier: 50/day, 1000/month
    );

    const keyData = result.rows[0];

    logger.info(`New API key registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'API key created successfully',
      data: {
        apiKey: keyData.api_key,
        name: keyData.name,
        email: keyData.email,
        limits: {
          daily: keyData.daily_limit,
          monthly: keyData.monthly_limit,
        },
        createdAt: keyData.created_at,
        usage: 'Include this key in your requests using the X-API-Key header or api_key query parameter',
      },
    });
  } catch (error) {
    logger.error('API key registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create API key',
    });
  }
});

/**
 * GET /api/keys/usage
 * Get usage statistics for the authenticated API key
 */
router.get('/usage', requireAuth, async (req, res) => {
  try {
    const keyData = req.apiKeyData;

    // Get usage logs for last 30 days
    const logs = await db.query(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as count,
         AVG(response_time) as avg_response_time
       FROM usage_logs
       WHERE api_key_id = $1 AND created_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [keyData.id]
    );

    res.json({
      success: true,
      data: {
        key: {
          name: keyData.name,
          email: keyData.email,
          createdAt: keyData.created_at,
        },
        usage: {
          total: keyData.total_analyses,
          today: keyData.daily_analyses,
          thisMonth: keyData.monthly_analyses,
        },
        limits: {
          daily: keyData.daily_limit,
          monthly: keyData.monthly_limit,
        },
        remaining: {
          daily: keyData.daily_limit - keyData.daily_analyses,
          monthly: keyData.monthly_limit - keyData.monthly_analyses,
        },
        history: logs.rows,
      },
    });
  } catch (error) {
    logger.error('Usage retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve usage data',
    });
  }
});

/**
 * POST /api/keys/deactivate
 * Deactivate the authenticated API key
 */
router.post('/deactivate', requireAuth, async (req, res) => {
  try {
    await db.query(
      'UPDATE api_keys SET is_active = FALSE WHERE id = $1',
      [req.apiKeyData.id]
    );

    logger.info(`API key deactivated: ${req.apiKeyData.email}`);

    res.json({
      success: true,
      message: 'API key deactivated successfully',
    });
  } catch (error) {
    logger.error('API key deactivation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate API key',
    });
  }
});

/**
 * POST /api/keys/reactivate
 * Reactivate a deactivated API key
 */
router.post('/reactivate', async (req, res) => {
  try {
    const { email, apiKey } = req.body;

    if (!email || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Email and API key are required',
      });
    }

    const result = await db.query(
      'UPDATE api_keys SET is_active = TRUE WHERE email = $1 AND api_key = $2 RETURNING id',
      [email, apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'API key not found',
      });
    }

    logger.info(`API key reactivated: ${email}`);

    res.json({
      success: true,
      message: 'API key reactivated successfully',
    });
  } catch (error) {
    logger.error('API key reactivation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reactivate API key',
    });
  }
});

/**
 * GET /api/keys/list (Admin only)
 * List all API keys
 */
router.get('/list', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, active } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, email, daily_limit, monthly_limit, 
             total_analyses, daily_analyses, monthly_analyses,
             is_active, created_at, last_used_at
      FROM api_keys
    `;

    const params = [];
    if (active !== undefined) {
      query += ' WHERE is_active = $1';
      params.push(active === 'true');
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM api_keys';
    if (active !== undefined) {
      countQuery += ' WHERE is_active = $1';
    }
    const countResult = await db.query(countQuery, active !== undefined ? [active === 'true'] : []);

    res.json({
      success: true,
      data: {
        keys: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(countResult.rows[0].count / limit),
        },
      },
    });
  } catch (error) {
    logger.error('API keys list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve API keys',
    });
  }
});

/**
 * PUT /api/keys/:id/limits (Admin only)
 * Update limits for an API key
 */
router.put('/:id/limits', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { dailyLimit, monthlyLimit } = req.body;

    if (!dailyLimit && !monthlyLimit) {
      return res.status(400).json({
        success: false,
        error: 'At least one limit must be provided',
      });
    }

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (dailyLimit) {
      updates.push(`daily_limit = $${paramCount}`);
      params.push(dailyLimit);
      paramCount++;
    }

    if (monthlyLimit) {
      updates.push(`monthly_limit = $${paramCount}`);
      params.push(monthlyLimit);
      paramCount++;
    }

    params.push(id);

    await db.query(
      `UPDATE api_keys SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      params
    );

    res.json({
      success: true,
      message: 'Limits updated successfully',
    });
  } catch (error) {
    logger.error('Update limits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update limits',
    });
  }
});

export default router;
