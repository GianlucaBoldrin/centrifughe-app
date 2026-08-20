/**
 * Calcoli: compatibilità ricette e ridimensionamento porzioni.
 */
(function () {
  "use strict";

  var BASE_ML = 600;

  /**
   * Compatibilità di una ricetta rispetto agli ingredienti posseduti.
   * @param {Object} recipe
   * @param {Set<string>} ownedSet  set di slug posseduti
   * @returns {{ownedCount, totalCount, percent, missing: string[], status}}
   *   status: "ready" | "almost" | "other"
   */
  function compatibility(recipe, ownedSet) {
    var needed = recipe.ingredients.map(function (i) { return i.slug; });
    var missing = [];
    var ownedCount = 0;
    needed.forEach(function (slug) {
      if (ownedSet.has(slug)) ownedCount++;
      else missing.push(slug);
    });
    var totalCount = needed.length;
    var percent = totalCount === 0 ? 0 : Math.round((ownedCount / totalCount) * 100);
    var status = missing.length === 0 ? "ready" : (missing.length === 1 ? "almost" : "other");
    return {
      ownedCount: ownedCount,
      totalCount: totalCount,
      percent: percent,
      missing: missing,
      status: status,
    };
  }

  /** Fattore di scala rispetto ai 600 ml di riferimento. */
  function scaleFactor(ml) {
    return (ml || BASE_ML) / BASE_ML;
  }

  /** Arrotonda i grammi in modo leggibile (interi, step piccoli per aromatici). */
  function roundGrams(g) {
    if (g < 20) return Math.round(g);
    if (g < 100) return Math.round(g / 5) * 5;
    return Math.round(g / 10) * 10;
  }

  /** Grammi scalati di un ingrediente ricetta. */
  function scaledGrams(grams, ml) {
    return roundGrams(grams * scaleFactor(ml));
  }

  /** Valori nutrizionali scalati per il volume scelto. */
  function scaledNutrition(nutrition, ml) {
    var f = scaleFactor(ml);
    function r(v, dec) {
      var m = Math.pow(10, dec || 0);
      return Math.round(v * f * m) / m;
    }
    return {
      kcal: Math.round(nutrition.kcal * f),
      carbs: r(nutrition.carbs, 1),
      sugars: r(nutrition.sugars, 1),
      fiber: r(nutrition.fiber, 1),
      protein: r(nutrition.protein, 1),
      fat: r(nutrition.fat, 1),
    };
  }

  window.Calc = {
    BASE_ML: BASE_ML,
    PORTIONS: [300, 450, 600, 900, 1200],
    compatibility: compatibility,
    scaleFactor: scaleFactor,
    scaledGrams: scaledGrams,
    scaledNutrition: scaledNutrition,
  };
})();
