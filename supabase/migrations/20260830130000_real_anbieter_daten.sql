-- Ersetzt die Platzhalter-Beispielanbieter durch recherchierte, echte Anbieter.
-- Beispieldaten bleiben in der DB (inaktiv), damit nichts verloren geht, aber
-- sie erscheinen nicht mehr im öffentlichen Verzeichnis.

UPDATE public.anbieter
SET status = 'inaktiv'
WHERE slug IN (
  'fahren-verstand-zuerich-ost',
  'erste-hilfe-akademie',
  'fuehrerschein-paket-zuerich-nord',
  'vku-zentrum-winterthur',
  'nothelferkurs-bern-west',
  'fahrschule-linden',
  'verkehrskunde-basel',
  'erste-hilfe-luzern',
  'vku-punkt-st-gallen',
  'premiers-secours-geneve',
  'sensibilisation-lausanne',
  'fahrschule-aarau-mitte',
  'primo-soccorso-lugano',
  'vku-zuerich-west',
  'nothelfer-plus-zuerichsee'
);

INSERT INTO public.anbieter
  (name, slug, adresse, plz, ort, kanton, kurstyp, preis_chf, sprache, website_url, kontakt_email, kontakt_telefon, termine_url, status, lat, lng)
VALUES
  ('Lumi Drive', 'lumi-drive-st-gallen', 'Bahnhofstrasse 11', '9000', 'St. Gallen', 'SG', 'beide', 190, ARRAY['Deutsch'], 'https://lumidrive.ch', 'info@lumidrive.ch', '079 193 22 07', 'https://lumidrive.ch', 'aktiv', 47.4245, 9.3767),

  ('Fahrschule Hefti (Züri VKU)', 'fahrschule-hefti-zueri-vku', 'Niederdorfstrasse 63', '8001', 'Zürich', 'ZH', 'vku', 99, ARRAY['Deutsch'], 'https://fahrschule-hefti.ch/verkehrskundeunterricht-vku-zuerich/', 'paul-hefti@bluewin.ch', '078 830 55 51', 'https://fahrschule-hefti.ch/verkehrskundeunterricht-vku-zuerich/', 'aktiv', 47.3745, 8.5440),

  ('VKU Bern (Berndrive)', 'vku-bern-berndrive', 'Bubenbergplatz 8', '3011', 'Bern', 'BE', 'beide', 149, ARRAY['Deutsch'], 'https://vkubern.ch/', NULL, '078 237 27 49', 'https://vkubern.ch/', 'aktiv', 46.9480, 7.4390),

  ('Fahrschule Blumer', 'fahrschule-blumer-basel', 'Hochstrasse 4', '4053', 'Basel', 'BS', 'nothelferkurs', 69, ARRAY['Deutsch'], 'https://fahrschule-blumer.ch/kurse/nothelferkurs-basel/', NULL, NULL, 'https://fahrschule-blumer.ch/kurse/nothelferkurs-basel/', 'aktiv', 47.5470, 7.5890),

  ('Fahrschule Z (Stadelhofen)', 'fahrschule-z-stadelhofen', 'Kreuzbühlstrasse 16', '8008', 'Zürich', 'ZH', 'nothelferkurs', 99, ARRAY['Deutsch'], 'https://www.fahrschule-z.ch/nothelferkurs/zuerich-stadelhofen/', NULL, NULL, 'https://www.fahrschule-z.ch/nothelferkurs/zuerich-stadelhofen/', 'aktiv', 47.3630, 8.5560)
ON CONFLICT (slug) DO NOTHING;
