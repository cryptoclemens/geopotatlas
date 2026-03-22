# Geothermie-Potential-Atlas

Interaktive Karte zur strategischen Bewertung geothermischer Skalierungspotenziale in Nordwesteuropa – mit Fokus auf tiefe Aquifersysteme, Fernwärme-Infrastruktur und industrielle Abwärmequellen.

**Live:** [cryptoclemens.github.io/geopotatlas](https://cryptoclemens.github.io/geopotatlas/)

---

## Inhalt

| Layer-Gruppe | Beschreibung |
|---|---|
| **Aquifer-Systeme** | Niederrhein, Norddeutscher Aquifer, Molasse, Oberrhein-Buntsandstein |
| **Geologie (WMS)** | BGR GÜK250, IGME5000, HÜK250 – live via WMS-Proxy |
| **Geothermie-Höffigkeit** | Locker- & Festgestein </>1.000 m (EGDI, BGR) |
| **Fernwärme-Märkte** | Städte mit FW-Anteil >20% (BWP-Daten 2023) |
| **Wärmeproduzenten** | Rechenzentren, Kraftwerke, Müllverbrennung, Stahlwerke (OSM) |
| **Abwärme BfEE** | Industrielle Abwärmepotenziale Deutschland |
| **Zensus 2022** | Heizungsart & Energieträger auf 100m-Raster (Destatis WMS) |

---

## Technischer Stack

- **Frontend:** React + Leaflet (gebaut mit Vite, Bundle minifiziert)
- **Daten:** OpenStreetMap Overpass API, WMS-Dienste BGR/EGDI/Destatis, Supabase (Feedback)
- **Hosting:** GitHub Pages (`gh-pages`-Branch)

## Deployment

```bash
# Feature-Branch entwickeln – Version wird beim Push automatisch erhöht
git push origin <feature-branch>

# Auf gh-pages deployen (live schalten)
cd /tmp/gh-pages-work
git pull origin gh-pages
git merge <feature-branch>
git push origin gh-pages
```

Der Pre-Push-Hook (`.githooks/pre-push`) bumpt die Patch-Version automatisch bei jedem Push vom Feature-Branch.

## Zugang

Passwortgeschützt – Zugang nur für autorisierte Nutzer.

---

*Datenquellen: BGR, EGDI, OpenStreetMap, Destatis Zensus 2022, BWP, BfEE*
