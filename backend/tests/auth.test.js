const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'alice_test',
      email: 'alice_test@example.com',
      password: 'SecurePass1',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.username).toBe('alice_test');
  });

  it('rejects a duplicate username', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'alice_test',
      email: 'someone-else@example.com',
      password: 'SecurePass1',
    });

    expect(res.status).toBe(409);
  });

  it('rejects a short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'bob_test',
      email: 'bob_test@example.com',
      password: '123',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'alice_test',
      password: 'SecurePass1',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'alice_test',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
  });
});
