# Geodaten – Kommunale Wärmeplanung NRW (KWP)

## Enthaltene Datensätze

| Datei | Beschreibung | Quelle |
|---|---|---|
| `kwp-energietraeger.geojson` | Aktuelle Energieträger-Verteilung je Gemeinde (NRW) | LANUK / opengeodata.nrw.de |
| `kwp-waermecluster.geojson` | Wärmecluster-Potenzialflächen für Fernwärme (NRW) | LANUK / opengeodata.nrw.de |

## Datenquelle

Originaldaten: **LANUK NRW – Kommunale Wärmeplanung (KWP)**  
Portal: https://www.opengeodata.nrw.de/produkte/umwelt_klima/energie/kwp/  
Lizenz: Datenlizenz Deutschland – Namensnennung – Version 2.0

## Aktualisierung der Originaldaten

```bash
# GeoPackage-Dateien von opengeodata.nrw.de herunterladen
# (URLs auf dem Portal prüfen, da diese sich ändern können)

# Energieträger
wget "https://www.opengeodata.nrw.de/produkte/umwelt_klima/energie/kwp/KWP_Energietraeger_NRW.zip"
unzip KWP_Energietraeger_NRW.zip

# Wärmecluster
wget "https://www.opengeodata.nrw.de/produkte/umwelt_klima/energie/kwp/KWP_Waermecluster_NRW.zip"
unzip KWP_Waermecluster_NRW.zip

# GeoPackage → GeoJSON konvertieren (EPSG:25832 → WGS84)
ogr2ogr -f GeoJSON \
  -t_srs EPSG:4326 \
  -simplify 0.0001 \
  kwp-energietraeger.geojson \
  KWP_Energietraeger_NRW.gpkg

ogr2ogr -f GeoJSON \
  -t_srs EPSG:4326 \
  -simplify 0.0001 \
  kwp-waermecluster.geojson \
  KWP_Waermecluster_NRW.gpkg
```

## Attributbeschreibung

### kwp-energietraeger

| Attribut | Beschreibung |
|---|---|
| `GEMEINDE` | Gemeindename |
| `AGS` | Amtlicher Gemeindeschlüssel |
| `ENERGIETRAEGER` | Dominanter Energieträger (Erdgas, Fernwärme, Heizöl, Wärmepumpe, …) |
| `ANTEIL_PCT` | Anteil des Energieträgers in Prozent |
| `WOHNEINHEITEN` | Anzahl Wohneinheiten |
| `QUELLJAHR` | Datenjahr |

### kwp-waermecluster

| Attribut | Beschreibung |
|---|---|
| `CLUSTER_ID` | Eindeutige Cluster-ID |
| `BEZEICHNUNG` | Bezeichnung des Clusters |
| `WAERMEDICHTE_MWH_HA` | Wärmedichte in MWh/ha |
| `FLAECHE_HA` | Fläche in Hektar |
| `EIGNUNG` | Eignung für Fernwärme (Sehr hoch / Hoch / Mittel) |
| `EIGNUNGSKLASSE` | Eignungsklasse 1–3 |
| `FERNWAERME_POTENZIAL_MWH_A` | Fernwärmepotenzial in MWh/a |
| `QUELLJAHR` | Datenjahr |

## Hinweis

Die aktuell enthaltenen Daten sind **Beispieldaten** auf Gemeindeebene zur Demonstration der Layer-Integration.  
Für produktiven Einsatz bitte die Originaldaten von opengeodata.nrw.de herunterladen und wie oben beschrieben konvertieren.
