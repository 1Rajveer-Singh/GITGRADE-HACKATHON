import pkg from 'pg';
const { Pool } = pkg;
import config from '../config/config.js';
import logger from '../utils/logger.js';

// Create PostgreSQL connection pool
const pool = new Pool(config.database);

// Test connection
pool.on('connect', () => {
  logger.info('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('❌ Unexpected PostgreSQL error:', err);
  process.exit(-1);
});

// Database query helper
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query error:', { text, error: error.message });
    throw error;
  }
};

// Get a client from the pool
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    logger.error('A client has been checked out for more than 5 seconds!');
  }, 5000);

  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

// Database helper functions

// Create analysis record
export const createAnalysis = async (data) => {
  const {
    repoUrl,
    repoOwner,
    repoName,
    repoDescription = null,
  } = data;

  const result = await query(
    `INSERT INTO analyses (repo_url, repo_owner, repo_name, repo_description, status, progress, score)
     VALUES ($1, $2, $3, $4, 'pending', 0, 0)
     RETURNING *`,
    [repoUrl, repoOwner, repoName, repoDescription]
  );

  return result.rows[0];
};

// Update analysis status
export const updateAnalysisStatus = async (id, status, progress, currentStep) => {
  const result = await query(
    `UPDATE analyses
     SET status = $1, progress = $2, current_step = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [status, progress, currentStep, id]
  );

  return result.rows[0];
};

// Complete analysis
export const completeAnalysis = async (id, data) => {
  const {
    score,
    rating,
    badge,
    summary,
    roadmap,
  } = data;

  const result = await query(
    `UPDATE analyses
     SET score = $1, rating = $2, badge = $3, summary = $4, roadmap = $5,
         status = 'completed', progress = 100, analyzed_at = NOW(), updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [score, rating, badge, summary, JSON.stringify(roadmap), id]
  );

  return result.rows[0];
};

// Fail analysis
export const failAnalysis = async (id, errorMessage) => {
  const result = await query(
    `UPDATE analyses
     SET status = 'failed', error_message = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [errorMessage, id]
  );

  return result.rows[0];
};

// Get analysis by ID
export const getAnalysisById = async (id) => {
  const result = await query(
    `SELECT a.*, m.* FROM analyses a
     LEFT JOIN metrics m ON a.id = m.analysis_id
     WHERE a.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

// Get analysis history
export const getAnalysisHistory = async (limit = 10, offset = 0) => {
  const result = await query(
    `SELECT id, repo_url, repo_owner, repo_name, score, rating, badge, status, created_at, analyzed_at
     FROM analyses
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
};

// Save metrics
export const saveMetrics = async (analysisId, metrics) => {
  const {
    codeQualityScore,
    structureScore,
    documentationScore,
    testingScore,
    gitPracticesScore,
    securityScore,
    cicdScore,
    dependenciesScore,
    containerizationScore,
    totalFiles,
    totalLines,
    codeFiles,
    testFiles,
    configFiles,
    languages,
    frameworks,
    buildTools,
    testingFrameworks,
    commitCount,
    branchCount,
    contributorCount,
    stars,
    forks,
    openIssues,
    testCoverage,
    testToCodeRatio,
    readmeLength,
    readmeSections,
    hasLicense,
    hasContributing,
    securityIssues,
    vulnerableDependencies,
    hasCicd,
    cicdPlatforms,
    hasDockerfile,
    hasDockerCompose,
  } = metrics;

  const result = await query(
    `INSERT INTO metrics (
      analysis_id, code_quality_score, structure_score, documentation_score,
      testing_score, git_practices_score, security_score, cicd_score,
      dependencies_score, containerization_score, total_files, total_lines,
      code_files, test_files, config_files, languages, frameworks, build_tools,
      testing_frameworks, commit_count, branch_count, contributor_count,
      stars, forks, open_issues, test_coverage, test_to_code_ratio,
      readme_length, readme_sections, has_license, has_contributing,
      security_issues, vulnerable_dependencies, has_cicd, cicd_platforms,
      has_dockerfile, has_docker_compose
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
      $29, $30, $31, $32, $33, $34, $35, $36, $37
    ) RETURNING *`,
    [
      analysisId,
      codeQualityScore,
      structureScore,
      documentationScore,
      testingScore,
      gitPracticesScore,
      securityScore,
      cicdScore,
      dependenciesScore,
      containerizationScore,
      totalFiles,
      totalLines,
      codeFiles,
      testFiles,
      configFiles,
      JSON.stringify(languages),
      JSON.stringify(frameworks),
      JSON.stringify(buildTools),
      JSON.stringify(testingFrameworks),
      commitCount,
      branchCount,
      contributorCount,
      stars,
      forks,
      openIssues,
      testCoverage,
      testToCodeRatio,
      readmeLength,
      JSON.stringify(readmeSections),
      hasLicense,
      hasContributing,
      JSON.stringify(securityIssues),
      vulnerableDependencies,
      hasCicd,
      JSON.stringify(cicdPlatforms),
      hasDockerfile,
      hasDockerCompose,
    ]
  );

  return result.rows[0];
};

// Get or create cache
export const getCachedRepo = async (repoUrl) => {
  const result = await query(
    `SELECT cache_data FROM repo_cache
     WHERE repo_url = $1 AND expires_at > NOW()`,
    [repoUrl]
  );

  return result.rows.length > 0 ? result.rows[0].cache_data : null;
};

// Save cache
export const setCachedRepo = async (repoUrl, data, expirySeconds = 3600) => {
  await query(
    `INSERT INTO repo_cache (repo_url, cache_data, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '${expirySeconds} seconds')
     ON CONFLICT (repo_url)
     DO UPDATE SET cache_data = $2, cached_at = NOW(), expires_at = NOW() + INTERVAL '${expirySeconds} seconds'`,
    [repoUrl, JSON.stringify(data)]
  );
};

// Track user session
export const trackUserSession = async (ipAddress, userAgent) => {
  const result = await query(
    `INSERT INTO user_sessions (ip_address, user_agent, analysis_count, last_analysis_at, last_activity)
     VALUES ($1, $2, 1, NOW(), NOW())
     ON CONFLICT (ip_address)
     DO UPDATE SET
       analysis_count = user_sessions.analysis_count + 1,
       last_analysis_at = NOW(),
       last_activity = NOW()
     RETURNING *`,
    [ipAddress, userAgent]
  );

  return result.rows[0];
};

// Get user session
export const getUserSession = async (ipAddress) => {
  const result = await query(
    `SELECT * FROM user_sessions WHERE ip_address = $1`,
    [ipAddress]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

// Cleanup old cache
export const cleanupOldCache = async () => {
  await query(`DELETE FROM repo_cache WHERE expires_at < NOW()`);
};

// Test database connection
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    logger.info('✅ Database connection test successful', { time: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('❌ Database connection test failed', error);
    return false;
  }
};

export default {
  query,
  getClient,
  pool,
  createAnalysis,
  updateAnalysisStatus,
  completeAnalysis,
  failAnalysis,
  getAnalysisById,
  getAnalysisHistory,
  saveMetrics,
  getCachedRepo,
  setCachedRepo,
  trackUserSession,
  getUserSession,
  cleanupOldCache,
  testConnection,
};
