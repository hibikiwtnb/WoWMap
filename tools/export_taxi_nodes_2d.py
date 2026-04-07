from __future__ import annotations

import json
import struct
from pathlib import Path


PROJECT_ROOT = Path(r"C:\workspace\WoWMap")
TAXI_NODES_DBC = PROJECT_ROOT / "data" / "client_seed" / "dbc" / "TaxiNodes.dbc"
WORLDMAP_2D_JSON = PROJECT_ROOT / "data" / "derived" / "worldmap_2d.json"
OUTPUT_JSON = PROJECT_ROOT / "data" / "derived" / "taxi_nodes_2d.json"

TARGET_MAP_IDS = {0, 1}


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


def load_worldmap_2d() -> dict[str, object]:
    return json.loads(WORLDMAP_2D_JSON.read_text(encoding="utf-8"))


def normalized_point(x: float, y: float, bounds: dict[str, float]) -> dict[str, float]:
    return {
        "x": (x - float(bounds["x_min"])) / (float(bounds["x_max"]) - float(bounds["x_min"])),
        "y": (y - float(bounds["y_min"])) / (float(bounds["y_max"]) - float(bounds["y_min"])),
    }


def classify_node(name: str, x: float, y: float) -> tuple[str, bool]:
    stripped = name.strip()
    if x == 0.0 and y == 0.0:
        return "zero_position", False
    if not stripped:
        return "empty_name", False

    special_prefixes = (
        "Generic",
        "Test ",
        "任務 -",
        "Transport:",
        "開發之地",
        "傳送，",
    )
    for prefix in special_prefixes:
        if stripped.startswith(prefix):
            return "special", False

    return "flight_master", True


def match_zone(x: float, y: float, zones: list[dict[str, object]]) -> dict[str, object] | None:
    containing = []
    for zone in zones:
        rect = zone["world_rect"]
        if (
            float(rect["x_min"]) <= x <= float(rect["x_max"])
            and float(rect["y_min"]) <= y <= float(rect["y_max"])
        ):
            area = float(rect["width"]) * float(rect["height"])
            containing.append((area, zone))

    if containing:
        containing.sort(key=lambda item: item[0])
        return containing[0][1]

    nearest = None
    nearest_distance = None
    for zone in zones:
        center = zone["center"]
        dx = x - float(center["x"])
        dy = y - float(center["y"])
        distance_sq = dx * dx + dy * dy
        if nearest_distance is None or distance_sq < nearest_distance:
            nearest_distance = distance_sq
            nearest = zone
    return nearest


def parse_taxi_nodes(path: Path, worldmap: dict[str, object]) -> list[dict[str, object]]:
    raw = path.read_bytes()
    record_count, field_count, record_size, string_block_size = read_dbc_header(raw)
    if field_count != 24 or record_size != 96:
        raise ValueError(
            f"Unexpected TaxiNodes layout: field_count={field_count}, record_size={record_size}"
        )

    header_size = 20
    records_end = header_size + record_count * record_size
    string_block = raw[records_end : records_end + string_block_size]

    exported: list[dict[str, object]] = []
    for index in range(record_count):
        offset = header_size + index * record_size
        ints = struct.unpack_from("<24I", raw, offset)
        flts = struct.unpack_from("<24f", raw, offset)

        map_id = ints[1]
        if map_id not in TARGET_MAP_IDS:
            continue

        x = float(flts[2])
        y = float(flts[3])
        z = float(flts[4])

        continent = worldmap["maps"][str(map_id)]
        zone = match_zone(x, y, continent["zones"])
        normalized = normalized_point(x, y, continent["world_bounds"])

        name = read_c_string(string_block, ints[10])
        node_kind, usable_for_v1 = classify_node(name, x, y)

        exported.append(
            {
                "id": ints[0],
                "map_id": map_id,
                "name": name,
                "position": {
                    "x": x,
                    "y": y,
                    "z": z,
                },
                "continent": continent["area_name"],
                "continent_zh": continent.get("area_name_zh", ""),
                "normalized_position": normalized,
                "node_kind": node_kind,
                "usable_for_v1": usable_for_v1,
                "zone_guess": None
                if zone is None
                else {
                    "id": zone["id"],
                    "area_id": zone["area_id"],
                    "area_name": zone["area_name"],
                    "area_name_zh": zone.get("area_name_zh", ""),
                },
                "raw_fields": {
                    "field_11": ints[11],
                    "field_12": ints[12],
                    "field_13": ints[13],
                },
            }
        )

    exported.sort(key=lambda item: (item["map_id"], item["name"], item["id"]))
    return exported


def build_output(nodes: list[dict[str, object]]) -> dict[str, object]:
    grouped: dict[str, dict[str, list[dict[str, object]]]] = {
        "0": {"all_nodes": [], "usable_nodes": []},
        "1": {"all_nodes": [], "usable_nodes": []},
    }
    for node in nodes:
        bucket = grouped[str(node["map_id"])]
        bucket["all_nodes"].append(node)
        if node["usable_for_v1"]:
            bucket["usable_nodes"].append(node)

    return {
        "source": str(TAXI_NODES_DBC.relative_to(PROJECT_ROOT)),
        "worldmap_source": str(WORLDMAP_2D_JSON.relative_to(PROJECT_ROOT)),
        "maps": grouped,
        "notes": [
            "Coordinates come directly from TaxiNodes.dbc.",
            "Zone assignment is a rectangle-based guess derived from WorldMapArea.dbc.",
            "Normalized positions are continent-local and range from 0 to 1.",
        ],
    }


def main() -> None:
    if not TAXI_NODES_DBC.exists():
        raise FileNotFoundError(f"TaxiNodes DBC not found: {TAXI_NODES_DBC}")
    if not WORLDMAP_2D_JSON.exists():
        raise FileNotFoundError(f"Derived worldmap JSON not found: {WORLDMAP_2D_JSON}")

    worldmap = load_worldmap_2d()
    nodes = parse_taxi_nodes(TAXI_NODES_DBC, worldmap)
    output = build_output(nodes)

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(
        json.dumps(output, ensure_ascii=True, indent=2) + "\n",
        encoding="utf-8",
    )

    print(
        f"Exported {len(output['maps']['0']['all_nodes']) + len(output['maps']['1']['all_nodes'])} taxi nodes "
        f"({len(output['maps']['0']['usable_nodes'])} usable on map 0, "
        f"{len(output['maps']['1']['usable_nodes'])} usable on map 1)"
    )
    print(f"Output: {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
