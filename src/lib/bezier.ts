/** CSS cubic-bezier solved numerically: Newton on x, then evaluate y. */
export const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  const curve = (a: number, b: number, u: number) =>
    3 * (1 - u) * (1 - u) * u * a + 3 * (1 - u) * u * u * b + u * u * u;
  const slope = (a: number, b: number, u: number) =>
    3 * (1 - u) * (1 - u) * a + 6 * (1 - u) * u * (b - a) + 3 * u * u * (1 - b);

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let u = x;
    for (let i = 0; i < 8; i++) {
      const d = slope(x1, x2, u);
      if (Math.abs(d) < 1e-6) break;
      u -= (curve(x1, x2, u) - x) / d;
    }
    return curve(y1, y2, Math.min(1, Math.max(0, u)));
  };
};
