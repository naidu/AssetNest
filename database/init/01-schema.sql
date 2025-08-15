-- AssetNest Database Schema
-- MySQL 8.0+ Compatible

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS assetnest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE assetnest;

-- 1. HOUSEHOLD & USER MANAGEMENT
CREATE TABLE IF NOT EXISTS households (
    household_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(120) NOT NULL,
    subscription_plan ENUM('trial','basic','pro') DEFAULT 'basic',
    plan_start        DATE,
    plan_end          DATE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    user_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    household_id   INT UNSIGNED NOT NULL,
    name           VARCHAR(120) NOT NULL,
    email          VARCHAR(150) UNIQUE,
    phone          VARCHAR(30),
    role           ENUM('owner','member') DEFAULT 'member',
    password_hash  VARCHAR(255),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE,
    INDEX idx_household_id (household_id),
    INDEX idx_email (email)
);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id           INT UNSIGNED PRIMARY KEY,
    default_currency  CHAR(3) DEFAULT 'INR',
    date_format       VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    timezone          VARCHAR(50) DEFAULT 'Asia/Kolkata',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 2. LOOK-UP TABLES
CREATE TABLE IF NOT EXISTS asset_types (
    asset_type_id  TINYINT UNSIGNED PRIMARY KEY,
    type_name      VARCHAR(40) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS txn_categories (
    category_id    SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    household_id   INT UNSIGNED,          -- NULL = global system category
    name           VARCHAR(60) NOT NULL,
    txn_kind       ENUM('income','expense') NOT NULL,
    parent_id      SMALLINT UNSIGNED,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id)    REFERENCES txn_categories(category_id) ON DELETE SET NULL,
    INDEX idx_household_id (household_id),
    INDEX idx_parent_id (parent_id)
);

-- 3. GENERIC ASSET HEADER
CREATE TABLE IF NOT EXISTS assets (
    asset_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    household_id    INT UNSIGNED NOT NULL,
    asset_type_id   TINYINT UNSIGNED NOT NULL,
    display_name    VARCHAR(120) NOT NULL,
    acquisition_dt  DATE,
    current_value   DECIMAL(18,2),
    currency        CHAR(3) DEFAULT 'INR',
    linked_account_id BIGINT UNSIGNED,
    notes           TEXT,
    status          ENUM('active','sold','closed') DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id)  REFERENCES households(household_id) ON DELETE CASCADE,
    FOREIGN KEY (asset_type_id) REFERENCES asset_types(asset_type_id),
    FOREIGN KEY (linked_account_id) REFERENCES bank_accounts(account_id) ON DELETE SET NULL,
    INDEX idx_household_id (household_id),
    INDEX idx_asset_type (asset_type_id),
    INDEX idx_status (status),
    INDEX idx_linked_account (linked_account_id)
);

-- 4. PROPERTY DETAILS
CREATE TABLE IF NOT EXISTS property_assets (
    asset_id            BIGINT UNSIGNED PRIMARY KEY,
    property_kind       ENUM('residential','commercial','land'),
    ownership_mode      ENUM('owned','rented'),
    address_line1       VARCHAR(200),
    city                VARCHAR(60),
    state               VARCHAR(60),
    country             VARCHAR(60),
    postcode            VARCHAR(20),
    area_sqft           DECIMAL(10,2),
    purchase_price      DECIMAL(18,2),
    purchase_dt         DATE,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);

-- 5. STOCK / EQUITY DETAILS
CREATE TABLE IF NOT EXISTS stock_holdings (
    asset_id         BIGINT UNSIGNED PRIMARY KEY,
    ticker           VARCHAR(20) NOT NULL,
    exchange_code    VARCHAR(10),
    broker_account   VARCHAR(80),
    units            DECIMAL(18,4),
    avg_cost_price   DECIMAL(18,4),
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    INDEX idx_ticker (ticker)
);

-- 6. GOLD DETAILS
CREATE TABLE IF NOT EXISTS gold_assets (
    asset_id        BIGINT UNSIGNED PRIMARY KEY,
    gold_form       ENUM('digital','physical'),
    weight_grams    DECIMAL(12,4),
    purity_percent  DECIMAL(5,2),
    storage_place   VARCHAR(120),
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);

-- 7. MUTUAL FUND DETAILS
CREATE TABLE IF NOT EXISTS mf_holdings (
    asset_id          BIGINT UNSIGNED PRIMARY KEY,
    fund_name         VARCHAR(160),
    folio_number      VARCHAR(60),
    units             DECIMAL(18,4),
    avg_nav           DECIMAL(18,4),
    registrar         VARCHAR(80),
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    INDEX idx_folio (folio_number)
);

-- 8. INSURANCE / LIC POLICIES
CREATE TABLE IF NOT EXISTS insurance_policies (
    asset_id         BIGINT UNSIGNED PRIMARY KEY,
    policy_number    VARCHAR(60) UNIQUE,
    provider         VARCHAR(100),
    policy_type      ENUM('life','health','vehicle','property','other'),
    sum_assured      DECIMAL(18,2),
    premium_amount   DECIMAL(18,2),
    premium_freq     ENUM('monthly','quarterly','half-yearly','yearly'),
    start_date       DATE,
    end_date         DATE,
    nominee          VARCHAR(120),
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    INDEX idx_policy_number (policy_number)
);

-- 9. BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS bank_accounts (
    account_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    asset_id       BIGINT UNSIGNED NOT NULL,
    bank_name      VARCHAR(100) NOT NULL,
    account_type   ENUM('savings','current','credit','loan','investment','nre','nro') NOT NULL,
    account_number VARCHAR(50),
    ifsc_code      VARCHAR(20),
    branch_name    VARCHAR(100),
    opening_balance DECIMAL(18,2) DEFAULT 0.00,
    current_balance DECIMAL(18,2) DEFAULT 0.00,
    currency       CHAR(3) DEFAULT 'INR',
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    INDEX idx_asset_id (asset_id),
    INDEX idx_bank_name (bank_name),
    INDEX idx_account_type (account_type),
    INDEX idx_is_active (is_active)
);

-- 10. CASHFLOW TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    txn_id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    household_id   INT UNSIGNED NOT NULL,
    user_id        INT UNSIGNED,
    asset_id       BIGINT UNSIGNED,      -- nullable for pure income/expense
    account_id     BIGINT UNSIGNED,      -- nullable for cash transactions
    category_id    SMALLINT UNSIGNED NOT NULL,
    purpose        VARCHAR(160),
    txn_type       ENUM('income','expense','transfer') NOT NULL,
    amount         DECIMAL(18,2) NOT NULL,
    currency       CHAR(3) DEFAULT 'INR',
    txn_date       DATE NOT NULL,
    notes          TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)      REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (asset_id)     REFERENCES assets(asset_id) ON DELETE SET NULL,
    FOREIGN KEY (account_id)   REFERENCES bank_accounts(account_id) ON DELETE SET NULL,
    FOREIGN KEY (category_id)  REFERENCES txn_categories(category_id),
    INDEX idx_household_id (household_id),
    INDEX idx_user_id (user_id),
    INDEX idx_asset_id (asset_id),
    INDEX idx_account_id (account_id),
    INDEX idx_category_id (category_id),
    INDEX idx_txn_date (txn_date),
    INDEX idx_txn_type (txn_type)
);

-- 11. BUDGETS
CREATE TABLE IF NOT EXISTS budgets (
    budget_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    household_id   INT UNSIGNED NOT NULL,
    category_id    SMALLINT UNSIGNED NOT NULL,
    period_start   DATE NOT NULL,
    period_end     DATE NOT NULL,
    planned_amount DECIMAL(18,2),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id)  REFERENCES txn_categories(category_id),
    INDEX idx_household_id (household_id),
    INDEX idx_category_id (category_id),
    INDEX idx_period (period_start, period_end)
);

-- 12. NET-WORTH TRACKING
CREATE TABLE IF NOT EXISTS networth_snapshots (
    snapshot_id    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    household_id   INT UNSIGNED NOT NULL,
    snapshot_dt    DATE NOT NULL,
    total_assets   DECIMAL(18,2),
    total_liabs    DECIMAL(18,2),
    net_worth      DECIMAL(18,2),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE,
    INDEX idx_household_id (household_id),
    INDEX idx_snapshot_dt (snapshot_dt),
    UNIQUE KEY unique_household_date (household_id, snapshot_dt)
);
