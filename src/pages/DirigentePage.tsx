import React, { useState, useMemo } from 'react';
import type { NavigateFn, Dirigente } from '../types';
import DataTable, { Column } from '../components/shared/DataTable';
import CustomSelect from '../components/shared/CustomSelect';
import { MOCK_DIRIGENTES } from '../data/mockData';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { calcDuracao, calcVigencia } from '../utils/dateUtils';
import Badge from '../components/shared/Badge';
import Button from '../components/shared/Button';
import Avatar from '../components/shared/Avatar';
import ModalBase from '../components/shared/ModalBase';
import PageHeader from '../components/shared/PageHeader';
import SectionHeader from '../components/shared/SectionHeader';
import FilterPanel from '../components/shared/FilterPanel';

const ALL_DATA: Dirigente[] = Array.from({ length: 11232 }, (_, i) => ({ ...MOCK_DIRIGENTES[i % MOCK_DIRIGENTES.length], id: i + 1 }));

const UF_OPTS          = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(v => ({ value: v, label: v }));
const TIPO_ORGAO_OPTS  = ['Órgão definitivo', 'Órgão provisório', 'Órgão interventor'].map(v => ({ value: v, label: v }));
const ABRANGENCIA_OPTS = ['Municipal', 'Estadual', 'Nacional'].map(v => ({ value: v, label: v }));

const MUN_BY_UF = (() => {
  const m: Record<string, Set<string>> = {};
  ALL_DATA.forEach(d => { (m[d.ufOrgao] = m[d.ufOrgao] || new Set()).add(d.municipioOrgao); });
  const res: Record<string, { value: string; label: string }[]> = {};
  Object.entries(m).forEach(([uf, muns]) => { res[uf] = [...muns].sort().map(v => ({ value: v, label: v })); });
  return res;
})();

const EMPTY_F = { nome: '', cpf: '', uf: '', municipio: '', tipoOrgao: '', abrangencia: '', cargo: '' };

const maskCpf = (cpf: string) => cpf.replace(/^(\d{3})\.\d{3}\.\d{3}(-\d{2})$/, '$1.***.***$2');


/* ── Modal ──────────────────────────────────────────────────────────────── */
function DirigenteModal({ item, onClose }: { item: Dirigente; onClose: () => void }) {
  const vigencia = calcVigencia(item.dataFimExercicio);
  const duracao  = calcDuracao(item.dataInicioExercicio, item.dataFimExercicio);

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-dark)', fontWeight: 500 }}>{children}</div>
    </div>
  );

  return (
    <ModalBase open={true} onClose={onClose} width={680}>
      <ModalBase.NavyHeader onClose={onClose}>
        <Avatar nome={item.nomeDirigente} size={42} palette="gradient-blue" />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{item.nomeDirigente}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{item.cargoDirigente}</span>
            <Badge variant={vigencia === 'Vigente' ? 'vigente' : 'encerrado'} label={vigencia} size="sm" context="dark" />
          </div>
        </div>
      </ModalBase.NavyHeader>

      <ModalBase.Body>

          {/* Dados do dirigente */}
          <div style={{ marginBottom: 22 }}>
            <SectionHeader icon="bi-person-fill" title="Dados do dirigente" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 24px' }}>
              <Field label="Nome completo">{item.nomeDirigente}</Field>
              <Field label="CPF">{maskCpf(item.cpfDirigente)}</Field>
              <Field label="Título de eleitor">{item.tituloEleitor ?? '—'}</Field>
              <Field label="Gênero">{item.genero ?? '—'}</Field>
              <Field label="Resp. administrativo"><Badge variant={item.respAdm === 'Sim' ? 'success' : 'neutral'} label={item.respAdm ?? '—'} /></Field>
              <Field label="Resp. financeiro"><Badge variant={(item.respFinan ?? 'Não') === 'Sim' ? 'success' : 'neutral'} label={item.respFinan ?? 'Não'} /></Field>
            </div>
          </div>

          {/* Órgão partidário */}
          <div style={{ marginBottom: 22 }}>
            <SectionHeader icon="bi-bank2" title="Órgão partidário" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 24px' }}>
              <Field label="Tipo do órgão">{item.tipoOrgao}</Field>
              <Field label="Abrangência">{item.abrangenciaOrgao}</Field>
              <Field label="UF">{item.ufOrgao}</Field>
              <Field label="Município">{item.municipioOrgao}</Field>
              <Field label="Situação do órgão">
                <Badge variant="vigente" label="Vigente" />
              </Field>
              <Field label="Situação da vigência"><Badge variant={vigencia === 'Vigente' ? 'vigente' : 'encerrado'} label={vigencia} /></Field>
            </div>
          </div>

          {/* Período de exercício */}
          <div style={{ marginBottom: 4 }}>
            <SectionHeader icon="bi-calendar-range" title="Período de exercício" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 24px' }}>
              <Field label="Data de início">{item.dataInicioExercicio}</Field>
              <Field label="Data de fim">{item.dataFimExercicio}</Field>
              <Field label="Duração">
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{duracao}</span>
              </Field>
            </div>
          </div>
      </ModalBase.Body>
    </ModalBase>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
const lb: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 };
const inp: React.CSSProperties = { border: '1px solid var(--color-border-input)', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff', width: '100%', fontFamily: 'Open Sans, sans-serif', color: 'var(--color-text-dark)', height: 38, boxSizing: 'border-box' };

export default function DirigentePage({ onNavigate: _onNavigate }: { onNavigate: NavigateFn }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [filters, setFilters]      = useState({ ...EMPTY_F });
  const [filterOpen, setFilterOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [page, setPage]            = useState(1);
  const [pageSize, setPageSize]    = useState(10);
  const [selected, setSelected]    = useState<Dirigente | null>(null);

  const filtered = useMemo(() => ALL_DATA.filter(d => {
    if (filters.nome      && !d.nomeDirigente.toLowerCase().includes(filters.nome.toLowerCase())) return false;
    if (filters.cpf       && !d.cpfDirigente.includes(filters.cpf)) return false;
    if (filters.uf        && d.ufOrgao !== filters.uf) return false;
    if (filters.municipio && d.municipioOrgao !== filters.municipio) return false;
    if (filters.tipoOrgao && d.tipoOrgao !== filters.tipoOrgao) return false;
    if (filters.cargo     && !d.cargoDirigente.toLowerCase().includes(filters.cargo.toLowerCase())) return false;
    if (filters.abrangencia && d.abrangenciaOrgao !== filters.abrangencia) return false;
    return true;
  }), [filters]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const set = (k: keyof typeof EMPTY_F) => (v: string) => { setFilters(p => ({ ...p, [k]: v })); setPage(1); };

  const cols: Column<Dirigente>[] = [
    {
      key: 'tipoOrgao', label: 'Órgão',
      render: r => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{r.tipoOrgao}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>{r.abrangenciaOrgao}</div>
        </div>
      )
    },
    {
      key: 'ufOrgao', label: 'Local', width: 110,
      render: r => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-primary)' }}>{r.ufOrgao}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>{r.municipioOrgao}</div>
        </div>
      )
    },
    {
      key: 'nomeDirigente', label: 'Dirigente',
      render: r => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{r.nomeDirigente}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1, fontFamily: 'monospace' }}>{maskCpf(r.cpfDirigente)}</div>
        </div>
      )
    },
    {
      key: 'cargoDirigente', label: 'Cargo',
      render: r => {
        const t = r.cargoDirigente.length > 32 ? r.cargoDirigente.slice(0, 32) + '…' : r.cargoDirigente;
        return <span title={r.cargoDirigente} style={{ fontSize: 13, color: 'var(--color-text-dark)', cursor: r.cargoDirigente.length > 32 ? 'help' : 'default' }}>{t}</span>;
      }
    },
    {
      key: 'dataInicioExercicio', label: 'Exercício', width: 160,
      render: r => <span style={{ fontSize: 12, color: 'var(--color-text-dark)', whiteSpace: 'nowrap' }}>{r.dataInicioExercicio} – {r.dataFimExercicio}</span>
    },
    {
      key: 'acoes', label: 'Ações', sortable: false, width: 80,
      render: r => (
        <Button variant="ghost" size="sm" onClick={() => setSelected(r)} icon="bi-eye">Ver</Button>
      )
    },
  ];

  return (
    <div style={{ padding: isMobile ? '16px' : '24px 28px', fontFamily: 'Open Sans, sans-serif' }}>
      <PageHeader
        title="Consultar Dirigentes"
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
        {/* Linha 1: Nome | CPF */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lb}>Nome do dirigente</label>
            <input style={inp} placeholder="Nome completo" value={filters.nome}
              onChange={e => { setFilters(p => ({ ...p, nome: e.target.value })); setPage(1); }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
          </div>
          <div>
            <label style={lb}>CPF</label>
            <input style={inp} placeholder="Pesquisar CPF" value={filters.cpf}
              onChange={e => { setFilters(p => ({ ...p, cpf: e.target.value })); setPage(1); }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
          </div>
        </div>

        {/* Linha 2: UF órgão | Município | Tipo órgão | Abrangência */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lb}>UF do órgão</label>
            <CustomSelect value={filters.uf} onChange={v => { setFilters(p => ({ ...p, uf: v, municipio: '' })); setPage(1); }} options={UF_OPTS} placeholder="Todas" />
          </div>
          <div>
            <label style={lb}>Município</label>
            <CustomSelect value={filters.municipio} onChange={set('municipio')} options={MUN_BY_UF[filters.uf] ?? []} placeholder="Todos" disabled={!filters.uf} />
          </div>
          <div>
            <label style={lb}>Tipo de órgão</label>
            <CustomSelect value={filters.tipoOrgao} onChange={set('tipoOrgao')} options={TIPO_ORGAO_OPTS} placeholder="Todos" />
          </div>
          <div>
            <label style={lb}>Abrangência</label>
            <CustomSelect value={filters.abrangencia} onChange={set('abrangencia')} options={ABRANGENCIA_OPTS} placeholder="Todas" />
          </div>
        </div>

        {/* Linha 3: Cargo */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 3fr', gap: 14 }}>
          <div>
            <label style={lb}>Cargo</label>
            <input style={inp} placeholder="Cargo do dirigente" value={filters.cargo}
              onChange={e => { setFilters(p => ({ ...p, cargo: e.target.value })); setPage(1); }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
          </div>
        </div>
      </FilterPanel>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, padding: '20px 22px' }}>
        <DataTable<Dirigente>
          columns={cols}
          data={pageData}
          totalRecords={filtered.length}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={s => { setPageSize(s); setPage(1); }}
          mobileCard={(r) => {
            const vig = calcVigencia(r.dataFimExercicio);
            return (
              <div style={{ background: '#fff', border: '1px solid #dde3ee', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)', flex: 1, marginRight: 8 }}>{r.nomeDirigente}</div>
                  <Badge variant={vig === 'Vigente' ? 'vigente' : 'encerrado'} label={vig} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>{r.cargoDirigente}</div>
                <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 2 }}>{r.ufOrgao} · {r.municipioOrgao}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{r.dataInicioExercicio} – {r.dataFimExercicio}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="primary" size="sm" onClick={() => setSelected(r)} icon="bi-eye">Ver</Button>
                </div>
              </div>
            );
          }}
        />
      </div>

      {selected && <DirigenteModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
