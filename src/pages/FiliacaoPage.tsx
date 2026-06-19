import React, { useState, useMemo } from 'react';
import type { NavigateFn, Filiado, Mandatario } from '../types';
import DataTable, { Column } from '../components/shared/DataTable';
import CustomSelect from '../components/shared/CustomSelect';
import PessoaDetalheModal from '../components/shared/PessoaDetalheModal';
import { MOCK_FILIADOS, MOCK_MANDATARIOS } from '../data/mockData';
import { useBreakpoint } from '../hooks/useBreakpoint';

const ALL_DATA: Filiado[] = Array.from({ length: 1444 }, (_, i) => ({
  ...MOCK_FILIADOS[i % MOCK_FILIADOS.length],
  id: i + 1,
}));

const SITUACAO_OPTS   = ['Regular', 'Excluído', 'Transferido'].map(v => ({ value: v, label: v }));
const SEXO_OPTS       = ['Masculino', 'Feminino'].map(v => ({ value: v, label: v }));
const RACA_OPTS       = ['Branca', 'Parda', 'Preta', 'Amarela', 'Indígena'].map(v => ({ value: v, label: v }));
const MAND_ATUAL_OPTS = ['Sim', 'Não'].map(v => ({ value: v, label: v }));
const UF_OPTS         = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(v => ({ value: v, label: v }));
const CARGO_OPTS      = ['Membro Titular', 'Presidente Municipal', 'Secretário Municipal', 'Tesoureiro Municipal', 'Delegado', 'Suplente'].map(v => ({ value: v, label: v }));
const MANDATARIO_OPTS = MOCK_MANDATARIOS.map(m => ({ value: m.nome, label: m.nome }));

const MUN_BY_UF = (() => {
  const m: Record<string, Set<string>> = {};
  ALL_DATA.forEach(d => { if (d.uf && d.municipio) (m[d.uf] = m[d.uf] || new Set()).add(d.municipio); });
  const res: Record<string, { value: string; label: string }[]> = {};
  Object.entries(m).forEach(([uf, muns]) => { res[uf] = [...muns].sort().map(v => ({ value: v, label: v })); });
  return res;
})();

const MUN_POPULATION: Record<string, number> = {
  'PI:Passagem Franca Do Piauí': 5413, 'PI:Aroazes': 3012, 'AM:Juruá': 9234,
  'RS:Vitória Das Missões': 4118, 'RS:Cândido Godói': 7891, 'MG:Dores De Campos': 8340,
  'RS:Barracão': 10023, 'AL:Porto Calvo': 25116, 'BA:Boa Nova': 14789,
  'ES:Irupi': 11234, 'BA:Igrapiúna': 19876, 'PA:Santarém': 320455,
};

const EMPTY_F = {
  nome: '', nomeUrna: '', cpf: '',
  mandatario: '', situacao: '',
  cargo: '', sexo: '', raca: '', uf: '', municipio: '',
  idadeMin: '', idadeMax: '',
  popMin: '', popMax: '',
};

function SituacaoBadge({ value }: { value: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Regular:     { bg: '#dcfce7', color: '#15803d' },
    Excluído:    { bg: '#fee2e2', color: '#dc2626' },
    Transferido: { bg: '#f3e8ff', color: '#7e22ce' },
  };
  const s = map[value] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return <span style={{ ...s, borderRadius: 100, padding: '2px 10px', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>{value}</span>;
}

function MandatarioBadge({ value }: { value?: string }) {
  if (!value) return <span style={{ color: '#d1d5db', fontSize: 14 }}>—</span>;
  const yes = value === 'Sim';
  return <span style={{ background: yes ? '#E8F5E9' : '#f3f4f6', color: yes ? '#007A32' : '#6b7280', borderRadius: 100, padding: '2px 10px', fontWeight: 600, fontSize: 11 }}>{value}</span>;
}

function toMandatario(f: Filiado): Mandatario {
  return {
    id: f.id,
    nome: f.nomeFiliado,
    nomeUrna: f.nomeUrna ?? f.nomeFiliado,
    cargo: f.cargoPartido ?? 'Filiado',
    anoEleicao: 0,
    situacao: f.situacao,
    uf: f.uf ?? '',
    municipio: f.municipio ?? '',
    eleito: 'Não',
    totalVotos: 0,
    cpf: f.cpf,
    idade: f.idade,
    sexo: f.sexo,
    raca: f.raca,
    profissao: f.profissao,
    dataFiliacao: f.dataFiliacao,
    situacaoFiliacao: f.situacao,
  };
}

const lb: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 };
const inp: React.CSSProperties = { border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff', width: '100%', fontFamily: 'Open Sans, sans-serif', color: '#374151', height: 38, boxSizing: 'border-box' };

export default function FiliacaoPage({ onNavigate: _onNavigate }: { onNavigate: NavigateFn }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [filters, setFilters]      = useState({ ...EMPTY_F });
  const [filterOpen, setFilterOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [page, setPage]            = useState(1);
  const [pageSize, setPageSize]    = useState(10);
  const [selected, setSelected]    = useState<Filiado | null>(null);

  const filtered = useMemo(() => ALL_DATA.filter(f => {
    if (filters.nome      && !f.nomeFiliado.toLowerCase().includes(filters.nome.toLowerCase())) return false;
    if (filters.nomeUrna  && !(f.nomeUrna ?? '').toLowerCase().includes(filters.nomeUrna.toLowerCase())) return false;
    if (filters.cpf       && !f.cpf.includes(filters.cpf)) return false;
    if (filters.mandatario && f.mandatarioAtual !== filters.mandatario) return false;
    if (filters.situacao  && f.situacao !== filters.situacao) return false;
    if (filters.cargo     && f.cargoPartido !== filters.cargo) return false;
    if (filters.sexo      && f.sexo !== filters.sexo) return false;
    if (filters.raca      && f.raca !== filters.raca) return false;
    if (filters.uf        && f.uf !== filters.uf) return false;
    if (filters.municipio && f.municipio !== filters.municipio) return false;
    if (filters.idadeMin  && (!f.idade || f.idade < Number(filters.idadeMin))) return false;
    if (filters.idadeMax  && (!f.idade || f.idade > Number(filters.idadeMax))) return false;
    if (filters.popMin || filters.popMax) {
      const pop = MUN_POPULATION[`${f.uf}:${f.municipio}`] ?? 0;
      if (filters.popMin && pop < Number(filters.popMin)) return false;
      if (filters.popMax && pop > Number(filters.popMax)) return false;
    }
    return true;
  }), [filters]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const set = (k: keyof typeof EMPTY_F) => (v: string) => { setFilters(p => ({ ...p, [k]: v })); setPage(1); };

  const columns: Column<Filiado>[] = [
    { key: 'nomeFiliado', label: 'Nome filiado' },
    { key: 'cpf', label: 'CPF', width: 130 },
    { key: 'situacao', label: 'Situação', render: r => <SituacaoBadge value={r.situacao} /> },
    { key: 'mandatarioAtual', label: 'Mandatário?', width: 110, render: r => <MandatarioBadge value={r.mandatarioAtual} /> },
    { key: 'uf', label: 'UF', width: 55 },
    { key: 'municipio', label: 'Município' },
    { key: 'dataFiliacao', label: 'Data filiação', width: 120 },
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
          <h1 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: '#111827', margin: 0 }}>Consultar Filiados</h1>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
            <span style={{ color: '#00963F', fontWeight: 600 }}>{filtered.length.toLocaleString('pt-BR')}</span> registros encontrados
          </div>
        </div>
        <button onClick={() => setFilterOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#374151', fontFamily: 'Open Sans, sans-serif' }}>
          <i className={`bi bi-funnel${filterOpen ? '-fill' : ''}`} style={{ color: filterOpen ? '#00963F' : '#6b7280' }} /> Filtros
        </button>
      </div>

      {filterOpen && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px', marginBottom: 20 }}>

          {/* Linha 1: Nome | Nome na urna | CPF | Mandatário atual? | Situação */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lb}>Nome do filiado</label>
              <input style={inp} placeholder="Nome completo" value={filters.nome}
                onChange={e => { setFilters(p => ({ ...p, nome: e.target.value })); setPage(1); }}
                onFocus={e => (e.target.style.borderColor = '#00963F')}
                onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
            </div>
            <div>
              <label style={lb}>Nome na urna</label>
              <input style={inp} placeholder="Nome de urna" value={filters.nomeUrna}
                onChange={e => { setFilters(p => ({ ...p, nomeUrna: e.target.value })); setPage(1); }}
                onFocus={e => (e.target.style.borderColor = '#00963F')}
                onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
            </div>
            <div>
              <label style={lb}>CPF</label>
              <input style={inp} placeholder="Pesquisar CPF" value={filters.cpf}
                onChange={e => { setFilters(p => ({ ...p, cpf: e.target.value })); setPage(1); }}
                onFocus={e => (e.target.style.borderColor = '#00963F')}
                onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
            </div>
            <div>
              <label style={lb}>Mandatário atual?</label>
              <CustomSelect value={filters.mandatario} onChange={set('mandatario')} options={MAND_ATUAL_OPTS} placeholder="Todos" />
            </div>
            <div>
              <label style={lb}>Situação</label>
              <CustomSelect value={filters.situacao} onChange={set('situacao')} options={SITUACAO_OPTS} placeholder="Todas" />
            </div>
          </div>

          {/* Linha 2: Cargo | Sexo | Raça | UF | Município */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lb}>Cargo no partido</label>
              <CustomSelect value={filters.cargo} onChange={set('cargo')} options={CARGO_OPTS} placeholder="Todos" />
            </div>
            <div>
              <label style={lb}>Sexo</label>
              <CustomSelect value={filters.sexo} onChange={set('sexo')} options={SEXO_OPTS} placeholder="Todos" />
            </div>
            <div>
              <label style={lb}>Raça / Cor</label>
              <CustomSelect value={filters.raca} onChange={set('raca')} options={RACA_OPTS} placeholder="Todos" />
            </div>
            <div>
              <label style={lb}>UF</label>
              <CustomSelect value={filters.uf} onChange={v => { setFilters(p => ({ ...p, uf: v, municipio: '' })); setPage(1); }} options={UF_OPTS} placeholder="Todas" />
            </div>
            <div>
              <label style={lb}>Município</label>
              <CustomSelect value={filters.municipio} onChange={set('municipio')} options={MUN_BY_UF[filters.uf] ?? []} placeholder="Todos" disabled={!filters.uf} />
            </div>
          </div>

          {/* Linha 3: Idade range | Pop. município range */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
            <div>
              <label style={lb}>Idade</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input style={{ ...inp, flex: 1, minWidth: 0 }} type="number" min="0" placeholder="De" value={filters.idadeMin}
                  onChange={e => { setFilters(p => ({ ...p, idadeMin: e.target.value })); setPage(1); }}
                  onFocus={e => (e.target.style.borderColor = '#00963F')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                <span style={{ color: '#9ca3af', fontSize: 12, flexShrink: 0 }}>–</span>
                <input style={{ ...inp, flex: 1, minWidth: 0 }} type="number" min="0" placeholder="Até" value={filters.idadeMax}
                  onChange={e => { setFilters(p => ({ ...p, idadeMax: e.target.value })); setPage(1); }}
                  onFocus={e => (e.target.style.borderColor = '#00963F')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
              </div>
            </div>
            <div>
              <label style={lb}>Pop. município</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input style={{ ...inp, flex: 1, minWidth: 0 }} type="number" min="0" placeholder="De" value={filters.popMin}
                  onChange={e => { setFilters(p => ({ ...p, popMin: e.target.value })); setPage(1); }}
                  onFocus={e => (e.target.style.borderColor = '#00963F')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                <span style={{ color: '#9ca3af', fontSize: 12, flexShrink: 0 }}>–</span>
                <input style={{ ...inp, flex: 1, minWidth: 0 }} type="number" min="0" placeholder="Até" value={filters.popMax}
                  onChange={e => { setFilters(p => ({ ...p, popMax: e.target.value })); setPage(1); }}
                  onFocus={e => (e.target.style.borderColor = '#00963F')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => { /* TODO: exportar */ }}
              style={{ padding: '7px 16px', border: '1px solid #d1d5db', borderRadius: 7, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="bi bi-download" /> Exportar
            </button>
            <button onClick={() => { setFilters({ ...EMPTY_F }); setPage(1); }}
              style={{ padding: '7px 16px', border: '1px solid #d1d5db', borderRadius: 7, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#6b7280', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="bi bi-x-circle" /> Nova pesquisa
            </button>
            <button onClick={() => setFilterOpen(false)}
              style={{ padding: '7px 18px', border: 'none', borderRadius: 7, background: '#00963F', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="bi bi-funnel-fill" /> Filtrar
            </button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px' }}>
        <DataTable
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          data={pageData as unknown as Record<string, unknown>[]}
          totalRecords={filtered.length}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={s => { setPageSize(s); setPage(1); }}
          emptyMessage="Nenhum filiado encontrado."
          mobileCard={(row) => {
            const r = row as unknown as Filiado;
            return (
              <div style={{ background: '#fff', border: '1px solid #dde3ee', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', flex: 1, marginRight: 8 }}>{r.nomeFiliado}</div>
                  <SituacaoBadge value={r.situacao} />
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2, fontFamily: 'monospace' }}>{r.cpf}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{r.uf ?? '—'} · {r.municipio ?? '—'}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Filiação: {r.dataFiliacao ?? '—'}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelected(r)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#00963F', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'Open Sans, sans-serif', minHeight: 36 }}>
                    <i className="bi bi-eye" style={{ fontSize: 11 }} /> Ver
                  </button>
                </div>
              </div>
            );
          }}
        />
      </div>

      {selected && <PessoaDetalheModal item={toMandatario(selected)} onClose={() => setSelected(null)} />}
    </div>
  );
}
