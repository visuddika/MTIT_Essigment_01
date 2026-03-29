const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// In-memory users store (replace with DB in production)
let users = [];

// Helper: normalize email
const normalizeEmail = (e) => (e ? String(e).toLowerCase().trim() : '');

// Signup (username/email/password/role)
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Username, email, and password are required' });

    const normalized = normalizeEmail(email);
    if (users.find(u => u.email === normalized)) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), username, email: normalized, password: hashedPassword, role: role || 'user' };
    users.push(newUser);

    return res.status(201).json({ message: 'User signed up successfully', user: { id: newUser.id, username, email: newUser.email, role: newUser.role } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Register alias (supports name instead of username)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

    const normalized = normalizeEmail(email);
    if (users.find(u => u.email === normalized)) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), username: name, email: normalized, password: hashedPassword, role: 'user' };
    users.push(newUser);

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Signin (email/password) -> returns JWT
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const normalized = normalizeEmail(email);
    console.log('Signin attempt for:', normalized);
    const user = users.find(u => u.email === normalized);
    if (!user) {
      console.log('Signin failed: user not found for', normalized);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log('Password match for', normalized, ':', match);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });

    const { password: _p, ...userSafe } = user;
    console.log('Signin success for', normalized);
    return res.status(200).json({ message: 'Signin successful', token, user: userSafe });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DEBUG: list users (DEV ONLY) — enable via env DEBUG_USERS=true
router.get('/users', (req, res) => {
  try {
    if (process.env.DEBUG_USERS !== 'true') return res.status(404).end();
    const safe = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json({ count: safe.length, users: safe });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;