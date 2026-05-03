# K-Stock Manager — Backend

API REST NestJS + Prisma + PostgreSQL.

## Démarrage rapide

```bash
# 1. Lancer PostgreSQL
docker compose up -d

# 2. Installer les dépendances
npm install

# 3. Générer le client Prisma et migrer
npx prisma migrate dev --name init

# 4. Lancer en mode dev
npm run start:dev
```

## Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Connexion → JWT |
| GET | `/api/inventory/products` | Liste produits (`?lowStock=true`) |
| GET | `/api/inventory/products/barcode/:code` | Recherche par code-barres |
| POST | `/api/inventory/products` | Créer un produit |
| PUT | `/api/inventory/products/:id` | Modifier un produit |
| DELETE | `/api/inventory/products/:id` | Supprimer un produit |
| POST | `/api/inventory/move` | Entrée / Sortie / Ajustement stock |
| GET | `/api/inventory/movements` | Historique mouvements |
| GET | `/api/inventory/locations` | Arborescence des emplacements |
| POST | `/api/inventory/locations` | Créer un emplacement |
| POST | `/api/finance/transactions` | Enregistrer une transaction |
| GET | `/api/finance/transactions` | Liste (`?type=REVENUE\|EXPENSE`) |
| GET | `/api/finance/dashboard` | KPIs : CA, marges, revenu net |
| GET | `/api/finance/chart` | Données graphique mensuel (`?months=6`) |
