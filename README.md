# API Key Vault

A single-page website to store all your API keys from different providers, copy them instantly, and sync them privately across devices using your own GitHub Gist.

## Features

- Add, edit, delete API keys
- Multiple **models** per key, each with a display name
- Base URL field
- Copy any key to clipboard with one click
- Mask/reveal keys (per key or all at once)
- Search by name, model, base URL, provider, or key
- Admin login + 10 one-time backup codes
- Dark / light theme (dark by default)
- Export / Import JSON backup
- **Cloud sync via a secret GitHub Gist** — same data on every device

## How to use on GitHub Pages

1. Create a new repository on GitHub (e.g. `api-key-vault`).
2. Upload `index.html`, `style.css`, `app.js` to the repo root.
3. Go to **Settings → Pages**.
4. Under **Source**, select `Deploy from a branch` → branch `main` → folder `/ (root)`.
5. Save. Your site will be live at `https://<your-username>.github.io/api-key-vault/`.

## Login

- Username: `admin`
- Password: `owner@123` (change the hash in `ACCESS.adminHash` in `app.js`)
- Backup codes: see `BACKUP-CODES.txt` (each works once)

## Cloud sync setup (GitHub Gist)

Because GitHub Pages is static, data is kept in `localStorage` per browser. To see the same
keys on every device, enable cloud sync:

1. On GitHub: **Settings → Developer settings → Personal access tokens → Tokens (classic)**
   → Generate new token. Enable only the **`gist`** scope. Copy the token.
2. Open the site, sign in, click **☁ Sync**.
3. Tick **Enable cloud sync**, paste the token, leave **Gist ID** empty, click **Save & Sync**.
   The site creates a secret Gist automatically and shows its ID.
4. On your other device, open the site, sign in, click **☁ Sync**, paste the **same token**
   and the **Gist ID** from step 3, then Save & Sync.

Now every add/edit/delete is pushed to the Gist and pulled on your other devices.

## How sync decides what to keep

Each save stores an `updatedAt` timestamp. When a device loads, it compares the Gist timestamp
with the local one and keeps the newer one (last-write-wins). Avoid editing on two devices at
the exact same time.

## Important security notes

- The token is stored in your browser's `localStorage` on each device. Keep devices private.
- The Gist is **secret** (not public), but anyone who has your token can read it. Never share it.
- GitHub Pages hosting only serves the static files; it never sees your keys or token.
- Use **Export** for an extra offline backup.
