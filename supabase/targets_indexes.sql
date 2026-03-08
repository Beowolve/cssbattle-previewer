-- Optional indexes for smoother target loading.
CREATE INDEX IF NOT EXISTS idx_battle_targets_id ON battle_targets (id);
CREATE INDEX IF NOT EXISTS idx_daily_targets_date ON daily_targets (date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_targets_key ON daily_targets (key);
