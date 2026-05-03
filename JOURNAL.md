# K-Stock Manager — Journal de Développement

> Dernière mise à jour : Phase 1 complète — Backend NestJS

---

## Statut Global des Phases

| Phase | Description | Statut |
|-------|-------------|--------|
| Phase 1 | Architecture Backend & Base de données | ✅ Terminé |
| Phase 2 | App Android — Core features & UI | 🔲 À faire |
| Phase 3 | Scan code-barres & Graphiques financiers | 🔲 À faire |
| Phase 4 | Sécurisation & Déploiement Cloud | 🔲 À faire |

---

## Phase 1 — Backend NestJS (Terminé)

### Stack utilisée

| Technologie | Version | Rôle |
|-------------|---------|------|
| NestJS | ^10 | Framework API REST modulaire |
| TypeScript | ^5 | Langage (backend + typage strict) |
| Prisma ORM | ^5 | Modélisation DB + migrations |
| PostgreSQL | 16 | Base de données relationnelle |
| Passport.js + JWT | ^10 / ^4 | Authentification stateless |
| bcrypt | ^5.1 | Hachage des mots de passe |
| class-validator | ^0.14 | Validation des DTOs entrants |
| Docker Compose | — | Isolation de PostgreSQL en dev |

---

### Structure des fichiers créés

```
k-stock-manager/
└── backend/
    ├── prisma/
    │   └── schema.prisma           ← Schéma complet de la base de données
    ├── src/
    │   ├── main.ts                 ← Bootstrap, ValidationPipe global, prefix /api
    │   ├── app.module.ts           ← Module racine (importe les 4 modules)
    │   ├── prisma/
    │   │   ├── prisma.service.ts   ← PrismaClient injectable + connexion auto
    │   │   └── prisma.module.ts    ← Module @Global() partagé dans toute l'app
    │   ├── auth/
    │   │   ├── auth.dto.ts         ← RegisterDto, LoginDto (validés)
    │   │   ├── auth.service.ts     ← Logique register/login + bcrypt
    │   │   ├── auth.controller.ts  ← POST /auth/register, POST /auth/login
    │   │   ├── auth.module.ts      ← Config JwtModule (secret, 7d expiry)
    │   │   └── jwt.strategy.ts     ← Stratégie Passport Bearer Token
    │   ├── inventory/
    │   │   ├── inventory.dto.ts    ← CreateProductDto, StockMoveDto, CreateLocationDto
    │   │   ├── inventory.service.ts← CRUD produits + mouvements atomiques + emplacements
    │   │   ├── inventory.controller.ts ← 9 endpoints REST protégés JWT
    │   │   └── inventory.module.ts
    │   └── finance/
    │       ├── finance.dto.ts      ← CreateTransactionDto (validé)
    │       ├── finance.service.ts  ← Transactions + calculs KPIs + données graphique
    │       ├── finance.controller.ts ← 4 endpoints REST protégés JWT
    │       └── finance.module.ts
    ├── .env                        ← DATABASE_URL + JWT_SECRET + PORT
    ├── docker-compose.yml          ← Service postgres:16-alpine + volume persistant
    ├── nest-cli.json               ← Config build NestJS
    ├── package.json                ← Scripts + dépendances
    ├── tsconfig.json               ← Config TS (decorators, ES2021, commonjs)
    └── README.md                   ← Guide de démarrage rapide
```

---

### Base de données — Schéma Prisma

#### Enums

| Enum | Valeurs | Usage |
|------|---------|-------|
| `Role` | `ADMIN`, `MANAGER`, `USER` | Rôle d'un utilisateur |
| `MvtType` | `IN`, `OUT`, `ADJUST` | Type de mouvement de stock |
| `TxType` | `REVENUE`, `EXPENSE` | Type de transaction financière |

#### Modèles

**`User`**
| Champ | Type | Détail |
|-------|------|--------|
| id | String (UUID) | Clé primaire |
| email | String | Unique |
| password | String | Haché bcrypt (salt 10) |
| name | String | Nom affiché |
| role | Role | Défaut : USER |
| movements | StockMovement[] | Relation inverse |
| createdAt | DateTime | Auto |

**`Location`** — Hiérarchie récursive (Entrepôt > Zone > Étagère)
| Champ | Type | Détail |
|-------|------|--------|
| id | String (UUID) | Clé primaire |
| name | String | Nom de l'emplacement |
| parentId | String? | Null = racine (entrepôt) |
| parent | Location? | Relation self-référentielle |
| children | Location[] | Sous-emplacements |
| products | Product[] | Produits stockés ici |

**`Product`**
| Champ | Type | Détail |
|-------|------|--------|
| id | String (UUID) | Clé primaire |
| name | String | Nom du produit |
| sku | String | Unique — référence interne |
| barcode | String? | Unique — code-barres/QR |
| buyPrice | Float | Prix d'achat (COGS) |
| sellPrice | Float | Prix de vente |
| stockQty | Int | Quantité actuelle (défaut 0) |
| minStock | Int | Seuil d'alerte (défaut 5) |
| locationId | String | FK vers Location |
| movements | StockMovement[] | Historique des flux |
| createdAt | DateTime | Auto |

**`StockMovement`** — Traçabilité complète
| Champ | Type | Détail |
|-------|------|--------|
| id | String (UUID) | Clé primaire |
| productId | String | FK vers Product |
| userId | String | FK vers User (qui a fait le mouvement) |
| type | MvtType | IN / OUT / ADJUST |
| quantity | Int | Quantité déplacée |
| reason | String? | Motif optionnel |
| createdAt | DateTime | Horodatage auto |

**`Transaction`** — Finances
| Champ | Type | Détail |
|-------|------|--------|
| id | String (UUID) | Clé primaire |
| type | TxType | REVENUE ou EXPENSE |
| amount | Float | Montant |
| category | String | Ex: "Vente directe", "Loyer", "Salaires" |
| note | String? | Note libre |
| date | DateTime | Défaut now() |

---

### Module Auth — Détail

**Endpoints publics (sans JWT)**

| Méthode | Route | Body | Réponse |
|---------|-------|------|---------|
| POST | `/api/auth/register` | `{ name, email, password }` | `{ id, email, name, role }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ access_token, user: { id, name, role } }` |

**Comportements clés**
- `register` : vérifie l'unicité de l'email → lance `ConflictException` si doublon → hache le mot de passe avec bcrypt (salt 10) → ne retourne jamais le hash
- `login` : compare le hash bcrypt → lance `UnauthorizedException` si invalide → signe un JWT avec payload `{ sub, email, role }` valable 7 jours
- `JwtStrategy` : extrait le token du header `Authorization: Bearer <token>` → injecte `{ id, email, role }` dans `req.user` pour tous les controllers protégés

---

### Module Inventory — Détail

**Endpoints (tous protégés par `AuthGuard('jwt')`)**

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/inventory/products` | Liste tous les produits avec leur emplacement. `?lowStock=true` filtre les produits sous le seuil |
| GET | `/api/inventory/products/barcode/:barcode` | Recherche un produit par code-barres (pour le scan) |
| POST | `/api/inventory/products` | Crée un nouveau produit |
| PUT | `/api/inventory/products/:id` | Met à jour un produit (champs partiels acceptés) |
| DELETE | `/api/inventory/products/:id` | Supprime un produit |
| POST | `/api/inventory/move` | Enregistre un mouvement de stock |
| GET | `/api/inventory/movements` | Historique des 100 derniers mouvements. `?productId=` pour filtrer |
| GET | `/api/inventory/locations` | Arborescence complète (3 niveaux) |
| POST | `/api/inventory/locations` | Crée un emplacement (avec `parentId` optionnel) |

**Logique critique — `moveStock`**

La mise à jour du stock est **atomique** via `prisma.$transaction([...])` :
1. Crée l'entrée `StockMovement` (traçabilité)
2. Met à jour `Product.stockQty` simultanément

Règles de calcul :
- `IN` → `stockQty + quantity`
- `OUT` → `stockQty - quantity` (lance `BadRequestException` si résultat < 0)
- `ADJUST` → remplace directement `stockQty` par la valeur fournie (inventaire physique)

---

### Module Finance — Détail

**Endpoints (tous protégés par `AuthGuard('jwt')`)**

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/finance/transactions` | Enregistre une transaction (vente ou dépense) |
| GET | `/api/finance/transactions` | Liste toutes les transactions. `?type=REVENUE` ou `?type=EXPENSE` |
| GET | `/api/finance/dashboard` | KPIs financiers. `?from=YYYY-MM-DD&to=YYYY-MM-DD` pour filtrer par période |
| GET | `/api/finance/chart` | Données mensuelles pour graphique. `?months=6` (défaut) |

**Logique du Dashboard — `getDashboard`**

Toutes les requêtes sont exécutées en parallèle via `Promise.all` :

```
CA          = SUM(Transaction WHERE type = REVENUE)
Dépenses    = SUM(Transaction WHERE type = EXPENSE)
COGS        = SUM(StockMovement.quantity × Product.buyPrice WHERE type = OUT)
Marge Brute = CA - COGS
Revenu Net  = CA - Dépenses
lowStockCount = COUNT(Product WHERE stockQty <= 5)
```

Réponse JSON :
```json
{
  "ca": 15000,
  "totalExpenses": 4200,
  "cogs": 6000,
  "grossMargin": 9000,
  "netRevenue": 10800,
  "lowStockCount": 3
}
```

**Logique du Graphique — `getRevenueChart`**

- Récupère toutes les transactions des N derniers mois
- Groupe par mois (`YYYY-MM`) en une seule passe
- Retourne un tableau trié pour alimenter directement Victory Native / SVG Charts

```json
[
  { "month": "2025-01", "revenue": 5000, "expense": 1200 },
  { "month": "2025-02", "revenue": 7200, "expense": 1800 }
]
```

---

### Configuration & DevOps

**`.env`**
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/kstock"
JWT_SECRET="change-me-in-production"
PORT=3000
```

**`docker-compose.yml`** — PostgreSQL 16 Alpine avec volume persistant `pgdata`

**`tsconfig.json`** — Options clés :
- `emitDecoratorMetadata: true` + `experimentalDecorators: true` → requis pour les décorateurs NestJS
- `target: ES2021`, `module: commonjs`
- `strictNullChecks: false` → permissif pour le développement initial

**Scripts npm**
| Script | Commande | Description |
|--------|----------|-------------|
| `start:dev` | `nest start --watch` | Dev avec hot-reload |
| `build` | `nest build` | Compilation vers `dist/` |
| `start` | `node dist/main` | Production |
| `prisma:migrate` | `prisma migrate dev` | Créer/appliquer les migrations |
| `prisma:studio` | `prisma studio` | Interface visuelle DB |

---

## Commandes pour démarrer

```bash
cd k-stock-manager/backend

# 1. Lancer PostgreSQL
docker compose up -d

# 2. Installer les dépendances
npm install

# 3. Générer le client Prisma et créer les tables
npx prisma migrate dev --name init

# 4. Lancer l'API en mode développement
npm run start:dev
# → API disponible sur http://localhost:3000/api
```

---

## Ce qui reste à faire

### Phase 2 — App React Native (Mobile Android)
- [ ] Initialisation Expo + TypeScript + NativeWind
- [ ] Navigation : React Navigation (Bottom Tabs + Stack)
- [ ] Écran Login / Register avec appel API auth
- [ ] Dashboard principal (KPIs, jauges de stock)
- [ ] Liste des produits avec filtre stock bas
- [ ] Formulaire ajout/édition produit
- [ ] Écran mouvements de stock (IN/OUT/ADJUST)
- [ ] Écran finances (liste transactions + formulaire)
- [ ] Client HTTP centralisé (axios + intercepteur JWT)
- [ ] Gestion du token (AsyncStorage)

### Phase 3 — Scan & Graphiques
- [ ] Intégration `react-native-vision-camera`
- [ ] Décodage code-barres → appel `GET /inventory/products/barcode/:code`
- [ ] Graphiques Victory Native alimentés par `GET /finance/chart`

### Phase 4 — Déploiement
- [ ] Variables d'environnement de production sécurisées
- [ ] Déploiement API sur Render / Railway
- [ ] PostgreSQL managé (Supabase / Neon)
- [ ] Build APK Android via EAS (Expo Application Services)
