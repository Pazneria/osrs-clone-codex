(function () {
  const groups = Array.from(document.querySelectorAll("[data-filter-group]"));
  const chipLists = Array.from(document.querySelectorAll(".filter-chip-list"));
  if (!groups.length && !chipLists.length) return;

  const CHIP_ALIASES = {
    combat: ["combat", "weapon", "armor", "armour", "melee", "ranged", "magic", "shield", "gear"],
    gather: ["gather", "tool", "tools", "mine", "mining", "wood", "woodcut", "fishing", "fish", "harvest", "resource"],
    food: ["food", "heal", "healing", "cook", "cooked", "raw", "burn", "burnt"],
    runes: ["rune", "runes", "runecraft", "runecrafting", "altar", "pouch"],
    tools: ["tool", "tools", "axe", "pickaxe", "harpoon", "knife", "tinderbox", "hammer", "chisel"],
    jewelry: ["jewelry", "jewellery", "jewels", "amulet", "ring", "necklace", "bracelet", "mould", "moulds", "tiara"]
  };

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getHaystack(item) {
    return normalize([
      item.getAttribute("data-search"),
      item.getAttribute("data-filter-tags"),
      item.getAttribute("data-filter-values"),
      item.textContent
    ].filter(Boolean).join(" "));
  }

  function getChipLabel(chip) {
    return normalize(chip.getAttribute("data-filter-chip") || chip.getAttribute("data-filter-term") || chip.textContent);
  }

  function getChipTokens(chip) {
    const label = getChipLabel(chip);
    if (!label) return [];
    if (CHIP_ALIASES[label]) return CHIP_ALIASES[label];
    return label.split(/[\s,|/]+/g).filter(Boolean);
  }

  groups.forEach((group) => {
    const groupId = group.getAttribute("data-filter-group");
    const input = document.querySelector(`[data-filter-input="${groupId}"]`);
    const countEl = document.querySelector(`[data-filter-count="${groupId}"]`);
    const root = group.closest("main") || document;
    const chipList = root.querySelector(".filter-chip-list");
    const chips = chipList ? Array.from(chipList.querySelectorAll("[data-filter-chip], [data-filter-term], button, [role='button']")) : [];
    const selectedChips = new Set();

    const items = Array.from(group.querySelectorAll("[data-search]"));
    if (!items.length) return;

    chips.forEach((chip) => {
      chip.setAttribute("role", chip.getAttribute("role") || "button");
      chip.setAttribute("tabindex", chip.getAttribute("tabindex") || "0");
      chip.setAttribute("aria-pressed", "false");
      chip.dataset.filterActive = "false";
    });

    const syncChipState = () => {
      chips.forEach((chip) => {
        const active = selectedChips.has(chip);
        chip.setAttribute("aria-pressed", active ? "true" : "false");
        chip.dataset.filterActive = active ? "true" : "false";
      });
    };

    const chipMatches = (haystack) => {
      if (!selectedChips.size) return true;
      for (const chip of selectedChips) {
        const tokens = getChipTokens(chip);
        if (!tokens.length) continue;
        const matches = tokens.some((token) => haystack.includes(token));
        if (matches) return true;
      }
      return false;
    };

    const applyFilter = () => {
      const needle = input ? normalize(input.value) : "";
      let visible = 0;

      items.forEach((item) => {
        const haystack = getHaystack(item);
        const matches = (!needle || haystack.includes(needle)) && chipMatches(haystack);
        item.hidden = !matches;
        if (matches) visible += 1;
      });

      if (countEl) countEl.textContent = String(visible);
    };

    if (input) {
      input.addEventListener("input", applyFilter);
      input.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !input.value) return;
        input.value = "";
        applyFilter();
      });
    }

    chips.forEach((chip) => {
      const toggleChip = () => {
        if (selectedChips.has(chip)) {
          selectedChips.delete(chip);
        } else {
          selectedChips.add(chip);
        }
        syncChipState();
        applyFilter();
      };

      chip.addEventListener("click", toggleChip);
      chip.addEventListener("keydown", (event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          toggleChip();
        }
      });
    });

    syncChipState();
    applyFilter();
  });
})();
