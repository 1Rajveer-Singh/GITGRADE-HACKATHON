import logger from '../utils/logger.js';
import { SECURITY_PATTERNS } from '../utils/constants.js';

/**
 * Security Analyzer (FREE) - NEW
 * Analyzes security best practices
 */

class SecurityAnalyzer {
  async analyze(files, readme) {
    logger.info('🔒 Analyzing security...');

    const secretsScore = this.detectHardcodedSecrets(files);
    const gitignoreScore = this.analyzeGitignore(files);
    const dependenciesScore = this.analyzeDependencySecurity(files);

    const totalScore = Math.round(
      secretsScore * 0.40 +      // 4 points
      gitignoreScore * 0.35 +    // 3.5 points
      dependenciesScore * 0.25   // 2.5 points
    );

    const issues = this.collectSecurityIssues(files);

    return {
      score: Math.min(totalScore, 10),
      details: {
        secrets: secretsScore,
        gitignore: gitignoreScore,
        dependencies: dependenciesScore,
        securityIssues: issues,
      },
    };
  }

  detectHardcodedSecrets(files) {
    let score = 10;
    const sensitiveFiles = files.filter(f => 
      SECURITY_PATTERNS.sensitiveFiles.some(sf => f.path.includes(sf))
    );

    if (sensitiveFiles.length > 0) score -= 5;

    // Check for .env files not in .gitignore
    const hasEnv = files.some(f => f.path.includes('.env') && !f.path.includes('.example'));
    if (hasEnv) score -= 3;

    return Math.max(score, 0);
  }

  analyzeGitignore(files) {
    const hasGitignore = files.some(f => f.path === '.gitignore');
    if (!hasGitignore) return 0;

    return 10; // Has .gitignore
  }

  analyzeDependencySecurity(files) {
    // Check for security-related files
    const hasSecurityPolicy = files.some(f => f.path.toUpperCase().includes('SECURITY'));
    return hasSecurityPolicy ? 10 : 7;
  }

  collectSecurityIssues(files) {
    const issues = [];
    
    if (!files.some(f => f.path === '.gitignore')) {
      issues.push({ type: 'missing_gitignore', severity: 'high' });
    }

    const hasEnv = files.some(f => f.path.includes('.env') && !f.path.includes('.example'));
    if (hasEnv) {
      issues.push({ type: 'env_file_committed', severity: 'critical' });
    }

    return issues;
  }
}

export default new SecurityAnalyzer();
