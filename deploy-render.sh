#!/bin/bash

# GitGrade Deployment Script for Render.com
# This script helps you deploy the backend to Render

echo "🚀 GitGrade Backend Deployment to Render"
echo "========================================="
echo ""

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "⚠️  Render CLI not found. Installing..."
    npm install -g @render-cli/cli
fi

echo "📋 Prerequisites:"
echo "1. Create account at https://render.com"
echo "2. Get your API key from https://dashboard.render.com/account/settings"
echo ""

read -p "Enter your Render API Key: " RENDER_API_KEY
export RENDER_API_KEY

echo ""
echo "🔧 Creating services on Render..."
echo ""

# Deploy using render.yaml
render deploy --config render.yaml --api-key $RENDER_API_KEY

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📝 Next Steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Wait for services to deploy (5-10 minutes)"
echo "3. Add these secret environment variables:"
echo "   - GITHUB_TOKEN (your GitHub personal access token)"
echo "   - GEMINI_API_KEY (your Google Gemini API key)"
echo "4. Note your backend URL: https://gitgrade-backend.onrender.com"
echo "5. Update Vercel environment: VITE_API_URL=<your-backend-url>"
echo ""
echo "🎉 Done! Your backend will be live soon."
