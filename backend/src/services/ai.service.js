import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import { retryWithBackoff } from '../utils/constants.js';

/**
 * AI Service using Google Gemini (100% FREE)
 * Free Tier: 15 requests/minute, 1500 requests/day, 1 million tokens/minute
 */

class AIService {
  constructor() {
    if (config.gemini.apiKey) {
      this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
      this.available = true;
      logger.info('✅ Google Gemini AI initialized (FREE)');
    } else {
      this.available = false;
      logger.warn('⚠️  Gemini API key not found. Using template-based generation.');
    }
  }

  /**
   * Generate analysis summary using FREE Gemini AI
   */
  async generateSummary(repoData, metrics) {
    if (!this.available) {
      return this.generateFallbackSummary(metrics);
    }

    try {
      const prompt = this.createSummaryPrompt(repoData, metrics);

      const result = await retryWithBackoff(async () => {
        return await this.model.generateContent(prompt);
      }, 2, 1000);

      const response = await result.response;
      const summary = response.text();

      logger.info('✅ AI summary generated successfully');
      return summary.trim();
    } catch (error) {
      logger.error('AI summary generation failed, using fallback:', error.message);
      return this.generateFallbackSummary(metrics);
    }
  }

  /**
   * Generate personalized roadmap using FREE Gemini AI
   */
  async generateRoadmap(repoData, metrics, summary) {
    if (!this.available) {
      return this.generateFallbackRoadmap(metrics);
    }

    try {
      const prompt = this.createRoadmapPrompt(repoData, metrics, summary);

      const result = await retryWithBackoff(async () => {
        return await this.model.generateContent(prompt);
      }, 2, 1000);

      const response = await result.response;
      const roadmapText = response.text();

      // Parse JSON response
      const roadmap = this.parseRoadmap(roadmapText);

      logger.info('✅ AI roadmap generated successfully');
      return roadmap;
    } catch (error) {
      logger.error('AI roadmap generation failed, using fallback:', error.message);
      return this.generateFallbackRoadmap(metrics);
    }
  }

  /**
   * Create prompt for summary generation
   */
  createSummaryPrompt(repoData, metrics) {
    return `You are an expert code reviewer analyzing a GitHub repository.

Repository: ${repoData.fullName}
Description: ${repoData.description || 'No description'}
Primary Language: ${repoData.language || 'Unknown'}
Stars: ${repoData.stars}

Analysis Metrics:
- Overall Score: ${metrics.totalScore}/100
- Code Quality: ${metrics.codeQualityScore}/20
- Project Structure: ${metrics.structureScore}/15
- Documentation: ${metrics.documentationScore}/15
- Testing: ${metrics.testingScore}/12
- Git Practices: ${metrics.gitPracticesScore}/12
- Security: ${metrics.securityScore}/10
- CI/CD: ${metrics.cicdScore}/8
- Dependencies: ${metrics.dependenciesScore}/5
- Containerization: ${metrics.containerizationScore}/3

Repository Statistics:
- Total Files: ${metrics.totalFiles}
- Languages: ${JSON.stringify(metrics.languages)}
- Frameworks: ${metrics.frameworks.join(', ') || 'None detected'}
- Test Files: ${metrics.testFiles}
- Commits: ${metrics.commitCount}
- Branches: ${metrics.branchCount}
- Contributors: ${metrics.contributorCount}

Key Findings:
${this.generateKeyFindings(metrics)}

Task: Generate a professional, honest, 2-3 sentence summary of this repository's quality. Be specific about strengths and weaknesses. Do not include score or rating in the summary.

Write ONLY the summary text, nothing else.`;
  }

  /**
   * Create prompt for roadmap generation
   */
  createRoadmapPrompt(repoData, metrics, summary) {
    return `You are an expert coding mentor creating a personalized improvement roadmap.

Repository: ${repoData.fullName}
Summary: ${summary}

Current Analysis:
${this.generateKeyFindings(metrics)}

Task: Generate 5-7 prioritized, actionable improvement steps. Each step should be specific and implementable.

Return ONLY a valid JSON array with this exact structure:
[
  {
    "priority": "high|medium|low",
    "title": "Brief title (3-7 words)",
    "description": "Specific, actionable description (1-2 sentences)",
    "estimatedTime": "X-Y hours/days"
  }
]

Focus on the biggest gaps first. Be practical and specific. Include steps for improving the weakest dimensions.

Return ONLY the JSON array, no markdown formatting, no code blocks, no explanation.`;
  }

  /**
   * Generate key findings from metrics
   */
  generateKeyFindings(metrics) {
    const findings = [];

    // Code Quality
    if (metrics.codeQualityScore < 12) {
      findings.push('- Code quality needs significant improvement');
    } else if (metrics.codeQualityScore >= 16) {
      findings.push('- Excellent code quality and consistency');
    }

    // Documentation
    if (metrics.documentationScore < 9) {
      findings.push('- Documentation is insufficient');
    } else if (metrics.documentationScore >= 12) {
      findings.push('- Well-documented codebase');
    }

    // Testing
    if (metrics.testingScore < 6) {
      findings.push('- Testing coverage is inadequate');
    } else if (metrics.testingScore >= 10) {
      findings.push('- Strong testing practices');
    }

    // Security
    if (metrics.securityIssues && metrics.securityIssues.length > 0) {
      findings.push(`- ${metrics.securityIssues.length} security concerns detected`);
    }

    // CI/CD
    if (metrics.hasCicd) {
      findings.push('- CI/CD pipeline configured');
    } else {
      findings.push('- No CI/CD automation detected');
    }

    // Containerization
    if (metrics.hasDockerfile) {
      findings.push('- Project is containerized');
    } else {
      findings.push('- Not containerized');
    }

    return findings.join('\n');
  }

  /**
   * Parse roadmap from AI response
   */
  parseRoadmap(text) {
    try {
      // Remove markdown code blocks if present
      let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Parse JSON
      const roadmap = JSON.parse(cleaned);

      // Validate structure
      if (!Array.isArray(roadmap)) {
        throw new Error('Invalid roadmap format');
      }

      // Ensure all required fields
      return roadmap.map((item, index) => ({
        priority: item.priority || 'medium',
        title: item.title || `Improvement ${index + 1}`,
        description: item.description || 'No description provided',
        estimatedTime: item.estimatedTime || '2-4 hours',
      })).slice(0, 7); // Max 7 items

    } catch (error) {
      logger.error('Failed to parse AI roadmap:', error.message);
      return this.generateFallbackRoadmap({}); // Return fallback
    }
  }

  /**
   * Fallback summary (template-based, no AI required)
   */
  generateFallbackSummary(metrics) {
    const score = metrics.totalScore || 0;
    const strengths = [];
    const weaknesses = [];

    // Analyze strengths
    if (metrics.codeQualityScore >= 15) strengths.push('clean code structure');
    if (metrics.documentationScore >= 12) strengths.push('comprehensive documentation');
    if (metrics.testingScore >= 10) strengths.push('strong test coverage');
    if (metrics.securityScore >= 8) strengths.push('good security practices');
    if (metrics.hasCicd) strengths.push('automated CI/CD');

    // Analyze weaknesses
    if (metrics.testingScore < 6) weaknesses.push('insufficient testing');
    if (metrics.documentationScore < 9) weaknesses.push('poor documentation');
    if (metrics.securityScore < 6) weaknesses.push('security concerns');
    if (!metrics.hasCicd) weaknesses.push('no CI/CD automation');

    let summary = '';

    if (score >= 75) {
      summary = `Excellent repository with ${strengths.length > 0 ? strengths.slice(0, 2).join(' and ') : 'strong fundamentals'}. `;
      if (weaknesses.length > 0) {
        summary += `Minor improvements needed in ${weaknesses[0]}.`;
      } else {
        summary += 'Maintains high standards across all dimensions.';
      }
    } else if (score >= 50) {
      summary = `Solid foundation with ${strengths.length > 0 ? strengths.slice(0, 2).join(' and ') : 'decent structure'}. `;
      summary += `However, ${weaknesses.length > 0 ? weaknesses.slice(0, 2).join(' and ') + ' need attention' : 'some areas need improvement'}.`;
    } else {
      summary = `Repository shows potential but needs significant improvement. `;
      if (weaknesses.length > 0) {
        summary += `Critical issues: ${weaknesses.slice(0, 3).join(', ')}. `;
      }
      summary += 'Focus on establishing best practices across all dimensions.';
    }

    return summary;
  }

  /**
   * Fallback roadmap (template-based, no AI required)
   */
  generateFallbackRoadmap(metrics) {
    const roadmap = [];

    // Testing
    if ((metrics.testingScore || 0) < 8) {
      roadmap.push({
        priority: 'high',
        title: 'Implement Unit Testing',
        description: 'Add comprehensive unit tests to increase code reliability and coverage. Aim for at least 70% test coverage.',
        estimatedTime: '4-8 hours',
      });
    }

    // Documentation
    if ((metrics.documentationScore || 0) < 10) {
      roadmap.push({
        priority: 'high',
        title: 'Enhance Documentation',
        description: 'Create or improve README with clear installation instructions, usage examples, and API documentation.',
        estimatedTime: '2-4 hours',
      });
    }

    // CI/CD
    if (!metrics.hasCicd) {
      roadmap.push({
        priority: 'medium',
        title: 'Set Up CI/CD Pipeline',
        description: 'Configure GitHub Actions or similar CI/CD tool for automated testing and deployment.',
        estimatedTime: '3-5 hours',
      });
    }

    // Security
    if ((metrics.securityScore || 0) < 7) {
      roadmap.push({
        priority: 'high',
        title: 'Address Security Issues',
        description: 'Review and fix security vulnerabilities, add .env to .gitignore, and implement security best practices.',
        estimatedTime: '2-3 hours',
      });
    }

    // Code Quality
    if ((metrics.codeQualityScore || 0) < 14) {
      roadmap.push({
        priority: 'medium',
        title: 'Improve Code Quality',
        description: 'Refactor complex functions, add linting rules, and follow language-specific best practices.',
        estimatedTime: '6-10 hours',
      });
    }

    // Containerization
    if (!metrics.hasDockerfile) {
      roadmap.push({
        priority: 'low',
        title: 'Containerize Application',
        description: 'Create Dockerfile and docker-compose.yml for consistent development and deployment environments.',
        estimatedTime: '2-4 hours',
      });
    }

    // Git Practices
    if ((metrics.gitPracticesScore || 0) < 8) {
      roadmap.push({
        priority: 'medium',
        title: 'Improve Git Workflow',
        description: 'Use meaningful commit messages, create feature branches, and leverage pull requests for code review.',
        estimatedTime: 'Ongoing',
      });
    }

    return roadmap.slice(0, 7); // Return up to 7 items
  }
}

export default new AIService();
