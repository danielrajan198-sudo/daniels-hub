/*
  Daniel's Hub: Saved Resources page.
  Reads the saved ids from localStorage (through Hub.saved), looks each one up in the
  current data, and draws the normal resource cards. A saved id that no longer matches
  a resource is skipped and cleaned out. Removing a card here is the same bookmark
  button as everywhere else.
*/
(function () {
  "use strict";

  var H = window.Hub;
  var list = document.getElementById("saved-list");
  var empty = document.getElementById("saved-empty");
  var count = document.getElementById("saved-count");
  var live = document.getElementById("saved-live");

  function savedResources() {
    /* Newest first */
    return H.saved.ids().slice().reverse().map(H.resourceById).filter(Boolean);
  }

  function updateChrome() {
    var n = list.querySelectorAll(".card-wrap").length;
    count.textContent = H.plural(n, "saved resource");
    count.hidden = n === 0;
    list.hidden = n === 0;
    empty.hidden = n !== 0;
  }

  function render() {
    H.saved.prune();
    list.textContent = "";
    savedResources().forEach(function (r) { list.appendChild(H.renderCard(r)); });
    updateChrome();
  }

  function removeCard(id) {
    var wraps = list.querySelectorAll(".card-wrap");
    var target = null, next = null;
    for (var i = 0; i < wraps.length; i++) {
      if (wraps[i].dataset.id === id) { target = wraps[i]; next = wraps[i + 1] || wraps[i - 1] || null; break; }
    }
    if (!target) return;

    /* Keep keyboard focus useful: move it to a neighbouring bookmark, or to the page heading. */
    var hadFocus = target.contains(document.activeElement);
    function done() {
      target.remove();
      updateChrome();
      live.textContent = "Removed from saved. " + H.plural(list.querySelectorAll(".card-wrap").length, "saved resource") + " left.";
      if (hadFocus) {
        var b = next && next.parentNode ? next.querySelector(".save-btn") : null;
        (b || document.getElementById("saved-title")).focus();
      }
    }
    if (H.prefersReducedMotion()) { done(); return; }
    target.classList.add("is-leaving");
    window.setTimeout(done, 180);
  }

  document.addEventListener("hub:saved-change", function (e) {
    var d = e.detail || {};
    if (d.external) render();
    else if (!d.saved) removeCard(d.id);
  });

  render();
})();
