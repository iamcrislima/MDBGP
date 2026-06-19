// ─── Shared FP types & mock data ─────────────────────────────────────────────
// Fonte única de verdade: ambas as páginas (VisaoGeral e GerenciarFiliados)
// importam daqui, garantindo que o número exibido no gráfico = itens filtrados.

export type Etapa    = 'Publicidade' | 'Filiação' | 'Conferência' | 'Etapa final';
export type StatusFP = 'Pendente' | 'Deferido' | 'Indeferido';
export interface HistEntry { etapa: string; data: string; resp: string }
export interface FP {
  id: number; protocolo: string; processoId: string; processoLink: string;
  nome: string; cpf: string; dtNasc: string; email: string; celular: string;
  uf: string; municipio: string; domEleitoral: string;
  dtAbertura: string; dtAberturaDt: string; dtPreenchimento: string;
  tipoDiretorio: 'Municipal' | 'Estadual';
  etapa: Etapa; status: StatusFP;
  enviadoMunicipal: boolean; enviadoEstadual: boolean;
  dtProcessoInterno: string; historico: HistEntry[];
}

export const ETAPAS: Etapa[] = ['Publicidade', 'Filiação', 'Conferência', 'Etapa final'];

export const FP_UF_MUNS: Record<string, string[]> = {
  SC: ['Blumenau','Chapecó','Florianópolis','Joinville','São José'],
  SP: ['Campinas','Ribeirão Preto','Santos','São Paulo','Sorocaba'],
  RS: ['Canoas','Caxias do Sul','Pelotas','Porto Alegre','Santa Maria'],
  MG: ['Belo Horizonte','Contagem','Juiz de Fora','Montes Claros','Uberlândia'],
  BA: ['Camaçari','Feira de Santana','Salvador','Vitória da Conquista'],
  GO: ['Anápolis','Aparecida de Goiânia','Goiânia','Rio Verde'],
  PR: ['Cascavel','Curitiba','Londrina','Maringá','Ponta Grossa'],
  RJ: ['Duque de Caxias','Niterói','Nova Iguaçu','Rio de Janeiro'],
  CE: ['Caucaia','Fortaleza','Juazeiro do Norte','Maracanaú'],
  PE: ['Caruaru','Olinda','Petrolina','Recife'],
  MA: ['Imperatriz','São Luís','Timon'],
};

// Distribuição espelha STATE_DATA de VisaoGeralFiliacaoPage
// Σandamento=527, Σdeferido=789, Σindeferido=413, total=1729
const DISTRIBUTION = [
  { uf: 'SP', andamento:  82, deferido: 131, indeferido:  83 },
  { uf: 'RS', andamento:  73, deferido: 106, indeferido:  59 },
  { uf: 'MG', andamento:  64, deferido: 100, indeferido:  51 },
  { uf: 'SC', andamento:  59, deferido:  90, indeferido:  44 },
  { uf: 'BA', andamento:  54, deferido:  81, indeferido:  39 },
  { uf: 'PR', andamento:  49, deferido:  71, indeferido:  35 },
  { uf: 'RJ', andamento:  44, deferido:  65, indeferido:  31 },
  { uf: 'CE', andamento:  39, deferido:  56, indeferido:  28 },
  { uf: 'GO', andamento:  34, deferido:  49, indeferido:  24 },
  { uf: 'PE', andamento:  29, deferido:  40, indeferido:  19 },
];

// Etapa para Pendentes: Publicidade(203) → Filiação(156) → Conferência(168)
const PEND_BREAKS = [203, 359]; // índices de corte
function pendEtapa(idx: number): Etapa {
  if (idx < PEND_BREAKS[0]) return 'Publicidade';
  if (idx < PEND_BREAKS[1]) return 'Filiação';
  return 'Conferência';
}

const FIRSTS_F = ['Ana','Maria','Sandra','Adriana','Juliana','Tereza','Eliane','Camila','Vanessa','Patricia','Cristina','Luciana','Amanda','Fernanda','Beatriz','Leticia','Natalia','Bruna','Mariana','Claudia','Rosana','Silvia','Viviane','Renata','Alessandra'];
const FIRSTS_M = ['Carlos','João','Paulo','José','Diego','Felipe','Marcos','Roberto','Antonio','Rafael','Fernando','Bruno','Rodrigo','Lucas','André','Ricardo','Thiago','Eduardo','Alexandre','Gustavo','Leandro','Sérgio','Fábio','Henrique','Marcelo'];
const LASTS    = ['Silva','Santos','Costa','Oliveira','Lima','Pereira','Ferreira','Alves','Rodrigues','Gomes','Martins','Barbosa','Carvalho','Melo','Souza','Nunes','Freitas','Cardoso','Araújo','Pinto','Mendes','Rocha','Cruz','Monteiro','Moreira','Neto','Dias','Teixeira','Ribeiro','Correia'];

function mkName(id: number): string {
  const isFem = id % 3 !== 0;
  const pool = isFem ? FIRSTS_F : FIRSTS_M;
  return `${pool[id % pool.length]} ${LASTS[(id * 7) % LASTS.length]} ${LASTS[(id * 13 + 5) % LASTS.length]}`;
}

function mkCPF(id: number): string {
  const n = String(id).padStart(9, '0');
  const last2 = String((id % 89) + 10);
  return `${n.slice(0,3)}.***.***-${last2}`;
}

function mkDate(seed: number) {
  const base = new Date(2024, 0, 1);
  base.setDate(base.getDate() + (seed * 17) % 550);
  const dd   = String(base.getDate()).padStart(2,'0');
  const mm   = String(base.getMonth()+1).padStart(2,'0');
  const yyyy = base.getFullYear();
  const hh   = String(8 + (seed % 10)).padStart(2,'0');
  const mi   = String(seed % 59).padStart(2,'0');
  const bYr  = 1950 + (seed % 50);
  const bDd  = String(1 + (seed * 3) % 28).padStart(2,'0');
  const bMm  = String(1 + (seed * 7) % 12).padStart(2,'0');
  return {
    dtAbertura: `${dd}/${mm}/${yyyy}`,
    dtAberturaDt: `${yyyy}-${mm}-${dd}`,
    dtPreenchimento: `${dd}/${mm}/${yyyy} ${hh}:${mi}`,
    dtNasc: `${bDd}/${bMm}/${bYr}`,
  };
}

function mkHist(etapa: Etapa, dtAbertura: string): HistEntry[] {
  const idx = ETAPAS.indexOf(etapa);
  const [dd, mm, yyyy] = dtAbertura.split('/').map(Number);
  const resps = ['Sistema','João Carvalho','Maria Santos','Carlos Mendes'];
  const times = ['09:00','10:30','14:15','16:40'];
  return ETAPAS.slice(0, idx + 1).map((e, i) => {
    const dt = new Date(yyyy, mm - 1, dd + i * 3);
    return {
      etapa: e,
      data: `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()} ${times[i]}`,
      resp: resps[i % 4],
    };
  });
}

function generateMockFP(): FP[] {
  const out: FP[] = [];
  let id = 1;
  let pendIdx = 0;

  DISTRIBUTION.forEach(({ uf, andamento, deferido, indeferido }) => {
    const muns = FP_UF_MUNS[uf] ?? [uf];
    const groups: [StatusFP, number][] = [['Pendente', andamento], ['Deferido', deferido], ['Indeferido', indeferido]];

    groups.forEach(([status, count]) => {
      for (let i = 0; i < count; i++) {
        const seed = id;
        const year  = 2024 + (seed % 2);
        const seq   = String(seed).padStart(6, '0');
        const dates = mkDate(seed);
        const nome  = mkName(seed);
        const etapa: Etapa = status === 'Pendente' ? pendEtapa(pendIdx++) : 'Etapa final';
        const municipio = muns[i % muns.length];

        out.push({
          id,
          protocolo: `${year}/${seq}-${seed % 10}`,
          processoId: `PROC-${year}-${seq}`,
          processoLink: `https://mdb.1doc.com.br/processo/PROC-${year}-${seq}`,
          nome,
          cpf: mkCPF(seed),
          dtNasc: dates.dtNasc,
          email: `${nome.split(' ')[0].toLowerCase()}${seed}@email.com`,
          celular: `(${String(11 + (seed % 88))}) 9${String(seed * 3).slice(-4)}-${String(seed * 7).slice(-4)}`,
          uf,
          municipio,
          domEleitoral: `${municipio} - ${uf}`,
          dtAbertura: dates.dtAbertura,
          dtAberturaDt: dates.dtAberturaDt,
          dtPreenchimento: dates.dtPreenchimento,
          tipoDiretorio: i % 3 === 0 ? 'Estadual' : 'Municipal',
          etapa,
          status,
          enviadoMunicipal: status !== 'Pendente' || etapa === 'Conferência',
          enviadoEstadual:  status !== 'Pendente',
          dtProcessoInterno: `${dates.dtAbertura} ${dates.dtPreenchimento.split(' ')[1]}`,
          historico: mkHist(etapa, dates.dtAbertura),
        });
        id++;
      }
    });
  });

  return out;
}

export const MOCK_FP = generateMockFP();
