# GitGrade API Test Suite
Write-Host "`n=== GitGrade API Testing ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000"
$tests = @{
    passed = 0
    failed = 0
}

# Test 1: Health Endpoint
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 10
    if ($health.status -eq "ok") {
        Write-Host "   ✅ PASSED - Status: $($health.status), DB: $($health.database)" -ForegroundColor Green
        $tests.passed++
    } else {
        Write-Host "   ❌ FAILED - Unexpected status" -ForegroundColor Red
        $tests.failed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $tests.failed++
}

# Test 2: API Root
Write-Host "`n2. Testing API Root Endpoint..." -ForegroundColor Yellow
try {
    $root = Invoke-RestMethod -Uri "$baseUrl/" -Method Get -TimeoutSec 10
    if ($root.name -eq "GitGrade API") {
        Write-Host "   ✅ PASSED - API: $($root.name) v$($root.version)" -ForegroundColor Green
        $tests.passed++
    } else {
        Write-Host "   ❌ FAILED - Unexpected response" -ForegroundColor Red
        $tests.failed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $tests.failed++
}

# Test 3: API Key Registration
Write-Host "`n3. Testing API Key Registration..." -ForegroundColor Yellow
try {
    $email = "test$(Get-Random)@example.com"
    $body = @{ name = "Test User"; email = $email } | ConvertTo-Json
    $reg = Invoke-RestMethod -Uri "$baseUrl/api/keys/register" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10
    if ($reg.success -and $reg.data.apiKey) {
        Write-Host "   ✅ PASSED - Key: $($reg.data.apiKey.Substring(0,16))..." -ForegroundColor Green
        Write-Host "   ℹ️  Limits: $($reg.data.limits.daily)/day, $($reg.data.limits.monthly)/month" -ForegroundColor Cyan
        $global:testKey = $reg.data.apiKey
        $tests.passed++
    } else {
        Write-Host "   ❌ FAILED - Registration unsuccessful" -ForegroundColor Red
        $tests.failed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $tests.failed++
}

# Test 4: API Key Usage
Write-Host "`n4. Testing API Key Usage Endpoint..." -ForegroundColor Yellow
try {
    $headers = @{ "X-API-Key" = $global:testKey }
    $usage = Invoke-RestMethod -Uri "$baseUrl/api/keys/usage" -Method Get -Headers $headers -TimeoutSec 10
    if ($usage.success) {
        Write-Host "   ✅ PASSED - Usage: $($usage.data.usage.today)/day, $($usage.data.usage.thisMonth)/month" -ForegroundColor Green
        Write-Host "   ℹ️  Remaining: $($usage.data.remaining.daily) today, $($usage.data.remaining.monthly) this month" -ForegroundColor Cyan
        $tests.passed++
    } else {
        Write-Host "   ❌ FAILED - Usage check unsuccessful" -ForegroundColor Red
        $tests.failed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $tests.failed++
}

# Test 5: Repository Analysis (Small Test Repo)
Write-Host "`n5. Testing Repository Analysis..." -ForegroundColor Yellow
Write-Host "   ⏳ Analyzing: octocat/Spoon-Knife (this may take 30-90 seconds)..." -ForegroundColor Cyan
try {
    $body = @{ repoUrl = "https://github.com/octocat/Spoon-Knife" } | ConvertTo-Json
    $headers = @{ "X-API-Key" = $global:testKey }
    $analysis = Invoke-RestMethod -Uri "$baseUrl/api/analyze" -Method Post -Body $body -ContentType "application/json" -Headers $headers -TimeoutSec 180
    
    if ($analysis.success -and $analysis.data.score -ne $null) {
        Write-Host "   ✅ PASSED - Analysis completed!" -ForegroundColor Green
        Write-Host "   ℹ️  Score: $($analysis.data.score)/900" -ForegroundColor Cyan
        Write-Host "   ℹ️  Rating: $($analysis.data.rating)" -ForegroundColor Cyan
        Write-Host "   ℹ️  Badge: $($analysis.data.badge)" -ForegroundColor Cyan
        Write-Host "   ℹ️  Summary: $($analysis.data.summary.Substring(0, [Math]::Min(100, $analysis.data.summary.Length)))..." -ForegroundColor Cyan
        Write-Host "   ℹ️  Roadmap items: $($analysis.data.roadmap.Count)" -ForegroundColor Cyan
        $global:analysisId = $analysis.data.id
        $tests.passed++
    } else {
        Write-Host "   ❌ FAILED - Analysis incomplete" -ForegroundColor Red
        $tests.failed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   ℹ️  Checking backend logs..." -ForegroundColor Yellow
    docker logs gitgrade-backend --tail 20
    $tests.failed++
}

# Test 6: Get Analysis by ID
if ($global:analysisId) {
    Write-Host "`n6. Testing Get Analysis by ID..." -ForegroundColor Yellow
    try {
        $getAnalysis = Invoke-RestMethod -Uri "$baseUrl/api/analysis/$($global:analysisId)" -Method Get -TimeoutSec 10
        if ($getAnalysis.success) {
            Write-Host "   ✅ PASSED - Retrieved analysis: $($getAnalysis.data.repoInfo.name)" -ForegroundColor Green
            $tests.passed++
        } else {
            Write-Host "   ❌ FAILED - Could not retrieve analysis" -ForegroundColor Red
            $tests.failed++
        }
    } catch {
        Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $tests.failed++
    }
}

# Test 7: Get Analysis History
Write-Host "`n7. Testing Analysis History..." -ForegroundColor Yellow
try {
    $history = Invoke-RestMethod -Uri "$baseUrl/api/history?limit=5" -Method Get -TimeoutSec 10
    if ($history.success) {
        Write-Host "   ✅ PASSED - Found $($history.data.analyses.Count) recent analyses" -ForegroundColor Green
        $tests.passed++
    } else {
        Write-Host "   ❌ FAILED - Could not retrieve history" -ForegroundColor Red
        $tests.failed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $tests.failed++
}

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "✅ Passed: $($tests.passed)" -ForegroundColor Green
Write-Host "❌ Failed: $($tests.failed)" -ForegroundColor Red
Write-Host ""

if ($tests.failed -eq 0) {
    Write-Host "🎉 All tests passed! System is working perfectly." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check logs above for details." -ForegroundColor Yellow
}

Write-Host ""
