/**
 * Fornitore dati.
 *
 * L'app funziona SEMPRE con i dati inclusi nel codice (assets/js/data/*.js):
 * in questo modo è utilizzabile e installabile come PWA anche offline e anche
 * prima di configurare Supabase.
 *
 * Se in config.js sono presenti un URL Supabase e una anon key valida, l'app
 * prova a caricare ricette e ingredienti dal database (via REST/PostgREST):
 * in caso di qualunque errore, ricade automaticamente sui dati locali.
 *
 * Non viene mai usata la service_role key lato client: solo la anon key pubblica.
 */
(function () {
  "use strict";

  function localData() {
    return {
      source: "locale",
      micronutrients: window.MICRONUTRIENTS || {},
      ingredients: (window.INGREDIENTS || []).slice(),
      recipes: (window.RECIPES || []).slice(),
    };
  }

  function config() {
    var c = window.APP_CONFIG || {};
    var url = (c.supabaseUrl || "").trim().replace(/\/+$/, "");
    var key = (c.supabaseAnonKey || "").trim();
    if (!url || !key || url.indexOf("http") !== 0) return null;
    return { url: url, key: key };
  }

  function rest(cfg, path) {
    return fetch(cfg.url + "/rest/v1/" + path, {
      headers: {
        apikey: cfg.key,
        Authorization: "Bearer " + cfg.key,
        Accept: "application/json",
      },
    }).then(function (r) {
      if (!r.ok) throw new Error("Supabase HTTP " + r.status);
      return r.json();
    });
  }

  function buildFromSupabase(ingredients, recipes, links, micros) {
    // dizionario micronutrienti
    var microDict = {};
    (micros || []).forEach(function (m) {
      microDict[m.key] = { name: m.name, function: m.function };
    });
    if (Object.keys(microDict).length === 0) microDict = window.MICRONUTRIENTS || {};

    // ingredienti per recipe
    var byRecipe = {};
    (links || []).forEach(function (l) {
      (byRecipe[l.recipe_slug] = byRecipe[l.recipe_slug] || []).push(l);
    });
    Object.keys(byRecipe).forEach(function (k) {
      byRecipe[k].sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
    });

    var mapped = (recipes || []).map(function (r) {
      var ings = (byRecipe[r.slug] || []).map(function (l) {
        return { slug: l.ingredient_slug, grams: Number(l.grams), qty: l.qty || "" };
      });
      return {
        slug: r.slug,
        name: r.name,
        subtitle: r.subtitle,
        description: r.description,
        color_primary: r.color_primary,
        color_secondary: r.color_secondary,
        ingredients: ings,
        nutrition: {
          kcal: Number(r.kcal), carbs: Number(r.carbs), sugars: Number(r.sugars),
          fiber: Number(r.fiber), protein: Number(r.protein), fat: Number(r.fat),
        },
        micronutrients: r.micronutrients || [],
        benefits: r.benefits || [],
        tags: r.tags || [],
        preparation: r.preparation,
      };
    });

    return {
      source: "supabase",
      micronutrients: microDict,
      ingredients: (ingredients || []).map(function (i) {
        return {
          slug: i.slug, name: i.name, category: i.category, color: i.color,
          icon: i.icon, yield_ratio: Number(i.yield_ratio),
          contribution: i.contribution, notes: i.notes,
        };
      }),
      recipes: mapped,
    };
  }

  function load() {
    var cfg = config();
    if (!cfg) return Promise.resolve(localData());

    return Promise.all([
      rest(cfg, "ingredients?select=*&order=category,name"),
      rest(cfg, "recipes?select=*&order=name"),
      rest(cfg, "recipe_ingredients?select=*&order=recipe_slug,sort_order"),
      rest(cfg, "micronutrients?select=*").catch(function () { return []; }),
    ])
      .then(function (res) {
        var data = buildFromSupabase(res[0], res[1], res[2], res[3]);
        if (!data.recipes.length || !data.ingredients.length) return localData();
        return data;
      })
      .catch(function (err) {
        if (window.console) console.warn("Supabase non raggiungibile, uso i dati locali:", err.message);
        return localData();
      });
  }

  window.DataProvider = { load: load };
})();
