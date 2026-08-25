-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ExpenseLibelle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExpenseLibelle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_label_key" ON "ExpenseCategory"("label");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseLibelle_label_key" ON "ExpenseLibelle"("label");

-- Seed initial categories
INSERT INTO "ExpenseCategory" ("label", "updatedAt") VALUES
  ('Habitation', CURRENT_TIMESTAMP),
  ('Transport', CURRENT_TIMESTAMP),
  ('Ration', CURRENT_TIMESTAMP),
  ('Autre', CURRENT_TIMESTAMP);

-- Seed initial libelles, mapped to the categories above
INSERT INTO "ExpenseLibelle" ("label", "categoryId", "updatedAt") VALUES
  ('Loyer', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Habitation'), CURRENT_TIMESTAMP),
  ('Assurance habitation', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Habitation'), CURRENT_TIMESTAMP),
  ('Hydro Quebec', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Habitation'), CURRENT_TIMESTAMP),
  ('Internet (Fizz)', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Habitation'), CURRENT_TIMESTAMP),
  ('Internet (Sonatel)', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Habitation'), CURRENT_TIMESTAMP),
  ('Forfait telephone', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Habitation'), CURRENT_TIMESTAMP),
  ('Pret auto', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Transport'), CURRENT_TIMESTAMP),
  ('Assu auto', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Transport'), CURRENT_TIMESTAMP),
  ('Essence', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Transport'), CURRENT_TIMESTAMP),
  ('Opus (10 passage)', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Transport'), CURRENT_TIMESTAMP),
  ('Ration alimentaire', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Ration'), CURRENT_TIMESTAMP),
  ('Econofiness', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Autre'), CURRENT_TIMESTAMP),
  ('Illiflex', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Autre'), CURRENT_TIMESTAMP),
  ('Ecobank', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Autre'), CURRENT_TIMESTAMP),
  ('Dette', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Autre'), CURRENT_TIMESTAMP),
  ('Credit', (SELECT "id" FROM "ExpenseCategory" WHERE "label" = 'Autre'), CURRENT_TIMESTAMP);
