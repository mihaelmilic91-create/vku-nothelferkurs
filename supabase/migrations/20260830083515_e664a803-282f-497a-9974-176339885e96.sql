ALTER TABLE public.anbieter
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision;

INSERT INTO public.anbieter (name, slug, adresse, plz, ort, kanton, kurstyp, preis_chf, sprache, website_url, kontakt_email, status, lat, lng) VALUES
('Fahren & Verstand Zürich-Ost','fahren-verstand-zuerich-ost','Seestrasse 12','8032','Zürich','ZH','vku',95,ARRAY['Deutsch'],'https://example.ch','info@fahren-verstand.ch','aktiv',47.3667,8.5500),
('Erste Hilfe Akademie','erste-hilfe-akademie','Rigistrasse 4','8006','Zürich','ZH','nothelferkurs',120,ARRAY['Deutsch'],'https://example.ch','info@eh-akademie.ch','aktiv',47.3860,8.5480),
('Führerschein-Paket Zürich-Nord','fuehrerschein-paket-zuerich-nord','Schaffhauserstrasse 300','8050','Zürich','ZH','beide',180,ARRAY['Deutsch'],'https://example.ch','info@fs-paket.ch','aktiv',47.4100,8.5450),
('VKU Zentrum Winterthur','vku-zentrum-winterthur','Marktgasse 20','8400','Winterthur','ZH','vku',89,ARRAY['Deutsch'],'https://example.ch','info@vku-winterthur.ch','aktiv',47.5000,8.7241),
('Nothelferkurs Bern West','nothelferkurs-bern-west','Länggassstrasse 15','3007','Bern','BE','nothelferkurs',110,ARRAY['Deutsch'],'https://example.ch','info@nothelfer-bern.ch','aktiv',46.9400,7.4300),
('Fahrschule Linden','fahrschule-linden','Kramgasse 5','3011','Bern','BE','beide',165,ARRAY['Deutsch'],'https://example.ch','info@fahrschule-linden.ch','aktiv',46.9480,7.4460),
('Verkehrskunde Basel','verkehrskunde-basel','Steinenvorstadt 8','4051','Basel','BS','vku',98,ARRAY['Deutsch'],'https://example.ch','info@vku-basel.ch','aktiv',47.5530,7.5880),
('Erste Hilfe Luzern','erste-hilfe-luzern','Hertensteinstrasse 3','6003','Luzern','LU','nothelferkurs',115,ARRAY['Deutsch'],'https://example.ch','info@eh-luzern.ch','aktiv',47.0500,8.3050),
('VKU Punkt St. Gallen','vku-punkt-st-gallen','Bahnhofplatz 2','9000','St. Gallen','SG','vku',92,ARRAY['Deutsch'],'https://example.ch','info@vku-sg.ch','aktiv',47.4245,9.3767),
('Premiers Secours Genève','premiers-secours-geneve','Rue de Carouge 20','1204','Genf','GE','nothelferkurs',130,ARRAY['Französisch'],'https://example.ch','info@ps-geneve.ch','aktiv',46.2000,6.1450),
('Sensibilisation Lausanne','sensibilisation-lausanne','Rue Centrale 10','1003','Lausanne','VD','vku',105,ARRAY['Französisch'],'https://example.ch','info@sensi-lausanne.ch','aktiv',46.5200,6.6320),
('Fahrschule Aarau Mitte','fahrschule-aarau-mitte','Bahnhofplatz 1','5000','Aarau','AG','beide',155,ARRAY['Deutsch'],'https://example.ch','info@fahrschule-aarau.ch','aktiv',47.3900,8.0450),
('Primo Soccorso Lugano','primo-soccorso-lugano','Via Nassa 5','6900','Lugano','TI','nothelferkurs',125,ARRAY['Italienisch'],'https://example.ch','info@ps-lugano.ch','aktiv',46.0050,8.9500),
('VKU Zürich West','vku-zuerich-west','Hardstrasse 219','8005','Zürich','ZH','vku',99,ARRAY['Deutsch'],'https://example.ch','info@vku-zh-west.ch','aktiv',47.3880,8.5180),
('Nothelfer Plus Zürichsee','nothelfer-plus-zuerichsee','Seefeldstrasse 40','8008','Zürich','ZH','nothelferkurs',118,ARRAY['Deutsch'],'https://example.ch','info@nothelfer-plus.ch','aktiv',47.3560,8.5560)
ON CONFLICT DO NOTHING;