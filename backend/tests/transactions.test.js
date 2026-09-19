const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

let token;

beforeAll(async () => {
  const res = await request(app).post('/api/auth/register').send({
    username: 'carol_test',
    email: 'carol_test@example.com',
    password: 'SecurePass1',
  });
  token = res.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Transactions API', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
  });

  let createdId;

  it('creates a transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 25.5, type: 'EXPENSE', category: 'Food', date: '2026-09-10' });

    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(25.5);
    createdId = res.body.id;
  });

  it('rejects a negative amount', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: -5, type: 'EXPENSE', category: 'Food', date: '2026-09-10' });

    expect(res.status).toBe(400);
  });

  it('lists the created transaction', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.content.length).toBeGreaterThan(0);
  });

  it('updates the transaction', async () => {
    const res = await request(app)
      .put(`/api/transactions/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ category: 'Groceries' });

    expect(res.status).toBe(200);
    expect(res.body.category).toBe('Groceries');
  });

  it('returns a summary with totals', async () => {
    const res = await request(app)
      .get('/api/transactions/summary?month=2026-09')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalExpense).toBeGreaterThan(0);
    expect(res.body.expenseByCategory.Groceries).toBeDefined();
  });

  it('deletes the transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${createdId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('404s when updating a deleted transaction', async () => {
    const res = await request(app)
      .put(`/api/transactions/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ category: 'Food' });

    expect(res.status).toBe(404);
  });
});
