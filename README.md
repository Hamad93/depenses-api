# Depenses API

API NestJS pour la gestion de depenses previsionnelles par mois : revenus, depenses, statistiques et import Excel.

**Production** : https://depenses-api.onrender.com (doc interactive sur `/api`)

## Stack technique

- [NestJS](https://nestjs.com/) 11 (Express)
- [Prisma ORM](https://www.prisma.io/) 7, generateur `prisma-client` (CJS)
- Base SQLite, via driver adapter [`@prisma/adapter-libsql`](https://www.npmjs.com/package/@prisma/adapter-libsql) :
  - en local, fichier `dev.db` (`file:./dev.db`)
  - en production, base [Turso](https://turso.tech) distante (compatible libSQL/SQLite, persistante)
- Validation via `class-validator` / `class-transformer`
- Documentation Swagger (`@nestjs/swagger`)
- Import Excel (`xlsx` + `multer`)

## Modele de donnees

```
Month (mois)
 ├─ Income[]        (revenus)
 ├─ Expense[]        (depenses)
 └─ WeeklyExpense[]  (depenses hebdomadaires, non exposees cote UI)
```

- Un `Month` peut etre une simulation (`isSimulation`, `baseMonthId` pointant vers le mois d'origine).
- `Income` et `Expense` ont deux dates distinctes :
  - `createdAt` : date de creation reelle, **immuable**
  - `date` : date "metier" de la transaction, **modifiable**, initialisee a aujourd'hui par defaut
- `total = quantite * montant`, calcule cote serveur (jamais fourni par le client).

## Endpoints

| Methode | Route | Description |
|---|---|---|
| GET | `/months?includeSimulations=bool` | Liste des mois |
| GET | `/months/:id` | Detail d'un mois (avec revenus/depenses/hebdo) |
| GET | `/months/:id/summary` | Resume financier (totaux, repartition par categorie/localisation) |
| POST | `/months` | Creer un mois |
| PATCH | `/months/:id` | Modifier un mois |
| DELETE | `/months/:id` | Supprimer un mois (cascade sur ses lignes) |
| POST | `/months/:id/simulate` | Simuler des overrides revenus/depenses sans persister |
| POST | `/months/:id/clone-simulation` | Dupliquer un mois en simulation persistee |
| GET | `/months/:monthId/incomes` | Revenus d'un mois |
| POST | `/months/:monthId/incomes` | Ajouter un revenu |
| PATCH | `/incomes/:id` | Modifier un revenu |
| DELETE | `/incomes/:id` | Supprimer un revenu |
| GET | `/months/:monthId/expenses` | Depenses d'un mois |
| GET | `/months/:monthId/expenses/summary` | Resume des depenses (par categorie/localisation) |
| POST | `/months/:monthId/expenses` | Ajouter une depense |
| PATCH | `/expenses/:id` | Modifier une depense |
| DELETE | `/expenses/:id` | Supprimer une depense |
| GET | `/months/:monthId/weekly-expenses` | Depenses hebdomadaires d'un mois |
| GET | `/months/:monthId/weekly-expenses/summary` | Resume par semaine |
| POST | `/months/:monthId/weekly-expenses` | Ajouter une ligne hebdo |
| PATCH | `/weekly-expenses/:id` | Modifier une ligne hebdo |
| DELETE | `/weekly-expenses/:id` | Supprimer une ligne hebdo |
| GET | `/stats/compare?months=1,2,3` | Comparaison multi-mois + evolution |
| POST | `/import` | Import d'un fichier `.xlsx` (multipart, champ `file`) |

Documentation complete et testable : `/api` (Swagger UI), export JSON sur `/api-json`.

## Demarrage local

```bash
npm install
cp .env.example .env   # DATABASE_URL="file:./dev.db" suffit en local
npx prisma migrate dev
npm run start:dev
```

L'API ecoute sur `http://localhost:3000` par defaut (`PORT` configurable).

## Variables d'environnement

Voir `.env.example`. Resume :

| Variable | Local | Production |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | `libsql://<db>-<org>.turso.io` |
| `DATABASE_AUTH_TOKEN` | non requis | token Turso |
| `FRONTEND_URL` | non requis (localhost:4200 autorise par defaut) | origine du frontend deploye, pour CORS |
| `PORT` | 3000 (defaut) | injecte automatiquement par Render |

## Migrations Prisma

Les migrations sont creees en local avec la base fichier :

```bash
npx prisma migrate dev --name <nom>
```

⚠️ `prisma migrate deploy` ne fonctionne pas contre une URL `libsql://` (le moteur de migration Prisma ne reconnait pas ce schema). Pour appliquer une migration a la base Turso de production :

```bash
# .env pointant temporairement vers DATABASE_URL/DATABASE_AUTH_TOKEN de prod
node scripts/apply-migrations-turso.js
```

Ce script rejoue simplement le SQL de `prisma/migrations/*/migration.sql` via `@libsql/client`.

## Deploiement (Render, gratuit)

Le repo contient un `render.yaml` (blueprint) :

- **Build** : `npm install && npx prisma generate && npm run build`
- **Start** : `npm run start:prod`
- **Node** : 22.14 (Prisma 7 exige `>=20.19` / `>=22.12` / `>=24.0`)
- Variables a renseigner dans le dashboard Render : `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `FRONTEND_URL`

Le tier gratuit de Render met le service en veille apres 15 min d'inactivite (reveil ~30-50s au premier appel).

## Qualite

```bash
npm run lint     # ESLint (+ Prettier)
npx tsc --noEmit # Verification des types
npm run test     # Tests unitaires
npm run test:e2e # Tests end-to-end
```
