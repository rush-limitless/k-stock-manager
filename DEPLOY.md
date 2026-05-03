# Guide de Déploiement — K-Stock Manager

## Ce qui est déjà fait ✅
- Code pushé sur GitHub : https://github.com/rush-limitless/k-stock-manager
- GitHub Actions configurés (`.github/workflows/`)
- `render.yaml` prêt pour Render
- `eas.json` prêt pour EAS Build

---

## Étape 1 — Base de données PostgreSQL (Neon — gratuit)

1. Va sur https://neon.tech → créer un compte
2. Créer un projet → copier la `DATABASE_URL` (format : `postgresql://user:pass@host/db?sslmode=require`)
3. Exécuter la migration initiale depuis ta machine :
   ```bash
   cd backend
   DATABASE_URL="ta_url_neon" npx prisma migrate deploy
   ```

---

## Étape 2 — Backend sur Railway

1. Va sur https://railway.app → "New Project" → "Deploy from GitHub repo"
2. Sélectionner `rush-limitless/k-stock-manager`
3. Choisir le dossier `backend/` comme root
4. Dans les variables d'environnement Railway, ajouter :
   - `DATABASE_URL` = (URL Neon copiée à l'étape 1)
   - `JWT_SECRET` = (générer avec : `openssl rand -base64 32`)
   - `NODE_ENV` = `production`
5. Railway détecte automatiquement Node.js et lance `npm run build` puis `npm run start:prod`
6. Copier l'URL publique générée (ex: `https://k-stock-api.up.railway.app`)

### Pour le déploiement automatique via GitHub Actions :
1. Dans Railway → Settings → Tokens → créer un token
2. Dans GitHub → Settings → Secrets → Actions → ajouter :
   - `RAILWAY_TOKEN` = (token Railway)
   - `DATABASE_URL` = (URL Neon)

---

## Étape 3 — Mettre à jour l'URL dans le mobile

Une fois l'URL Railway connue, mettre à jour :

**`mobile/.env`** :
```
EXPO_PUBLIC_API_URL=https://k-stock-api.up.railway.app/api
```

**`mobile/eas.json`** (dans les profils `preview` et `production`) :
```json
"env": {
  "EXPO_PUBLIC_API_URL": "https://k-stock-api.up.railway.app/api"
}
```

---

## Étape 4 — Build APK via EAS

1. Créer un compte sur https://expo.dev
2. ```bash
   cd mobile
   npm install -g eas-cli
   eas login
   eas build --profile preview --platform android
   ```
3. EAS génère un lien de téléchargement APK (~10 min)

### Pour le build automatique via GitHub Actions :
1. Dans Expo → Account Settings → Access Tokens → créer un token
2. Dans GitHub → Secrets → ajouter :
   - `EXPO_TOKEN` = (token Expo)
   - `EXPO_PUBLIC_API_URL` = (URL Railway)
3. Déclencher manuellement : GitHub → Actions → "Build Android APK" → "Run workflow"

---

## Résumé des URLs finales

| Service | URL |
|---------|-----|
| GitHub | https://github.com/rush-limitless/k-stock-manager |
| API (Railway) | https://k-stock-api.up.railway.app/api |
| Swagger Docs | https://k-stock-api.up.railway.app/api/docs |
| APK | Lien EAS après build |
