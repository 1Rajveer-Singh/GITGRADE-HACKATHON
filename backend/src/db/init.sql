-- GitGrade Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Analyses table (main analysis results)
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repo_url VARCHAR(255) NOT NULL,
    repo_owner VARCHAR(100),
    repo_name VARCHAR(100),
    repo_description TEXT,
    
    -- Scores
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    rating VARCHAR(20), -- Beginner, Intermediate, Advanced
    badge VARCHAR(20),  -- Bronze, Silver, Gold
    
    -- AI Generated Content
    summary TEXT,
    roadmap JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    error_message TEXT,
    progress INTEGER DEFAULT 0,
    current_step VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    analyzed_at TIMESTAMP,
    
    -- Indexes
    CONSTRAINT unique_repo_analysis UNIQUE(repo_url, created_at)
);

CREATE INDEX IF NOT EXISTS idx_analyses_repo_url ON analyses(repo_url);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_analyses_score ON analyses(score);

-- Metrics table (detailed breakdown)
CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    
    -- Dimensional Scores (9 dimensions)
    code_quality_score DECIMAL(5,2),
    structure_score DECIMAL(5,2),
    documentation_score DECIMAL(5,2),
    testing_score DECIMAL(5,2),
    git_practices_score DECIMAL(5,2),
    security_score DECIMAL(5,2),
    cicd_score DECIMAL(5,2),
    dependencies_score DECIMAL(5,2),
    containerization_score DECIMAL(5,2),
    
    -- Repository Statistics
    total_files INTEGER,
    total_lines INTEGER,
    code_files INTEGER,
    test_files INTEGER,
    config_files INTEGER,
    
    -- Languages & Frameworks
    languages JSONB, -- {"JavaScript": 70, "CSS": 20, "HTML": 10}
    frameworks JSONB, -- ["React", "Express", "Jest"]
    build_tools JSONB, -- ["Vite", "npm"]
    testing_frameworks JSONB, -- ["Jest", "React Testing Library"]
    
    -- Git Statistics
    commit_count INTEGER,
    branch_count INTEGER,
    contributor_count INTEGER,
    stars INTEGER,
    forks INTEGER,
    open_issues INTEGER,
    
    -- Test Coverage
    test_coverage DECIMAL(5,2),
    test_to_code_ratio DECIMAL(5,2),
    
    -- Documentation
    readme_length INTEGER,
    readme_sections JSONB,
    has_license BOOLEAN DEFAULT FALSE,
    has_contributing BOOLEAN DEFAULT FALSE,
    
    -- Security
    security_issues JSONB, -- Array of detected issues
    vulnerable_dependencies INTEGER DEFAULT 0,
    
    -- CI/CD
    has_cicd BOOLEAN DEFAULT FALSE,
    cicd_platforms JSONB, -- ["GitHub Actions", "Travis CI"]
    
    -- Containerization
    has_dockerfile BOOLEAN DEFAULT FALSE,
    has_docker_compose BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metrics_analysis_id ON metrics(analysis_id);

-- Repository Cache (GitHub API responses)
CREATE TABLE IF NOT EXISTS repo_cache (
    id SERIAL PRIMARY KEY,
    repo_url VARCHAR(255) UNIQUE NOT NULL,
    cache_data JSONB,
    cached_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    
    CONSTRAINT valid_expiry CHECK (expires_at > cached_at)
);

CREATE INDEX IF NOT EXISTS idx_repo_cache_url ON repo_cache(repo_url);
CREATE INDEX IF NOT EXISTS idx_repo_cache_expires ON repo_cache(expires_at);

-- API Keys (for user authentication and rate limiting)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(100), -- User-friendly name
    email VARCHAR(255),
    
    -- Usage Limits
    daily_limit INTEGER DEFAULT 50, -- Analyses per day
    monthly_limit INTEGER DEFAULT 1000, -- Analyses per month
    
    -- Usage Tracking
    total_analyses INTEGER DEFAULT 0,
    daily_analyses INTEGER DEFAULT 0,
    monthly_analyses INTEGER DEFAULT 0,
    last_reset_daily TIMESTAMP DEFAULT NOW(),
    last_reset_monthly TIMESTAMP DEFAULT NOW(),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP, -- NULL for no expiry
    
    -- Metadata
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_email ON api_keys(email);

-- Usage Logs (detailed tracking per API key)
CREATE TABLE IF NOT EXISTS usage_logs (
    id SERIAL PRIMARY KEY,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
    
    -- Request Details
    ip_address VARCHAR(45),
    user_agent TEXT,
    endpoint VARCHAR(100),
    
    -- Response Details
    status_code INTEGER,
    response_time INTEGER, -- milliseconds
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_api_key ON usage_logs(api_key_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);

-- User Sessions (for rate limiting and tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    analysis_count INTEGER DEFAULT 0,
    last_analysis_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_ip ON user_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_sessions_api_key ON user_sessions(api_key_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

-- Analysis Queue (for background processing)
CREATE TABLE IF NOT EXISTS analysis_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    status VARCHAR(20) DEFAULT 'queued', -- queued, active, completed, failed
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON analysis_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_priority ON analysis_queue(priority DESC, created_at ASC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for analyses table
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE
    ON analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- INSERT INTO analyses (repo_url, repo_owner, repo_name, score, rating, badge, summary, roadmap, status, analyzed_at)
-- VALUES (
--     'https://github.com/facebook/react',
--     'facebook',
--     'react',
--     95,
--     'Advanced',
--     'Gold',
--     'Excellent open-source project with comprehensive testing and documentation.',
--     '[{"priority": "low", "title": "Minor improvements", "description": "Consider adding more examples"}]',
--     'completed',
--     NOW()
-- );

COMMIT;
