(function () {
  const groups = document.querySelectorAll("[data-filter-group]");
  if (!groups.length) return;

  groups.forEach((group) => {
    const groupId = group.getAttribute("data-filter-group");
    const input = document.querySelector(`[data-filter-input="${groupId}"]`);
    const countEl = document.querySelector(`[data-filter-count="${groupId}"]`);
    if (!input) return;

    const items = Array.from(group.querySelectorAll("[data-search]"));

    const applyFilter = () => {
      const needle = String(input.value || "").trim().toLowerCase();
      let visible = 0;

      items.forEach((item) => {
        const haystack = String(item.getAttribute("data-search") || item.textContent || "").toLowerCase();
        const matches = !needle || haystack.includes(needle);
        item.hidden = !matches;
        if (matches) visible += 1;
      });

      if (countEl) countEl.textContent = String(visible);
    };

    input.addEventListener("input", applyFilter);
    applyFilter();
  });
})();
