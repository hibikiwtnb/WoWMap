from __future__ import annotations

import json
import math
import struct
from pathlib import Path


PROJECT_ROOT = Path(r"C:\workspace\WoWMap")
TAXI_PATH_DBC = PROJECT_ROOT / "data" / "client_seed" / "dbc" / "TaxiPath.dbc"
TAXI_PATH_NODE_DBC = PROJECT_ROOT / "data" / "client_seed" / "dbc" / "TaxiPathNode.dbc"
TAXI_NODES_2D_JSON = PROJECT_ROOT / "data" / "derived" / "taxi_nodes_2d.json"
WORLDMAP_2D_JSON = PROJECT_ROOT / "data" / "derived" / "worldmap_2d.json"
OUTPUT_JSON = PROJECT_ROOT / "data" / "derived" / "taxi_network_2d.json"

TARGET_MAP_IDS = {0, 1}


def read_dbc_header(raw: bytes) -> tuple[int, int, int, int]:
    if raw[:4] != b"WDBC":
        raise ValueError(f"Unexpected DBC magic: {raw[:4]!r}")
    return struct.unpack_from("<4I", raw, 4)


def load_json(path: Path) -> dict[str, object]:
    return json.loads(path.read_text(encoding="utf-8"))


def normalized_point(x: float, y: float, bounds: dict[str, float]) -> dict[str, float]:
    return {
        "x": (x - float(bounds["x_min"])) / (float(bounds["x_max"]) - float(bounds["x_min"])),
        "y": (y - float(bounds["y_min"])) / (float(bounds["y_max"]) - float(bounds["y_min"])),
    }


def distance_3d(points: list[dict[str, float]]) -> float:
    total = 0.0
    for left, right in zip(points, points[1:]):
        dx = right["x"] - left["x"]
        dy = right["y"] - left["y"]
        dz = right["z"] - left["z"]
        total += math.sqrt(dx * dx + dy * dy + dz * dz)
    return total


def parse_taxi_paths(path: Path) -> list[dict[str, int]]:
    raw = path.read_bytes()
    record_count, field_count, record_size, _ = read_dbc_header(raw)
    if field_count != 4 or record_size != 16:
        raise ValueError(
            f"Unexpected TaxiPath layout: field_count={field_count}, record_size={record_size}"
        )

    paths = []
    for index in range(record_count):
        offset = 20 + index * record_size
        path_id, from_node_id, to_node_id, price = struct.unpack_from("<4I", raw, offset)
        paths.append(
            {
                "id": path_id,
                "from_node_id": from_node_id,
                "to_node_id": to_node_id,
                "price": price,
            }
        )
    return paths


def parse_taxi_path_nodes(path: Path) -> dict[int, list[dict[str, float | int]]]:
    raw = path.read_bytes()
    record_count, field_count, record_size, _ = read_dbc_header(raw)
    if field_count != 11 or record_size != 44:
        raise ValueError(
            f"Unexpected TaxiPathNode layout: field_count={field_count}, record_size={record_size}"
        )

    grouped: dict[int, list[dict[str, float | int]]] = {}
    for index in range(record_count):
        offset = 20 + index * record_size
        ints = struct.unpack_from("<11I", raw, offset)
        flts = struct.unpack_from("<11f", raw, offset)

        path_id = ints[1]
        point = {
            "id": ints[0],
            "path_id": path_id,
            "node_index": ints[2],
            "map_id": ints[3],
            "x": float(flts[4]),
            "y": float(flts[5]),
            "z": float(flts[6]),
            "raw_field_7": ints[7],
            "raw_field_8": ints[8],
            "raw_field_9": ints[9],
            "raw_field_10": ints[10],
        }
        grouped.setdefault(path_id, []).append(point)

    for points in grouped.values():
        points.sort(key=lambda item: int(item["node_index"]))

    return grouped


def main() -> None:
    taxi_nodes = load_json(TAXI_NODES_2D_JSON)
    worldmap = load_json(WORLDMAP_2D_JSON)
    paths = parse_taxi_paths(TAXI_PATH_DBC)
    path_nodes = parse_taxi_path_nodes(TAXI_PATH_NODE_DBC)

    usable_nodes = {}
    for map_id in ("0", "1"):
        for node in taxi_nodes["maps"][map_id]["usable_nodes"]:
            usable_nodes[int(node["id"])] = node

    exported = {"0": [], "1": []}

    for path in paths:
        from_node = usable_nodes.get(path["from_node_id"])
        to_node = usable_nodes.get(path["to_node_id"])
        if from_node is None or to_node is None:
            continue
        if int(from_node["map_id"]) != int(to_node["map_id"]):
            continue

        map_id = int(from_node["map_id"])
        if map_id not in TARGET_MAP_IDS:
            continue

        points = path_nodes.get(path["id"], [])
        if not points:
            continue

        bounds = worldmap["maps"][str(map_id)]["world_bounds"]
        polyline = []
        for point in points:
            polyline.append(
                {
                    "node_index": point["node_index"],
                    "map_id": point["map_id"],
                    "position": {
                        "x": point["x"],
                        "y": point["y"],
                        "z": point["z"],
                    },
                    "normalized_position": normalized_point(float(point["x"]), float(point["y"]), bounds),
                }
            )

        exported[str(map_id)].append(
            {
                "id": path["id"],
                "from_node_id": path["from_node_id"],
                "to_node_id": path["to_node_id"],
                "from_name": from_node["name"],
                "to_name": to_node["name"],
                "price": path["price"],
                "map_id": map_id,
                "continent": from_node["continent"],
                "point_count": len(polyline),
                "distance_3d": distance_3d([p["position"] for p in polyline]),
                "polyline": polyline,
            }
        )

    for bucket in exported.values():
        bucket.sort(key=lambda item: (item["from_name"], item["to_name"], item["id"]))

    output = {
        "source": {
            "taxi_path": str(TAXI_PATH_DBC.relative_to(PROJECT_ROOT)),
            "taxi_path_node": str(TAXI_PATH_NODE_DBC.relative_to(PROJECT_ROOT)),
            "taxi_nodes_2d": str(TAXI_NODES_2D_JSON.relative_to(PROJECT_ROOT)),
            "worldmap_2d": str(WORLDMAP_2D_JSON.relative_to(PROJECT_ROOT)),
        },
        "maps": exported,
        "notes": [
            "Only paths whose endpoints are marked usable_for_v1 are exported.",
            "Polyline coordinates come directly from TaxiPathNode.dbc.",
            "distance_3d is a raw geometric measure, not yet a travel time estimate.",
        ],
    }

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(
        json.dumps(output, ensure_ascii=True, indent=2) + "\n",
        encoding="utf-8",
    )

    total = len(output["maps"]["0"]) + len(output["maps"]["1"])
    print(
        f"Exported {total} taxi paths "
        f"({len(output['maps']['0'])} on map 0, {len(output['maps']['1'])} on map 1)"
    )
    print(f"Output: {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
