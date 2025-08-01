const { getPool } = require('../config/database');

const getAssets = async (req, res) => {
  const pool = getPool();

  try {
    const [assets] = await pool.execute(`
      SELECT 
        a.asset_id,
        a.asset_type_id,
        at.type_name,
        a.display_name,
        a.acquisition_dt,
        a.current_value,
        a.purchase_price,
        a.currency,
        a.notes,
        a.status
      FROM assets a
      JOIN asset_types at ON a.asset_type_id = at.asset_type_id
      WHERE a.household_id = ?
      ORDER BY a.display_name
    `, [req.user.household_id]);

    res.json({ assets });

  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

const getAssetHistory = async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  try {
    // Verify asset belongs to user's household
    const [assets] = await pool.execute(
      'SELECT asset_id FROM assets WHERE asset_id = ? AND household_id = ?',
      [id, req.user.household_id]
    );

    if (assets.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const [history] = await pool.execute(`
      SELECT 
        ah.history_id,
        ah.change_type,
        ah.field_name,
        ah.old_value,
        ah.new_value,
        ah.change_reason,
        ah.created_at,
        u.name as user_name
      FROM asset_history ah
      JOIN users u ON ah.user_id = u.user_id
      WHERE ah.asset_id = ?
      ORDER BY ah.created_at DESC
    `, [id]);

    res.json({ history });

  } catch (error) {
    console.error('Get asset history error:', error);
    res.status(500).json({ error: 'Failed to fetch asset history' });
  }
};

const getAssetById = async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  try {
    const [assets] = await pool.execute(`
      SELECT 
        a.*,
        at.type_name
      FROM assets a
      JOIN asset_types at ON a.asset_type_id = at.asset_type_id
      WHERE a.asset_id = ? AND a.household_id = ?
    `, [id, req.user.household_id]);

    if (assets.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const asset = assets[0];

    // Get type-specific details based on asset type
    let details = {};
    switch (asset.type_name) {
      case 'Property':
        const [propertyDetails] = await pool.execute(
          'SELECT * FROM property_assets WHERE asset_id = ?',
          [id]
        );
        details = propertyDetails[0] || {};
        break;
      case 'Stock':
        const [stockDetails] = await pool.execute(
          'SELECT * FROM stock_holdings WHERE asset_id = ?',
          [id]
        );
        details = stockDetails[0] || {};
        break;
      case 'Gold':
        const [goldDetails] = await pool.execute(
          'SELECT * FROM gold_assets WHERE asset_id = ?',
          [id]
        );
        details = goldDetails[0] || {};
        break;
      case 'Mutual Fund':
        const [mfDetails] = await pool.execute(
          'SELECT * FROM mf_holdings WHERE asset_id = ?',
          [id]
        );
        details = mfDetails[0] || {};
        break;
      case 'Insurance':
        const [insuranceDetails] = await pool.execute(
          'SELECT * FROM insurance_policies WHERE asset_id = ?',
          [id]
        );
        details = insuranceDetails[0] || {};
        break;
    }

    res.json({ asset: { ...asset, details } });

  } catch (error) {
    console.error('Get asset by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
};

const createAsset = async (req, res) => {
  const { asset_type_id, display_name, acquisition_dt, current_value, purchase_price, currency, notes, details } = req.body;
  const pool = getPool();

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Handle empty strings for numeric fields
      const processedPurchasePrice = purchase_price === '' ? null : purchase_price;
      const processedCurrentValue = current_value === '' ? null : current_value;

      // Create main asset record - handle undefined values
      const [assetResult] = await connection.execute(
        'INSERT INTO assets (household_id, asset_type_id, display_name, acquisition_dt, current_value, purchase_price, currency, notes, updated_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          req.user.household_id, 
          asset_type_id, 
          display_name || null, 
          acquisition_dt || null, 
          processedCurrentValue, 
          processedPurchasePrice,
          currency || 'INR', 
          notes || null,
          req.user.user_id
        ]
      );

      const assetId = assetResult.insertId;

      // Record asset creation in history
      await connection.execute(
        'INSERT INTO asset_history (asset_id, user_id, change_type, change_reason) VALUES (?, ?, ?, ?)',
        [assetId, req.user.user_id, 'created', 'Asset created']
      );

      // Get asset type name for detail table insertion
      const [assetTypes] = await connection.execute(
        'SELECT type_name FROM asset_types WHERE asset_type_id = ?',
        [asset_type_id]
      );

      if (assetTypes.length > 0 && details) {
        const typeName = assetTypes[0].type_name;

        // Insert type-specific details
        switch (typeName) {
          case 'Property':
            await connection.execute(
              'INSERT INTO property_assets (asset_id, property_kind, ownership_mode, address_line1, city, state, country, postcode, area_sqft, purchase_price, purchase_dt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [
                assetId, 
                details.property_kind || null, 
                details.ownership_mode || null, 
                details.address_line1 || null, 
                details.city || null, 
                details.state || null, 
                details.country || null, 
                details.postcode || null, 
                details.area_sqft || null, 
                details.purchase_price || null, 
                details.purchase_dt || null
              ]
            );
            break;
          case 'Stock':
            await connection.execute(
              'INSERT INTO stock_holdings (asset_id, ticker, exchange_code, broker_account, units, avg_cost_price) VALUES (?, ?, ?, ?, ?, ?)',
              [
                assetId, 
                details.ticker || null, 
                details.exchange_code || null, 
                details.broker_account || null, 
                details.units || null, 
                details.avg_cost_price || null
              ]
            );
            break;
          case 'Gold':
            await connection.execute(
              'INSERT INTO gold_assets (asset_id, gold_form, weight_grams, purity_percent, storage_place) VALUES (?, ?, ?, ?, ?)',
              [
                assetId, 
                details.gold_form || null, 
                details.weight_grams || null, 
                details.purity_percent || null, 
                details.storage_place || null
              ]
            );
            break;
          case 'Mutual Fund':
            await connection.execute(
              'INSERT INTO mf_holdings (asset_id, fund_name, folio_number, units, avg_nav, registrar) VALUES (?, ?, ?, ?, ?, ?)',
              [
                assetId, 
                details.fund_name || null, 
                details.folio_number || null, 
                details.units || null, 
                details.avg_nav || null, 
                details.registrar || null
              ]
            );
            break;
          case 'Insurance':
            await connection.execute(
              'INSERT INTO insurance_policies (asset_id, policy_number, provider, policy_type, sum_assured, premium_amount, premium_freq, start_date, end_date, nominee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [
                assetId, 
                details.policy_number || null, 
                details.provider || null, 
                details.policy_type || null, 
                details.sum_assured || null, 
                details.premium_amount || null, 
                details.premium_freq || null, 
                details.start_date || null, 
                details.end_date || null, 
                details.nominee || null
              ]
            );
            break;
        }
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        message: 'Asset created successfully',
        asset_id: assetId
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
};

const updateAsset = async (req, res) => {
  const { id } = req.params;
  const { display_name, current_value, purchase_price, currency, notes, details } = req.body;
  const pool = getPool();

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get current asset data for comparison
      const [currentAssets] = await connection.execute(
        'SELECT * FROM assets WHERE asset_id = ? AND household_id = ?',
        [id, req.user.household_id]
      );

      if (currentAssets.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'Asset not found' });
      }

      const currentAsset = currentAssets[0];

      // Handle empty strings for numeric fields
      const processedPurchasePrice = purchase_price === '' ? null : purchase_price;
      const processedCurrentValue = current_value === '' ? null : current_value;

      // Update main asset record
      await connection.execute(
        'UPDATE assets SET display_name = ?, current_value = ?, purchase_price = ?, currency = ?, notes = ?, updated_by_user_id = ? WHERE asset_id = ?',
        [display_name, processedCurrentValue, processedPurchasePrice, currency, notes, req.user.user_id, id]
      );

      // Record changes in history
      const changes = [];

      if (currentAsset.display_name !== display_name) {
        changes.push(['display_name', currentAsset.display_name, display_name, 'Name updated']);
      }

      if (currentAsset.current_value !== processedCurrentValue) {
        changes.push(['current_value', currentAsset.current_value, processedCurrentValue, 'Value updated']);
      }

      if (currentAsset.purchase_price !== processedPurchasePrice) {
        changes.push(['purchase_price', currentAsset.purchase_price, processedPurchasePrice, 'Purchase price updated']);
      }

      if (currentAsset.currency !== currency) {
        changes.push(['currency', currentAsset.currency, currency, 'Currency updated']);
      }

      if (currentAsset.notes !== notes) {
        changes.push(['notes', currentAsset.notes, notes, 'Notes updated']);
      }

      // Insert history records for each change
      for (const [fieldName, oldValue, newValue, reason] of changes) {
        await connection.execute(
          'INSERT INTO asset_history (asset_id, user_id, change_type, field_name, old_value, new_value, change_reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, req.user.user_id, 'updated', fieldName, oldValue, newValue, reason]
        );
      }

      // Update type-specific details if provided
      if (details) {
        const [assetTypes] = await connection.execute(
          'SELECT type_name FROM asset_types WHERE asset_type_id = ?',
          [currentAsset.asset_type_id]
        );

        if (assetTypes.length > 0) {
          const typeName = assetTypes[0].type_name;
          // Implementation would continue for each asset type...
        }
      }

      await connection.commit();
      connection.release();

      res.json({ message: 'Asset updated successfully' });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
};

const deleteAsset = async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  try {
    // Verify asset belongs to user's household
    const [assets] = await pool.execute(
      'SELECT asset_id FROM assets WHERE asset_id = ? AND household_id = ?',
      [id, req.user.household_id]
    );

    if (assets.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Delete asset (cascade will handle detail tables)
    await pool.execute('DELETE FROM assets WHERE asset_id = ?', [id]);

    res.json({ message: 'Asset deleted successfully' });

  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
};

const getAssetTypes = async (req, res) => {
  const pool = getPool();

  try {
    const [assetTypes] = await pool.execute(
      'SELECT asset_type_id, type_name FROM asset_types ORDER BY type_name'
    );

    res.json({ asset_types: assetTypes });

  } catch (error) {
    console.error('Get asset types error:', error);
    res.status(500).json({ error: 'Failed to fetch asset types' });
  }
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetTypes,
  getAssetHistory
};
