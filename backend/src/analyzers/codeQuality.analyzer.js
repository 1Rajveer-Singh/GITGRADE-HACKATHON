import path from 'path';
import { FILE_CATEGORIES } from '../utils/constants.js';
import logger from '../utils/logger.js';

/**
 * Code Quality Analyzer (FREE)
 * Analyzes code complexity, file sizes, and naming conventions
 */

class CodeQualityAnalyzer {
  /**
   * Analyze code quality (20 points max)
   */
  async analyze(files, fileContents = {}) {
    logger.info('🔍 Analyzing code quality...');

    const codeFiles = files.filter(f => this.isCodeFile(f.path));
    
    if (codeFiles.length === 0) {
      return { score: 0, details: {} };
    }

    // Sub-metrics
    const complexityScore = this.analyzeComplexity(codeFiles, fileContents);
    const fileSizeScore = this.analyzeFileSizes(codeFiles);
    const namingScore = this.analyzeNaming(codeFiles);
    const duplicationScore = this.analyzeDuplication(codeFiles, fileContents);

    // Weighted total (out of 20)
    const totalScore = Math.round(
      complexityScore * 0.4 +    // 8 points
      fileSizeScore * 0.25 +      // 5 points
      duplicationScore * 0.20 +   // 4 points
      namingScore * 0.15          // 3 points
    );

    return {
      score: Math.min(totalScore, 20),
      details: {
        complexity: complexityScore,
        fileSize: fileSizeScore,
        naming: namingScore,
        duplication: duplicationScore,
        totalCodeFiles: codeFiles.length,
      },
    };
  }

  /**
   * Analyze code complexity
   */
  analyzeComplexity(files, fileContents) {
    let score = 20; // Start with perfect score

    // Average file size (simpler = better)
    const avgSize = files.reduce((sum, f) => sum + (f.size || 0), 0) / files.length;
    
    if (avgSize > 1000) score -= 5;  // Large files indicate complexity
    if (avgSize > 2000) score -= 5;
    if (avgSize > 5000) score -= 5;

    // Files over 500 lines (estimate: ~20 bytes per line)
    const largeFiles = files.filter(f => (f.size || 0) > 10000).length;
    const largeFileRatio = largeFiles / files.length;
    
    if (largeFileRatio > 0.3) score -= 5;  // Too many large files

    // Check for deeply nested directories (complexity indicator)
    const maxDepth = Math.max(...files.map(f => f.path.split('/').length));
    if (maxDepth > 8) score -= 3;
    if (maxDepth > 12) score -= 2;

    return Math.max(score, 0);
  }

  /**
   * Analyze file sizes distribution
   */
  analyzeFileSizes(files) {
    let score = 20;

    const sizes = files.map(f => f.size || 0).filter(s => s > 0);
    if (sizes.length === 0) return 10;

    const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const maxSize = Math.max(...sizes);

    // Penalties for bad file size distribution
    if (maxSize > 50000) score -= 5;   // Files > 50KB
    if (maxSize > 100000) score -= 5;  // Files > 100KB
    if (avgSize > 5000) score -= 3;
    if (avgSize > 10000) score -= 3;

    // Check for very small files (might indicate poor organization)
    const tinyFiles = sizes.filter(s => s < 100).length;
    if (tinyFiles / sizes.length > 0.5) score -= 4;

    return Math.max(score, 0);
  }

  /**
   * Analyze naming conventions
   */
  analyzeNaming(files) {
    let score = 20;

    files.forEach(file => {
      const filename = path.basename(file.path);
      const dir = path.dirname(file.path);

      // Check for bad naming patterns
      if (/test|temp|old|backup|copy|new|tmp/i.test(filename)) {
        score -= 0.5; // Indicates poor maintenance
      }

      // Check for numbered files (file1.js, file2.js)
      if (/\d{1,2}\.(js|py|java|ts)$/i.test(filename)) {
        score -= 0.5;
      }

      // Check for inconsistent casing in same directory
      // (This is simplified - real implementation would group by dir)
    });

    // Good naming patterns (bonus points)
    const goodPatterns = files.filter(f => {
      const name = path.basename(f.path);
      return /^[a-z][a-zA-Z0-9]*\.(js|py|ts|java)$/.test(name) || // camelCase
             /^[a-z][a-z0-9-]*\.(js|py|ts|java)$/.test(name);      // kebab-case
    });

    if (goodPatterns.length / files.length > 0.8) {
      score += 2; // Consistent naming
    }

    return Math.max(Math.min(score, 20), 0);
  }

  /**
   * Analyze code duplication (simplified)
   */
  analyzeDuplication(files, fileContents) {
    // This is a simplified check
    // In production, would use AST parsing or proper duplicate detection

    let score = 20;

    // Check for duplicate file names in different directories
    const fileNames = files.map(f => path.basename(f.path));
    const uniqueNames = new Set(fileNames);
    
    if (fileNames.length > uniqueNames.size) {
      const duplicateRatio = 1 - (uniqueNames.size / fileNames.length);
      score -= Math.min(duplicateRatio * 20, 10);
    }

    return Math.max(score, 0);
  }

  /**
   * Check if file is a code file
   */
  isCodeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return FILE_CATEGORIES.code.includes(ext);
  }
}

export default new CodeQualityAnalyzer();
