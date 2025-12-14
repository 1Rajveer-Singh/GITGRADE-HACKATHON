# API Key System Documentation

## Overview

GitGrade now includes a comprehensive API key management system with per-user rate limiting and usage tracking. This ensures fair usage and prevents abuse while keeping everything **100% FREE**.

---

## Features

### 🔑 API Key Management
- **FREE Registration**: Users can register for a free API key with email
- **Automatic Generation**: Secure 64-character hexadecimal keys
- **Usage Tracking**: Real-time monitoring of daily/monthly usage
- **Flexible Limits**: Configurable per-user quotas

### 📊 Rate Limiting
- **Per-User Limits**: 
  - FREE Tier: 50 analyses/day, 1000/month
  - IP-based fallback: 10 analyses/hour (without API key)
- **Automatic Reset**: Daily and monthly counters reset automatically
- **Grace Period**: Clear error messages with reset time

### 🔒 Security
- **Secure Storage**: API keys hashed and stored securely in PostgreSQL
- **Local Storage**: Keys stored in browser localStorage (never sent to third parties)
- **Validation**: Format and existence checks on every request
- **Deactivation**: Users can deactivate/reactivate keys

---

## Database Schema

### `api_keys` Table
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255),
    daily_limit INTEGER DEFAULT 50,
    monthly_limit INTEGER DEFAULT 1000,
    total_analyses INTEGER DEFAULT 0,
    daily_analyses INTEGER DEFAULT 0,
    monthly_analyses INTEGER DEFAULT 0,
    last_reset_daily TIMESTAMP,
    last_reset_monthly TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    notes TEXT
);
```

### `usage_logs` Table
```sql
CREATE TABLE usage_logs (
    id SERIAL PRIMARY KEY,
    api_key_id UUID REFERENCES api_keys(id),
    analysis_id UUID REFERENCES analyses(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    endpoint VARCHAR(100),
    status_code INTEGER,
    response_time INTEGER,
    created_at TIMESTAMP
);
```

---

## API Endpoints

### 1. Register for API Key (FREE)

**POST** `/api/keys/register`

Register for a new API key. One key per email address.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key created successfully",
  "data": {
    "apiKey": "abcdef123456...",
    "name": "John Doe",
    "email": "john@example.com",
    "limits": {
      "daily": 50,
      "monthly": 1000
    },
    "createdAt": "2025-12-14T10:30:00Z",
    "usage": "Include this key in your requests using the X-API-Key header"
  }
}
```

**Error Responses:**
- `400`: Invalid email format or missing fields
- `409`: Email already has an active API key
- `500`: Server error

---

### 2. Get Usage Statistics

**GET** `/api/keys/usage`

Get detailed usage statistics for your API key.

**Headers:**
```
X-API-Key: your_api_key_here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": {
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-12-14T10:30:00Z"
    },
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
    },
    "history": [
      {
        "date": "2025-12-14",
        "count": 8,
        "avg_response_time": 2340
      }
    ]
  }
}
```

**Error Responses:**
- `401`: Invalid or missing API key
- `403`: API key deactivated or expired
- `500`: Server error

---

### 3. Deactivate API Key

**POST** `/api/keys/deactivate`

Deactivate your current API key.

**Headers:**
```
X-API-Key: your_api_key_here
```

**Response:**
```json
{
  "success": true,
  "message": "API key deactivated successfully"
}
```

---

### 4. Reactivate API Key

**POST** `/api/keys/reactivate`

Reactivate a previously deactivated API key.

**Request:**
```json
{
  "email": "john@example.com",
  "apiKey": "your_api_key_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key reactivated successfully"
}
```

---

### 5. List All API Keys (Admin Only)

**GET** `/api/keys/list`

List all API keys (requires admin privileges).

**Headers:**
```
X-API-Key: admin_api_key_here
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 50)
- `active`: Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "keys": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    }
  }
}
```

---

### 6. Update API Key Limits (Admin Only)

**PUT** `/api/keys/:id/limits`

Update daily/monthly limits for a specific API key.

**Headers:**
```
X-API-Key: admin_api_key_here
```

**Request:**
```json
{
  "dailyLimit": 100,
  "monthlyLimit": 2000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Limits updated successfully"
}
```

---

## Using API Keys

### Frontend Integration

The frontend automatically includes API keys in requests:

```javascript
// API key stored in localStorage
localStorage.setItem('gitgrade_api_key', 'your_key_here');

// Axios automatically adds it to headers
const response = await api.analyzeRepository(repoUrl);
```

### Manual API Calls

**Using Headers (Recommended):**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{"repoUrl": "https://github.com/user/repo"}'
```

**Using Query Parameter:**
```bash
curl -X POST "http://localhost:5000/api/analyze?api_key=your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/user/repo"}'
```

---

## Rate Limiting Behavior

### With API Key

1. **Request arrives** with valid API key
2. **Check daily limit**: `daily_analyses < daily_limit` (50)
3. **Check monthly limit**: `monthly_analyses < monthly_limit` (1000)
4. **Increment counters**: +1 to all counters
5. **Log usage**: Record in `usage_logs` table
6. **Process request**: Continue with analysis

### Rate Limit Exceeded

**Response (429):**
```json
{
  "success": false,
  "error": "Daily API limit reached",
  "limit": 50,
  "used": 50,
  "resetsIn": "14 hours"
}
```

### Without API Key

- Falls back to IP-based rate limiting
- **Limit**: 10 requests/hour per IP
- **Applied to**: `/api/analyze` endpoint only

---

## Frontend UI

### API Key Modal

Users can:
- ✅ Register for a new API key
- ✅ Enter an existing API key
- ✅ View usage statistics
- ✅ Skip and use IP-based limiting

**Modal appears:**
- On first visit (if no key configured)
- When clicking "Setup API Key" button
- After exceeding IP-based rate limit

### Usage Badge

Shows remaining analyses in header:
```
🟢 42 analyses left today
```

---

## Security Best Practices

### For Users

1. **Protect Your Key**: Never share your API key publicly
2. **Use HTTPS**: Always use secure connections in production
3. **Rotate Keys**: Deactivate and create new keys periodically
4. **Monitor Usage**: Check usage statistics regularly

### For Administrators

1. **Monitor Abuse**: Check `usage_logs` for suspicious patterns
2. **Adjust Limits**: Use admin endpoints to modify quotas
3. **Deactivate Keys**: Disable abusive keys immediately
4. **Review Logs**: Regular audits of high-usage accounts

---

## Migration Guide

### Existing Installations

1. **Update Database**:
   ```bash
   cd backend
   docker-compose exec postgres psql -U gitgrade -d gitgrade -f src/db/init.sql
   ```

2. **Restart Services**:
   ```bash
   docker-compose restart backend
   ```

3. **Update Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

### Testing

```bash
# Register for API key
curl -X POST http://localhost:5000/api/keys/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Use the returned API key
export API_KEY="your_key_from_response"

# Test analysis with API key
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"repoUrl":"https://github.com/facebook/react"}'

# Check usage
curl http://localhost:5000/api/keys/usage \
  -H "X-API-Key: $API_KEY"
```

---

## Troubleshooting

### Issue: "Invalid API key"

**Causes:**
- Key format incorrect (must be 64 hex characters)
- Key doesn't exist in database
- Typo in key

**Solution:**
- Verify key format: `/^[a-f0-9]{64}$/`
- Check database: `SELECT * FROM api_keys WHERE api_key = 'your_key';`
- Re-register if needed

---

### Issue: "API key has been deactivated"

**Causes:**
- Key manually deactivated
- Abuse detection triggered

**Solution:**
- Use reactivation endpoint
- Contact administrator
- Register new key

---

### Issue: "Daily/Monthly limit reached"

**Causes:**
- Exceeded 50 daily or 1000 monthly analyses

**Solution:**
- Wait for automatic reset (shown in error message)
- Contact admin for limit increase
- Use multiple keys (one per email)

---

### Issue: Usage not tracking

**Causes:**
- Database connection issue
- Middleware not applied
- API key not in request

**Solution:**
- Check database connection
- Verify middleware order in `server.js`
- Confirm API key in headers/query

---

## Future Enhancements

### Planned Features

- [ ] OAuth integration (GitHub, Google)
- [ ] Team accounts with shared quotas
- [ ] Webhook notifications for limit warnings
- [ ] Analytics dashboard (admin)
- [ ] Custom pricing tiers
- [ ] API key scopes/permissions
- [ ] Rate limit burst allowance
- [ ] Geographic rate limiting

---

## Summary

✅ **Implemented:**
- API key registration and management
- Per-user rate limiting (50/day, 1000/month)
- Usage tracking and statistics
- Admin management endpoints
- Frontend modal and UI integration
- Automatic counter resets
- Comprehensive error handling

🆓 **Cost:** $0.00 - Completely FREE!

📊 **Fair Usage:** Prevents abuse while allowing generous limits

🔒 **Secure:** Industry-standard practices

---

_Built with security and fairness in mind for the GitGrade project._
