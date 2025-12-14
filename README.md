# 🎓 GitGrade - AI-Powered GitHub Repository Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?logo=docker&logoColor=white)](https://www.docker.com/)

**GitGrade** is an intelligent system that evaluates GitHub repositories and converts them into a meaningful **Score + Summary + Personalized Roadmap**. Built for the UnsaidTalks GitGrade Hackathon.

## 🌟 Features

- 🔍 **Deep Repository Analysis**: Analyzes code quality, structure, documentation, testing, and more
- 🎯 **AI-Powered Insights**: Uses Google Gemini (FREE) to generate summaries and roadmaps
- 📊 **9-Dimensional Scoring**: Comprehensive evaluation across multiple dimensions
- � **API Key System**: Per-user rate limiting with FREE tier (50/day, 1000/month)
- 🔒 **Security Analysis**: Detects vulnerabilities and security best practices
- 🚀 **CI/CD Detection**: Identifies automated pipelines and workflows
- 📦 **Dependency Health**: Checks for outdated or vulnerable dependencies
- 🐳 **Containerization Check**: Detects Docker and container best practices
- 📈 **Real-time Progress**: Live updates during analysis
- 💾 **Analysis History**: Track past evaluations
- 📊 **Usage Dashboard**: Monitor your API usage and limits
- 📤 **Export Results**: Download as PDF or JSON

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React UI  │ ───> │  Express API │ ───> │  PostgreSQL │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ├──> Redis (Cache)
                            ├──> GitHub API
                            └──> Google Gemini (FREE AI)
```

## 💯 100% Free Tech Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Frontend | React + Vite + TailwindCSS | FREE ✅ |
| Backend | Node.js + Express | FREE ✅ |
| Database | PostgreSQL | FREE ✅ |
| Cache/Queue | Redis | FREE ✅ |
| AI Service | Google Gemini 1.5 Flash | FREE ✅ |
| Code Analysis | Custom Engine | FREE ✅ |
| Deployment | Docker | FREE ✅ |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (FREE)
- Docker & Docker Compose (FREE)
- GitHub Personal Access Token (FREE - [Get one here](https://github.com/settings/tokens))
- Google Gemini API Key (FREE - [Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/gitgrade.git
cd gitgrade
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env and add your tokens:
# - GITHUB_TOKEN (from https://github.com/settings/tokens)
# - GEMINI_API_KEY (from https://makersuite.google.com/app/apikey)
```

3. **Start with Docker Compose**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### Manual Setup (Without Docker)

1. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Set up PostgreSQL**
```bash
# Create database
psql -U postgres
CREATE DATABASE gitgrade;
CREATE USER gitgrade_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gitgrade TO gitgrade_user;
\q

# Run migrations
cd backend
npm run migrate
```

3. **Set up Redis**
```bash
# Install Redis (Windows - download from redis.io)
# Or use WSL: sudo apt-get install redis-server
redis-server
```

4. **Start services**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📖 Usage

1. Open http://localhost:3000
2. **Get your FREE API key** (optional but recommended):
   - Click "Setup API Key" in the header
   - Enter your name and email
   - Receive instant API key (50 analyses/day, 1000/month)
   - Or skip to use IP-based rate limiting (10/hour)
3. Paste a GitHub repository URL (e.g., `https://github.com/username/repo`)
4. Click "Analyze Repository"
5. Wait 1-3 minutes for analysis
6. View your score, summary, and personalized roadmap!

### API Key Benefits

✅ **Higher Limits**: 50 analyses/day vs 10/hour without key
✅ **Usage Tracking**: Monitor your daily/monthly usage
✅ **Persistent Access**: Works across devices and browsers
✅ **Priority Processing**: Faster queue times
✅ **100% FREE**: No credit card required

## 🎯 Scoring Breakdown

| Dimension | Weight | What We Check |
|-----------|--------|---------------|
| **Code Quality** | 20% | Complexity, file size, naming conventions |
| **Project Structure** | 15% | Folder organization, file structure |
| **Documentation** | 15% | README quality, comments, API docs |
| **Testing** | 12% | Test files, coverage, frameworks |
| **Git Practices** | 12% | Commit quality, branches, PRs |
| **Security** | 10% | Vulnerabilities, secrets, best practices |
| **CI/CD** | 8% | Pipeline detection, automation |
| **Dependencies** | 5% | Package health, updates |
| **Containerization** | 3% | Docker, container best practices |

**Rating Scale:**
- 🥉 **Bronze (0-40)**: Beginner
- 🥈 **Silver (41-75)**: Intermediate
- 🥇 **Gold (76-100)**: Advanced

## 🔑 API Endpoints

### Authentication

```bash
# Register for FREE API key
POST /api/keys/register
Body: { "name": "Your Name", "email": "your@email.com" }

# Get usage statistics
GET /api/keys/usage
Headers: { "X-API-Key": "your_api_key" }
```

### Analysis

```bash
# Analyze a repository
POST /api/analyze
Headers: { "X-API-Key": "your_api_key" }  # Optional
Body: { "repoUrl": "https://github.com/user/repo" }

# Get analysis status
GET /api/analysis/:id/status

# Get analysis results
GET /api/analysis/:id

# Get analysis history
GET /api/history?page=1&limit=10

# Export analysis
GET /api/analysis/:id/export?format=pdf

# Health check
GET /health
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Router** - Navigation

### Backend
- **Node.js 18+** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **Redis** - Cache & queue
- **Bull** - Job queue
- **@google/generative-ai** - FREE AI (Gemini)
- **Octokit** - GitHub API client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **PostgreSQL 15** - Database
- **Redis 7** - Cache

## 📊 Sample Output

```json
{
  "score": 78,
  "rating": "Intermediate",
  "badge": "Silver",
  "summary": "Strong code consistency and folder structure. The project demonstrates good organization with clear separation of concerns. However, testing coverage needs improvement, and documentation could be more comprehensive.",
  "roadmap": [
    {
      "priority": "high",
      "title": "Add Unit Tests",
      "description": "Implement unit tests using Jest. Aim for at least 70% coverage.",
      "estimatedTime": "4-6 hours"
    },
    {
      "priority": "high",
      "title": "Improve README Documentation",
      "description": "Add installation instructions, usage examples, and API documentation.",
      "estimatedTime": "2-3 hours"
    },
    {
      "priority": "medium",
      "title": "Set Up CI/CD Pipeline",
      "description": "Create GitHub Actions workflow for automated testing and deployment.",
      "estimatedTime": "3-4 hours"
    }
  ]
}
```

## 🔐 Getting Free API Keys

### GitHub Personal Access Token (Required)
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `public_repo`
4. Click "Generate token"
5. Copy and add to `.env` as `GITHUB_TOKEN`

### Google Gemini API Key (Required - FREE)
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy and add to `.env` as `GEMINI_API_KEY`
4. **Free Tier Limits**: 15 requests/min, 1 million tokens/day

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Built for the **UnsaidTalks GitGrade Hackathon**

## 🙏 Acknowledgments

- UnsaidTalks for organizing the hackathon
- GitHub API for repository data
- Google Gemini for FREE AI capabilities
- Open source community for amazing tools

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Email: support@gitgrade.com

---

⭐ **Star this repo if you find it helpful!**
