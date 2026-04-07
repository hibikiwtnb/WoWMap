# Terrain Source Investigation

## Why this exists

WoWMap should not treat the in-game world map UI as geometric truth.
For navigation, we want a 2D base that stays closer to the 3D world itself.

The current working direction is:

- use `WDT` to know which terrain tiles exist
- use `WDL` to get continent-scale low-resolution terrain heights
- use `ADT` later only if `WDL` proves too coarse

## Local findings

The local `3.3.5` client at `C:\Games\wlk_335` contains these continent terrain files:

- `World\\Maps\\Azeroth\\Azeroth.wdt`
- `World\\Maps\\Azeroth\\Azeroth.wdl`
- `World\\Maps\\Kalimdor\\Kalimdor.wdt`
- `World\\Maps\\Kalimdor\\Kalimdor.wdl`

These were extracted into:

- `data/client_seed/terrain/Azeroth/`
- `data/client_seed/terrain/Kalimdor/`

## What we can rely on

- `WDT`
  - continent tile layout
  - which `64x64` terrain tiles exist
  - a reliable first pass for continent coverage
- `WDL`
  - low-resolution terrain height data for the whole continent
  - enough to build a first top-down terrain experiment
  - much lighter than parsing every `ADT`

## Current export status

The first experiment produces:

- `data/derived/terrain/azeroth_wdl_summary.json`
- `data/derived/terrain/azeroth_wdl_tile_height.png`
- `data/derived/terrain/azeroth_wdl_tile_land_mask.png`
- `data/derived/terrain/kalimdor_wdl_summary.json`
- `data/derived/terrain/kalimdor_wdl_tile_height.png`
- `data/derived/terrain/kalimdor_wdl_tile_land_mask.png`

Important caveats:

- these previews are tile-level, not final coastlines
- the land mask currently uses a simple `average_height > 0` split
- orientation is still raw client terrain orientation, not the corrected front-end display orientation

## Next likely step

If these previews look promising, the next iteration should:

1. replace per-tile averages with denser `WDL` sampling
2. test whether `0` is a good enough provisional sea-level threshold
3. derive simplified continent edges from the mask
4. overlay taxi nodes on top of the terrain preview to verify alignment
