-- Verknüpft eine neue Partner-Registrierung mit dem recherchierten ("unbeanspruchten")
-- Eintrag, den sie beanspruchen soll. Ohne diese Spalte entstand beim Beanspruchen ein
-- komplett neuer, unverknüpfter Anbieter-Datensatz statt einer Übernahme des bestehenden
-- Eintrags — das Admin-Dashboard konnte die beiden nicht als zusammengehörig erkennen.

ALTER TABLE public.anbieter
  ADD COLUMN ersetzt_anbieter_id UUID REFERENCES public.anbieter(id) ON DELETE SET NULL;
