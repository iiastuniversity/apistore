# API Key Vault

A single-page website to store all your API keys from different providers, and copy them instantly when needed.

## Features

- Add, edit, delete API keys
- Copy any key to clipboard with one click
- Mask/reveal keys (per key or all at once)
- Search by name, site, provider, or key
- Categories with filter
- Notes field
- Export / Import JSON backup
- 100% offline & private — data lives in your browser's `localStorage`

## How to use on GitHub Pages

1. Create a new repository on GitHub (e.g. `api-key-vault`).
2. Upload these files (`index.html`, `style.css`, `app.js`) to the repo root.
3. Go to **Settings → Pages**.
4. Under **Source**, select `Deploy from a branch` → branch `main` → folder `/ (root)`.
5. Save. Your site will be live at `https://<your-username>.github.io/api-key-vault/`.

## Important security notes

- Keys are stored in your browser only. **Do not use on a shared/public computer.**
- GitHub Pages hosting itself does NOT see your keys. Only the static files are public.
- Use **Export** regularly to keep a backup, since clearing browser data will erase everything.
- Beware: extensions or scripts on the page could read localStorage. Keep the site tab private.

## Local preview

Just open `index.html` in any browser. No build step, no dependencies.
