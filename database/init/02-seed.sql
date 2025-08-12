-- AssetNest Seed Data

-- Insert Asset Types
INSERT IGNORE INTO asset_types (asset_type_id, type_name) VALUES
(1, 'Property'),
(2, 'Stock'),
(3, 'Gold'),
(4, 'Mutual Fund'),
(5, 'Insurance');

-- Insert Default Transaction Categories (Global)
INSERT IGNORE INTO txn_categories (category_id, household_id, name, txn_kind, parent_id) VALUES
-- Income Categories
(1, NULL, 'Salary', 'income', NULL),
(2, NULL, 'Business Income', 'income', NULL),
(3, NULL, 'Investment Returns', 'income', NULL),
(4, NULL, 'Rental Income', 'income', NULL),
(5, NULL, 'Other Income', 'income', NULL),

-- Expense Categories
(10, NULL, 'Food & Groceries', 'expense', NULL),
(11, NULL, 'Transportation', 'expense', NULL),
(12, NULL, 'Utilities', 'expense', NULL),
(13, NULL, 'Healthcare', 'expense', NULL),
(14, NULL, 'Education', 'expense', NULL),
(15, NULL, 'Entertainment', 'expense', NULL),
(16, NULL, 'Shopping', 'expense', NULL),
(17, NULL, 'Travel', 'expense', NULL),
(18, NULL, 'Insurance', 'expense', NULL),
(19, NULL, 'Investment', 'expense', NULL),
(20, NULL, 'Other Expenses', 'expense', NULL),

-- Sub-categories
(21, NULL, 'Groceries', 'expense', 10),
(22, NULL, 'Dining Out', 'expense', 10),
(23, NULL, 'Fuel', 'expense', 11),
(24, NULL, 'Public Transport', 'expense', 11),
(25, NULL, 'Electricity', 'expense', 12),
(26, NULL, 'Water', 'expense', 12),
(27, NULL, 'Internet', 'expense', 12);

-- Create Demo Household and Users
INSERT IGNORE INTO households (household_id, name, subscription_plan, plan_start, plan_end) VALUES
(1, 'Demo Family', 'basic', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR));

-- Create demo user (password is 'password' hashed with bcrypt)
INSERT IGNORE INTO users (user_id, household_id, name, email, phone, role, password_hash) VALUES
(1, 1, 'Demo Admin', 'admin@demo.com', '+1234567890', 'owner', '$2a$12$EbkuRNl8isQA5o3l1XDUrO93JTCPOOqcrObrfORAkqvXiegmJ/tiC'),
(2, 1, 'Demo Member', 'member@demo.com', '+1234567891', 'member', '$2a$12$EbkuRNl8isQA5o3l1XDUrO93JTCPOOqcrObrfORAkqvXiegmJ/tiC');

-- Create Sample Assets
INSERT IGNORE INTO assets (asset_id, household_id, asset_type_id, display_name, acquisition_dt, current_value, currency, notes) VALUES
(1, 1, 1, 'Family Home', '2020-01-15', 5000000.00, 'INR', 'Primary residence'),
(2, 1, 2, 'TCS Shares', '2021-03-10', 125000.00, 'INR', '50 shares of TCS'),
(3, 1, 4, 'SBI Blue Chip Fund', '2021-06-01', 75000.00, 'INR', 'Mutual fund SIP'),
(4, 1, 3, 'Gold Jewelry', '2019-12-25', 150000.00, 'INR', 'Traditional gold jewelry'),
(5, 1, 5, 'Term Life Insurance', '2020-05-01', 500000.00, 'INR', 'Term insurance policy'),
(6, 1, 2, 'Apple Inc. Shares', '2022-01-15', 50000.00, 'EUR', '50 shares of Apple Inc.'),
(7, 1, 1, 'European Property', '2021-06-01', 250000.00, 'EUR', 'Investment property in Germany');

-- Asset Details
INSERT IGNORE INTO property_assets (asset_id, property_kind, ownership_mode, address_line1, city, state, country, postcode, area_sqft, purchase_price, purchase_dt) VALUES
(1, 'residential', 'owned', '123 Main Street', 'Mumbai', 'Maharashtra', 'India', '400001', 1200.00, 4800000.00, '2020-01-15');

INSERT IGNORE INTO stock_holdings (asset_id, ticker, exchange_code, broker_account, units, avg_cost_price) VALUES
(2, 'TCS', 'NSE', 'ZERODHA123', 50.0000, 2500.0000);

INSERT IGNORE INTO mf_holdings (asset_id, fund_name, folio_number, units, avg_nav, registrar) VALUES
(3, 'SBI Blue Chip Fund - Direct Growth', 'SBI123456', 2500.0000, 30.0000, 'SBI MF');

INSERT IGNORE INTO gold_assets (asset_id, gold_form, weight_grams, purity_percent, storage_place) VALUES
(4, 'physical', 250.0000, 22.00, 'Bank Locker');

INSERT IGNORE INTO insurance_policies (asset_id, policy_number, provider, policy_type, sum_assured, premium_amount, premium_freq, start_date, end_date, nominee) VALUES
(5, 'LIC789012', 'LIC of India', 'life', 5000000.00, 25000.00, 'yearly', '2020-05-01', '2040-05-01', 'Spouse');

-- Sample Transactions
INSERT IGNORE INTO transactions (txn_id, household_id, user_id, asset_id, category_id, purpose, txn_type, amount, currency, txn_date, notes) VALUES
(1, 1, 1, NULL, 1, 'Monthly Salary', 'income', 80000.00, 'INR', '2024-01-01', 'January salary'),
(2, 1, 1, NULL, 10, 'Grocery Shopping', 'expense', 5000.00, 'INR', '2024-01-02', 'Monthly groceries'),
(3, 1, 1, 3, 19, 'SIP Investment', 'expense', 10000.00, 'INR', '2024-01-05', 'Monthly SIP'),
(4, 1, 1, NULL, 12, 'Electricity Bill', 'expense', 3500.00, 'INR', '2024-01-10', 'Monthly electricity'),
(5, 1, 1, NULL, 15, 'Movie Tickets', 'expense', 800.00, 'INR', '2024-01-15', 'Family movie night');

-- Sample Budgets
INSERT IGNORE INTO budgets (budget_id, household_id, category_id, period_start, period_end, planned_amount) VALUES
(1, 1, 10, '2024-01-01', '2024-01-31', 15000.00),
(2, 1, 11, '2024-01-01', '2024-01-31', 8000.00),
(3, 1, 12, '2024-01-01', '2024-01-31', 5000.00),
(4, 1, 15, '2024-01-01', '2024-01-31', 3000.00),
(5, 1, 19, '2024-01-01', '2024-01-31', 20000.00);

-- Sample Net Worth Snapshot
INSERT IGNORE INTO networth_snapshots (snapshot_id, household_id, snapshot_dt, total_assets, total_liabs, net_worth) VALUES
(1, 1, '2024-01-01', 5850000.00, 0.00, 5850000.00);

-- User Preferences
INSERT IGNORE INTO user_preferences (user_id, default_currency, date_format, timezone) VALUES
(1, 'INR', 'DD/MM/YYYY', 'Asia/Kolkata'),
(2, 'INR', 'DD/MM/YYYY', 'Asia/Kolkata');
