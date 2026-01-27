-- Rename level achievements as requested

-- Change "Residente" to "R1"
UPDATE achievements SET name_pt = 'R1' WHERE slug = 'level_5';

-- Change "Diretor Clinico" to "Dr. José Alencar"
UPDATE achievements SET name_pt = 'Dr. José Alencar' WHERE slug = 'level_100';
