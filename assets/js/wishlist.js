(function () {
  const fallbackImage = "assets/images/image-placeholder.svg";
  const allowedPriorities = ["Low", "Medium", "High"];
  const allowedStatuses = ["Want", "Purchased"];

  function safeImageUrl(value) {
    const candidate = String(value || "").trim();
    if (!candidate) return fallbackImage;
    try {
      const url = new URL(candidate, window.location.href);
      if (url.protocol === "https:" || url.protocol === "http:") return candidate;
    } catch (error) {
      return fallbackImage;
    }
    return fallbackImage;
  }

  function safeProductUrl(value) {
    const candidate = String(value || "").trim();
    if (!candidate) return "";
    try {
      const url = new URL(candidate);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (error) {
      return "";
    }
  }

  function validateItems(items) {
    if (!Array.isArray(items)) throw new Error("Wishlist data must be a JSON array.");
    const seenIds = new Set();
    items.forEach((item, index) => {
      const label = `Item ${index + 1}`;
      if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(`${label} must be an object.`);
      if (item.id === undefined || item.id === null || String(item.id).trim() === "") throw new Error(`${label} needs an id.`);
      if (seenIds.has(String(item.id))) throw new Error(`${label} has a duplicate id.`);
      seenIds.add(String(item.id));
      ["name", "image", "category", "description", "url", "priority", "status"].forEach((field) => {
        if (typeof item[field] !== "string") throw new Error(`${label} needs a text value for ${field}.`);
      });
      if (!item.name.trim() || !item.image.trim() || !item.category.trim()) {
        throw new Error(`${label} needs a name, image, and category.`);
      }
      if (item.price !== "" && (typeof item.price !== "number" || !Number.isFinite(item.price) || item.price < 0)) {
        throw new Error(`${label} price must be a non-negative number or empty.`);
      }
      if (!allowedPriorities.includes(item.priority)) throw new Error(`${label} priority must be Low, Medium, or High.`);
      if (!allowedStatuses.includes(item.status)) throw new Error(`${label} status must be Want or Purchased.`);
      if (!safeImageUrl(item.image)) throw new Error(`${label} has an invalid image URL.`);
      if (item.url && !safeProductUrl(item.url)) throw new Error(`${label} product link must use http or https.`);
    });
    return items;
  }

  function formatPrice(price) {
    if (price === "" || price === null || price === undefined || price === 0 || !Number.isFinite(Number(price))) return price === 0 ? "₱0" : "";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 2
    }).format(Number(price));
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function imageElement(item, className) {
    const image = createElement("img", className);
    image.src = safeImageUrl(item.image);
    image.alt = item.name ? `Photo of ${item.name}` : "Wishlist item preview";
    image.loading = "lazy";
    image.onerror = function () {
      image.onerror = null;
      image.src = fallbackImage;
    };
    return image;
  }

  function createProductCard(item) {
    const card = createElement("article", `product-card${item.status === "Purchased" ? " purchased" : ""}`);
    card.dataset.itemId = String(item.id);
    card.tabIndex = 0;
    card.setAttribute("aria-label", `Open details for ${item.name}`);
    card.setAttribute("aria-haspopup", "dialog");

    const imageWrap = createElement("div", "product-image-wrap");
    imageWrap.append(imageElement(item, "product-image"));
    imageWrap.append(createElement("span", "category-chip", item.category));
    if (item.status === "Purchased") imageWrap.append(createElement("span", "purchased-mark", "✓"));

    const content = createElement("div", "product-content");
    const topLine = createElement("div", "product-topline");
    topLine.append(createElement("h3", "product-title", item.name));
    if (item.price !== "" && item.price !== null && item.price !== undefined) {
      topLine.append(createElement("span", "product-price", formatPrice(item.price)));
    }
    content.append(topLine);
    if (item.description) content.append(createElement("p", "product-description", item.description));

    const meta = createElement("div", "product-meta");
    meta.append(createElement("span", `priority-badge ${item.priority.toLowerCase()}`, `${item.priority} priority`));
    meta.append(createElement("span", `status-badge${item.status === "Purchased" ? " purchased" : ""}`, item.status));
    content.append(meta);

    const actions = createElement("div", "card-actions");
    actions.append(createElement("span", "details-hint", "Tap for details"));
    const productUrl = safeProductUrl(item.url);
    if (productUrl) {
      const link = createElement("a", "product-link", "View product ↗");
      link.href = productUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `View ${item.name} product page in a new tab`);
      actions.append(link);
    }
    content.append(actions);
    card.append(imageWrap, content);
    return card;
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return `item-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  window.Wishlist = {
    createElement,
    createId,
    createProductCard,
    formatPrice,
    safeImageUrl,
    safeProductUrl,
    validateItems
  };
})();
