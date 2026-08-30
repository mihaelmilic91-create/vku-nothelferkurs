CREATE TABLE public.gutschein_klicks (
  id uuid primary key default gen_random_uuid(),
  anbieter_id uuid not null references public.anbieter(id) on delete cascade,
  zeitpunkt timestamptz not null default now(),
  email text
);
GRANT INSERT ON public.gutschein_klicks TO anon, authenticated;
GRANT ALL ON public.gutschein_klicks TO service_role;
ALTER TABLE public.gutschein_klicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY gutschein_klicks_insert ON public.gutschein_klicks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY gutschein_klicks_owner_read ON public.gutschein_klicks FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.anbieter a WHERE a.id = gutschein_klicks.anbieter_id AND a.user_id = auth.uid()));
CREATE INDEX gutschein_klicks_anbieter_idx ON public.gutschein_klicks(anbieter_id, zeitpunkt DESC);