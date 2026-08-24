export interface LineItem {
  id?: number;
  libelle: string;
  quantite: number;
  type: string;
  montant: number;
  total: number;
  categorie?: string | null;
  localisation?: string | null;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeTotal(quantite: number, montant: number): number {
  return round2(quantite * montant);
}

export function sumTotal(items: { total: number }[]): number {
  return round2(items.reduce((acc, item) => acc + item.total, 0));
}

export function withPercentages<T extends { total: number }>(
  items: T[],
  grandTotal: number,
) {
  return items.map((item) => ({
    ...item,
    pourcentage: grandTotal > 0 ? round2((item.total / grandTotal) * 100) : 0,
  }));
}

export function groupByKey(
  expenses: LineItem[],
  key: 'categorie' | 'localisation',
) {
  const groups = new Map<string, number>();
  for (const e of expenses) {
    const k = e[key] || 'Autre';
    groups.set(k, round2((groups.get(k) ?? 0) + e.total));
  }
  const grandTotal = sumTotal(expenses);
  return Array.from(groups.entries()).map(([label, total]) => ({
    label,
    total,
    pourcentage: grandTotal > 0 ? round2((total / grandTotal) * 100) : 0,
  }));
}

export function buildMonthSummary(incomes: LineItem[], expenses: LineItem[]) {
  const totalRevenu = sumTotal(incomes);
  const totalDepense = sumTotal(expenses);
  const diff = round2(totalRevenu - totalDepense);
  return {
    totalRevenu,
    totalDepense,
    diff,
    pctDepense:
      totalRevenu > 0 ? round2((totalDepense / totalRevenu) * 100) : 0,
    pctDiff: totalRevenu > 0 ? round2((diff / totalRevenu) * 100) : 0,
    incomes: withPercentages(incomes, totalRevenu),
    expenses: withPercentages(expenses, totalDepense),
    parCategorie: groupByKey(expenses, 'categorie'),
    parLocalisation: groupByKey(expenses, 'localisation'),
  };
}
