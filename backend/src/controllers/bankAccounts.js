const { getPool } = require('../config/database');

// Get all bank accounts for a household
const getBankAccounts = async (req, res) => {
  const pool = getPool();
  
  try {
    const { household_id } = req.user;
    
    const query = `
      SELECT 
        ba.account_id,
        ba.asset_id,
        ba.bank_name,
        ba.account_type,
        ba.account_number,
        ba.ifsc_code,
        ba.branch_name,
        ba.opening_balance,
        ba.current_balance,
        ba.currency,
        ba.is_active,
        ba.created_at,
        ba.updated_at,
        a.display_name,
        a.notes
      FROM bank_accounts ba
      JOIN assets a ON ba.asset_id = a.asset_id
      WHERE a.household_id = ?
      ORDER BY ba.bank_name, ba.account_type
    `;
    
    const [accounts] = await pool.execute(query, [household_id]);
    
    res.json({ bank_accounts: accounts });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({ error: 'Failed to fetch bank accounts' });
  }
};

// Get a specific bank account
const getBankAccount = async (req, res) => {
  const pool = getPool();
  
  try {
    const { account_id } = req.params;
    const { household_id } = req.user;
    
    const query = `
      SELECT 
        ba.account_id,
        ba.asset_id,
        ba.bank_name,
        ba.account_type,
        ba.account_number,
        ba.ifsc_code,
        ba.branch_name,
        ba.opening_balance,
        ba.current_balance,
        ba.currency,
        ba.is_active,
        ba.created_at,
        ba.updated_at,
        a.display_name,
        a.notes
      FROM bank_accounts ba
      JOIN assets a ON ba.asset_id = a.asset_id
      WHERE ba.account_id = ? AND a.household_id = ?
    `;
    
    const [accounts] = await pool.execute(query, [account_id, household_id]);
    
    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    
    res.json({ bank_account: accounts[0] });
  } catch (error) {
    console.error('Error fetching bank account:', error);
    res.status(500).json({ error: 'Failed to fetch bank account' });
  }
};

// Create a new bank account
const createBankAccount = async (req, res) => {
  const pool = getPool();
  
  try {
    const { household_id, user_id } = req.user;
    const {
      display_name,
      bank_name,
      account_type,
      account_number,
      ifsc_code,
      branch_name,
      opening_balance = 0,
      currency = 'INR',
      notes
    } = req.body;
    
    // Validate required fields
    if (!display_name || !bank_name || !account_type) {
      return res.status(400).json({ error: 'Display name, bank name, and account type are required' });
    }
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Create asset record
      const assetQuery = `
        INSERT INTO assets (household_id, asset_type_id, display_name, acquisition_dt, current_value, currency, notes)
        VALUES (?, 6, ?, CURDATE(), ?, ?, ?)
      `;
      
      const [assetResult] = await connection.execute(assetQuery, [
        household_id,
        display_name,
        opening_balance,
        currency,
        notes
      ]);
      
      const asset_id = assetResult.insertId;
      
      // Create bank account record
      const bankAccountQuery = `
        INSERT INTO bank_accounts (asset_id, bank_name, account_type, account_number, ifsc_code, branch_name, opening_balance, current_balance, currency)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [bankAccountResult] = await connection.execute(bankAccountQuery, [
        asset_id,
        bank_name,
        account_type,
        account_number,
        ifsc_code,
        branch_name,
        opening_balance,
        opening_balance,
        currency
      ]);
      
      await connection.commit();
      
      // Fetch the created bank account
      const fetchQuery = `
        SELECT 
          ba.account_id,
          ba.asset_id,
          ba.bank_name,
          ba.account_type,
          ba.account_number,
          ba.ifsc_code,
          ba.branch_name,
          ba.opening_balance,
          ba.current_balance,
          ba.currency,
          ba.is_active,
          ba.created_at,
          ba.updated_at,
          a.display_name,
          a.notes
        FROM bank_accounts ba
        JOIN assets a ON ba.asset_id = a.asset_id
        WHERE ba.account_id = ?
      `;
      
      const [accounts] = await pool.execute(fetchQuery, [bankAccountResult.insertId]);
      
      res.status(201).json({ 
        message: 'Bank account created successfully',
        bank_account: accounts[0]
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error creating bank account:', error);
    res.status(500).json({ error: 'Failed to create bank account' });
  }
};

// Update a bank account
const updateBankAccount = async (req, res) => {
  const pool = getPool();
  
  try {
    const { account_id } = req.params;
    const { household_id } = req.user;
    const {
      display_name,
      bank_name,
      account_type,
      account_number,
      ifsc_code,
      branch_name,
      opening_balance,
      currency,
      notes,
      is_active
    } = req.body;
    
    // Check if bank account exists and belongs to household
    const checkQuery = `
      SELECT ba.account_id, ba.asset_id
      FROM bank_accounts ba
      JOIN assets a ON ba.asset_id = a.asset_id
      WHERE ba.account_id = ? AND a.household_id = ?
    `;
    
    const [accounts] = await pool.execute(checkQuery, [account_id, household_id]);
    
    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    
    const { asset_id } = accounts[0];
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update asset record
      if (display_name || currency || notes !== undefined) {
        const assetUpdateQuery = `
          UPDATE assets 
          SET display_name = COALESCE(?, display_name),
              currency = COALESCE(?, currency),
              notes = COALESCE(?, notes),
              updated_at = CURRENT_TIMESTAMP
          WHERE asset_id = ?
        `;
        
        await connection.execute(assetUpdateQuery, [display_name, currency, notes, asset_id]);
      }
      
      // Update bank account record
      const bankAccountUpdateQuery = `
        UPDATE bank_accounts 
        SET bank_name = COALESCE(?, bank_name),
            account_type = COALESCE(?, account_type),
            account_number = COALESCE(?, account_number),
            ifsc_code = COALESCE(?, ifsc_code),
            branch_name = COALESCE(?, branch_name),
            opening_balance = COALESCE(?, opening_balance),
            currency = COALESCE(?, currency),
            is_active = COALESCE(?, is_active),
            updated_at = CURRENT_TIMESTAMP
        WHERE account_id = ?
      `;
      
      await connection.execute(bankAccountUpdateQuery, [
        bank_name,
        account_type,
        account_number,
        ifsc_code,
        branch_name,
        opening_balance,
        currency,
        is_active,
        account_id
      ]);
      
      await connection.commit();
      
      // Fetch the updated bank account
      const fetchQuery = `
        SELECT 
          ba.account_id,
          ba.asset_id,
          ba.bank_name,
          ba.account_type,
          ba.account_number,
          ba.ifsc_code,
          ba.branch_name,
          ba.opening_balance,
          ba.current_balance,
          ba.currency,
          ba.is_active,
          ba.created_at,
          ba.updated_at,
          a.display_name,
          a.notes
        FROM bank_accounts ba
        JOIN assets a ON ba.asset_id = a.asset_id
        WHERE ba.account_id = ?
      `;
      
      const [updatedAccounts] = await pool.execute(fetchQuery, [account_id]);
      
      res.json({ 
        message: 'Bank account updated successfully',
        bank_account: updatedAccounts[0]
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error updating bank account:', error);
    res.status(500).json({ error: 'Failed to update bank account' });
  }
};

// Delete a bank account
const deleteBankAccount = async (req, res) => {
  const pool = getPool();
  
  try {
    const { account_id } = req.params;
    const { household_id } = req.user;
    
    // Check if bank account exists and belongs to household
    const checkQuery = `
      SELECT ba.account_id, ba.asset_id, ba.current_balance
      FROM bank_accounts ba
      JOIN assets a ON ba.asset_id = a.asset_id
      WHERE ba.account_id = ? AND a.household_id = ?
    `;
    
    const [accounts] = await pool.execute(checkQuery, [account_id, household_id]);
    
    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    
    const { asset_id, current_balance } = accounts[0];
    
    // Check if account has balance
    if (current_balance > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete bank account with positive balance. Please transfer or withdraw all funds first.' 
      });
    }
    
    // Check if account has any transactions
    const transactionCheckQuery = `
      SELECT COUNT(*) as transaction_count
      FROM transactions
      WHERE account_id = ?
    `;
    
    const [transactionResult] = await pool.execute(transactionCheckQuery, [account_id]);
    
    if (transactionResult[0].transaction_count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete bank account with transaction history. Please archive the account instead.' 
      });
    }
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete bank account record
      await connection.execute('DELETE FROM bank_accounts WHERE account_id = ?', [account_id]);
      
      // Delete asset record
      await connection.execute('DELETE FROM assets WHERE asset_id = ?', [asset_id]);
      
      await connection.commit();
      
      res.json({ message: 'Bank account deleted successfully' });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error deleting bank account:', error);
    res.status(500).json({ error: 'Failed to delete bank account' });
  }
};

// Get account balance and transaction summary
const getAccountBalance = async (req, res) => {
  const pool = getPool();
  
  try {
    const { account_id } = req.params;
    const { household_id } = req.user;
    
    // Check if bank account exists and belongs to household
    const checkQuery = `
      SELECT ba.account_id, ba.current_balance, ba.currency
      FROM bank_accounts ba
      JOIN assets a ON ba.asset_id = a.asset_id
      WHERE ba.account_id = ? AND a.household_id = ?
    `;
    
    const [accounts] = await pool.execute(checkQuery, [account_id, household_id]);
    
    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    
    // Get recent transactions
    const transactionsQuery = `
      SELECT 
        t.txn_id,
        t.purpose,
        t.txn_type,
        t.amount,
        t.currency,
        t.txn_date,
        t.notes,
        c.name as category_name
      FROM transactions t
      LEFT JOIN txn_categories c ON t.category_id = c.category_id
      WHERE t.account_id = ?
      ORDER BY t.txn_date DESC, t.created_at DESC
      LIMIT 10
    `;
    
    const [transactions] = await pool.execute(transactionsQuery, [account_id]);
    
    // Calculate summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN txn_type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN txn_type = 'expense' THEN amount ELSE 0 END) as total_expenses,
        SUM(CASE WHEN txn_type = 'transfer' THEN amount ELSE 0 END) as total_transfers
      FROM transactions
      WHERE account_id = ?
    `;
    
    const [summary] = await pool.execute(summaryQuery, [account_id]);
    
    res.json({
      account_balance: accounts[0],
      recent_transactions: transactions,
      summary: summary[0]
    });
    
  } catch (error) {
    console.error('Error fetching account balance:', error);
    res.status(500).json({ error: 'Failed to fetch account balance' });
  }
};

// Update account balance (for reconciliation)
const updateAccountBalance = async (req, res) => {
  const pool = getPool();
  
  try {
    const { account_id } = req.params;
    const { household_id } = req.user;
    const { current_balance } = req.body;
    
    if (current_balance === undefined || current_balance < 0) {
      return res.status(400).json({ error: 'Valid current balance is required' });
    }
    
    // Check if bank account exists and belongs to household
    const checkQuery = `
      SELECT ba.account_id
      FROM bank_accounts ba
      JOIN assets a ON ba.asset_id = a.asset_id
      WHERE ba.account_id = ? AND a.household_id = ?
    `;
    
    const [accounts] = await pool.execute(checkQuery, [account_id, household_id]);
    
    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    
    // Update balance
    const updateQuery = `
      UPDATE bank_accounts 
      SET current_balance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE account_id = ?
    `;
    
    await pool.execute(updateQuery, [current_balance, account_id]);
    
    // Also update the asset value
    const assetUpdateQuery = `
      UPDATE assets a
      JOIN bank_accounts ba ON a.asset_id = ba.asset_id
      SET a.current_value = ?, a.updated_at = CURRENT_TIMESTAMP
      WHERE ba.account_id = ?
    `;
    
    await pool.execute(assetUpdateQuery, [current_balance, account_id]);
    
    res.json({ 
      message: 'Account balance updated successfully',
      current_balance: current_balance
    });
    
  } catch (error) {
    console.error('Error updating account balance:', error);
    res.status(500).json({ error: 'Failed to update account balance' });
  }
};

module.exports = {
  getBankAccounts,
  getBankAccount,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getAccountBalance,
  updateAccountBalance
};
