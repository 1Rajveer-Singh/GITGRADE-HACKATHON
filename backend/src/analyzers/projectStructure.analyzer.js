import path from 'path';
import logger from '../utils/logger.js';

/**
 * Project Structure Analyzer (FREE)
 * Analyzes folder organization and file structure
 */

class ProjectStructureAnalyzer {
  /**
   * Analyze project structure (15 points max)
   */
  async analyze(files) {
    logger.info('📁 Analyzing project structure...');

    if (files.length === 0) {
      return { score: 0, details: {} };
    }

    const folderScore = this.analyzeFolderOrganization(files);
    const configScore = this.analyzeConfigFiles(files);
    const separationScore = this.analyzeSeparationOfConcerns(files);

    const totalScore = Math.round(
      folderScore * 0.60 +       // 9 points
      configScore * 0.25 +        // 3.75 points
      separationScore * 0.15      // 2.25 points
    );

    return {
      score: Math.min(totalScore, 15),
      details: {
        folderOrganization: folderScore,
        configFiles: configScore,
        separationOfConcerns: separationScore,
      },
    };
  }

  /**
   * Analyze folder organization
   */
  analyzeFolderOrganization(files) {
    let score = 15;

    // Get unique directories
    const dirs = new Set(files.map(f => path.dirname(f.path)));
    const dirCount = dirs.size;

    // Check for common good structure patterns
    const hasSrcDir = files.some(f => f.path.startsWith('src/'));
    const hasTestDir = files.some(f => f.path.includes('test/') || f.path.includes('tests/') || f.path.includes('__tests__/'));
    const hasDocsDir = files.some(f => f.path.startsWith('docs/'));
    const hasPublicDir = files.some(f => f.path.startsWith('public/') || f.path.startsWith('static/'));

    // Bonus for good organization
    if (hasSrcDir) score += 2;
    if (hasTestDir) score += 1;
    if (hasDocsDir) score += 1;

    // Check depth (too deep or too shallow is bad)
    const depths = files.map(f => f.path.split('/').length);
    const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
    const maxDepth = Math.max(...depths);

    if (maxDepth > 10) score -= 3;  // Too deep
    if (avgDepth < 2 && files.length > 10) score -= 3;  // Too flat
    if (avgDepth > 6) score -= 2;   // Too nested

    // Check for root directory clutter
    const rootFiles = files.filter(f => !f.path.includes('/'));
    const rootFileRatio = rootFiles.length / files.length;
    
    if (rootFileRatio > 0.5 && files.length > 20) {
      score -= 4; // Too many files in root
    }

    // Check for common bad patterns
    const hasAllFilesInRoot = dirCount === 1 && files.length > 10;
    if (hasAllFilesInRoot) score -= 5;

    // Check for language-specific good structures
    const hasPackageJson = files.some(f => f.path === 'package.json');
    const hasNodeModules = files.some(f => f.path.startsWith('node_modules/'));
    
    if (hasPackageJson && !hasNodeModules) {
      // Good - node_modules is gitignored
      score += 1;
    }

    return Math.max(Math.min(score, 15), 0);
  }

  /**
   * Analyze configuration files
   */
  analyzeConfigFiles(files) {
    let score = 10;

    const configFiles = [
      'package.json',
      'tsconfig.json',
      'webpack.config.js',
      'vite.config.js',
      '.eslintrc',
      '.prettierrc',
      'babel.config.js',
      'jest.config.js',
      'requirements.txt',
      'setup.py',
      'pom.xml',
      'build.gradle',
      'Makefile',
      '.gitignore',
      '.editorconfig',
    ];

    const foundConfigs = files.filter(f => 
      configFiles.includes(path.basename(f.path)) ||
      configFiles.some(cf => f.path.endsWith(cf))
    );

    // Bonus for having essential configs
    if (foundConfigs.length >= 3) score += 3;
    if (foundConfigs.length >= 5) score += 2;
    if (foundConfigs.length >= 8) score += 2;

    // Check for .gitignore (essential)
    const hasGitignore = files.some(f => f.path === '.gitignore' || f.path.endsWith('.gitignore'));
    if (!hasGitignore) score -= 3;
    else score += 2;

    // Check for environment templates
    const hasEnvExample = files.some(f => 
      f.path.includes('.env.example') || 
      f.path.includes('.env.template')
    );
    if (hasEnvExample) score += 2;

    // Check for editor config
    const hasEditorConfig = files.some(f => f.path === '.editorconfig');
    if (hasEditorConfig) score += 1;

    return Math.max(Math.min(score, 15), 0);
  }

  /**
   * Analyze separation of concerns
   */
  analyzeSeparationOfConcerns(files) {
    let score = 15;

    // Check for common separation patterns
    const patterns = {
      components: files.filter(f => f.path.includes('components/')),
      controllers: files.filter(f => f.path.includes('controllers/')),
      models: files.filter(f => f.path.includes('models/')),
      views: files.filter(f => f.path.includes('views/')),
      services: files.filter(f => f.path.includes('services/')),
      utils: files.filter(f => f.path.includes('utils/') || f.path.includes('helpers/')),
      routes: files.filter(f => f.path.includes('routes/') || f.path.includes('api/')),
      config: files.filter(f => f.path.includes('config/')),
      assets: files.filter(f => f.path.includes('assets/') || f.path.includes('static/')),
    };

    // Count how many patterns are present
    const presentPatterns = Object.values(patterns).filter(p => p.length > 0).length;

    if (presentPatterns >= 4) score += 3;  // Good separation
    if (presentPatterns >= 6) score += 2;  // Excellent separation

    // Penalty for mixing concerns (e.g., tests not in test directory)
    const testFiles = files.filter(f => /\.(test|spec)\.[jt]sx?$/.test(f.path));
    const testsInTestDir = testFiles.filter(f => 
      f.path.includes('test/') || 
      f.path.includes('tests/') || 
      f.path.includes('__tests__/')
    );

    if (testFiles.length > 0 && testsInTestDir.length / testFiles.length < 0.5) {
      score -= 3; // Tests not properly organized
    }

    return Math.max(Math.min(score, 15), 0);
  }
}

export default new ProjectStructureAnalyzer();
