# Migrationsplan: Geopotatlas → Hetzner Cloud

**Ziel:** GitHub Pages + Supabase (Cloud) ersetzen durch selbst gehosteten Hetzner-VPS  
**Aktuelle URL:** `cryptoclemens.github.io/geopotatlas/` (Custom Domain: `gpa.vencly.com`)  
**Ziel-URL:** `gpa.vencly.com` (direkt auf Hetzner)

---

## 1. Entscheidung: Auth-Ersatz

| Kriterium | Supabase selbst gehostet | PocketBase |
|---|---|---|
| Setup-Aufwand | Hoch (Docker Compose mit 5+ Services) | Minimal (eine Binary) |
| RAM-Bedarf | ~2 GB | ~50 MB |
| PostgreSQL | Ja (nativ) | SQLite (Standard) |
| RLS / Row Level Security | Ja | Ja (Collection-Regeln) |
| Magic Link / Email Auth | Ja | Ja |
| JS SDK | `@supabase/supabase-js` | `pocketbase` |
| API-Kompatibilität mit aktuellem Code | 100% (kein Umbau) | Umbau nötig |
| Wartungsaufwand | Mittel | Niedrig |

**Empfehlung: Supabase self-hosted** (erspart Code-Umbau) auf einem Hetzner CX22  
(2 vCPU, 4 GB RAM, 40 GB SSD, ~4 €/Monat).

---

## 2. Server-Setup

### 2.1 Hetzner Cloud VPS erstellen

```
Typ:       CX22 (2 vCPU, 4 GB RAM)
Image:     Ubuntu 24.04
Region:    Nürnberg (NBG1) oder Frankfurt (FSN1)
SSH-Key:   eigenen Public Key hinterlegen
Firewall:  Port 22, 80, 443 öffnen
```

### 2.2 Basis-Konfiguration

```bash
ssh root@<HETZNER_IP>

apt update && apt upgrade -y

# Docker installieren
curl -fsSL https://get.docker.com | sh
systemctl enable docker
apt install -y docker-compose-plugin

# Deployment-User anlegen
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
```

### 2.3 Firewall (ufw)

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## 3. Supabase Self-Hosted (Docker Compose)

### 3.1 Repo klonen

```bash
su - deploy
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
```

### 3.2 `.env` anpassen (Pflichtfelder)

```env
POSTGRES_PASSWORD=<sicheres-passwort>
JWT_SECRET=<min-32-zeichen-zufallsstring>
ANON_KEY=<generieren-siehe-unten>
SERVICE_ROLE_KEY=<generieren-siehe-unten>
SITE_URL=https://gpa.vencly.com
ADDITIONAL_REDIRECT_URLS=https://gpa.vencly.com
SMTP_HOST=<smtp-server>
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<passwort>
SMTP_SENDER_NAME=Geopotatlas
```

> JWT-Keys generieren: `openssl rand -base64 32`  
> ANON_KEY / SERVICE_ROLE_KEY: mit `supabase` CLI oder JWT-Generator mit JWT_SECRET erstellen.

### 3.3 Supabase starten

```bash
docker compose up -d
# Dashboard: http://<IP>:8000
```

---

## 4. Frontend-Anpassungen

### 4.1 `src/lib/supabase.js`

```js
// Vorher (Supabase Cloud):
const SUPABASE_URL = 'https://bcqqdlkttuxmkymrssgz.supabase.co'
const SUPABASE_KEY = 'eyJhbGci...'

// Nachher (Hetzner):
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
```

### 4.2 `.env.production`

```env
VITE_SUPABASE_URL=https://gpa.vencly.com/supabase
VITE_SUPABASE_ANON_KEY=<anon-key-vom-hetzner-setup>
```

### 4.3 `vite.config.js`

```js
base: '/',  // Custom Domain, kein Unterordner mehr nötig
```

---

## 5. nginx-Konfiguration

### 5.1 Verzeichnisstruktur

```
/home/deploy/
├── docker-compose.yml
├── nginx/
│   ├── conf.d/geopotatlas.conf
│   └── html/          ← React build (dist/)
└── certbot/
    ├── conf/
    └── www/
```

### 5.2 `nginx/conf.d/geopotatlas.conf`

```nginx
server {
    listen 80;
    server_name gpa.vencly.com;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl;
    server_name gpa.vencly.com;

    ssl_certificate     /etc/letsencrypt/live/gpa.vencly.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gpa.vencly.com/privkey.pem;

    # React SPA
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Supabase API
    location /supabase/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5.3 SSL-Zertifikat (Let's Encrypt)

```bash
docker run --rm \
  -v ./certbot/conf:/etc/letsencrypt \
  -v ./certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot -d gpa.vencly.com \
  --email admin@vencly.com --agree-tos
```

---

## 6. Datenbank-Migration

### 6.1 Dump aus Supabase Cloud

```bash
pg_dump "postgresql://postgres:<pw>@db.bcqqdlkttuxmkymrssgz.supabase.co:5432/postgres" \
  --schema=public -t profiles > profiles_dump.sql
```

### 6.2 Import in Hetzner-PostgreSQL

```bash
docker exec -i supabase-db psql -U postgres -d postgres < profiles_dump.sql
```

---

## 7. GitHub Actions — Deploy auf Hetzner

### 7.1 Secrets in GitHub hinterlegen

```
HETZNER_SSH_KEY        → privater SSH-Key des deploy-Users
HETZNER_HOST           → IP-Adresse des Servers
VITE_SUPABASE_URL      → https://gpa.vencly.com/supabase
VITE_SUPABASE_ANON_KEY → <anon-key>
```

### 7.2 `.github/workflows/deploy.yml` (ersetzen)

```yaml
name: Deploy to Hetzner

on:
  push:
    branches: [react-app]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_GH_FEEDBACK_TOKEN: ${{ secrets.VITE_GH_FEEDBACK_TOKEN }}
        run: npm ci && npm run build

      - name: Deploy via SCP
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.HETZNER_HOST }}
          username: deploy
          key: ${{ secrets.HETZNER_SSH_KEY }}
          source: "dist/*"
          target: "/home/deploy/nginx/html"
          strip_components: 1

      - name: Reload nginx
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.HETZNER_HOST }}
          username: deploy
          key: ${{ secrets.HETZNER_SSH_KEY }}
          script: docker exec nginx nginx -s reload
```

---

## 8. DNS-Umstellung (Cloudflare)

```
Aktuell:  gpa  CNAME  cryptoclemens.github.io  (DNS only)
Nachher:  gpa  A      <HETZNER_IP>             (Proxied ✓)
```

**Reihenfolge:**
1. Hetzner-Server aufsetzen und über IP testen
2. SSL-Zertifikat ausstellen
3. Test-Deploy via GitHub Actions
4. DNS-Eintrag in Cloudflare ändern (TTL auf 60s setzen)
5. ~10 Minuten warten → `gpa.vencly.com` testen
6. Supabase Cloud nach 30 Tagen stabilem Betrieb kündigen

---

## 9. Rollback-Plan

| Schritt | Aktion |
|---|---|
| DNS zurück | Cloudflare: CNAME auf `cryptoclemens.github.io` zurücksetzen |
| Supabase Cloud | Noch aktiv → sofort wieder nutzbar |
| GitHub Pages | Noch aktiv → kein Umbau nötig |
| Code | GitHub Secret `VITE_SUPABASE_URL` auf Cloud-URL zurücksetzen |

> **Wichtig:** Supabase Cloud erst nach 30 Tagen stabilem Betrieb auf Hetzner kündigen.

---

## 10. Checkliste

### Server
- [ ] Hetzner CX22 erstellt, SSH-Zugang funktioniert
- [ ] Docker + Docker Compose installiert
- [ ] Firewall konfiguriert (22, 80, 443)

### Supabase Self-Hosted
- [ ] `.env` mit allen Pflichtfeldern befüllt
- [ ] `docker compose up -d` erfolgreich
- [ ] Dashboard erreichbar (`http://<IP>:8000`)
- [ ] Email-Auth aktiviert, Site URL gesetzt
- [ ] `profiles`-Tabelle + RLS-Policy migriert

### SSL & nginx
- [ ] Let's Encrypt Zertifikat ausgestellt
- [ ] nginx läuft, HTTPS funktioniert
- [ ] SPA-Routing (`try_files`) funktioniert
- [ ] `/supabase/` Proxy leitet korrekt weiter

### Frontend
- [ ] `VITE_SUPABASE_URL` auf Hetzner-URL geändert (GitHub Secret)
- [ ] `base: '/'` in `vite.config.js`
- [ ] Build lokal erfolgreich
- [ ] GitHub Actions Secrets alle gesetzt

### Deploy & DNS
- [ ] GitHub Actions Deploy auf Hetzner funktioniert
- [ ] Test über IP erfolgreich
- [ ] Cloudflare DNS auf Hetzner-IP umgestellt
- [ ] `gpa.vencly.com` erreichbar mit HTTPS

### Abschluss
- [ ] Login, Registrierung, API-Key-Speichern getestet
- [ ] Pro-View mit Claude API getestet
- [ ] Supabase Cloud nach 30 Tagen stabilem Betrieb kündigen
