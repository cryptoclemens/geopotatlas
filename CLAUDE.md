# Claude Code – Projektregeln

## Deploy-Workflow

**Nach Abschluss jeder Aufgabe direkt auf `gh-pages` mergen und pushen** – kein Pull Request nötig.

```bash
# Änderungen auf Feature-Branch entwickeln, dann:
cd /tmp/gh-pages-work          # gh-pages worktree
git pull origin gh-pages       # aktuellen Stand holen
git merge <feature-branch>     # Änderungen mergen
git push origin gh-pages       # live deployen
```

Der Pre-Push-Hook bumpt die Version automatisch.

## Projektstruktur

- `index.html` – Einstiegspunkt, Passwortschutz, Versionsnummer
- `assets/index-CXjRDLx0.js` – gebautes React-Bundle (minifiziert)
- `assets/index-DB2QrsvX.css` – Styles
- `.githooks/pre-push` – auto version bump bei jedem Push

## Wichtige Hinweise

- Das Bundle ist minifiziert – Änderungen direkt im Bundle vornehmen (kein Build-System vorhanden)
- GitHub Pages deployed automatisch von `gh-pages`-Branch
- Live-URL: `cryptoclemens.github.io/geopotatlas/`
