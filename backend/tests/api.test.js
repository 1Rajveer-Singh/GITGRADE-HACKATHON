import request from 'supertest';
import app from '../src/server.js';
import db from '../src/db/database.js';

describe('Health Endpoint', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });
});

describe('API Key Endpoints', () => {
  let apiKey;

  test('POST /api/keys/register should create new API key', async () => {
    const response = await request(app)
      .post('/api/keys/register')
      .send({
        name: 'Test User',
        email: 'test@example.com'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('apiKey');
    apiKey = response.body.data.apiKey;
  });

  test('GET /api/keys/usage should return usage stats', async () => {
    const response = await request(app)
      .get('/api/keys/usage')
      .set('X-API-Key', apiKey);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('used');
    expect(response.body.data).toHaveProperty('remaining');
  });
});

describe('Analysis Endpoints', () => {
  let analysisId;
  const testApiKey = process.env.TEST_API_KEY || 'test-key';

  beforeAll(async () => {
    // Create test API key
    await db.query(
      `INSERT INTO api_keys (key, name, email, daily_limit, monthly_limit) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (key) DO NOTHING`,
      [testApiKey, 'Test', 'test@test.com', 1000, 10000]
    );
  });

  test('POST /api/analyze should start analysis', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .set('X-API-Key', testApiKey)
      .send({
        repoUrl: 'https://github.com/octocat/Hello-World'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    analysisId = response.body.data.id;
  }, 180000); // 3 minute timeout

  test('GET /api/analysis/:id should return analysis', async () => {
    const response = await request(app)
      .get(`/api/analysis/${analysisId}`)
      .set('X-API-Key', testApiKey);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('score');
  });

  test('GET /api/history should return analysis history', async () => {
    const response = await request(app)
      .get('/api/history')
      .set('X-API-Key', testApiKey);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('analyses');
  });
});

describe('Rate Limiting', () => {
  test('Should rate limit requests without API key', async () => {
    const requests = Array(12).fill(null).map(() =>
      request(app)
        .post('/api/analyze')
        .send({ repoUrl: 'https://github.com/test/repo' })
    );

    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter(r => r.status === 429);
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });
});

afterAll(async () => {
  await db.end();
});
