# NPS Dashboard · Menorca 2026

Dashboard de satisfacción del programa Decelera Ventures.

## Deploy en Railway

### 1. Sube el repo a GitHub
```bash
git init
git add .
git commit -m "init: NPS dashboard"
git remote add origin https://github.com/tu-org/nps-dashboard.git
git push -u origin main
```

### 2. Crea un nuevo proyecto en Railway
- New Project → Deploy from GitHub repo → selecciona el repo

### 3. Añade las variables de entorno
En Railway → tu servicio → **Variables**:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | `https://ewhruuwvarxthbgimxyf.supabase.co` |
| `SUPABASE_ANON_KEY` | tu anon key (Project Settings → API en Supabase) |

Railway añade `PORT` automáticamente — no hace falta configurarlo.

### 4. Deploy
Railway detecta el `package.json` y hace el deploy solo.
El comando de start es `node src/server.js`.

---

## Dev local

```bash
npm install
cp .env.example .env
# edita .env con tu anon key
node src/server.js
# → http://localhost:3000
```

## Arquitectura

```
request → Express (server.js)
           └── lee public/index.html
           └── inyecta SUPABASE_URL y SUPABASE_ANON_KEY en el HTML
           └── sirve HTML al browser
browser → llama directamente a Supabase REST API con la anon key
```

La anon key nunca está hardcodeada en el código — siempre viene de variables de entorno.
