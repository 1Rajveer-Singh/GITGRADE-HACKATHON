#!/bin/bash
# GitGrade API Usage Examples (Bash)
# This script demonstrates how to use the GitGrade API with curl

API_BASE="http://localhost:5000/api"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== GitGrade API Usage Examples ===${NC}"
echo ""

# Example 1: Register for API Key
echo -e "${CYAN}Example 1: Register for FREE API Key${NC}"
echo ""

echo "Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/keys/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com"
  }')

if [ $? -eq 0 ]; then
  API_KEY=$(echo $REGISTER_RESPONSE | jq -r '.data.apiKey')
  
  if [ "$API_KEY" != "null" ]; then
    echo -e "${GREEN}✓ API Key created successfully!${NC}"
    echo "API Key: $API_KEY"
    echo ""
  else
    echo -e "${RED}✗ Registration failed (email may already exist)${NC}"
    echo "Using sample key for demonstration..."
    API_KEY="sample_key_for_demonstration"
    echo ""
  fi
fi

# Example 2: Analyze a Repository
echo -e "${CYAN}Example 2: Analyze a Repository${NC}"
echo ""

REPO_URL="https://github.com/facebook/react"
echo "Analyzing repository: $REPO_URL"
echo "This may take 1-3 minutes..."
echo ""

ANALYSIS_RESPONSE=$(curl -s -X POST "$API_BASE/analyze" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  --max-time 180 \
  -d "{\"repoUrl\": \"$REPO_URL\"}")

if [ $? -eq 0 ]; then
  SCORE=$(echo $ANALYSIS_RESPONSE | jq -r '.data.score')
  
  if [ "$SCORE" != "null" ]; then
    echo -e "${GREEN}✓ Analysis completed!${NC}"
    echo ""
    echo "Score: $SCORE/100"
    echo "Rating: $(echo $ANALYSIS_RESPONSE | jq -r '.data.rating')"
    echo "Badge: $(echo $ANALYSIS_RESPONSE | jq -r '.data.badge')"
    echo ""
    echo "Summary:"
    echo $ANALYSIS_RESPONSE | jq -r '.data.summary'
    echo ""
    echo "Metrics Breakdown:"
    echo "  Code Quality: $(echo $ANALYSIS_RESPONSE | jq -r '.data.metrics.codeQuality')/20"
    echo "  Structure: $(echo $ANALYSIS_RESPONSE | jq -r '.data.metrics.projectStructure')/15"
    echo "  Documentation: $(echo $ANALYSIS_RESPONSE | jq -r '.data.metrics.documentation')/15"
    echo "  Testing: $(echo $ANALYSIS_RESPONSE | jq -r '.data.metrics.testing')/12"
    echo "  Git Practices: $(echo $ANALYSIS_RESPONSE | jq -r '.data.metrics.gitPractices')/12"
    echo "  Security: $(echo $ANALYSIS_RESPONSE | jq -r '.data.metrics.security')/10"
    echo "  CI/CD: $(echo $ANALYSIS_RESPONSE | jq -r '.data.metrics.cicd')/8"
    echo "  Dependencies: $(echo $ANALYSIS_RESPONSE | jq -r '.data.metrics.dependencies')/5"
    echo "  Containerization: $(echo $ANALYSIS_RESPONSE | jq -r '.data.metrics.containerization')/3"
    echo ""
    
    ANALYSIS_ID=$(echo $ANALYSIS_RESPONSE | jq -r '.data.id')
  else
    echo -e "${RED}✗ Analysis failed${NC}"
    echo ""
  fi
fi

# Example 3: Get Usage Statistics
echo -e "${CYAN}Example 3: Get Usage Statistics${NC}"
echo ""

USAGE_RESPONSE=$(curl -s -X GET "$API_BASE/keys/usage" \
  -H "X-API-Key: $API_KEY")

if [ $? -eq 0 ]; then
  TOTAL=$(echo $USAGE_RESPONSE | jq -r '.data.usage.total')
  
  if [ "$TOTAL" != "null" ]; then
    echo -e "${GREEN}✓ Usage statistics retrieved!${NC}"
    echo ""
    echo "Total Analyses: $TOTAL"
    echo "Today: $(echo $USAGE_RESPONSE | jq -r '.data.usage.today')/$(echo $USAGE_RESPONSE | jq -r '.data.limits.daily')"
    echo "This Month: $(echo $USAGE_RESPONSE | jq -r '.data.usage.thisMonth')/$(echo $USAGE_RESPONSE | jq -r '.data.limits.monthly')"
    echo ""
    echo "Remaining:"
    echo "  Daily: $(echo $USAGE_RESPONSE | jq -r '.data.remaining.daily')"
    echo "  Monthly: $(echo $USAGE_RESPONSE | jq -r '.data.remaining.monthly')"
    echo ""
  fi
fi

# Example 4: Get Analysis by ID
if [ ! -z "$ANALYSIS_ID" ] && [ "$ANALYSIS_ID" != "null" ]; then
  echo -e "${CYAN}Example 4: Get Analysis by ID${NC}"
  echo ""
  
  GET_ANALYSIS_RESPONSE=$(curl -s -X GET "$API_BASE/analysis/$ANALYSIS_ID" \
    -H "X-API-Key: $API_KEY")
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Analysis retrieved!${NC}"
    echo "Status: $(echo $GET_ANALYSIS_RESPONSE | jq -r '.data.status')"
    echo "Analyzed at: $(echo $GET_ANALYSIS_RESPONSE | jq -r '.data.analyzedAt')"
    echo ""
  fi
fi

# Example 5: Get Analysis History
echo -e "${CYAN}Example 5: Get Analysis History${NC}"
echo ""

HISTORY_RESPONSE=$(curl -s -X GET "$API_BASE/history?page=1&limit=5" \
  -H "X-API-Key: $API_KEY")

if [ $? -eq 0 ]; then
  TOTAL_ANALYSES=$(echo $HISTORY_RESPONSE | jq -r '.data.pagination.total')
  
  if [ "$TOTAL_ANALYSES" != "null" ]; then
    echo -e "${GREEN}✓ History retrieved!${NC}"
    echo "Total Analyses: $TOTAL_ANALYSES"
    echo ""
    echo "Recent Analyses:"
    echo $HISTORY_RESPONSE | jq -r '.data.analyses[] | "  - \(.repoUrl) | Score: \(.score) | \(.createdAt)"'
    echo ""
  fi
fi

# Example 6: Health Check
echo -e "${CYAN}Example 6: Health Check${NC}"
echo ""

HEALTH_RESPONSE=$(curl -s -X GET "http://localhost:5000/health")

if [ $? -eq 0 ]; then
  STATUS=$(echo $HEALTH_RESPONSE | jq -r '.status')
  
  if [ "$STATUS" == "ok" ]; then
    echo -e "${GREEN}✓ Service is healthy!${NC}"
    echo "Status: $STATUS"
    echo "Database: $(echo $HEALTH_RESPONSE | jq -r '.database')"
    UPTIME=$(echo $HEALTH_RESPONSE | jq -r '.uptime')
    UPTIME_MINUTES=$(echo "scale=2; $UPTIME / 60" | bc)
    echo "Uptime: $UPTIME_MINUTES minutes"
    echo ""
  fi
fi

echo -e "${CYAN}=== Examples Complete ===${NC}"
echo ""
echo "Tips:"
echo "1. Save your API key securely"
echo "2. Use X-API-Key header for authenticated requests"
echo "3. Monitor your usage with /api/keys/usage"
echo "4. Daily limit resets every 24 hours"
echo "5. Monthly limit resets every 30 days"
echo ""
echo -e "${GREEN}Happy analyzing! 🚀${NC}"
