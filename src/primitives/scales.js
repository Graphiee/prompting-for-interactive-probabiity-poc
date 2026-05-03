export function linearScale(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  return (value) => r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

export function ticks(min, max, step) {
  const values = [];
  for (let v = min; v <= max + 1e-9; v += step) values.push(Number(v.toFixed(10)));
  return values;
}
