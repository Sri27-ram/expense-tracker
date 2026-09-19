const prisma = require('../db');

function serialize(tx) {
  return { ...tx, amount: Number(tx.amount) };
}

async function listTransactions(req, res) {
  const { month, category, type, page = 0, size = 20 } = req.query;
  const where = { userId: req.userId };

  if (month) {
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    where.date = { gte: start, lt: end };
  }
  if (category) where.category = category;
  if (type) where.type = type;

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: Number(page) * Number(size),
      take: Number(size),
    }),
    prisma.transaction.count({ where }),
  ]);

  res.json({
    content: items.map(serialize),
    totalElements: total,
    page: Number(page),
    size: Number(size),
  });
}

async function createTransaction(req, res) {
  const { amount, type, category, description, date } = req.body;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }
  if (!['INCOME', 'EXPENSE'].includes(type)) {
    return res.status(400).json({ message: 'Type must be INCOME or EXPENSE' });
  }
  if (!category) {
    return res.status(400).json({ message: 'Category is required' });
  }

  const tx = await prisma.transaction.create({
    data: {
      amount,
      type,
      category,
      description,
      date: date ? new Date(date) : new Date(),
      userId: req.userId,
    },
  });

  res.status(201).json(serialize(tx));
}

async function updateTransaction(req, res) {
  const id = Number(req.params.id);
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  const { amount, type, category, description, date } = req.body;
  const tx = await prisma.transaction.update({
    where: { id },
    data: {
      ...(amount !== undefined && { amount }),
      ...(type !== undefined && { type }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
      ...(date !== undefined && { date: new Date(date) }),
    },
  });

  res.json(serialize(tx));
}

async function deleteTransaction(req, res) {
  const id = Number(req.params.id);
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  await prisma.transaction.delete({ where: { id } });
  res.status(204).send();
}

async function getSummary(req, res) {
  const { month } = req.query;
  const where = { userId: req.userId };

  if (month) {
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    where.date = { gte: start, lt: end };
  }

  const transactions = await prisma.transaction.findMany({ where });

  let totalIncome = 0;
  let totalExpense = 0;
  const byCategory = {};

  for (const tx of transactions) {
    const amount = Number(tx.amount);
    if (tx.type === 'INCOME') {
      totalIncome += amount;
    } else {
      totalExpense += amount;
      byCategory[tx.category] = (byCategory[tx.category] || 0) + amount;
    }
  }

  res.json({
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    expenseByCategory: byCategory,
  });
}

module.exports = { listTransactions, createTransaction, updateTransaction, deleteTransaction, getSummary };
