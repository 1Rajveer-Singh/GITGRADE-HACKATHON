import express from 'express';
import analyzerService from '../services/analyzer.service.js';
import { getAnalysisById, getAnalysisHistory } from '../db/database.js';
import { GITHUB_URL_REGEX, ERROR_MESSAGES } from '../utils/constants.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Start a new repository analysis
 */
router.post('/analyze', async (req, res) => {
  try {
    const { repoUrl } = req.body;

    // Validate input
    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        error: 'Repository URL is required',
      });
    }

    // Validate GitHub URL format
    if (!GITHUB_URL_REGEX.test(repoUrl)) {
      return res.status(400).json({
        success: false,
        error: ERROR_MESSAGES.INVALID_URL,
      });
    }

    logger.info(`📥 Analysis request received: ${repoUrl}`);

    // Start analysis (runs in background)
    const result = await analyzerService.analyzeRepository(repoUrl);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Analysis error:', error);

    let statusCode = 500;
    let errorMessage = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('rate limit')) {
      statusCode = 429;
    } else if (error.message.includes('timeout')) {
      statusCode = 408;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
});

/**
 * GET /api/analysis/:id
 * Get analysis results by ID
 */
router.get('/analysis/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const analysis = await getAnalysisById(id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found',
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error('Error fetching analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/history
 * Get analysis history
 */
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const analyses = await getAnalysisHistory(limit, offset);

    res.status(200).json({
      success: true,
      data: {
        analyses,
        page,
        limit,
      },
    });
  } catch (error) {
    logger.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
