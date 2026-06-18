import React, { useState, useMemo } from 'react';
import type { NavigateFn, Orgao, Dirigente } from '../types';
import DataTable, { Column } from '../components/shared/DataTable';
import CustomSelect from '../components/shared/CustomSelect';
import { MOCK_ORGAOS, MOCK_DIRIGENTES } from '../data/mockData';

const ALL_DATA: Orgao[] = Array.from({ length: 311 }, (_, i) => ({ ...MOCK_ORGAOS[i % MOCK_ORGAOS.length], id: i + 1 }));
const ALL_DIRIGENTES: Dirigente[] = Array.from({ length: 11232 }, (_, i) => ({ ...MOCK_DIRIGENTES[i % MOCK_DIRIGENTES.length], id: i + 1 }));

const UF_OPTS           = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(v => ({ value: v, label: v }));
const SITUACAO_VIG_OPTS = ['Vigente', 'Encerrado'].map(v => ({ value: v, label: v }));
const ABRANGENCIA_OPTS  = ['Municipal', 'Estadual', 'Nacional'].map(v => ({ value: v, label: v }));
const TIPO_OPTS         = ['Órgão definitivo', 'Órgão provisório', 'Órgão interventor'].map(v => ({ value: v, label: v }));

const MUN_BY_UF = (() => {
  const m: Record<string, Set<string>> = {};
  ALL_DATA.forEach(d => { if (d.municipio) (m[d.uf] = m[d.uf] || new Set()).add(d.municipio); });
  const res: Record<string, { value: string; label: string }[]> = {};
  Object.entries(m).forEach(([uf, muns]) => { res[uf] = [...muns].sort().map(v => ({ value: v, label: v })); });
  return res;
})();

const EMPTY_F = { uf: '', municipio: '', cnpj: '', situacao: '', abrangencia: '', tipo: '' };

/* ── Badges ─────────────────────────────────────────────────────────────── */
function VigenciaBadge({ value }: { value: string }) {
  const s = value === 'Vigente' ? { bg: '#dcfce7', color: '#15803d' } : { bg: '#f3f4f6', color: '#6b7280' };
  return <span style={{ ...s, borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{value}</span>;
}

function TipoOrgaoBadge({ value }: { value: string }) {
  const v = (value ?? '').toLowerCase();
  const s = v.includes('definitiv') ? { bg: '#dbeafe', color: '#1d4ed8' }
    : v.includes('provis') ? { bg: '#fef9c3', color: '#a16207' }
    : { bg: '#f3f4f6', color: '#6b7280' };
  return <span style={{ ...s, borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{value}</span>;
}

function SituacaoOrgaoBadge({ situacoes }: { situacoes: string }) {
  const low = situacoes.toLowerCase();
  if (low.includes('suspenso')) return <span style={{ background: '#fef3c7', color: '#d97706', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>Suspenso</span>;
  if (low.includes('restabelecido')) return <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>Restabelecido</span>;
  return <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>Anotado</span>;
}

function RespBadge({ label, value }: { label: string; value: string | undefined }) {
  const sim = value === 'Sim';
  return (
    <span style={{ background: sim ? '#dbeafe' : '#f3f4f6', color: sim ? '#1d4ed8' : '#9ca3af', borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 600, marginRight: 4, display: 'inline-block' }}>
      {label}
    </span>
  );
}

function maskCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})\.\d{3}\.\d{3}(-\d{2})$/, '$1.***.***$2');
}

function orgaoNome(o: Orgao): string {
  const tipo = (o.tipoOrgao ?? '').toLowerCase().includes('provis') ? 'Comissão' : 'Diretório';
  if (!o.municipio || o.abrangencia === 'Estadual') return `${tipo} Estadual — ${o.uf}`;
  if (o.abrangencia === 'Nacional') return `${tipo} Nacional`;
  return `${tipo} Municipal — ${o.municipio}/${o.uf}`;
}

/* ── Modal ──────────────────────────────────────────────────────────────── */
function OrgaoModal({ item, onClose }: { item: Orgao; onClose: () => void }) {
  const dirigentes = ALL_DIRIGENTES.filter(d => d.ufOrgao === item.uf).slice(0, 6);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 1060 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: 12, width: 860, maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh', overflow: 'hidden', zIndex: 1070, boxShadow: '0 24px 64px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>

        {/* Header fixo */}
        <div style={{ background: '#12121f', padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bi bi-bank2" style={{ color: '#2563eb', fontSize: 18 }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{orgaoNome(item)}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>{item.tipoOrgao} · CNPJ: {item.cnpj}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 24, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {/* Body scrollável */}
        <div style={{ overflowY: 'auto', padding: '22px 24px 28px', flex: 1 }}>

          {/* Dados do órgão */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f0f4fb' }}>
              <div style={{ width: 28, height: 28, background: '#eff6ff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-bank2" style={{ color: '#2563eb', fontSize: 13 }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Dados do órgão</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 24px' }}>
              {([
                ['Tipo', null],
                ['CNPJ', item.cnpj],
                ['Abrangência', item.abrangencia],
                ['Situação vigência', null],
                ['Status', null],
                ['Início vigência', item.inicioVigencia],
                ['Fim vigência', item.fimVigencia],
              ] as [string, string | null][]).map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
                  {label === 'Tipo' && <TipoOrgaoBadge value={item.tipoOrgao} />}
                  {label === 'Situação vigência' && <VigenciaBadge value={item.situacaoVigencia} />}
                  {label === 'Status' && <SituacaoOrgaoBadge situacoes={item.situacoes} />}
                  {value !== null && <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{value}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Localização */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f0f4fb' }}>
              <div style={{ width: 28, height: 28, background: '#eff6ff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-geo-alt-fill" style={{ color: '#2563eb', fontSize: 13 }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Localização</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 24px' }}>
              {[['UF', item.uf], ['Município', item.municipio || '(Estadual)'], ['Bairro', item.bairro || '—'], ['Endereço', item.endereco || '—'], ['Número', item.numero || '—'], ['CEP', item.cep || '—']].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 13, color: v === '—' ? '#d1d5db' : '#374151', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contato */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f0f4fb' }}>
              <div style={{ width: 28, height: 28, background: '#eff6ff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-telephone-fill" style={{ color: '#2563eb', fontSize: 13 }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Contato</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 24px' }}>
              {[['Celular', item.celular], ['E-mail', item.email || '—']].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 13, color: v === '—' ? '#d1d5db' : '#374151', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dirigentes */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f0f4fb' }}>
              <div style={{ width: 28, height: 28, background: '#eff6ff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-person-badge-fill" style={{ color: '#2563eb', fontSize: 13 }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Dirigentes</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {['Cargo', 'Dirigente', 'Título de Eleitor', 'Responsável', 'Exercício'].map(h => (
                    <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#fafafa' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dirigentes.length === 0
                  ? <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>Nenhum dirigente encontrado para esta UF</td></tr>
                  : dirigentes.map((d: Dirigente) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 10px', maxWidth: 160 }}>
                        <span title={d.cargoDirigente} style={{ fontSize: 12, color: '#374151', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 155 }}>{d.cargoDirigente}</span>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ fontWeight: 600, fontSize: 12, color: '#111827' }}>{d.nomeDirigente}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace', marginTop: 1 }}>{maskCpf(d.cpfDirigente)}</div>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#6b7280', fontFamily: 'monospace', fontSize: 11 }}>{d.tituloEleitor ?? '—'}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <RespBadge label="Adm" value={d.respAdm} />
                        <RespBadge label="Fin" value={d.respFinan} />
                      </td>
                      <td style={{ padding: '8px 10px', color: '#6b7280', whiteSpace: 'nowrap', fontSize: 11 }}>
                        {d.dataInicioExercicio}<br />{d.dataFimExercicio}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
const lb: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 };
const inp: React.CSSProperties = { border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff', width: '100%', fontFamily: 'Open Sans, sans-serif', color: '#374151', height: 38, boxSizing: 'border-box' };

export default function OrgaoPage({ onNavigate: _onNavigate }: { onNavigate: NavigateFn }) {
  const [filters, setFilters]      = useState({ ...EMPTY_F });
  const [filterOpen, setFilterOpen] = useState(true);
  const [page, setPage]            = useState(1);
  const [pageSize, setPageSize]    = useState(10);
  const [selected, setSelected]    = useState<Orgao | null>(null);

  const filtered = useMemo(() => ALL_DATA.filter(o => {
    if (filters.uf        && o.uf !== filters.uf) return false;
    if (filters.municipio && o.municipio !== filters.municipio) return false;
    if (filters.cnpj      && !o.cnpj.includes(filters.cnpj)) return false;
    if (filters.situacao  && o.situacaoVigencia !== filters.situacao) return false;
    if (filters.abrangencia && o.abrangencia !== filters.abrangencia) return false;
    if (filters.tipo      && o.tipoOrgao !== filters.tipo) return false;
    return true;
  }), [filters]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const set = (k: keyof typeof EMPTY_F) => (v: string) => { setFilters(p => ({ ...p, [k]: v })); setPage(1); };

  const cols: Column<Orgao>[] = [
    { key: 'tipoOrgao', label: 'Tipo', render: r => <TipoOrgaoBadge value={r.tipoOrgao} /> },
    { key: 'uf', label: 'UF', width: 55 },
    { key: 'municipio', label: 'Município' },
    { key: 'vigencia', label: 'Vigência', render: r => <span style={{ fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>{r.inicioVigencia} – {r.fimVigencia}</span> },
    { key: 'situacaoVigencia', label: 'Situação', render: r => <VigenciaBadge value={r.situacaoVigencia} /> },
    { key: 'cnpj', label: 'CNPJ', width: 155 },
    { key: 'abrangencia', label: 'Abrangência' },
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
    <div style={{ padding: '24px 28px', fontFamily: 'Open Sans, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Consultar Órgãos Partidários</h1>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}><span style={{ color: '#2563eb', fontWeight: 600 }}>{filtered.length.toLocaleString('pt-BR')}</span> registros encontrados</div>
        </div>
        <button onClick={() => setFilterOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#374151', fontFamily: 'Open Sans, sans-serif' }}>
          <i className={`bi bi-funnel${filterOpen ? '-fill' : ''}`} style={{ color: filterOpen ? '#2563eb' : '#6b7280' }} /> Filtros
        </button>
      </div>

      {filterOpen && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px', marginBottom: 20 }}>
          {/* Linha 1: Tipo | UF | Município | CNPJ | Situação vigência | Abrangência */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 14 }}>
            <div><label style={lb}>Tipo de órgão</label><CustomSelect value={filters.tipo} onChange={set('tipo')} options={TIPO_OPTS} placeholder="Todos" /></div>
            <div><label style={lb}>UF</label><CustomSelect value={filters.uf} onChange={v => { setFilters(p => ({ ...p, uf: v, municipio: '' })); setPage(1); }} options={UF_OPTS} placeholder="Todas" /></div>
            <div><label style={lb}>Município</label><CustomSelect value={filters.municipio} onChange={set('municipio')} options={MUN_BY_UF[filters.uf] ?? []} placeholder="Todos" disabled={!filters.uf} /></div>
            <div><label style={lb}>CNPJ</label><input style={inp} placeholder="Pesquisar CNPJ" value={filters.cnpj} onChange={e => { setFilters(p => ({ ...p, cnpj: e.target.value })); setPage(1); }} onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} /></div>
            <div><label style={lb}>Situação vigência</label><CustomSelect value={filters.situacao} onChange={set('situacao')} options={SITUACAO_VIG_OPTS} placeholder="Todas" /></div>
            <div><label style={lb}>Abrangência</label><CustomSelect value={filters.abrangencia} onChange={set('abrangencia')} options={ABRANGENCIA_OPTS} placeholder="Todas" /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => { setFilters({ ...EMPTY_F }); setPage(1); }} style={{ padding: '7px 16px', border: '1px solid #d1d5db', borderRadius: 7, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#6b7280', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="bi bi-x-circle" /> Nova pesquisa
            </button>
            <button onClick={() => setFilterOpen(false)} style={{ padding: '7px 18px', border: 'none', borderRadius: 7, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="bi bi-funnel-fill" /> Filtrar
            </button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px' }}>
        <DataTable columns={cols as unknown as Column<Record<string, unknown>>[]} data={pageData as unknown as Record<string, unknown>[]} totalRecords={filtered.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />
      </div>

      {selected && <OrgaoModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
