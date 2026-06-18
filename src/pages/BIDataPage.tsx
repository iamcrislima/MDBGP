import React, { useState, useMemo } from 'react';
import type { NavigateFn } from '../types';
import { MOCK_DIRIGENTES, MOCK_ORGAOS, MOCK_FILIADOS, MOCK_MANDATARIOS } from '../data/mockData';

type BITab = 'dirigentes' | 'orgaos' | 'filiados' | 'mandatarios' | 'usuarios' | 'convenios' | 'ondemand';

const TABS: { id: BITab; label: string; icon: string }[] = [
  { id: 'dirigentes',  label: 'Dirigentes',   icon: 'bi-person-badge-fill' },
  { id: 'orgaos',      label: 'Órgãos',        icon: 'bi-bank2' },
  { id: 'filiados',    label: 'Filiados',      icon: 'bi-diagram-3-fill' },
  { id: 'mandatarios', label: 'Mandatários',   icon: 'bi-people-fill' },
  { id: 'usuarios',    label: 'Usuários',      icon: 'bi-person-gear' },
  { id: 'convenios',   label: 'Convênios',     icon: 'bi-file-earmark-text' },
  { id: 'ondemand',    label: 'On Demand',     icon: 'bi-lightning-charge' },
];

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

/* ── Extended mock data ──────────────────────────────────────────────────── */
type ExtDirigente = {
  id: number; tipoOrgao: string; abrangenciaOrgao: string; ufOrgao: string;
  municipioOrgao: string; nomeDirigente: string; cpfDirigente: string;
  cargoDirigente: string; dataInicioExercicio: string; dataFimExercicio: string;
  respAdm: 'Sim' | 'Não'; respFinan: 'Sim' | 'Não';
  situacaoRegistro: string; situacaoVigencia: string;
};

const ALL_DIRIGENTES: ExtDirigente[] = Array.from({ length: 11232 }, (_, i) => {
  const b = MOCK_DIRIGENTES[i % MOCK_DIRIGENTES.length];
  return {
    ...b,
    id: i + 1,
    respFinan: (i % 6 === 0 ? 'Sim' : 'Não') as 'Sim' | 'Não',
    situacaoRegistro: i % 14 === 0 ? 'Suspenso por falta de prestação de contas' : 'Anotado',
    situacaoVigencia: 'Vigente',
  };
});

const ALL_ORGAOS = Array.from({ length: 311 }, (_, i) => ({ ...MOCK_ORGAOS[i % MOCK_ORGAOS.length], id: i + 1 }));
const ALL_FILIADOS = Array.from({ length: 1444 }, (_, i) => ({ ...MOCK_FILIADOS[i % MOCK_FILIADOS.length], id: i + 1 }));
const ALL_MANDATARIOS = Array.from({ length: 10085 }, (_, i) => ({ ...MOCK_MANDATARIOS[i % MOCK_MANDATARIOS.length], id: i + 1 }));

/* ── Column definitions ──────────────────────────────────────────────────── */
const DIRIG_COLS = [
  { key: 'tipoOrgao',           label: 'Tipo Órgão',               w: 140 },
  { key: 'abrangenciaOrgao',    label: 'Abrangência de Órgão',      w: 160 },
  { key: 'ufOrgao',             label: 'UF Órgão',                  w: 80  },
  { key: 'municipioOrgao',      label: 'Município Órgão',           w: 160 },
  { key: 'nomeDirigente',       label: 'Nome Dirigente',            w: 240 },
  { key: 'cpfDirigente',        label: 'CPF Dirigente',             w: 120 },
  { key: 'cargoDirigente',      label: 'Cargo Dirigente',           w: 300 },
  { key: 'dataInicioExercicio', label: 'Data Início Exercício',     w: 150 },
  { key: 'dataFimExercicio',    label: 'Data Fim Exercício',        w: 150 },
  { key: 'respAdm',             label: 'Resp. Adm. Dirigente?',     w: 145 },
  { key: 'respFinan',           label: 'Resp. Fiscal Dirigente?',   w: 145 },
  { key: 'situacaoRegistro',    label: 'Situação de Registro',      w: 220 },
  { key: 'situacaoVigencia',    label: 'Situação Vigência',         w: 130 },
];

const PAGE_SIZE = 50;

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function Sel({ label, opts, value, onChange }: { label: string; opts: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 150 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ height: 34, padding: '0 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, outline: 'none', background: '#fff', fontFamily: 'Open Sans, sans-serif', cursor: 'pointer' }}>
        <option value="">Todos</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Inp({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} style={{ height: 34, padding: '0 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, outline: 'none', fontFamily: 'Open Sans, sans-serif' }} onFocus={e => e.target.style.borderColor = '#00963F'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function BIDataPage({ onNavigate }: { onNavigate: NavigateFn }) {
  const [tab, setTab] = useState<BITab>('dirigentes');

  // Dirigentes state
  const [filters, setFilters] = useState({ abrangencia: '', uf: '', municipio: '', tipo: '' });
  const [applied, setApplied] = useState({ abrangencia: '', uf: '', municipio: '', tipo: '' });
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(DIRIG_COLS.map(c => c.key)));
  const [page, setPage] = useState(1);
  const [colSearch, setColSearch] = useState('');

  const filteredDirig = useMemo(() => {
    let data = ALL_DIRIGENTES;
    if (applied.abrangencia) data = data.filter(d => d.abrangenciaOrgao === applied.abrangencia);
    if (applied.uf)          data = data.filter(d => d.ufOrgao === applied.uf);
    if (applied.municipio)   data = data.filter(d => d.municipioOrgao.toLowerCase().includes(applied.municipio.toLowerCase()));
    if (applied.tipo)        data = data.filter(d => d.tipoOrgao.toLowerCase().includes(applied.tipo.toLowerCase()));
    return data;
  }, [applied]);

  const pageData   = filteredDirig.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredDirig.length / PAGE_SIZE);
  const shownCols  = DIRIG_COLS.filter(c => visibleCols.has(c.key));

  const quadro = useMemo(() => ({
    total:      filteredDirig.length,
    municipal:  filteredDirig.filter(d => d.abrangenciaOrgao === 'Municipal').length,
    vigentes:   filteredDirig.filter(d => d.situacaoVigencia === 'Vigente').length,
  }), [filteredDirig]);

  const toggleCol = (key: string) => setVisibleCols(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const filteredColDefs = DIRIG_COLS.filter(c => !colSearch || c.label.toLowerCase().includes(colSearch.toLowerCase()));

  return (
    <div style={{ padding: '20px 24px', fontFamily: 'Open Sans, sans-serif' }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          <span style={{ cursor: 'pointer', color: '#00963F' }} onClick={() => onNavigate('home')}>Início</span>
          {' › '}Business Intelligence
        </span>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '12px 18px', border: 'none', background: 'none',
                borderBottom: `3px solid ${tab === t.id ? '#00963F' : 'transparent'}`,
                color: tab === t.id ? '#00963F' : '#6b7280',
                fontWeight: tab === t.id ? 700 : 400,
                fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'Open Sans, sans-serif',
                transition: 'color 0.15s',
              }}
            >
              <i className={`bi ${t.icon}`} style={{ fontSize: 14 }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── DIRIGENTES TAB ──────────────────────────────────────────────── */}
      {tab === 'dirigentes' && (
        <>
          {/* Filters + Quadro row */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
            {/* Filter card */}
            <div style={{ flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Filtros</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <Sel label="Abrangência de Órgão" opts={['Municipal', 'Estadual', 'Nacional']} value={filters.abrangencia} onChange={v => setFilters(p => ({ ...p, abrangencia: v }))} />
                <Sel label="UF Órgão" opts={UFS} value={filters.uf} onChange={v => setFilters(p => ({ ...p, uf: v }))} />
                <Inp label="Município Órgão" value={filters.municipio} onChange={v => setFilters(p => ({ ...p, municipio: v }))} />
                <Sel label="Tipo Órgão" opts={['definitivo', 'provisório']} value={filters.tipo} onChange={v => setFilters(p => ({ ...p, tipo: v }))} />
                <button
                  onClick={() => { setApplied({ ...filters }); setPage(1); }}
                  style={{ height: 34, padding: '0 18px', border: 'none', borderRadius: 6, background: '#00963F', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Open Sans, sans-serif', alignSelf: 'flex-end' }}
                >
                  <i className="bi bi-funnel-fill" /> Filtrar dados
                </button>
                {(applied.abrangencia || applied.uf || applied.municipio || applied.tipo) && (
                  <button onClick={() => { setFilters({ abrangencia: '', uf: '', municipio: '', tipo: '' }); setApplied({ abrangencia: '', uf: '', municipio: '', tipo: '' }); setPage(1); }} style={{ height: 34, padding: '0 14px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', fontSize: 12, cursor: 'pointer', color: '#6b7280', alignSelf: 'flex-end', fontFamily: 'Open Sans, sans-serif' }}>
                    <i className="bi bi-x-circle" /> Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Quadro de dirigentes */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 20px', minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f0f4fb' }}>
                <i className="bi bi-person-badge-fill" style={{ color: '#00963F', fontSize: 16 }} />
                <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Quadro de dirigentes</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Total', value: quadro.total.toLocaleString('pt-BR'), color: '#1e293b' },
                  { label: 'Municipal', value: quadro.municipal.toLocaleString('pt-BR'), color: '#00963F' },
                  { label: 'Vigentes', value: quadro.vigentes.toLocaleString('pt-BR'), color: '#15803d' },
                ].map(stat => (
                  <div key={stat.label} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>{stat.label}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column picker + Table */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

            {/* Exploração de gráficos (column picker) */}
            <div style={{ width: 210, flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="bi bi-sliders" style={{ color: '#00963F', fontSize: 13 }} />
                <span style={{ fontWeight: 700, fontSize: 12, color: '#374151' }}>Exploração de gráficos</span>
              </div>
              <div style={{ padding: '8px 10px 6px' }}>
                <input value={colSearch} onChange={e => setColSearch(e.target.value)} placeholder="Pesquisar..." style={{ width: '100%', height: 30, padding: '0 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 11, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif' }} />
              </div>
              <div style={{ maxHeight: 420, overflowY: 'auto', padding: '4px 0 8px' }}>
                {filteredColDefs.map(col => (
                  <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px', cursor: 'pointer', fontSize: 11, color: '#374151' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <input type="checkbox" checked={visibleCols.has(col.key)} onChange={() => toggleCol(col.key)} style={{ cursor: 'pointer', accentColor: '#00963F', width: 13, height: 13, flexShrink: 0 }} />
                    {col.label}
                  </label>
                ))}
              </div>
              <div style={{ padding: '8px 10px', borderTop: '1px solid #f0f4fb', display: 'flex', gap: 6 }}>
                <button onClick={() => setVisibleCols(new Set(DIRIG_COLS.map(c => c.key)))} style={{ flex: 1, height: 26, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', fontSize: 10, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>Tudo</button>
                <button onClick={() => setVisibleCols(new Set())} style={{ flex: 1, height: 26, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', fontSize: 10, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>Nenhum</button>
              </div>
            </div>

            {/* Table */}
            <div style={{ flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', minWidth: 0 }}>
              {/* Table meta row */}
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f4fb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  Mostrando <strong style={{ color: '#00963F' }}>{((page - 1) * PAGE_SIZE + 1).toLocaleString('pt-BR')}</strong> – <strong style={{ color: '#00963F' }}>{Math.min(page * PAGE_SIZE, filteredDirig.length).toLocaleString('pt-BR')}</strong> de <strong>{filteredDirig.length.toLocaleString('pt-BR')}</strong> registros
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ height: 28, padding: '0 10px', border: '1px solid #e5e7eb', borderRadius: 5, background: '#fff', fontSize: 11, cursor: 'pointer', color: '#374151' }}><i className="bi bi-download" /> Exportar</button>
                  <button style={{ height: 28, padding: '0 10px', border: '1px solid #e5e7eb', borderRadius: 5, background: '#fff', fontSize: 11, cursor: 'pointer', color: '#374151' }}><i className="bi bi-printer" /> Imprimir</button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%', tableLayout: 'fixed' }}>
                  <colgroup>
                    {shownCols.map(c => <col key={c.key} style={{ width: c.w }} />)}
                  </colgroup>
                  <thead>
                    <tr style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 }}>
                      {shownCols.map(c => (
                        <th key={c.key} style={{ padding: '9px 10px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#374151', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.length === 0 ? (
                      <tr><td colSpan={shownCols.length} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Nenhum registro encontrado.</td></tr>
                    ) : pageData.map((row, ri) => (
                      <tr key={row.id} style={{ background: ri % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                        onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 0 ? '#fff' : '#f9fafb'}
                      >
                        {shownCols.map(c => {
                          const val = (row as Record<string, unknown>)[c.key] as string;
                          if (c.key === 'situacaoVigencia') return <td key={c.key} style={{ padding: '7px 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 100, padding: '1px 8px', fontSize: 10, fontWeight: 600 }}>Vigente</span></td>;
                          if (c.key === 'situacaoRegistro') return <td key={c.key} style={{ padding: '7px 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><span style={{ background: val === 'Anotado' ? '#f0f4fb' : '#fff0f2', color: val === 'Anotado' ? '#374151' : '#c0182d', borderRadius: 4, padding: '1px 8px', fontSize: 10, fontWeight: 500 }}>{val}</span></td>;
                          if (c.key === 'respAdm' || c.key === 'respFinan') return <td key={c.key} style={{ padding: '7px 10px', textAlign: 'center' }}>{val === 'Sim' ? <span style={{ color: '#15803d', fontWeight: 700 }}>Sim</span> : <span style={{ color: '#9ca3af' }}>Não</span>}</td>;
                          return <td key={c.key} style={{ padding: '7px 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#374151' }}>{val}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ padding: '10px 14px', borderTop: '1px solid #f0f4fb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Linhas por página: <strong>50</strong></span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <PagBtn disabled={page === 1} onClick={() => setPage(1)}>«</PagBtn>
                  <PagBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</PagBtn>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p = page;
                    if (totalPages <= 5) p = 1;
                    else if (page <= 3) p = 1;
                    else if (page >= totalPages - 2) p = totalPages - 4;
                    else p = page - 2;
                    const n = p + i;
                    return <PagBtn key={n} active={n === page} onClick={() => setPage(n)}>{n}</PagBtn>;
                  })}
                  <PagBtn disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</PagBtn>
                  <PagBtn disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</PagBtn>
                </div>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Página {page} de {totalPages.toLocaleString('pt-BR')}</span>
              </div>
            </div>

          </div>
        </>
      )}

      {/* ── ÓRGÃOS TAB ──────────────────────────────────────────────────── */}
      {tab === 'orgaos' && <SimpleTab title="Órgãos" total={ALL_ORGAOS.length} icon="bi-bank2" data={ALL_ORGAOS as unknown as Record<string, unknown>[]} cols={[{ key: 'tipoOrgao', label: 'Tipo Órgão', w: 160 }, { key: 'abrangencia', label: 'Abrangência', w: 120 }, { key: 'uf', label: 'UF', w: 70 }, { key: 'municipio', label: 'Município', w: 160 }, { key: 'cnpj', label: 'CNPJ', w: 160 }, { key: 'inicioVigencia', label: 'Início Vigência', w: 130 }, { key: 'fimVigencia', label: 'Fim Vigência', w: 130 }, { key: 'situacaoVigencia', label: 'Situação', w: 110 }]} />}

      {/* ── FILIADOS TAB ────────────────────────────────────────────────── */}
      {tab === 'filiados' && <SimpleTab title="Filiados" total={ALL_FILIADOS.length} icon="bi-diagram-3-fill" data={ALL_FILIADOS as unknown as Record<string, unknown>[]} cols={[{ key: 'nomeFiliado', label: 'Nome', w: 260 }, { key: 'cpf', label: 'CPF', w: 120 }, { key: 'profissao', label: 'Profissão', w: 200 }, { key: 'situacao', label: 'Situação', w: 110 }, { key: 'dataFiliacao', label: 'Data Filiação', w: 130 }]} />}

      {/* ── MANDATÁRIOS TAB ─────────────────────────────────────────────── */}
      {tab === 'mandatarios' && <SimpleTab title="Mandatários" total={ALL_MANDATARIOS.length} icon="bi-people-fill" data={ALL_MANDATARIOS as unknown as Record<string, unknown>[]} cols={[{ key: 'nome', label: 'Nome', w: 260 }, { key: 'nomeUrna', label: 'Nome Urna', w: 160 }, { key: 'cargo', label: 'Cargo', w: 120 }, { key: 'uf', label: 'UF', w: 70 }, { key: 'municipio', label: 'Município', w: 180 }, { key: 'anoEleicao', label: 'Eleição', w: 80 }, { key: 'situacao', label: 'Situação', w: 140 }]} />}

      {/* ── EMPTY TABS ──────────────────────────────────────────────────── */}
      {(tab === 'usuarios' || tab === 'convenios' || tab === 'ondemand') && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '60px', textAlign: 'center' }}>
          <i className={`bi ${TABS.find(t => t.id === tab)?.icon}`} style={{ fontSize: 48, color: '#d1d5db', display: 'block', marginBottom: 16 }} />
          <div style={{ fontWeight: 700, fontSize: 16, color: '#374151', marginBottom: 8 }}>{TABS.find(t => t.id === tab)?.label}</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>Módulo em desenvolvimento.</div>
        </div>
      )}
    </div>
  );
}

/* ── Pagination button ───────────────────────────────────────────────────── */
function PagBtn({ children, onClick, disabled, active }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ minWidth: 30, height: 28, padding: '0 8px', border: `1px solid ${active ? '#00963F' : '#e5e7eb'}`, borderRadius: 5, background: active ? '#00963F' : '#fff', color: active ? '#fff' : disabled ? '#d1d5db' : '#374151', fontSize: 12, cursor: disabled ? 'default' : 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
      {children}
    </button>
  );
}

/* ── SimpleTab ───────────────────────────────────────────────────────────── */
function SimpleTab({ title, total, icon, data, cols }: {
  title: string; total: number; icon: string;
  data: Record<string, unknown>[];
  cols: { key: string; label: string; w: number }[];
}) {
  const [page, setPage] = useState(1);
  const SIZE = 50;
  const pageData = data.slice((page - 1) * SIZE, page * SIZE);
  const totalPages = Math.ceil(data.length / SIZE);

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f4fb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className={`bi ${icon}`} style={{ color: '#00963F', fontSize: 14 }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{title}</span>
          <span style={{ background: '#eff6ff', color: '#00963F', borderRadius: 100, padding: '1px 10px', fontSize: 11, fontWeight: 600 }}>{total.toLocaleString('pt-BR')}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ height: 28, padding: '0 10px', border: '1px solid #e5e7eb', borderRadius: 5, background: '#fff', fontSize: 11, cursor: 'pointer' }}><i className="bi bi-download" /> Exportar</button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%', tableLayout: 'fixed' }}>
          <colgroup>{cols.map(c => <col key={c.key} style={{ width: c.w }} />)}</colgroup>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {cols.map(c => <th key={c.key} style={{ padding: '9px 10px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#374151', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' }}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}
                onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 0 ? '#fff' : '#f9fafb'}
              >
                {cols.map(c => <td key={c.key} style={{ padding: '7px 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#374151' }}>{String(row[c.key] ?? '—')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '10px 16px', borderTop: '1px solid #f0f4fb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>Página {page} de {totalPages}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <PagBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</PagBtn>
          <PagBtn disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</PagBtn>
        </div>
      </div>
    </div>
  );
}
