from __future__ import annotations

import json
import struct
from pathlib import Path


PROJECT_ROOT = Path(r"C:\workspace\WoWMap")
INPUT_DBC = PROJECT_ROOT / "data" / "client_seed" / "dbc" / "WorldMapArea.dbc"
AREA_TABLE_DBC = PROJECT_ROOT / "data" / "client_seed" / "dbc" / "AreaTable.dbc"
OUTPUT_JSON = PROJECT_ROOT / "data" / "derived" / "worldmap_2d.json"

TARGET_MAP_IDS = {0, 1}
MAP_NAME_ZH_FALLBACK = {
    0: "東部王國",
    1: "卡林多",
}


def read_dbc_header(raw: bytes) -> tuple[int, int, int, int]:
    if raw[:4] != b"WDBC":
        raise ValueError(f"Unexpected DBC magic: {raw[:4]!r}")
    return struct.unpack_from("<4I", raw, 4)


def read_c_string(block: bytes, offset: int) -> str:
    if offset >= len(block):
        return ""
    end = block.find(b"\x00", offset)
    if end < 0:
        end = len(block)
    return block[offset:end].decode("utf-8", "replace")


def parse_worldmaparea(path: Path) -> list[dict[str, object]]:
    raw = path.read_bytes()
    record_count, field_count, record_size, string_block_size = read_dbc_header(raw)
    if field_count != 10 or record_size != 40:
        raise ValueError(
            f"Unexpected WorldMapArea layout: field_count={field_count}, record_size={record_size}"
        )

    header_size = 20
    records_end = header_size + record_count * record_size
    string_block = raw[records_end : records_end + string_block_size]

    records: list[dict[str, object]] = []
    for index in range(record_count):
        offset = header_size + index * record_size
        ints = struct.unpack_from("<10I", raw, offset)
        flts = struct.unpack_from("<10f", raw, offset)

        loc_left = flts[4]
        loc_right = flts[5]
        loc_top = flts[6]
        loc_bottom = flts[7]

        x_min = min(loc_top, loc_bottom)
        x_max = max(loc_top, loc_bottom)
        y_min = min(loc_left, loc_right)
        y_max = max(loc_left, loc_right)

        records.append(
            {
                "id": ints[0],
                "map_id": ints[1],
                "area_id": ints[2],
                "area_name": read_c_string(string_block, ints[3]),
                "loc_left": loc_left,
                "loc_right": loc_right,
                "loc_top": loc_top,
                "loc_bottom": loc_bottom,
                "raw_field_8": ints[8],
                "raw_field_9": ints[9],
                "x_min": x_min,
                "x_max": x_max,
                "y_min": y_min,
                "y_max": y_max,
                "width": x_max - x_min,
                "height": y_max - y_min,
            }
        )

    return records


def parse_area_table_zh(path: Path) -> dict[int, str]:
    raw = path.read_bytes()
    record_count, field_count, record_size, string_block_size = read_dbc_header(raw)
    if field_count != 36 or record_size != 144:
        raise ValueError(
            f"Unexpected AreaTable layout: field_count={field_count}, record_size={record_size}"
        )

    header_size = 20
    records_end = header_size + record_count * record_size
    string_block = raw[records_end : records_end + string_block_size]
    records: dict[int, str] = {}

    for index in range(record_count):
        offset = header_size + index * record_size
        ints = struct.unpack_from("<36I", raw, offset)
        area_id = ints[0]
        area_name_zh = read_c_string(string_block, ints[16]).strip()
        if area_name_zh:
            records[area_id] = area_name_zh

    return records


def select_continent_record(records: list[dict[str, object]], map_id: int) -> dict[str, object]:
    candidates = [record for record in records if record["map_id"] == map_id]
    if not candidates:
        raise ValueError(f"No continent candidate found for map_id={map_id}")
    return max(candidates, key=lambda item: float(item["width"]) * float(item["height"]))


def normalize_zone(
    record: dict[str, object],
    continent: dict[str, object],
    area_table_zh: dict[int, str],
) -> dict[str, object]:
    x_min = float(record["x_min"])
    x_max = float(record["x_max"])
    y_min = float(record["y_min"])
    y_max = float(record["y_max"])
    continent_x_min = float(continent["x_min"])
    continent_x_max = float(continent["x_max"])
    continent_y_min = float(continent["y_min"])
    continent_y_max = float(continent["y_max"])

    return {
        "id": record["id"],
        "area_id": record["area_id"],
        "area_name": record["area_name"],
        "area_name_zh": area_table_zh.get(int(record["area_id"]), ""),
        "raw_field_8": record["raw_field_8"],
        "raw_field_9": record["raw_field_9"],
        "world_rect": {
            "x_min": x_min,
            "x_max": x_max,
            "y_min": y_min,
            "y_max": y_max,
            "width": float(record["width"]),
            "height": float(record["height"]),
        },
        "normalized_rect": {
            "x_min": (x_min - continent_x_min) / (continent_x_max - continent_x_min),
            "x_max": (x_max - continent_x_min) / (continent_x_max - continent_x_min),
            "y_min": (y_min - continent_y_min) / (continent_y_max - continent_y_min),
            "y_max": (y_max - continent_y_min) / (continent_y_max - continent_y_min),
        },
        "center": {
            "x": (x_min + x_max) / 2.0,
            "y": (y_min + y_max) / 2.0,
        },
    }


def build_output(records: list[dict[str, object]], area_table_zh: dict[int, str]) -> dict[str, object]:
    continents: dict[str, object] = {}

    for map_id in sorted(TARGET_MAP_IDS):
        continent = select_continent_record(records, map_id)
        continent_key = str(map_id)

        zones = []
        for record in records:
            if record["map_id"] != map_id:
                continue
            if int(record["id"]) == int(continent["id"]):
                continue
            zones.append(normalize_zone(record, continent, area_table_zh))

        zones.sort(key=lambda item: item["area_name"])

        continents[continent_key] = {
            "map_id": map_id,
            "area_name": continent["area_name"],
            "area_name_zh": area_table_zh.get(int(continent["area_id"]), MAP_NAME_ZH_FALLBACK.get(map_id, "")),
            "record_id": continent["id"],
            "world_bounds": {
                "x_min": continent["x_min"],
                "x_max": continent["x_max"],
                "y_min": continent["y_min"],
                "y_max": continent["y_max"],
                "width": continent["width"],
                "height": continent["height"],
            },
            "transform_notes": {
                "x_axis": "world_x increases left_to_right",
                "y_axis": "world_y increases bottom_to_top",
                "display_rule": "frontend may flip y for screen coordinates, but must not apply local distortion",
            },
            "zones": zones,
        }

    return {
        "source": str(INPUT_DBC.relative_to(PROJECT_ROOT)),
        "area_table_source": str(AREA_TABLE_DBC.relative_to(PROJECT_ROOT)),
        "maps": continents,
        "notes": [
            "This file is derived directly from WorldMapArea.dbc.",
            "Normalized coordinates are continent-local and range from 0 to 1.",
            "Zones are rectangles, not final polygon boundaries.",
        ],
    }


def main() -> None:
    if not INPUT_DBC.exists():
        raise FileNotFoundError(f"Input DBC not found: {INPUT_DBC}")

    records = parse_worldmaparea(INPUT_DBC)
    area_table_zh = parse_area_table_zh(AREA_TABLE_DBC)
    output = build_output(records, area_table_zh)

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(
        json.dumps(output, ensure_ascii=True, indent=2) + "\n",
        encoding="utf-8",
    )

    total_zones = sum(len(continent["zones"]) for continent in output["maps"].values())
    print(f"Exported {len(output['maps'])} continents and {total_zones} zone rectangles")
    print(f"Output: {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
