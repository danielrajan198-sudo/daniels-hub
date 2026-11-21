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

  /* Back link. The page before this one is read from document.referrer, which only
     counts when it is one of our own pages.
       - Came from Browse: the link says "Browse" and goes there.
       - Came from the homepage, from anywhere else, or from nowhere (a direct link,
         a bookmark, another site): the link says "Home" and goes to the homepage.
     When there is real history behind this page the link steps back through it with
     history.back() instead of adding a new entry, so the browser's Back button never
     loops. With no history (a new tab, a pasted link) it is an ordinary link, so it
     always has somewhere to go. Refresh keeps working because the referrer survives it. */
  function cameFrom() {
    try {
      var ref = new URL(document.referrer);
      if (ref.origin !== window.location.origin) return "";
      var file = ref.pathname.split("/").pop();
      if (file === "browse.html") return "browse";
      if (file === "" || file === "index.html") return "home";
    } catch (e) { /* no referrer, or not a URL */ }
    return "";
  }

  var backLink = root.querySelector(".back");
  var from = cameFrom();
  if (backLink) {
    if (from === "browse") {
      backLink.setAttribute("href", "browse.html");
      var label = backLink.querySelector("span");
      if (label) label.textContent = "Browse";
    }
    backLink.addEventListener("click", function (e) {
      if (from && window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
    });
  }

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
