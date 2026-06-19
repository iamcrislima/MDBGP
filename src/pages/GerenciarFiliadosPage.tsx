import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { NavigateFn } from '../types';
import DatePicker from '../components/shared/DatePicker';
import { useBreakpoint } from '../hooks/useBreakpoint';

/* ─── types ─────────────────────────────────────────────────────────────── */
type Etapa    = 'Publicidade' | 'Filiação' | 'Conferência' | 'Etapa final';
type StatusFP = 'Pendente' | 'Deferido' | 'Indeferido';
interface HistEntry { etapa: string; data: string; resp: string }
interface FP {
  id: number; protocolo: string; processoId: string; processoLink: string;
  nome: string; cpf: string; dtNasc: string; email: string; celular: string;
  uf: string; municipio: string; domEleitoral: string;
  dtAbertura: string; dtAberturaDt: string; dtPreenchimento: string;
  tipoDiretorio: 'Municipal' | 'Estadual';
  etapa: Etapa; status: StatusFP;
  enviadoMunicipal: boolean; enviadoEstadual: boolean;
  dtProcessoInterno: string; historico: HistEntry[];
}

/* ─── constants ─────────────────────────────────────────────────────────── */
const ETAPAS: Etapa[] = ['Publicidade', 'Filiação', 'Conferência', 'Etapa final'];

const STATUS_CFG: Record<StatusFP, { bg: string; color: string; icon: string }> = {
  'Pendente':   { bg: '#fff7ed', color: '#c2410c', icon: 'bi-clock-fill' },
  'Deferido':   { bg: '#dcfce7', color: '#15803d', icon: 'bi-check-circle-fill' },
  'Indeferido': { bg: '#fee2e2', color: '#dc2626', icon: 'bi-x-circle-fill' },
};

const UF_MUNS: Record<string, string[]> = {
  SC: ['Blumenau','Chapecó','Florianópolis','Joinville','São José'],
  SP: ['Campinas','Ribeirão Preto','Santos','São Paulo','Sorocaba'],
  RS: ['Canoas','Caxias do Sul','Pelotas','Porto Alegre','Santa Maria'],
  MG: ['Belo Horizonte','Contagem','Juiz de Fora','Montes Claros','Uberlândia'],
  BA: ['Camaçari','Feira de Santana','Salvador','Vitória da Conquista'],
  GO: ['Anápolis','Aparecida de Goiânia','Goiânia','Rio Verde'],
  PR: ['Cascavel','Curitiba','Londrina','Maringá','Ponta Grossa'],
  RJ: ['Duque de Caxias','Niterói','Nova Iguaçu','Rio de Janeiro'],
  CE: ['Caucaia','Fortaleza','Juazeiro do Norte','Maracanaú'],
  PE: ['Caruaru','Olinda','Petrolina','Recife'],
  MA: ['Imperatriz','São Luís','Timon'],
};

const LAST_SYNC = '18/06/2026 às 15:47:23';
const PAGE_SIZE = 10;

/* ─── mock data ─────────────────────────────────────────────────────────── */
function genHist(etapa: Etapa, base: string): HistEntry[] {
  const idx = ETAPAS.indexOf(etapa);
  const [d, m, y] = base.split('/').map(Number);
  const offs = [0, 3, 7, 12];
  const times = ['09:00', '10:30', '14:15', '16:40'];
  const resps = ['Sistema', 'João Carvalho', 'Maria Santos', 'Carlos Mendes'];
  return ETAPAS.slice(0, idx + 1).map((e, i) => {
    const dt = new Date(y, m - 1, d + offs[i]);
    const dd = String(dt.getDate()).padStart(2,'0');
    const mm = String(dt.getMonth()+1).padStart(2,'0');
    return { etapa: e, data: `${dd}/${mm}/${dt.getFullYear()} ${times[i]}`, resp: resps[i] };
  });
}

type B = Omit<FP,'id'|'protocolo'|'processoId'|'processoLink'|'historico'>;
const BASE: B[] = [
  { nome:'Ana Paula Ferreira Silva',       cpf:'032.***.***-41', dtNasc:'15/03/1985', email:'ana.silva@email.com',        celular:'(48) 99876-5432', uf:'SC', municipio:'Florianópolis',        domEleitoral:'Florianópolis - SC',        dtAbertura:'15/03/2024', dtAberturaDt:'2024-03-15', dtPreenchimento:'15/03/2024 14:32', tipoDiretorio:'Municipal', etapa:'Conferência',  status:'Pendente', enviadoMunicipal:true,  enviadoEstadual:true,  dtProcessoInterno:'15/03/2024 14:35' },
  { nome:'Carlos Eduardo Santos Lima',     cpf:'587.***.***-23', dtNasc:'22/07/1978', email:'carlos.lima@email.com',      celular:'(11) 98765-4321', uf:'SP', municipio:'São Paulo',            domEleitoral:'São Paulo - SP',            dtAbertura:'20/03/2024', dtAberturaDt:'2024-03-20', dtPreenchimento:'20/03/2024 09:15', tipoDiretorio:'Estadual', etapa:'Etapa final',   status:'Deferido',     enviadoMunicipal:true,  enviadoEstadual:true,  dtProcessoInterno:'20/03/2024 10:00' },
  { nome:'Maria José Oliveira Costa',      cpf:'341.***.***-55', dtNasc:'08/11/1990', email:'maria.costa@email.com',      celular:'(51) 97654-3210', uf:'RS', municipio:'Porto Alegre',         domEleitoral:'Porto Alegre - RS',         dtAbertura:'05/04/2024', dtAberturaDt:'2024-04-05', dtPreenchimento:'05/04/2024 11:00', tipoDiretorio:'Municipal', etapa:'Filiação',     status:'Pendente', enviadoMunicipal:false, enviadoEstadual:false, dtProcessoInterno:'05/04/2024 11:05' },
  { nome:'João Roberto Alves Pereira',     cpf:'029.***.***-17', dtNasc:'14/05/1965', email:'joao.pereira@email.com',     celular:'(31) 96543-2109', uf:'MG', municipio:'Belo Horizonte',       domEleitoral:'Belo Horizonte - MG',       dtAbertura:'12/04/2024', dtAberturaDt:'2024-04-12', dtPreenchimento:'12/04/2024 16:20', tipoDiretorio:'Estadual', etapa:'Publicidade',  status:'Indeferido',   enviadoMunicipal:false, enviadoEstadual:false, dtProcessoInterno:'12/04/2024 17:00' },
  { nome:'Francisca Aparecida Souza',      cpf:'456.***.***-88', dtNasc:'30/09/1982', email:'franca.souza@email.com',     celular:'(71) 95432-1098', uf:'BA', municipio:'Salvador',              domEleitoral:'Salvador - BA',             dtAbertura:'18/04/2024', dtAberturaDt:'2024-04-18', dtPreenchimento:'18/04/2024 10:45', tipoDiretorio:'Municipal', etapa:'Filiação',     status:'Deferido',     enviadoMunicipal:true,  enviadoEstadual:true,  dtProcessoInterno:'18/04/2024 11:00' },
  { nome:'Antonio Carlos Rodrigues Neto',  cpf:'193.***.***-62', dtNasc:'03/02/1975', email:'antonio.rod@email.com',      celular:'(62) 94321-0987', uf:'GO', municipio:'Goiânia',               domEleitoral:'Goiânia - GO',              dtAbertura:'25/04/2024', dtAberturaDt:'2024-04-25', dtPreenchimento:'25/04/2024 13:30', tipoDiretorio:'Municipal', etapa:'Conferência',  status:'Deferido',     enviadoMunicipal:true,  enviadoEstadual:false, dtProcessoInterno:'25/04/2024 14:00' },
  { nome:'Adriana Lucia Martins Cunha',    cpf:'771.***.***-34', dtNasc:'19/08/1988', email:'adriana.cunha@email.com',    celular:'(41) 93210-9876', uf:'PR', municipio:'Curitiba',              domEleitoral:'Curitiba - PR',             dtAbertura:'02/05/2024', dtAberturaDt:'2024-05-02', dtPreenchimento:'02/05/2024 08:50', tipoDiretorio:'Estadual', etapa:'Etapa final',   status:'Deferido',     enviadoMunicipal:true,  enviadoEstadual:true,  dtProcessoInterno:'02/05/2024 09:00' },
  { nome:'José Augusto Ferreira Gomes',    cpf:'284.***.***-91', dtNasc:'27/01/1971', email:'jose.gomes@email.com',       celular:'(47) 99109-8765', uf:'SC', municipio:'Joinville',             domEleitoral:'Joinville - SC',            dtAbertura:'10/05/2024', dtAberturaDt:'2024-05-10', dtPreenchimento:'10/05/2024 15:10', tipoDiretorio:'Municipal', etapa:'Publicidade',  status:'Pendente', enviadoMunicipal:false, enviadoEstadual:false, dtProcessoInterno:'10/05/2024 15:15' },
  { nome:'Sandra Regina Barbosa Lima',     cpf:'512.***.***-07', dtNasc:'06/06/1993', email:'sandra.lima@email.com',      celular:'(19) 98098-7654', uf:'SP', municipio:'Campinas',              domEleitoral:'Campinas - SP',             dtAbertura:'17/05/2024', dtAberturaDt:'2024-05-17', dtPreenchimento:'17/05/2024 12:25', tipoDiretorio:'Municipal', etapa:'Conferência',  status:'Indeferido',   enviadoMunicipal:true,  enviadoEstadual:true,  dtProcessoInterno:'17/05/2024 12:30' },
  { nome:'Paulo Henrique Carvalho Dias',   cpf:'638.***.***-45', dtNasc:'11/12/1980', email:'paulo.dias@email.com',       celular:'(21) 97087-6543', uf:'RJ', municipio:'Rio de Janeiro',       domEleitoral:'Rio de Janeiro - RJ',       dtAbertura:'23/05/2024', dtAberturaDt:'2024-05-23', dtPreenchimento:'23/05/2024 09:40', tipoDiretorio:'Estadual', etapa:'Filiação',     status:'Pendente', enviadoMunicipal:false, enviadoEstadual:false, dtProcessoInterno:'23/05/2024 10:00' },
  { nome:'Luciana Cristina Freitas',       cpf:'095.***.***-78', dtNasc:'24/04/1987', email:'luciana.freitas@email.com',  celular:'(54) 96076-5432', uf:'RS', municipio:'Caxias do Sul',        domEleitoral:'Caxias do Sul - RS',        dtAbertura:'01/06/2024', dtAberturaDt:'2024-06-01', dtPreenchimento:'01/06/2024 14:55', tipoDiretorio:'Municipal', etapa:'Etapa final',   status:'Deferido',     enviadoMunicipal:true,  enviadoEstadual:true,  dtProcessoInterno:'01/06/2024 15:00' },
  { nome:'Marcos Antonio Pinheiro Cruz',   cpf:'347.***.***-26', dtNasc:'16/10/1969', email:'marcos.cruz@email.com',      celular:'(85) 95065-4321', uf:'CE', municipio:'Fortaleza',             domEleitoral:'Fortaleza - CE',            dtAbertura:'08/06/2024', dtAberturaDt:'2024-06-08', dtPreenchimento:'08/06/2024 11:20', tipoDiretorio:'Municipal', etapa:'Publicidade',  status:'Pendente', enviadoMunicipal:false, enviadoEstadual:false, dtProcessoInterno:'08/06/2024 11:25' },
  { nome:'Tereza Cristina Rocha Alves',    cpf:'829.***.***-53', dtNasc:'02/07/1994', email:'tereza.rocha@email.com',     celular:'(34) 94054-3210', uf:'MG', municipio:'Uberlândia',            domEleitoral:'Uberlândia - MG',           dtAbertura:'15/06/2024', dtAberturaDt:'2024-06-15', dtPreenchimento:'15/06/2024 16:05', tipoDiretorio:'Estadual', etapa:'Filiação',     status:'Indeferido',   enviadoMunicipal:true,  enviadoEstadual:false, dtProcessoInterno:'15/06/2024 16:10' },
  { nome:'Roberto Carlos Mendonça',        cpf:'164.***.***-81', dtNasc:'20/03/1977', email:'roberto.mendonca@email.com', celular:'(75) 93043-2109', uf:'BA', municipio:'Feira de Santana',      domEleitoral:'Feira de Santana - BA',     dtAbertura:'22/06/2024', dtAberturaDt:'2024-06-22', dtPreenchimento:'22/06/2024 10:30', tipoDiretorio:'Municipal', etapa:'Conferência',  status:'Pendente', enviadoMunicipal:true,  enviadoEstadual:true,  dtProcessoInterno:'22/06/2024 10:35' },
  { nome:'Eliane Aparecida Cunha Ramos',   cpf:'503.***.***-39', dtNasc:'09/09/1983', email:'eliane.ramos@email.com',     celular:'(47) 92032-1098', uf:'SC', municipio:'Blumenau',              domEleitoral:'Blumenau - SC',             dtAbertura:'29/06/2024', dtAberturaDt:'2024-06-29', dtPreenchimento:'29/06/2024 08:15', tipoDiretorio:'Municipal', etapa:'Etapa final',   status:'Deferido',     enviadoMunicipal:true,  enviadoEstadual:true,  dtProcessoInterno:'29/06/2024 08:20' },
  { nome:'Diego Henrique Teixeira Sousa',  cpf:'716.***.***-64', dtNasc:'17/02/1996', email:'diego.sousa@email.com',      celular:'(13) 91021-0987', uf:'SP', municipio:'Santos',                domEleitoral:'Santos - SP',               dtAbertura:'06/07/2024', dtAberturaDt:'2024-07-06', dtPreenchimento:'06/07/2024 13:50', tipoDiretorio:'Municipal', etapa:'Publicidade',  status:'Pendente', enviadoMunicipal:false, enviadoEstadual:false, dtProcessoInterno:'06/07/2024 13:55' },
  { nome:'Camila Fernanda Moreira Lima',   cpf:'258.***.***-12', dtNasc:'31/05/1991', email:'camila.lima@email.com',      celular:'(43) 90010-9876', uf:'PR', municipio:'Londrina',              domEleitoral:'Londrina - PR',             dtAbertura:'13/07/2024', dtAberturaDt:'2024-07-13', dtPreenchimento:'13/07/2024 14:00', tipoDiretorio:'Municipal', etapa:'Filiação',     status:'Deferido',     enviadoMunicipal:true,  enviadoEstadual:false, dtProcessoInterno:'13/07/2024 14:05' },
  { nome:'Felipe Augusto Nascimento',      cpf:'481.***.***-97', dtNasc:'05/11/1973', email:'felipe.nasc@email.com',      celular:'(98) 99909-8765', uf:'MA', municipio:'São Luís',              domEleitoral:'São Luís - MA',             dtAbertura:'20/07/2024', dtAberturaDt:'2024-07-20', dtPreenchimento:'20/07/2024 09:30', tipoDiretorio:'Estadual', etapa:'Conferência',  status:'Indeferido',   enviadoMunicipal:false, enviadoEstadual:false, dtProcessoInterno:'20/07/2024 09:35' },
  { nome:'Andreia Paula Coelho Gomes',     cpf:'873.***.***-43', dtNasc:'28/08/1989', email:'andreia.gomes@email.com',    celular:'(62) 98898-7654', uf:'GO', municipio:'Aparecida de Goiânia', domEleitoral:'Aparecida de Goiânia - GO', dtAbertura:'27/07/2024', dtAberturaDt:'2024-07-27', dtPreenchimento:'27/07/2024 11:15', tipoDiretorio:'Municipal', etapa:'Publicidade',  status:'Pendente', enviadoMunicipal:false, enviadoEstadual:false, dtProcessoInterno:'27/07/2024 11:20' },
  { nome:'Sebastião Luiz Cardoso Melo',    cpf:'126.***.***-85', dtNasc:'12/04/1963', email:'sebastiao.melo@email.com',   celular:'(81) 97887-6543', uf:'PE', municipio:'Recife',                domEleitoral:'Recife - PE',               dtAbertura:'03/08/2024', dtAberturaDt:'2024-08-03', dtPreenchimento:'03/08/2024 15:45', tipoDiretorio:'Estadual', etapa:'Etapa final',   status:'Deferido',     enviadoMunicipal:true,  enviadoEstadual:true,  dtProcessoInterno:'03/08/2024 15:50' },
];

const MOCK_FP: FP[] = Array.from({ length: 50 }, (_, i) => {
  const b = BASE[i % 20];
  const seq = String(i + 1).padStart(6, '0');
  const year = i < 20 ? '2024' : i < 35 ? '2025' : '2026';
  return {
    ...b, id: i + 1,
    protocolo: `${year}/${seq}-${(i % 9) + 1}`,
    processoId: `PROC-${year}-${seq}`,
    processoLink: `https://mdb.1doc.com.br/processo/PROC-${year}-${seq}`,
    historico: genHist(b.etapa, b.dtAbertura),
  };
});

/* ─── CustomSelect ──────────────────────────────────────────────────────── */
interface Opt { value: string; label: string }

function DropItem({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '9px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: selected ? '#eff6ff' : hov ? '#f8fafc' : '#fff', color: selected ? '#1e40af' : '#374151', fontWeight: selected ? 600 : 400, fontFamily: 'Open Sans, sans-serif', transition: 'background 0.1s' }}>
      <span style={{ width: 16, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {selected && <i className="bi bi-check2" style={{ color: '#2563eb', fontSize: 13 }} />}
      </span>
      {label}
    </div>
  );
}

function CustomSelect({ value, onChange, options, placeholder, disabled }: { value: string; onChange: (v: string) => void; options: Opt[]; placeholder: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  useEffect(() => { if (open) { setSearch(''); setTimeout(() => searchRef.current?.focus(), 0); } }, [open]);
  const label = options.find(o => o.value === value)?.label ?? placeholder;
  const showSearch = options.length > 5;
  const filtered = search ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())) : options;
  const close = () => { setOpen(false); setSearch(''); };
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => !disabled && setOpen(o => !o)}
        style={{ height: 36, padding: '0 10px', border: `1.5px solid ${open ? '#2563eb' : '#d1d5db'}`, borderRadius: 7, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: disabled ? '#f9fafb' : value ? '#eff6ff' : '#fff', cursor: disabled ? 'not-allowed' : 'pointer', color: value ? '#1e40af' : '#6b7280', fontFamily: 'Open Sans, sans-serif', boxShadow: open ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none', transition: 'border-color 0.15s, box-shadow 0.15s', userSelect: 'none', opacity: disabled ? 0.55 : 1, gap: 6 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontSize: 12 }}>{label}</span>
        <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: 10, flexShrink: 0, color: '#9ca3af' }} />
      </div>
      {open && !disabled && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 400, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {showSearch && (
            <div style={{ padding: '6px 8px', borderBottom: '1px solid #f0f4fb', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-search" style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 10, pointerEvents: 'none' }} />
                <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
                  style={{ width: '100%', height: 28, paddingLeft: 24, paddingRight: 8, border: '1px solid #e5e7eb', borderRadius: 5, fontSize: 12, outline: 'none', fontFamily: 'Open Sans, sans-serif', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#2563eb')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                  onKeyDown={e => { if (e.key === 'Escape') close(); }} />
              </div>
            </div>
          )}
          <div style={{ overflowY: 'auto', maxHeight: showSearch ? 196 : 230 }}>
            <DropItem label={placeholder} selected={!value} onClick={() => { onChange(''); close(); }} />
            {filtered.length === 0
              ? <div style={{ padding: '10px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>Nenhum resultado</div>
              : filtered.map(o => <DropItem key={o.value} label={o.label} selected={value === o.value} onClick={() => { onChange(o.value); close(); }} />)
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── StepTracker with portal tooltip ──────────────────────────────────── */
function StepTracker({ item }: { item: FP }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null);
  const idx = ETAPAS.indexOf(item.etapa);
  const rejected = item.status === 'Indeferido';

  const dotStyle = (i: number) => {
    const done = i < idx;
    const curr = i === idx;
    if (curr && rejected) return { bg: '#fee2e2', border: '#dc2626', iconColor: '#dc2626', icon: 'bi-x-lg' };
    if (done)             return { bg: '#2563eb', border: '#2563eb', iconColor: '#fff', icon: 'bi-check-lg' };
    if (curr)             return { bg: '#fef3c7', border: '#f59e0b', iconColor: '#f59e0b', icon: '' };
    return { bg: '#fff', border: '#d1d5db', iconColor: '', icon: '' };
  };

  const show = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setTip({ top: r.bottom + 8, left: Math.max(8, r.left - 20) });
    }
  };

  return (
    <div ref={ref} onMouseEnter={show} onMouseLeave={() => setTip(null)}
      style={{ display: 'inline-flex', flexDirection: 'column', gap: 5, cursor: 'default' }}>
      {/* dots row */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {ETAPAS.map((e, i) => {
          const s = dotStyle(i);
          const done = i < idx;
          const curr = i === idx;
          return (
            <React.Fragment key={e}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.bg, border: `2px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                {done && <i className="bi bi-check-lg" style={{ fontSize: 7, color: '#fff', lineHeight: 1 }} />}
                {curr && !rejected && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b' }} />}
                {curr && rejected && <i className="bi bi-x-lg" style={{ fontSize: 7, color: '#dc2626', lineHeight: 1 }} />}
              </div>
              {i < 3 && <div style={{ width: 14, height: 2, background: done ? '#2563eb' : '#e5e7eb', flexShrink: 0 }} />}
            </React.Fragment>
          );
        })}
      </div>
      {/* dir indicators */}
      <DirRow mun={item.enviadoMunicipal} est={item.enviadoEstadual} />

      {/* portal tooltip */}
      {tip && createPortal(
        <div style={{ position: 'fixed', top: tip.top, left: tip.left, zIndex: 9000, background: '#1e293b', borderRadius: 10, padding: '12px 16px', width: 240, boxShadow: '0 12px 32px rgba(0,0,0,0.3)', pointerEvents: 'none', fontFamily: 'Open Sans, sans-serif' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Histórico de etapas</div>
          {ETAPAS.map((e, i) => {
            const h = item.historico.find(x => x.etapa === e);
            const isDone = i < idx;
            const isCurr = i === idx;
            const color = isCurr && rejected ? '#fca5a5' : isDone ? '#60a5fa' : isCurr ? '#fcd34d' : '#475569';
            return (
              <div key={e} style={{ display: 'flex', gap: 10, marginBottom: i < 3 ? 10 : 0, alignItems: 'flex-start' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, marginTop: 4, flexShrink: 0 }} />
                <div>
                  <div style={{ color: isDone || isCurr ? '#f1f5f9' : '#64748b', fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>{e}</div>
                  {h ? <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 1 }}>{h.data}<br />{h.resp}</div>
                     : <div style={{ color: '#475569', fontSize: 10, marginTop: 1 }}>Pendente</div>}
                </div>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

function DirRow({ mun, est }: { mun: boolean; est: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <DirChip label="Municipal" sent={mun} />
      <DirChip label="Estadual"  sent={est} />
    </div>
  );
}
function DirChip({ label, sent }: { label: string; sent: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9.5, color: sent ? '#16a34a' : '#9ca3af', fontWeight: 500 }}>
      <i className={`bi bi-${sent ? 'check-circle-fill' : 'clock'}`} style={{ fontSize: 8.5 }} />
      <span>{label} {sent ? 'enviado' : 'pendente'}</span>
    </div>
  );
}

/* ─── StatusBadge ───────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: StatusFP }) {
  const s = STATUS_CFG[status];
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
      <i className={`bi ${s.icon}`} style={{ fontSize: 9.5 }} />{status}
    </span>
  );
}

/* ─── Avatar (fallback) ─────────────────────────────────────────────────── */
function Avatar({ nome, size = 64 }: { nome: string; size?: number }) {
  const initials = nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const palette = ['#00963F','#7c3aed','#db2777','#059669','#d97706','#0891b2','#dc2626'];
  const bg = palette[nome.charCodeAt(0) % palette.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${bg} 0%, ${bg}bb 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.3, flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
      {initials}
    </div>
  );
}

/* ─── PersonPhoto ────────────────────────────────────────────────────────── */
function getPhotoUrl(cpf: string, nome: string): string {
  const digits = cpf.replace(/\D/g, '');
  const photoId = parseInt(digits.slice(-2) || '0') % 100;
  const gender = (nome.split(' ')[0]?.toLowerCase().endsWith('a') ||
    ['ana','maria','paula','sandra','luciana','eliane','camila','andreia','francisca','adriana','tereza'].some(n => nome.toLowerCase().startsWith(n)))
    ? 'women' : 'men';
  return `https://randomuser.me/api/portraits/${gender}/${photoId}.jpg`;
}

function PersonPhoto({ cpf, nome, size = 56, onClick }: { cpf: string; nome: string; size?: number; onClick?: () => void }) {
  const [err, setErr] = useState(false);
  const url = getPhotoUrl(cpf, nome);
  if (err) return <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}><Avatar nome={nome} size={size} /></div>;
  return (
    <img
      src={url}
      alt={nome}
      title="Clique para ampliar"
      onError={() => setErr(true)}
      onClick={onClick}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', cursor: onClick ? 'pointer' : 'default' }}
    />
  );
}

/* ─── KPI ───────────────────────────────────────────────────────────────── */
function KPI({ label, value, icon, borderColor }: { label: string; value: number; icon: string; borderColor: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 18px', borderTop: `4px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 42, height: 42, background: `${borderColor}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={`bi ${icon}`} style={{ color: borderColor, fontSize: 19 }} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{value.toLocaleString('pt-BR')}</div>
        <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

/* ─── Modal helpers ─────────────────────────────────────────────────────── */
function ModalSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ width: 24, height: 24, background: '#eff6ff', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={`bi ${icon}`} style={{ color: '#2563eb', fontSize: 12 }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#374151' }}>{title}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>{children}</div>
    </div>
  );
}

function MF({ label, value, full, link }: { label: string; value: string; full?: boolean; link?: string }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
      {link
        ? <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#2563eb', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{value}</span>
            <i className="bi bi-box-arrow-up-right" style={{ fontSize: 10, flexShrink: 0 }} />
          </a>
        : <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{value}</div>
      }
    </div>
  );
}

function IndicadorRow({ label, ok, value }: { label: string; ok: boolean; value?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f4fb' }}>
      <span style={{ fontSize: 12, color: '#374151' }}>{label}</span>
      {value
        ? <StatusBadge status={value as StatusFP} />
        : <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: ok ? '#15803d' : '#9ca3af' }}>
            <i className={`bi bi-${ok ? 'check-circle-fill' : 'dash-circle'}`} style={{ fontSize: 12 }} />
            {ok ? 'Sim' : 'Não'}
          </span>
      }
    </div>
  );
}

/* ─── LightboxPhoto ─────────────────────────────────────────────────────── */
function LightboxPhoto({ cpf, nome }: { cpf: string; nome: string }) {
  const [err, setErr] = useState(false);
  const [ready, setReady] = useState(false);
  const url = getPhotoUrl(cpf, nome);
  const initials = nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div style={{ width: 280, height: 280, borderRadius: '50%', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', transform: ready ? 'scale(1)' : 'scale(0.8)', transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1)', flexShrink: 0 }}>
      {err ? (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #00963F, #4CAF50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 80, fontFamily: 'Open Sans, sans-serif' }}>{initials}</div>
      ) : (
        <img src={url} alt={nome} onError={() => setErr(true)} onLoad={() => setReady(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
    </div>
  );
}

/* ─── VerModal ──────────────────────────────────────────────────────────── */
function VerModal({ item, onClose }: { item: FP; onClose: () => void }) {
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [lightbox]);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 720, maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh', background: '#fff', borderRadius: 12, zIndex: 1070, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', fontFamily: 'Open Sans, sans-serif' }}>

        {/* Lightbox */}
        {lightbox && (
          <div
            onClick={() => setLightbox(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1090, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}
          >
            <LightboxPhoto cpf={item.cpf} nome={item.nome} />
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 600, fontFamily: 'Open Sans, sans-serif' }}>{item.nome}</div>
            <button onClick={() => setLightbox(false)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', padding: '6px 18px', fontSize: 12, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>Fechar</button>
          </div>
        )}

        {/* Header */}
        <div style={{ background: '#12121f', padding: '18px 22px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PersonPhoto cpf={item.cpf} nome={item.nome} size={56} onClick={() => setLightbox(true)} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nome}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                <span><i className="bi bi-person-vcard" style={{ marginRight: 4 }} />{item.cpf}</span>
                <span><i className="bi bi-calendar3" style={{ marginRight: 4 }} />{item.dtNasc}</span>
                <span><i className="bi bi-geo-alt-fill" style={{ marginRight: 4 }} />{item.domEleitoral}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <StatusBadge status={item.status} />
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 20 }}>×</button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '18px 22px', flex: 1 }}>

          <ModalSection icon="bi-file-earmark-text-fill" title="Dados da solicitação">
            <MF label="Nº do Processo na 1doc"            value={item.processoId}      full />
            <MF label="Link do Processo na 1doc"          value={item.processoLink}     full link={item.processoLink} />
            <MF label="Nome Completo"                     value={item.nome}             full />
            <MF label="CPF"                               value={item.cpf} />
            <MF label="Data de Nascimento"                value={item.dtNasc} />
            <MF label="E-mail"                            value={item.email}            full />
            <MF label="Telefone Celular"                  value={item.celular} />
            <MF label="Domicílio Eleitoral"               value={item.domEleitoral} />
            <MF label="Data de Abertura do Processo"      value={item.dtAbertura} />
          </ModalSection>

          <ModalSection icon="bi-diagram-3-fill" title="Indicadores do fluxo de filiação">
            <div style={{ gridColumn: '1 / -1' }}>
              <IndicadorRow label="Enviado para Presidente do Diretório Municipal" ok={item.enviadoMunicipal} />
              <IndicadorRow label="Enviado para Presidente do Diretório Estadual"  ok={item.enviadoEstadual} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f4fb' }}>
                <span style={{ fontSize: 12, color: '#374151' }}>Data/hora do processo interno de filiação</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{item.dtProcessoInterno}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: 12, color: '#374151' }}>Status do processo interno</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
          </ModalSection>

        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid #f0f4fb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '9px 20px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'Open Sans, sans-serif' }}>Fechar</button>
          <a href={item.processoLink} target="_blank" rel="noopener noreferrer"
            style={{ padding: '9px 20px', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
            <i className="bi bi-box-arrow-up-right" />
            Abrir processo na 1doc
          </a>
        </div>
      </div>
    </>
  );
}

/* ─── Filter state ──────────────────────────────────────────────────────── */
const EMPTY_F = { nome:'', uf:'', municipio:'', etapa:'', status:'', processo:'', dtAbertura:'', tipoDiretorio:'', enviado:'' };

/* ─── Main page ─────────────────────────────────────────────────────────── */
export default function GerenciarFiliadosPage({ onNavigate }: { onNavigate: NavigateFn }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [modal, setModal] = useState<FP | null>(null);
  const [f, setF] = useState({ ...EMPTY_F });
  const [a, setA] = useState({ ...EMPTY_F });
  const [page, setPage] = useState(1);

  const ufMuns = f.uf ? (UF_MUNS[f.uf] ?? []) : [];

  const filtered = useMemo(() => MOCK_FP.filter(r => {
    if (a.nome && !r.nome.toLowerCase().includes(a.nome.toLowerCase()) && !r.cpf.includes(a.nome)) return false;
    if (a.uf && r.uf !== a.uf) return false;
    if (a.municipio && r.municipio !== a.municipio) return false;
    if (a.etapa && r.etapa !== a.etapa) return false;
    if (a.status && r.status !== a.status) return false;
    if (a.processo && !r.processoId.includes(a.processo)) return false;
    if (a.dtAbertura && a.dtAbertura.length === 10) {
      const [dd, mm, yyyy] = a.dtAbertura.split('/');
      if (yyyy && `${yyyy}-${mm}-${dd}` !== r.dtAberturaDt) return false;
    }
    if (a.tipoDiretorio && r.tipoDiretorio !== a.tipoDiretorio) return false;
    if (a.enviado === 'Sim' && !r.enviadoMunicipal && !r.enviadoEstadual) return false;
    if (a.enviado === 'Não' && (r.enviadoMunicipal || r.enviadoEstadual)) return false;
    return true;
  }), [a]);

  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const kpi = useMemo(() => ({
    total:        MOCK_FP.length,
    publicidade:  MOCK_FP.filter(r => r.etapa === 'Publicidade').length,
    filiacao:     MOCK_FP.filter(r => r.etapa === 'Filiação').length,
    confEstadual: MOCK_FP.filter(r => r.enviadoEstadual && r.status !== 'Deferido').length,
    indeferido:   MOCK_FP.filter(r => r.status === 'Indeferido').length,
  }), []);

  const apply = () => { setA({ ...f }); setPage(1); };
  const clear  = () => { setF({ ...EMPTY_F }); setA({ ...EMPTY_F }); setPage(1); };
  const set    = (k: keyof typeof f) => (v: string) => setF(p => ({ ...p, [k]: v }));

  const lb: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 };
  const th: React.CSSProperties = { padding: '9px 12px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#374151', borderBottom: '2px solid #e5e7eb', background: '#f8fafc', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '10px 12px', fontSize: 12, color: '#374151', verticalAlign: 'top' };

  const etapaOpts = ETAPAS.map(e => ({ value: e, label: e }));
  const statusOpts: Opt[] = [{ value:'Pendente', label:'Pendente' }, { value:'Deferido', label:'Deferido' }, { value:'Indeferido', label:'Indeferido' }];
  const ufOpts = Object.keys(UF_MUNS).sort().map(u => ({ value: u, label: u }));
  const munOpts = ufMuns.map(m => ({ value: m, label: m }));
  const tipoOpts: Opt[] = [{ value:'Municipal', label:'Municipal' }, { value:'Estadual', label:'Estadual' }];
  const enviadoOpts: Opt[] = [{ value:'Sim', label:'Sim' }, { value:'Não', label:'Não' }];

  return (
    <div style={{ padding: isMobile ? '16px' : '24px 28px', fontFamily: 'Open Sans, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Gerenciar Filiados</h1>
          <nav style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
            <span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={() => onNavigate('home')}>Início</span>
            {' › '}Filiação Partidária{' › '}Gerenciar Filiados
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6b7280', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 6, padding: '7px 12px' }}>
          <i className="bi bi-arrow-repeat" style={{ color: '#2563eb' }} />
          Última sincronização com 1doc: <strong style={{ color: '#374151' }}>{LAST_SYNC}</strong>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : isTablet ? 'repeat(3,1fr)' : 'repeat(5,1fr)', gap: 14, marginBottom: 20 }}>
        <KPI label="Total de solicitações" value={kpi.total}        icon="bi-clipboard2-data-fill" borderColor="#2563eb" />
        <KPI label="Publicidade"           value={kpi.publicidade}  icon="bi-megaphone-fill"        borderColor="#6b7280" />
        <KPI label="Filiação"              value={kpi.filiacao}     icon="bi-person-plus-fill"      borderColor="#3b82f6" />
        <KPI label="Conferência estadual"  value={kpi.confEstadual} icon="bi-building-check"        borderColor="#f59e0b" />
        <KPI label="Indeferidos"           value={kpi.indeferido}   icon="bi-x-circle-fill"         borderColor="#ef4444" />
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="bi bi-funnel-fill" style={{ color: '#2563eb' }} /> Filtros
        </div>
        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr 1fr' : '2fr 1fr 1.3fr 1.3fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={lb}>Nome / CPF</label>
            <input value={f.nome} onChange={e => setF(p => ({ ...p, nome: e.target.value }))} placeholder="Digite nome ou CPF…"
              style={{ height: 36, padding: '0 10px', border: '1.5px solid #d1d5db', borderRadius: 7, fontSize: 12, outline: 'none', fontFamily: 'Open Sans, sans-serif', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'} />
          </div>
          <div><label style={lb}>UF</label><CustomSelect value={f.uf} onChange={v => setF(p => ({ ...p, uf: v, municipio: '' }))} options={ufOpts} placeholder="Todas" /></div>
          <div><label style={lb}>Município</label><CustomSelect value={f.municipio} onChange={set('municipio')} options={munOpts} placeholder="Todos" disabled={!f.uf} /></div>
          <div><label style={lb}>Etapa</label><CustomSelect value={f.etapa} onChange={set('etapa')} options={etapaOpts} placeholder="Todas" /></div>
          <div><label style={lb}>Status</label><CustomSelect value={f.status} onChange={set('status')} options={statusOpts} placeholder="Todos" /></div>
        </div>
        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '2fr 1fr 1.3fr 1fr auto auto', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label style={lb}>Nº do Processo 1doc</label>
            <input value={f.processo} onChange={e => setF(p => ({ ...p, processo: e.target.value }))} placeholder="Ex: PROC-2024-000001"
              style={{ height: 36, padding: '0 10px', border: '1.5px solid #d1d5db', borderRadius: 7, fontSize: 12, outline: 'none', fontFamily: 'Open Sans, sans-serif', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'} />
          </div>
          <div>
            <label style={lb}>Data de Abertura</label>
            <DatePicker value={f.dtAbertura} onChange={v => setF(p => ({ ...p, dtAbertura: v }))} />
          </div>
          <div><label style={lb}>Tipo de Diretório</label><CustomSelect value={f.tipoDiretorio} onChange={set('tipoDiretorio')} options={tipoOpts} placeholder="Todos" /></div>
          <div><label style={lb}>Enviado ao diretório</label><CustomSelect value={f.enviado} onChange={set('enviado')} options={enviadoOpts} placeholder="Todos" /></div>
          <button onClick={clear} style={{ height: 36, padding: '0 14px', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
            <i className="bi bi-x-circle" /> Limpar
          </button>
          <button onClick={apply} style={{ height: 36, padding: '0 16px', border: 'none', borderRadius: 7, background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
            <i className="bi bi-funnel-fill" /> Filtrar
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        {isMobile ? (
          /* ── Mobile cards ── */
          <div style={{ padding: '12px' }}>
            {pageData.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                <i className="bi bi-search" style={{ fontSize: 30, display: 'block', marginBottom: 8 }} />
                Nenhum registro encontrado.
              </div>
            ) : (
              <div className="mobile-card-list">
                {pageData.map(r => (
                  <div key={r.id} style={{ background: '#fff', border: '1px solid #dde3ee', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', borderRadius: 4, padding: '2px 6px', color: '#374151' }}>{r.protocolo}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 2 }}>{r.nome}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2, fontFamily: 'monospace' }}>{r.cpf}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}><strong>{r.uf}</strong> · {r.municipio} · {r.dtAbertura}</div>
                    <div style={{ marginBottom: 10 }}><StepTracker item={r} /></div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => setModal(r)} style={{ padding: '7px 16px', border: '1.5px solid #2563eb', borderRadius: 6, background: '#fff', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 5, minHeight: 36 }}>
                        <i className="bi bi-eye-fill" /> Ver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={th}>Nº Protocolo</th>
                <th style={th}>Nome Completo</th>
                <th style={th}>CPF</th>
                <th style={th}>UF / Município</th>
                <th style={th}>Data Abertura</th>
                <th style={th}>Etapa / Diretórios</th>
                <th style={th}>Status</th>
                <th style={{ ...th, width: 70, textAlign: 'center' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0
                ? <tr><td colSpan={8} style={{ padding: '52px', textAlign: 'center', color: '#9ca3af' }}><i className="bi bi-search" style={{ fontSize: 34, display: 'block', marginBottom: 8 }} />Nenhum registro encontrado.</td></tr>
                : pageData.map((r, ri) => (
                  <tr key={r.id}
                    style={{ borderBottom: '1px solid #f3f4f6', background: ri % 2 === 0 ? '#fff' : '#fafafa' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 0 ? '#fff' : '#fafafa'}>
                    <td style={td}><span style={{ fontFamily: 'monospace', fontSize: 10.5, background: '#f1f5f9', borderRadius: 4, padding: '2px 6px', color: '#374151' }}>{r.protocolo}</span></td>
                    <td style={{ ...td, fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nome}</td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>{r.cpf}</td>
                    <td style={td}><strong>{r.uf}</strong> / {r.municipio}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.dtAbertura}</td>
                    <td style={td}><StepTracker item={r} /></td>
                    <td style={td}><StatusBadge status={r.status} /></td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <button onClick={() => setModal(r)} style={{ padding: '5px 12px', border: '1.5px solid #2563eb', borderRadius: 6, background: '#fff', color: '#2563eb', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <i className="bi bi-eye-fill" /> Ver
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        )}

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f4fb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              Mostrando <strong style={{ color: '#2563eb' }}>{filtered.length === 0 ? 0 : (page-1)*PAGE_SIZE+1}</strong>–<strong style={{ color: '#2563eb' }}>{Math.min(page*PAGE_SIZE, filtered.length)}</strong> de <strong>{filtered.length}</strong>
            </span>
            <span style={{ fontSize: 11, color: '#9ca3af', borderLeft: '1px solid #e5e7eb', paddingLeft: 14 }}>
              <i className="bi bi-clock" style={{ marginRight: 4 }} />Atualizado: {LAST_SYNC}
            </span>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 3 }}>
              {[
                { label:'«', go:1 }, { label:'‹', go:page-1 },
                ...Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const s = Math.max(1, Math.min(page-2, totalPages-4));
                  return { label: String(s+i), go: s+i };
                }),
                { label:'›', go:page+1 }, { label:'»', go:totalPages },
              ].map(({ label, go }, i) => (
                <button key={i} onClick={() => setPage(Math.max(1, Math.min(go, totalPages)))}
                  disabled={go < 1 || go > totalPages || go === page}
                  style={{ minWidth: 30, height: 28, padding: '0 8px', border: `1px solid ${go === page ? '#2563eb' : '#e5e7eb'}`, borderRadius: 5, background: go === page ? '#2563eb' : '#fff', color: go === page ? '#fff' : go < 1 || go > totalPages ? '#d1d5db' : '#374151', fontSize: 12, cursor: go === page || go < 1 || go > totalPages ? 'default' : 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal && <VerModal item={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
