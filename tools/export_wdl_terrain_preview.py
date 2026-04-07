from __future__ import annotations

import json
import struct
from dataclasses import dataclass
from pathlib import Path
from collections import deque

import numpy as np
from PIL import Image
from PIL import ImageFilter


PROJECT_ROOT = Path(r"C:\workspace\WoWMap")
SEED_ROOT = PROJECT_ROOT / "data" / "client_seed" / "terrain"
OUTPUT_ROOT = PROJECT_ROOT / "data" / "derived" / "terrain"

MAP_SIZE = 533.3333
MAP_OFFSET = 32.0 * MAP_SIZE
WDL_GRID_SIZE = 64
HEIGHTS_PER_TILE = 17 * 17 + 16 * 16

TARGETS = [
    ("Azeroth", SEED_ROOT / "Azeroth" / "Azeroth.wdt", SEED_ROOT / "Azeroth" / "Azeroth.wdl"),
    ("Kalimdor", SEED_ROOT / "Kalimdor" / "Kalimdor.wdt", SEED_ROOT / "Kalimdor" / "Kalimdor.wdl"),
]


@dataclass
class WdtTile:
    x: int
    y: int
    flags: int
    area_id: int

    @property
    def has_adt(self) -> bool:
        return bool(self.flags & 0x0001)


def read_chunk_header(blob: bytes, offset: int) -> tuple[bytes, int, int]:
    magic = blob[offset : offset + 4]
    size = struct.unpack_from("<I", blob, offset + 4)[0]
    return magic, size, offset + 8


def parse_wdt(wdt_path: Path) -> dict[str, object]:
    blob = wdt_path.read_bytes()
    offset = 0
    version = None
    tiles: list[WdtTile] = []

    while offset + 8 <= len(blob):
        magic, size, data_offset = read_chunk_header(blob, offset)
        data = blob[data_offset : data_offset + size]

        if magic == b"REVM":
            version = struct.unpack_from("<I", data, 0)[0]
        elif magic == b"NIAM":
            for y in range(WDL_GRID_SIZE):
                for x in range(WDL_GRID_SIZE):
                    entry_offset = (y * WDL_GRID_SIZE + x) * 8
                    flags, area_id = struct.unpack_from("<II", data, entry_offset)
                    tiles.append(WdtTile(x=x, y=y, flags=flags, area_id=area_id))

        offset = data_offset + size

    existing_tiles = [tile for tile in tiles if tile.has_adt]
    return {"version": version, "tiles": tiles, "existing_tiles": existing_tiles}


def parse_wdl(wdl_path: Path) -> dict[str, object]:
    blob = wdl_path.read_bytes()
    offset = 0
    version = None
    map_tile_offsets: list[int] | None = None

    while offset + 8 <= len(blob):
        magic, size, data_offset = read_chunk_header(blob, offset)
        data = blob[data_offset : data_offset + size]

        if magic == b"REVM":
            version = struct.unpack_from("<I", data, 0)[0]
        elif magic == b"FOAM":
            map_tile_offsets = list(struct.unpack_from("<4096I", data, 0))
            break

        offset = data_offset + size

    if map_tile_offsets is None:
        raise ValueError(f"MAOF/FOAM chunk not found in {wdl_path}")

    height_tiles: dict[tuple[int, int], tuple[int, ...]] = {}
    all_heights: list[int] = []

    for index, tile_offset in enumerate(map_tile_offsets):
        if tile_offset == 0:
            continue

        tile_x = index % WDL_GRID_SIZE
        tile_y = index // WDL_GRID_SIZE
        magic, size, data_offset = read_chunk_header(blob, tile_offset)
        if magic != b"ERAM":
            raise ValueError(f"Unexpected chunk at tile offset {tile_offset}: {magic!r}")
        if size != HEIGHTS_PER_TILE * 2:
            raise ValueError(f"Unexpected MARE size {size} in {wdl_path}")

        heights = struct.unpack_from(f"<{HEIGHTS_PER_TILE}h", blob, data_offset)
        height_tiles[(tile_x, tile_y)] = heights
        all_heights.extend(heights)

    return {
        "version": version,
        "tile_offsets": map_tile_offsets,
        "height_tiles": height_tiles,
        "min_height": min(all_heights),
        "max_height": max(all_heights),
    }


def tile_to_world(tile_x: int, tile_y: int) -> tuple[float, float]:
    world_x = MAP_OFFSET - (tile_y * MAP_SIZE)
    world_y = MAP_OFFSET - (tile_x * MAP_SIZE)
    return world_x, world_y


def normalize_height(value: float, minimum: float, maximum: float) -> int:
    if maximum <= minimum:
        return 0
    ratio = (value - minimum) / (maximum - minimum)
    return max(0, min(255, round(ratio * 255)))


def build_dense_tile_grid(heights: tuple[int, ...]) -> np.ndarray:
    dense = np.full((33, 33), np.nan, dtype=np.float32)
    outer = heights[: 17 * 17]
    inner = heights[17 * 17 :]

    for y in range(17):
        for x in range(17):
            dense[y * 2, x * 2] = outer[y * 17 + x]

    for y in range(16):
        for x in range(16):
            dense[y * 2 + 1, x * 2 + 1] = inner[y * 16 + x]

    changed = True
    while changed:
        changed = False
        for y in range(33):
            for x in range(33):
                if not np.isnan(dense[y, x]):
                    continue
                neighbors: list[float] = []
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    nx = x + dx
                    ny = y + dy
                    if 0 <= nx < 33 and 0 <= ny < 33 and not np.isnan(dense[ny, nx]):
                        neighbors.append(float(dense[ny, nx]))
                if neighbors:
                    dense[y, x] = sum(neighbors) / len(neighbors)
                    changed = True

    return np.nan_to_num(dense, nan=0.0)


def build_tile_preview(
    height_tiles: dict[tuple[int, int], tuple[int, ...]],
    min_height: int,
    max_height: int,
    tile_bounds: dict[str, int],
) -> tuple[Image.Image, Image.Image, Image.Image]:
    tile_span_x = tile_bounds["max_tile_x"] - tile_bounds["min_tile_x"] + 1
    tile_span_y = tile_bounds["max_tile_y"] - tile_bounds["min_tile_y"] + 1
    sample_width = tile_span_x * 32 + 1
    sample_height = tile_span_y * 32 + 1
    dense_heights = np.full((sample_height, sample_width), np.nan, dtype=np.float32)

    for (tile_x, tile_y), heights in height_tiles.items():
        dense_tile = build_dense_tile_grid(heights)
        base_x = (tile_x - tile_bounds["min_tile_x"]) * 32
        base_y = (tile_y - tile_bounds["min_tile_y"]) * 32
        dense_heights[base_y : base_y + 33, base_x : base_x + 33] = dense_tile

    dense_heights = np.nan_to_num(dense_heights, nan=float(min_height))
    grayscale = np.zeros((sample_height, sample_width), dtype=np.uint8)
    land_mask = np.zeros((sample_height, sample_width), dtype=np.uint8)
    terrain_rgba = np.zeros((sample_height, sample_width, 4), dtype=np.uint8)

    for y in range(sample_height):
        for x in range(sample_width):
            height = float(dense_heights[y, x])
            gray = normalize_height(height, float(min_height), float(max_height))
            grayscale[y, x] = gray

            if height > 0:
                land_mask[y, x] = 255
                tone = normalize_height(height, 0.0, float(max_height))
                terrain_rgba[y, x] = (
                    max(76, min(178, 88 + tone // 3)),
                    max(102, min(176, 116 + tone // 4)),
                    max(66, min(120, 72 + tone // 6)),
                    236,
                )
            else:
                terrain_rgba[y, x] = (0, 0, 0, 0)

    scale = 3
    target_size = (sample_width * scale, sample_height * scale)
    base_mask = build_continent_base_mask(land_mask).resize(target_size, resample=Image.Resampling.BILINEAR)

    return (
        Image.fromarray(grayscale, mode="L").resize(target_size, resample=Image.Resampling.BILINEAR),
        Image.fromarray(land_mask, mode="L").resize(target_size, resample=Image.Resampling.BILINEAR),
        Image.fromarray(terrain_rgba, mode="RGBA").resize(target_size, resample=Image.Resampling.BILINEAR),
        base_mask,
    )


def build_continent_base_mask(land_mask: np.ndarray) -> Image.Image:
    mask = Image.fromarray(land_mask, mode="L")
    # Derive the base from the existing land silhouette instead of raw tile coverage.
    # This keeps the color block inside the visible continent and avoids giant square chunks.
    mask = fill_mask_holes(mask)
    mask = mask.resize((mask.size[0] * 4, mask.size[1] * 4), resample=Image.Resampling.BILINEAR)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=3.0))
    mask = mask.point(lambda value: 255 if value >= 18 else 0, mode="L")
    mask = mask.filter(ImageFilter.MaxFilter(size=11))
    mask = mask.filter(ImageFilter.MinFilter(size=21))
    mask = mask.filter(ImageFilter.MinFilter(size=21))
    mask = mask.filter(ImageFilter.GaussianBlur(radius=6.0))

    rgba = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    pixels = np.array(mask, dtype=np.uint8)
    base = np.zeros((mask.size[1], mask.size[0], 4), dtype=np.uint8)
    base[:, :, 0] = 224
    base[:, :, 1] = 206
    base[:, :, 2] = 156
    base[:, :, 3] = pixels
    return Image.fromarray(base, mode="RGBA")


def fill_mask_holes(mask: Image.Image) -> Image.Image:
    data = np.array(mask, dtype=np.uint8)
    solid = data >= 128
    visited = np.zeros_like(solid, dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    height, width = solid.shape

    def push(y: int, x: int) -> None:
      if 0 <= y < height and 0 <= x < width and not solid[y, x] and not visited[y, x]:
          visited[y, x] = True
          queue.append((y, x))

    for x in range(width):
        push(0, x)
        push(height - 1, x)
    for y in range(height):
        push(y, 0)
        push(y, width - 1)

    while queue:
        y, x = queue.popleft()
        push(y - 1, x)
        push(y + 1, x)
        push(y, x - 1)
        push(y, x + 1)

    holes = (~solid) & (~visited)
    solid[holes] = True
    return Image.fromarray((solid.astype(np.uint8) * 255), mode="L")


def summarize_map(map_name: str, wdt: dict[str, object], wdl: dict[str, object]) -> dict[str, object]:
    existing_tiles: list[WdtTile] = wdt["existing_tiles"]  # type: ignore[assignment]
    tile_xs = [tile.x for tile in existing_tiles]
    tile_ys = [tile.y for tile in existing_tiles]

    min_tile_x = min(tile_xs)
    max_tile_x = max(tile_xs)
    min_tile_y = min(tile_ys)
    max_tile_y = max(tile_ys)

    top_left_world = tile_to_world(min_tile_x, min_tile_y)
    bottom_right_world = tile_to_world(max_tile_x + 1, max_tile_y + 1)

    return {
        "map_name": map_name,
        "wdt_version": wdt["version"],
        "wdl_version": wdl["version"],
        "existing_tile_count": len(existing_tiles),
        "wdl_tile_count": len(wdl["height_tiles"]),
        "tile_bounds": {
            "min_tile_x": min_tile_x,
            "max_tile_x": max_tile_x,
            "min_tile_y": min_tile_y,
            "max_tile_y": max_tile_y,
        },
        "world_bounds_estimate": {
            "top_left": {"x": top_left_world[0], "y": top_left_world[1]},
            "bottom_right": {"x": bottom_right_world[0], "y": bottom_right_world[1]},
            "tile_size": MAP_SIZE,
        },
        "height_range": {"min": wdl["min_height"], "max": wdl["max_height"]},
        "notes": [
            "This preview is based on WDL low-resolution continent terrain data.",
            "Dense sampling is reconstructed from the 17x17 outer grid and 16x16 inner grid.",
            "The land mask currently uses height > 0 as an experimental land/water split.",
            "Raw orientation follows client world data, not the corrected in-game display orientation.",
        ],
        "assets": {
            "height_image": f"./data/derived/terrain/{map_name.lower()}_wdl_tile_height.png",
            "land_mask_image": f"./data/derived/terrain/{map_name.lower()}_wdl_tile_land_mask.png",
            "terrain_image": f"./data/derived/terrain/{map_name.lower()}_wdl_terrain.png",
            "continent_base_image": f"./data/derived/terrain/{map_name.lower()}_continent_base.png",
        },
    }


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    for map_name, wdt_path, wdl_path in TARGETS:
        if not wdt_path.exists() or not wdl_path.exists():
            raise FileNotFoundError(f"Missing terrain seed files for {map_name}")

        wdt = parse_wdt(wdt_path)
        wdl = parse_wdl(wdl_path)
        summary = summarize_map(map_name, wdt, wdl)
        height_image, land_mask, terrain_image, continent_base = build_tile_preview(
            wdl["height_tiles"],  # type: ignore[arg-type]
            wdl["min_height"],  # type: ignore[arg-type]
            wdl["max_height"],  # type: ignore[arg-type]
            summary["tile_bounds"],
        )

        base_name = map_name.lower()
        summary_path = OUTPUT_ROOT / f"{base_name}_wdl_summary.json"
        height_path = OUTPUT_ROOT / f"{base_name}_wdl_tile_height.png"
        mask_path = OUTPUT_ROOT / f"{base_name}_wdl_tile_land_mask.png"
        terrain_path = OUTPUT_ROOT / f"{base_name}_wdl_terrain.png"
        continent_base_path = OUTPUT_ROOT / f"{base_name}_continent_base.png"

        summary_path.write_text(json.dumps(summary, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")
        height_image.save(height_path)
        land_mask.save(mask_path)
        terrain_image.save(terrain_path)
        continent_base.save(continent_base_path)

        print(f"Exported {map_name} summary: {summary_path}")
        print(f"Exported {map_name} height preview: {height_path}")
        print(f"Exported {map_name} land mask: {mask_path}")
        print(f"Exported {map_name} terrain image: {terrain_path}")
        print(f"Exported {map_name} continent base: {continent_base_path}")


if __name__ == "__main__":
    main()
