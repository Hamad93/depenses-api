import * as XLSX from 'xlsx';

export interface ParsedLineItem {
  libelle: string;
  quantite: number;
  type: string;
  montant: number;
  total: number;
  categorie?: string | null;
  localisation?: string | null;
}

export interface ParsedWeeklyItem {
  semaine: string;
  date: string;
  libelle: string;
  montant: number;
}

export interface ParsedMonth {
  label: string;
  year: number;
  monthNumber: number;
  incomes: ParsedLineItem[];
  expenses: ParsedLineItem[];
  weeklyExpenses: ParsedWeeklyItem[];
}

const MONTH_MAP: Record<string, number> = {
  janvier: 1,
  jan: 1,
  fevrier: 2,
  fev: 2,
  mars: 3,
  mar: 3,
  avril: 4,
  avr: 4,
  mai: 5,
  juin: 6,
  juillet: 7,
  juil: 7,
  jul: 7,
  aout: 8,
  aou: 8,
  septembre: 9,
  sept: 9,
  sep: 9,
  octobre: 10,
  oct: 10,
  novembre: 11,
  nov: 11,
  decembre: 12,
  dec: 12,
};

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

export function parseMonthLabel(label: string): {
  year: number;
  monthNumber: number;
} {
  const parts = label.trim().split(/\s+/);
  const monthToken = normalize(parts[0] ?? '');
  const yearToken = parts[1] ?? '';
  const monthNumber = MONTH_MAP[monthToken] ?? 1;
  const yearNum = parseInt(yearToken, 10);
  const year = Number.isNaN(yearNum)
    ? new Date().getFullYear()
    : yearNum < 100
      ? 2000 + yearNum
      : yearNum;
  return { year, monthNumber };
}

function cell(row: unknown[], idx: number): string {
  if (idx < 0 || idx >= row.length) return '';
  const v = row[idx] as string | number | boolean | Date | null | undefined;
  return v === undefined || v === null ? '' : String(v).trim();
}

function num(row: unknown[], idx: number): number {
  const raw = cell(row, idx).replace(',', '.');
  const n = parseFloat(raw);
  return Number.isNaN(n) ? 0 : n;
}

function findHeaderRows(rows: unknown[][], target: string): number[] {
  const result: number[] = [];
  rows.forEach((row, idx) => {
    row.forEach((c) => {
      if (typeof c === 'string' && c.trim().toLowerCase() === target)
        result.push(idx);
    });
  });
  return result;
}

function colIndexOf(
  row: unknown[],
  predicate: (normalized: string) => boolean,
): number {
  for (let i = 0; i < row.length; i++) {
    const v = row[i];
    if (typeof v === 'string' && predicate(v.trim().toLowerCase())) return i;
  }
  return -1;
}

function guessCategorieLocalisation(libelleRaw: string): {
  categorie: string;
  localisation: string | null;
} {
  const l = normalize(libelleRaw);
  let categorie = 'Autre';
  if (
    l.includes('loyer') ||
    l.includes('internet') ||
    l.includes('assurance habitation') ||
    l.includes('hydro')
  ) {
    categorie = 'Habitation';
  } else if (
    l.includes('opus') ||
    l.includes('essence') ||
    l.includes('pret auto') ||
    l.includes('assu auto') ||
    l.includes('transport') ||
    l.includes('entretien') ||
    l.includes('ticket')
  ) {
    categorie = 'Transport';
  } else if (l.includes('ration')) {
    categorie = 'Ration';
  }

  let localisation: string | null = null;
  if (l.includes(' ca') || l.includes('quebec') || l.includes('fizz')) {
    localisation = 'CA';
  } else if (
    l.includes('dkr') ||
    l.includes('dakar') ||
    l.includes('sonatel')
  ) {
    localisation = 'DKR';
  }
  return { categorie, localisation };
}

function parseLineItems(
  rows: unknown[][],
  headerRowIdx: number,
): ParsedLineItem[] {
  const header = rows[headerRowIdx] ?? [];
  const libelleCol = colIndexOf(header, (v) => v === 'libelle');
  const qteCol = colIndexOf(
    header,
    (v) => v.includes('qte') || v.includes('quantit'),
  );
  const typeCol = colIndexOf(header, (v) => v === 'type');
  const montantCol = colIndexOf(header, (v) => v === 'montant');
  const totalCol = colIndexOf(header, (v) => v === 'total');

  const items: ParsedLineItem[] = [];
  for (let r = headerRowIdx + 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const libelle = cell(row, libelleCol);
    if (!libelle) break;

    const quantite = qteCol >= 0 ? num(row, qteCol) || 1 : 1;
    const type =
      (typeCol >= 0 ? cell(row, typeCol).toLowerCase() : '') || 'variable';
    const montant = montantCol >= 0 ? num(row, montantCol) : 0;
    const totalRaw = totalCol >= 0 ? num(row, totalCol) : NaN;
    const total =
      totalRaw > 0 ? totalRaw : Math.round(quantite * montant * 100) / 100;
    const { categorie, localisation } = guessCategorieLocalisation(libelle);

    items.push({
      libelle,
      quantite,
      type,
      montant,
      total,
      categorie,
      localisation,
    });
  }
  return items;
}

function parseWeeklyExpenses(rows: unknown[][]): ParsedWeeklyItem[] {
  const markerRows = findHeaderRows(rows, 'semaine');
  if (markerRows.length === 0) return [];
  const markerRow = markerRows[0];
  const headerRow = rows[markerRow + 1] ?? [];
  const dateCol = colIndexOf(headerRow, (v) => v === 'date');
  const libelleCol = colIndexOf(headerRow, (v) => v === 'libelle');
  const montantCol = colIndexOf(headerRow, (v) => v === 'montant');
  if (dateCol < 0 || libelleCol < 0 || montantCol < 0) return [];

  const items: ParsedWeeklyItem[] = [];
  let currentSemaine = '';
  let blankStreak = 0;

  for (let r = markerRow + 2; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const semaineCell = cell(row, 0);
    if (semaineCell) currentSemaine = semaineCell;

    const date = cell(row, dateCol);
    const libelle = cell(row, libelleCol);

    if (!date && !libelle) {
      blankStreak += 1;
      if (blankStreak >= 2) break;
      continue;
    }
    blankStreak = 0;

    if (!date || !libelle) continue;
    const montant = num(row, montantCol);
    items.push({ semaine: currentSemaine, date, libelle, montant });
  }
  return items;
}

export function parseWorkbookBuffer(buffer: Buffer): ParsedMonth[] {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  return wb.SheetNames.map((sheetName) => {
    const ws = wb.Sheets[sheetName];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      raw: false,
      defval: '',
    });

    const libelleHeaderRows = findHeaderRows(rows, 'libelle');
    const [revenueHeaderIdx, expenseHeaderIdx] = libelleHeaderRows;

    const incomes =
      revenueHeaderIdx !== undefined
        ? parseLineItems(rows, revenueHeaderIdx)
        : [];
    const expenses =
      expenseHeaderIdx !== undefined
        ? parseLineItems(rows, expenseHeaderIdx)
        : [];
    const weeklyExpenses = parseWeeklyExpenses(rows);
    const { year, monthNumber } = parseMonthLabel(sheetName);

    return {
      label: sheetName.trim(),
      year,
      monthNumber,
      incomes,
      expenses,
      weeklyExpenses,
    };
  });
}
