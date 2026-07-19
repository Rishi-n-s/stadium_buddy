const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.AUTH_PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_stadiumiq_key_123';

// ─── AUTH MIDDLEWARE ───────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token." });
    req.user = user;
    next();
  });
};

// ─── REGISTRATION ENDPOINT ─────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if email or username already exists
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUsers.length > 0) {
      if (existingUsers[0].email === email) {
        return res.status(400).json({ message: "Email already registered." });
      }
      return res.status(400).json({ message: "That username is already taken. Please choose another one." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (email, password_hash, username, role) VALUES (?, ?, ?, ?)',
      [email, password_hash, username, role || 'fan']
    );

    // Auto-login after registration
    const token = jwt.sign({ id: result.insertId, email, role: role || 'fan' }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ 
      success: true, 
      message: "Registration successful!",
      token,
      user: { id: result.insertId, email, username, role: role || 'fan' }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─── LOGIN ENDPOINT ────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const user = users[0];
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─── GET CURRENT SESSION ───────────────────────────────────────────
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, email, username, role FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`[Server] Auth Server running on http://localhost:${PORT}`);
});
