import React, { useState, useMemo } from 'react';
import type { NavigateFn, Dirigente } from '../types';
import DataTable, { Column } from '../components/shared/DataTable';
import CustomSelect from '../components/shared/CustomSelect';
import { MOCK_DIRIGENTES } from '../data/mockData';
import { useBreakpoint } from '../hooks/useBreakpoint';

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

function calcDuracao(inicio: string, fim: string): string {
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

function calcVigencia(fim: string): 'Vigente' | 'Encerrado' {
  try {
    const [d, m, y] = fim.split('/').map(Number);
    return new Date(y, m - 1, d) >= new Date() ? 'Vigente' : 'Encerrado';
  } catch { return 'Encerrado'; }
}

/* ── Badges ─────────────────────────────────────────────────────────────── */
function VigenciaBadge({ value }: { value: 'Vigente' | 'Encerrado' }) {
  const ok = value === 'Vigente';
  return <span style={{ background: ok ? '#dcfce7' : '#f3f4f6', color: ok ? '#15803d' : '#6b7280', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{value}</span>;
}

function BoolBadge({ label, value }: { label?: string; value: string | undefined }) {
  const sim = value === 'Sim';
  return (
    <span style={{ background: sim ? '#dcfce7' : '#f3f4f6', color: sim ? '#15803d' : '#6b7280', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
      {label ? `${label}: ` : ''}{value ?? '—'}
    </span>
  );
}

/* ── Modal ──────────────────────────────────────────────────────────────── */
function DirigenteModal({ item, onClose }: { item: Dirigente; onClose: () => void }) {
  const initials = item.nomeDirigente.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const vigencia = calcVigencia(item.dataFimExercicio);
  const duracao  = calcDuracao(item.dataInicioExercicio, item.dataFimExercicio);

  const SH = ({ icon, title }: { icon: string; title: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f0f4fb' }}>
      <div style={{ width: 28, height: 28, background: '#eff6ff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={`bi ${icon}`} style={{ color: '#2563eb', fontSize: 13 }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{title}</span>
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{children}</div>
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 1060 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: 12, width: 680, maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh', overflow: 'hidden', zIndex: 1070, boxShadow: '0 24px 64px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: '#12121f', padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{item.nomeDirigente}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{item.cargoDirigente}</span>
                <span style={{ background: vigencia === 'Vigente' ? '#dcfce7' : '#374151', color: vigencia === 'Vigente' ? '#15803d' : '#9ca3af', borderRadius: 100, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>{vigencia}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 24, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '22px 24px 28px', flex: 1 }}>

          {/* Dados do dirigente */}
          <div style={{ marginBottom: 22 }}>
            <SH icon="bi-person-fill" title="Dados do dirigente" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 24px' }}>
              <Field label="Nome completo">{item.nomeDirigente}</Field>
              <Field label="CPF">{maskCpf(item.cpfDirigente)}</Field>
              <Field label="Título de eleitor">{item.tituloEleitor ?? '—'}</Field>
              <Field label="Gênero">{item.genero ?? '—'}</Field>
              <Field label="Resp. administrativo"><BoolBadge value={item.respAdm} /></Field>
              <Field label="Resp. financeiro"><BoolBadge value={item.respFinan ?? 'Não'} /></Field>
            </div>
          </div>

          {/* Órgão partidário */}
          <div style={{ marginBottom: 22 }}>
            <SH icon="bi-bank2" title="Órgão partidário" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 24px' }}>
              <Field label="Tipo do órgão">{item.tipoOrgao}</Field>
              <Field label="Abrangência">{item.abrangenciaOrgao}</Field>
              <Field label="UF">{item.ufOrgao}</Field>
              <Field label="Município">{item.municipioOrgao}</Field>
              <Field label="Situação do órgão">
                <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>Vigente</span>
              </Field>
              <Field label="Situação da vigência"><VigenciaBadge value={vigencia} /></Field>
            </div>
          </div>

          {/* Período de exercício */}
          <div style={{ marginBottom: 4 }}>
            <SH icon="bi-calendar-range" title="Período de exercício" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 24px' }}>
              <Field label="Data de início">{item.dataInicioExercicio}</Field>
              <Field label="Data de fim">{item.dataFimExercicio}</Field>
              <Field label="Duração">
                <span style={{ fontWeight: 600, color: '#2563eb' }}>{duracao}</span>
              </Field>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
const lb: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 };
const inp: React.CSSProperties = { border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff', width: '100%', fontFamily: 'Open Sans, sans-serif', color: '#374151', height: 38, boxSizing: 'border-box' };

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
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{r.tipoOrgao}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{r.abrangenciaOrgao}</div>
        </div>
      )
    },
    {
      key: 'ufOrgao', label: 'Local', width: 110,
      render: r => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#2563eb' }}>{r.ufOrgao}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{r.municipioOrgao}</div>
        </div>
      )
    },
    {
      key: 'nomeDirigente', label: 'Dirigente',
      render: r => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{r.nomeDirigente}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1, fontFamily: 'monospace' }}>{maskCpf(r.cpfDirigente)}</div>
        </div>
      )
    },
    {
      key: 'cargoDirigente', label: 'Cargo',
      render: r => {
        const t = r.cargoDirigente.length > 32 ? r.cargoDirigente.slice(0, 32) + '…' : r.cargoDirigente;
        return <span title={r.cargoDirigente} style={{ fontSize: 13, color: '#374151', cursor: r.cargoDirigente.length > 32 ? 'help' : 'default' }}>{t}</span>;
      }
    },
    {
      key: 'dataInicioExercicio', label: 'Exercício', width: 160,
      render: r => <span style={{ fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>{r.dataInicioExercicio} – {r.dataFimExercicio}</span>
    },
    {
      key: 'acoes', label: 'Ações', sortable: false, width: 80,
      render: r => (
        <button onClick={() => setSelected(r)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#374151', fontSize: 12, fontWeight: 500, fontFamily: 'Open Sans, sans-serif' }}>
          <i className="bi bi-eye" style={{ fontSize: 12 }} /> Ver
        </button>
      )
    },
  ];

  return (
    <div style={{ padding: isMobile ? '16px' : '24px 28px', fontFamily: 'Open Sans, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: '#111827', margin: 0 }}>Consultar Dirigentes</h1>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}><span style={{ color: '#2563eb', fontWeight: 600 }}>{filtered.length.toLocaleString('pt-BR')}</span> registros encontrados</div>
        </div>
        <button onClick={() => setFilterOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#374151', fontFamily: 'Open Sans, sans-serif' }}>
          <i className={`bi bi-funnel${filterOpen ? '-fill' : ''}`} style={{ color: filterOpen ? '#2563eb' : '#6b7280' }} /> Filtros
        </button>
      </div>

      {filterOpen && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px', marginBottom: 20 }}>

          {/* Linha 1: Nome | CPF */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lb}>Nome do dirigente</label>
              <input style={inp} placeholder="Nome completo" value={filters.nome}
                onChange={e => { setFilters(p => ({ ...p, nome: e.target.value })); setPage(1); }}
                onFocus={e => (e.target.style.borderColor = '#2563eb')}
                onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
            </div>
            <div>
              <label style={lb}>CPF</label>
              <input style={inp} placeholder="Pesquisar CPF" value={filters.cpf}
                onChange={e => { setFilters(p => ({ ...p, cpf: e.target.value })); setPage(1); }}
                onFocus={e => (e.target.style.borderColor = '#2563eb')}
                onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
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
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 3fr', gap: 14, marginBottom: 18 }}>
            <div>
              <label style={lb}>Cargo</label>
              <input style={inp} placeholder="Cargo do dirigente" value={filters.cargo}
                onChange={e => { setFilters(p => ({ ...p, cargo: e.target.value })); setPage(1); }}
                onFocus={e => (e.target.style.borderColor = '#2563eb')}
                onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => { setFilters({ ...EMPTY_F }); setPage(1); }}
              style={{ padding: '7px 16px', border: '1px solid #d1d5db', borderRadius: 7, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#6b7280', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="bi bi-x-circle" /> Nova pesquisa
            </button>
            <button onClick={() => setFilterOpen(false)}
              style={{ padding: '7px 18px', border: 'none', borderRadius: 7, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="bi bi-funnel-fill" /> Filtrar
            </button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px' }}>
        <DataTable
          columns={cols as unknown as Column<Record<string, unknown>>[]}
          data={pageData as unknown as Record<string, unknown>[]}
          totalRecords={filtered.length}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={s => { setPageSize(s); setPage(1); }}
          mobileCard={(row) => {
            const r = row as unknown as Dirigente;
            const vig = calcVigencia(r.dataFimExercicio);
            return (
              <div style={{ background: '#fff', border: '1px solid #dde3ee', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', flex: 1, marginRight: 8 }}>{r.nomeDirigente}</div>
                  <VigenciaBadge value={vig} />
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>{r.cargoDirigente}</div>
                <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, marginBottom: 2 }}>{r.ufOrgao} · {r.municipioOrgao}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{r.dataInicioExercicio} – {r.dataFimExercicio}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelected(r)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#2563eb', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'Open Sans, sans-serif', minHeight: 36 }}>
                    <i className="bi bi-eye" style={{ fontSize: 11 }} /> Ver
                  </button>
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
