/*
  Daniel's Hub: Browse page.
  Draws the category cards (each opens its own category page) and the
  curated collections (each opens its own collection page).
  Everything comes from the data, so nothing here is invented.
  Shared helpers live in js/ui.js.
*/
(function () {
  "use strict";

  var H = window.Hub;
  var catsEl = document.getElementById("bcats");
  var collsEl = document.getElementById("colls");

  function arrow(className) {
    var dot = H.el("span", className);
    dot.appendChild(H.icon("i-arrow-right"));
    return dot;
  }

  /* Categories: two cards per row on phones. */
  var resources = H.sortedResources();
  H.data.categories.forEach(function (cat) {
    var count = resources.filter(function (r) { return r.category === cat.id; }).length;

    var link = H.el("a", "bcat");
    link.href = "category.html?c=" + encodeURIComponent(cat.id);
    link.dataset.cat = cat.id;
    link.setAttribute("aria-label", cat.name + ", " + H.plural(count, "resource"));

    var top = H.el("div", "bcat-top");
    var tile = H.el("div", "card-icon");
    tile.appendChild(H.icon(cat.icon));
    top.appendChild(tile);
    top.appendChild(arrow("go-dot"));
    link.appendChild(top);

    var body = H.el("div", "bcat-body");
    body.appendChild(H.el("div", "bcat-name", cat.name));
    body.appendChild(H.el("div", "bcat-desc", cat.short || cat.description));
    link.appendChild(body);

    link.appendChild(H.el("div", "bcat-count", H.plural(count, "resource")));
    catsEl.appendChild(link);
  });

  /* Collections: groups of resources that already exist in the data. */
  var collections = H.collections();
  if (collections.length === 0) {
    var none = H.el("div", "empty");
    none.appendChild(H.el("p", "empty-title", "No collections yet"));
    none.appendChild(H.el("p", "", "Curated collections will appear here."));
    collsEl.appendChild(none);
  }

  collections.forEach(function (coll) {
    var count = H.collectionResources(coll).length;

    var link = H.el("a", "coll");
    link.href = "collection.html?c=" + encodeURIComponent(coll.id);
    link.dataset.accent = coll.accent || "violet";
    link.setAttribute("aria-label", coll.name + ", " + H.plural(count, "resource") + ". Explore");

    var art = H.el("div", "coll-art");
    art.appendChild(H.icon(coll.icon || "i-grid"));
    link.appendChild(art);

    var body = H.el("div", "coll-body");
    body.appendChild(H.el("div", "coll-title", coll.name));
    body.appendChild(H.el("div", "coll-desc", coll.description));

    var foot = H.el("div", "coll-foot");
    foot.appendChild(H.el("span", "coll-count", H.plural(count, "resource")));
    var explore = H.el("span", "explore");
    explore.appendChild(H.el("span", "", "Explore"));
    explore.appendChild(H.icon("i-arrow-right"));
    foot.appendChild(explore);
    body.appendChild(foot);

    link.appendChild(body);
    collsEl.appendChild(link);
  });
})();
