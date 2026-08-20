-- ============================================================
-- policies.sql — Row Level Security (RLS)
-- Eseguire DOPO schema.sql (e prima o dopo seed.sql, indifferente).
--
-- Principio:
--   * Ricette, ingredienti e micronutrienti = dati PUBBLICI:
--       lettura consentita a tutti (anche client anonimo con anon key),
--       scrittura NON consentita dal client (solo dal pannello Supabase /
--       service_role, che ignora la RLS).
--   * Preferiti = privati per utente autenticato (per uso futuro).
-- ============================================================

-- Abilita RLS su tutte le tabelle
alter table public.micronutrients     enable row level security;
alter table public.ingredients        enable row level security;
alter table public.recipes            enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.favorites          enable row level security;

-- ---------- Lettura pubblica (dati del catalogo) ----------
drop policy if exists "public read micronutrients" on public.micronutrients;
create policy "public read micronutrients"
  on public.micronutrients for select
  to anon, authenticated
  using (true);

drop policy if exists "public read ingredients" on public.ingredients;
create policy "public read ingredients"
  on public.ingredients for select
  to anon, authenticated
  using (true);

drop policy if exists "public read recipes" on public.recipes;
create policy "public read recipes"
  on public.recipes for select
  to anon, authenticated
  using (true);

drop policy if exists "public read recipe_ingredients" on public.recipe_ingredients;
create policy "public read recipe_ingredients"
  on public.recipe_ingredients for select
  to anon, authenticated
  using (true);

-- NB: non creiamo policy di INSERT/UPDATE/DELETE per anon/authenticated su questi
-- cataloghi: senza policy permissive, la scrittura dal client è negata.
-- Le modifiche si fanno dal pannello Supabase (bypassa la RLS con service_role).

-- ---------- Preferiti privati (uso futuro, con login) ----------
drop policy if exists "own favorites - select" on public.favorites;
create policy "own favorites - select"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "own favorites - insert" on public.favorites;
create policy "own favorites - insert"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "own favorites - delete" on public.favorites;
create policy "own favorites - delete"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = user_id);
