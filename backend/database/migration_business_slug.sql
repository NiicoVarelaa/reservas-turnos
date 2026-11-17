-- Align the demo business slug with the slug requested by the public pages
-- (Landing, FAQ and Contact use "clinica-dental-sonrisa").
-- Safe to run more than once.

UPDATE businesses
SET slug = 'clinica-dental-sonrisa'
WHERE slug IN ('sonrisa', 'clnica-dental-sonrisa')
  AND NOT EXISTS (
    SELECT 1 FROM businesses existing WHERE existing.slug = 'clinica-dental-sonrisa'
  );
