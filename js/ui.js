/*
  Daniel's Hub: shared pieces used by every page.
  - icon sprite
  - helper functions (building elements, dates, search matching)
  - resource card
  - the top-right hamburger menu
  Text from the data is always inserted with textContent, never as HTML.
*/
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var data = window.HUB_DATA || { categories: [], resources: [] };

  /* Icon sprite. Fixed, trusted markup written here, not data from anywhere else. */
  var SPRITE =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">' +
    '<symbol id="i-chip" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4"/></symbol>' +
    '<symbol id="i-tool" viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-2.6-.6-.6-2.6z"/></symbol>' +
    '<symbol id="i-doc" viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/></symbol>' +
    '<symbol id="i-phone" viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></symbol>' +
    '<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>' +
    '<symbol id="i-home" viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/></symbol>' +
    '<symbol id="i-grid" viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></symbol>' +
    '<symbol id="i-filter" viewBox="0 0 24 24"><path d="M3 5h18l-7 8.5V20l-4-2v-4.5z"/></symbol>' +
    '<symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>' +
    '<symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>' +
    '<symbol id="i-bookmark" viewBox="0 0 24 24"><path d="M7 3h10v18l-5-4-5 4z"/></symbol>' +
    '<symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></symbol>' +
    '<symbol id="i-arrow-left" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></symbol>' +
    '<symbol id="i-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>' +
    '<symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></symbol>' +
    '<symbol id="i-spark" viewBox="0 0 24 24"><path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 15v5M16.5 17.5h5"/></symbol>' +
    '<symbol id="i-cap" viewBox="0 0 24 24"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5"/><path d="M22 9v6"/></symbol>' +
    '<symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2L5 14h6l-1 8 8-12h-6z"/></symbol>' +
    "</svg>";
  document.body.insertAdjacentHTML("afterbegin", SPRITE);

  function icon(id) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "22");
    svg.setAttribute("height", "22");
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
    for (var i = 0; i < data.categories.length; i++) {
      if (data.categories[i].id === id) return data.categories[i];
    }
    return null;
  }

  function sortedResources() {
    return data.resources.slice().sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
  }

  /* Publication date as whole days (UTC midnight of that calendar day), or null.
     Only a real "YYYY-MM-DD" date counts. Missing, malformed and impossible
     dates (such as 2026-02-31) give null. */
  function dayNumber(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof iso === "string" ? iso : "");
    if (!m) return null;
    var y = +m[1], mo = +m[2] - 1, d = +m[3];
    var t = Date.UTC(y, mo, d);
    var back = new Date(t);
    if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo || back.getUTCDate() !== d) return null;
    return Math.round(t / 86400000);
  }

  var FRESH_DAYS = 30;

  /* Fresh drops: published today or in the previous 29 days (30 calendar days in all),
     going by the visitor's own calendar day. Uses only the resource's publication
     date ("date"), never an edit date. No valid date, or a date in the future,
     means not fresh. */
  function isFresh(resource, now) {
    var published = dayNumber(resource && resource.date);
    if (published === null) return false;
    var n = now || new Date();
    var today = Math.round(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) / 86400000);
    var age = today - published;
    return age >= 0 && age < FRESH_DAYS;
  }

  function freshResources(now) {
    return sortedResources().filter(function (r) { return isFresh(r, now); });
  }

  function collections() {
    return data.collections || [];
  }

  function collectionById(id) {
    var list = collections();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  /* The resources a collection groups together, newest first. Ids that do not
     exist in the data are skipped, so a collection never shows anything invented. */
  function collectionResources(collection) {
    var ids = collection.resources || [];
    return sortedResources().filter(function (r) { return ids.indexOf(r.id) !== -1; });
  }

  function formatDate(iso) {
    if (!iso) return "";
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

  /* Search for collections: every word typed must appear in the collection's title,
     description or tags (a collection has no tags yet; they are used if one is added). */
  function matchesCollection(collection, terms) {
    var haystack = [
      collection.name,
      collection.description,
      (collection.tags || []).join(" ")
    ].join(" ").toLowerCase();
    for (var i = 0; i < terms.length; i++) {
      if (haystack.indexOf(terms[i]) === -1) return false;
    }
    return true;
  }

  /* A collection in search results. It uses the normal result card, marked with a
     "Collection" badge and the collection's own colour, and opens its collection page. */
  function renderCollectionCard(c) {
    var card = el("a", "card card-coll");
    card.href = "collection.html?c=" + encodeURIComponent(c.id);
    card.dataset.accent = c.accent || "violet";

    var ic = el("div", "card-icon");
    ic.appendChild(icon(c.icon || "i-grid"));
    card.appendChild(ic);

    var body = el("div", "card-body");
    var title = el("div", "card-title");
    title.appendChild(el("span", "", c.name));
    title.appendChild(el("span", "badge", "Collection"));
    body.appendChild(title);
    body.appendChild(el("div", "card-desc", c.description));

    var meta = el("div", "card-meta");
    meta.appendChild(el("span", "", plural(collectionResources(c).length, "resource")));
    meta.appendChild(el("span", "", "Open collection"));
    body.appendChild(meta);

    card.appendChild(body);
    return card;
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

  /* Hamburger menu. To add a page to the menu, add a line to MENU_ITEMS. */
  var MENU_ITEMS = [
    { href: "saved.html", label: "Saved Resources", icon: "i-bookmark" },
    { href: "about.html", label: "About Daniel's Hub", icon: "i-info" }
  ];

  /* Motion helpers. */
  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* Page transitions are a progressive extra. If the visitor navigates again while one is
     still running, the browser abandons it and reports that as a rejected promise. That is
     harmless, so it is silenced here rather than left as an uncaught error. */
  ["pagereveal", "pageswap"].forEach(function (name) {
    window.addEventListener(name, function (e) {
      var t = e && e.viewTransition;
      if (!t) return;
      ["ready", "finished", "updateCallbackDone"].forEach(function (k) {
        if (t[k] && t[k].catch) t[k].catch(function () {});
      });
    });
  });

  /* Show or hide a panel with a short fade on the way out as well as on the way in.
     The way in is plain CSS (the panel animates when it stops being hidden). The way out
     adds "is-leaving" for a moment and then hides it for real. With reduced motion it
     hides at once. */
  function setVisible(node, show) {
    window.clearTimeout(node._leaveTimer);
    if (show) {
      node.classList.remove("is-leaving");
      node.hidden = false;
      return;
    }
    if (node.hidden || node.classList.contains("is-leaving")) return;
    if (prefersReducedMotion()) { node.hidden = true; return; }
    node.classList.add("is-leaving");
    node._leaveTimer = window.setTimeout(function () {
      node.hidden = true;
      node.classList.remove("is-leaving");
    }, 140);
  }

  /* Hide at once, with no leaving animation (used when the whole view changes). */
  function hideNow(node) {
    window.clearTimeout(node._leaveTimer);
    node.classList.remove("is-leaving");
    node.hidden = true;
  }

  function initMenu() {
    var slot = document.querySelector("[data-menu]");
    if (!slot) return;

    var btn = el("button", "menu-btn");
    btn.type = "button";
    btn.setAttribute("aria-label", "Menu");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "menu-panel");
    btn.appendChild(icon("i-menu"));

    var panel = el("nav", "menu-panel");
    panel.id = "menu-panel";
    panel.hidden = true;
    panel.setAttribute("aria-label", "Site menu");

    var here = location.pathname.split("/").pop();
    MENU_ITEMS.forEach(function (item) {
      var a = el("a", "menu-item");
      a.href = item.href;
      a.appendChild(icon(item.icon));
      a.appendChild(el("span", "", item.label));
      if (here === item.href) a.setAttribute("aria-current", "page");
      panel.appendChild(a);
    });

    slot.appendChild(btn);
    slot.appendChild(panel);

    function isClosed() { return panel.hidden || panel.classList.contains("is-leaving"); }

    function open(byKeyboard) {
      setVisible(panel, true);
      btn.setAttribute("aria-expanded", "true");
      if (byKeyboard) panel.querySelector("a").focus();
    }
    function close(returnFocus) {
      setVisible(panel, false);
      btn.setAttribute("aria-expanded", "false");
      if (returnFocus) btn.focus();
    }

    btn.addEventListener("click", function (e) {
      if (isClosed()) open(e.detail === 0);
      else close(false);
    });
    document.addEventListener("click", function (e) {
      if (!isClosed() && !slot.contains(e.target)) close(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !isClosed()) close(true);
    });
    window.addEventListener("pageshow", function () { hideNow(panel); btn.setAttribute("aria-expanded", "false"); });
  }

  initMenu();

  /* Build tag in the footer. If the page and the scripts show different
     numbers, the browser is using old cached files. */
  var BUILD = "20261121d";
  var tag = document.getElementById("build");
  if (tag) {
    var pageBuild = tag.getAttribute("data-page");
    tag.textContent = pageBuild === BUILD ? "Build " + BUILD : "Build " + pageBuild + " / scripts " + BUILD + " (refresh to update)";
  }

  window.Hub = {
    data: data,
    icon: icon,
    el: el,
    categoryById: categoryById,
    collections: collections,
    collectionById: collectionById,
    collectionResources: collectionResources,
    sortedResources: sortedResources,
    matchesCollection: matchesCollection,
    renderCollectionCard: renderCollectionCard,
    dayNumber: dayNumber,
    prefersReducedMotion: prefersReducedMotion,
    setVisible: setVisible,
    hideNow: hideNow,
    isFresh: isFresh,
    freshResources: freshResources,
    formatDate: formatDate,
    plural: plural,
    matches: matches,
    renderCard: renderCard
  };
})();
