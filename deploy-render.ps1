# GitGrade Deployment Script for Render.com (PowerShell)
# This script helps you deploy the backend to Render

Write-Host "🚀 GitGrade Backend Deployment to Render" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Manual Deployment Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Create Render Account" -ForegroundColor Green
Write-Host "   → Go to https://render.com and sign up" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  Create PostgreSQL Database" -ForegroundColor Green
Write-Host "   → Dashboard → New + → PostgreSQL" -ForegroundColor Gray
Write-Host "   → Name: gitgrade-db" -ForegroundColor Gray
Write-Host "   → Plan: Free" -ForegroundColor Gray
Write-Host "   → Region: Choose closest" -ForegroundColor Gray
Write-Host "   → Create Database" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  Create Redis Instance" -ForegroundColor Green
Write-Host "   → Dashboard → New + → Redis" -ForegroundColor Gray
Write-Host "   → Name: gitgrade-redis" -ForegroundColor Gray
Write-Host "   → Plan: Free (25MB)" -ForegroundColor Gray
Write-Host "   → Create Redis" -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣  Deploy Backend Web Service" -ForegroundColor Green
Write-Host "   → Dashboard → New + → Web Service" -ForegroundColor Gray
Write-Host "   → Connect GitHub repository: 1Rajveer-Singh/GITGRADE-HACKATHON" -ForegroundColor Gray
Write-Host "   → Configure:" -ForegroundColor Gray
Write-Host "     • Name: gitgrade-backend" -ForegroundColor DarkGray
Write-Host "     • Branch: main" -ForegroundColor DarkGray
Write-Host "     • Root Directory: backend" -ForegroundColor DarkGray
Write-Host "     • Runtime: Node" -ForegroundColor DarkGray
Write-Host "     • Build Command: npm install" -ForegroundColor DarkGray
Write-Host "     • Start Command: node src/server.js" -ForegroundColor DarkGray
Write-Host ""

Write-Host "5️⃣  Add Environment Variables" -ForegroundColor Green
Write-Host "   → In backend service → Environment" -ForegroundColor Gray
Write-Host "   → Add these variables:" -ForegroundColor Gray
Write-Host ""
Write-Host "   NODE_ENV=production" -ForegroundColor DarkGray
Write-Host "   PORT=5000" -ForegroundColor DarkGray
Write-Host "   GITHUB_TOKEN=<your-github-token>" -ForegroundColor DarkGray
Write-Host "   GEMINI_API_KEY=<your-gemini-key>" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   Link Database (from gitgrade-db):" -ForegroundColor DarkGray
Write-Host "   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   Link Redis (from gitgrade-redis):" -ForegroundColor DarkGray
Write-Host "   REDIS_HOST, REDIS_PORT" -ForegroundColor DarkGray
Write-Host ""

Write-Host "6️⃣  Deploy & Get Backend URL" -ForegroundColor Green
Write-Host "   → Wait 5-10 minutes for deployment" -ForegroundColor Gray
Write-Host "   → Copy your backend URL: https://gitgrade-backend.onrender.com" -ForegroundColor Gray
Write-Host ""

Write-Host "7️⃣  Deploy Frontend to Vercel" -ForegroundColor Green
Write-Host "   → Install Vercel CLI: npm i -g vercel" -ForegroundColor Gray
Write-Host "   → Run: vercel login" -ForegroundColor Gray
Write-Host "   → Set API URL: vercel env add VITE_API_URL production" -ForegroundColor Gray
Write-Host "   → Enter: https://gitgrade-backend.onrender.com" -ForegroundColor Gray
Write-Host "   → Deploy: vercel --prod" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Deployment Guide Complete!" -ForegroundColor Green
Write-Host "📖 Full instructions: See VERCEL_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to open Render dashboard
$response = Read-Host "Open Render dashboard in browser? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    Start-Process "https://dashboard.render.com"
}
