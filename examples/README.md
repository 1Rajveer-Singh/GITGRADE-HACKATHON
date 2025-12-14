# GitGrade API Examples

This directory contains example scripts demonstrating how to use the GitGrade API with different tools.

## Available Examples

### 1. PowerShell Script (Windows)
**File:** `api-usage.ps1`

```powershell
# Run the examples
cd examples
.\api-usage.ps1
```

**Features:**
- Register for FREE API key
- Analyze repositories
- Get usage statistics
- Retrieve analysis history
- Batch analysis of multiple repos
- Health checks

---

### 2. Bash Script (Linux/Mac)
**File:** `api-usage.sh`

```bash
# Make executable
chmod +x examples/api-usage.sh

# Run the examples
cd examples
./api-usage.sh
```

**Requirements:**
- `curl` (pre-installed on most systems)
- `jq` for JSON parsing: `sudo apt-get install jq` (Linux) or `brew install jq` (Mac)

---

## Quick Start

### Register for API Key

**PowerShell:**
```powershell
$body = @{
    name = "Your Name"
    email = "your@email.com"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/keys/register" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

$apiKey = $response.data.apiKey
Write-Host "Your API Key: $apiKey"
```

**Bash/curl:**
```bash
curl -X POST http://localhost:5000/api/keys/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Your Name","email":"your@email.com"}' | jq
```

---

### Analyze a Repository

**PowerShell:**
```powershell
$headers = @{
    "X-API-Key" = "your_api_key_here"
    "Content-Type" = "application/json"
}

$body = @{
    repoUrl = "https://github.com/facebook/react"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/analyze" `
    -Method Post `
    -Body $body `
    -Headers $headers
```

**Bash/curl:**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{"repoUrl":"https://github.com/facebook/react"}' | jq
```

---

### Get Usage Statistics

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/keys/usage" `
    -Method Get `
    -Headers @{ "X-API-Key" = "your_api_key_here" }
```

**Bash/curl:**
```bash
curl -X GET http://localhost:5000/api/keys/usage \
  -H "X-API-Key: your_api_key_here" | jq
```

---

## API Endpoints Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/keys/register` | POST | Register for FREE API key |
| `/api/keys/usage` | GET | Get usage statistics |
| `/api/keys/deactivate` | POST | Deactivate your API key |
| `/api/keys/reactivate` | POST | Reactivate API key |

### Analysis

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Analyze a repository |
| `/api/analysis/:id` | GET | Get analysis by ID |
| `/api/history` | GET | Get analysis history |

### System

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/` | GET | API information |

---

## Rate Limits

### Without API Key (IP-based)
- **10 analyses per hour** per IP address
- Applies to `/api/analyze` endpoint only

### With FREE API Key
- **50 analyses per day**
- **1,000 analyses per month**
- Automatic resets (daily: 24h, monthly: 30d)
- Usage tracking and dashboard

---

## Example Responses

### Register API Key Response
```json
{
  "success": true,
  "message": "API key created successfully",
  "data": {
    "apiKey": "abc123...def789",
    "name": "John Doe",
    "email": "john@example.com",
    "limits": {
      "daily": 50,
      "monthly": 1000
    },
    "createdAt": "2025-12-14T10:30:00Z"
  }
}
```

### Analysis Response
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "score": 85,
    "rating": "Advanced",
    "badge": "Gold",
    "summary": "Excellent project with strong code quality...",
    "roadmap": [
      {
        "priority": "high",
        "title": "Add Integration Tests",
        "description": "Implement integration tests...",
        "estimatedTime": "3-4 hours"
      }
    ],
    "metrics": {
      "codeQuality": 18,
      "projectStructure": 14,
      "documentation": 13,
      "testing": 10,
      "gitPractices": 11,
      "security": 9,
      "cicd": 7,
      "dependencies": 5,
      "containerization": 3
    }
  }
}
```

### Usage Statistics Response
```json
{
  "success": true,
  "data": {
    "usage": {
      "total": 125,
      "today": 8,
      "thisMonth": 45
    },
    "limits": {
      "daily": 50,
      "monthly": 1000
    },
    "remaining": {
      "daily": 42,
      "monthly": 955
    }
  }
}
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": "Daily API limit reached",
  "limit": 50,
  "used": 50,
  "resetsIn": "14 hours"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid GitHub URL format"
}
```

---

## Tips & Best Practices

1. **Store API Keys Securely**
   - Never commit API keys to version control
   - Use environment variables or secure vaults
   - Rotate keys periodically

2. **Handle Rate Limits**
   - Check remaining quota before batch operations
   - Implement exponential backoff for retries
   - Use webhooks for async processing (future feature)

3. **Monitor Usage**
   - Check usage statistics regularly
   - Set up alerts for high usage
   - Plan batch operations accordingly

4. **Error Recovery**
   - Implement proper error handling
   - Retry failed requests with backoff
   - Log errors for debugging

5. **Performance**
   - Cache results when possible
   - Use batch operations for multiple repos
   - Schedule heavy operations during off-peak hours

---

## Need Help?

- **Documentation:** See [README.md](../README.md) and [SETUP.md](../SETUP.md)
- **API Details:** See [API_KEY_SYSTEM.md](../API_KEY_SYSTEM.md)
- **Issues:** Check troubleshooting sections in setup docs

---

_Happy analyzing with GitGrade! 🚀_
