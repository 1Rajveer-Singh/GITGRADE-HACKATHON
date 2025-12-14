// GitHub URL validation regex
export const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;

// File extensions by category
export const FILE_CATEGORIES = {
  code: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.rb', '.go', '.rs', '.php', '.swift', '.kt'],
  test: ['.test.js', '.test.ts', '.spec.js', '.spec.ts', '.test.py', '.spec.py', '_test.go', '_test.java'],
  config: ['.json', '.yml', '.yaml', '.toml', '.ini', '.xml', '.config', '.env', '.gitignore'],
  docs: ['.md', '.txt', '.rst', '.adoc'],
  style: ['.css', '.scss', '.sass', '.less', '.styl'],
  markup: ['.html', '.htm', '.xml', '.jsx', '.tsx'],
};

// Programming languages
export const LANGUAGES = {
  'JavaScript': ['.js', '.mjs', '.cjs'],
  'TypeScript': ['.ts'],
  'Python': ['.py'],
  'Java': ['.java'],
  'C++': ['.cpp', '.cc', '.cxx', '.hpp', '.h'],
  'C': ['.c', '.h'],
  'C#': ['.cs'],
  'Ruby': ['.rb'],
  'Go': ['.go'],
  'Rust': ['.rs'],
  'PHP': ['.php'],
  'Swift': ['.swift'],
  'Kotlin': ['.kt'],
  'HTML': ['.html', '.htm'],
  'CSS': ['.css'],
  'Shell': ['.sh', '.bash'],
};

// Framework detection patterns
export const FRAMEWORKS = {
  // JavaScript/TypeScript
  'React': ['react', '@types/react', 'react-dom'],
  'Vue': ['vue', 'nuxt'],
  'Angular': ['@angular/core', '@angular/cli'],
  'Next.js': ['next'],
  'Svelte': ['svelte'],
  'Express': ['express'],
  'NestJS': ['@nestjs/core'],
  'Fastify': ['fastify'],
  
  // Python
  'Django': ['django', 'Django'],
  'Flask': ['flask', 'Flask'],
  'FastAPI': ['fastapi'],
  'Streamlit': ['streamlit'],
  
  // Java
  'Spring Boot': ['spring-boot', 'springframework'],
  'Quarkus': ['quarkus'],
  
  // Build Tools
  'Webpack': ['webpack'],
  'Vite': ['vite'],
  'Rollup': ['rollup'],
  'Parcel': ['parcel'],
  'esbuild': ['esbuild'],
  
  // Testing
  'Jest': ['jest'],
  'Mocha': ['mocha'],
  'Vitest': ['vitest'],
  'PyTest': ['pytest'],
  'JUnit': ['junit'],
  'Testing Library': ['@testing-library'],
};

// CI/CD patterns
export const CICD_PATTERNS = {
  'GitHub Actions': ['.github/workflows', '.github/actions'],
  'GitLab CI': ['.gitlab-ci.yml'],
  'Travis CI': ['.travis.yml'],
  'CircleCI': ['.circleci/config.yml'],
  'Jenkins': ['Jenkinsfile'],
  'Azure Pipelines': ['azure-pipelines.yml'],
  'Bitbucket Pipelines': ['bitbucket-pipelines.yml'],
};

// Container patterns
export const CONTAINER_PATTERNS = {
  docker: ['Dockerfile', 'dockerfile', '.dockerfile'],
  dockerCompose: ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'],
  kubernetes: ['k8s/', 'kubernetes/', '.kube/'],
};

// Security patterns (potential issues)
export const SECURITY_PATTERNS = {
  secrets: [
    /api[_-]?key/i,
    /secret[_-]?key/i,
    /password/i,
    /passwd/i,
    /token/i,
    /access[_-]?token/i,
    /auth[_-]?token/i,
    /private[_-]?key/i,
    /client[_-]?secret/i,
    /aws[_-]?secret/i,
  ],
  sensitiveFiles: [
    '.env',
    'credentials.json',
    'secrets.yml',
    'private_key.pem',
    'id_rsa',
  ],
};

// README quality indicators
export const README_SECTIONS = [
  'Installation',
  'Usage',
  'Features',
  'Documentation',
  'Contributing',
  'License',
  'Tests',
  'API',
  'Examples',
  'Requirements',
  'Setup',
  'Getting Started',
];

// Error messages
export const ERROR_MESSAGES = {
  REPO_NOT_FOUND: 'Repository not found or is private',
  INVALID_URL: 'Invalid GitHub repository URL format',
  RATE_LIMIT: 'GitHub API rate limit exceeded. Please try again later.',
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  ANALYSIS_TIMEOUT: 'Analysis timeout. Repository may be too large.',
  REPO_TOO_LARGE: 'Repository too large for analysis',
  AI_SERVICE_ERROR: 'AI service temporarily unavailable',
  DATABASE_ERROR: 'Database error occurred',
  INVALID_REQUEST: 'Invalid request parameters',
};

// Rating thresholds
export const getRating = (score) => {
  if (score >= 76) return { rating: 'Advanced', badge: 'Gold' };
  if (score >= 41) return { rating: 'Intermediate', badge: 'Silver' };
  return { rating: 'Beginner', badge: 'Bronze' };
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Parse GitHub URL
export const parseGitHubUrl = (url) => {
  if (!GITHUB_URL_REGEX.test(url)) {
    throw new Error(ERROR_MESSAGES.INVALID_URL);
  }

  const match = url.match(/github\.com\/([\w-]+)\/([\w.-]+)/);
  if (!match) {
    throw new Error(ERROR_MESSAGES.INVALID_URL);
  }

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  };
};

// Delay helper
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry with exponential backoff
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delayMs = baseDelay * Math.pow(2, i);
      await delay(delayMs);
    }
  }
};

// Truncate text
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
};

export default {
  GITHUB_URL_REGEX,
  FILE_CATEGORIES,
  LANGUAGES,
  FRAMEWORKS,
  CICD_PATTERNS,
  CONTAINER_PATTERNS,
  SECURITY_PATTERNS,
  README_SECTIONS,
  ERROR_MESSAGES,
  getRating,
  formatFileSize,
  parseGitHubUrl,
  delay,
  retryWithBackoff,
  truncate,
  calculatePercentage,
};
