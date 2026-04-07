from __future__ import annotations

import json
from pathlib import Path
import math


PROJECT_ROOT = Path(r"C:\workspace\WoWMap")
TAXI_NODES_2D_JSON = PROJECT_ROOT / "data" / "derived" / "taxi_nodes_2d.json"
OUTPUT_JSON = PROJECT_ROOT / "data" / "derived" / "ship_routes_2d.json"

ROUTES = [
    {
        "id": "boat-menethil-auberdine",
        "mode": "ship",
        "name": "Menethil Harbor <-> Auberdine",
        "from_match": "米奈希爾港",
        "to_match": "奧伯丁",
        "faction": "alliance",
        "waypoints": [
            {"map_id": 0, "x": -2600.0, "y": 2300.0, "z": 0.0},
            {"map_id": 1, "x": 9744.0, "y": -4000.0, "z": 0.0},
            {"map_id": 1, "x": 7716.0, "y": 505.0, "z": 0.0},
        ],
    },
    {
        "id": "boat-menethil-theramore",
        "mode": "ship",
        "name": "Menethil Harbor <-> Theramore",
        "from_match": "米奈希爾港",
        "to_match": "塞拉摩",
        "faction": "alliance",
        "waypoints": [],
    },
    {
        "id": "boat-bootybay-ratchet",
        "mode": "ship",
        "name": "Booty Bay <-> Ratchet",
        "from_match": "藏寶海灣",
        "to_match": "棘齒城",
        "faction": "neutral",
        "waypoints": [],
    },
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
    polyline = [
        {
            "map_id": from_node["map_id"],
            "position": from_node["position"],
        }
    ]
    for waypoint in route_def.get("waypoints", []):
        polyline.append(
            {
                "map_id": waypoint["map_id"],
                "position": {
                    "x": waypoint["x"],
                    "y": waypoint["y"],
                    "z": waypoint["z"],
                },
            }
        )
    polyline.append(
        {
            "map_id": to_node["map_id"],
            "position": to_node["position"],
        }
    )

    distance = 0.0
    for left, right in zip(polyline, polyline[1:]):
        dx = float(right["position"]["x"]) - float(left["position"]["x"])
        dy = float(right["position"]["y"]) - float(left["position"]["y"])
        dz = float(right["position"]["z"]) - float(left["position"]["z"])
        distance += math.sqrt(dx * dx + dy * dy + dz * dz)

    return {
        "id": route_def["id"],
        "mode": route_def["mode"],
        "name": route_def["name"],
        "faction": route_def["faction"],
        "from_node_id": from_node["id"],
        "to_node_id": to_node["id"],
        "from_name": route_def["from_match"],
        "to_name": route_def["to_match"],
        "price": 0,
        "point_count": len(polyline),
        "distance_3d": distance,
        "polyline": polyline,
    }


def main() -> None:
    nodes = load_json(TAXI_NODES_2D_JSON)
    output = {
        "source": str(TAXI_NODES_2D_JSON.relative_to(PROJECT_ROOT)),
        "routes": [build_route(nodes, route_def) for route_def in ROUTES],
        "notes": [
            "Boat routes are currently a manual V1 dataset.",
            "Endpoints are anchored to nearby harbor taxi nodes.",
            "Polylines are straight lines for now.",
        ],
    }

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Exported {len(output['routes'])} ship routes")
    print(f"Output: {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
