-- Remove incorrectly awarded hospital achievements
-- These were awarded due to a bug that only checked hospital type without counting ECGs

DELETE FROM user_achievements
WHERE achievement_id IN (
  SELECT id FROM achievements
  WHERE category = 'hospital'
);
