const { getPool } = require('../config/database');

const getTransactions = async (req, res) => {
  const { page = 1, limit = 50, category_id, txn_type, start_date, end_date } = req.query;
  const pool = getPool();

  try {
    let whereClause = 'WHERE t.household_id = ?';
    let params = [req.user.household_id];

    if (category_id) {
      whereClause += ' AND t.category_id = ?';
      params.push(category_id);
    }

    if (txn_type) {
      whereClause += ' AND t.txn_type = ?';
      params.push(txn_type);
    }

    if (start_date) {
      whereClause += ' AND t.txn_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND t.txn_date <= ?';
      params.push(end_date);
    }

    const limitNum = Number(limit);
    const pageNum = Number(page);
    const offsetNum = (pageNum - 1) * limitNum;
    
    const [transactions] = await pool.execute(`
      SELECT 
        t.txn_id,
        t.asset_id,
        a.display_name as asset_name,
        t.category_id,
        c.name as category_name,
        t.purpose,
        t.txn_type,
        t.amount,
        t.currency,
        t.txn_date,
        t.notes,
        u.name as user_name
      FROM transactions t
      LEFT JOIN assets a ON t.asset_id = a.asset_id
      LEFT JOIN txn_categories c ON t.category_id = c.category_id
      LEFT JOIN users u ON t.user_id = u.user_id
      WHERE t.household_id = ?
      ORDER BY t.txn_date DESC, t.txn_id DESC
      LIMIT 5
    `, [req.user.household_id]);

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM transactions t
      WHERE t.household_id = ?
    `, [req.user.household_id]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

const createTransaction = async (req, res) => {
  const { asset_id, category_id, purpose, txn_type, amount, currency, txn_date, notes } = req.body;
  const pool = getPool();

  try {
    const [result] = await pool.execute(
      'INSERT INTO transactions (household_id, user_id, asset_id, category_id, purpose, txn_type, amount, currency, txn_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.household_id, 
        req.user.user_id, 
        asset_id || null, 
        category_id, 
        purpose || null, 
        txn_type, 
        amount, 
        currency || 'INR', 
        txn_date, 
        notes || null
      ]
    );

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction_id: result.insertId
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { asset_id, category_id, purpose, txn_type, amount, currency, txn_date, notes } = req.body;
  const pool = getPool();

  try {
    // Verify transaction belongs to user's household
    const [transactions] = await pool.execute(
      'SELECT txn_id FROM transactions WHERE txn_id = ? AND household_id = ?',
      [id, req.user.household_id]
    );

    if (transactions.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await pool.execute(
      'UPDATE transactions SET asset_id = ?, category_id = ?, purpose = ?, txn_type = ?, amount = ?, currency = ?, txn_date = ?, notes = ? WHERE txn_id = ?',
      [asset_id, category_id, purpose, txn_type, amount, currency, txn_date, notes, id]
    );

    res.json({ message: 'Transaction updated successfully' });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  try {
    // Verify transaction belongs to user's household
    const [transactions] = await pool.execute(
      'SELECT txn_id FROM transactions WHERE txn_id = ? AND household_id = ?',
      [id, req.user.household_id]
    );

    if (transactions.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await pool.execute('DELETE FROM transactions WHERE txn_id = ?', [id]);

    res.json({ message: 'Transaction deleted successfully' });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

const getCategories = async (req, res) => {
  const pool = getPool();

  try {
    const [categories] = await pool.execute(`
      SELECT 
        category_id,
        name,
        txn_kind,
        parent_id
      FROM txn_categories 
      WHERE household_id = ? OR household_id IS NULL
      ORDER BY txn_kind, name
    `, [req.user.household_id]);

    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories
};
