# Emberfall — Tactical Backpack PWA

A fully local/offline backpack-building roguelite built as a PWA.

## Main systems
- 5x5 starting bag with shaped gear and rotation.
- Tap an item, then tap an empty bag cell to reposition it.
- Adjacency, empty space, bag-edge placement, rows, and loose-gear state can change item effects.
- Automatic combat driven by the weapons currently fitted in the bag.
- Focus is a manual combat ability with a cooldown.
- Loot choices after key fights, Elite hunts, route events, traders, shrines, and an unlockable blacksmith.
- Bosses modify the bag itself (row, column, pouch capacity, or harness toughness).
- Essence meta-progression unlocks new item pools, mechanics, routes, relics, and starting styles rather than flat prestige damage.
- Local save plus Export Save / Import Save backup support.

## Run locally
Service workers need HTTP(S), so do not open `index.html` directly if you want full PWA/offline behavior.

From this folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Install on iPhone
Host this folder on an HTTPS static host (GitHub Pages, Cloudflare Pages, Netlify, etc.), open the site in Safari, then use **Share → Add to Home Screen**.

Progress is saved locally on that device. Use **System → Export Save** before deleting the PWA, clearing Safari website data, changing domains, or moving phones.
