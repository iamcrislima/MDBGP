import React, { useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import type { NavigateFn } from '../types';
import BrazilMap from '../components/BrazilMap';
import { BI_COBERTURA_UF, BI_ORGAOS_POR_ESTADO } from '../data/mockData';
import KPICard from '../components/shared/KPICard';
import CustomSelect from '../components/shared/CustomSelect';

type Tab = 'partido' | 'filiados' | 'eleicao' | 'mandatarios';

const TAB_LABELS: Record<Tab, string> = {
  partido:    'Gestão do Partido MDB',
  filiados:   'Gestão de Filiados',
  eleicao:    'Eleição',
  mandatarios:'Mandatários',
};

// ── Colors MDB ─────────────────────────────────────────────────────────────────
const MDB_BLUE   = '#003399';
const MDB_GREEN  = '#00963F';
const MDB_YELLOW = '#f5d000';
const MDB_BLUE2  = '#336dcc';
const MDB_BLUE3  = '#6699dd';
const TAB_GREEN  = '#00963F';

// ── Shared chart options ───────────────────────────────────────────────────────
const baseOpts = (legend = false): object => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: legend, labels: { font: { family: 'Open Sans', size: 11 }, padding: 12 } },
    tooltip: { titleFont: { family: 'Open Sans' }, bodyFont: { family: 'Open Sans' } },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { family: 'Open Sans', size: 11 } } },
    y: { grid: { color: '#f3f4f6' }, ticks: { font: { family: 'Open Sans', size: 11 } } },
  },
});

const horizOpts = (): object => ({
  indexAxis: 'y' as const,
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { titleFont: { family: 'Open Sans' }, bodyFont: { family: 'Open Sans' } } },
  scales: {
    x: { grid: { color: '#f3f4f6' }, ticks: { font: { family: 'Open Sans', size: 11 } } },
    y: { grid: { display: false }, ticks: { font: { family: 'Open Sans', size: 11 } } },
  },
});

const donutOpts = (pos: 'bottom' | 'right' = 'bottom'): object => ({
  responsive: true, maintainAspectRatio: false, cutout: '65%',
  plugins: { legend: { position: pos, labels: { font: { family: 'Open Sans', size: 11 }, padding: 10 } } },
});

function ChartCard({ title, subtitle, children, height = 240 }: { title: string; subtitle?: string; children: React.ReactNode; height?: number }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '18px 20px' }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: subtitle ? 2 : 14 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>{subtitle}</div>}
      <div style={{ height }}>{children}</div>
    </div>
  );
}

function StatusTag({ s }: { s: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    Ótimo:   { bg: '#dcfce7', color: '#15803d' },
    Bom:     { bg: '#E8F5E9', color: '#007A32' },
    Regular: { bg: '#fef9c3', color: '#92400e' },
  };
  const c = colors[s] || { bg: '#f3f4f6', color: '#374151' };
  return <span style={{ ...c, borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>{s}</span>;
}

// ── STATE DETAIL DATA ──────────────────────────────────────────────────────────
const STATE_DETAILS: Record<string, { orgaos: number; dirigentes: number; filiados: number; ibge: number; municipios: number }> = {
  SP: { orgaos: 310, dirigentes: 4820, filiados: 620000, ibge: 645, municipios: 645 },
  MG: { orgaos: 248, dirigentes: 3940, filiados: 485000, ibge: 853, municipios: 853 },
  RS: { orgaos: 228, dirigentes: 3620, filiados: 420000, ibge: 497, municipios: 497 },
  PR: { orgaos: 198, dirigentes: 3140, filiados: 380000, ibge: 399, municipios: 399 },
  GO: { orgaos: 165, dirigentes: 2620, filiados: 290000, ibge: 246, municipios: 246 },
  SC: { orgaos: 155, dirigentes: 2450, filiados: 268000, ibge: 295, municipios: 295 },
  BA: { orgaos: 140, dirigentes: 2210, filiados: 248000, ibge: 417, municipios: 417 },
  PA: { orgaos: 115, dirigentes: 1820, filiados: 198000, ibge: 144, municipios: 144 },
  MT: { orgaos: 108, dirigentes: 1710, filiados: 182000, ibge: 141, municipios: 141 },
  MA: { orgaos: 98,  dirigentes: 1540, filiados: 166000, ibge: 217, municipios: 217 },
};

// ── UF full names ─────────────────────────────────────────────────────────────
const UF_TO_NAME: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

// ── Tab 1: Gestão do Partido ──────────────────────────────────────────────────
function TabPartido() {
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [ufFilter, setUfFilter]     = useState('');

  const mapData = Object.entries(BI_ORGAOS_POR_ESTADO).map(([uf, value]) => {
    const cov = BI_COBERTURA_UF.find(c => c.uf === uf);
    return { uf, value, ibge: cov?.total };
  });
  const top12   = [...BI_COBERTURA_UF].sort((a, b) => (BI_ORGAOS_POR_ESTADO[b.uf] || 0) - (BI_ORGAOS_POR_ESTADO[a.uf] || 0)).slice(0, 5);

  const filteredCoverage = ufFilter
    ? BI_COBERTURA_UF.filter(r => r.uf === ufFilter)
    : BI_COBERTURA_UF;

  const barChartData = {
    labels: top12.map(d => d.uf),
    datasets: [{ label: 'Órgãos', data: top12.map(d => BI_ORGAOS_POR_ESTADO[d.uf] || 0), backgroundColor: MDB_GREEN, hoverBackgroundColor: '#007A32', borderRadius: 4 }],
  };

  const donutTipo = {
    labels: ['Definitivo', 'Provisório', 'Interventora'],
    datasets: [{ data: [1787, 884, 1], backgroundColor: [MDB_GREEN, MDB_YELLOW, '#A8D5B5'], borderWidth: 0 }],
  };

  const donutUsuarios = {
    labels: ['Administradores', 'Operadores', 'Consultores', 'Visualizadores'],
    datasets: [{ data: [120, 340, 280, 110], backgroundColor: [MDB_GREEN, '#4CAF50', MDB_YELLOW, '#A8D5B5'], borderWidth: 0 }],
  };

  const cargosDir = {
    labels: ['Presidente', 'Vice-Presidente', 'Secretário', 'Tesoureiro', 'Vogal', 'Suplente'],
    datasets: [{ label: 'Dirigentes', data: [2672, 2670, 5120, 2672, 14320, 14040], backgroundColor: MDB_GREEN, hoverBackgroundColor: '#007A32', borderRadius: 4 }],
  };

  const lineData = {
    labels: ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
    datasets: [
      { label: 'Filiados', data: [3100000, 3250000, 3400000, 3380000, 3520000, 3600000, 3680000], borderColor: MDB_GREEN, backgroundColor: 'rgba(0,150,63,0.10)', fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: MDB_GREEN },
      { label: 'Desfiliados', data: [420000, 380000, 340000, 320000, 290000, 250000, 240000], borderColor: MDB_YELLOW, backgroundColor: 'rgba(255,208,0,0.07)', fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: MDB_YELLOW, borderDash: [5, 5] },
    ],
  };

  const stateDetail = selectedUF ? (STATE_DETAILS[selectedUF] ?? null) : null;

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <KPICard title="Total Órgãos" subtitle="Todos os estados" value="2.672" icon="bi-bank2" borderColor={MDB_BLUE} tooltip="Total de órgãos ativos" />
        <KPICard title="Dirigentes Ativos" subtitle="Com cargo ativo" value="41.694" icon="bi-person-badge-fill" borderColor="#8b5cf6" tooltip="Dirigentes com mandato ativo" />
        <KPICard title="Representatividade" subtitle="Estados com cobertura" value="48,1%" icon="bi-graph-up" borderColor={MDB_GREEN} tooltip="Percentual de municípios cobertos" />
        <KPICard title="Usuários do Sistema" subtitle="Perfis ativos" value="850" icon="bi-people-fill" borderColor={MDB_YELLOW} tooltip="Usuários com acesso ao sistema" />
      </div>

      {/* Map — full width */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {/* Map column */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Órgãos por Estado</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Clique em um estado para ver detalhes</div>
              </div>
              {selectedUF && !stateDetail && (
                <button onClick={() => { setSelectedUF(null); setUfFilter(''); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 20, background: '#fff', fontSize: 12, cursor: 'pointer', color: '#374151', fontFamily: 'Open Sans, sans-serif' }}>
                  <span style={{ background: MDB_BLUE, color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>UF</span>
                  {selectedUF} ×
                </button>
              )}
            </div>
            <BrazilMap
              data={mapData}
              height={400}
              selectedUF={selectedUF ?? undefined}
              onStateClick={uf => { setSelectedUF(p => p === uf ? null : uf); setUfFilter(p => p === uf ? '' : uf); }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['#E8F5E9', '< 150'], ['#A8D5B5', '150–299'], ['#4CAF50', '300–499'], ['#00963F', '500+']].map(([c, l]) => (
                <div key={String(l)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
                  <span style={{ width: 12, height: 12, background: String(c), borderRadius: 2, display: 'inline-block', border: '1px solid rgba(0,0,0,0.08)' }} />
                  {String(l)}
                </div>
              ))}
            </div>
          </div>

          {/* State detail panel */}
          {stateDetail && selectedUF && (
            <div style={{ width: 300, flexShrink: 0, marginLeft: 28, borderLeft: '1px solid #e5e7eb', paddingLeft: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', lineHeight: 1.2 }}>
                    {UF_TO_NAME[selectedUF] ?? selectedUF}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>({selectedUF}) — Resumo do estado</div>
                </div>
                <button
                  onClick={() => { setSelectedUF(null); setUfFilter(''); }}
                  style={{ width: 26, height: 26, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#6b7280', flexShrink: 0, marginLeft: 8 }}
                >
                  ×
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                {[
                  { label: 'Total Órgãos', value: stateDetail.orgaos.toLocaleString('pt-BR') },
                  { label: 'Dirigentes', value: stateDetail.dirigentes.toLocaleString('pt-BR') },
                  { label: 'Total IBGE', value: stateDetail.ibge.toLocaleString('pt-BR') },
                  { label: 'Filiados', value: stateDetail.filiados.toLocaleString('pt-BR') },
                ].map(m => (
                  <div key={m.label} style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 5 }}>{m.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 20, color: '#111827' }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#92400e', marginBottom: 5 }}>Média Fil./Município</div>
                <div style={{ fontWeight: 700, fontSize: 20, color: '#78350f' }}>
                  {Math.round(stateDetail.filiados / stateDetail.municipios).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bar + Tipo de Órgão + Usuários */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap: 20, marginBottom: 20 }}>
        <ChartCard title="Top 5 por Órgãos" subtitle="Estados com maior número de órgãos">
          <Bar data={barChartData} options={baseOpts() as object} />
        </ChartCard>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 2 }}>Tipo de Órgão</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>Composição por tipo</div>
          <div style={{ height: 150 }}>
            <Doughnut data={donutTipo} options={{ ...donutOpts(), plugins: { legend: { display: false } } } as object} />
          </div>
          <div style={{ marginTop: 10 }}>
            {[['Definitivo', 1787, MDB_GREEN], ['Provisório', 884, MDB_YELLOW], ['Interventora', 1, '#A8D5B5']].map(([l, v, c]) => (
              <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: String(c), display: 'inline-block' }} />
                  <span style={{ color: '#374151' }}>{String(l)}</span>
                </div>
                <span style={{ fontWeight: 700, color: '#111827' }}>{Number(v).toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>
        <ChartCard title="Usuários do Sistema" subtitle="Perfis de acesso">
          <Doughnut data={donutUsuarios} options={donutOpts() as object} />
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <ChartCard title="Distribuição por Cargo de Dirigente" subtitle="Top cargos em órgãos partidários" height={220}>
          <Bar data={cargosDir} options={horizOpts() as object} />
        </ChartCard>
        <ChartCard title="Evolução de Filiados" subtitle="Histórico anual de filiação e desfiliação" height={220}>
          <Line data={lineData} options={{ ...(baseOpts(true) as object) } as object} />
        </ChartCard>
      </div>

      {/* Coverage table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Cobertura por UF — Presidentes de Órgão</div>
          {ufFilter && (
            <button onClick={() => { setUfFilter(''); setSelectedUF(null); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 20, background: '#fff', fontSize: 12, cursor: 'pointer', color: '#374151', fontFamily: 'Open Sans, sans-serif' }}>
              UF: {ufFilter} ×
            </button>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['UF', 'Com Presidente', 'Total Órgãos', '% Cobertura', 'Status', 'Filiados'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '2px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCoverage.map((row, i) => (
                <tr key={row.uf} style={{ background: i % 2 === 1 ? '#fafafa' : '#fff', cursor: 'pointer' }}
                  onClick={() => { setUfFilter(p => p === row.uf ? '' : row.uf); setSelectedUF(p => p === row.uf ? null : row.uf); }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f4fb')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? '#fafafa' : '#fff')}>
                  <td style={{ padding: '9px 12px', fontWeight: 700, color: MDB_BLUE }}>{row.uf}</td>
                  <td style={{ padding: '9px 12px', color: '#374151' }}>{row.comPresidente}</td>
                  <td style={{ padding: '9px 12px', color: '#374151' }}>{row.total}</td>
                  <td style={{ padding: '9px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3 }}>
                        <div style={{ width: `${row.cobertura}%`, height: 6, background: row.cobertura >= 90 ? MDB_GREEN : row.cobertura >= 60 ? MDB_BLUE : '#f59e0b', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontWeight: 600, minWidth: 38, textAlign: 'right' }}>{row.cobertura.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '9px 12px' }}><StatusTag s={row.status} /></td>
                  <td style={{ padding: '9px 12px', color: '#374151' }}>{row.filiados.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Filiados ───────────────────────────────────────────────────────────
function TabFiliados() {
  const barByUF = {
    labels: BI_COBERTURA_UF.slice(0, 10).map(d => d.uf),
    datasets: [{ label: 'Filiados', data: BI_COBERTURA_UF.slice(0, 10).map(d => d.filiados), backgroundColor: MDB_GREEN, hoverBackgroundColor: '#007A32', borderRadius: 4 }],
  };
  const situacaoData = {
    labels: ['Regular', 'Excluído', 'Transferido', 'Suspenso'],
    datasets: [{ data: [3280450, 142330, 167350, 89870], backgroundColor: [MDB_GREEN, MDB_YELLOW, '#A8D5B5', '#E8F5E9'], borderWidth: 0 }],
  };
  const canalData = {
    labels: ['Online', 'Dataware', 'Cartório', 'Presencial'],
    datasets: [{ data: [1240000, 1680000, 580000, 180000], backgroundColor: [MDB_GREEN, MDB_YELLOW, '#A8D5B5', '#E8F5E9'], borderWidth: 0 }],
  };
  const generoData = {
    labels: ['Masculino', 'Feminino'],
    datasets: [{ data: [2050000, 1630000], backgroundColor: [MDB_GREEN, MDB_YELLOW], borderWidth: 0 }],
  };
  const dispositivoData = {
    labels: ['Android', 'Windows', 'iOS', 'Outros'],
    datasets: [{ data: [820000, 640000, 380000, 200000], backgroundColor: [MDB_GREEN, MDB_YELLOW, '#A8D5B5', '#E8F5E9'], borderWidth: 0 }],
  };

  // Pirâmide etária
  const faixas = ['18–24', '25–34', '35–44', '45–54', '55–64', '65–74', '75+'];
  const masc   = [142000, 368000, 421000, 380000, 290000, 220000, 110000];
  const fem    = [128000, 342000, 398000, 361000, 268000, 198000, 98000];
  const piramideData = {
    labels: faixas,
    datasets: [
      { label: 'Masculino', data: masc.map(v => -v), backgroundColor: MDB_GREEN, hoverBackgroundColor: '#007A32', borderRadius: 3 },
      { label: 'Feminino', data: fem, backgroundColor: MDB_YELLOW, hoverBackgroundColor: '#E6B800', borderRadius: 3 },
    ],
  };
  const piramideOpts: object = {
    indexAxis: 'y' as const, responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' as const, labels: { font: { family: 'Open Sans', size: 11 } } }, tooltip: { callbacks: { label: (ctx: { parsed: { x: number }; dataset: { label: string } }) => `${ctx.dataset.label}: ${Math.abs(ctx.parsed.x).toLocaleString('pt-BR')}` } } },
    scales: {
      x: { grid: { color: '#f3f4f6' }, ticks: { font: { family: 'Open Sans', size: 10 }, callback: (v: number) => Math.abs(v).toLocaleString('pt-BR') } },
      y: { grid: { display: false }, ticks: { font: { family: 'Open Sans', size: 11 } } },
    },
  };

  // Evolução histórica
  const evolucaoData = {
    labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
    datasets: [
      { label: 'Base acumulada', data: [2800000, 2920000, 3050000, 3100000, 3250000, 3400000, 3380000, 3420000, 3520000, 3600000, 3680000], borderColor: MDB_GREEN, backgroundColor: 'rgba(232,245,233,0.4)', fill: true, tension: 0.4, yAxisID: 'y', pointRadius: 3, pointBackgroundColor: MDB_GREEN },
      { label: 'Novas filiações', data: [180000, 220000, 198000, 165000, 210000, 238000, 195000, 152000, 232000, 180000, 148000], borderColor: MDB_YELLOW, backgroundColor: 'rgba(255,208,0,0.07)', fill: false, tension: 0.4, yAxisID: 'y1', pointRadius: 3, borderDash: [5, 5], pointBackgroundColor: MDB_YELLOW },
    ],
  };
  const evolucaoOpts: object = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' as const, labels: { font: { family: 'Open Sans', size: 11 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Open Sans', size: 11 } } },
      y: { grid: { color: '#f3f4f6' }, ticks: { font: { family: 'Open Sans', size: 10 } }, position: 'left' as const },
      y1: { grid: { display: false }, ticks: { font: { family: 'Open Sans', size: 10 } }, position: 'right' as const },
    },
  };

  // Funil
  const funilData = {
    labels: ['Documentação Enviada', 'Em Análise', 'Regular'],
    datasets: [{ data: [198000, 142000, 84320], backgroundColor: ['#A8D5B5', MDB_YELLOW, MDB_GREEN], borderRadius: 4, barPercentage: 0.55 }],
  };

  // Pré-candidatos table
  const preCandidatos = [
    { cargo: 'Vereador(a)', ano: 2026, total: 14820, estados: 27, alcance: 78 },
    { cargo: 'Prefeito(a)', ano: 2026, total: 1248, estados: 26, alcance: 42 },
    { cargo: 'Vice-Prefeito(a)', ano: 2026, total: 1236, estados: 26, alcance: 42 },
    { cargo: 'Deputado Estadual', ano: 2026, total: 840, estados: 27, alcance: 35 },
    { cargo: 'Deputado Federal', ano: 2026, total: 512, estados: 27, alcance: 22 },
    { cargo: 'Senador(a)', ano: 2026, total: 54, estados: 27, alcance: 100 },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <KPICard title="Filiados Regulares" subtitle="Situação regular" value="229.618" icon="bi-diagram-3-fill" borderColor={MDB_GREEN} />
        <KPICard title="Filiações Online" subtitle="Participação do canal online" value="100,0%" icon="bi-globe" borderColor="#8b5cf6" />
        <KPICard title="Pré-candidatos" subtitle="Declarações registradas" value="2" icon="bi-person-badge" borderColor={MDB_YELLOW} />
        <KPICard title="Média de Idade" subtitle="Filiados regulares" value="58" icon="bi-clock-history" borderColor={MDB_GREEN} />
      </div>

      {/* Row 1: bar UF + status + canal + gênero donuts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px 220px 220px', gap: 16, marginBottom: 16 }}>
        <ChartCard title="Top 10 UF por Filiados" height={260}>
          <Bar data={barByUF} options={baseOpts() as object} />
        </ChartCard>
        <ChartCard title="Status de Filiação" height={200}>
          <Doughnut data={situacaoData} options={donutOpts() as object} />
        </ChartCard>
        <ChartCard title="Canal de Filiação" height={200}>
          <Doughnut data={canalData} options={donutOpts() as object} />
        </ChartCard>
        <ChartCard title="Distribuição por Gênero" height={200}>
          <Doughnut data={generoData} options={donutOpts() as object} />
        </ChartCard>
      </div>

      {/* Row 2: pirâmide etária + evolução */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <ChartCard title="Pirâmide Etária" subtitle="Filiados por faixa etária e sexo" height={260}>
          <Bar data={piramideData} options={piramideOpts as object} />
        </ChartCard>
        <ChartCard title="Evolução Histórica de Filiações" subtitle="Base acumulada + novas filiações por ano" height={260}>
          <Line data={evolucaoData} options={evolucaoOpts as object} />
        </ChartCard>
      </div>

      {/* Row 3: funil + dispositivo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, marginBottom: 16 }}>
        <ChartCard title="Funil de Aprovação" subtitle="Documentação → Análise → Regular" height={200}>
          <Bar data={funilData} options={horizOpts() as object} />
        </ChartCard>
        <ChartCard title="Canal por Dispositivo" height={200}>
          <Doughnut data={dispositivoData} options={donutOpts('right') as object} />
        </ChartCard>
      </div>

      {/* Pré-candidatos table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 16 }}>Pré-candidatos por Cargo — 2026</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>{['Cargo', 'Ano', 'Pré-candidatos', 'Estados', 'Alcance (%)'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '2px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {preCandidatos.map((r, i) => (
              <tr key={r.cargo} style={{ background: i % 2 === 1 ? '#fafafa' : '#fff' }} onMouseEnter={e => (e.currentTarget.style.background = '#f0f4fb')} onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? '#fafafa' : '#fff')}>
                <td style={{ padding: '9px 12px', fontWeight: 600, color: '#374151' }}>{r.cargo}</td>
                <td style={{ padding: '9px 12px', color: '#6b7280' }}>{r.ano}</td>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: MDB_GREEN }}>{r.total.toLocaleString('pt-BR')}</td>
                <td style={{ padding: '9px 12px', color: '#374151' }}>{r.estados}</td>
                <td style={{ padding: '9px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3 }}>
                      <div style={{ width: `${r.alcance}%`, height: 6, background: MDB_GREEN, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontWeight: 600, minWidth: 34, textAlign: 'right', fontSize: 12 }}>{r.alcance}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Eleição ────────────────────────────────────────────────────────────
const UF_OPTS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(v => ({ value: v, label: v }));
const PARTIDO_OPTS = ['PSDB','PT','PP','PL','PSD','MDB','Republicanos','Podemos','Solidariedade','Avante'].map(v => ({ value: v, label: v }));

function TabEleicao() {
  const [uf, setUf]         = useState('');
  const [municipio, setMun] = useState('');
  const [partido, setPartido] = useState('');

  const cargoData = {
    labels: ['Vereador', 'Prefeito', 'Vice-Prefeito', 'Dep. Est.', 'Dep. Fed.', 'Senador'],
    datasets: [
      { label: 'Eleitos', data: [9241, 394, 394, 52, 18, 0], backgroundColor: MDB_GREEN, borderRadius: 4 },
      { label: 'Não Eleitos', data: [16820, 1218, 312, 420, 128, 0], backgroundColor: '#E8F5E9', borderRadius: 4 },
    ],
  };
  const stackOpts: object = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const, labels: { font: { family: 'Open Sans', size: 11 } } } },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11, family: 'Open Sans' } } },
      y: { stacked: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 11, family: 'Open Sans' } } },
    },
  };

  const mkHorizCargo = (label: string, data: number[]) => ({
    labels: ['MDB', 'PL', 'PP', 'PSD', 'Republicanos', 'Podemos', 'PT', 'PSDB', 'Solidariedade', 'Avante'],
    datasets: [{ label, data, backgroundColor: (data as number[]).map((_, i) => i === 0 ? MDB_GREEN : '#A8D5B5'), hoverBackgroundColor: (data as number[]).map((_, i) => i === 0 ? '#007A32' : '#8BC4A0'), borderRadius: 4 }],
  });

  return (
    <div>
      {/* Filtros */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Filtros do Relatório</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5 }}>UF</label><CustomSelect value={uf} onChange={setUf} options={UF_OPTS} placeholder="Todas as UFs" /></div>
          <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Município</label><CustomSelect value={municipio} onChange={setMun} options={[]} placeholder={uf ? 'Selecione' : 'Selecione UF primeiro'} disabled={!uf} /></div>
          <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Partido</label><CustomSelect value={partido} onChange={setPartido} options={PARTIDO_OPTS} placeholder="Todos" /></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <KPICard title="Total de Mandatários" subtitle="Eleitos em 2024" value="5.899" icon="bi-award-fill" borderColor={MDB_GREEN} />
        <KPICard title="Prefeito(a)" subtitle="Mandatos no executivo" value="498" icon="bi-building-fill" borderColor="#4CAF50" />
        <KPICard title="Vice-Prefeito(a)" subtitle="Mandatos de vice" value="498" icon="bi-person-badge" borderColor={MDB_YELLOW} />
        <KPICard title="Vereador(a)" subtitle="Mandatos legislativos" value="4.903" icon="bi-people-fill" borderColor="#8b5cf6" />
      </div>

      <ChartCard title="Resultado por Cargo — Eleição 2024" height={280}>
        <Bar data={cargoData} options={stackOpts as object} />
      </ChartCard>

      {/* 3 gráficos lado a lado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
        <ChartCard title="Prefeito(a) por Partido" subtitle="Top 10 — 2024" height={260}>
          <Bar data={mkHorizCargo('Prefeitos', [394, 310, 285, 268, 242, 198, 186, 164, 142, 128])} options={horizOpts() as object} />
        </ChartCard>
        <ChartCard title="Vice-Prefeito(a) por Partido" subtitle="Top 10 — 2024" height={260}>
          <Bar data={mkHorizCargo('Vice-Prefeitos', [394, 308, 282, 264, 240, 196, 182, 162, 140, 124])} options={horizOpts() as object} />
        </ChartCard>
        <ChartCard title="Vereador(a) por Partido" subtitle="Top 10 — 2024" height={260}>
          <Bar data={mkHorizCargo('Vereadores', [9241, 7820, 7240, 6820, 6140, 5680, 5420, 4980, 4620, 4280])} options={horizOpts() as object} />
        </ChartCard>
      </div>
    </div>
  );
}

// ── Tab 4: Mandatários ────────────────────────────────────────────────────────
const ANO_OPTS      = ['2012', '2016', '2020', '2024'].map(v => ({ value: v, label: v }));
const TURNO_OPTS    = ['1º Turno', '2º Turno'].map(v => ({ value: v, label: v }));
const CARGO_OPTS    = ['Prefeito', 'Vice-Prefeito', 'Vereador', 'Governador', 'Dep. Estadual', 'Dep. Federal', 'Senador'].map(v => ({ value: v, label: v }));
const MUNICIPIO_OPTS = ['Porto Alegre', 'Florianópolis', 'Curitiba', 'São Paulo', 'Belo Horizonte', 'Goiânia', 'Salvador', 'Recife', 'Fortaleza', 'Belém'].map(v => ({ value: v, label: v }));
const GENERO_OPTS   = ['Masculino', 'Feminino'].map(v => ({ value: v, label: v }));
const ELEITO_OPTS   = ['Sim', 'Não'].map(v => ({ value: v, label: v }));

function TabMandatarios() {
  const [fAno, setFAno]           = useState('');
  const [fTurno, setFTurno]       = useState('');
  const [fCargo, setFCargo]       = useState('');
  const [fUF, setFUF]             = useState('RS');
  const [fMunicipio, setFMunicipio] = useState('');
  const [fGenero, setFGenero]     = useState('');
  const [fPartido, setFPartido]   = useState('');
  const [fEleito, setFEleito]     = useState('');
  const [fNome, setFNome]         = useState('');

  const ufData = {
    labels: ['RS', 'MG', 'SP', 'SC', 'GO', 'PB', 'PR', 'TO', 'BA', 'PI'],
    datasets: [{ label: 'Mandatários', data: [1420, 1180, 980, 840, 720, 580, 560, 440, 390, 360], backgroundColor: MDB_GREEN, hoverBackgroundColor: '#007A32', borderRadius: 4 }],
  };
  const sitData = {
    labels: ['Eleito Por Qp', 'Eleito', 'Eleito Por Média', 'Não Eleito'],
    datasets: [{ data: [7420, 1850, 815, 0], backgroundColor: [MDB_GREEN, '#4CAF50', MDB_YELLOW, '#E8F5E9'], borderWidth: 0 }],
  };
  const generoData = {
    labels: ['Masculino', 'Feminino'],
    datasets: [{ data: [7842, 2243], backgroundColor: [MDB_GREEN, MDB_YELLOW], borderWidth: 0 }],
  };
  const cargosData = {
    labels: ['Vereador', 'Prefeito', 'Vice-Prefeito', 'Dep. Est.', 'Dep. Fed.', 'Senador'],
    datasets: [{ label: 'Candidaturas', data: [9241, 394, 394, 52, 18, 0], backgroundColor: MDB_GREEN, hoverBackgroundColor: '#007A32', borderRadius: 4 }],
  };
  const historico = {
    labels: ['2018', '2020', '2022', '2024'],
    datasets: [
      { label: 'Candidaturas', data: [18420, 26840, 14820, 28060], borderColor: MDB_GREEN, backgroundColor: 'rgba(232,245,233,0.4)', fill: true, tension: 0.4, yAxisID: 'y', pointRadius: 4, pointBackgroundColor: MDB_GREEN },
      { label: 'Total Votos (mi)', data: [12.8, 18.4, 10.2, 19.6], borderColor: MDB_YELLOW, backgroundColor: 'rgba(255,208,0,0.07)', fill: false, tension: 0.4, yAxisID: 'y1', pointRadius: 4, borderDash: [5, 5], pointBackgroundColor: MDB_YELLOW },
    ],
  };
  const historOpts: object = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' as const, labels: { font: { family: 'Open Sans', size: 11 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Open Sans', size: 12 } } },
      y: { grid: { color: '#f3f4f6' }, ticks: { font: { family: 'Open Sans', size: 10 } }, position: 'left' as const },
      y1: { grid: { display: false }, ticks: { font: { family: 'Open Sans', size: 10 } }, position: 'right' as const },
    },
  };

  const top15cands = [
    { nome: 'José Carlos Silva', votos: 48420, uf: 'SP' },
    { nome: 'Maria Aparecida Santos', votos: 42180, uf: 'MG' },
    { nome: 'Carlos Eduardo Lima', votos: 38640, uf: 'RS' },
    { nome: 'Ana Paula Ferreira', votos: 34820, uf: 'PR' },
    { nome: 'Roberto Oliveira Costa', votos: 32140, uf: 'GO' },
    { nome: 'Francisco das Neves', votos: 29680, uf: 'BA' },
    { nome: 'Luciana Barbosa', votos: 27420, uf: 'SC' },
    { nome: 'Antônio Gonçalves', votos: 25840, uf: 'PA' },
    { nome: 'Cristiane Rodrigues', votos: 24180, uf: 'CE' },
    { nome: 'Paulo Henrique Ramos', votos: 22640, uf: 'MT' },
    { nome: 'Silvana Mendes', votos: 21820, uf: 'PB' },
    { nome: 'Marcos Almeida', votos: 20140, uf: 'MA' },
    { nome: 'Vera Lúcia Campos', votos: 18960, uf: 'PI' },
    { nome: 'Jonas Pereira', votos: 17840, uf: 'RN' },
    { nome: 'Eliane Carvalho', votos: 16420, uf: 'AL' },
  ];

  const top15candData = {
    labels: top15cands.map(c => c.nome.split(' ').slice(0, 2).join(' ')),
    datasets: [{ label: 'Votos', data: top15cands.map(c => c.votos), backgroundColor: MDB_GREEN, hoverBackgroundColor: '#007A32', borderRadius: 4 }],
  };

  const top15munData = {
    labels: ['São Paulo/SP', 'Belo Horizonte/MG', 'Porto Alegre/RS', 'Curitiba/PR', 'Goiânia/GO', 'Salvador/BA', 'Florianópolis/SC', 'Belém/PA', 'Fortaleza/CE', 'Cuiabá/MT', 'João Pessoa/PB', 'São Luís/MA', 'Teresina/PI', 'Natal/RN', 'Maceió/AL'],
    datasets: [{ label: 'Votos', data: [248420, 198140, 182640, 168420, 148620, 138240, 124820, 118640, 112480, 98640, 92180, 88420, 82640, 76840, 72180], backgroundColor: MDB_YELLOW, hoverBackgroundColor: '#E6B800', borderRadius: 4 }],
  };

  // Tabela paginada
  const detalheRows = Array.from({ length: 20 }, (_, i) => ({
    nome: top15cands[i % 15].nome,
    ano: 2024, turno: 1, cargo: i % 3 === 0 ? 'Prefeito' : 'Vereador',
    genero: i % 3 === 0 ? 'Feminino' : 'Masculino',
    uf: top15cands[i % 15].uf,
    munFiliacao: top15cands[i % 15].nome.split(' ')[1],
    munVotacao: top15cands[i % 15].nome.split(' ')[1],
    munCandidatura: top15cands[i % 15].nome.split(' ')[1],
    partido: 'MDB',
    votos: top15cands[i % 15].votos - i * 1200,
  }));

  return (
    <div>
      {/* Filtros */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Filtros do Relatório</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Ano</label><CustomSelect value={fAno} onChange={setFAno} options={ANO_OPTS} placeholder="Todos" /></div>
          <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Turno</label><CustomSelect value={fTurno} onChange={setFTurno} options={TURNO_OPTS} placeholder="Todos" /></div>
          <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Cargo</label><CustomSelect value={fCargo} onChange={setFCargo} options={CARGO_OPTS} placeholder="Todos" /></div>
          <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5 }}>UF</label><CustomSelect value={fUF} onChange={setFUF} options={UF_OPTS} placeholder="Todas" /></div>
          <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Município</label><CustomSelect value={fMunicipio} onChange={setFMunicipio} options={MUNICIPIO_OPTS} placeholder="Todos" /></div>
          <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Gênero</label><CustomSelect value={fGenero} onChange={setFGenero} options={GENERO_OPTS} placeholder="Todos" /></div>
          <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Partido</label><CustomSelect value={fPartido} onChange={setFPartido} options={PARTIDO_OPTS} placeholder="Todos" /></div>
          <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Eleito</label><CustomSelect value={fEleito} onChange={setFEleito} options={ELEITO_OPTS} placeholder="Todos" /></div>
          <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Nome do candidato</label><input value={fNome} onChange={e => setFNome(e.target.value)} placeholder="Digite ao menos 2 letras" style={{ width: '100%', height: 36, padding: '0 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, fontFamily: 'Open Sans, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#374151' }} /></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <KPICard title="Candidaturas" subtitle="Candidaturas vinculadas" value="4.178" icon="bi-people-fill" borderColor={MDB_GREEN} />
        <KPICard title="Votos Históricos" subtitle="Votos totais acumulados" value="10.830.618" icon="bi-bar-chart-line-fill" borderColor={MDB_YELLOW} />
        <KPICard title="Média por Candidatura" subtitle="Média simples de votos" value="2.592" icon="bi-calculator" borderColor="#8b5cf6" />
        <KPICard title="Candidaturas Eleitas" subtitle="Vitórias no histórico" value="1.226" icon="bi-trophy-fill" borderColor={MDB_GREEN} />
      </div>

      {/* Row 1: UF + gênero + candidaturas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px 1fr', gap: 16, marginBottom: 16 }}>
        <ChartCard title="Top 10 UF por Mandatários" height={260}>
          <Bar data={ufData} options={baseOpts() as object} />
        </ChartCard>
        <ChartCard title="Distribuição por Gênero" height={260}>
          <Doughnut data={generoData} options={donutOpts() as object} />
        </ChartCard>
        <ChartCard title="Candidaturas por Cargo" height={260}>
          <Bar data={cargosData} options={baseOpts() as object} />
        </ChartCard>
      </div>

      {/* Row 2: histórico + situação */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, marginBottom: 16 }}>
        <ChartCard title="Histórico Eleitoral" subtitle="Candidaturas + votos (2018–2024)" height={240}>
          <Line data={historico} options={historOpts as object} />
        </ChartCard>
        <ChartCard title="Situação" height={240}>
          <Doughnut data={sitData} options={donutOpts() as object} />
        </ChartCard>
      </div>

      {/* Row 3: top 15 candidatos + municípios */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <ChartCard title="Top 15 Candidatos por Votos" subtitle="Candidatos com maior votação" height={320}>
          <Bar data={top15candData} options={horizOpts() as object} />
        </ChartCard>
        <ChartCard title="Top 15 Municípios por Votos" subtitle="Municípios com maior votação" height={320}>
          <Bar data={top15munData} options={horizOpts() as object} />
        </ChartCard>
      </div>

      {/* Tabela detalhe */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 16 }}>Detalhamento de Filiados Candidatos</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>{['Nome', 'Ano', 'Turno', 'Cargo', 'Gênero', 'UF', 'Partido', 'Votos'].map(h => <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6b7280', borderBottom: '2px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {detalheRows.slice(0, 10).map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 1 ? '#fafafa' : '#fff' }} onMouseEnter={e => (e.currentTarget.style.background = '#f0f4fb')} onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? '#fafafa' : '#fff')}>
                  <td style={{ padding: '8px 10px', fontWeight: 500 }}>{r.nome}</td>
                  <td style={{ padding: '8px 10px', color: '#6b7280' }}>{r.ano}</td>
                  <td style={{ padding: '8px 10px', color: '#6b7280' }}>{r.turno}º</td>
                  <td style={{ padding: '8px 10px', color: '#374151' }}>{r.cargo}</td>
                  <td style={{ padding: '8px 10px', color: '#374151' }}>{r.genero}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 700, color: MDB_BLUE }}>{r.uf}</td>
                  <td style={{ padding: '8px 10px', color: '#374151' }}>{r.partido}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>{r.votos.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── MDB Logo SVG ───────────────────────────────────────────────────────────────
function MdbLogoBi({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="12" fill="#1c7a2e" />
      <text x="40" y="33" textAnchor="middle" fontSize="26" fontWeight="800" fill="#f5d000" fontFamily="Open Sans, Arial, sans-serif" letterSpacing="-1">15</text>
      <text x="40" y="57" textAnchor="middle" fontSize="15" fontWeight="800" fill="#ffffff" fontFamily="Open Sans, Arial, sans-serif" letterSpacing="1.5">MDB</text>
    </svg>
  );
}

// ── Main BIPage ───────────────────────────────────────────────────────────────
export default function BIPage({ onNavigate: _onNavigate }: { onNavigate: NavigateFn }) {
  const [activeTab, setActiveTab] = useState<Tab>('partido');
  const tabs: Tab[] = ['partido', 'filiados', 'eleicao', 'mandatarios'];

  return (
    <div style={{ padding: '20px 28px 0' }}>
      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 0, marginBottom: 24 }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', border: 'none', background: 'none', fontSize: 13, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', fontWeight: activeTab === tab ? 700 : 400, color: activeTab === tab ? TAB_GREEN : '#6b7280', borderBottom: `3px solid ${activeTab === tab ? TAB_GREEN : 'transparent'}`, whiteSpace: 'nowrap', transition: 'color 0.15s', marginBottom: -1 }}>
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ paddingBottom: 28 }}>
        {activeTab === 'partido'     && <TabPartido />}
        {activeTab === 'filiados'    && <TabFiliados />}
        {activeTab === 'eleicao'     && <TabEleicao />}
        {activeTab === 'mandatarios' && <TabMandatarios />}
      </div>
    </div>
  );
}
