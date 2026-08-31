-- Kombi-Anbieter (kurstyp='beide') hatten nur ein Preisfeld, das faktisch den
-- VKU-Preis zeigte — der oft günstigere Nothelferkurs-Preis blieb unsichtbar
-- (z. B. Lumi Drive: VKU CHF 190, Nothelferkurs aber nur CHF 99).
ALTER TABLE public.anbieter ADD COLUMN preis_nothelferkurs_chf NUMERIC(8,2);

-- Erlaubt es, einzelne Anbieter in den Suchergebnissen bewusst nach vorne zu
-- setzen (z. B. Launch-Partner), unabhängig von der Distanz-Sortierung.
ALTER TABLE public.anbieter ADD COLUMN bevorzugt BOOLEAN NOT NULL DEFAULT false;
