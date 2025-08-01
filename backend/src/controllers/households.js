const { getPool } = require('../config/database');

const getHouseholdInfo = async (req, res) => {
  const pool = getPool();

  try {
    const [households] = await pool.execute(`
      SELECT 
        h.household_id,
        h.name,
        h.subscription_plan,
        h.plan_start,
        h.plan_end,
        COUNT(u.user_id) as member_count
      FROM households h
      LEFT JOIN users u ON h.household_id = u.household_id
      WHERE h.household_id = ?
      GROUP BY h.household_id
    `, [req.user.household_id]);

    if (households.length === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }

    res.json({ household: households[0] });

  } catch (error) {
    console.error('Get household info error:', error);
    res.status(500).json({ error: 'Failed to fetch household information' });
  }
};

const getHouseholdMembers = async (req, res) => {
  const pool = getPool();

  try {
    const [members] = await pool.execute(`
      SELECT 
        user_id,
        name,
        email,
        phone,
        role
      FROM users 
      WHERE household_id = ?
      ORDER BY role DESC, name
    `, [req.user.household_id]);

    res.json({ members });

  } catch (error) {
    console.error('Get household members error:', error);
    res.status(500).json({ error: 'Failed to fetch household members' });
  }
};

const inviteMember = async (req, res) => {
  const { name, email, role = 'member' } = req.body;
  const pool = getPool();

  try {
    // Check if user is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only household owners can invite members' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create user without password (they'll need to register)
    const [result] = await pool.execute(
      'INSERT INTO users (household_id, name, email, role) VALUES (?, ?, ?, ?)',
      [req.user.household_id, name, email, role]
    );

    res.status(201).json({
      message: 'Member invited successfully',
      user_id: result.insertId
    });

  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Failed to invite member' });
  }
};

module.exports = {
  getHouseholdInfo,
  getHouseholdMembers,
  inviteMember
};
