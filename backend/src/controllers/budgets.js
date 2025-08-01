const { getPool } = require('../config/database');

const getBudgets = async (req, res) => {
  const { year, month } = req.query;
  const pool = getPool();

  try {
    let whereClause = 'WHERE b.household_id = ?';
    let params = [req.user.household_id];

    if (year) {
      whereClause += ' AND YEAR(b.period_start) = ?';
      params.push(year);
    }

    if (month) {
      whereClause += ' AND MONTH(b.period_start) = ?';
      params.push(month);
    }

    const [budgets] = await pool.execute(`
      SELECT 
        b.budget_id,
        b.category_id,
        c.name as category_name,
        c.txn_kind,
        b.period_start,
        b.period_end,
        b.planned_amount,
        COALESCE(SUM(t.amount), 0) as actual_amount
      FROM budgets b
      LEFT JOIN txn_categories c ON b.category_id = c.category_id
      LEFT JOIN transactions t ON b.category_id = t.category_id 
        AND t.txn_date BETWEEN b.period_start AND b.period_end
        AND t.household_id = b.household_id
      ${whereClause}
      GROUP BY b.budget_id
      ORDER BY b.period_start DESC, c.name
    `, params);

    res.json({ budgets });

  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

const createBudget = async (req, res) => {
  const { category_id, period_start, period_end, planned_amount } = req.body;
  const pool = getPool();

  try {
    const [result] = await pool.execute(
      'INSERT INTO budgets (household_id, category_id, period_start, period_end, planned_amount) VALUES (?, ?, ?, ?, ?)',
      [req.user.household_id, category_id, period_start, period_end, planned_amount]
    );

    res.status(201).json({
      message: 'Budget created successfully',
      budget_id: result.insertId
    });

  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
};

const updateBudget = async (req, res) => {
  const { id } = req.params;
  const { category_id, period_start, period_end, planned_amount } = req.body;
  const pool = getPool();

  try {
    // Verify budget belongs to user's household
    const [budgets] = await pool.execute(
      'SELECT budget_id FROM budgets WHERE budget_id = ? AND household_id = ?',
      [id, req.user.household_id]
    );

    if (budgets.length === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await pool.execute(
      'UPDATE budgets SET category_id = ?, period_start = ?, period_end = ?, planned_amount = ? WHERE budget_id = ?',
      [category_id, period_start, period_end, planned_amount, id]
    );

    res.json({ message: 'Budget updated successfully' });

  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
};

const deleteBudget = async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  try {
    // Verify budget belongs to user's household
    const [budgets] = await pool.execute(
      'SELECT budget_id FROM budgets WHERE budget_id = ? AND household_id = ?',
      [id, req.user.household_id]
    );

    if (budgets.length === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await pool.execute('DELETE FROM budgets WHERE budget_id = ?', [id]);

    res.json({ message: 'Budget deleted successfully' });

  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
