# Vercel Deployment Guide

## 🚨 Important: Split Deployment Architecture

GitGrade is a full-stack application that requires **separate deployments**:
- **Frontend** → Deploy to Vercel (this guide)
- **Backend + Database** → Deploy to Render/Railway/Fly.io (see below)

## 📋 Prerequisites

1. Vercel account (free tier works)
2. Backend deployed separately (Render/Railway recommended)
3. Environment variables configured

---

## Part 1: Deploy Backend (Choose One Platform)

### Option A: Deploy to Render.com (Recommended - Free Tier)

1. **Go to [Render.com](https://render.com)** and sign up
2. **Create PostgreSQL Database**:
   - Click "New +" → "PostgreSQL"
   - Name: `gitgrade-db`
   - Free tier is sufficient
   - Note the **Internal Database URL**

3. **Create Redis Instance**:
   - Click "New +" → "Redis"
   - Name: `gitgrade-redis`
   - Free tier (25MB)
   - Note the **Internal Redis URL**

4. **Deploy Backend**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repo: `1Rajveer-Singh/GITGRADE-HACKATHON`
   - Configure:
     ```
     Name: gitgrade-backend
     Region: Choose closest to you
     Branch: main
     Root Directory: backend
     Runtime: Node
     Build Command: npm install
     Start Command: node src/server.js
     ```
   
5. **Add Environment Variables** in Render dashboard:
   ```
   NODE_ENV=production
   PORT=5000
   GITHUB_TOKEN=your_github_token_here
   GEMINI_API_KEY=your_gemini_key_here
   DB_HOST=<internal-postgres-host>
   DB_PORT=5432
   DB_NAME=gitgrade
   DB_USER=<postgres-user>
   DB_PASSWORD=<postgres-password>
   REDIS_HOST=<internal-redis-host>
   REDIS_PORT=6379
   MAX_FILES=1000
   MAX_FILE_SIZE=1048576
   ANALYSIS_TIMEOUT=180000
   RATE_LIMIT_WINDOW_MS=3600000
   RATE_LIMIT_MAX_REQUESTS=10
   API_KEY_DAILY_LIMIT=50
   API_KEY_MONTHLY_LIMIT=1000
   ```

6. **Note your Backend URL**: `https://gitgrade-backend.onrender.com`

### Option B: Deploy to Railway.app

1. Go to [Railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Select repository and backend folder
4. Add PostgreSQL and Redis plugins
5. Configure environment variables (same as above)
6. Deploy and note the URL

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend Configuration

The `vercel.json` file is already created. Update it with your backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-BACKEND-URL.onrender.com/api/:path*"
    }
  ]
}
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository: `1Rajveer-Singh/GITGRADE-HACKATHON`
4. Configure Project:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Add Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com`
   - Apply to: Production, Preview, Development

6. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project
cd "c:\Users\rkste\Desktop\GitGrade Hackathon\gitgrade"

# Login to Vercel
vercel login

# Set environment variable
vercel env add VITE_API_URL production
# Enter: https://your-backend-url.onrender.com

# Deploy
vercel --prod
```

### Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## Part 3: Verify Deployment

### Backend Health Check
```bash
curl https://your-backend-url.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected",
  "redis": "connected"
}
```

### Frontend Check
Visit `https://your-app.vercel.app` and test:
1. ✅ Page loads
2. ✅ Can enter GitHub URL
3. ✅ Analysis works
4. ✅ History loads
5. ✅ Export works

---

## 🔧 Troubleshooting

### Issue: "CORS Error"
**Fix**: Add to backend `src/server.js`:
```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

### Issue: "Database Connection Failed"
**Fix**: 
1. Verify database credentials in Render/Railway
2. Use **Internal URL** (not external)
3. Check database is in same region as backend

### Issue: "Environment Variables Not Working"
**Fix**:
1. Vercel: Redeploy after adding env vars
2. Render: Restart service after updating vars

### Issue: "Build Fails on Vercel"
**Fix**:
1. Check `vercel.json` root directory is set to `frontend`
2. Verify `package.json` has correct build script
3. Check Node.js version (24.x should work)

### Issue: "API Requests Timeout"
**Fix**:
1. Render free tier cold starts (first request slow)
2. Upgrade to paid tier for instant starts
3. Or use Railway (no cold starts)

---

## 📊 Cost Estimates

### Free Tier (Sufficient for Hackathon)
- **Vercel**: Free (100GB bandwidth/month)
- **Render**: Free (PostgreSQL 256MB, Redis 25MB, 750 hours/month)
- **Total**: $0/month

### Production Tier
- **Vercel Pro**: $20/month
- **Render Standard**: $25/month (database + redis + backend)
- **Total**: ~$45/month

---

## 🚀 Quick Start Commands

```bash
# 1. Update backend URL in vercel.json
# Replace YOUR-BACKEND-URL with actual URL

# 2. Deploy to Vercel
cd "c:\Users\rkste\Desktop\GitGrade Hackathon\gitgrade"
vercel --prod

# 3. Set environment variable
vercel env add VITE_API_URL production
# Enter your backend URL

# 4. Redeploy
vercel --prod
```

---

## 📝 Post-Deployment Checklist

- [ ] Backend deployed and healthy
- [ ] Database initialized with schema
- [ ] Redis connected
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS enabled for Vercel domain
- [ ] API key system tested
- [ ] Analysis endpoint working
- [ ] History and comparison working
- [ ] Export functionality tested

---

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [GitHub Repo](https://github.com/1Rajveer-Singh/GITGRADE-HACKATHON)

---

**Need Help?** Check the troubleshooting section or open an issue on GitHub.
