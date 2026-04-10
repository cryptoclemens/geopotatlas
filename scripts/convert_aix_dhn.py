#!/usr/bin/env python3
"""
AixDHN Fernwärme-Centroids: EPSG:3035 → WGS84
RWTH Aachen / RWTH-EBC: https://github.com/RWTH-EBC/AixDHN

Voraussetzungen (Mac):
  pip install requests pyproj

Ausführen:
  python3 scripts/convert_aix_dhn.py

Ergebnis: public/geodata/aix-dhn-centroids.json
"""

import json, re, sys, pathlib
try:
    import requests
except ImportError:
    sys.exit("Fehlt: pip install requests pyproj")
try:
    from pyproj import Transformer
except ImportError:
    sys.exit("Fehlt: pip install pyproj")

BASE_URL = "https://raw.githubusercontent.com/RWTH-EBC/AixDHN/main/GeoJSON-Files/ExistingNetworks/"
BUNDESLAENDER = [
    "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg",
    "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern",
    "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz",
    "Saarland", "Sachsen", "Sachsen-Anhalt",
    "Schleswig-Holstein", "Thüringen",
]

# EPSG:3035 (LAEA Europe) → EPSG:4326 (WGS84)
transformer = Transformer.from_crs("EPSG:3035", "EPSG:4326", always_xy=True)

def parse_centroid(s):
    """Parse 'POINT (x y)' string → (lon, lat) in WGS84"""
    m = re.search(r"POINT\s*\(([0-9.]+)\s+([0-9.]+)\)", str(s))
    if not m:
        return None, None
    x, y = float(m.group(1)), float(m.group(2))
    lon, lat = transformer.transform(x, y)
    return round(lat, 5), round(lon, 5)

def demand_label(mwh):
    if mwh >= 1_000_000: return f"{mwh/1_000_000:.1f} TWh/a"
    if mwh >= 1_000:     return f"{mwh/1_000:.0f} GWh/a"
    return f"{mwh:.0f} MWh/a"

results = []
total = 0

for bl in BUNDESLAENDER:
    filename = f"heatgrids_{bl}.geojson"
    url = BASE_URL + filename
    print(f"  → {bl} ...", end=" ", flush=True)
    try:
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"FEHLER: {e}")
        continue

    features = data.get("features", [])
    print(f"{len(features)} Netze")

    for f in features:
        p = f["properties"]
        lat, lon = parse_centroid(p.get("centroid"))
        if lat is None:
            continue
        demand = p.get("DH_demand", 0) or 0
        households = p.get("DH_supplied_households", 0) or 0
        share = p.get("share_DH", 0) or 0
        results.append({
            "lat": lat,
            "lon": lon,
            "gen": p.get("GEN", bl),           # Gemeindename
            "lan": p.get("LAN", bl),            # Bundesland
            "demand_mwh": round(demand),
            "demand_label": demand_label(demand),
            "households": round(households),
            "share_dh": round(share, 1),        # % der Wärme via FW
        })
        total += 1

# Sortieren nach Nachfrage absteigend
results.sort(key=lambda x: x["demand_mwh"], reverse=True)

out = pathlib.Path(__file__).parent.parent / "public" / "geodata" / "aix-dhn-centroids.json"
out.parent.mkdir(parents=True, exist_ok=True)
with open(out, "w", encoding="utf-8") as fh:
    json.dump(results, fh, ensure_ascii=False, separators=(",", ":"))

size_kb = out.stat().st_size / 1024
print(f"\n✓ {total} Fernwärme-Netze → {out}")
print(f"  Dateigröße: {size_kb:.0f} KB")
print(f"  Größte Netze:")
for r in results[:10]:
    print(f"    {r['gen']} ({r['lan']}): {r['demand_label']}, {r['households']:,.0f} Haushalte")
