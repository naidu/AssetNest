const { getPool } = require('../config/database');

const getTransactions = async (req, res) => {
  const { page = 1, limit = 50, category_id, txn_type, start_date, end_date, account_id, asset_id } = req.query;
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

    if (account_id) {
      whereClause += ' AND t.account_id = ?';
      params.push(account_id);
    }

    if (asset_id) {
      whereClause += ' AND t.asset_id = ?';
      params.push(asset_id);
    }

    if (start_date) {
      whereClause += ' AND t.txn_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND t.txn_date <= ?';
      params.push(end_date);
    }

    const limitNum = parseInt(limit) || 50;
    const pageNum = parseInt(page) || 1;
    const offsetNum = (pageNum - 1) * limitNum;
    
    const [transactions] = await pool.execute(`
      SELECT 
        t.txn_id,
        t.asset_id,
        a.display_name as asset_name,
        t.account_id,
        ba.bank_name as account_name,
        ba.account_type as account_type,
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
      LEFT JOIN bank_accounts ba ON t.account_id = ba.account_id
      LEFT JOIN txn_categories c ON t.category_id = c.category_id
      LEFT JOIN users u ON t.user_id = u.user_id
      ${whereClause}
      ORDER BY t.txn_date DESC, t.txn_id DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `, params);

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
  const { asset_id, account_id, category_id, purpose, txn_type, amount, currency, txn_date, notes } = req.body;
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Insert transaction
    const [result] = await connection.execute(
      'INSERT INTO transactions (household_id, user_id, asset_id, account_id, category_id, purpose, txn_type, amount, currency, txn_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.household_id, 
        req.user.user_id, 
        asset_id || null, 
        account_id || null, 
        category_id, 
        purpose || null, 
        txn_type, 
        amount, 
        currency || 'INR', 
        txn_date, 
        notes || null
      ]
    );

    let accountAssetId = null;

    // Update account balance if account_id is provided
    if (account_id) {
      // Verify account belongs to household
      const [accounts] = await connection.execute(`
        SELECT ba.account_id, ba.asset_id, ba.current_balance, ba.currency
        FROM bank_accounts ba
        JOIN assets a ON ba.asset_id = a.asset_id
        WHERE ba.account_id = ? AND a.household_id = ?
      `, [account_id, req.user.household_id]);

      if (accounts.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Bank account not found' });
      }

      const account = accounts[0];
      accountAssetId = account.asset_id;
      
      // Check currency match
      if (account.currency !== currency) {
        await connection.rollback();
        return res.status(400).json({ error: 'Currency mismatch between transaction and account' });
      }

      // Calculate new balance based on transaction type
      let newBalance = parseFloat(account.current_balance);
      if (txn_type === 'income') {
        newBalance += parseFloat(amount);
      } else if (txn_type === 'expense') {
        newBalance -= parseFloat(amount);
      }
      // Note: 'transfer' type should use the transferTransaction function

      // Update account balance
      await connection.execute(
        'UPDATE bank_accounts SET current_balance = ? WHERE account_id = ?',
        [newBalance, account_id]
      );
      // Update related asset's current_value (the asset linked to the bank account)
      await connection.execute(
        'UPDATE assets SET current_value = ? WHERE asset_id = ?',
        [newBalance, account.asset_id]
      );
    }

    // Update related asset balance if asset_id is provided and different from account's asset
    if (asset_id && asset_id !== accountAssetId) {
      console.log(`Updating related asset ${asset_id}, accountAssetId: ${accountAssetId}, txn_type: ${txn_type}, amount: ${amount}`);
      // Verify asset belongs to household
      const [assets] = await connection.execute(`
        SELECT asset_id, current_value, currency
        FROM assets
        WHERE asset_id = ? AND household_id = ?
      `, [asset_id, req.user.household_id]);

      if (assets.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Related asset not found' });
      }

      const relatedAsset = assets[0];
      console.log(`Related asset found: ${relatedAsset.asset_id}, current_value: ${relatedAsset.current_value}, currency: ${relatedAsset.currency}`);
      
      // Check currency match
      if (relatedAsset.currency !== currency) {
        await connection.rollback();
        return res.status(400).json({ error: 'Currency mismatch between transaction and related asset' });
      }

      // Calculate new asset value based on transaction type
      // For expense: money moves from account to asset (asset value increases)
      // For income: money moves from asset to account (asset value decreases)
      let newAssetValue = parseFloat(relatedAsset.current_value);
      if (txn_type === 'expense') {
        // Expense from account means money is being used to acquire/invest in the asset
        newAssetValue += parseFloat(amount);
      } else if (txn_type === 'income') {
        // Income to account means money is coming from the asset (selling/divesting)
        newAssetValue -= parseFloat(amount);
      }

      console.log(`Updating asset ${asset_id} from ${relatedAsset.current_value} to ${newAssetValue}`);
      // Update related asset's current_value
      await connection.execute(
        'UPDATE assets SET current_value = ? WHERE asset_id = ?',
        [newAssetValue, asset_id]
      );
      console.log(`Asset ${asset_id} updated successfully`);
    } else if (asset_id) {
      console.log(`Skipping asset update: asset_id (${asset_id}) same as account's asset (${accountAssetId})`);
    }

    await connection.commit();

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction_id: result.insertId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  } finally {
    connection.release();
  }
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { asset_id, account_id, category_id, purpose, txn_type, amount, currency, txn_date, notes } = req.body;
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Get old transaction data
    const [oldTransactions] = await connection.execute(
      'SELECT account_id, asset_id, txn_type, amount, currency FROM transactions WHERE txn_id = ? AND household_id = ?',
      [id, req.user.household_id]
    );

    if (oldTransactions.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const oldTransaction = oldTransactions[0];

    // Reverse old transaction's effect on account balance
    if (oldTransaction.account_id) {
      const [oldAccounts] = await connection.execute(`
        SELECT ba.account_id, ba.asset_id, ba.current_balance, ba.currency
        FROM bank_accounts ba
        JOIN assets a ON ba.asset_id = a.asset_id
        WHERE ba.account_id = ? AND a.household_id = ?
      `, [oldTransaction.account_id, req.user.household_id]);

      if (oldAccounts.length > 0) {
        const oldAccount = oldAccounts[0];
        let oldBalance = parseFloat(oldAccount.current_balance);
        
        // Reverse the old transaction
        if (oldTransaction.txn_type === 'income') {
          oldBalance -= parseFloat(oldTransaction.amount);
        } else if (oldTransaction.txn_type === 'expense') {
          oldBalance += parseFloat(oldTransaction.amount);
        }

        await connection.execute(
          'UPDATE bank_accounts SET current_balance = ? WHERE account_id = ?',
          [oldBalance, oldTransaction.account_id]
        );
        // Update related asset's current_value
        await connection.execute(
          'UPDATE assets SET current_value = ? WHERE asset_id = ?',
          [oldBalance, oldAccount.asset_id]
        );
      }
    }

    // Reverse old transaction's effect on related asset balance
    if (oldTransaction.asset_id) {
      // Get the account's asset_id to check if it's different
      let oldAccountAssetId = null;
      if (oldTransaction.account_id) {
        const [oldAccountCheck] = await connection.execute(`
          SELECT ba.asset_id FROM bank_accounts ba
          JOIN assets a ON ba.asset_id = a.asset_id
          WHERE ba.account_id = ? AND a.household_id = ?
        `, [oldTransaction.account_id, req.user.household_id]);
        if (oldAccountCheck.length > 0) {
          oldAccountAssetId = oldAccountCheck[0].asset_id;
        }
      }

      // Only reverse if asset_id is different from account's asset
      if (oldTransaction.asset_id !== oldAccountAssetId) {
        const [oldAssets] = await connection.execute(`
          SELECT asset_id, current_value, currency
          FROM assets
          WHERE asset_id = ? AND household_id = ?
        `, [oldTransaction.asset_id, req.user.household_id]);

        if (oldAssets.length > 0) {
          const oldAsset = oldAssets[0];
          let oldAssetValue = parseFloat(oldAsset.current_value);
          
          // Reverse the old transaction effect on asset
          if (oldTransaction.txn_type === 'expense') {
            oldAssetValue -= parseFloat(oldTransaction.amount);
          } else if (oldTransaction.txn_type === 'income') {
            oldAssetValue += parseFloat(oldTransaction.amount);
          }

          await connection.execute(
            'UPDATE assets SET current_value = ? WHERE asset_id = ?',
            [oldAssetValue, oldTransaction.asset_id]
          );
        }
      }
    }

    // Update the transaction
    await connection.execute(
      'UPDATE transactions SET asset_id = ?, account_id = ?, category_id = ?, purpose = ?, txn_type = ?, amount = ?, currency = ?, txn_date = ?, notes = ? WHERE txn_id = ?',
      [asset_id || null, account_id || null, category_id, purpose || null, txn_type, amount, currency || 'INR', txn_date, notes || null, id]
    );

    // Apply new transaction's effect on account balance
    if (account_id) {
      // Verify account belongs to household
      const [newAccounts] = await connection.execute(`
        SELECT ba.account_id, ba.asset_id, ba.current_balance, ba.currency
        FROM bank_accounts ba
        JOIN assets a ON ba.asset_id = a.asset_id
        WHERE ba.account_id = ? AND a.household_id = ?
      `, [account_id, req.user.household_id]);

      if (newAccounts.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Bank account not found' });
      }

      const newAccount = newAccounts[0];
      
      // Check currency match
      if (newAccount.currency !== currency) {
        await connection.rollback();
        return res.status(400).json({ error: 'Currency mismatch between transaction and account' });
      }

      // Calculate new balance based on transaction type
      let newBalance = parseFloat(newAccount.current_balance);
      if (txn_type === 'income') {
        newBalance += parseFloat(amount);
      } else if (txn_type === 'expense') {
        newBalance -= parseFloat(amount);
      }

      // Update account balance
      await connection.execute(
        'UPDATE bank_accounts SET current_balance = ? WHERE account_id = ?',
        [newBalance, account_id]
      );
      // Update related asset's current_value
      await connection.execute(
        'UPDATE assets SET current_value = ? WHERE asset_id = ?',
        [newBalance, newAccount.asset_id]
      );
    }

    // Apply new transaction's effect on related asset balance
    let newAccountAssetId = null;
    if (account_id) {
      const [accountCheck] = await connection.execute(`
        SELECT ba.asset_id FROM bank_accounts ba
        JOIN assets a ON ba.asset_id = a.asset_id
        WHERE ba.account_id = ? AND a.household_id = ?
      `, [account_id, req.user.household_id]);
      if (accountCheck.length > 0) {
        newAccountAssetId = accountCheck[0].asset_id;
      }
    }

    if (asset_id && asset_id !== newAccountAssetId) {
      // Verify asset belongs to household
      const [newAssets] = await connection.execute(`
        SELECT asset_id, current_value, currency
        FROM assets
        WHERE asset_id = ? AND household_id = ?
      `, [asset_id, req.user.household_id]);

      if (newAssets.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Related asset not found' });
      }

      const newRelatedAsset = newAssets[0];
      
      // Check currency match
      if (newRelatedAsset.currency !== currency) {
        await connection.rollback();
        return res.status(400).json({ error: 'Currency mismatch between transaction and related asset' });
      }

      // Calculate new asset value based on transaction type
      let newAssetValue = parseFloat(newRelatedAsset.current_value);
      if (txn_type === 'expense') {
        // Expense from account means money is being used to acquire/invest in the asset
        newAssetValue += parseFloat(amount);
      } else if (txn_type === 'income') {
        // Income to account means money is coming from the asset (selling/divesting)
        newAssetValue -= parseFloat(amount);
      }

      // Update related asset's current_value
      await connection.execute(
        'UPDATE assets SET current_value = ? WHERE asset_id = ?',
        [newAssetValue, asset_id]
      );
    }

    await connection.commit();

    res.json({ message: 'Transaction updated successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  } finally {
    connection.release();
  }
};

const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Get transaction data before deleting
    const [transactions] = await connection.execute(
      'SELECT account_id, asset_id, txn_type, amount, currency FROM transactions WHERE txn_id = ? AND household_id = ?',
      [id, req.user.household_id]
    );

    if (transactions.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = transactions[0];

    // Reverse transaction's effect on account balance
    if (transaction.account_id) {
      const [accounts] = await connection.execute(`
        SELECT ba.account_id, ba.asset_id, ba.current_balance, ba.currency
        FROM bank_accounts ba
        JOIN assets a ON ba.asset_id = a.asset_id
        WHERE ba.account_id = ? AND a.household_id = ?
      `, [transaction.account_id, req.user.household_id]);

      if (accounts.length > 0) {
        const account = accounts[0];
        let newBalance = parseFloat(account.current_balance);
        
        // Reverse the transaction effect
        if (transaction.txn_type === 'income') {
          newBalance -= parseFloat(transaction.amount);
        } else if (transaction.txn_type === 'expense') {
          newBalance += parseFloat(transaction.amount);
        }

        await connection.execute(
          'UPDATE bank_accounts SET current_balance = ? WHERE account_id = ?',
          [newBalance, transaction.account_id]
        );
        // Update related asset's current_value
        await connection.execute(
          'UPDATE assets SET current_value = ? WHERE asset_id = ?',
          [newBalance, account.asset_id]
        );
      }
    }

    // Reverse transaction's effect on related asset balance
    if (transaction.asset_id) {
      // Get the account's asset_id to check if it's different
      let accountAssetId = null;
      if (transaction.account_id) {
        const [accountCheck] = await connection.execute(`
          SELECT ba.asset_id FROM bank_accounts ba
          JOIN assets a ON ba.asset_id = a.asset_id
          WHERE ba.account_id = ? AND a.household_id = ?
        `, [transaction.account_id, req.user.household_id]);
        if (accountCheck.length > 0) {
          accountAssetId = accountCheck[0].asset_id;
        }
      }

      // Only reverse if asset_id is different from account's asset
      if (transaction.asset_id !== accountAssetId) {
        const [assets] = await connection.execute(`
          SELECT asset_id, current_value, currency
          FROM assets
          WHERE asset_id = ? AND household_id = ?
        `, [transaction.asset_id, req.user.household_id]);

        if (assets.length > 0) {
          const relatedAsset = assets[0];
          let newAssetValue = parseFloat(relatedAsset.current_value);
          
          // Reverse the transaction effect on asset
          if (transaction.txn_type === 'expense') {
            newAssetValue -= parseFloat(transaction.amount);
          } else if (transaction.txn_type === 'income') {
            newAssetValue += parseFloat(transaction.amount);
          }

          await connection.execute(
            'UPDATE assets SET current_value = ? WHERE asset_id = ?',
            [newAssetValue, transaction.asset_id]
          );
        }
      }
    }

    // Delete the transaction
    await connection.execute('DELETE FROM transactions WHERE txn_id = ?', [id]);

    await connection.commit();

    res.json({ message: 'Transaction deleted successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  } finally {
    connection.release();
  }
};

const transferTransaction = async (req, res) => {
  const { from_account_id, to_account_id, amount, currency, txn_date, purpose, notes } = req.body;
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verify both accounts belong to household
    const [accounts] = await connection.execute(`
      SELECT ba.account_id, ba.asset_id, ba.current_balance, ba.currency, a.household_id
      FROM bank_accounts ba
      JOIN assets a ON ba.asset_id = a.asset_id
      WHERE ba.account_id IN (?, ?) AND a.household_id = ?
    `, [from_account_id, to_account_id, req.user.household_id]);

    if (accounts.length !== 2) {
      await connection.rollback();
      return res.status(404).json({ error: 'One or both bank accounts not found' });
    }

    const fromAccount = accounts.find(a => a.account_id === from_account_id);
    const toAccount = accounts.find(a => a.account_id === to_account_id);

    // Check currency match
    if (fromAccount.currency !== currency || toAccount.currency !== currency) {
      await connection.rollback();
      return res.status(400).json({ error: 'Currency mismatch between accounts or transaction' });
    }

    // Check sufficient balance
    if (parseFloat(fromAccount.current_balance) < parseFloat(amount)) {
      await connection.rollback();
      return res.status(400).json({ error: 'Insufficient balance in source account' });
    }

    // Get transfer category (or use a default expense/income category)
    let transferCategoryId = null;
    const [transferCategories] = await connection.execute(`
      SELECT category_id FROM txn_categories 
      WHERE (name LIKE '%Transfer%' OR name LIKE '%transfer%')
      AND (household_id = ? OR household_id IS NULL)
      LIMIT 1
    `, [req.user.household_id]);
    
    if (transferCategories.length > 0) {
      transferCategoryId = transferCategories[0].category_id;
    } else {
      // Use a default "Other" category if transfer category doesn't exist
      const [otherCategories] = await connection.execute(`
        SELECT category_id FROM txn_categories 
        WHERE (name LIKE '%Other%' OR name LIKE '%other%')
        AND (household_id = ? OR household_id IS NULL)
        LIMIT 1
      `, [req.user.household_id]);
      
      if (otherCategories.length > 0) {
        transferCategoryId = otherCategories[0].category_id;
      } else {
        // Get any available category as fallback
        const [anyCategories] = await connection.execute(`
          SELECT category_id FROM txn_categories 
          WHERE household_id = ? OR household_id IS NULL
          LIMIT 1
        `, [req.user.household_id]);
        
        if (anyCategories.length > 0) {
          transferCategoryId = anyCategories[0].category_id;
        } else {
          await connection.rollback();
          return res.status(400).json({ error: 'No transaction categories found. Please create categories first.' });
        }
      }
    }

    // Create expense transaction for from_account
    const [fromResult] = await connection.execute(
      'INSERT INTO transactions (household_id, user_id, account_id, category_id, purpose, txn_type, amount, currency, txn_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.household_id,
        req.user.user_id,
        from_account_id,
        transferCategoryId,
        purpose || `Transfer to account ${toAccount.account_id}`,
        'expense',
        amount,
        currency,
        txn_date,
        notes || null
      ]
    );

    // Create income transaction for to_account
    const [toResult] = await connection.execute(
      'INSERT INTO transactions (household_id, user_id, account_id, category_id, purpose, txn_type, amount, currency, txn_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.household_id,
        req.user.user_id,
        to_account_id,
        transferCategoryId,
        purpose || `Transfer from account ${fromAccount.account_id}`,
        'income',
        amount,
        currency,
        txn_date,
        notes || null
      ]
    );

    // Update from_account balance (deduct)
    const fromNewBalance = parseFloat(fromAccount.current_balance) - parseFloat(amount);
    await connection.execute(
      'UPDATE bank_accounts SET current_balance = ? WHERE account_id = ?',
      [fromNewBalance, from_account_id]
    );
    // Update related asset's current_value
    await connection.execute(
      'UPDATE assets SET current_value = ? WHERE asset_id = ?',
      [fromNewBalance, fromAccount.asset_id]
    );

    // Update to_account balance (add)
    const toNewBalance = parseFloat(toAccount.current_balance) + parseFloat(amount);
    await connection.execute(
      'UPDATE bank_accounts SET current_balance = ? WHERE account_id = ?',
      [toNewBalance, to_account_id]
    );
    // Update related asset's current_value
    await connection.execute(
      'UPDATE assets SET current_value = ? WHERE asset_id = ?',
      [toNewBalance, toAccount.asset_id]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Transfer completed successfully',
      from_transaction_id: fromResult.insertId,
      to_transaction_id: toResult.insertId,
      from_account_new_balance: fromNewBalance,
      to_account_new_balance: toNewBalance
    });

  } catch (error) {
    await connection.rollback();
    console.error('Transfer transaction error:', error);
    res.status(500).json({ error: 'Failed to process transfer' });
  } finally {
    connection.release();
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
  transferTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories
};
