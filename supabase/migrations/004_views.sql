-- =============================================================================
-- 004: Analytics Views (Pre-computed for dashboard charts)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- View: analytics_distribution
-- Purpose: Distribution counts by type, origin, pub_status, user_status
-- Used by: Pie charts on Dashboard (toggleable dimensions)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics_distribution AS
SELECT
  user_id,
  type,
  origin,
  pub_status,
  user_status,
  COUNT(*)::int AS count
FROM media_items
GROUP BY user_id, type, origin, pub_status, user_status;

-- -----------------------------------------------------------------------------
-- View: analytics_top_tags
-- Purpose: Top tags by usage count
-- Used by: Bar chart showing top 10 tags
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics_top_tags AS
SELECT
  user_id,
  tag,
  COUNT(*)::int AS usage_count
FROM media_items, unnest(tags) AS tag
GROUP BY user_id, tag
ORDER BY usage_count DESC;

-- -----------------------------------------------------------------------------
-- View: analytics_timeline
-- Purpose: Monthly counts of added and completed media
-- Used by: Timeline/area chart (last 6 months)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics_timeline AS
SELECT
  user_id,
  to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
  COUNT(*)::int AS added_count,
  COUNT(completed_at)::int AS completed_count
FROM media_items
GROUP BY user_id, date_trunc('month', created_at)
ORDER BY month DESC;
