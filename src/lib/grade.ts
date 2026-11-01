const clean = (s: string) => s.trim().replace(/−/g, "-").replace(/\s+/g, "").replace(/^\+/, "");

function toNumber(s: string): number | null {
  const frac = /^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/.exec(s);
  if (frac) {
    const d = parseFloat(frac[2]);
    return d === 0 ? null : parseFloat(frac[1]) / d;
  }
  return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? parseFloat(s) : null;
}

/** Student-produced response: the bank lists every accepted form, comma separated. */
export function gradeResponse(input: string, accepted: string): boolean {
  const given = clean(input);
  if (!given) return false;
  const gn = toNumber(given);
  return accepted.split(",").map(clean).some((a) => {
    if (a === given) return true;
    const an = toNumber(a);
    return gn !== null && an !== null && Math.abs(an - gn) < 1e-9;
  });
}
