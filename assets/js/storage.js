(function () {
  const STORAGE_KEY = "little-things-wishlist-v1";
  const DATA_URL = "data/wishlist.json";

  async function fetchRepositoryItems(fresh) {
    const url = fresh ? `${DATA_URL}?refresh=${Date.now()}` : DATA_URL;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not load repository wishlist (${response.status}).`);
    const items = await response.json();
    return window.Wishlist.validateItems(items);
  }

  async function loadWishlist() {
    let warning = "";
    const localCopy = localStorage.getItem(STORAGE_KEY);
    if (localCopy !== null) {
      try {
        const items = window.Wishlist.validateItems(JSON.parse(localCopy));
        return { items, source: "browser", warning };
      } catch (error) {
        warning = `Saved browser data could not be used: ${error.message}`;
      }
    }

    try {
      const items = await fetchRepositoryItems(false);
      return { items, source: "repository", warning };
    } catch (error) {
      if (warning) throw new Error(`${warning} ${error.message}`);
      throw error;
    }
  }

  function saveWishlist(items) {
    window.Wishlist.validateItems(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function clearLocalWishlist() {
    localStorage.removeItem(STORAGE_KEY);
  }

  window.WishlistStorage = {
    clearLocalWishlist,
    fetchRepositoryItems,
    loadWishlist,
    saveWishlist
  };
})();
