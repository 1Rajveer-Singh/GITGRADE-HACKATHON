import logger from '../utils/logger.js';
import { FRAMEWORKS } from '../utils/constants.js';

/**
 * Dependencies Analyzer (FREE) - NEW
 * Analyzes project dependencies and health
 */

class DependenciesAnalyzer {
  async analyze(files) {
    logger.info('📦 Analyzing dependencies...');

    const packageManagers = this.detectPackageManagers(files);
    const frameworks = this.detectFrameworks(files);
    const score = this.calculateScore(packageManagers, frameworks);

    return {
      score: Math.min(score, 5),
      details: {
        packageManagers,
        frameworks,
        vulnerableDependencies: 0,
      },
    };
  }

  detectPackageManagers(files) {
    const managers = [];
    
    if (files.some(f => f.path === 'package.json')) managers.push('npm');
    if (files.some(f => f.path === 'requirements.txt')) managers.push('pip');
    if (files.some(f => f.path === 'pom.xml')) managers.push('maven');
    if (files.some(f => f.path === 'build.gradle')) managers.push('gradle');
    if (files.some(f => f.path === 'Cargo.toml')) managers.push('cargo');
    if (files.some(f => f.path === 'go.mod')) managers.push('go modules');
    
    return managers;
  }

  detectFrameworks(files) {
    // Simplified framework detection based on file patterns
    const detected = [];
    
    if (files.some(f => f.path.includes('package.json'))) {
      // Would need to read package.json content for accurate detection
      // Simplified: check for common files
      if (files.some(f => f.path.includes('next.config'))) detected.push('Next.js');
      if (files.some(f => f.path.includes('vite.config'))) detected.push('Vite');
    }
    
    return detected;
  }

  calculateScore(managers, frameworks) {
    let score = 0;
    
    if (managers.length > 0) score += 3;
    if (frameworks.length > 0) score += 2;
    
    return score;
  }
}

export default new DependenciesAnalyzer();
