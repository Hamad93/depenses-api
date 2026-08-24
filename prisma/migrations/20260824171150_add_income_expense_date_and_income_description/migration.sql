-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monthId" INTEGER NOT NULL,
    "libelle" TEXT NOT NULL,
    "quantite" REAL NOT NULL DEFAULT 1,
    "type" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "total" REAL NOT NULL,
    "categorie" TEXT,
    "localisation" TEXT,
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Expense_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("categorie", "createdAt", "description", "id", "libelle", "localisation", "montant", "monthId", "quantite", "total", "type", "updatedAt") SELECT "categorie", "createdAt", "description", "id", "libelle", "localisation", "montant", "monthId", "quantite", "total", "type", "updatedAt" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
CREATE TABLE "new_Income" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monthId" INTEGER NOT NULL,
    "libelle" TEXT NOT NULL,
    "quantite" REAL NOT NULL DEFAULT 1,
    "type" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "total" REAL NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Income_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Income" ("createdAt", "id", "libelle", "montant", "monthId", "quantite", "total", "type", "updatedAt") SELECT "createdAt", "id", "libelle", "montant", "monthId", "quantite", "total", "type", "updatedAt" FROM "Income";
DROP TABLE "Income";
ALTER TABLE "new_Income" RENAME TO "Income";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
