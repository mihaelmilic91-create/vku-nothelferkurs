-- Erlaubt allgemeine Gutschein-Anfragen (z. B. von einem Startseiten-Banner),
-- die nicht an einen bestimmten Anbieter gebunden sind.
ALTER TABLE public.gutschein_klicks ALTER COLUMN anbieter_id DROP NOT NULL;
