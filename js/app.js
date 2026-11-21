/*
  Daniel's Hub: homepage behaviour.
  Draws the category cards (which link to their own pages) and the
  resource list, and runs search. Shared helpers live in js/ui.js,
  settings in js/config.js.
*/
(function () {
  "use strict";

  var H = window.Hub;
  var cfg = window.HUB_CONFIG || {};
  var categories = H.data.categories;
  var resources = H.sortedResources();

  var body = document.body;
  var els = {
    form: document.getElementById("search-form"),
    input: document.getElementById("q"),
    clear: document.getElementById("clear-search"),
    cancel: document.getElementById("cancel-search"),
    anchor: document.getElementById("search-anchor"),
    admin: document.getElementById("admin-panel"),
    adminLink: document.getElementById("admin-link"),
    cats: document.getElementById("cats"),
    fresh: document.getElementById("fresh"),
    title: document.getElementById("fresh-title"),
    status: document.getElementById("status"),
    list: document.getElementById("list"),
    empty: document.getElementById("empty"),
    emptyTitle: document.querySelector("#empty .empty-title"),
    emptyText: document.getElementById("empty-text"),
    reset: document.getElementById("reset"),
    emptyReset: document.getElementById("empty-reset"),
    filterBar: document.getElementById("filter-bar"),
    filterBtn: document.getElementById("filter-btn"),
    filterCount: document.getElementById("filter-count"),
    filterSummary: document.getElementById("filter-summary"),
    filterPanel: document.getElementById("filter-panel"),
    dockHome: document.getElementById("dock-home"),
    dockBrowse: document.getElementById("dock-browse"),
    dockSearch: document.getElementById("dock-search")
  };

  var query = "";
  var blurTimer = null;
  var shownKey = null;

  /* Search filters. They apply to search results only, never to Fresh drops.
       category: narrows resources. Collections are not tied to a category, so they are
                 never removed by it.
       type:     all results, resources only, or collections only.
       sort:     by date. A collection has no date of its own, so it is dated by the newest
                 resource inside it. Anything without a valid date goes last. */
  var DEFAULT_FILTERS = { category: "all", type: "all", sort: "newest" };
  var filters = { category: "all", type: "all", sort: "newest" };
  var filterOpen = false;
  var FILTER_GROUPS = [
    { key: "category", label: "Category",
      options: [{ value: "all", label: "All Categories" }].concat(categories.map(function (c) {
        return { value: c.id, label: c.name };
      })),
      hint: "Applies to resources. Collections are not tied to a category." },
    { key: "type", label: "Show",
      options: [{ value: "all", label: "All Results" }, { value: "resources", label: "Resources Only" },
                { value: "collections", label: "Collections Only" }] },
    { key: "sort", label: "Sort",
      options: [{ value: "newest", label: "Newest First" }, { value: "oldest", label: "Oldest First" }] }
  ];

  function activeFilters() {
    var out = [];
    FILTER_GROUPS.forEach(function (g) {
      if (filters[g.key] === DEFAULT_FILTERS[g.key]) return;
      g.options.forEach(function (o) { if (o.value === filters[g.key]) out.push(o.label); });
    });
    return out;
  }

  function resetFilters() {
    filters.category = DEFAULT_FILTERS.category;
    filters.type = DEFAULT_FILTERS.type;
    filters.sort = DEFAULT_FILTERS.sort;
    filterOpen = false;
  }

  /* Smooth scrolling unless the visitor has asked for reduced motion. */
  function scrollBehavior() {
    return H.prefersReducedMotion() ? "auto" : "smooth";
  }

  function isPhone() {
    return window.matchMedia("(max-width: 719px)").matches;
  }

  /* Hidden admin link: shown only when the exact trigger phrase is typed.
     This reveals a link and nothing more. It never signs anyone in. */
  /* Lower-case, unify the dash and space characters that phone keyboards
     insert, and trim. "Hub-Admin-Access " and "hub–admin–access" both match. */
  function normalise(text) {
    return String(text || "")
      .replace(/[\u2010-\u2015\u2212]/g, "-")
      .replace(/[\u00a0\u2000-\u200b\u202f\u3000]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function adminRevealed() {
    var trigger = normalise(cfg.adminTrigger);
    return trigger.length > 0 && normalise(query) === trigger;
  }

  function visibleResources() {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    /* No search: Fresh drops, which is only what was published in the last 30 days.
       Search, the category counts and the other pages still use every resource. */
    if (terms.length === 0) return H.freshResources();
    if (filters.type === "collections") return [];
    var found = resources.filter(function (r) {
      return H.matches(r, terms) && (filters.category === "all" || r.category === filters.category);
    });
    /* "resources" is already newest first. Undated ones always go last. */
    var dated = [], undated = [];
    found.forEach(function (r) { (H.dayNumber(r.date) === null ? undated : dated).push(r); });
    if (filters.sort === "oldest") dated.reverse();
    return dated.concat(undated);
  }

  /* The date used to sort a collection: its newest resource, or null if none has a valid date. */
  function collectionDay(c) {
    var best = null;
    H.collectionResources(c).forEach(function (r) {
      var d = H.dayNumber(r.date);
      if (d !== null && (best === null || d > best)) best = d;
    });
    return best;
  }

  /* Collections that match the search words. None when nothing is typed. */
  function visibleCollections() {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];
    if (filters.type === "resources") return [];
    var keyed = H.collections().filter(function (c) { return H.matchesCollection(c, terms); })
      .map(function (c, i) { return { c: c, i: i, d: collectionDay(c) }; });
    keyed.sort(function (a, b) {
      if (a.d === null || b.d === null) return (a.d === null) - (b.d === null) || a.i - b.i;
      return (filters.sort === "oldest" ? a.d - b.d : b.d - a.d) || a.i - b.i;
    });
    return keyed.map(function (k) { return k.c; });
  }

  /* Filter panel: one row of options per group. Built once; render() keeps it in step. */
  function buildFilterPanel() {
    FILTER_GROUPS.forEach(function (g) {
      var set = H.el("fieldset", "filter-group");
      set.appendChild(H.el("legend", "", g.label));
      var row = H.el("div", "filter-options");
      g.options.forEach(function (o) {
        var chip = H.el("label", "chip");
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "filter-" + g.key;
        input.value = o.value;
        input.addEventListener("change", function () {
          filters[g.key] = o.value;
          render();
        });
        chip.appendChild(input);
        chip.appendChild(H.el("span", "", o.label));
        row.appendChild(chip);
      });
      set.appendChild(row);
      if (g.hint) set.appendChild(H.el("p", "filter-hint", g.hint));
      els.filterPanel.appendChild(set);
    });

    var actions = H.el("div", "filter-actions");
    var clear = H.el("button", "reset", "Clear Filters");
    clear.type = "button";
    clear.id = "filter-clear";
    clear.addEventListener("click", function () {
      resetFilters();
      filterOpen = true;
      render();
    });
    var done = H.el("button", "reset filter-done", "Done");
    done.type = "button";
    done.addEventListener("click", function () { setFilterOpen(false); els.filterBtn.focus(); });
    actions.appendChild(clear);
    actions.appendChild(done);
    els.filterPanel.appendChild(actions);

    [els.filterBar, els.filterPanel].forEach(function (area) {
      area.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && filterOpen) { setFilterOpen(false); els.filterBtn.focus(); }
      });
    });
  }

  function setFilterOpen(open) {
    filterOpen = open;
    render();
  }

  /* Keep the button, summary and panel in step with the filters. */
  function updateFilterUI(searching) {
    var active = activeFilters();
    if (!searching) filterOpen = false;
    els.filterBar.hidden = !searching;
    if (searching) H.setVisible(els.filterPanel, filterOpen);
    else H.hideNow(els.filterPanel);
    els.filterBtn.setAttribute("aria-expanded", filterOpen ? "true" : "false");
    els.filterCount.hidden = active.length === 0;
    els.filterCount.textContent = active.length;
    els.filterBtn.setAttribute("aria-label", active.length === 0 ? "Filter" : "Filter, " + active.length + " active");
    els.filterSummary.textContent = active.join(" · ");
    document.getElementById("filter-clear").disabled = active.length === 0;
    FILTER_GROUPS.forEach(function (g) {
      var inputs = els.filterPanel.querySelectorAll('input[name="filter-' + g.key + '"]');
      Array.prototype.forEach.call(inputs, function (input) { input.checked = input.value === filters[g.key]; });
    });
  }

  function renderCategories() {
    els.cats.textContent = "";
    categories.forEach(function (cat) {
      var count = resources.filter(function (r) { return r.category === cat.id; }).length;
      var link = H.el("a", "cat");
      link.href = "category.html?c=" + encodeURIComponent(cat.id);
      link.appendChild(H.icon(cat.icon));
      var label = H.el("div");
      label.appendChild(H.el("div", "cat-name", cat.name));
      label.appendChild(H.el("div", "cat-count", H.plural(count, "resource")));
      link.appendChild(label);
      els.cats.appendChild(link);
    });
  }

  function render() {
    window.setTimeout(updateDock, 0);
    var searching = query.trim().length > 0;
    var admin = adminRevealed();
    var items = visibleResources();
    var found = visibleCollections();

    body.classList.toggle("is-searching", searching);
    els.clear.hidden = query.length === 0;
    els.reset.hidden = !searching;

    updateFilterUI(searching && !admin);
    els.admin.hidden = !admin;
    els.fresh.hidden = admin;
    if (admin) {
      els.adminLink.href = cfg.adminPage || "admin/index.html";
      return;
    }

    els.title.textContent = searching ? "Search results" : "Fresh drops";
    els.status.textContent = searching
      ? (filters.type === "resources" ? H.plural(items.length, "resource")
          : filters.type === "collections" ? H.plural(found.length, "collection")
          : found.length === 0 ? H.plural(items.length, "resource")
          : items.length === 0 ? H.plural(found.length, "collection")
          : H.plural(items.length, "resource") + " and " + H.plural(found.length, "collection"))
        + " for “" + query.trim() + "”"
      : "";

    var listKey = found.map(function (c) { return "c:" + c.id; })
      .concat(items.map(function (r) { return "r:" + r.id; })).join(",");
    if (listKey !== shownKey) {
      shownKey = listKey;
      els.list.textContent = "";
      found.forEach(function (c) { els.list.appendChild(H.renderCollectionCard(c)); });
      items.forEach(function (r) { els.list.appendChild(H.renderCard(r)); });
    }

    els.empty.hidden = items.length > 0 || found.length > 0;
    els.emptyTitle.textContent = searching ? "Nothing found" : "No new drops lately";
    els.emptyText.textContent = searching
      ? (activeFilters().length > 0
          ? "No matches for “" + query.trim() + "” with these filters. Try clearing the filters, or a shorter word."
          : "No matches for “" + query.trim() + "”. Try a shorter word, or search by category or tag.")
      : "Nothing was added in the last 30 days. Everything is still in Browse and Search.";
    els.emptyReset.hidden = !searching;
  }

  /* Phones: bring the search bar to the top so the keyboard never covers it. */
  function bringSearchToTop() {
    if (!isPhone()) return;
    window.setTimeout(function () { window.scrollTo({ top: 0, behavior: scrollBehavior() }); }, 30);
  }

  function resetSearch() {
    resetFilters();
    query = "";
    els.input.value = "";
    els.input.blur();
    body.classList.remove("is-focused");
    render();
    updateDock();
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  }

  /* Android keyboards can finish a word (autocorrect, voice, paste) without a
     plain "input" event, so every route that changes the text re-runs render. */
  function onText() {
    if (els.input.value === query) return;
    query = els.input.value;
    render();
  }
  ["input", "change", "keyup", "compositionend", "paste", "search"].forEach(function (ev) {
    els.input.addEventListener(ev, function () { window.setTimeout(onText, 0); });
  });
  els.input.addEventListener("input", onText);

  els.input.addEventListener("focus", function () {
    window.clearTimeout(blurTimer);
    body.classList.add("is-focused");
    updateDock();
    bringSearchToTop();
  });

  els.input.addEventListener("blur", function () {
    /* A short delay lets a tap on Cancel, a card or the clear button land before the layout changes. */
    blurTimer = window.setTimeout(function () {
      body.classList.remove("is-focused");
      updateDock();
    }, 200);
  });

  els.form.addEventListener("submit", function (e) {
    e.preventDefault();
    els.input.blur();
  });

  els.clear.addEventListener("click", function () {
    query = "";
    els.input.value = "";
    render();
    els.input.focus();
  });

  els.filterBtn.addEventListener("click", function () { setFilterOpen(!filterOpen); });

  els.cancel.addEventListener("click", resetSearch);
  els.reset.addEventListener("click", resetSearch);
  els.emptyReset.addEventListener("click", resetSearch);

  els.dockSearch.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    els.input.focus();
  });

  /* Home also leaves search mode, so the highlight and the page agree.
     Browse is a normal link to its own page (browse.html), so it needs no handler. */
  els.dockHome.addEventListener("click", function (e) {
    if (body.classList.contains("is-focused") || body.classList.contains("is-searching")) {
      e.preventDefault();
      resetSearch();
    }
  });

  /* Dock highlight on the homepage: Search while search is active, otherwise Home.
     Browse is its own page, so it is highlighted only there, never from scrolling
     past the categories or through Fresh drops. Scrolling does not change it. */
  function updateDock() {
    var searchMode = body.classList.contains("is-focused") || body.classList.contains("is-searching");
    var active = searchMode ? els.dockSearch : els.dockHome;
    [els.dockHome, els.dockBrowse, els.dockSearch].forEach(function (a) {
      if (a === active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* If the keyboard overlays the page instead of resizing it, keep room to scroll the last result into view. */
  if (window.visualViewport) {
    var vv = window.visualViewport;
    var syncKeyboard = function () {
      var covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty("--kb", covered + "px");
    };
    vv.addEventListener("resize", syncKeyboard);
    vv.addEventListener("scroll", syncKeyboard);
  }

  /* Back/forward cache can restore the page with the old text still in the box. */
  window.addEventListener("pageshow", function () {
    query = els.input.value;
    render();
    updateDock();
  });

  query = els.input.value;
  renderCategories();
  buildFilterPanel();
  render();
  updateDock();

  if (location.hash === "#search") {
    els.input.focus();
  }
})();
