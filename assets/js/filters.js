(function () {
  function filterItems(items, category, query, sortMode) {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = items.filter((item) => {
      const categoryMatch = category === "All" || item.category === category;
      const searchText = `${item.name} ${item.category} ${item.description}`.toLocaleLowerCase();
      return categoryMatch && searchText.includes(normalizedQuery);
    });

    const priority = { High: 0, Medium: 1, Low: 2 };
    filtered.sort((first, second) => {
      if (sortMode === "price-low") return Number(first.price || 0) - Number(second.price || 0);
      if (sortMode === "price-high") return Number(second.price || 0) - Number(first.price || 0);
      if (sortMode === "name") return first.name.localeCompare(second.name);
      return priority[first.priority] - priority[second.priority] || first.name.localeCompare(second.name);
    });
    return filtered;
  }

  window.WishlistFilters = { filterItems };
})();
