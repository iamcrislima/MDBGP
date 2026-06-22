import React, { useState, useMemo } from 'react';
import type { NavigateFn, Orgao, Dirigente } from '../types';
import DataTable, { Column } from '../components/shared/DataTable';
import CustomSelect from '../components/shared/CustomSelect';
import { MOCK_ORGAOS, MOCK_DIRIGENTES } from '../data/mockData';
import Badge, { type BadgeVariant } from '../components/shared/Badge';
import Button from '../components/shared/Button';
import EmptyState from '../components/shared/EmptyState';
import ModalBase from '../components/shared/ModalBase';
import { useBreakpoint } from '../hooks/useBreakpoint';
import PageHeader from '../components/shared/PageHeader';
import SectionHeader from '../components/shared/SectionHeader';
import FilterPanel from '../components/shared/FilterPanel';

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

/* ── Badge helpers ───────────────────────────────────────────────────────── */
function tipoOrgaoVariant(value: string): BadgeVariant {
  const v = value.toLowerCase();
  return v.includes('definitiv') ? 'info' : v.includes('provis') ? 'warning' : 'neutral';
}

function vigenciaDarkVariant(value: string): BadgeVariant {
  const v = (value ?? '').toLowerCase();
  return v === 'vigente' ? 'vigente' : v.includes('suspenso') ? 'warning' : 'neutral';
}

function getSituacaoOrgaoBadge(situacoes: string): React.ReactElement {
  const l = situacoes.toLowerCase();
  if (l.includes('suspenso')) return <Badge variant="warning" label="Suspenso" />;
  if (l.includes('restabelecido')) return <Badge variant="info" label="Restabelecido" />;
  return <Badge variant="success" label="Anotado" />;
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
    <ModalBase open={true} onClose={onClose} width={860}>
      <ModalBase.NavyHeader onClose={onClose} closeAlign="flex-start">
        <div style={{ width: 42, height: 42, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className="bi bi-bank2" style={{ color: 'var(--color-primary)', fontSize: 18 }} />
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{orgaoNome(item)}</div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="bi bi-calendar3" style={{ fontSize: 12 }} />
              {item.inicioVigencia} – {item.fimVigencia}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>· CNPJ: {item.cnpj}</span>
            <Badge variant={vigenciaDarkVariant(item.situacaoVigencia)} label={item.situacaoVigencia} context="dark" />
          </div>
        </div>
      </ModalBase.NavyHeader>

      <ModalBase.Body>

          {/* Dados do órgão */}
          <div style={{ marginBottom: 22 }}>
            <SectionHeader icon="bi-bank2" title="Dados do órgão" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 24px' }}>
              {([
                ['Tipo', null],
                ['CNPJ', item.cnpj],
                ['Abrangência', item.abrangencia],
                ['Status', null],
              ] as [string, string | null][]).map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
                  {label === 'Tipo' && <Badge variant={tipoOrgaoVariant(item.tipoOrgao)} label={item.tipoOrgao} />}
                  {label === 'Status' && getSituacaoOrgaoBadge(item.situacoes)}
                  {value !== null && <div style={{ fontSize: 13, color: 'var(--color-text-dark)', fontWeight: 500 }}>{value}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Localização */}
          <div style={{ marginBottom: 22 }}>
            <SectionHeader icon="bi-geo-alt-fill" title="Localização" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 24px' }}>
              {[['UF', item.uf], ['Município', item.municipio || '(Estadual)'], ['Bairro', item.bairro || '—'], ['Endereço', item.endereco || '—'], ['Número', item.numero || '—'], ['CEP', item.cep || '—']].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 13, color: v === '—' ? 'var(--color-border-input)' : 'var(--color-text-dark)', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contato */}
          <div style={{ marginBottom: 22 }}>
            <SectionHeader icon="bi-telephone-fill" title="Contato" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 24px' }}>
              {[['Celular', item.celular], ['E-mail', item.email || '—']].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 13, color: v === '—' ? 'var(--color-border-input)' : 'var(--color-text-dark)', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dirigentes */}
          <div>
            <SectionHeader icon="bi-person-badge-fill" title="Dirigentes" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {['Cargo', 'Dirigente', 'Título de Eleitor', 'Responsável', 'Exercício'].map(h => (
                    <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#fafafa' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dirigentes.length === 0
                  ? <tr><td colSpan={5}><EmptyState title="Nenhum dirigente encontrado para esta UF" size="sm" /></td></tr>
                  : dirigentes.map((d: Dirigente) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--color-bg-page)' }}>
                      <td style={{ padding: '8px 10px', maxWidth: 160 }}>
                        <span title={d.cargoDirigente} style={{ fontSize: 12, color: 'var(--color-text-dark)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 155 }}>{d.cargoDirigente}</span>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--color-text-primary)' }}>{d.nomeDirigente}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: 1 }}>{maskCpf(d.cpfDirigente)}</div>
                      </td>
                      <td style={{ padding: '8px 10px', color: 'var(--color-text-secondary)', fontFamily: 'monospace', fontSize: 11 }}>{d.tituloEleitor ?? '—'}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ display: 'inline-flex', gap: 4 }}>
                          <Badge variant={d.respAdm === 'Sim' ? 'info' : 'neutral'} label="Adm" size="sm" />
                          <Badge variant={d.respFinan === 'Sim' ? 'info' : 'neutral'} label="Fin" size="sm" />
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', fontSize: 11 }}>
                        {d.dataInicioExercicio}<br />{d.dataFimExercicio}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
      </ModalBase.Body>
    </ModalBase>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
const lb: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 };
const inp: React.CSSProperties = { border: '1px solid var(--color-border-input)', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff', width: '100%', fontFamily: 'Open Sans, sans-serif', color: 'var(--color-text-dark)', height: 38, boxSizing: 'border-box' };

export default function OrgaoPage({ onNavigate: _onNavigate }: { onNavigate: NavigateFn }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [filters, setFilters]      = useState({ ...EMPTY_F });
  const [filterOpen, setFilterOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
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
    { key: 'tipoOrgao', label: 'Tipo', render: r => <Badge variant={tipoOrgaoVariant(r.tipoOrgao)} label={r.tipoOrgao} /> },
    { key: 'uf', label: 'UF', width: 55 },
    { key: 'municipio', label: 'Município' },
    { key: 'vigencia', label: 'Vigência', render: r => <span style={{ fontSize: 12, color: 'var(--color-text-dark)', whiteSpace: 'nowrap' }}>{r.inicioVigencia} – {r.fimVigencia}</span> },
    { key: 'situacaoVigencia', label: 'Situação', render: r => <Badge variant={r.situacaoVigencia === 'Vigente' ? 'vigente' : 'encerrado'} label={r.situacaoVigencia} /> },
    { key: 'cnpj', label: 'CNPJ', width: 155 },
    { key: 'abrangencia', label: 'Abrangência' },
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
        title="Consultar Órgãos Partidários"
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
        {/* Linha 1: Tipo | UF | Município | CNPJ | Situação vigência | Abrangência */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr 1fr' : 'repeat(6, 1fr)', gap: 14 }}>
          <div><label style={lb}>Tipo de órgão</label><CustomSelect value={filters.tipo} onChange={set('tipo')} options={TIPO_OPTS} placeholder="Todos" /></div>
          <div><label style={lb}>UF</label><CustomSelect value={filters.uf} onChange={v => { setFilters(p => ({ ...p, uf: v, municipio: '' })); setPage(1); }} options={UF_OPTS} placeholder="Todas" /></div>
          <div><label style={lb}>Município</label><CustomSelect value={filters.municipio} onChange={set('municipio')} options={MUN_BY_UF[filters.uf] ?? []} placeholder="Todos" disabled={!filters.uf} /></div>
          <div><label style={lb}>CNPJ</label><input style={inp} placeholder="Pesquisar CNPJ" value={filters.cnpj} onChange={e => { setFilters(p => ({ ...p, cnpj: e.target.value })); setPage(1); }} onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')} onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} /></div>
          <div><label style={lb}>Situação vigência</label><CustomSelect value={filters.situacao} onChange={set('situacao')} options={SITUACAO_VIG_OPTS} placeholder="Todas" /></div>
          <div><label style={lb}>Abrangência</label><CustomSelect value={filters.abrangencia} onChange={set('abrangencia')} options={ABRANGENCIA_OPTS} placeholder="Todas" /></div>
        </div>
      </FilterPanel>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, padding: '20px 22px' }}>
        <DataTable<Orgao>
          columns={cols}
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
                  <Badge variant={tipoOrgaoVariant(r.tipoOrgao)} label={r.tipoOrgao} />
                  <Badge variant={r.situacaoVigencia === 'Vigente' ? 'vigente' : 'encerrado'} label={r.situacaoVigencia} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)', marginBottom: 4 }}>{orgaoNome(r)}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>{r.abrangencia}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'monospace', marginBottom: 8 }}>{r.cnpj}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="primary" size="sm" onClick={() => setSelected(r)} icon="bi-eye">Ver</Button>
                </div>
              </div>
            );
          }}
        />
      </div>

      {selected && <OrgaoModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
