from __future__ import annotations

import hashlib
import json
from pathlib import Path

import mpyq


CLIENT_ROOT = Path(r"C:\Games\wlk_335")
PROJECT_ROOT = Path(r"C:\workspace\WoWMap")
OUTPUT_ROOT = PROJECT_ROOT / "data" / "client_seed" / "terrain"

# Later MPQs should override earlier base archives.
MPQ_CANDIDATES = [
    CLIENT_ROOT / "Data" / "patch-3.MPQ",
    CLIENT_ROOT / "Data" / "patch-2.MPQ",
    CLIENT_ROOT / "Data" / "patch.MPQ",
    CLIENT_ROOT / "Data" / "common-2.MPQ",
    CLIENT_ROOT / "Data" / "common.MPQ",
]

TARGETS = [
    ("World\\Maps\\Azeroth\\Azeroth.wdt", "Azeroth/Azeroth.wdt"),
    ("World\\Maps\\Azeroth\\Azeroth.wdl", "Azeroth/Azeroth.wdl"),
    ("World\\Maps\\Kalimdor\\Kalimdor.wdt", "Kalimdor/Kalimdor.wdt"),
    ("World\\Maps\\Kalimdor\\Kalimdor.wdl", "Kalimdor/Kalimdor.wdl"),
]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_first_match(source_path: str) -> tuple[bytes, Path]:
    for mpq_path in MPQ_CANDIDATES:
        if not mpq_path.exists():
            continue

        archive = mpyq.MPQArchive(str(mpq_path))
        raw = archive.read_file(source_path)
        if raw:
            return raw, mpq_path

    raise FileNotFoundError(f"Could not find {source_path} in candidate MPQs")


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, object] = {
        "client_root": str(CLIENT_ROOT),
        "mpq_candidates": [str(path) for path in MPQ_CANDIDATES if path.exists()],
        "files": [],
    }

    for source_path, relative_output in TARGETS:
        raw, mpq_path = read_first_match(source_path)
        output_path = OUTPUT_ROOT / relative_output
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(raw)

        manifest["files"].append(
            {
                "source": source_path,
                "source_mpq": str(mpq_path),
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

    print(f"Extracted {len(TARGETS)} terrain files to {OUTPUT_ROOT}")
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
