
CREATE TABLE public.kantone (
  kuerzel TEXT PRIMARY KEY,
  name TEXT NOT NULL
);
GRANT SELECT ON public.kantone TO anon, authenticated;
GRANT ALL ON public.kantone TO service_role;
ALTER TABLE public.kantone ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kantone_public_read" ON public.kantone FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.kantone (kuerzel, name) VALUES
('AG','Aargau'),('AI','Appenzell Innerrhoden'),('AR','Appenzell Ausserrhoden'),
('BE','Bern'),('BL','Basel-Landschaft'),('BS','Basel-Stadt'),('FR','Freiburg'),
('GE','Genf'),('GL','Glarus'),('GR','Graubünden'),('JU','Jura'),('LU','Luzern'),
('NE','Neuenburg'),('NW','Nidwalden'),('OW','Obwalden'),('SG','St. Gallen'),
('SH','Schaffhausen'),('SO','Solothurn'),('SZ','Schwyz'),('TG','Thurgau'),
('TI','Tessin'),('UR','Uri'),('VD','Waadt'),('VS','Wallis'),('ZG','Zug'),('ZH','Zürich');

CREATE TYPE public.kurstyp AS ENUM ('vku','nothelferkurs','beide');
CREATE TYPE public.anbieter_status AS ENUM ('aktiv','inaktiv');

CREATE TABLE public.anbieter (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  adresse TEXT,
  plz TEXT,
  ort TEXT,
  kanton TEXT REFERENCES public.kantone(kuerzel),
  kurstyp public.kurstyp NOT NULL DEFAULT 'vku',
  preis_chf NUMERIC(8,2),
  sprache TEXT[] NOT NULL DEFAULT ARRAY['Deutsch'],
  termine_url TEXT,
  website_url TEXT,
  kontakt_email TEXT,
  kontakt_telefon TEXT,
  status public.anbieter_status NOT NULL DEFAULT 'inaktiv',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX anbieter_kanton_idx ON public.anbieter (kanton);
CREATE INDEX anbieter_kurstyp_idx ON public.anbieter (kurstyp);

GRANT SELECT, INSERT, UPDATE ON public.anbieter TO authenticated;
GRANT SELECT, INSERT ON public.anbieter TO anon;
GRANT ALL ON public.anbieter TO service_role;
ALTER TABLE public.anbieter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anbieter_public_read_active" ON public.anbieter
  FOR SELECT TO anon, authenticated USING (status = 'aktiv');
CREATE POLICY "anbieter_owner_read" ON public.anbieter
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "anbieter_public_signup" ON public.anbieter
  FOR INSERT TO anon WITH CHECK (status = 'inaktiv' AND user_id IS NULL);
CREATE POLICY "anbieter_authenticated_signup" ON public.anbieter
  FOR INSERT TO authenticated WITH CHECK (status = 'inaktiv' AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "anbieter_owner_update" ON public.anbieter
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.anbieter_protect_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status := OLD.status;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER anbieter_protect_status_trg BEFORE UPDATE ON public.anbieter
  FOR EACH ROW EXECUTE FUNCTION public.anbieter_protect_status();

CREATE TABLE public.kurstermine (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anbieter_id UUID NOT NULL REFERENCES public.anbieter(id) ON DELETE CASCADE,
  kursbeginn DATE NOT NULL,
  plaetze_frei INTEGER,
  quelle_zuletzt_geprueft DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX kurstermine_anbieter_idx ON public.kurstermine (anbieter_id, kursbeginn);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.kurstermine TO authenticated;
GRANT SELECT ON public.kurstermine TO anon;
GRANT ALL ON public.kurstermine TO service_role;
ALTER TABLE public.kurstermine ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kurstermine_public_read" ON public.kurstermine
  FOR SELECT TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM public.anbieter a WHERE a.id = anbieter_id AND a.status = 'aktiv')
  );
CREATE POLICY "kurstermine_owner_all" ON public.kurstermine
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.anbieter a WHERE a.id = anbieter_id AND a.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.anbieter a WHERE a.id = anbieter_id AND a.user_id = auth.uid())
  );
