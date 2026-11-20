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
    dockHome: document.getElementById("dock-home"),
    dockBrowse: document.getElementById("dock-browse"),
    dockSearch: document.getElementById("dock-search")
  };

  var query = "";
  var blurTimer = null;

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
    return resources.filter(function (r) { return H.matches(r, terms); });
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

    body.classList.toggle("is-searching", searching);
    els.clear.hidden = query.length === 0;
    els.reset.hidden = !searching;

    els.admin.hidden = !admin;
    els.fresh.hidden = admin;
    if (admin) {
      els.adminLink.href = cfg.adminPage || "admin/index.html";
      return;
    }

    els.title.textContent = searching ? "Search results" : "Fresh drops";
    els.status.textContent = searching
      ? H.plural(items.length, "resource") + " for “" + query.trim() + "”"
      : "";

    els.list.textContent = "";
    items.forEach(function (r) { els.list.appendChild(H.renderCard(r)); });

    els.empty.hidden = items.length > 0;
    els.emptyTitle.textContent = searching ? "Nothing found" : "No new drops lately";
    els.emptyText.textContent = searching
      ? "No matches for “" + query.trim() + "”. Try a shorter word, or search by category or tag."
      : "Nothing was added in the last 30 days. Everything is still in Browse and Search.";
    els.emptyReset.hidden = !searching;
  }

  /* Phones: bring the search bar to the top so the keyboard never covers it. */
  function bringSearchToTop() {
    if (!isPhone()) return;
    window.setTimeout(function () { window.scrollTo({ top: 0, behavior: "smooth" }); }, 30);
  }

  function resetSearch() {
    query = "";
    els.input.value = "";
    els.input.blur();
    body.classList.remove("is-focused");
    render();
    updateDock();
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  els.cancel.addEventListener("click", resetSearch);
  els.reset.addEventListener("click", resetSearch);
  els.emptyReset.addEventListener("click", resetSearch);

  els.dockSearch.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
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
  render();
  updateDock();

  if (location.hash === "#search") {
    els.input.focus();
  }
})();
