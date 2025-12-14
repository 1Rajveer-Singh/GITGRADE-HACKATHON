import { analyzeCodeQuality } from '../src/analyzers/codeQuality.analyzer.js';
import { analyzeProjectStructure } from '../src/analyzers/projectStructure.analyzer.js';
import { analyzeTesting } from '../src/analyzers/testing.analyzer.js';
import { analyzeSecurity } from '../src/analyzers/security.analyzer.js';

describe('Code Quality Analyzer', () => {
  test('should analyze code quality metrics', async () => {
    const mockFiles = [
      { name: 'test.js', content: 'const x = 1;', size: 100 },
      { name: 'README.md', content: '# Test', size: 50 }
    ];
    
    const result = await analyzeCodeQuality(mockFiles);
    
    expect(result).toHaveProperty('score');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(20);
  });
});

describe('Project Structure Analyzer', () => {
  test('should detect package.json', async () => {
    const mockFiles = [
      { name: 'package.json', content: '{"name":"test"}' }
    ];
    
    const result = await analyzeProjectStructure(mockFiles);
    
    expect(result).toHaveProperty('score');
    expect(result.details).toContain('package.json');
  });
});

describe('Testing Analyzer', () => {
  test('should detect test files', async () => {
    const mockFiles = [
      { name: 'test.spec.js', content: 'test("example", () => {})' },
      { name: 'package.json', content: '{"scripts":{"test":"jest"}}' }
    ];
    
    const result = await analyzeTesting(mockFiles);
    
    expect(result).toHaveProperty('score');
    expect(result.score).toBeGreaterThan(0);
  });
});

describe('Security Analyzer', () => {
  test('should detect security issues', async () => {
    const mockFiles = [
      { name: 'config.js', content: 'const apiKey = "sk-1234567890"' }
    ];
    
    const result = await analyzeSecurity(mockFiles);
    
    expect(result).toHaveProperty('score');
    expect(result.issues).toBeDefined();
  });
});
