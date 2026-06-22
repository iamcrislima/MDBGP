import React, { useState, useMemo } from 'react';
import type { NavigateFn, Mandatario } from '../types';
import DataTable, { Column } from '../components/shared/DataTable';
import CustomSelect from '../components/shared/CustomSelect';
import PessoaDetalheModal from '../components/shared/PessoaDetalheModal';
import { MOCK_MANDATARIOS } from '../data/mockData';
import { useBreakpoint } from '../hooks/useBreakpoint';
import Badge from '../components/shared/Badge';
import Button from '../components/shared/Button';
import PageHeader from '../components/shared/PageHeader';
import FilterPanel from '../components/shared/FilterPanel';

const CARGO_OPTS  = ['Prefeito','Vice-Prefeito','Vereador'].map(v => ({ value: v, label: v }));
const UF_OPTS     = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(v => ({ value: v, label: v }));
const SITUACAO_OPTS = ['Eleito','Eleito Por Qp','Eleito Por Média','Não Eleito'].map(v => ({ value: v, label: v }));
const ELEITO_OPTS   = ['Sim','Não'].map(v => ({ value: v, label: v }));

const EMPTY_F = {
  nome: '', nomeUrna: '',
  cargo: '', anoEleicao: '', eleito: '', uf: '', municipio: '',
  sexo: '', raca: '',
  idadeMin: '', idadeMax: '',
  popMin: '', popMax: '',
};

const ALL_DATA: Mandatario[] = Array.from({ length: 10085 }, (_, i) => ({
  ...MOCK_MANDATARIOS[i % MOCK_MANDATARIOS.length],
  id: i + 1,
}));

const SEXO_OPTS = ['Masculino', 'Feminino'].map(v => ({ value: v, label: v }));
const RACA_OPTS = ['Branca', 'Parda', 'Preta', 'Amarela', 'Indígena'].map(v => ({ value: v, label: v }));
const ANO_OPTS  = ['2012', '2016', '2020', '2024'].map(v => ({ value: v, label: v }));

const MUN_BY_UF = (() => {
  const m: Record<string, Set<string>> = {};
  ALL_DATA.forEach(d => { (m[d.uf] = m[d.uf] || new Set()).add(d.municipio); });
  const res: Record<string, { value: string; label: string }[]> = {};
  Object.entries(m).forEach(([uf, muns]) => { res[uf] = [...muns].sort().map(v => ({ value: v, label: v })); });
  return res;
})();

const MUN_POPULATION: Record<string, number> = {
  'PI:Passagem Franca Do Piauí': 5413,
  'PI:Aroazes': 3012,
  'AM:Juruá': 9234,
  'RS:Vitória Das Missões': 4118,
  'RS:Cândido Godói': 7891,
  'MG:Dores De Campos': 8340,
  'RS:Barracão': 10023,
  'AL:Porto Calvo': 25116,
  'BA:Boa Nova': 14789,
  'ES:Irupi': 11234,
  'BA:Igrapiúna': 19876,
  'PA:Santarém': 320455,
};

/* ── page ───────────────────────────────────────────────────────────────── */
const lb: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 };
const inp: React.CSSProperties = { border: '1px solid var(--color-border-input)', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff', width: '100%', fontFamily: 'Open Sans, sans-serif', color: 'var(--color-text-dark)', height: 38, boxSizing: 'border-box' };

export default function MandatarioPage({ onNavigate: _onNavigate }: { onNavigate: NavigateFn }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [filters, setFilters] = useState({ ...EMPTY_F });
  const [filterOpen, setFilterOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Mandatario | null>(null);

  const filtered = useMemo(() => ALL_DATA.filter(m => {
    if (filters.nome     && !m.nome.toLowerCase().includes(filters.nome.toLowerCase())) return false;
    if (filters.nomeUrna && !m.nomeUrna.toLowerCase().includes(filters.nomeUrna.toLowerCase())) return false;
    if (filters.cargo      && m.cargo !== filters.cargo) return false;
    if (filters.anoEleicao && String(m.anoEleicao) !== filters.anoEleicao) return false;
    if (filters.eleito     && m.eleito !== filters.eleito) return false;
    if (filters.uf         && m.uf !== filters.uf) return false;
    if (filters.municipio  && m.municipio !== filters.municipio) return false;
    if (filters.sexo       && m.sexo !== filters.sexo) return false;
    if (filters.raca       && m.raca !== filters.raca) return false;
    if (filters.idadeMin   && (!m.idade || m.idade < Number(filters.idadeMin))) return false;
    if (filters.idadeMax   && (!m.idade || m.idade > Number(filters.idadeMax))) return false;
    if (filters.popMin || filters.popMax) {
      const pop = MUN_POPULATION[`${m.uf}:${m.municipio}`] ?? 0;
      if (filters.popMin && pop < Number(filters.popMin)) return false;
      if (filters.popMax && pop > Number(filters.popMax)) return false;
    }
    return true;
  }), [filters]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const set = (k: keyof typeof EMPTY_F) => (v: string) => { setFilters(p => ({ ...p, [k]: v })); setPage(1); };

  const columns: Column<Mandatario>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'anoEleicao', label: 'Ano da Eleição' },
    { key: 'situacao', label: 'Situação', render: r => <Badge variant={r.situacao.toLowerCase().startsWith('eleito') ? 'success' : 'neutral'} label={r.situacao} /> },
    { key: 'uf', label: 'UF', width: 60 },
    { key: 'municipio', label: 'Município' },
    { key: 'eleito', label: 'Eleito?', width: 80, render: r => <Badge variant={r.eleito === 'Sim' ? 'success' : 'neutral'} label={r.eleito} /> },
    { key: 'totalVotos', label: 'Total de Votos', render: r => <span style={{ fontFamily: 'ui-monospace, monospace', display: 'block', textAlign: 'right' }}>{r.totalVotos.toLocaleString('pt-BR')}</span> },
    {
      key: 'acoes', label: 'Ações', sortable: false, width: 90,
      render: r => (
        <Button variant="ghost" size="sm" onClick={() => setSelected(r)} icon="bi-eye">Ver</Button>
      )
    },
  ];

  return (
    <div style={{ padding: isMobile ? '16px' : '24px 28px', fontFamily: 'Open Sans, sans-serif' }}>
      <PageHeader
        title="Consultar Mandatários"
        subtitle={<><span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{filtered.length.toLocaleString('pt-BR')}</span>{' registros encontrados'}</>}
        action={
          <Button variant="ghost" onClick={() => setFilterOpen(v => !v)}>
            <i className={`bi bi-funnel${filterOpen ? '-fill' : ''}`} style={{ color: filterOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)' }} />
            {' '}Filtros
          </Button>
        }
      />

      <FilterPanel
        open={filterOpen}
        onFilter={() => setFilterOpen(false)}
        onClear={() => { setFilters({ ...EMPTY_F }); setPage(1); }}
      >
        {/* Linha 1: Nome | Nome na urna */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lb}>Nome</label>
            <input style={inp} placeholder="Nome do mandatário" value={filters.nome}
              onChange={e => { setFilters(p => ({ ...p, nome: e.target.value })); setPage(1); }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
          </div>
          <div>
            <label style={lb}>Nome na urna</label>
            <input style={inp} placeholder="Nome de urna" value={filters.nomeUrna}
              onChange={e => { setFilters(p => ({ ...p, nomeUrna: e.target.value })); setPage(1); }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
          </div>
        </div>

        {/* Linha 2: Cargo | Ano | Eleito | UF | Município */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr 1fr' : 'repeat(5, 1fr)', gap: 14, marginBottom: 14 }}>
          <div><label style={lb}>Cargo</label><CustomSelect value={filters.cargo} onChange={set('cargo')} options={CARGO_OPTS} placeholder="Todos" /></div>
          <div><label style={lb}>Ano da eleição</label><CustomSelect value={filters.anoEleicao} onChange={set('anoEleicao')} options={ANO_OPTS} placeholder="Todos" /></div>
          <div><label style={lb}>Eleito?</label><CustomSelect value={filters.eleito} onChange={set('eleito')} options={ELEITO_OPTS} placeholder="Todos" /></div>
          <div><label style={lb}>UF</label><CustomSelect value={filters.uf} onChange={v => { setFilters(p => ({ ...p, uf: v, municipio: '' })); setPage(1); }} options={UF_OPTS} placeholder="Todas" /></div>
          <div><label style={lb}>Município</label><CustomSelect value={filters.municipio} onChange={set('municipio')} options={MUN_BY_UF[filters.uf] ?? []} placeholder="Todos" disabled={!filters.uf} /></div>
        </div>

        {/* Linha 3: Sexo | Raça | Idade (range) | Pop. município (range) */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14 }}>
          <div><label style={lb}>Sexo</label><CustomSelect value={filters.sexo} onChange={set('sexo')} options={SEXO_OPTS} placeholder="Todos" /></div>
          <div><label style={lb}>Raça / Cor</label><CustomSelect value={filters.raca} onChange={set('raca')} options={RACA_OPTS} placeholder="Todos" /></div>
          <div>
            <label style={lb}>Idade</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input style={{ ...inp, flex: 1, minWidth: 0 }} type="number" min="0" placeholder="De" value={filters.idadeMin}
                onChange={e => { setFilters(p => ({ ...p, idadeMin: e.target.value })); setPage(1); }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 12, flexShrink: 0 }}>–</span>
              <input style={{ ...inp, flex: 1, minWidth: 0 }} type="number" min="0" placeholder="Até" value={filters.idadeMax}
                onChange={e => { setFilters(p => ({ ...p, idadeMax: e.target.value })); setPage(1); }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
            </div>
          </div>
          <div>
            <label style={lb}>Pop. município</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input style={{ ...inp, flex: 1, minWidth: 0 }} type="number" min="0" placeholder="De" value={filters.popMin}
                onChange={e => { setFilters(p => ({ ...p, popMin: e.target.value })); setPage(1); }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 12, flexShrink: 0 }}>–</span>
              <input style={{ ...inp, flex: 1, minWidth: 0 }} type="number" min="0" placeholder="Até" value={filters.popMax}
                onChange={e => { setFilters(p => ({ ...p, popMax: e.target.value })); setPage(1); }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
            </div>
          </div>
        </div>
      </FilterPanel>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, padding: '20px 22px' }}>
        <DataTable<Mandatario>
          columns={columns}
          data={pageData}
          totalRecords={filtered.length}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={s => { setPageSize(s); setPage(1); }}
          mobileCard={(r) => {
            return (
              <div style={{ background: '#fff', border: '1px solid #dde3ee', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)', flex: 1, marginRight: 8 }}>{r.nome}</div>
                  <Badge variant={r.eleito === 'Sim' ? 'success' : 'neutral'} label={r.eleito} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>{r.cargo} · {r.anoEleicao}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>{r.uf} · {r.municipio}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' as const }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Situação:</span>
                  <Badge variant={r.situacao.toLowerCase().startsWith('eleito') ? 'success' : 'neutral'} label={r.situacao} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-dark)' }}>Votos: <strong>{r.totalVotos.toLocaleString('pt-BR')}</strong></span>
                  <Button variant="primary" size="sm" onClick={() => setSelected(r)} icon="bi-eye">Ver</Button>
                </div>
              </div>
            );
          }}
        />
      </div>

      {selected && <PessoaDetalheModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
