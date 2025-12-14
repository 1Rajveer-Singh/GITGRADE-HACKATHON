# 🚀 GitGrade - Quick Start Guide

## ✅ Prerequisites

Before you begin, ensure you have installed:

- **Node.js 18+** (FREE) - [Download](https://nodejs.org/)
- **Docker Desktop** (FREE) - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** (FREE) - [Download](https://git-scm.com/)

## 🔑 Get Your FREE API Keys

### 1. GitHub Personal Access Token (Required)

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Give it a name: `GitGrade`
4. Select scope: ✅ **public_repo**
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)

**Rate Limits:**
- Without token: 60 requests/hour
- With token: 5000 requests/hour ✅

### 2. Google Gemini API Key (Required - FREE)

1. Go to: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. **Copy the API key**

**Free Tier Limits** (More than enough!):
- 15 requests per minute
- 1500 requests per day
- 1 million tokens per minute

## 📦 Installation Steps

### Option 1: Docker (Recommended - Easiest)

```powershell
# 1. Navigate to project directory
cd "c:\Users\rkste\Desktop\GitGrade Hackathon\gitgrade"

# 2. Create .env file (copy from example)
Copy-Item .env.example .env

# 3. Edit .env file and add your API keys
notepad .env

# Add your keys:
# GITHUB_TOKEN=ghp_your_token_here
# GEMINI_API_KEY=your_gemini_key_here

# 4. Start everything with Docker Compose
docker-compose up -d

# Wait ~30 seconds for services to start

# 5. Open your browser
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Health Check: http://localhost:5000/health
```

That's it! 🎉

### Option 2: Manual Setup (Development)

#### Step 1: Setup Backend

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
Copy-Item ../.env.example .env

# Edit .env and add your API keys
notepad .env

# Start PostgreSQL and Redis (using Docker)
cd ..
docker-compose up -d postgres redis

# Wait for database to be ready (~10 seconds)
Start-Sleep -Seconds 10

# Run database migrations
cd backend
npm run migrate

# Start backend server
npm run dev
```

Backend should now be running on **http://localhost:5000**

#### Step 2: Setup Frontend (New Terminal)

```powershell
# Open new terminal
# Navigate to frontend
cd "c:\Users\rkste\Desktop\GitGrade Hackathon\gitgrade\frontend"

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

Frontend should now be running on **http://localhost:3000**

## 🧪 Test the Application

### Get Your GitGrade API Key (Optional - Recommended)

1. Open http://localhost:3000
2. Click **"Setup API Key"** button in the header
3. Click **"Get Free Key"**
4. Enter your name and email
5. Copy the generated API key (64 characters)
6. Click **"Save API Key"**

**Benefits:**
- ✅ 50 analyses per day (vs 10/hour without key)
- ✅ 1000 analyses per month
- ✅ Usage tracking and dashboard
- ✅ 100% FREE forever!

**Or skip** to use IP-based rate limiting (10 analyses/hour)

### Test with Sample Repository

1. Open http://localhost:3000
2. Enter a GitHub URL: `https://github.com/vercel/next.js`
3. Click "Analyze Repository"
4. Wait 1-3 minutes for analysis
5. View your results! 🎊

### Test Backend API Directly

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get

# Register for API key
$registerBody = @{
    name = "Test User"
    email = "test@example.com"
} | ConvertTo-Json

$keyResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/keys/register" `
    -Method Post `
    -Body $registerBody `
    -ContentType "application/json"

$apiKey = $keyResponse.data.apiKey
Write-Host "Your API Key: $apiKey"

# Analyze a repository with API key
$body = @{
    repoUrl = "https://github.com/facebook/react"
} | ConvertTo-Json

$headers = @{
    "X-API-Key" = $apiKey
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/analyze" `
    -Method Post `
    -Body $body `
    -Headers $headers

# Check your usage
Invoke-RestMethod -Uri "http://localhost:5000/api/keys/usage" `
    -Method Get `
    -Headers @{ "X-API-Key" = $apiKey }
```

## 🐛 Troubleshooting

### Issue: "Database connection failed"

```powershell
# Check if PostgreSQL is running
docker ps | Select-String postgres

# If not running, start it
docker-compose up -d postgres

# Check logs
docker logs gitgrade-postgres
```

### Issue: "Redis connection failed"

```powershell
# Check if Redis is running
docker ps | Select-String redis

# If not running, start it
docker-compose up -d redis

# Check logs
docker logs gitgrade-redis
```

### Issue: "GitHub API rate limit exceeded"

- Make sure your `GITHUB_TOKEN` is set correctly in `.env`
- Without token: 60 requests/hour
- With token: 5000 requests/hour

### Issue: "GitGrade API limit reached"

**Without API Key:**
- Limited to 10 analyses per hour per IP
- Solution: Register for a FREE API key (50/day, 1000/month)

**With API Key:**
- Daily limit: 50 analyses
- Monthly limit: 1000 analyses
- Resets automatically
- Check usage: Click "Manage API Key" → View dashboard

### Issue: "Invalid API key"

- API keys must be exactly 64 hexadecimal characters
- Format: `/^[a-f0-9]{64}$/`
- Check for typos or extra spaces
- If lost, deactivate old key and register new one

### Issue: "AI service unavailable"

- Make sure your `GEMINI_API_KEY` is set correctly in `.env`
- The system will use fallback templates if AI fails
- Check Gemini API status: https://status.cloud.google.com/

### Issue: "Port already in use"

```powershell
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force

# Or change port in .env
# PORT=5001
```

## 📊 Verify Everything is Working

### Check All Services Status

```powershell
# Check Docker containers
docker ps

# You should see:
# - gitgrade-postgres
# - gitgrade-redis
# - gitgrade-backend (if using Docker)
# - gitgrade-frontend (if using Docker)
```

### Check Backend Health

```powershell
# This should return status: "ok"
Invoke-RestMethod -Uri "http://localhost:5000/health"
```

### Check Frontend

Open browser to http://localhost:3000 - You should see the GitGrade interface

## 🎯 Usage Examples

### Example 1: Analyze a Small Project

```
URL: https://github.com/username/small-project
Time: ~1 minute
```

### Example 2: Analyze a Medium Project

```
URL: https://github.com/vercel/next.js
Time: ~2 minutes
```

### Example 3: Analyze a Large Project (Limited)

```
URL: https://github.com/facebook/react
Time: ~3 minutes
Note: Limited to first 1000 files
```

## 🛑 Stopping the Application

### If using Docker:

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes (database data)
docker-compose down -v
```

### If running manually:

1. Press `Ctrl+C` in the backend terminal
2. Press `Ctrl+C` in the frontend terminal
3. Stop Docker containers:
```powershell
docker stop gitgrade-postgres gitgrade-redis
```

## 🔄 Restarting the Application

```powershell
# Quick restart (Docker)
docker-compose restart

# Or start from scratch
docker-compose down
docker-compose up -d
```

## 📝 Next Steps

1. ✅ Test with your own repositories
2. ✅ Review the analysis results
3. ✅ Implement the roadmap suggestions
4. ✅ Re-analyze to see improvements!

## 💡 Tips for Best Results

- **Use Public Repositories**: Private repos require additional authentication
- **Well-Established Projects**: Get better insights from mature projects
- **Wait Patiently**: Analysis takes 1-3 minutes depending on repository size
- **Check Logs**: If something fails, check backend logs: `docker logs gitgrade-backend`

## 🎓 Understanding Your Score

| Score | Rating | Badge | What It Means |
|-------|--------|-------|---------------|
| 76-100 | Advanced | 🥇 Gold | Excellent repository quality |
| 41-75 | Intermediate | 🥈 Silver | Good foundation, needs improvement |
| 0-40 | Beginner | 🥉 Bronze | Significant improvements needed |

## 📚 Additional Resources

- **GitHub API Docs**: https://docs.github.com/en/rest
- **Gemini API Docs**: https://ai.google.dev/docs
- **Docker Docs**: https://docs.docker.com/
- **React Docs**: https://react.dev/

## ❓ Need Help?

If you encounter issues:

1. Check the logs: `docker logs gitgrade-backend`
2. Verify environment variables in `.env`
3. Ensure all services are running: `docker ps`
4. Check firewall/antivirus settings
5. Restart Docker Desktop

---

**🎉 Congratulations! You're ready to analyze repositories!**

Visit http://localhost:3000 and start analyzing! 🚀
