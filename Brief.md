# Brief – Geopotatlas · Rechtliche Dokumente & Ablage

Stand: April 2026 · vencly GmbH

---

## Wo sind die Rechtstexte gespeichert?

### 1. Quell-Datei (Single Source of Truth)

**`src/components/auth/legalTexts.js`**

Enthält alle Rechtstexte als JavaScript-Konstanten:

| Export | Inhalt |
|---|---|
| `IMPRESSUM` | Angaben gemäß § 5 TMG |
| `AGB_DE` | Allgemeine Geschäftsbedingungen (§§ 1–13) |
| `DSE_DE` | Datenschutzerklärung inkl. Datensicherheit (Abschnitt 10) |
| `getLegalText(which, lang)` | Hilfsfunktion für die App-internen Modals |

Diese Datei wird von der App importiert:
- `LoginScreen.jsx` → Inline-Modals beim Registrierungs-Consent
- `LandingPage.jsx` → Footer-Modals (Impressum / AGB / Datenschutz)

---

### 2. Öffentlich erreichbare Einzelseiten (rechtlich erforderlich)

Statische HTML-Dateien in `public/` — werden vom Webserver direkt ausgeliefert, ohne React-Build:

| Datei | URL (Produktion) | Inhalt |
|---|---|---|
| `public/impressum.html` | `gpa.vencly.com/impressum.html` | Impressum (§ 5 TMG) |
| `public/agb.html` | `gpa.vencly.com/agb.html` | AGB (§§ 1–13) |
| `public/datenschutz.html` | `gpa.vencly.com/datenschutz.html` | Datenschutzerklärung + Datensicherheit (Art. 32 DSGVO) |

> **Rechtlicher Hintergrund:** Impressum, AGB und Datenschutzerklärung müssen jeweils unter einer eigenen, direkten URL erreichbar sein und dürfen nicht ausschließlich als Popup/Modal zugänglich sein (§ 5 TMG, Art. 13 DSGVO).

---

## Wie aktualisieren?

Bei Änderungen an Rechtstexten **beide Dateien** aktualisieren:

```
1. src/components/auth/legalTexts.js  ← JS-Konstanten anpassen
2. public/impressum.html              ← HTML-Seite synchron halten
   public/agb.html
   public/datenschutz.html
```

> Tipp: `legalTexts.js` ist die inhaltliche Referenz — die HTML-Seiten sind davon abgeleitet.

---

## Verlinkung aus der App

Die HTML-Seiten sollten aus dem Footer der App verlinkt sein. Aktuell sind die Links in `LandingPage.jsx` als Modals implementiert. Für die Verlinkung der statischen Seiten können folgende URLs verwendet werden:

```
/geopotatlas/impressum.html
/geopotatlas/agb.html
/geopotatlas/datenschutz.html
```

(Bei Custom Domain `gpa.vencly.com` entfällt der `/geopotatlas/`-Pfad.)

---

## Kontakt für Datenschutzanfragen

- Allgemein: hello@vencly.com
- Datenschutz: datenschutz@vencly.com
- Aufsichtsbehörde: BayLDA Ansbach (www.lda.bayern.de)

---

## Änderungshistorie

| Datum | Änderung |
|---|---|
| April 2026 | Erstfassung — AGB und DSE für Geopotatlas adaptiert (BYOK, Geodaten-Disclaimer, §7 Bohr-Haftungsausschluss) |
| April 2026 | Statische HTML-Seiten erstellt (`public/*.html`) |
