/*
  Daniel's Hub: homepage behaviour.
  Reads categories and resources from window.HUB_DATA (js/data.js),
  then draws the category cards, the resource list, and handles search.
  Text is always inserted with textContent, never as HTML.
*/
(function () {
  "use strict";

  var data = window.HUB_DATA || { categories: [], resources: [] };
  var categories = data.categories;
  var resources = data.resources.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });

  var els = {
    form: document.getElementById("search-form"),
    input: document.getElementById("q"),
    clear: document.getElementById("clear-search"),
    cats: document.getElementById("cats"),
    title: document.getElementById("fresh-title"),
    status: document.getElementById("status"),
    list: document.getElementById("list"),
    empty: document.getElementById("empty"),
    reset: document.getElementById("reset"),
    fresh: document.getElementById("fresh"),
    dockHome: document.getElementById("dock-home"),
    dockBrowse: document.getElementById("dock-browse"),
    dockSearch: document.getElementById("dock-search")
  };

  var state = { query: "", category: null };

  var NS = "http://www.w3.org/2000/svg";

  function icon(id) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(NS, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function categoryById(id) {
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].id === id) return categories[i];
    }
    return null;
  }

  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  function plural(n, word) {
    return n + " " + word + (n === 1 ? "" : "s");
  }

  /* Search: every word typed must appear in the title, description, category name or a tag. */
  function matches(resource, terms) {
    var cat = categoryById(resource.category);
    var haystack = [
      resource.title,
      resource.description,
      cat ? cat.name : "",
      (resource.tags || []).join(" ")
    ].join(" ").toLowerCase();
    for (var i = 0; i < terms.length; i++) {
      if (haystack.indexOf(terms[i]) === -1) return false;
    }
    return true;
  }

  function visibleResources() {
    var terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    return resources.filter(function (r) {
      if (state.category && r.category !== state.category) return false;
      return terms.length === 0 || matches(r, terms);
    });
  }

  function renderCategories() {
    els.cats.textContent = "";
    categories.forEach(function (cat) {
      var count = resources.filter(function (r) { return r.category === cat.id; }).length;
      var btn = el("button", "cat");
      btn.type = "button";
      btn.setAttribute("aria-pressed", state.category === cat.id ? "true" : "false");
      btn.dataset.id = cat.id;
      btn.appendChild(icon(cat.icon));
      var label = el("div");
      label.appendChild(el("div", "cat-name", cat.name));
      label.appendChild(el("div", "cat-count", plural(count, "resource")));
      btn.appendChild(label);
      btn.addEventListener("click", function () {
        state.category = state.category === cat.id ? null : cat.id;
        render();
        if (state.category) els.fresh.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      els.cats.appendChild(btn);
    });
  }

  function renderCard(r) {
    var cat = categoryById(r.category);
    var hasLink = r.url && r.url.length > 0;
    var card = el(hasLink ? "a" : "article", "card");
    card.dataset.cat = r.category;
    if (hasLink) {
      card.href = r.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
    }

    var ic = el("div", "card-icon");
    ic.appendChild(icon(cat ? cat.icon : "i-doc"));
    card.appendChild(ic);

    var body = el("div", "card-body");
    var title = el("div", "card-title");
    title.appendChild(el("span", "", r.title));
    if (r.pdf) title.appendChild(el("span", "badge", "PDF"));
    body.appendChild(title);
    body.appendChild(el("div", "card-desc", r.description));

    var meta = el("div", "card-meta");
    (r.tags || []).forEach(function (t) { meta.appendChild(el("span", "", "#" + t)); });
    meta.appendChild(el("span", "", formatDate(r.date)));
    body.appendChild(meta);

    card.appendChild(body);
    return card;
  }

  function renderList() {
    var items = visibleResources();
    var cat = state.category ? categoryById(state.category) : null;
    var searching = state.query.trim().length > 0;
    var filtered = searching || !!cat;

    els.title.textContent = searching ? "Results" : (cat ? cat.name : "Fresh drops");
    els.reset.hidden = !filtered;

    var parts = [];
    if (searching) parts.push("for “" + state.query.trim() + "”");
    if (cat && searching) parts.push("in " + cat.name);
    els.status.textContent = filtered
      ? plural(items.length, "resource") + (parts.length ? " " + parts.join(" ") : "")
      : "";

    els.list.textContent = "";
    items.forEach(function (r) { els.list.appendChild(renderCard(r)); });
    els.empty.hidden = items.length > 0;
  }

  function render() {
    renderCategories();
    renderList();
    els.clear.hidden = state.query.length === 0;
  }

  els.input.addEventListener("input", function () {
    state.query = els.input.value;
    render();
  });

  els.form.addEventListener("submit", function (e) {
    e.preventDefault();
    els.input.blur();
    els.fresh.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.clear.addEventListener("click", function () {
    state.query = "";
    els.input.value = "";
    render();
    els.input.focus();
  });

  els.reset.addEventListener("click", function () {
    state.query = "";
    state.category = null;
    els.input.value = "";
    render();
  });

  els.dockSearch.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    els.input.focus({ preventScroll: true });
  });

  /* Dock highlight: Home near the top, Browse once the hero has scrolled away. */
  function updateDock() {
    var past = window.scrollY > 220;
    if (past) {
      els.dockBrowse.setAttribute("aria-current", "page");
      els.dockHome.removeAttribute("aria-current");
    } else {
      els.dockHome.setAttribute("aria-current", "page");
      els.dockBrowse.removeAttribute("aria-current");
    }
  }
  window.addEventListener("scroll", updateDock, { passive: true });

  render();
  updateDock();
})();
