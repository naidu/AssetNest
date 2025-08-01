const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const register = async (req, res) => {
  const { name, email, password, phone, householdName } = req.body;
  const pool = getPool();

  try {
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create household
      const [householdResult] = await connection.execute(
        'INSERT INTO households (name, subscription_plan, plan_start, plan_end) VALUES (?, ?, ?, ?)',
        [householdName, 'basic', new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
      );

      const householdId = householdResult.insertId;

      // Create user
      const [userResult] = await connection.execute(
        'INSERT INTO users (household_id, name, email, phone, role, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
        [householdId, name, email, phone, 'owner', hashedPassword]
      );

      const userId = userResult.insertId;

      await connection.commit();
      connection.release();

      // Generate token
      const token = generateToken(userId);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          user_id: userId,
          household_id: householdId,
          name,
          email,
          role: 'owner'
        }
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const pool = getPool();

  try {
    // Get user with password
    const [users] = await pool.execute(
      'SELECT user_id, household_id, name, email, role, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.user_id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        household_id: user.household_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const logout = async (req, res) => {
  // In a production app, you might want to blacklist the token
  res.json({ message: 'Logout successful' });
};

const profile = async (req, res) => {
  const pool = getPool();

  try {
    const [users] = await pool.execute(
      'SELECT u.user_id, u.household_id, u.name, u.email, u.phone, u.role, h.name as household_name FROM users u JOIN households h ON u.household_id = h.household_id WHERE u.user_id = ?',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

module.exports = {
  register,
  login,
  logout,
  profile
};
