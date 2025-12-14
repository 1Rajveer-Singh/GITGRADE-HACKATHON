import githubService from './github.service.js';
import aiService from './ai.service.js';
import codeQualityAnalyzer from '../analyzers/codeQuality.analyzer.js';
import projectStructureAnalyzer from '../analyzers/projectStructure.analyzer.js';
import documentationAnalyzer from '../analyzers/documentation.analyzer.js';
import testingAnalyzer from '../analyzers/testing.analyzer.js';
import gitPracticesAnalyzer from '../analyzers/gitPractices.analyzer.js';
import securityAnalyzer from '../analyzers/security.analyzer.js';
import cicdAnalyzer from '../analyzers/cicd.analyzer.js';
import dependenciesAnalyzer from '../analyzers/dependencies.analyzer.js';
import containerizationAnalyzer from '../analyzers/containerization.analyzer.js';
import {
  createAnalysis,
  updateAnalysisStatus,
  completeAnalysis,
  failAnalysis,
  saveMetrics,
} from '../db/database.js';
import { parseGitHubUrl, getRating } from '../utils/constants.js';
import logger from '../utils/logger.js';

/**
 * Main Analyzer Service (FREE)
 * Orchestrates all analysis steps
 */

class AnalyzerService {
  /**
   * Analyze a repository
   */
  async analyzeRepository(repoUrl) {
    const startTime = Date.now();
    let analysisRecord = null;

    try {
      // Parse GitHub URL
      const { owner, repo } = parseGitHubUrl(repoUrl);
      logger.info(`🎯 Starting analysis for: ${owner}/${repo}`);

      // Create analysis record
      analysisRecord = await createAnalysis({
        repoUrl,
        repoOwner: owner,
        repoName: repo,
      });

      const analysisId = analysisRecord.id;

      // Step 1: Fetch repository metadata (10%)
      await updateAnalysisStatus(analysisId, 'processing', 10, 'Fetching repository metadata...');
      const repoData = await githubService.getRepository(owner, repo);

      // Step 2: Fetch file tree (20%)
      await updateAnalysisStatus(analysisId, 'processing', 20, 'Fetching file structure...');
      const files = await githubService.getFileTree(owner, repo, repoData.defaultBranch);

      // Step 3: Fetch README (30%)
      await updateAnalysisStatus(analysisId, 'processing', 30, 'Analyzing documentation...');
      const readme = await githubService.getReadme(owner, repo);

      // Step 4: Fetch commit history (40%)
      await updateAnalysisStatus(analysisId, 'processing', 40, 'Analyzing Git practices...');
      const commits = await githubService.getCommits(owner, repo, 500);

      // Step 5: Fetch branches and PRs (50%)
      await updateAnalysisStatus(analysisId, 'processing', 50, 'Analyzing branch strategy...');
      const [branches, pullRequests, languages, contributors] = await Promise.all([
        githubService.getBranches(owner, repo),
        githubService.getPullRequests(owner, repo),
        githubService.getLanguages(owner, repo),
        githubService.getContributors(owner, repo),
      ]);

      // Step 6: Run all analyzers (60-80%)
      await updateAnalysisStatus(analysisId, 'processing', 60, 'Running code quality analysis...');

      const [
        codeQualityResult,
        structureResult,
        documentationResult,
        testingResult,
        gitPracticesResult,
        securityResult,
        cicdResult,
        dependenciesResult,
        containerizationResult,
      ] = await Promise.all([
        codeQualityAnalyzer.analyze(files),
        projectStructureAnalyzer.analyze(files),
        documentationAnalyzer.analyze(readme, files),
        testingAnalyzer.analyze(files),
        gitPracticesAnalyzer.analyze(commits, branches, pullRequests),
        securityAnalyzer.analyze(files, readme),
        cicdAnalyzer.analyze(files),
        dependenciesAnalyzer.analyze(files),
        containerizationAnalyzer.analyze(files),
      ]);

      // Step 7: Calculate total score (85%)
      await updateAnalysisStatus(analysisId, 'processing', 85, 'Calculating final score...');

      const totalScore = Math.round(
        codeQualityResult.score +
        structureResult.score +
        documentationResult.score +
        testingResult.score +
        gitPracticesResult.score +
        securityResult.score +
        cicdResult.score +
        dependenciesResult.score +
        containerizationResult.score
      );

      // Get rating and badge
      const { rating, badge } = getRating(totalScore);

      // Prepare metrics for AI
      const metrics = {
        totalScore,
        codeQualityScore: codeQualityResult.score,
        structureScore: structureResult.score,
        documentationScore: documentationResult.score,
        testingScore: testingResult.score,
        gitPracticesScore: gitPracticesResult.score,
        securityScore: securityResult.score,
        cicdScore: cicdResult.score,
        dependenciesScore: dependenciesResult.score,
        containerizationScore: containerizationResult.score,
        totalFiles: files.length,
        totalLines: files.reduce((sum, f) => sum + (f.size || 0), 0),
        codeFiles: codeQualityResult.details.totalCodeFiles || 0,
        testFiles: testingResult.details.totalTestFiles || 0,
        configFiles: 0, // Would need to count
        languages,
        frameworks: dependenciesResult.details.frameworks || [],
        buildTools: [], // Would detect from files
        testingFrameworks: testingResult.details.testingFrameworks || [],
        commitCount: commits.length,
        branchCount: branches.length,
        contributorCount: contributors.length,
        stars: repoData.stars,
        forks: repoData.forks,
        openIssues: repoData.openIssues,
        testCoverage: testingResult.details.testToCodeRatio || 0,
        testToCodeRatio: testingResult.details.testToCodeRatio || 0,
        readmeLength: documentationResult.details.readmeLength || 0,
        readmeSections: documentationResult.details.readmeSections || [],
        hasLicense: documentationResult.details.hasLicense || false,
        hasContributing: documentationResult.details.hasContributing || false,
        securityIssues: securityResult.details.securityIssues || [],
        vulnerableDependencies: 0,
        hasCicd: cicdResult.details.hasCICD || false,
        cicdPlatforms: cicdResult.details.platforms || [],
        hasDockerfile: containerizationResult.details.hasDockerfile || false,
        hasDockerCompose: containerizationResult.details.hasDockerCompose || false,
      };

      // Step 8: Generate AI summary (90%)
      await updateAnalysisStatus(analysisId, 'processing', 90, 'Generating AI summary...');
      const summary = await aiService.generateSummary(repoData, metrics);

      // Step 9: Generate AI roadmap (95%)
      await updateAnalysisStatus(analysisId, 'processing', 95, 'Creating personalized roadmap...');
      const roadmap = await aiService.generateRoadmap(repoData, metrics, summary);

      // Step 10: Save results (100%)
      await updateAnalysisStatus(analysisId, 'processing', 100, 'Finalizing results...');

      // Save metrics to database
      await saveMetrics(analysisId, metrics);

      // Complete analysis
      await completeAnalysis(analysisId, {
        score: totalScore,
        rating,
        badge,
        summary,
        roadmap,
      });

      const duration = Date.now() - startTime;
      logger.info(`✅ Analysis completed in ${duration}ms`, { analysisId, score: totalScore });

      return {
        id: analysisId,
        repoUrl,
        repoInfo: {
          name: repoData.name,
          owner: repoData.owner,
          description: repoData.description,
          language: repoData.language,
          stars: repoData.stars,
          forks: repoData.forks,
        },
        score: totalScore,
        rating,
        badge,
        summary,
        roadmap,
        metrics: {
          codeQuality: codeQualityResult.score,
          projectStructure: structureResult.score,
          documentation: documentationResult.score,
          testing: testingResult.score,
          gitPractices: gitPracticesResult.score,
          security: securityResult.score,
          cicd: cicdResult.score,
          dependencies: dependenciesResult.score,
          containerization: containerizationResult.score,
        },
        insights: {
          languages,
          frameworks: dependenciesResult.details.frameworks,
          testingFrameworks: testingResult.details.testingFrameworks,
          cicdPlatforms: cicdResult.details.platforms,
          hasCICD: cicdResult.details.hasCICD,
          hasDockerfile: containerizationResult.details.hasDockerfile,
          contributors: contributors.length,
        },
        analyzedAt: new Date(),
      };
    } catch (error) {
      logger.error('❌ Analysis failed:', error);
      
      if (analysisRecord) {
        await failAnalysis(analysisRecord.id, error.message);
      }

      throw error;
    }
  }
}

export default new AnalyzerService();
