-- Bisher konnte niemand Kurstermine eintragen: RLS erlaubte auf kurstermine nur
-- öffentliches Lesen und Vollzugriff für den Eigentümer (user_id-Match). Admins
-- hatten keine Möglichkeit, Termine für recherchierte (noch nicht beanspruchte)
-- Anbieter zu pflegen. Analog zu den bestehenden anbieter_admin_* Policies:

CREATE POLICY kurstermine_admin_all ON public.kurstermine
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
