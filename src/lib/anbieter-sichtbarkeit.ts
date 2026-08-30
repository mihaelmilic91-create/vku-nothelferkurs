/**
 * Anbieter ohne user_id sind reine Recherche-Einträge ("unbeansprucht").
 * Für diese werden keine Kontaktdaten ausgespielt.
 */
export type MitAnspruch = {
  user_id?: string | null;
  kontakt_email?: string | null;
  kontakt_telefon?: string | null;
  termine_url?: string | null;
};

export function oeffentlicherAnbieter<T extends MitAnspruch>(a: T) {
  const beansprucht = Boolean(a.user_id);
  const { user_id: _user_id, ...rest } = a;
  return {
    ...rest,
    beansprucht,
    kontakt_email: beansprucht ? (a.kontakt_email ?? null) : null,
    kontakt_telefon: beansprucht ? (a.kontakt_telefon ?? null) : null,
    termine_url: beansprucht ? (a.termine_url ?? null) : null,
  };
}
