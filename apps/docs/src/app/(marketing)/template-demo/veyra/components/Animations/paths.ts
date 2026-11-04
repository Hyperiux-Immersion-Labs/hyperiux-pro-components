// Built using Hyperiux Vault: https://vault.hyperiux.com

export type Point = [number, number];

const r = (n: number) => Math.round(n * 10) / 10;

export function smooth(points: Point[], tension = 1) {
  if (points.length < 2) return "";
  let d = `M${r(points[0][0])},${r(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    d += ` C${r(c1x)},${r(c1y)} ${r(c2x)},${r(c2y)} ${r(p2[0])},${r(p2[1])}`;
  }
  return d;
}

export function wave(width: number, baseY: number, amplitude: number, frequency: number, phase: number, samples = 28, x0 = 0) {
  const pts: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = x0 + t * (width - x0);
    const y = baseY + Math.sin(t * Math.PI * 2 * frequency + phase) * amplitude;
    pts.push([x, y]);
  }
  return smooth(pts);
}

export function curve(a: Point, b: Point, bend = 0.5) {
  const mx = a[0] + (b[0] - a[0]) * bend;
  return `M${r(a[0])},${r(a[1])} C${r(mx)},${r(a[1])} ${r(mx)},${r(b[1])} ${r(b[0])},${r(b[1])}`;
}

export function segments(points: Point[], tension = 1) {
  const out: string[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1: Point = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2: Point = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    out.push(`M${r(p1[0])},${r(p1[1])} C${r(c1[0])},${r(c1[1])} ${r(c2[0])},${r(c2[1])} ${r(p2[0])},${r(p2[1])}`);
  }
  return out;
}

export function vcurve(a: Point, b: Point, bend = 0.5) {
  const my = a[1] + (b[1] - a[1]) * bend;
  return `M${r(a[0])},${r(a[1])} C${r(a[0])},${r(my)} ${r(b[0])},${r(my)} ${r(b[0])},${r(b[1])}`;
}
