(function () {
  const $ = (id) => document.getElementById(id);
  const formFields = ["itemId", "itemName", "itemImage", "itemPrice", "itemCategory", "itemPriority", "itemStatus", "itemUrl", "itemDescription"];
  let items = [];
  let toastTimer;

  function toast(message) {
    const element = $("toast");
    element.textContent = message;
    element.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => element.classList.remove("show"), 2800);
  }

  function fieldValue(id) {
    return $(id).value.trim();
  }

  function formItem() {
    const priceValue = fieldValue("itemPrice");
    return {
      id: fieldValue("itemId"),
      name: fieldValue("itemName"),
      image: fieldValue("itemImage"),
      price: priceValue === "" ? "" : Number(priceValue),
      category: fieldValue("itemCategory"),
      description: fieldValue("itemDescription"),
      url: fieldValue("itemUrl"),
      priority: fieldValue("itemPriority"),
      status: fieldValue("itemStatus")
    };
  }

  function renderList() {
    $("adminItemCount").textContent = `${items.length} saved ${items.length === 1 ? "item" : "items"}`;
    const list = $("adminItemList");
    list.replaceChildren();
    items.forEach((item) => {
      const row = Wishlist.createElement("div", "admin-row");
      const image = Wishlist.createElement("img", "admin-thumb");
      image.src = Wishlist.safeImageUrl(item.image);
      image.alt = "";
      image.onerror = function () {
        image.onerror = null;
        image.src = "assets/images/image-placeholder.svg";
      };
      const info = Wishlist.createElement("div", "admin-row-info");
      info.append(
        Wishlist.createElement("strong", "", item.name),
        Wishlist.createElement("span", "", `${item.category} · ${Wishlist.formatPrice(item.price) || "No price"}`)
      );
      const actions = Wishlist.createElement("div", "row-actions");
      const edit = Wishlist.createElement("button", "", "Edit");
      edit.type = "button";
      edit.addEventListener("click", () => editItem(item.id));
      const remove = Wishlist.createElement("button", "delete", "Delete");
      remove.type = "button";
      remove.addEventListener("click", () => deleteItem(item.id));
      actions.append(edit, remove);
      row.append(image, info, actions);
      list.append(row);
    });
  }

  function updatePreview() {
    const item = formItem();
    item.name = item.name || "A little thing I want";
    item.image = item.image || "assets/images/image-placeholder.svg";
    item.category = item.category || "Category";
    item.description = item.description || "A little note about why this is on the wishlist.";
    item.priority = item.priority || "Medium";
    item.status = item.status || "Want";
    const preview = Wishlist.createProductCard(item);
    preview.removeAttribute("data-item-id");
    preview.removeAttribute("tabindex");
    preview.removeAttribute("aria-haspopup");
    $("cardPreview").replaceWith(preview);
    preview.id = "cardPreview";
  }

  function resetForm() {
    $("itemForm").reset();
    $("itemId").value = Wishlist.createId();
    $("itemPriority").value = "Medium";
    $("itemStatus").value = "Want";
    $("formTitle").textContent = "Add a wishlist item";
    updatePreview();
  }

  function editItem(id) {
    const item = items.find((entry) => String(entry.id) === String(id));
    if (!item) return;
    $("itemId").value = String(item.id);
    $("itemName").value = item.name;
    $("itemImage").value = item.image;
    $("itemPrice").value = item.price;
    $("itemCategory").value = item.category;
    $("itemPriority").value = item.priority;
    $("itemStatus").value = item.status;
    $("itemUrl").value = item.url;
    $("itemDescription").value = item.description;
    $("formTitle").textContent = "Edit wishlist item";
    updatePreview();
    $("itemName").focus();
    $("itemForm").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function deleteItem(id) {
    const item = items.find((entry) => String(entry.id) === String(id));
    if (!item || !window.confirm(`Delete "${item.name}" from your wishlist?`)) return;
    items = items.filter((entry) => String(entry.id) !== String(id));
    saveAndRender("Item deleted from this browser.");
  }

  function saveAndRender(message) {
    try {
      WishlistStorage.saveWishlist(items);
      renderList();
      updatePreview();
      $("storageNote").textContent = "Changes are stored in this browser only. Export JSON to publish them.";
      if (message) toast(message);
    } catch (error) {
      console.error(error);
      toast(`Could not save: ${error.message}`);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "wishlist.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast("wishlist.json downloaded.");
  }

  async function importJson(file) {
    try {
      const parsed = JSON.parse(await file.text());
      items = Wishlist.validateItems(parsed);
      saveAndRender("Wishlist imported to this browser.");
      resetForm();
    } catch (error) {
      console.error(error);
      toast(`Import failed: ${error.message}`);
    }
  }

  async function resetRepositoryData() {
    if (!window.confirm("Replace browser edits with the repository wishlist.json?")) return;
    try {
      const repositoryItems = await WishlistStorage.fetchRepositoryItems(true);
      WishlistStorage.clearLocalWishlist();
      items = repositoryItems;
      renderList();
      resetForm();
      $("storageNote").textContent = "Showing repository data. New edits will be stored in this browser.";
      toast("Repository data restored.");
    } catch (error) {
      console.error(error);
      toast(`Could not restore repository data: ${error.message}`);
    }
  }

  $("itemForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const item = formItem();
    const index = items.findIndex((entry) => String(entry.id) === item.id);
    if (index >= 0) items[index] = item;
    else items.unshift(item);
    try {
      Wishlist.validateItems(items);
      saveAndRender("Saved in this browser. Export JSON to publish.");
      resetForm();
    } catch (error) {
      toast(error.message);
    }
  });
  $("newItemButton").addEventListener("click", () => {
    resetForm();
    $("itemName").focus();
    $("itemForm").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("cancelEdit").addEventListener("click", resetForm);
  formFields.slice(1).forEach((id) => $(id).addEventListener("input", updatePreview));
  $("itemPriority").addEventListener("change", updatePreview);
  $("itemStatus").addEventListener("change", updatePreview);
  $("exportButton").addEventListener("click", exportJson);
  $("importInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) importJson(file);
    event.target.value = "";
  });
  $("restoreButton").addEventListener("click", resetRepositoryData);

  async function init() {
    try {
      const result = await WishlistStorage.loadWishlist();
      items = result.items;
      if (result.warning) toast(result.warning);
      renderList();
      resetForm();
      $("storageNote").textContent = result.source === "browser"
        ? "Showing edits saved in this browser. Export JSON to publish them."
        : "Showing repository data. New edits will be stored in this browser.";
    } catch (error) {
      console.error(error);
      $("storageNote").textContent = `Wishlist couldn't be loaded: ${error.message}`;
      renderList();
      resetForm();
    }
  }

  init();
})();
