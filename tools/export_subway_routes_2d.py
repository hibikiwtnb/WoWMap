from __future__ import annotations

import json
import math
from pathlib import Path


PROJECT_ROOT = Path(r"C:\workspace\WoWMap")
TAXI_NODES_2D_JSON = PROJECT_ROOT / "data" / "derived" / "taxi_nodes_2d.json"
OUTPUT_JSON = PROJECT_ROOT / "data" / "derived" / "subway_routes_2d.json"

ROUTES = [
    {
        "id": "subway-stormwind-ironforge",
        "mode": "subway",
        "name": "Stormwind - Ironforge Deeprun Tram",
        "from_match": "暴風城",
        "to_match": "鐵爐堡",
        "line_name_zh": "暴風城 - 鐵爐堡 地鐵",
        "line_name_en": "Stormwind - Ironforge Deeprun Tram",
        "faction": "alliance",
    }
]


def load_json(path: Path) -> dict[str, object]:
    return json.loads(path.read_text(encoding="utf-8"))


def find_node(nodes: dict[str, object], match: str) -> dict[str, object]:
    candidates: list[dict[str, object]] = []
    for map_bucket in nodes["maps"].values():
        for node in map_bucket["usable_nodes"]:
            if match in node["name"]:
                candidates.append(node)

    if not candidates:
        raise ValueError(f"Could not find usable taxi node matching {match!r}")

    candidates.sort(key=lambda item: item["id"])
    return candidates[0]


def build_route(nodes: dict[str, object], route_def: dict[str, str]) -> dict[str, object]:
    from_node = find_node(nodes, route_def["from_match"])
    to_node = find_node(nodes, route_def["to_match"])

    dx = float(to_node["position"]["x"]) - float(from_node["position"]["x"])
    dy = float(to_node["position"]["y"]) - float(from_node["position"]["y"])
    dz = float(to_node["position"]["z"]) - float(from_node["position"]["z"])

    polyline = [
        {"map_id": from_node["map_id"], "position": from_node["position"]},
        {"map_id": to_node["map_id"], "position": to_node["position"]},
    ]

    return {
        "id": route_def["id"],
        "mode": route_def["mode"],
        "name": route_def["name"],
        "line_name_zh": route_def["line_name_zh"],
        "line_name_en": route_def["line_name_en"],
        "faction": route_def["faction"],
        "from_node_id": from_node["id"],
        "to_node_id": to_node["id"],
        "from_name": route_def["from_match"],
        "to_name": route_def["to_match"],
        "price": 0,
        "point_count": 2,
        "distance_3d": math.sqrt(dx * dx + dy * dy + dz * dz),
        "polyline": polyline,
    }


def main() -> None:
    nodes = load_json(TAXI_NODES_2D_JSON)
    output = {
        "source": str(TAXI_NODES_2D_JSON.relative_to(PROJECT_ROOT)),
        "routes": [build_route(nodes, route_def) for route_def in ROUTES],
        "notes": [
            "Subway routes are currently a manual V1 dataset.",
            "Endpoints are anchored to nearby city taxi nodes.",
            "Polylines are straight lines for now.",
        ],
    }

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Exported {len(output['routes'])} subway routes")
    print(f"Output: {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
