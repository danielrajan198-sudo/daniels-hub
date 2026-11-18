/*
  Daniel's Hub: collection page.
  One page template serves every collection: collection.html?c=best-ai-websites
  The "c" value is only used to look up a collection in the data, so
  unknown values just show a friendly "not found" message.
*/
(function () {
  "use strict";

  var H = window.Hub;
  var root = document.getElementById("collection-root");
  var id = new URLSearchParams(window.location.search).get("c");
  var coll = H.collectionById(id);

  if (!coll) {
    document.title = "Collection not found · Daniel's Hub";
    var missing = H.el("div", "empty");
    missing.appendChild(H.el("p", "empty-title", "That collection doesn't exist"));
    missing.appendChild(H.el("p", "", "It may have been renamed or removed."));
    var back = H.el("a", "reset", "Back to Browse");
    back.href = "browse.html";
    missing.appendChild(back);
    root.appendChild(missing);
    return;
  }

  document.title = coll.name + " · Daniel's Hub";
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", coll.description);

  var items = H.collectionResources(coll);

  var head = H.el("section", "cat-head");
  head.dataset.accent = coll.accent || "violet";
  head.setAttribute("aria-labelledby", "coll-title");

  var row = H.el("div", "cat-title-row");
  var tile = H.el("div", "coll-art big");
  tile.appendChild(H.icon(coll.icon || "i-grid"));
  row.appendChild(tile);
  var title = H.el("h1", "", coll.name);
  title.id = "coll-title";
  row.appendChild(title);
  head.appendChild(row);

  head.appendChild(H.el("p", "cat-desc", coll.description));
  head.appendChild(H.el("p", "count-chip", H.plural(items.length, "resource")));
  root.appendChild(head);

  if (items.length === 0) {
    var empty = H.el("div", "empty");
    empty.appendChild(H.el("p", "empty-title", "Nothing here yet"));
    empty.appendChild(H.el("p", "", "Resources added to this collection will appear here."));
    root.appendChild(empty);
    return;
  }

  var list = H.el("div", "list");
  items.forEach(function (r) { list.appendChild(H.renderCard(r)); });
  root.appendChild(list);
})();
