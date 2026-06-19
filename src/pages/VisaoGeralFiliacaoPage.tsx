import React, { useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import type { NavigateFn } from '../types';
import CustomSelect from '../components/shared/CustomSelect';
import type { SelectOption } from '../components/shared/CustomSelect';
import { useBreakpoint } from '../hooks/useBreakpoint';

// ── Constants ─────────────────────────────────────────────────────────────────
const LAST_SYNC = '18/06/2026 às 15:47:23';

const UF_OPTS: SelectOption[] = [
  { value: 'BA', label: 'Bahia (BA)' },
  { value: 'CE', label: 'Ceará (CE)' },
  { value: 'GO', label: 'Goiás (GO)' },
  { value: 'MA', label: 'Maranhão (MA)' },
  { value: 'MG', label: 'Minas Gerais (MG)' },
  { value: 'PE', label: 'Pernambuco (PE)' },
  { value: 'PR', label: 'Paraná (PR)' },
  { value: 'RJ', label: 'Rio de Janeiro (RJ)' },
  { value: 'RS', label: 'Rio Grande do Sul (RS)' },
  { value: 'SC', label: 'Santa Catarina (SC)' },
  { value: 'SP', label: 'São Paulo (SP)' },
];

const PERIOD_OPTS: SelectOption[] = [
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mês' },
  { value: '3meses', label: 'Últimos 3 meses' },
  { value: 'ano', label: 'Este ano' },
];

// ── Mock data ─────────────────────────────────────────────────────────────────
const KPIS = {
  total: 1729, andamento: 527, deferidos: 789, indeferidos: 413, tempoMedio: 9,
};

const FUNIL_STAGES = [
  { label: 'Publicidade', count: 203 },
  { label: 'Filiação',    count: 156 },
  { label: 'Conferência', count: 168 },
  // 203 + 156 + 168 = 527 = KPIS.andamento
];

const WEEKS_LABELS = ['23/03','30/03','06/04','13/04','20/04','27/04','04/05','11/05','18/05','25/05','01/06','08/06'];
// Snapshot semanal — Pendentes oscila (entrada vs saída), Deferidas/Indeferidas sobem. Termina nos KPIs.
const PEND_ACUM  = [432, 451, 441, 462, 453, 476, 468, 489, 481, 505, 516, 527];
const DEF_ACUM   = [647, 662, 675, 692, 709, 724, 738, 754, 765, 778, 784, 789];
const INDEF_ACUM = [338, 344, 355, 361, 372, 378, 387, 395, 400, 407, 410, 413];

// Valores escalados para que: Σandamento=527, Σdeferido=789, Σindeferido=413 (= KPIS totais)
const STATE_DATA = [
  { uf: 'SP', deferido: 131, andamento: 82, indeferido: 83 },
  { uf: 'RS', deferido: 106, andamento: 73, indeferido: 59 },
  { uf: 'MG', deferido: 100, andamento: 64, indeferido: 51 },
  { uf: 'SC', deferido:  90, andamento: 59, indeferido: 44 },
  { uf: 'BA', deferido:  81, andamento: 54, indeferido: 39 },
  { uf: 'PR', deferido:  71, andamento: 49, indeferido: 35 },
  { uf: 'RJ', deferido:  65, andamento: 44, indeferido: 31 },
  { uf: 'CE', deferido:  56, andamento: 39, indeferido: 28 },
  { uf: 'GO', deferido:  49, andamento: 34, indeferido: 24 },
  { uf: 'PE', deferido:  40, andamento: 29, indeferido: 19 },
].sort((a, b) => b.andamento - a.andamento);

interface OldestItem {
  id: number; protocolo: string; nome: string;
  uf: string; municipio: string; etapa: string;
  dtAbertura: string; diasAbertos: number;
}

const OLDEST_PENDING: OldestItem[] = [
  { id: 1,  protocolo: '2024/000042-7', nome: 'Ana Paula Ferreira Silva',       uf: 'SC', municipio: 'Florianópolis',        etapa: 'Conferência',  dtAbertura: '15/03/2024', diasAbertos: 826 },
  { id: 2,  protocolo: '2024/000127-9', nome: 'Maria José Oliveira Costa',      uf: 'RS', municipio: 'Porto Alegre',         etapa: 'Filiação',              dtAbertura: '05/04/2024', diasAbertos: 805 },
  { id: 3,  protocolo: '2024/000091-8', nome: 'José Augusto Ferreira Gomes',    uf: 'SC', municipio: 'Joinville',             etapa: 'Publicidade',           dtAbertura: '10/05/2024', diasAbertos: 770 },
  { id: 4,  protocolo: '2024/000108-2', nome: 'João Roberto Alves Pereira',     uf: 'MG', municipio: 'Belo Horizonte',       etapa: 'Publicidade',           dtAbertura: '12/04/2024', diasAbertos: 797 },
  { id: 5,  protocolo: '2024/000143-5', nome: 'Paulo Henrique Carvalho Dias',   uf: 'RJ', municipio: 'Rio de Janeiro',       etapa: 'Filiação',              dtAbertura: '23/05/2024', diasAbertos: 756 },
  { id: 6,  protocolo: '2024/000063-3', nome: 'Marcos Antonio Pinheiro Cruz',   uf: 'CE', municipio: 'Fortaleza',             etapa: 'Publicidade',           dtAbertura: '08/06/2024', diasAbertos: 740 },
  { id: 7,  protocolo: '2024/000199-7', nome: 'Roberto Carlos Mendonça',        uf: 'BA', municipio: 'Feira de Santana',     etapa: 'Conferência', dtAbertura: '22/06/2024', diasAbertos: 726 },
  { id: 8,  protocolo: '2024/000156-1', nome: 'Diego Henrique Teixeira Sousa',  uf: 'SP', municipio: 'Santos',                etapa: 'Publicidade',           dtAbertura: '06/07/2024', diasAbertos: 712 },
  { id: 9,  protocolo: '2024/000178-4', nome: 'Andreia Paula Coelho Gomes',     uf: 'GO', municipio: 'Aparecida de Goiânia', etapa: 'Publicidade',           dtAbertura: '27/07/2024', diasAbertos: 691 },
  { id: 10, protocolo: '2024/000214-3', nome: 'Sebastião Luiz Cardoso Melo',    uf: 'PE', municipio: 'Recife',                etapa: 'Filiação',              dtAbertura: '03/08/2024', diasAbertos: 684 },
].sort((a, b) => b.diasAbertos - a.diasAbertos);

// ── Helpers ───────────────────────────────────────────────────────────────────
function protocoloToUrl(protocolo: string): string {
  const [year, rest] = protocolo.split('/');
  const num = rest?.split('-')[0] ?? '';
  return `https://mdb.1doc.com.br/processo/PROC-${year}-${num}`;
}

const ETAPA_COLORS: Record<string, [string, string]> = {
  'Publicidade': ['#f0f9ff', '#0284c7'],
  'Filiação':    ['#fdf4ff', '#9333ea'],
  'Conferência': ['#fff7ed', '#c2410c'],
  'Etapa final': ['#f0fdf4', '#15803d'],
};

function EtapaBadge({ etapa }: { etapa: string }) {
  const [bg, color] = ETAPA_COLORS[etapa] ?? ['#f3f4f6', '#374151'];
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>
      {etapa}
    </span>
  );
}

function DiasBadge({ dias }: { dias: number }) {
  const [bg, color] = dias > 30 ? ['#fee2e2', '#dc2626'] : dias >= 15 ? ['#fef3c7', '#b45309'] : ['#dcfce7', '#15803d'];
  return (
    <span style={{ background: bg, color, fontWeight: 700, fontSize: 12, padding: '2px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>
      {dias} dias
    </span>
  );
}

// ── Chart base styles ─────────────────────────────────────────────────────────
const tickStyle = { font: { family: 'Open Sans', size: 10 as number }, color: '#6b7280' };
const gridStyle = { color: '#f3f4f6' };

// ── Page ─────────────────────────────────────────────────────────────────────
export default function VisaoGeralFiliacaoPage({ onNavigate }: { onNavigate: NavigateFn }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [ufFilter,    setUfFilter]    = useState('');
  const [period,      setPeriod]      = useState('3meses');
  const [filterOpen,  setFilterOpen]  = useState(false);

  const maxFunil = Math.max(...FUNIL_STAGES.map(s => s.count));

  // ── Line chart ──
  const lineData = {
    labels: WEEKS_LABELS,
    datasets: [
      {
        label: 'Deferidas',
        data: DEF_ACUM,
        borderColor: '#00963F',
        backgroundColor: 'rgba(0,150,63,0.08)',
        fill: true,
        tension: 0.5,
        pointRadius: 3,
        pointBackgroundColor: '#00963F',
        borderWidth: 2,
      },
      {
        label: 'Pendentes',
        data: PEND_ACUM,
        borderColor: '#b45309',
        backgroundColor: 'rgba(254,243,199,0.5)',
        fill: true,
        tension: 0.5,
        pointRadius: 3,
        pointBackgroundColor: '#b45309',
        borderWidth: 2,
      },
      {
        label: 'Indeferidas',
        data: INDEF_ACUM,
        borderColor: '#E53E3E',
        backgroundColor: 'rgba(229,62,62,0.07)',
        fill: true,
        tension: 0.5,
        pointRadius: 3,
        pointBackgroundColor: '#E53E3E',
        borderWidth: 2,
      },
    ],
  };

  const lineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: { font: { family: 'Open Sans', size: 11 }, usePointStyle: true, padding: 16, boxWidth: 12 },
      },
    },
    scales: {
      x: { grid: gridStyle, ticks: tickStyle },
      y: { beginAtZero: true, grid: gridStyle, ticks: tickStyle },
    },
  };

  // ── Stacked horizontal bar ──
  const stackedBarData = {
    labels: STATE_DATA.map(s => s.uf),
    datasets: [
      { label: 'Deferido',     data: STATE_DATA.map(s => s.deferido),  backgroundColor: '#00963F' },
      { label: 'Pendentes',    data: STATE_DATA.map(s => s.andamento), backgroundColor: '#FFD000' },
      { label: 'Indeferido',   data: STATE_DATA.map(s => s.indeferido),backgroundColor: '#E53E3E' },
    ],
  };

  const stackedBarOpts = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    // axis:'y' is required for correct hover matching on horizontal bar charts
    interaction: { mode: 'index' as const, intersect: false, axis: 'y' as const },
    onClick: (event: unknown, _elements: unknown, chart: { getElementsAtEventForMode: (e: MouseEvent, mode: string, opts: object, useFinalPosition: boolean) => { index: number; datasetIndex: number }[] }) => {
      const nativeEvent = (event as { native?: MouseEvent }).native;
      if (!nativeEvent) return;
      // use 'point' mode to get the exact segment clicked (not all datasets at row)
      const clicked = chart.getElementsAtEventForMode(nativeEvent, 'point', { intersect: true }, false);
      if (clicked.length === 0) return;
      const { index, datasetIndex } = clicked[0];
      const uf = STATE_DATA[index].uf;
      // dataset order: 0=Deferido, 1=Pendente, 2=Indeferido (matches stackedBarData)
      const statusMap = ['Deferido', 'Pendente', 'Indeferido'];
      const status = statusMap[datasetIndex] ?? '';
      sessionStorage.setItem('fp-filter', JSON.stringify({ uf, status }));
      onNavigate('gerenciar-filiados');
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: { font: { family: 'Open Sans', size: 11 }, usePointStyle: true, padding: 16, boxWidth: 12 },
      },
      tooltip: {},
    },
    scales: {
      x: { stacked: true, grid: gridStyle, ticks: tickStyle },
      y: { stacked: true, grid: { display: false }, ticks: { font: { family: 'Open Sans', size: 11 as number }, color: '#374151' } },
    },
  };

  // ── Donut ──
  const donutData = {
    labels: ['Pendentes', 'Deferido', 'Indeferido'],
    datasets: [{
      data: [KPIS.andamento, KPIS.deferidos, KPIS.indeferidos],
      backgroundColor: ['#FFD000', '#00963F', '#E53E3E'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const donutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; raw: number }) =>
            ` ${ctx.label}: ${ctx.raw.toLocaleString('pt-BR')} (${((ctx.raw / KPIS.total) * 100).toFixed(1)}%)`,
        },
      },
    },
  };

  // ── Shared card style ──
  const card: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  };

  const sectionHead = (title: string, sub: string, icon?: string) => (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      {icon && <i className={`bi ${icon}`} style={{ color: '#00963F', fontSize: 16, marginTop: 1, flexShrink: 0 }} />}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', background: '#f4f6f9', minHeight: '100%', fontFamily: 'Open Sans, sans-serif' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
            Visão Geral — Filiação Partidária
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7280' }}>
            Acompanhe o andamento das solicitações de filiação em tempo real
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9ca3af', flexShrink: 0, marginTop: 4 }}>
          <i className="bi bi-arrow-repeat" style={{ fontSize: 13 }} />
          <span>Última sincronização com 1doc:&nbsp;
            <strong style={{ color: '#6b7280' }}>{LAST_SYNC}</strong>
          </span>
        </div>
      </div>

      {/* ── Filter panel ── */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div
          onClick={() => setFilterOpen(v => !v)}
          style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-funnel" style={{ color: '#00963F', fontSize: 14 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Filtros</span>
            {(ufFilter || period !== '3meses') && (
              <span style={{ background: '#E8F5E9', color: '#00963F', fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 100 }}>
                Ativos
              </span>
            )}
          </div>
          <i className={`bi bi-chevron-${filterOpen ? 'up' : 'down'}`} style={{ color: '#9ca3af', fontSize: 12 }} />
        </div>
        {filterOpen && (
          <div style={{ padding: '0 20px 16px', borderTop: '1px solid #f3f4f6', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                UF / Diretório
              </label>
              <CustomSelect value={ufFilter} onChange={setUfFilter} options={UF_OPTS} placeholder="Todos os estados" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                Período
              </label>
              <CustomSelect value={period} onChange={setPeriod} options={PERIOD_OPTS} placeholder="Selecione o período" />
            </div>
          </div>
        )}
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>

        {/* Total */}
        <div style={{ ...card, padding: '18px 20px' }}>
          <div style={{ width: 42, height: 42, background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <i className="bi bi-file-earmark-text-fill" style={{ color: '#00963F', fontSize: 20 }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
            {KPIS.total.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Total de solicitações</div>
          <div style={{ fontSize: 12, color: '#00963F', marginTop: 4, fontWeight: 600 }}>▲ 47 novas esta semana</div>
        </div>

        {/* Em andamento */}
        <div style={{ ...card, padding: '18px 20px' }}>
          <div style={{ width: 42, height: 42, background: '#fef9e7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <i className="bi bi-hourglass-split" style={{ color: '#b45309', fontSize: 20 }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
            {KPIS.andamento.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Pendentes</div>
          <div style={{ fontSize: 12, color: '#b45309', marginTop: 4, fontWeight: 600 }}>▲ 23 novas hoje</div>
        </div>

        {/* Deferidos */}
        <div style={{ ...card, padding: '18px 20px' }}>
          <div style={{ width: 42, height: 42, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <i className="bi bi-check-circle-fill" style={{ color: '#15803d', fontSize: 20 }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
            {KPIS.deferidos.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Deferidos</div>
          <div style={{ fontSize: 12, color: '#15803d', marginTop: 4, fontWeight: 600 }}>
            {((KPIS.deferidos / KPIS.total) * 100).toFixed(1)}% do total
          </div>
        </div>

        {/* Indeferidos */}
        <div style={{ ...card, padding: '18px 20px' }}>
          <div style={{ width: 42, height: 42, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <i className="bi bi-x-circle-fill" style={{ color: '#dc2626', fontSize: 20 }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
            {KPIS.indeferidos.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Indeferidos</div>
          <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>▼ 8% vs. mês anterior</div>
        </div>

        {/* Tempo médio */}
        <div style={{ ...card, padding: '18px 20px' }}>
          <div style={{ width: 42, height: 42, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <i className="bi bi-clock-history" style={{ color: '#00963F', fontSize: 20 }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
            {KPIS.tempoMedio} dias
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Tempo médio de resolução</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>meta: 7 dias</div>
        </div>
      </div>

      {/* ── Row 2: Funil + Tendência temporal ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '45fr 55fr', gap: 14, marginBottom: 20 }}>

        {/* Funil de etapas */}
        <div style={card}>
          {sectionHead('Funil de etapas', 'quantidade ativa por etapa', 'bi-filter-circle')}
          <div style={{ padding: '20px 24px' }}>
            {FUNIL_STAGES.map((stage, i) => {
              const barPct = (stage.count / maxFunil) * 100;
              const totalPct = Math.round((stage.count / KPIS.andamento) * 100);
              const isLast = i === FUNIL_STAGES.length - 1;
              return (
                <div key={i} style={{ marginBottom: isLast ? 0 : 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{stage.label}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{totalPct}% do ativo</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: '#6b7280', width: 30, textAlign: 'right', flexShrink: 0 }}>
                      {totalPct}%
                    </span>
                    {/* Centered funnel bar */}
                    <div style={{ flex: 1, height: 30, background: '#f0fdf4', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                      <div style={{
                        position: 'absolute',
                        height: '100%',
                        width: `${barPct}%`,
                        left: `${(100 - barPct) / 2}%`,
                        background: 'linear-gradient(90deg, #007A32, #00963F)',
                        borderRadius: 6,
                      }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', width: 32, textAlign: 'left', flexShrink: 0 }}>
                      {stage.count}
                    </span>
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Total ativo</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#00963F' }}>
                {KPIS.andamento.toLocaleString('pt-BR')} solicitações
              </span>
            </div>
          </div>
        </div>

        {/* Tendência temporal */}
        <div style={card}>
          {sectionHead('Evolução acumulada', 'total por situação semana a semana — último trimestre', 'bi-graph-up')}
          <div style={{ padding: '16px 20px', height: isMobile ? 200 : 272 }}>
            <Line data={lineData} options={lineOpts as object} />
          </div>
        </div>
      </div>

      {/* ── Row 3: Por estado + Distribuição de status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '60fr 40fr', gap: 14, marginBottom: 20 }}>

        {/* Por estado */}
        <div style={card}>
          {sectionHead('Pendências por estado', 'estados com mais solicitações em andamento', 'bi-map')}
          <div style={{ padding: '16px 20px', height: isMobile ? 200 : 340 }}>
            <Bar data={stackedBarData} options={stackedBarOpts as object} />
          </div>
        </div>

        {/* Distribuição de status */}
        <div style={card}>
          {sectionHead('Distribuição de status', 'composição por situação atual', 'bi-pie-chart-fill')}
          <div style={{ padding: '20px' }}>
            <div style={{ position: 'relative', height: 210 }}>
              <Doughnut data={donutData} options={donutOpts as object} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center', pointerEvents: 'none',
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
                  {KPIS.total.toLocaleString('pt-BR')}
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>Total</div>
              </div>
            </div>
            {/* Custom legend */}
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Pendentes',    value: KPIS.andamento,   color: '#FFD000' },
                { label: 'Deferido',     value: KPIS.deferidos,   color: '#00963F' },
                { label: 'Indeferido',   value: KPIS.indeferidos, color: '#E53E3E' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#6b7280', flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    {item.value.toLocaleString('pt-BR')}
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af', width: 44, textAlign: 'right' }}>
                    ({((item.value / KPIS.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Oldest pending table ── */}
      <div style={card}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ color: '#dc2626', fontSize: 16, marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
              Requer atenção — pendentes há mais tempo
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
              solicitações em andamento ordenadas por data de abertura (mais antigas primeiro)
            </div>
          </div>
        </div>

        {/* Table / Mobile Cards */}
        {isMobile ? (
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {OLDEST_PENDING.map(item => (
              <div key={item.id} style={{ border: '1px solid #fee2e2', borderRadius: 10, padding: '12px 14px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <button onClick={() => onNavigate('gerenciar-filiados')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#00963F', fontWeight: 600, fontSize: 12, fontFamily: 'Open Sans, sans-serif', textDecoration: 'underline' }}>{item.protocolo}</button>
                    <a href={protocoloToUrl(item.protocolo)} target="_blank" rel="noopener noreferrer" title="Abrir no 1Doc" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, background: '#1351b4', borderRadius: 4, color: '#fff', textDecoration: 'none' }}>
                      <i className="bi bi-box-arrow-up-right" style={{ fontSize: 10 }} />
                    </a>
                  </div>
                  <DiasBadge dias={item.diasAbertos} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', marginBottom: 2 }}>{item.nome}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}><strong>{item.uf}</strong> / {item.municipio}</div>
                <div style={{ marginBottom: 8 }}><EtapaBadge etapa={item.etapa} /></div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => onNavigate('gerenciar-filiados')} style={{ height: 32, padding: '0 14px', background: '#fff', border: '1.5px solid #00963F', borderRadius: 6, color: '#00963F', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <i className="bi bi-eye" style={{ fontSize: 12 }} /> Ver
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Nº Protocolo', 'Nome completo', 'UF / Município', 'Etapa atual', 'Dias em aberto', 'Ação'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OLDEST_PENDING.map((item, i) => (
                <TableRow
                  key={item.id}
                  item={item}
                  isEven={i % 2 === 0}
                  onNavigate={onNavigate}
                />
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Footer link */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onNavigate('gerenciar-filiados')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#00963F', fontSize: 13, fontWeight: 600,
              fontFamily: 'Open Sans, sans-serif',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
            onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
          >
            Ver todos em Gerenciar Filiados
            <i className="bi bi-arrow-right" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Extraído para evitar re-render e isolar hover state
function TableRow({ item, isEven, onNavigate }: { item: OldestItem; isEven: boolean; onNavigate: NavigateFn }) {
  const [hov, setHov] = useState(false);
  const base = isEven ? '#fff' : '#fafafa';
  return (
    <tr
      style={{ borderBottom: '1px solid #f3f4f6', background: hov ? '#f0fdf4' : base, transition: 'background 0.1s' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => onNavigate('gerenciar-filiados')}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#00963F', fontWeight: 600, fontSize: 13, fontFamily: 'Open Sans, sans-serif', textDecoration: 'underline' }}
          >
            {item.protocolo}
          </button>
          <a
            href={protocoloToUrl(item.protocolo)}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir processo no 1Doc"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, background: '#1351b4', borderRadius: 5, color: '#fff', flexShrink: 0, textDecoration: 'none' }}
          >
            <i className="bi bi-box-arrow-up-right" style={{ fontSize: 11 }} />
          </a>
        </div>
      </td>
      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#111827', whiteSpace: 'nowrap' }}>{item.nome}</td>
      <td style={{ padding: '12px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>
        <span style={{ fontWeight: 600 }}>{item.uf}</span> / {item.municipio}
      </td>
      <td style={{ padding: '12px 16px' }}><EtapaBadge etapa={item.etapa} /></td>
      <td style={{ padding: '12px 16px' }}><DiasBadge dias={item.diasAbertos} /></td>
      <td style={{ padding: '12px 16px' }}>
        <button
          onClick={() => onNavigate('gerenciar-filiados')}
          style={{ height: 30, padding: '0 14px', background: '#fff', border: '1.5px solid #00963F', borderRadius: 6, color: '#00963F', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5, transition: 'background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E8F5E9'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
        >
          <i className="bi bi-eye" style={{ fontSize: 12 }} />
          Ver
        </button>
      </td>
    </tr>
  );
}
