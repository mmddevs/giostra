type RGB = [number, number, number];

const parse = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;

export const mix = (a: string, b: string, t: number): string => {
  const x = parse(a);
  const y = parse(b);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(', ')})`;
};
