#!/usr/bin/env pwsh
# GitGrade API Usage Examples
# This script demonstrates how to use the GitGrade API with PowerShell

$API_BASE = "http://localhost:5000/api"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "=== GitGrade API Usage Examples ==="
Write-Host ""

# Example 1: Register for API Key
Write-Info "Example 1: Register for FREE API Key"
Write-Host ""

$registerData = @{
    name = "John Doe"
    email = "john.doe@example.com"
} | ConvertTo-Json

try {
    Write-Host "Registering user..."
    $response = Invoke-RestMethod -Uri "$API_BASE/keys/register" `
        -Method Post `
        -Body $registerData `
        -ContentType "application/json"
    
    $API_KEY = $response.data.apiKey
    Write-Success "✓ API Key created successfully!"
    Write-Host "API Key: $API_KEY"
    Write-Host "Daily Limit: $($response.data.limits.daily)"
    Write-Host "Monthly Limit: $($response.data.limits.monthly)"
    Write-Host ""
} catch {
    Write-Error "✗ Registration failed: $($_.Exception.Message)"
    Write-Info "Note: If email already registered, use existing key"
    Write-Host ""
    # Use a sample key for demonstration
    $API_KEY = "sample_key_for_demonstration"
}

# Example 2: Analyze a Repository
Write-Info "Example 2: Analyze a Repository"
Write-Host ""

$repoUrl = "https://github.com/facebook/react"
$analyzeData = @{
    repoUrl = $repoUrl
} | ConvertTo-Json

$headers = @{
    "X-API-Key" = $API_KEY
    "Content-Type" = "application/json"
}

try {
    Write-Host "Analyzing repository: $repoUrl"
    Write-Host "This may take 1-3 minutes..."
    Write-Host ""
    
    $analysisResponse = Invoke-RestMethod -Uri "$API_BASE/analyze" `
        -Method Post `
        -Body $analyzeData `
        -Headers $headers `
        -TimeoutSec 180
    
    Write-Success "✓ Analysis completed!"
    Write-Host ""
    Write-Host "Score: $($analysisResponse.data.score)/100"
    Write-Host "Rating: $($analysisResponse.data.rating)"
    Write-Host "Badge: $($analysisResponse.data.badge)"
    Write-Host ""
    Write-Host "Summary:"
    Write-Host $analysisResponse.data.summary
    Write-Host ""
    Write-Host "Metrics Breakdown:"
    $metrics = $analysisResponse.data.metrics
    Write-Host "  Code Quality: $($metrics.codeQuality)/20"
    Write-Host "  Structure: $($metrics.projectStructure)/15"
    Write-Host "  Documentation: $($metrics.documentation)/15"
    Write-Host "  Testing: $($metrics.testing)/12"
    Write-Host "  Git Practices: $($metrics.gitPractices)/12"
    Write-Host "  Security: $($metrics.security)/10"
    Write-Host "  CI/CD: $($metrics.cicd)/8"
    Write-Host "  Dependencies: $($metrics.dependencies)/5"
    Write-Host "  Containerization: $($metrics.containerization)/3"
    Write-Host ""
    
    $analysisId = $analysisResponse.data.id
} catch {
    Write-Error "✗ Analysis failed: $($_.Exception.Message)"
    Write-Host ""
}

# Example 3: Get Usage Statistics
Write-Info "Example 3: Get Usage Statistics"
Write-Host ""

try {
    $usageResponse = Invoke-RestMethod -Uri "$API_BASE/keys/usage" `
        -Method Get `
        -Headers @{ "X-API-Key" = $API_KEY }
    
    Write-Success "✓ Usage statistics retrieved!"
    Write-Host ""
    Write-Host "Total Analyses: $($usageResponse.data.usage.total)"
    Write-Host "Today: $($usageResponse.data.usage.today)/$($usageResponse.data.limits.daily)"
    Write-Host "This Month: $($usageResponse.data.usage.thisMonth)/$($usageResponse.data.limits.monthly)"
    Write-Host ""
    Write-Host "Remaining:"
    Write-Host "  Daily: $($usageResponse.data.remaining.daily)"
    Write-Host "  Monthly: $($usageResponse.data.remaining.monthly)"
    Write-Host ""
} catch {
    Write-Error "✗ Failed to get usage: $($_.Exception.Message)"
    Write-Host ""
}

# Example 4: Get Analysis by ID
if ($analysisId) {
    Write-Info "Example 4: Get Analysis by ID"
    Write-Host ""
    
    try {
        $getAnalysisResponse = Invoke-RestMethod -Uri "$API_BASE/analysis/$analysisId" `
            -Method Get `
            -Headers @{ "X-API-Key" = $API_KEY }
        
        Write-Success "✓ Analysis retrieved!"
        Write-Host "Status: $($getAnalysisResponse.data.status)"
        Write-Host "Analyzed at: $($getAnalysisResponse.data.analyzedAt)"
        Write-Host ""
    } catch {
        Write-Error "✗ Failed to get analysis: $($_.Exception.Message)"
        Write-Host ""
    }
}

# Example 5: Get Analysis History
Write-Info "Example 5: Get Analysis History"
Write-Host ""

try {
    $historyResponse = Invoke-RestMethod -Uri "$API_BASE/history?page=1&limit=5" `
        -Method Get `
        -Headers @{ "X-API-Key" = $API_KEY }
    
    Write-Success "✓ History retrieved!"
    Write-Host "Total Analyses: $($historyResponse.data.pagination.total)"
    Write-Host ""
    Write-Host "Recent Analyses:"
    foreach ($analysis in $historyResponse.data.analyses) {
        Write-Host "  - $($analysis.repoUrl) | Score: $($analysis.score) | $($analysis.createdAt)"
    }
    Write-Host ""
} catch {
    Write-Error "✗ Failed to get history: $($_.Exception.Message)"
    Write-Host ""
}

# Example 6: Analyze Multiple Repositories
Write-Info "Example 6: Batch Analysis (Multiple Repos)"
Write-Host ""

$repos = @(
    "https://github.com/vercel/next.js",
    "https://github.com/nodejs/node",
    "https://github.com/microsoft/vscode"
)

Write-Host "Analyzing $($repos.Count) repositories..."
Write-Host "(This will take several minutes)"
Write-Host ""

foreach ($repo in $repos) {
    try {
        Write-Host "Analyzing: $repo"
        $batchData = @{ repoUrl = $repo } | ConvertTo-Json
        
        $batchResponse = Invoke-RestMethod -Uri "$API_BASE/analyze" `
            -Method Post `
            -Body $batchData `
            -Headers $headers `
            -TimeoutSec 180
        
        Write-Success "  ✓ Score: $($batchResponse.data.score)/100 | Rating: $($batchResponse.data.rating)"
    } catch {
        Write-Error "  ✗ Failed: $($_.Exception.Message)"
    }
}
Write-Host ""

# Example 7: Health Check
Write-Info "Example 7: Health Check"
Write-Host ""

try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" `
        -Method Get
    
    Write-Success "✓ Service is healthy!"
    Write-Host "Status: $($healthResponse.status)"
    Write-Host "Database: $($healthResponse.database)"
    Write-Host "Uptime: $([math]::Round($healthResponse.uptime / 60, 2)) minutes"
    Write-Host ""
} catch {
    Write-Error "✗ Health check failed: $($_.Exception.Message)"
    Write-Host ""
}

Write-Info "=== Examples Complete ==="
Write-Host ""
Write-Host "Tips:"
Write-Host "1. Save your API key securely"
Write-Host "2. Use X-API-Key header for authenticated requests"
Write-Host "3. Monitor your usage with /api/keys/usage"
Write-Host "4. Daily limit resets every 24 hours"
Write-Host "5. Monthly limit resets every 30 days"
Write-Host ""
Write-Success "Happy analyzing! 🚀"
