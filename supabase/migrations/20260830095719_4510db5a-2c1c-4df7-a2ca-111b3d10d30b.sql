ALTER TABLE public.kurstermine DROP CONSTRAINT kurstermine_anbieter_id_fkey;
ALTER TABLE public.kurstermine ADD CONSTRAINT kurstermine_anbieter_id_fkey
  FOREIGN KEY (anbieter_id) REFERENCES public.anbieter(id) ON DELETE CASCADE;
ALTER TABLE public.gutschein_klicks DROP CONSTRAINT gutschein_klicks_anbieter_id_fkey;
ALTER TABLE public.gutschein_klicks ADD CONSTRAINT gutschein_klicks_anbieter_id_fkey
  FOREIGN KEY (anbieter_id) REFERENCES public.anbieter(id) ON DELETE CASCADE;