# little things i want.

A personal wishlist made with semantic HTML, CSS, and vanilla JavaScript. It is designed for GitHub Pages and does not need a framework, backend, or database.

## What is included

- Pinterest-inspired responsive masonry gallery
- Category filtering, search, price sorting, and priority sorting
- Item details dialog, lazy-loaded photos, and product links
- Read-only public page; the editor is not linked from the public navigation
- Separate editor page to add, edit, and delete wishlist items
- Live card preview and JSON import/export
- Public page reads only `data/wishlist.json`; editor changes stay in LocalStorage

## Manage and publish items

GitHub Pages is static and has no authentication or write access to the repository. The public page always reads `data/wishlist.json`. The editor at `admin.html` is not linked from the public navigation, but it is not password-protected; anyone who knows its URL can use it to change their own browser's local copy. Those edits do not affect the public list or other visitors.

To update the public list, open `admin.html`, add/edit/delete items, and choose **Export JSON**. Replace `data/wishlist.json` in the repository with the downloaded file, then commit and push. Only changes committed to the repository update the public list.

Use **Import JSON** to load an exported file in the editor's browser. Use **Reset to repository data** to discard browser edits and reload the published file.

To add your own photos, place them in `assets/images/` and use a relative image path such as `assets/images/my-photo.jpg`, or use an HTTPS image URL. The sample items use placeholder images from Picsum Photos.

## Run locally

Serve the project directory over HTTP so the browser can fetch `data/wishlist.json`:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy with GitHub Pages

1. Push the repository to GitHub.
2. Open the repository **Settings**.
3. Open **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then save.

GitHub Pages will publish the site at the repository's project URL, for example `https://USERNAME.github.io/REPOSITORY/`. All asset and data references are relative, so the project works from that subpath.
