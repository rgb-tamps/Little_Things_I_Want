# little things i want.

A personal wishlist made with semantic HTML, CSS, and vanilla JavaScript. It is designed for GitHub Pages and does not need a framework, backend, or database.

## What is included

- Pinterest-inspired responsive masonry gallery
- Category filtering, search, price sorting, and priority sorting
- Item details dialog, lazy-loaded photos, and product links
- Separate admin page to add, edit, and delete wishlist items
- Live card preview and JSON import/export
- LocalStorage for browser edits, with repository JSON as the starting data

## Manage and publish items

The admin page saves changes in the current browser only; GitHub Pages cannot write back to the repository. To publish browser edits:

1. Open **Admin** and choose **Export JSON**.
2. Replace `data/wishlist.json` in the repository with the downloaded `wishlist.json`.
3. Commit and push the change.

Use **Import JSON** to load an exported file in this browser. Use **Reset to repository data** to discard browser edits and reload the version in the repository.

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
