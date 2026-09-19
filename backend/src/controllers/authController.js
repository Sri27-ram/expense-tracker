const bcrypt = require('bcryptjs');
const prisma = require('../db');
const { signToken } = require('../utils/jwt');

async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || username.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters' });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    return res.status(409).json({ message: 'Username or email already in use' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, email, password: hashed },
  });

  const token = signToken(user);
  res.status(201).json({ token, username: user.username });
}

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = signToken(user);
  res.json({ token, username: user.username });
}

module.exports = { register, login };
