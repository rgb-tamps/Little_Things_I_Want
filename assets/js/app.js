(function () {
  const $ = (id) => document.getElementById(id);
  const requestedCategories = ["Technology", "Fashion", "Fitness", "Lifestyle", "Others"];
  let items = [];
  let activeCategory = "All";
  let searchTerm = "";
  let sortMode = "priority";

  function renderFilters() {
    const available = new Set(items.map((item) => item.category).filter(Boolean));
    const categories = ["All", ...requestedCategories.filter((category) => available.has(category))];
    items.forEach((item) => {
      if (!categories.includes(item.category)) categories.push(item.category);
    });

    const filterList = $("categoryFilters");
    filterList.replaceChildren();
    categories.forEach((category) => {
      const button = Wishlist.createElement("button", `filter-chip${activeCategory === category ? " active" : ""}`, category);
      button.type = "button";
      button.dataset.category = category;
      button.setAttribute("aria-pressed", String(activeCategory === category));
      filterList.append(button);
    });
  }

  function openDetails(item) {
    const dialog = $("detailsDialog");
    const content = $("dialogContent");
    const image = Wishlist.createElement("img", "dialog-image");
    image.src = Wishlist.safeImageUrl(item.image);
    image.alt = `Photo of ${item.name}`;
    image.onerror = function () {
      image.onerror = null;
      image.src = "assets/images/image-placeholder.svg";
    };

    const copy = Wishlist.createElement("div", "dialog-copy");
    copy.append(Wishlist.createElement("span", "category-chip", item.category));
    const heading = Wishlist.createElement("h2", "", item.name);
    heading.id = "dialogTitle";
    copy.append(heading);
    if (item.price !== "" && item.price !== null && item.price !== undefined) {
      copy.append(Wishlist.createElement("p", "dialog-price", Wishlist.formatPrice(item.price)));
    }
    if (item.description) copy.append(Wishlist.createElement("p", "product-description", item.description));
    const badges = Wishlist.createElement("div", "product-meta");
    badges.append(
      Wishlist.createElement("span", `priority-badge ${item.priority.toLowerCase()}`, `${item.priority} priority`),
      Wishlist.createElement("span", `status-badge${item.status === "Purchased" ? " purchased" : ""}`, item.status)
    );
    copy.append(badges);
    const url = Wishlist.safeProductUrl(item.url);
    if (url) {
      const link = Wishlist.createElement("a", "dialog-product-link", "View product ↗");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      copy.append(link);
    }

    content.replaceChildren(image, copy);
    dialog.showModal();
  }

  function renderGrid() {
    const visible = WishlistFilters.filterItems(items, activeCategory, searchTerm, sortMode);
    const grid = $("wishlistGrid");
    grid.replaceChildren(...visible.map((item) => Wishlist.createProductCard(item)));
    grid.setAttribute("aria-busy", "false");
    $("itemCount").textContent = `${items.length} ${items.length === 1 ? "item" : "items"} saved.`;
    $("emptyState").classList.toggle("hidden", visible.length !== 0);
  }

  async function init() {
    try {
      const result = await WishlistStorage.loadWishlist();
      items = result.items;
      if (result.warning) {
        $("loadMessage").textContent = result.warning;
        $("loadMessage").classList.remove("hidden");
      }
    } catch (error) {
      console.error(error);
      $("loadMessage").textContent = `Wishlist couldn't be loaded. ${error.message}`;
      $("loadMessage").classList.remove("hidden");
      $("itemCount").textContent = "Wishlist unavailable";
    }
    renderFilters();
    renderGrid();
  }

  $("categoryFilters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderFilters();
    renderGrid();
  });
  $("searchInput").addEventListener("input", (event) => {
    searchTerm = event.target.value;
    renderGrid();
  });
  $("sortSelect").addEventListener("change", (event) => {
    sortMode = event.target.value;
    renderGrid();
  });
  $("wishlistGrid").addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    const card = event.target.closest("[data-item-id]");
    const item = card && items.find((entry) => String(entry.id) === card.dataset.itemId);
    if (item) openDetails(item);
  });
  $("wishlistGrid").addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target.closest("a")) return;
    const card = event.target.closest("[data-item-id]");
    if (!card) return;
    event.preventDefault();
    const item = items.find((entry) => String(entry.id) === card.dataset.itemId);
    if (item) openDetails(item);
  });
  $("dialogClose").addEventListener("click", () => $("detailsDialog").close());
  $("detailsDialog").addEventListener("click", (event) => {
    if (event.target === $("detailsDialog")) $("detailsDialog").close();
  });
  init();
})();
