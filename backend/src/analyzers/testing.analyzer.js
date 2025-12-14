import path from 'path';
import logger from '../utils/logger.js';

/**
 * Testing Analyzer (FREE)
 * Analyzes test coverage and testing practices
 */

class TestingAnalyzer {
  /**
   * Analyze testing (12 points max)
   */
  async analyze(files) {
    logger.info('🧪 Analyzing testing...');

    const testFiles = this.findTestFiles(files);
    const codeFiles = this.findCodeFiles(files);

    if (codeFiles.length === 0) {
      return { score: 0, details: {} };
    }

    const testPresenceScore = this.analyzeTestPresence(testFiles, codeFiles);
    const testCoverageScore = this.estimateTestCoverage(testFiles, codeFiles);
    const testOrganizationScore = this.analyzeTestOrganization(testFiles);
    const testFrameworkScore = this.detectTestingFramework(files);

    const totalScore = Math.round(
      testPresenceScore * 0.35 +      // 4.2 points
      testCoverageScore * 0.35 +      // 4.2 points
      testOrganizationScore * 0.15 +  // 1.8 points
      testFrameworkScore * 0.15       // 1.8 points
    );

    const testCoverage = this.calculateTestToCodeRatio(testFiles, codeFiles);

    return {
      score: Math.min(totalScore, 12),
      details: {
        testPresence: testPresenceScore,
        testCoverage: testCoverageScore,
        testOrganization: testOrganizationScore,
        testFramework: testFrameworkScore,
        totalTestFiles: testFiles.length,
        testToCodeRatio: testCoverage,
        testingFrameworks: this.getTestingFrameworks(files),
      },
    };
  }

  /**
   * Find test files
   */
  findTestFiles(files) {
    return files.filter(f => {
      const filename = f.path.toLowerCase();
      return (
        filename.includes('.test.') ||
        filename.includes('.spec.') ||
        filename.includes('_test.') ||
        filename.includes('_spec.') ||
        filename.includes('/test/') ||
        filename.includes('/tests/') ||
        filename.includes('/__tests__/') ||
        filename.includes('/spec/') ||
        filename.includes('test_') ||
        filename.endsWith('Test.java') ||
        filename.endsWith('Tests.cs')
      );
    });
  }

  /**
   * Find code files (excluding tests)
   */
  findCodeFiles(files) {
    const testFiles = new Set(this.findTestFiles(files).map(f => f.path));
    
    return files.filter(f => {
      const ext = path.extname(f.path).toLowerCase();
      const isCodeFile = [
        '.js', '.jsx', '.ts', '.tsx', '.py', '.java',
        '.cpp', '.c', '.cs', '.rb', '.go', '.rs',
        '.php', '.swift', '.kt'
      ].includes(ext);
      
      return isCodeFile && !testFiles.has(f.path);
    });
  }

  /**
   * Analyze test presence
   */
  analyzeTestPresence(testFiles, codeFiles) {
    if (testFiles.length === 0) {
      return 0; // No tests = 0 points
    }

    let score = 5; // Base score for having tests

    // Score based on number of test files
    if (testFiles.length >= 1) score += 2;
    if (testFiles.length >= 5) score += 2;
    if (testFiles.length >= 10) score += 2;
    if (testFiles.length >= 20) score += 2;

    // Bonus for having tests directory
    const hasTestDir = testFiles.some(f => 
      f.path.includes('/test/') || 
      f.path.includes('/tests/') || 
      f.path.includes('/__tests__/')
    );
    if (hasTestDir) score += 2;

    return Math.max(Math.min(score, 12), 0);
  }

  /**
   * Estimate test coverage
   */
  estimateTestCoverage(testFiles, codeFiles) {
    if (testFiles.length === 0 || codeFiles.length === 0) {
      return 0;
    }

    // Calculate test-to-code ratio
    const ratio = testFiles.length / codeFiles.length;

    let score = 0;

    // Scoring based on ratio
    if (ratio >= 0.1) score += 2;   // At least 10% test files
    if (ratio >= 0.2) score += 2;   // At least 20%
    if (ratio >= 0.3) score += 2;   // At least 30%
    if (ratio >= 0.5) score += 3;   // At least 50% (good)
    if (ratio >= 0.8) score += 3;   // 80% or more (excellent)

    // Calculate test file size ratio (better indicator)
    const totalTestSize = testFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    const totalCodeSize = codeFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    
    if (totalCodeSize > 0) {
      const sizeRatio = totalTestSize / totalCodeSize;
      
      if (sizeRatio >= 0.2) score += 1;
      if (sizeRatio >= 0.5) score += 1;
      if (sizeRatio >= 1.0) score += 1; // Test code >= prod code (very good)
    }

    return Math.max(Math.min(score, 12), 0);
  }

  /**
   * Analyze test organization
   */
  analyzeTestOrganization(testFiles) {
    if (testFiles.length === 0) return 0;

    let score = 8;

    // Check if tests are in dedicated directories
    const testsInTestDir = testFiles.filter(f => 
      f.path.includes('/test/') || 
      f.path.includes('/tests/') ||
      f.path.includes('/__tests__/')
    );

    const organizationRatio = testsInTestDir.length / testFiles.length;

    if (organizationRatio >= 0.8) score += 4; // Well organized
    else if (organizationRatio >= 0.5) score += 2; // Partially organized
    else if (organizationRatio < 0.3) score -= 3; // Poorly organized

    // Check for test utilities/helpers
    const hasTestUtils = testFiles.some(f => 
      f.path.includes('test/utils') ||
      f.path.includes('test/helpers') ||
      f.path.includes('testUtils') ||
      f.path.includes('setupTests')
    );

    if (hasTestUtils) score += 2;

    // Check for different types of tests
    const hasUnitTests = testFiles.some(f => f.path.includes('unit'));
    const hasIntegrationTests = testFiles.some(f => f.path.includes('integration'));
    const hasE2eTests = testFiles.some(f => f.path.includes('e2e') || f.path.includes('e2e'));

    if (hasUnitTests) score += 1;
    if (hasIntegrationTests) score += 1;
    if (hasE2eTests) score += 1;

    return Math.max(Math.min(score, 12), 0);
  }

  /**
   * Detect testing framework
   */
  detectTestingFramework(files) {
    const frameworks = this.getTestingFrameworks(files);

    if (frameworks.length === 0) return 0;

    let score = 5; // Base score for having a framework

    if (frameworks.length >= 1) score += 3;
    if (frameworks.length >= 2) score += 2; // Multiple frameworks (unit + e2e)
    if (frameworks.length >= 3) score += 2;

    return Math.max(Math.min(score, 12), 0);
  }

  /**
   * Get detected testing frameworks
   */
  getTestingFrameworks(files) {
    const frameworks = [];
    const fileNames = files.map(f => f.path.toLowerCase());
    const allPaths = fileNames.join(' ');

    // JavaScript/TypeScript
    if (fileNames.some(f => f.includes('jest.config') || f.includes('package.json'))) {
      if (allPaths.includes('jest')) frameworks.push('Jest');
    }
    if (fileNames.some(f => f.includes('vitest.config'))) frameworks.push('Vitest');
    if (allPaths.includes('mocha') || fileNames.some(f => f.includes('.mocharc'))) {
      frameworks.push('Mocha');
    }
    if (allPaths.includes('cypress')) frameworks.push('Cypress');
    if (allPaths.includes('playwright')) frameworks.push('Playwright');
    if (allPaths.includes('@testing-library')) frameworks.push('Testing Library');

    // Python
    if (allPaths.includes('pytest')) frameworks.push('PyTest');
    if (allPaths.includes('unittest')) frameworks.push('unittest');

    // Java
    if (allPaths.includes('junit')) frameworks.push('JUnit');
    if (allPaths.includes('testng')) frameworks.push('TestNG');
    if (allPaths.includes('mockito')) frameworks.push('Mockito');

    // C#
    if (allPaths.includes('nunit')) frameworks.push('NUnit');
    if (allPaths.includes('xunit')) frameworks.push('xUnit');

    return [...new Set(frameworks)]; // Remove duplicates
  }

  /**
   * Calculate test-to-code ratio
   */
  calculateTestToCodeRatio(testFiles, codeFiles) {
    if (codeFiles.length === 0) return 0;
    
    const ratio = (testFiles.length / codeFiles.length) * 100;
    return Math.round(ratio * 100) / 100;
  }
}

export default new TestingAnalyzer();
