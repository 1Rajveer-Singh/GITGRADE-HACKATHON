import { README_SECTIONS } from '../utils/constants.js';
import logger from '../utils/logger.js';

/**
 * Documentation Analyzer (FREE)
 * Analyzes README quality, code comments, and documentation
 */

class DocumentationAnalyzer {
  /**
   * Analyze documentation (15 points max)
   */
  async analyze(readme, files, fileContents = {}) {
    logger.info('📖 Analyzing documentation...');

    const readmeScore = this.analyzeReadme(readme);
    const codeCommentsScore = this.analyzeCodeComments(files, fileContents);
    const additionalDocsScore = this.analyzeAdditionalDocs(files);

    const totalScore = Math.round(
      readmeScore * 0.75 +          // 11.25 points
      codeCommentsScore * 0.15 +    // 2.25 points
      additionalDocsScore * 0.10    // 1.5 points
    );

    return {
      score: Math.min(totalScore, 15),
      details: {
        readme: readmeScore,
        codeComments: codeCommentsScore,
        additionalDocs: additionalDocsScore,
        readmeLength: readme?.content?.length || 0,
        readmeSections: this.extractReadmeSections(readme),
        hasLicense: this.checkLicense(files),
        hasContributing: this.checkContributing(files),
      },
    };
  }

  /**
   * Analyze README quality
   */
  analyzeReadme(readme) {
    if (!readme || !readme.content) {
      return 0; // No README = 0 points
    }

    let score = 5; // Base score for having a README
    const content = readme.content.toLowerCase();
    const length = readme.content.length;

    // Length check
    if (length < 100) {
      score -= 2; // Too short
    } else if (length >= 300 && length < 1000) {
      score += 2; // Decent length
    } else if (length >= 1000 && length < 5000) {
      score += 4; // Good length
    } else if (length >= 5000) {
      score += 3; // Comprehensive
    }

    // Check for essential sections
    const sections = this.extractReadmeSections(readme);
    
    if (sections.includes('installation') || sections.includes('setup') || sections.includes('getting started')) {
      score += 2;
    }
    
    if (sections.includes('usage') || sections.includes('examples')) {
      score += 2;
    }
    
    if (sections.includes('features')) {
      score += 1;
    }
    
    if (sections.includes('documentation') || sections.includes('api')) {
      score += 1;
    }
    
    if (sections.includes('contributing')) {
      score += 1;
    }
    
    if (sections.includes('license')) {
      score += 1;
    }

    if (sections.includes('tests') || sections.includes('testing')) {
      score += 1;
    }

    // Check for code examples (code blocks)
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    if (codeBlocks >= 2) score += 2;
    if (codeBlocks >= 4) score += 1;

    // Check for images/badges
    const images = (content.match(/!\[.*?\]/g) || []).length;
    if (images > 0) score += 1;

    // Check for links
    const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
    if (links >= 3) score += 1;

    // Check for table of contents
    if (content.includes('table of contents') || content.includes('toc')) {
      score += 1;
    }

    // Penalties
    // Too short for a real project
    if (length < 200 && sections.length < 3) {
      score -= 3;
    }

    return Math.max(Math.min(score, 15), 0);
  }

  /**
   * Extract README sections
   */
  extractReadmeSections(readme) {
    if (!readme || !readme.content) return [];

    const content = readme.content.toLowerCase();
    const foundSections = [];

    // Look for markdown headers
    const headers = content.match(/^#+\s+(.+)$/gm) || [];
    
    headers.forEach(header => {
      const headerText = header.replace(/^#+\s+/, '').trim();
      
      README_SECTIONS.forEach(section => {
        if (headerText.includes(section.toLowerCase())) {
          foundSections.push(section.toLowerCase());
        }
      });
    });

    return [...new Set(foundSections)]; // Remove duplicates
  }

  /**
   * Analyze code comments (simplified)
   */
  analyzeCodeComments(files, fileContents) {
    let score = 10;

    // This is simplified - in production would parse actual file contents
    // For now, estimate based on file patterns

    const codeFiles = files.filter(f => 
      /\.(js|jsx|ts|tsx|py|java|cpp|c|cs|rb|go|rs|php|swift|kt)$/.test(f.path)
    );

    if (codeFiles.length === 0) return 5;

    // Look for documentation files in code directories
    const hasApiDocs = files.some(f => 
      f.path.includes('docs/api') || 
      f.path.includes('api.md') ||
      f.path.includes('API.md')
    );

    if (hasApiDocs) score += 3;

    // Check for JSDoc or similar comment patterns in file names
    const hasDocgen = files.some(f => 
      f.path.includes('jsdoc') || 
      f.path.includes('typedoc') ||
      f.path.includes('sphinx')
    );

    if (hasDocgen) score += 2;

    // Assume reasonable comment density if project is well-organized
    if (score >= 10) score += 3;

    return Math.max(Math.min(score, 15), 0);
  }

  /**
   * Analyze additional documentation
   */
  analyzeAdditionalDocs(files) {
    let score = 10;

    // Check for docs directory
    const hasDocsDir = files.some(f => f.path.startsWith('docs/'));
    if (hasDocsDir) score += 3;

    // Check for LICENSE file
    if (this.checkLicense(files)) score += 2;

    // Check for CONTRIBUTING file
    if (this.checkContributing(files)) score += 2;

    // Check for CHANGELOG
    const hasChangelog = files.some(f => 
      /^CHANGELOG(\.(md|txt|rst))?$/i.test(f.path) ||
      f.path.toUpperCase().includes('CHANGELOG')
    );
    if (hasChangelog) score += 1;

    // Check for CODE_OF_CONDUCT
    const hasCodeOfConduct = files.some(f => 
      /^CODE_OF_CONDUCT(\.(md|txt|rst))?$/i.test(f.path) ||
      f.path.toUpperCase().includes('CODE_OF_CONDUCT')
    );
    if (hasCodeOfConduct) score += 1;

    // Check for SECURITY policy
    const hasSecurity = files.some(f => 
      /^SECURITY(\.(md|txt|rst))?$/i.test(f.path) ||
      f.path.toUpperCase().includes('SECURITY')
    );
    if (hasSecurity) score += 1;

    // Check for additional markdown files
    const markdownFiles = files.filter(f => f.path.endsWith('.md'));
    if (markdownFiles.length >= 3) score += 1;
    if (markdownFiles.length >= 5) score += 1;

    return Math.max(Math.min(score, 15), 0);
  }

  /**
   * Check for LICENSE file
   */
  checkLicense(files) {
    return files.some(f => 
      /^LICENSE(\.(md|txt|rst))?$/i.test(f.path) ||
      /^LICENCE(\.(md|txt|rst))?$/i.test(f.path) ||
      f.path.toUpperCase() === 'LICENSE' ||
      f.path.toUpperCase() === 'LICENCE'
    );
  }

  /**
   * Check for CONTRIBUTING file
   */
  checkContributing(files) {
    return files.some(f => 
      /^CONTRIBUTING(\.(md|txt|rst))?$/i.test(f.path) ||
      f.path.toUpperCase().includes('CONTRIBUTING')
    );
  }
}

export default new DocumentationAnalyzer();
