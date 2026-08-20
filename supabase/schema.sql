-- ============================================================
-- schema.sql — struttura del database (Supabase / PostgreSQL)
-- Eseguire per PRIMO nell'editor SQL di Supabase.
-- Poi eseguire  policies.sql  e infine  seed.sql.
-- ============================================================

-- Estensione utile (di solito già attiva su Supabase)
create extension if not exists "pgcrypto";

-- ---------- Micronutrienti (dizionario) ----------
create table if not exists public.micronutrients (
  key          text primary key,
  name         text not null,
  "function"   text not null
);

-- ---------- Ingredienti ----------
create table if not exists public.ingredients (
  slug          text primary key,
  name          text not null,
  category      text not null check (category in ('frutta','verdura','frutti-di-bosco','aromatici')),
  color         text,
  icon          text,
  yield_ratio   numeric,
  contribution  text,
  notes         text
);

-- ---------- Ricette ----------
create table if not exists public.recipes (
  slug            text primary key,
  name            text not null,
  subtitle        text,
  description     text,
  color_primary   text,
  color_secondary text,
  kcal            integer,
  carbs           numeric,
  sugars          numeric,
  fiber           numeric,
  protein         numeric,
  fat             numeric,
  micronutrients  jsonb default '[]'::jsonb,  -- array di chiavi -> micronutrients.key
  benefits        jsonb default '[]'::jsonb,  -- array di stringhe
  tags            jsonb default '[]'::jsonb,  -- array di stringhe
  preparation     text
);

-- ---------- Collegamento ricette <-> ingredienti ----------
create table if not exists public.recipe_ingredients (
  id               bigint generated always as identity primary key,
  recipe_slug      text not null references public.recipes(slug) on delete cascade,
  ingredient_slug  text not null references public.ingredients(slug) on delete restrict,
  grams            numeric not null,
  qty              text,
  sort_order       integer default 0
);

create index if not exists idx_recipe_ingredients_recipe on public.recipe_ingredients(recipe_slug);
create index if not exists idx_recipe_ingredients_ingredient on public.recipe_ingredients(ingredient_slug);

-- ---------- (Opzionale, per il futuro) Preferiti per utente autenticato ----------
-- Non necessaria alla prima versione: i preferiti anonimi usano localStorage.
create table if not exists public.favorites (
  user_id      uuid not null references auth.users(id) on delete cascade,
  recipe_slug  text not null references public.recipes(slug) on delete cascade,
  created_at   timestamptz default now(),
  primary key (user_id, recipe_slug)
);
