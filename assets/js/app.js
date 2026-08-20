/* =========================================================================
 * Centrifughe & Estratti — logica applicativa (Vanilla JS, zero build)
 * ========================================================================= */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var el = function (tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  };

  var CATEGORY_LABELS = {
    "frutta": "Frutta",
    "verdura": "Verdura",
    "frutti-di-bosco": "Frutti di bosco",
    "aromatici": "Aromatici / extra",
  };
  var CATEGORY_ORDER = ["frutta", "verdura", "frutti-di-bosco", "aromatici"];

  var TAG_LABELS = {
    "fresca": "Fresca", "dolce": "Dolce", "vegetale": "Vegetale",
    "agrumata": "Agrumata", "speziata": "Speziata", "frutti-di-bosco": "Frutti di bosco",
    "ricca-vit-c": "Ricca di vitamina C", "ricca-carotenoidi": "Ricca di carotenoidi",
  };

  // Filtri disponibili (tag + soglie caloriche)
  var FILTERS = [
    { id: "fresca", label: "Fresca", test: function (r) { return has(r.tags, "fresca"); } },
    { id: "dolce", label: "Dolce", test: function (r) { return has(r.tags, "dolce"); } },
    { id: "vegetale", label: "Vegetale", test: function (r) { return has(r.tags, "vegetale"); } },
    { id: "agrumata", label: "Agrumata", test: function (r) { return has(r.tags, "agrumata"); } },
    { id: "speziata", label: "Speziata", test: function (r) { return has(r.tags, "speziata"); } },
    { id: "frutti-di-bosco", label: "Frutti di bosco", test: function (r) { return has(r.tags, "frutti-di-bosco"); } },
    { id: "ricca-vit-c", label: "Ricca di vit. C", test: function (r) { return has(r.tags, "ricca-vit-c"); } },
    { id: "ricca-carotenoidi", label: "Ricca di carotenoidi", test: function (r) { return has(r.tags, "ricca-carotenoidi"); } },
    { id: "kcal200", label: "< 200 kcal", test: function (r) { return r.nutrition.kcal < 200; } },
    { id: "kcal150", label: "< 150 kcal", test: function (r) { return r.nutrition.kcal < 150; } },
  ];

  var SORTS = [
    { id: "compat", label: "Migliore compatibilità" },
    { id: "kcal-asc", label: "Meno calorica" },
    { id: "kcal-desc", label: "Più calorica" },
    { id: "ing-asc", label: "Meno ingredienti" },
    { id: "ing-desc", label: "Più ingredienti" },
    { id: "name", label: "Nome A-Z" },
  ];

  function has(arr, v) { return arr && arr.indexOf(v) !== -1; }

  // ---- Stato ----
  var state = {
    data: null,
    ingredientMap: {},
    selected: new Set(),
    favorites: new Set(),
    portion: 600,
    ingredientSearch: "",
    recipeSearch: "",
    sort: "compat",
    activeFilters: new Set(),
    onlyFavorites: false,
    viewAll: false, // "Tutte le ricette"
  };

  // ---- Avvio ----
  function boot() {
    DataProvider.load().then(function (data) {
      state.data = data;
      data.ingredients.forEach(function (i) { state.ingredientMap[i.slug] = i; });
      state.selected = new Set(Store.getSelectedIngredients().filter(function (s) { return state.ingredientMap[s]; }));
      state.favorites = new Set(Store.getFavorites());
      state.portion = Store.getPortion();
      var badge = $("#data-source");
      if (badge) badge.textContent = data.source === "supabase" ? "dati: Supabase" : "dati: locali";
      buildIngredients();
      buildToolbar();
      render();
    });
  }

  // ---- Pannello ingredienti ----
  function buildIngredients() {
    var wrap = $("#ingredients");
    wrap.innerHTML = "";
    var grouped = {};
    state.data.ingredients.forEach(function (i) { (grouped[i.category] = grouped[i.category] || []).push(i); });

    CATEGORY_ORDER.forEach(function (cat) {
      var items = grouped[cat] || [];
      if (!items.length) return;
      var chips = el("div", { class: "chips" }, items.map(function (ing) {
        return makeChip(ing);
      }));
      wrap.appendChild(el("div", { class: "ing-group", "data-cat": cat }, [
        el("h3", { class: "ing-group-title", text: CATEGORY_LABELS[cat] }),
        chips,
      ]));
    });
    updateChipStates();
  }

  function makeChip(ing) {
    return el("button", {
      class: "chip", type: "button", "data-slug": ing.slug, "aria-pressed": "false",
      onclick: function () { toggleIngredient(ing.slug); },
    }, [
      el("span", { class: "chip-icon", text: ing.icon || "" }),
      el("span", { class: "chip-name", text: ing.name }),
      el("span", { class: "chip-check", html: "&#10003;" }),
    ]);
  }

  function toggleIngredient(slug) {
    if (state.selected.has(slug)) state.selected.delete(slug);
    else state.selected.add(slug);
    Store.setSelectedIngredients(Array.from(state.selected));
    updateChipStates();
    render();
  }

  function updateChipStates() {
    var q = state.ingredientSearch.toLowerCase();
    document.querySelectorAll(".chip").forEach(function (c) {
      var slug = c.getAttribute("data-slug");
      var ing = state.ingredientMap[slug];
      var on = state.selected.has(slug);
      c.classList.toggle("chip--on", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
      var match = !q || (ing && ing.name.toLowerCase().indexOf(q) !== -1);
      c.style.display = match ? "" : "none";
    });
    // nasconde i gruppi senza chip visibili
    document.querySelectorAll(".ing-group").forEach(function (g) {
      var anyVisible = Array.prototype.some.call(g.querySelectorAll(".chip"), function (c) { return c.style.display !== "none"; });
      g.style.display = anyVisible ? "" : "none";
    });
    var count = state.selected.size;
    var lbl = $("#selected-count");
    if (lbl) lbl.textContent = count === 0 ? "Nessun ingrediente selezionato" :
      (count === 1 ? "1 ingrediente selezionato" : count + " ingredienti selezionati");
  }

  // ---- Toolbar (ricerca, ordina, filtri) ----
  function buildToolbar() {
    // ordina
    var sortSel = $("#sort");
    SORTS.forEach(function (s) { sortSel.appendChild(el("option", { value: s.id, text: s.label })); });
    sortSel.value = state.sort;
    sortSel.addEventListener("change", function () { state.sort = sortSel.value; render(); });

    // filtri
    var fwrap = $("#filters");
    FILTERS.forEach(function (f) {
      fwrap.appendChild(el("button", {
        class: "filter", type: "button", "data-id": f.id,
        text: f.label,
        onclick: function (e) {
          if (state.activeFilters.has(f.id)) state.activeFilters.delete(f.id);
          else state.activeFilters.add(f.id);
          e.currentTarget.classList.toggle("filter--on");
          render();
        },
      }));
    });

    // ricerca ingredienti
    $("#ing-search").addEventListener("input", function (e) {
      state.ingredientSearch = e.target.value;
      updateChipStates();
    });
    // ricerca ricette
    $("#recipe-search").addEventListener("input", function (e) {
      state.recipeSearch = e.target.value;
      render();
    });

    $("#select-all").addEventListener("click", function () {
      state.data.ingredients.forEach(function (i) { state.selected.add(i.slug); });
      Store.setSelectedIngredients(Array.from(state.selected));
      updateChipStates(); render();
    });
    $("#select-none").addEventListener("click", function () {
      state.selected.clear();
      Store.setSelectedIngredients([]);
      updateChipStates(); render();
    });

    $("#btn-surprise").addEventListener("click", surprise);
    $("#btn-favorites").addEventListener("click", function (e) {
      state.onlyFavorites = !state.onlyFavorites;
      e.currentTarget.classList.toggle("toggle--on", state.onlyFavorites);
      render();
    });
    $("#btn-viewall").addEventListener("click", function (e) {
      state.viewAll = !state.viewAll;
      e.currentTarget.classList.toggle("toggle--on", state.viewAll);
      e.currentTarget.textContent = state.viewAll ? "Vista per ingredienti" : "Tutte le ricette";
      render();
    });

    $("#btn-info").addEventListener("click", openInfo);
    $("#info-close").addEventListener("click", closeInfo);
    $("#info-modal").addEventListener("click", function (e) { if (e.target.id === "info-modal") closeInfo(); });
    $("#modal").addEventListener("click", function (e) { if (e.target.id === "modal") closeModal(); });
    $("#modal-close").addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeModal(); closeInfo(); }
    });
  }

  // ---- Rendering risultati ----
  function passesFilters(r) {
    if (state.onlyFavorites && !state.favorites.has(r.slug)) return false;
    var ok = true;
    state.activeFilters.forEach(function (id) {
      var f = FILTERS.filter(function (x) { return x.id === id; })[0];
      if (f && !f.test(r)) ok = false;
    });
    if (!ok) return false;
    var q = state.recipeSearch.trim().toLowerCase();
    if (q) {
      var inName = r.name.toLowerCase().indexOf(q) !== -1 || (r.subtitle || "").toLowerCase().indexOf(q) !== -1;
      var inIng = r.ingredients.some(function (i) {
        var ing = state.ingredientMap[i.slug];
        return ing && ing.name.toLowerCase().indexOf(q) !== -1;
      });
      if (!inName && !inIng) return false;
    }
    return true;
  }

  function sortRecipes(list) {
    var s = state.sort;
    var arr = list.slice();
    arr.sort(function (a, b) {
      switch (s) {
        case "kcal-asc": return a.nutrition.kcal - b.nutrition.kcal;
        case "kcal-desc": return b.nutrition.kcal - a.nutrition.kcal;
        case "ing-asc": return a.ingredients.length - b.ingredients.length;
        case "ing-desc": return b.ingredients.length - a.ingredients.length;
        case "name": return a.name.localeCompare(b.name, "it");
        case "compat":
        default:
          return b._compat.percent - a._compat.percent || a.name.localeCompare(b.name, "it");
      }
    });
    return arr;
  }

  function render() {
    var owned = state.selected;
    var recipes = state.data.recipes.map(function (r) {
      r._compat = Calc.compatibility(r, owned);
      return r;
    });

    var visible = recipes.filter(passesFilters);
    var results = $("#results");
    results.innerHTML = "";

    if (state.viewAll) {
      renderSection(results, "Tutte le ricette", sortRecipes(visible), true);
      renderEmptyIfNeeded(results, visible.length);
      return;
    }

    var ready = sortRecipes(visible.filter(function (r) { return r._compat.status === "ready"; }));
    var almost = sortRecipes(visible.filter(function (r) { return r._compat.status === "almost"; }));
    var other = sortRecipes(visible.filter(function (r) { return r._compat.status === "other"; }));

    // Riepilogo "Cosa posso fare"
    var summary = $("#summary");
    if (owned.size === 0) {
      summary.innerHTML = "";
      summary.appendChild(el("p", { class: "summary-hint", text: "Seleziona gli ingredienti che hai in casa per scoprire quali centrifughe puoi preparare." }));
    } else {
      summary.innerHTML = "";
      summary.appendChild(el("p", { class: "summary-line" }, [
        el("strong", { text: ready.length }),
        document.createTextNode(ready.length === 1 ? " centrifuga puoi prepararla ora" : " centrifughe puoi prepararle ora"),
        almost.length ? el("span", { class: "summary-sep", text: " · " }) : null,
        almost.length ? el("span", { text: "a " + almost.length + (almost.length === 1 ? " manca un solo ingrediente" : " manca un solo ingrediente") }) : null,
      ]));
    }

    if (ready.length) renderSection(results, "Puoi preparare " + ready.length + (ready.length === 1 ? " centrifuga" : " centrifughe"), ready, false, "ready");
    if (almost.length) renderSection(results, "Ti manca soltanto un ingrediente", almost, false, "almost");
    renderSection(results, owned.size === 0 ? "Tutte le ricette" : "Altre ricette", other, false, "other");

    renderEmptyIfNeeded(results, visible.length);
  }

  function renderEmptyIfNeeded(container, count) {
    if (count === 0) {
      container.appendChild(el("div", { class: "empty", text: "Nessuna ricetta corrisponde ai filtri o alla ricerca." }));
    }
  }

  function renderSection(container, title, list, flat, kind) {
    if (!list.length && kind !== "other") return;
    if (!list.length && kind === "other") return;
    var sec = el("section", { class: "rec-section" });
    sec.appendChild(el("h2", { class: "section-title", text: title }));
    var grid = el("div", { class: "grid" });
    list.forEach(function (r) { grid.appendChild(recipeCard(r)); });
    sec.appendChild(grid);
    container.appendChild(sec);
  }

  // ---- Card ricetta ----
  function recipeCard(r) {
    var c = r._compat;
    var mainIngs = r.ingredients.slice(0, 4).map(function (i) {
      return (state.ingredientMap[i.slug] || {}).name || i.slug;
    }).join(" · ");

    var badge;
    if (c.status === "ready") badge = el("span", { class: "badge badge--ready", text: "100% disponibile" });
    else badge = el("span", { class: "badge", text: c.ownedCount + "/" + c.totalCount + " ingredienti" });

    var missingLine = null;
    if (c.status === "almost") {
      var m = state.ingredientMap[c.missing[0]];
      missingLine = el("p", { class: "missing", html: "Ti manca: <strong>" + escapeHtml((m || {}).name || c.missing[0]) + "</strong>" });
    }

    var fav = state.favorites.has(r.slug);
    var favBtn = el("button", {
      class: "fav" + (fav ? " fav--on" : ""), type: "button",
      "aria-label": fav ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti",
      title: fav ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti",
      onclick: function (e) { e.stopPropagation(); toggleFav(r.slug, e.currentTarget); },
    }, [el("span", { html: fav ? "&#9733;" : "&#9734;" })]);

    var card = el("article", {
      class: "card", "data-slug": r.slug, tabindex: "0", role: "button",
      "aria-label": "Apri " + r.name,
      style: "--c: " + r.color_primary + "; --c2: " + r.color_secondary + ";",
      onclick: function () { openModal(r); },
      onkeydown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(r); } },
    }, [
      el("div", { class: "card-accent" }),
      favBtn,
      el("div", { class: "card-body" }, [
        el("h3", { class: "card-title", text: r.name }),
        el("p", { class: "card-sub", text: mainIngs }),
        el("p", { class: "card-desc", text: r.description }),
        missingLine,
        el("div", { class: "card-meta" }, [
          badge,
          el("span", { class: "meta-dot", text: "~" + state.portion + " ml" }),
          el("span", { class: "meta-dot", text: kcalScaled(r) + " kcal" }),
        ]),
        el("div", { class: "card-tags" }, r.tags.slice(0, 3).map(function (t) {
          return el("span", { class: "tag", text: TAG_LABELS[t] || t });
        })),
      ]),
    ]);
    return card;
  }

  function kcalScaled(r) {
    return Calc.scaledNutrition(r.nutrition, state.portion).kcal;
  }

  function toggleFav(slug, btn) {
    var favs = Store.toggleFavorite(slug);
    state.favorites = new Set(favs);
    var on = state.favorites.has(slug);
    if (btn) {
      btn.classList.toggle("fav--on", on);
      btn.querySelector("span").innerHTML = on ? "&#9733;" : "&#9734;";
    }
    if (state.onlyFavorites) render();
  }

  // ---- Modale dettaglio ricetta ----
  function openModal(r) {
    var body = $("#modal-body");
    body.innerHTML = "";
    body.style.setProperty("--c", r.color_primary);
    body.style.setProperty("--c2", r.color_secondary);
    var c = r._compat || Calc.compatibility(r, state.selected);

    // Header
    body.appendChild(el("div", { class: "m-header" }, [
      el("h2", { class: "m-title", text: r.name }),
      el("p", { class: "m-sub", text: r.subtitle }),
      el("p", { class: "m-desc", text: r.description }),
    ]));

    // Compatibilità + preferito
    var favOn = state.favorites.has(r.slug);
    var badge = c.status === "ready"
      ? el("span", { class: "badge badge--ready", text: "100% disponibile" })
      : el("span", { class: "badge", text: c.ownedCount + "/" + c.totalCount + " disponibili (" + c.percent + "%)" });
    var mFav = el("button", {
      class: "btn-fav" + (favOn ? " btn-fav--on" : ""), type: "button",
      html: (favOn ? "&#9733; Nei preferiti" : "&#9734; Aggiungi ai preferiti"),
      onclick: function (e) {
        var favs = Store.toggleFavorite(r.slug);
        state.favorites = new Set(favs);
        var on = state.favorites.has(r.slug);
        e.currentTarget.classList.toggle("btn-fav--on", on);
        e.currentTarget.innerHTML = on ? "&#9733; Nei preferiti" : "&#9734; Aggiungi ai preferiti";
        render();
      },
    });
    var missing = c.status !== "ready" && c.missing.length
      ? el("p", { class: "missing", html: "Ti manca: <strong>" + c.missing.map(function (s) { return escapeHtml((state.ingredientMap[s] || {}).name || s); }).join(", ") + "</strong>" })
      : null;
    body.appendChild(el("div", { class: "m-compat" }, [badge, mFav]));
    if (missing) body.appendChild(missing);

    // Selettore porzione
    var portionWrap = el("div", { class: "m-portion" }, [
      el("span", { class: "m-portion-label", text: "Porzione:" }),
    ]);
    Calc.PORTIONS.forEach(function (ml) {
      portionWrap.appendChild(el("button", {
        class: "portion" + (ml === state.portion ? " portion--on" : ""), type: "button",
        "data-ml": ml, text: ml + " ml",
        onclick: function () {
          state.portion = ml;
          Store.setPortion(ml);
          openModal(r); // ridisegna la modale con i nuovi valori
          render();      // aggiorna anche le card
        },
      }));
    });
    body.appendChild(portionWrap);

    // Ingredienti (tabella)
    var rows = r.ingredients.map(function (i) {
      var ing = state.ingredientMap[i.slug] || { name: i.slug };
      var owned = state.selected.has(i.slug);
      var g = Calc.scaledGrams(i.grams, state.portion);
      return el("tr", { class: owned ? "" : "row-missing" }, [
        el("td", {}, [
          el("span", { class: "td-icon", text: ing.icon || "" }),
          document.createTextNode(" " + ing.name),
          owned ? null : el("span", { class: "td-missing", text: " (manca)" }),
        ]),
        el("td", { class: "td-qty", text: g + " g" + (i.qty ? "  ·  " + i.qty : "") }),
      ]);
    });
    body.appendChild(section("Ingredienti", el("table", { class: "m-table" }, [
      el("thead", {}, [el("tr", {}, [el("th", { text: "Ingrediente" }), el("th", { text: "Quantità" })])]),
      el("tbody", {}, rows),
    ])));

    // Valori nutrizionali
    var n = Calc.scaledNutrition(r.nutrition, state.portion);
    var nutrGrid = el("div", { class: "nutri-grid" }, [
      nutri("Energia", n.kcal + " kcal"),
      nutri("Carboidrati", n.carbs + " g"),
      nutri("di cui zuccheri", n.sugars + " g"),
      nutri("Fibre", n.fiber + " g"),
      nutri("Proteine", n.protein + " g"),
      nutri("Grassi", n.fat + " g"),
    ]);
    var nutrNotes = el("div", { class: "m-notes" }, [
      el("p", { text: "La quantità effettiva di fibra di un centrifugato è molto inferiore rispetto al frutto o alla verdura interi perché gran parte della fibra insolubile viene eliminata con la polpa." }),
      el("p", { text: "Valori nutrizionali stimati: possono variare in funzione della varietà, maturazione e resa della centrifuga." }),
    ]);
    body.appendChild(section("Valori nutrizionali indicativi (~" + state.portion + " ml)", el("div", {}, [nutrGrid, nutrNotes])));

    // Micronutrienti
    if (r.micronutrients && r.micronutrients.length) {
      var micList = el("ul", { class: "micro-list" }, r.micronutrients.map(function (k) {
        var m = state.data.micronutrients[k];
        if (!m) return null;
        return el("li", {}, [el("strong", { text: m.name }), el("span", { text: " — " + m.function })]);
      }));
      body.appendChild(section("Vitamine e micronutrienti", micList));
    }

    // Perché sceglierla
    if (r.benefits && r.benefits.length) {
      body.appendChild(section("Perché sceglierla", el("ul", { class: "benefit-list" }, r.benefits.map(function (b) {
        return el("li", { text: b });
      }))));
    }

    // Cosa apportano gli ingredienti
    var contribs = r.ingredients.map(function (i) {
      var ing = state.ingredientMap[i.slug];
      if (!ing || !ing.contribution) return null;
      return el("li", {}, [
        el("strong", { text: (ing.icon ? ing.icon + " " : "") + ing.name }),
        el("span", { text: " — " + ing.contribution }),
      ]);
    }).filter(Boolean);
    body.appendChild(section("Cosa apportano gli ingredienti", el("ul", { class: "contrib-list" }, contribs)));

    // Preparazione
    body.appendChild(section("Preparazione", el("p", { class: "prep", text: r.preparation })));

    openOverlay("#modal");
  }

  function section(title, content) {
    return el("section", { class: "m-section" }, [
      el("h3", { class: "m-section-title", text: title }),
      content,
    ]);
  }
  function nutri(label, value) {
    return el("div", { class: "nutri" }, [
      el("span", { class: "nutri-val", text: value }),
      el("span", { class: "nutri-lbl", text: label }),
    ]);
  }

  function surprise() {
    var pool = state.data.recipes.filter(passesFilters);
    if (!pool.length) pool = state.data.recipes;
    var r = pool[Math.floor(Math.random() * pool.length)];
    r._compat = Calc.compatibility(r, state.selected);
    openModal(r);
  }

  // ---- Overlay helpers ----
  function openOverlay(sel) { var o = $(sel); o.classList.add("open"); document.body.classList.add("no-scroll"); }
  function closeOverlay(sel) { var o = $(sel); o.classList.remove("open"); document.body.classList.remove("no-scroll"); }
  function closeModal() { closeOverlay("#modal"); }
  function openInfo() { openOverlay("#info-modal"); }
  function closeInfo() { closeOverlay("#info-modal"); }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---- PWA: registrazione service worker + prompt installazione ----
  function initPWA() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("./sw.js").catch(function () {});
      });
    }
    var deferred = null;
    var banner = $("#install-banner");
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      deferred = e;
      if (banner) banner.hidden = false;
    });
    if (banner) {
      $("#install-yes").addEventListener("click", function () {
        if (deferred) { deferred.prompt(); deferred = null; }
        banner.hidden = true;
      });
      $("#install-no").addEventListener("click", function () { banner.hidden = true; });
    }
    // Suggerimento iOS (nessun beforeinstallprompt su Safari)
    var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    var standalone = ("standalone" in navigator) && navigator.standalone;
    var iosHint = $("#ios-hint");
    if (isIOS && !standalone && iosHint) {
      var dismissed = localStorage.getItem("centrifughe.iosHintDismissed");
      if (!dismissed) {
        iosHint.hidden = false;
        $("#ios-hint-close").addEventListener("click", function () {
          iosHint.hidden = true;
          localStorage.setItem("centrifughe.iosHintDismissed", "1");
        });
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initPWA();
    boot();
  });
})();
