/*
  Daniel's Hub: category page.
  One page template serves every category: category.html?c=ai
  The "c" value is only used to look up a category in the data, so
  unknown values just show a friendly "not found" message.
*/
(function () {
  "use strict";

  var H = window.Hub;
  var root = document.getElementById("category-root");
  var id = new URLSearchParams(window.location.search).get("c");
  var cat = H.categoryById(id);

  if (!cat) {
    document.title = "Category not found · Daniel's Hub";
    var missing = H.el("div", "empty");
    missing.appendChild(H.el("p", "empty-title", "That category doesn't exist"));
    missing.appendChild(H.el("p", "", "It may have been renamed or removed."));
    var home = H.el("a", "reset", "Back to home");
    home.href = "index.html";
    missing.appendChild(home);
    root.appendChild(missing);
    return;
  }

  document.title = cat.name + " · Daniel's Hub";
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", cat.description);

  var items = H.sortedResources().filter(function (r) { return r.category === cat.id; });

  var head = H.el("section", "cat-head");
  head.dataset.cat = cat.id;
  head.setAttribute("aria-labelledby", "cat-title");

  var row = H.el("div", "cat-title-row");
  var tile = H.el("div", "card-icon big");
  tile.appendChild(H.icon(cat.icon));
  row.appendChild(tile);
  var title = H.el("h1", "", cat.name);
  title.id = "cat-title";
  row.appendChild(title);
  head.appendChild(row);

  head.appendChild(H.el("p", "cat-desc", cat.description));
  head.appendChild(H.el("p", "count-chip", H.plural(items.length, "resource")));
  root.appendChild(head);

  if (items.length === 0) {
    var empty = H.el("div", "empty");
    empty.appendChild(H.el("p", "empty-title", "Nothing here yet"));
    empty.appendChild(H.el("p", "", "New resources will appear here as they are added."));
    root.appendChild(empty);
    return;
  }

  var list = H.el("div", "list");
  items.forEach(function (r) { list.appendChild(H.renderCard(r)); });
  root.appendChild(list);
})();
