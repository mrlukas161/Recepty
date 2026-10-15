/** Normalizácia textu pre porovnávanie: bez diakritiky, malé písmená, jednoduché medzery. */
export function norm(s: string): string {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ß/g, 'ss').replace(/ø/g, 'o').replace(/ł/g, 'l').replace(/đ/g, 'd')
    .replace(/[‐‑‒–—−]/g, '-')
    .replace(/[^a-z0-9%+\-.,;:()[\]/& ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Len písmená a číslice (na porovnanie názvov). */
export const kluc = (s: string) => norm(s).replace(/[^a-z0-9]+/g, '');

/** Levenshteinova vzdialenosť s ranným ukončením nad `max`. */
export function levenshtein(a: string, b: string, max = 3): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let min = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      if (v < min) min = v;
    }
    if (min > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Povolená vzdialenosť podľa dĺžky: krátke slová sa nesmú tolerovať (E-čísla, „soľ“…). */
export function tolerancia(dlzka: number): number {
  return dlzka < 6 ? 0 : dlzka < 10 ? 1 : 2;
}
