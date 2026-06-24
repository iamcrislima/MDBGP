import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { NavigateFn } from '../types';
import DatePicker from '../components/shared/DatePicker';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { type Etapa, type StatusFP, type HistEntry, type FP, ETAPAS, FP_UF_MUNS as UF_MUNS, MOCK_FP } from '../data/mockFP';
import Badge, { type BadgeVariant } from '../components/shared/Badge';
import CustomSelect from '../components/shared/CustomSelect';
import Button from '../components/shared/Button';
import EmptyState from '../components/shared/EmptyState';
import ModalBase from '../components/shared/ModalBase';
import Pagination from '../components/shared/Pagination';
import Avatar from '../components/shared/Avatar';
import KPICard from '../components/shared/KPICard';
import PageHeader from '../components/shared/PageHeader';

type Opt = { value: string; label: string };

/* ─── constants ─────────────────────────────────────────────────────────── */
const STATUS_CFG: Record<StatusFP, { bg: string; color: string; icon: string }> = {
  'Pendente':   { bg: '#fff7ed', color: '#c2410c', icon: 'bi-clock-fill' },
  'Deferido':   { bg: '#dcfce7', color: 'var(--color-success)', icon: 'bi-check-circle-fill' },
  'Indeferido': { bg: '#fee2e2', color: 'var(--color-error)', icon: 'bi-x-circle-fill' },
};

const LAST_SYNC = '18/06/2026 às 15:47:23';
const PAGE_SIZE = 10;


/* ─── StepTracker with portal tooltip ──────────────────────────────────── */
function StepTracker({ item }: { item: FP }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null);
  const idx = ETAPAS.indexOf(item.etapa);
  const rejected = item.status === 'Indeferido';

  const dotStyle = (i: number) => {
    const done = i < idx;
    const curr = i === idx;
    if (curr && rejected) return { bg: '#fee2e2', border: 'var(--color-error)', iconColor: 'var(--color-error)', icon: 'bi-x-lg' };
    if (done)             return { bg: 'var(--color-primary)', border: 'var(--color-primary)', iconColor: '#fff', icon: 'bi-check-lg' };
    if (curr)             return { bg: '#fef3c7', border: '#f59e0b', iconColor: '#f59e0b', icon: '' };
    return { bg: '#fff', border: 'var(--color-border-input)', iconColor: '', icon: '' };
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
                {curr && rejected && <i className="bi bi-x-lg" style={{ fontSize: 7, color: 'var(--color-error)', lineHeight: 1 }} />}
              </div>
              {i < 3 && <div style={{ width: 14, height: 2, background: done ? 'var(--color-primary)' : 'var(--color-border)', flexShrink: 0 }} />}
            </React.Fragment>
          );
        })}
      </div>
      {/* portal tooltip */}
      {tip && createPortal(
        <div style={{ position: 'fixed', top: tip.top, left: tip.left, zIndex: 9000, background: 'var(--color-text-strong)', borderRadius: 10, padding: '12px 16px', width: 240, boxShadow: '0 12px 32px rgba(0,0,0,0.3)', pointerEvents: 'none', fontFamily: 'Open Sans, sans-serif' }}>
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


function statusFPVariant(s: StatusFP): BadgeVariant {
  if (s === 'Deferido') return 'success';
  if (s === 'Indeferido') return 'error';
  return 'pendente';
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
  if (err) return <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}><Avatar nome={nome} size={size} palette="auto" style={{ border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} /></div>;
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


/* ─── Modal helpers ─────────────────────────────────────────────────────── */
function ModalSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ width: 24, height: 24, background: '#eff6ff', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={`bi ${icon}`} style={{ color: 'var(--color-primary)', fontSize: 12 }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-text-dark)' }}>{title}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>{children}</div>
    </div>
  );
}

function MF({ label, value, full, link }: { label: string; value: string; full?: boolean; link?: string }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
      {link
        ? <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{value}</span>
            <i className="bi bi-box-arrow-up-right" style={{ fontSize: 10, flexShrink: 0 }} />
          </a>
        : <div style={{ fontSize: 13, color: 'var(--color-text-strong)', fontWeight: 500 }}>{value}</div>
      }
    </div>
  );
}

function IndicadorRow({ label, ok, value }: { label: string; ok: boolean; value?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-bg-subtle)' }}>
      <span style={{ fontSize: 12, color: 'var(--color-text-dark)' }}>{label}</span>
      {value
        ? <Badge variant={statusFPVariant(value as StatusFP)} label={value} icon={STATUS_CFG[value as StatusFP].icon} />
        : <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: ok ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
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
  return (
    <div style={{ width: 280, height: 280, borderRadius: '50%', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', transform: ready ? 'scale(1)' : 'scale(0.8)', transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1)', flexShrink: 0 }}>
      {err ? (
        <Avatar nome={nome} size={280} palette="gradient-green" style={{ fontSize: 80, fontWeight: 800 }} />
      ) : (
        <img src={url} alt={nome} onError={() => setErr(true)} onLoad={() => setReady(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
    </div>
  );
}

/* ─── VerModal ──────────────────────────────────────────────────────────── */
function VerModal({ item, onClose }: { item: FP; onClose: () => void }) {
  const [lightbox, setLightbox] = useState(false);

  // Escape closes lightbox first, then modal
  const handleClose = () => { if (lightbox) { setLightbox(false); } else { onClose(); } };

  return (
    <ModalBase open={true} onClose={handleClose} width={720} backdropOpacity={0.6} backdropBlur={4}>

        {/* Lightbox */}
        {lightbox && (
          <div
            onClick={() => setLightbox(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1090, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}
          >
            <LightboxPhoto cpf={item.cpf} nome={item.nome} />
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 600, fontFamily: 'Open Sans, sans-serif' }}>{item.nome}</div>
            <Button variant="ghost" onClick={() => setLightbox(false)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 12 }}>Fechar</Button>
          </div>
        )}

      <ModalBase.NavyHeader
        onClose={handleClose}
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <Badge variant={statusFPVariant(item.status)} label={item.status} icon={STATUS_CFG[item.status].icon} />
            <Button variant="icon" size="sm" onClick={handleClose} style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)' }}>×</Button>
          </div>
        }
      >
        <PersonPhoto cpf={item.cpf} nome={item.nome} size={56} onClick={() => setLightbox(true)} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nome}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
            <span><i className="bi bi-person-vcard" style={{ marginRight: 4 }} />{item.cpf}</span>
            <span><i className="bi bi-calendar3" style={{ marginRight: 4 }} />{item.dtNasc}</span>
            <span><i className="bi bi-geo-alt-fill" style={{ marginRight: 4 }} />{item.domEleitoral}</span>
          </div>
        </div>
      </ModalBase.NavyHeader>

      <ModalBase.Body padding="18px 22px">

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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-bg-subtle)' }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-dark)' }}>Data/hora do processo interno de filiação</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-strong)' }}>{item.dtProcessoInterno}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-dark)' }}>Status do processo interno</span>
                <Badge variant={statusFPVariant(item.status)} label={item.status} icon={STATUS_CFG[item.status].icon} />
              </div>
            </div>
          </ModalSection>

      </ModalBase.Body>

      <ModalBase.Footer style={{ justifyContent: 'space-between', padding: '14px 22px' }}>
        <Button variant="ghost" onClick={handleClose}>Fechar</Button>
        <a href={item.processoLink} target="_blank" rel="noopener noreferrer"
          style={{ padding: '9px 20px', border: 'none', borderRadius: 8, background: 'var(--color-primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
          <i className="bi bi-box-arrow-up-right" />
          Abrir processo na 1doc
        </a>
      </ModalBase.Footer>
    </ModalBase>
  );
}

/* ─── Filter state ──────────────────────────────────────────────────────── */
const EMPTY_F = { nome:'', uf:'', municipio:'', etapa:'', status:'', processo:'', dtAbertura:'', enviado:'' };

/* ─── Main page ─────────────────────────────────────────────────────────── */
export default function GerenciarFiliadosPage({ onNavigate }: { onNavigate: NavigateFn }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [modal, setModal] = useState<FP | null>(null);
  const [f, setF] = useState({ ...EMPTY_F });
  const [a, setA] = useState({ ...EMPTY_F });
  const [page, setPage] = useState(1);

  useEffect(() => {
    const raw = sessionStorage.getItem('fp-filter');
    if (!raw) return;
    try {
      const { uf, status } = JSON.parse(raw) as { uf?: string; status?: string };
      if (uf || status) {
        const patch = { ...EMPTY_F, uf: uf ?? '', status: status ?? '' };
        setF(patch);
        setA(patch);
        setPage(1);
      }
    } catch {}
    sessionStorage.removeItem('fp-filter');
  }, []);

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
    conferencia:  MOCK_FP.filter(r => r.etapa === 'Conferência').length,
    indeferido:   MOCK_FP.filter(r => r.status === 'Indeferido').length,
  }), []);

  const apply = () => { setA({ ...f }); setPage(1); };
  const clear  = () => { setF({ ...EMPTY_F }); setA({ ...EMPTY_F }); setPage(1); };
  const set    = (k: keyof typeof f) => (v: string) => setF(p => ({ ...p, [k]: v }));

  const lb: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 };
  const th: React.CSSProperties = { padding: '9px 12px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'var(--color-text-dark)', borderBottom: '2px solid var(--color-border)', background: 'var(--color-bg-input)', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '10px 12px', fontSize: 12, color: 'var(--color-text-dark)', verticalAlign: 'top' };

  const etapaOpts = ETAPAS.map(e => ({ value: e, label: e }));
  const statusOpts: Opt[] = [{ value:'Pendente', label:'Pendente' }, { value:'Deferido', label:'Deferido' }, { value:'Indeferido', label:'Indeferido' }];
  const ufOpts = Object.keys(UF_MUNS).sort().map(u => ({ value: u, label: u }));
  const munOpts = ufMuns.map(m => ({ value: m, label: m }));

  const enviadoOpts: Opt[] = [{ value:'Sim', label:'Sim' }, { value:'Não', label:'Não' }];

  return (
    <div style={{ padding: isMobile ? '16px' : '24px 28px', fontFamily: 'Open Sans, sans-serif' }}>

      <PageHeader
        title="Gerenciar Filiados"
        breadcrumb={[
          { label: 'Início', onClick: () => onNavigate('home') },
          { label: 'Filiação Partidária' },
          { label: 'Gerenciar Filiados' },
        ]}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '7px 12px' }}>
            <i className="bi bi-arrow-repeat" style={{ color: 'var(--color-primary)' }} />
            Última sincronização com 1doc: <strong style={{ color: 'var(--color-text-dark)' }}>{LAST_SYNC}</strong>
          </div>
        }
      />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : isTablet ? 'repeat(3,1fr)' : 'repeat(5,1fr)', gap: 14, marginBottom: 20 }}>
        <KPICard title="Total de solicitações" value={kpi.total.toLocaleString('pt-BR')}        icon="bi-clipboard2-data-fill" borderColor="var(--color-primary)" iconShape="rounded" valueSize={26} valueWeight={800} />
        <KPICard title="Publicidade"           value={kpi.publicidade.toLocaleString('pt-BR')}  icon="bi-megaphone-fill"        borderColor="var(--color-text-secondary)" iconShape="rounded" valueSize={26} valueWeight={800} />
        <KPICard title="Filiação"              value={kpi.filiacao.toLocaleString('pt-BR')}     icon="bi-person-plus-fill"      borderColor="#3b82f6" iconShape="rounded" valueSize={26} valueWeight={800} />
        <KPICard title="Conferência"           value={kpi.conferencia.toLocaleString('pt-BR')}  icon="bi-building-check"        borderColor="#f59e0b" iconShape="rounded" valueSize={26} valueWeight={800} />
        <KPICard title="Indeferidos"           value={kpi.indeferido.toLocaleString('pt-BR')}   icon="bi-x-circle-fill"         borderColor="#ef4444" iconShape="rounded" valueSize={26} valueWeight={800} />
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-dark)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="bi bi-funnel-fill" style={{ color: 'var(--color-primary)' }} /> Filtros
        </div>
        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr 1fr' : '2fr 1fr 1.3fr 1.3fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={lb}>Nome / CPF</label>
            <input value={f.nome} onChange={e => setF(p => ({ ...p, nome: e.target.value }))} placeholder="Digite nome ou CPF…"
              style={{ height: 36, padding: '0 10px', border: '1.5px solid var(--color-border-input)', borderRadius: 7, fontSize: 12, outline: 'none', fontFamily: 'Open Sans, sans-serif', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border-input)'} />
          </div>
          <div><label style={lb}>UF</label><CustomSelect value={f.uf} onChange={v => setF(p => ({ ...p, uf: v, municipio: '' }))} options={ufOpts} placeholder="Todas" /></div>
          <div><label style={lb}>Município</label><CustomSelect value={f.municipio} onChange={set('municipio')} options={munOpts} placeholder="Todos" disabled={!f.uf} /></div>
          <div><label style={lb}>Etapa</label><CustomSelect value={f.etapa} onChange={set('etapa')} options={etapaOpts} placeholder="Todas" /></div>
          <div><label style={lb}>Status</label><CustomSelect value={f.status} onChange={set('status')} options={statusOpts} placeholder="Todos" /></div>
        </div>
        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '2fr 1fr 1.3fr auto auto', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label style={lb}>Nº do Processo 1doc</label>
            <input value={f.processo} onChange={e => setF(p => ({ ...p, processo: e.target.value }))} placeholder="Ex: PROC-2024-000001"
              style={{ height: 36, padding: '0 10px', border: '1.5px solid var(--color-border-input)', borderRadius: 7, fontSize: 12, outline: 'none', fontFamily: 'Open Sans, sans-serif', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border-input)'} />
          </div>
          <div>
            <label style={lb}>Data de Abertura</label>
            <DatePicker value={f.dtAbertura} onChange={v => setF(p => ({ ...p, dtAbertura: v }))} />
          </div>

          <div><label style={lb}>Enviado ao diretório</label><CustomSelect value={f.enviado} onChange={set('enviado')} options={enviadoOpts} placeholder="Todos" /></div>
          <Button variant="ghost" size="sm" onClick={clear} icon="bi-x-circle">Limpar</Button>
          <Button variant="primary" size="sm" onClick={apply} icon="bi-funnel-fill">Filtrar</Button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
        {isMobile ? (
          /* ── Mobile cards ── */
          <div style={{ padding: '12px' }}>
            {pageData.length === 0 ? (
              <EmptyState icon="bi-search" title="Nenhum registro encontrado." />
            ) : (
              <div className="mobile-card-list">
                {pageData.map(r => (
                  <div key={r.id} style={{ background: '#fff', border: '1px solid #dde3ee', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', borderRadius: 4, padding: '2px 6px', color: 'var(--color-text-dark)' }}>{r.protocolo}</span>
                      <Badge variant={statusFPVariant(r.status)} label={r.status} icon={STATUS_CFG[r.status].icon} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 2 }}>{r.nome}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2, fontFamily: 'monospace' }}>{r.cpf}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}><strong>{r.uf}</strong> · {r.municipio} · {r.dtAbertura}</div>
                    <div style={{ marginBottom: 10 }}><StepTracker item={r} /></div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="ghost-primary" size="sm" onClick={() => setModal(r)} icon="bi-eye-fill">Ver</Button>
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
                ? <tr><td colSpan={8}><EmptyState icon="bi-search" title="Nenhum registro encontrado." /></td></tr>
                : pageData.map((r, ri) => (
                  <tr key={r.id}
                    style={{ borderBottom: '1px solid var(--color-bg-page)', background: ri % 2 === 0 ? '#fff' : '#fafafa' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 0 ? '#fff' : '#fafafa'}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 10.5, background: '#f1f5f9', borderRadius: 4, padding: '2px 6px', color: 'var(--color-text-dark)' }}>{r.protocolo}</span>
                        <a href={r.processoLink} target="_blank" rel="noopener noreferrer" title="Abrir processo no 1Doc" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, background: '#1351b4', borderRadius: 4, color: '#fff', textDecoration: 'none', flexShrink: 0 }}>
                          <i className="bi bi-box-arrow-up-right" style={{ fontSize: 10 }} />
                        </a>
                      </div>
                    </td>
                    <td style={{ ...td, fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nome}</td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>{r.cpf}</td>
                    <td style={td}><strong>{r.uf}</strong> / {r.municipio}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.dtAbertura}</td>
                    <td style={td}><StepTracker item={r} /></td>
                    <td style={td}><Badge variant={statusFPVariant(r.status)} label={r.status} icon={STATUS_CFG[r.status].icon} /></td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <Button variant="ghost-primary" size="sm" onClick={() => setModal(r)} icon="bi-eye-fill">Ver</Button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        )}

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            itemsPerPage={PAGE_SIZE}
          />
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="bi bi-clock" style={{ fontSize: 11, color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Atualizado: {LAST_SYNC}</span>
          </div>
        </div>
      </div>

      {modal && <VerModal item={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
