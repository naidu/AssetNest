-- Asset History and Purchase Price Tracking
-- This migration adds asset history tracking

USE assetnest;

-- 1. Create asset history table
CREATE TABLE IF NOT EXISTS asset_history (
    history_id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    asset_id        BIGINT UNSIGNED NOT NULL,
    user_id         INT UNSIGNED NOT NULL,
    change_type     ENUM('created', 'updated', 'value_changed', 'status_changed') NOT NULL,
    field_name      VARCHAR(50),
    old_value       TEXT,
    new_value       TEXT,
    change_reason   VARCHAR(200),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_asset_id (asset_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- 2. Add updated_by_user_id column to assets table for tracking who made changes
ALTER TABLE assets ADD COLUMN updated_by_user_id INT UNSIGNED AFTER updated_at;
ALTER TABLE assets ADD FOREIGN KEY (updated_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE assets ADD INDEX idx_updated_by_user (updated_by_user_id); 