# Emberfall PWA

A tiny offline progression RPG.

## Run locally
Because service workers require HTTP(S), don't open index.html directly for the installable/offline behavior.

On Windows:
1. Install Python if needed.
2. Open a terminal in this folder.
3. Run: `python -m http.server 8000`
4. Visit `http://localhost:8000` on your computer.

## Put it on iPhone
The easiest way is to host this folder on any HTTPS static host (GitHub Pages, Netlify, Cloudflare Pages, etc.), open it in Safari on iPhone, then Share > Add to Home Screen.

Progress is stored in localStorage on that iPhone/browser.


## Save backups
Open Records > Save Backup in the app:
- Export Save downloads your progress as a JSON backup file.
- Import Save restores a previously exported Emberfall save.
- Importing replaces the current local save after confirmation.
