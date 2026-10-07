export function calcularEdad(fecha: string): number | null {
  if (!fecha) return null;
  const n = new Date(fecha + "T00:00:00");
  if (isNaN(n.getTime())) return null;
  const h = new Date();
  let e = h.getFullYear() - n.getFullYear();
  const m = h.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) e--;
  return e;
}
