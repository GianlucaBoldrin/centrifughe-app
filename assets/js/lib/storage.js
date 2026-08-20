/**
 * Persistenza locale (localStorage).
 * Gestisce: ingredienti selezionati, preferiti, volume porzione.
 * Struttura pensata per una futura migrazione su Supabase per utenti autenticati:
 * tutte le letture/scritture passano da qui.
 */
(function () {
  "use strict";

  var KEYS = {
    ingredients: "centrifughe.selectedIngredients",
    favorites: "centrifughe.favorites",
    portion: "centrifughe.portionMl",
    theme: "centrifughe.theme",
  };

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* storage pieno o non disponibile: fallback silenzioso */
    }
  }

  window.Store = {
    // --- Ingredienti selezionati (array di slug) ---
    getSelectedIngredients: function () {
      var v = read(KEYS.ingredients, []);
      return Array.isArray(v) ? v : [];
    },
    setSelectedIngredients: function (slugs) {
      write(KEYS.ingredients, slugs);
    },

    // --- Preferiti (array di slug ricetta) ---
    getFavorites: function () {
      var v = read(KEYS.favorites, []);
      return Array.isArray(v) ? v : [];
    },
    setFavorites: function (slugs) {
      write(KEYS.favorites, slugs);
    },
    toggleFavorite: function (slug) {
      var favs = this.getFavorites();
      var idx = favs.indexOf(slug);
      if (idx === -1) favs.push(slug);
      else favs.splice(idx, 1);
      this.setFavorites(favs);
      return favs;
    },

    // --- Volume porzione (ml) ---
    getPortion: function () {
      var v = read(KEYS.portion, 600);
      return typeof v === "number" ? v : 600;
    },
    setPortion: function (ml) {
      write(KEYS.portion, ml);
    },

    // --- Tema: "light" | "dark" | "auto" (predefinito: light) ---
    getTheme: function () {
      var v = read(KEYS.theme, "light");
      return v === "dark" || v === "auto" ? v : "light";
    },
    setTheme: function (mode) {
      write(KEYS.theme, mode);
    },
  };
})();
