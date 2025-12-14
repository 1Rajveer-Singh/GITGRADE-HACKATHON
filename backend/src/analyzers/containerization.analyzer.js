import logger from '../utils/logger.js';
import { CONTAINER_PATTERNS } from '../utils/constants.js';

/**
 * Containerization Analyzer (FREE) - NEW
 * Detects Docker and container best practices
 */

class ContainerizationAnalyzer {
  async analyze(files) {
    logger.info('🐳 Analyzing containerization...');

    const hasDockerfile = files.some(f => 
      CONTAINER_PATTERNS.docker.some(pattern => f.path.includes(pattern))
    );

    const hasDockerCompose = files.some(f => 
      CONTAINER_PATTERNS.dockerCompose.some(pattern => f.path === pattern)
    );

    let score = 0;
    if (hasDockerfile) score += 2;
    if (hasDockerCompose) score += 1;

    return {
      score: Math.min(score, 3),
      details: {
        hasDockerfile,
        hasDockerCompose,
      },
    };
  }
}

export default new ContainerizationAnalyzer();
