import logger from '../utils/logger.js';
import { CICD_PATTERNS } from '../utils/constants.js';

/**
 * CI/CD Analyzer (FREE) - NEW
 * Detects continuous integration and deployment
 */

class CICDAnalyzer {
  async analyze(files) {
    logger.info('🚀 Analyzing CI/CD...');

    const platforms = this.detectCICDPlatforms(files);
    const score = this.calculateScore(platforms);

    return {
      score: Math.min(score, 8),
      details: {
        hasCICD: platforms.length > 0,
        platforms,
      },
    };
  }

  detectCICDPlatforms(files) {
    const detected = [];

    for (const [platform, patterns] of Object.entries(CICD_PATTERNS)) {
      const hasPattern = patterns.some(pattern => 
        files.some(f => f.path.includes(pattern))
      );
      if (hasPattern) detected.push(platform);
    }

    return detected;
  }

  calculateScore(platforms) {
    if (platforms.length === 0) return 0;
    
    let score = 5; // Base score for having CI/CD
    if (platforms.length >= 1) score += 3;
    
    return score;
  }
}

export default new CICDAnalyzer();
