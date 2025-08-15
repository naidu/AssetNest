const { getPool } = require('../config/database');

const getNetWorth = async (req, res) => {
  const { months = 12 } = req.query;
  const pool = getPool();

  try {
    const monthsNum = Number(months);
    
    // Get asset values over time
    const [assetData] = await pool.execute(`
      SELECT 
        DATE_FORMAT(snapshot_dt, '%Y-%m') as month,
        total_assets,
        total_liabs,
        net_worth
      FROM networth_snapshots 
      WHERE household_id = ?
      ORDER BY snapshot_dt DESC
      LIMIT 6
    `, [req.user.household_id]);

    // If no snapshots, calculate current net worth
    if (assetData.length === 0) {
      const [currentAssets] = await pool.execute(`
        SELECT COALESCE(SUM(current_value), 0) as total_assets
        FROM assets 
        WHERE household_id = ? AND status = 'active'
      `, [req.user.household_id]);

      assetData.push({
        month: new Date().toISOString().slice(0, 7),
        total_assets: currentAssets[0].total_assets,
        total_liabs: 0,
        net_worth: currentAssets[0].total_assets
      });
    }

    res.json({ networth_data: assetData.reverse() });

  } catch (error) {
    console.error('Get net worth error:', error);
    res.status(500).json({ error: 'Failed to fetch net worth data' });
  }
};

const getExpenseAnalysis = async (req, res) => {
  const { period = 'month', months = 6 } = req.query;
  const pool = getPool();

  try {
    let dateFormat = '%Y-%m';
    if (period === 'week') dateFormat = '%Y-%u';
    if (period === 'year') dateFormat = '%Y';

    const monthsNum = Number(months);

    const [expenseData] = await pool.execute(`
      SELECT 
        c.name as category,
        DATE_FORMAT(t.txn_date, ?) as period,
        SUM(t.amount) as total_amount,
        COUNT(t.txn_id) as transaction_count
      FROM transactions t
      JOIN txn_categories c ON t.category_id = c.category_id
      WHERE t.household_id = ? 
        AND t.txn_type = 'expense'
        AND t.txn_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY c.category_id, period
      ORDER BY period DESC, total_amount DESC
    `, [dateFormat, req.user.household_id]);

    res.json({ expense_analysis: expenseData });

  } catch (error) {
    console.error('Get expense analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch expense analysis' });
  }
};

const getBudgetVsActual = async (req, res) => {
  const { year = new Date().getFullYear(), month } = req.query;
  const pool = getPool();

  try {
    let whereClause = 'WHERE b.household_id = ? AND YEAR(b.period_start) = ?';
    let params = [req.user.household_id, year];

    if (month) {
      whereClause += ' AND MONTH(b.period_start) = ?';
      params.push(month);
    }

    const [budgetComparison] = await pool.execute(`
      SELECT 
        c.name as category,
        b.planned_amount,
        COALESCE(SUM(t.amount), 0) as actual_amount,
        (COALESCE(SUM(t.amount), 0) - b.planned_amount) as variance,
        ROUND((COALESCE(SUM(t.amount), 0) / b.planned_amount) * 100, 2) as usage_percent
      FROM budgets b
      LEFT JOIN txn_categories c ON b.category_id = c.category_id
      LEFT JOIN transactions t ON b.category_id = t.category_id 
        AND t.txn_date BETWEEN b.period_start AND b.period_end
        AND t.household_id = b.household_id
        AND t.txn_type = c.txn_kind
      ${whereClause}
      GROUP BY b.budget_id
      ORDER BY c.name
    `, params);

    res.json({ budget_comparison: budgetComparison });

  } catch (error) {
    console.error('Get budget vs actual error:', error);
    res.status(500).json({ error: 'Failed to fetch budget comparison' });
  }
};

const getAssetAllocation = async (req, res) => {
  const pool = getPool();

  try {
    // Get asset allocation grouped by currency
    const [allocationData] = await pool.execute(`
      SELECT 
        a.currency,
        at.type_name as asset_type,
        COUNT(a.asset_id) as count,
        COALESCE(SUM(a.current_value), 0) as total_value,
        ROUND((COALESCE(SUM(a.current_value), 0) / 
          NULLIF((SELECT SUM(current_value) FROM assets WHERE household_id = ? AND status = 'active' AND currency = a.currency), 0)) * 100, 2) as percentage
      FROM assets a
      JOIN asset_types at ON a.asset_type_id = at.asset_type_id
      WHERE a.household_id = ? AND a.status = 'active'
      GROUP BY a.currency, at.asset_type_id
      ORDER BY a.currency, total_value DESC
    `, [req.user.household_id, req.user.household_id]);

    // If no assets found, return empty array
    if (!allocationData || allocationData.length === 0) {
      return res.json({ asset_allocation: [] });
    }

    // Group by currency
    const groupedByCurrency = {};
    allocationData.forEach(item => {
      if (!groupedByCurrency[item.currency]) {
        groupedByCurrency[item.currency] = {
          currency: item.currency,
          total_value: 0,
          assets: []
        };
      }
      groupedByCurrency[item.currency].assets.push({
        asset_type: item.asset_type || 'Unknown',
        count: item.count || 0,
        total_value: parseFloat(item.total_value) || 0,
        percentage: parseFloat(item.percentage) || 0
      });
      groupedByCurrency[item.currency].total_value += parseFloat(item.total_value) || 0;
    });

    // Convert to array and sort by total value
    const result = Object.values(groupedByCurrency).sort((a, b) => b.total_value - a.total_value);

    res.json({ asset_allocation: result });

  } catch (error) {
    console.error('Get asset allocation error:', error);
    res.status(500).json({ error: 'Failed to fetch asset allocation' });
  }
};

module.exports = {
  getNetWorth,
  getExpenseAnalysis,
  getBudgetVsActual,
  getAssetAllocation
};
