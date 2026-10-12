export const GLOVE_SIZES = [
  { size: 'S', palm: [17, 18], width: [7, 7.5] },
  { size: 'M', palm: [18, 19], width: [7.5, 8] },
  { size: 'L', palm: [19, 20], width: [8, 9] },
  { size: 'XL', palm: [20, 22], width: [9, 10] },
  { size: 'XXL', palm: [22, 24], width: [10, 12] },
] as const;

export const SOCK_SIZES = [
  { size: '35–38', shoes: [35, 36, 37, 38] },
  { size: '39–42', shoes: [39, 40, 41, 42] },
  { size: '43–46', shoes: [43, 44, 45, 46] },
] as const;

/** Palm circumference (cm) → glove size. On a boundary the larger size wins. */
export function gloveSizeFor(palmCm: number): string {
  const hit = GLOVE_SIZES.find((g) => palmCm < g.palm[1]);
  return hit ? hit.size : 'XXL';
}

export function sockSizeFor(shoe: number): string | undefined {
  return SOCK_SIZES.find((s) => (s.shoes as readonly number[]).includes(shoe))?.size;
}

export const fmt = (n: number) => String(n).replace('.', ',');
