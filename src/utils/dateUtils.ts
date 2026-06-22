/**
 * Calcula a duração entre duas datas no formato DD/MM/YYYY.
 * Retorna string legível: "X ano(s) e Y mês(es)" ou "—" em caso de erro.
 */
export function calcDuracao(inicio: string, fim: string): string {
  try {
    const parse = (s: string) => { const [d, m, y] = s.split('/').map(Number); return new Date(y, m - 1, d); };
    const d1 = parse(inicio), d2 = parse(fim);
    const months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (years === 0) return `${rem} ${rem === 1 ? 'mês' : 'meses'}`;
    if (rem === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    return `${years} ${years === 1 ? 'ano' : 'anos'} e ${rem} ${rem === 1 ? 'mês' : 'meses'}`;
  } catch { return '—'; }
}

/**
 * Determina se uma data no formato DD/MM/YYYY ainda está vigente
 * em relação à data atual.
 */
export function calcVigencia(fim: string): 'Vigente' | 'Encerrado' {
  try {
    const [d, m, y] = fim.split('/').map(Number);
    return new Date(y, m - 1, d) >= new Date() ? 'Vigente' : 'Encerrado';
  } catch { return 'Encerrado'; }
}
