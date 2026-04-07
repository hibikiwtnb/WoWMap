from __future__ import annotations

import hashlib
import json
from pathlib import Path

import mpyq


CLIENT_ROOT = Path(r"C:\Games\wlk_335")
MPQ_PATH = CLIENT_ROOT / "Data" / "zhTW" / "locale-zhTW.MPQ"
PROJECT_ROOT = Path(r"C:\workspace\WoWMap")
OUTPUT_ROOT = PROJECT_ROOT / "data" / "client_seed"

TARGETS = [
    ("DBFilesClient\\WorldMapArea.dbc", "dbc/WorldMapArea.dbc"),
    ("DBFilesClient\\WorldMapContinent.dbc", "dbc/WorldMapContinent.dbc"),
    ("DBFilesClient\\WorldMapOverlay.dbc", "dbc/WorldMapOverlay.dbc"),
    ("DBFilesClient\\AreaTable.dbc", "dbc/AreaTable.dbc"),
    ("DBFilesClient\\Map.dbc", "dbc/Map.dbc"),
    ("DBFilesClient\\TaxiNodes.dbc", "dbc/TaxiNodes.dbc"),
    ("DBFilesClient\\TaxiPath.dbc", "dbc/TaxiPath.dbc"),
    ("DBFilesClient\\TaxiPathNode.dbc", "dbc/TaxiPathNode.dbc"),
    ("Interface\\WORLDMAP\\Azeroth.zmp", "worldmap/Azeroth.zmp"),
    ("Interface\\WORLDMAP\\Kalimdor.zmp", "worldmap/Kalimdor.zmp"),
]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    if not MPQ_PATH.exists():
        raise FileNotFoundError(f"Client MPQ not found: {MPQ_PATH}")

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    archive = mpyq.MPQArchive(str(MPQ_PATH))

    manifest: dict[str, object] = {
        "client_root": str(CLIENT_ROOT),
        "mpq_path": str(MPQ_PATH),
        "files": [],
    }

    for source_path, relative_output in TARGETS:
        raw = archive.read_file(source_path)
        if not raw:
            raise FileNotFoundError(f"Missing in MPQ: {source_path}")

        output_path = OUTPUT_ROOT / relative_output
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(raw)

        manifest["files"].append(
            {
                "source": source_path,
                "output": str(output_path.relative_to(PROJECT_ROOT)),
                "size": len(raw),
                "sha256": sha256_bytes(raw),
            }
        )

    manifest_path = OUTPUT_ROOT / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=True, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Extracted {len(TARGETS)} files to {OUTPUT_ROOT}")
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
