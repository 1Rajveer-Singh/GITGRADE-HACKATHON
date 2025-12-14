import { Octokit } from '@octokit/rest';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import { ERROR_MESSAGES, retryWithBackoff } from '../utils/constants.js';
import { getCachedRepo, setCachedRepo } from '../db/database.js';

// Initialize Octokit (GitHub API client) - FREE with token
const octokit = new Octokit({
  auth: config.github.token,
  userAgent: 'GitGrade-Analyzer v1.0.0',
  baseUrl: 'https://api.github.com',
});

class GitHubService {
  /**
   * Get repository metadata
   * FREE - GitHub API allows 5000 requests/hour with token
   */
  async getRepository(owner, repo) {
    try {
      logger.info(`Fetching repository: ${owner}/${repo}`);

      // Check cache first
      const cacheKey = `${owner}/${repo}`;
      const cached = await getCachedRepo(cacheKey);
      if (cached) {
        logger.info('Using cached repository data');
        return cached;
      }

      // Fetch from GitHub with retry logic
      const { data } = await retryWithBackoff(async () => {
        return await octokit.repos.get({ owner, repo });
      });

      const repoData = {
        name: data.name,
        fullName: data.full_name,
        owner: data.owner.login,
        description: data.description,
        language: data.language,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        size: data.size,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        defaultBranch: data.default_branch,
        isPrivate: data.private,
        hasIssues: data.has_issues,
        hasProjects: data.has_projects,
        hasWiki: data.has_wiki,
        homepage: data.homepage,
        license: data.license?.name || null,
      };

      // Cache for 1 hour
      await setCachedRepo(cacheKey, repoData, 3600);

      return repoData;
    } catch (error) {
      if (error.status === 404) {
        throw new Error(ERROR_MESSAGES.REPO_NOT_FOUND);
      }
      if (error.status === 403 && error.message.includes('rate limit')) {
        throw new Error(ERROR_MESSAGES.RATE_LIMIT);
      }
      logger.error('Error fetching repository:', error);
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  /**
   * Get repository file tree
   * FREE - Part of GitHub API
   */
  async getFileTree(owner, repo, branch = 'main') {
    try {
      logger.info(`Fetching file tree for: ${owner}/${repo}@${branch}`);

      const { data } = await retryWithBackoff(async () => {
        return await octokit.git.getTree({
          owner,
          repo,
          tree_sha: branch,
          recursive: 'true',
        });
      });

      // Limit to MAX_FILES to prevent timeout
      const files = data.tree.slice(0, config.analysis.maxFiles);

      logger.info(`Fetched ${files.length} files (truncated: ${data.tree.length > config.analysis.maxFiles})`);

      return files.map(file => ({
        path: file.path,
        type: file.type,
        size: file.size,
        sha: file.sha,
        url: file.url,
      }));
    } catch (error) {
      // Try with 'master' branch if 'main' fails
      if (branch === 'main') {
        logger.warn('Branch "main" not found, trying "master"');
        return this.getFileTree(owner, repo, 'master');
      }
      
      logger.error('Error fetching file tree:', error);
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  /**
   * Get file content
   * FREE - GitHub API
   */
  async getFileContent(owner, repo, path) {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if (data.type !== 'file') {
        return null;
      }

      // Decode base64 content
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return content;
    } catch (error) {
      logger.warn(`Could not fetch file content: ${path}`, error.message);
      return null;
    }
  }

  /**
   * Get README content
   * FREE - GitHub API
   */
  async getReadme(owner, repo) {
    try {
      logger.info(`Fetching README for: ${owner}/${repo}`);

      const { data } = await retryWithBackoff(async () => {
        return await octokit.repos.getReadme({ owner, repo });
      });

      const content = Buffer.from(data.content, 'base64').toString('utf-8');

      // Truncate if too long
      const truncatedContent = content.length > config.analysis.maxReadmeLength
        ? content.substring(0, config.analysis.maxReadmeLength)
        : content;

      return {
        content: truncatedContent,
        name: data.name,
        path: data.path,
        size: data.size,
      };
    } catch (error) {
      logger.warn('README not found');
      return null;
    }
  }

  /**
   * Get commit history
   * FREE - GitHub API
   */
  async getCommits(owner, repo, maxCommits = 100) {
    try {
      logger.info(`Fetching commits for: ${owner}/${repo}`);

      const commits = [];
      let page = 1;
      const perPage = 100;

      while (commits.length < maxCommits) {
        const { data } = await octokit.repos.listCommits({
          owner,
          repo,
          per_page: perPage,
          page,
        });

        if (data.length === 0) break;

        commits.push(...data.slice(0, maxCommits - commits.length));

        if (data.length < perPage || commits.length >= maxCommits) break;
        page++;
      }

      return commits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
      }));
    } catch (error) {
      logger.error('Error fetching commits:', error);
      return [];
    }
  }

  /**
   * Get branches
   * FREE - GitHub API
   */
  async getBranches(owner, repo) {
    try {
      const { data } = await octokit.repos.listBranches({
        owner,
        repo,
        per_page: 100,
      });

      return data.map(branch => ({
        name: branch.name,
        protected: branch.protected,
        commit: branch.commit.sha,
      }));
    } catch (error) {
      logger.error('Error fetching branches:', error);
      return [];
    }
  }

  /**
   * Get pull requests
   * FREE - GitHub API
   */
  async getPullRequests(owner, repo) {
    try {
      const { data } = await octokit.pulls.list({
        owner,
        repo,
        state: 'all',
        per_page: 100,
      });

      return {
        total: data.length,
        open: data.filter(pr => pr.state === 'open').length,
        closed: data.filter(pr => pr.state === 'closed').length,
        merged: data.filter(pr => pr.merged_at !== null).length,
      };
    } catch (error) {
      logger.error('Error fetching pull requests:', error);
      return { total: 0, open: 0, closed: 0, merged: 0 };
    }
  }

  /**
   * Get contributors
   * FREE - GitHub API
   */
  async getContributors(owner, repo) {
    try {
      const { data } = await octokit.repos.listContributors({
        owner,
        repo,
        per_page: 100,
      });

      return data.map(contributor => ({
        username: contributor.login,
        contributions: contributor.contributions,
        avatar: contributor.avatar_url,
      }));
    } catch (error) {
      logger.error('Error fetching contributors:', error);
      return [];
    }
  }

  /**
   * Get languages
   * FREE - GitHub API
   */
  async getLanguages(owner, repo) {
    try {
      const { data } = await octokit.repos.listLanguages({ owner, repo });
      
      // Calculate percentages
      const total = Object.values(data).reduce((sum, bytes) => sum + bytes, 0);
      const languages = {};

      for (const [lang, bytes] of Object.entries(data)) {
        languages[lang] = Math.round((bytes / total) * 100 * 100) / 100;
      }

      return languages;
    } catch (error) {
      logger.error('Error fetching languages:', error);
      return {};
    }
  }

  /**
   * Check if file exists
   * FREE - GitHub API
   */
  async fileExists(owner, repo, path) {
    try {
      await octokit.repos.getContent({ owner, repo, path });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get rate limit status
   * FREE - GitHub API
   */
  async getRateLimit() {
    try {
      const { data } = await octokit.rateLimit.get();
      return {
        limit: data.rate.limit,
        remaining: data.rate.remaining,
        reset: new Date(data.rate.reset * 1000),
      };
    } catch (error) {
      logger.error('Error fetching rate limit:', error);
      return null;
    }
  }
}

export default new GitHubService();
