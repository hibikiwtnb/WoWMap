# WoWMap

[繁體中文 README](./README.md)

WoWMap is a map and navigation prototype for `World of Warcraft 3.3.5`.
The goal is not to recreate Blizzard's original world map art, but to build a lighter map UI that is better suited for navigation, location lookup, and route planning.

The project can currently display:
- A world map base layer
- Zone labels
- Flight nodes and flight paths
- Ships, zeppelins, and subway routes
- A basic start / end route planning flow

This is still an early prototype. It is already usable, but it still has a number of known bugs and unfinished systems.

## Current scope

- Expansion: `Wrath of the Lich King 3.3.5`
- Map scope: Eastern Kingdoms and Kalimdor
- Goal: a navigation-enabled WoW map, not just a visual world map
- UI direction: inspired by Google Maps, but lighter and more travel-focused

## What is already implemented

- World map view with zoom and drag interaction
- Projected flight node data and flight path rendering
- Ship, zeppelin, and subway route rendering
- Place information sidebar after clicking the map
- Start / end selection and basic route solving
- Alliance / Horde faction selection
- Chinese / English map display toggle

## Data sources

This project currently mixes:
- extracted official client data
- derived client-side intermediate data
- manually curated transport connections

Raw extracted client seed data is not included in the public repository by default:
- `data/client_seed/`

The public build mainly uses:
- `data/derived/`

Local client path used during development:
- `C:\Games\wlk_335`

## Run locally

```bash
cd C:\workspace\WoWMap
python -m http.server 8010
```

Then open:
- `http://127.0.0.1:8010`

## Main files

- `C:\workspace\WoWMap\index.html`
- `C:\workspace\WoWMap\app.css`
- `C:\workspace\WoWMap\app.js`

Data and tooling:
- `C:\workspace\WoWMap\data\derived`
- `C:\workspace\WoWMap\tools`
- `C:\workspace\WoWMap\docs`

## Project status

The project now has a public-facing prototype, but it is not yet a stable release.
There is still ongoing work needed on:
- routing logic
- faction restrictions
- transport data accuracy
- terrain and marker presentation
- place details and navigation UX

## GitHub Pages

Live page:
- [https://hibikiwtnb.github.io/WoWMap/](https://hibikiwtnb.github.io/WoWMap/)
