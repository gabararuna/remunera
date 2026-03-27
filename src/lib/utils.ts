export function evaluateExpression(expr: string | number | undefined): number {
  if (typeof expr === 'number') return expr;
  if (!expr || typeof expr !== 'string' || expr.trim() === '') return 0;

  const sanitized = expr.replace(/,/g, '.');

  if (/^[0-9\s()+\-*/.]+$/.test(sanitized)) {
    try {
      const res = new Function(`return ${sanitized}`)();
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
        // Redonde para até duas casas
        return Number(res.toFixed(2));
      }
    } catch {
      return 0;
    }
  }
  
  const rawNum = Number(sanitized);
  return isNaN(rawNum) ? 0 : rawNum;
}
