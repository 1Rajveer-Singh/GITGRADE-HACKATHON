#!/usr/bin/env pwsh
# GitGrade System Verification Script
# Validates that all components are properly configured and running

Write-Host "=== GitGrade System Validation ===" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0
$WarningCount = 0

# Helper functions
function Test-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Test-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
    $script:ErrorCount++
}

function Test-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
    $script:WarningCount++
}

function Test-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

# 1. Check Prerequisites
Write-Host "1. Checking Prerequisites..." -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -ge 18) {
            Test-Success "Node.js installed: $nodeVersion"
        } else {
            Test-Error "Node.js version too old: $nodeVersion (need v18+)"
        }
    }
} catch {
    Test-Error "Node.js not installed"
}

# Check Docker
try {
    $dockerVersion = docker --version
    Test-Success "Docker installed: $dockerVersion"
} catch {
    Test-Error "Docker not installed"
}

# Check Docker Compose
try {
    docker-compose --version | Out-Null
    Test-Success "Docker Compose installed"
} catch {
    Test-Error "Docker Compose not installed"
}

Write-Host ""

# 2. Check Project Structure
Write-Host "2. Checking Project Structure..." -ForegroundColor Cyan
Write-Host ""

$requiredFiles = @(
    ".env.example",
    "docker-compose.yml",
    "README.md",
    "backend/package.json",
    "backend/src/server.js",
    "backend/src/middleware/apiKey.middleware.js",
    "backend/src/routes/apiKey.routes.js",
    "backend/src/db/init.sql",
    "frontend/package.json",
    "frontend/src/App.jsx",
    "frontend/src/components/ApiKeyModal.jsx"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Test-Success "Found: $file"
    } else {
        Test-Error "Missing: $file"
    }
}

Write-Host ""

# 3. Check Environment Configuration
Write-Host "3. Checking Environment Configuration..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".env") {
    Test-Success ".env file exists"
    
    $envContent = Get-Content ".env" -Raw
    
    # Check for required variables
    if ($envContent -match "GITHUB_TOKEN=\w+") {
        Test-Success "GITHUB_TOKEN configured"
    } else {
        Test-Warning "GITHUB_TOKEN not configured (analysis will be limited)"
    }
    
    if ($envContent -match "GEMINI_API_KEY=\w+") {
        Test-Success "GEMINI_API_KEY configured"
    } else {
        Test-Warning "GEMINI_API_KEY not configured (will use fallback summaries)"
    }
    
    if ($envContent -match "DB_PASSWORD=\w+") {
        Test-Success "DB_PASSWORD configured"
    } else {
        Test-Error "DB_PASSWORD not configured"
    }
} else {
    Test-Error ".env file missing (copy from .env.example)"
}

Write-Host ""

# 4. Check Docker Services
Write-Host "4. Checking Docker Services..." -ForegroundColor Cyan
Write-Host ""

try {
    $containers = docker ps --format "{{.Names}}" 2>$null
    
    $expectedContainers = @("gitgrade-postgres", "gitgrade-redis", "gitgrade-backend", "gitgrade-frontend")
    
    foreach ($container in $expectedContainers) {
        if ($containers -contains $container) {
            Test-Success "Container running: $container"
        } else {
            Test-Warning "Container not running: $container"
        }
    }
} catch {
    Test-Warning "Unable to check Docker containers (Docker may not be running)"
}

Write-Host ""

# 5. Check Backend API
Write-Host "5. Checking Backend API..." -ForegroundColor Cyan
Write-Host ""

try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 5
    
    if ($healthResponse.status -eq "ok") {
        Test-Success "Backend API is responding"
        Test-Info "  Database: $($healthResponse.database)"
        Test-Info "  Uptime: $([math]::Round($healthResponse.uptime / 60, 2)) minutes"
    } else {
        Test-Error "Backend API returned unhealthy status"
    }
    
    # Check API endpoints
    try {
        $apiResponse = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get -TimeoutSec 5
        if ($apiResponse.name -eq "GitGrade API") {
            Test-Success "API root endpoint accessible"
            Test-Info "  Version: $($apiResponse.version)"
        }
    } catch {
        Test-Warning "API root endpoint not accessible"
    }
} catch {
    Test-Error "Backend API not responding (check if server is running)"
}

Write-Host ""

# 6. Check Frontend
Write-Host "6. Checking Frontend..." -ForegroundColor Cyan
Write-Host ""

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 5 -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Test-Success "Frontend is accessible"
    }
} catch {
    Test-Error "Frontend not accessible (check if dev server is running)"
}

Write-Host ""

# 7. Database Schema Validation
Write-Host "7. Checking Database Schema..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".env") {
    $envVars = Get-Content ".env" | Where-Object { $_ -match "^DB_" }
    
    try {
        # This is a simplified check - in production, you'd connect to DB
        Test-Info "Database configuration found in .env"
        Test-Info "Run 'docker-compose exec postgres psql -U gitgrade_user -d gitgrade -c \"\dt\"' to verify tables"
    } catch {
        Test-Warning "Unable to verify database schema"
    }
}

Write-Host ""

# 8. Test API Key Functionality
Write-Host "8. Testing API Key System..." -ForegroundColor Cyan
Write-Host ""

try {
    $testEmail = "test_$(Get-Random)@example.com"
    $registerData = @{
        name = "Test User"
        email = $testEmail
    } | ConvertTo-Json
    
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/keys/register" `
        -Method Post `
        -Body $registerData `
        -ContentType "application/json" `
        -TimeoutSec 10
    
    if ($registerResponse.success -and $registerResponse.data.apiKey) {
        Test-Success "API key registration working"
        Test-Info "  Generated key format: $($registerResponse.data.apiKey.Substring(0, 16))..."
        
        $apiKey = $registerResponse.data.apiKey
        
        # Test usage endpoint
        try {
            $usageResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/keys/usage" `
                -Method Get `
                -Headers @{ "X-API-Key" = $apiKey } `
                -TimeoutSec 5
            
            if ($usageResponse.success) {
                Test-Success "API key usage tracking working"
                Test-Info "  Daily limit: $($usageResponse.data.limits.daily)"
                Test-Info "  Monthly limit: $($usageResponse.data.limits.monthly)"
            }
        } catch {
            Test-Warning "API key usage endpoint failed"
        }
    }
} catch {
    Test-Error "API key registration failed: $($_.Exception.Message)"
}

Write-Host ""

# Summary
Write-Host "=== Validation Summary ===" -ForegroundColor Cyan
Write-Host ""

if ($ErrorCount -eq 0 -and $WarningCount -eq 0) {
    Write-Host "✓ All checks passed! System is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open http://localhost:3000 in your browser"
    Write-Host "2. Register for a FREE API key"
    Write-Host "3. Start analyzing repositories!"
} elseif ($ErrorCount -eq 0) {
    Write-Host "⚠ System functional but with $WarningCount warning(s)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can proceed, but some features may be limited."
    Write-Host "Review warnings above for details."
} else {
    Write-Host "✗ Found $ErrorCount error(s) and $WarningCount warning(s)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the errors above before proceeding."
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "1. Copy .env.example to .env and add API keys"
    Write-Host "2. Run: docker-compose up -d"
    Write-Host "3. Wait 30 seconds for services to start"
    Write-Host "4. Run this script again"
}

Write-Host ""
Write-Host "For detailed setup instructions, see SETUP.md" -ForegroundColor Cyan
