import logger from '../utils/logger.js';

/**
 * Git Practices Analyzer (FREE)
 * Analyzes commit history, branching, and PR usage
 */

class GitPracticesAnalyzer {
  async analyze(commits, branches, pullRequests) {
    logger.info('📝 Analyzing Git practices...');

    const commitScore = this.analyzeCommits(commits);
    const branchScore = this.analyzeBranches(branches);
    const prScore = this.analyzePullRequests(pullRequests, commits);

    const totalScore = Math.round(
      commitScore * 0.50 +    // 6 points
      branchScore * 0.25 +    // 3 points
      prScore * 0.25          // 3 points
    );

    return {
      score: Math.min(totalScore, 12),
      details: {
        commitQuality: commitScore,
        branchStrategy: branchScore,
        pullRequests: prScore,
      },
    };
  }

  analyzeCommits(commits) {
    if (!commits || commits.length === 0) return 0;

    let score = 5; // Base score

    // Frequency
    if (commits.length >= 10) score += 2;
    if (commits.length >= 50) score += 2;
    if (commits.length >= 100) score += 1;

    // Message quality (check for conventional commits)
    const goodMessages = commits.filter(c => {
      const msg = c.message.toLowerCase();
      return (
        /^(feat|fix|docs|style|refactor|test|chore|perf):/.test(msg) ||
        /^(add|update|fix|remove|refactor|improve)/.test(msg)
      );
    });

    const messageQualityRatio = goodMessages.length / commits.length;
    if (messageQualityRatio >= 0.3) score += 2;
    if (messageQualityRatio >= 0.5) score += 2;
    if (messageQualityRatio >= 0.7) score += 1;

    return Math.max(Math.min(score, 12), 0);
  }

  analyzeBranches(branches) {
    if (!branches || branches.length === 0) return 5;

    let score = 5;

    if (branches.length >= 2) score += 3; // Using branches
    if (branches.length >= 5) score += 2; // Active development
    if (branches.length >= 10) score += 2; // Complex project

    // Check for protected branches
    const protectedBranches = branches.filter(b => b.protected);
    if (protectedBranches.length > 0) score += 2;

    return Math.max(Math.min(score, 12), 0);
  }

  analyzePullRequests(prs, commits) {
    if (!prs) return 3;

    let score = 3;

    if (prs.total > 0) score += 3;
    if (prs.total >= 5) score += 2;
    if (prs.total >= 10) score += 2;

    // Merge ratio
    if (prs.merged > 0 && prs.total > 0) {
      const mergeRatio = prs.merged / prs.total;
      if (mergeRatio >= 0.5) score += 2;
    }

    return Math.max(Math.min(score, 12), 0);
  }
}

export default new GitPracticesAnalyzer();
