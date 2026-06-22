import React, { useState, useMemo } from 'react';
import type { NavigateFn, Filiado, Mandatario } from '../types';
import DataTable, { Column } from '../components/shared/DataTable';
import CustomSelect from '../components/shared/CustomSelect';
import PessoaDetalheModal from '../components/shared/PessoaDetalheModal';
import { MOCK_FILIADOS, MOCK_MANDATARIOS } from '../data/mockData';
import { useBreakpoint } from '../hooks/useBreakpoint';
import Badge, { type BadgeVariant } from '../components/shared/Badge';
import Button from '../components/shared/Button';
import Avatar from '../components/shared/Avatar';
import PageHeader from '../components/shared/PageHeader';
import FilterPanel from '../components/shared/FilterPanel';

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

const FEMALE_NAMES = ['ana','maria','francisca','adriana','fernanda','patricia','juliana','amanda','camila','beatriz','mariana','carla','luciana','daniela','roberta','angela','cristina','claudia','sandra','eliane','tereza','lucia','rosa','silvana','simone','fabiana','vanessa','leticia','bruna','natalia'];

function getPhotoUrl(cpf: string, nome: string): string {
  const digits = cpf.replace(/\D/g, '');
  const photoId = parseInt(digits.slice(-2) || '0') % 100;
  const first = nome.split(' ')[0]?.toLowerCase() ?? '';
  const gender = FEMALE_NAMES.some(n => first.startsWith(n)) ? 'women' : 'men';
  return `https://randomuser.me/api/portraits/${gender}/${photoId}.jpg`;
}

function PersonPhotoSmall({ cpf, nome }: { cpf: string; nome: string }) {
  const [err, setErr] = React.useState(false);
  if (err) {
    return <Avatar nome={nome} size={32} palette="green" />;
  }
  return (
    <img
      src={getPhotoUrl(cpf, nome)}
      alt={nome}
      onError={() => setErr(true)}
      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--color-border)' }}
    />
  );
}

function situacaoFiliadoVariant(value: string): BadgeVariant {
  if (value === 'Regular') return 'success';
  if (value === 'Excluído') return 'error';
  if (value === 'Transferido') return 'transferido';
  return 'neutral';
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

const lb: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 };
const inp: React.CSSProperties = { border: '1px solid var(--color-border-input)', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff', width: '100%', fontFamily: 'Open Sans, sans-serif', color: 'var(--color-text-dark)', height: 38, boxSizing: 'border-box' };

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
    {
      key: 'nomeFiliado', label: 'Nome filiado',
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PersonPhotoSmall cpf={r.cpf} nome={r.nomeFiliado} />
          <span style={{ fontWeight: 500 }}>{r.nomeFiliado}</span>
        </div>
      ),
    },
    { key: 'cpf', label: 'CPF', width: 130 },
    { key: 'situacao', label: 'Situação', render: r => <Badge variant={situacaoFiliadoVariant(r.situacao)} label={r.situacao} /> },
    { key: 'mandatarioAtual', label: 'Mandatário?', width: 110, render: r => r.mandatarioAtual ? <Badge variant={r.mandatarioAtual === 'Sim' ? 'success' : 'neutral'} label={r.mandatarioAtual} /> : <span style={{ color: 'var(--color-border-input)', fontSize: 14 }}>—</span> },
    { key: 'uf', label: 'UF', width: 55 },
    { key: 'municipio', label: 'Município' },
    { key: 'dataFiliacao', label: 'Data filiação', width: 120 },
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
        title="Consultar Filiados"
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
        action={<Button variant="ghost" onClick={() => { /* TODO: exportar */ }} icon="bi-download">Exportar</Button>}
      >
        {/* Linha 1: Nome | Nome na urna | CPF | Mandatário atual? | Situação */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lb}>Nome do filiado</label>
            <input style={inp} placeholder="Nome completo" value={filters.nome}
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
          <div>
            <label style={lb}>CPF</label>
            <input style={inp} placeholder="Pesquisar CPF" value={filters.cpf}
              onChange={e => { setFilters(p => ({ ...p, cpf: e.target.value })); setPage(1); }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
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
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14 }}>
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
        <DataTable<Filiado>
          columns={columns}
          data={pageData}
          totalRecords={filtered.length}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={s => { setPageSize(s); setPage(1); }}
          emptyMessage="Nenhum filiado encontrado."
          mobileCard={(r) => {
            return (
              <div style={{ background: '#fff', border: '1px solid #dde3ee', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                    <PersonPhotoSmall cpf={r.cpf} nome={r.nomeFiliado} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>{r.nomeFiliado}</div>
                  </div>
                  <Badge variant={situacaoFiliadoVariant(r.situacao)} label={r.situacao} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2, fontFamily: 'monospace' }}>{r.cpf}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>{r.uf ?? '—'} · {r.municipio ?? '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Filiação: {r.dataFiliacao ?? '—'}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="primary" size="sm" onClick={() => setSelected(r)} icon="bi-eye">Ver</Button>
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
