import React, { useState, useMemo } from 'react';
import type { NavigateFn, Perfil } from '../../types';
import DataTable, { Column } from '../../components/shared/DataTable';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import CustomSelect from '../../components/shared/CustomSelect';
import { MOCK_PERFIS } from '../../data/mockData';

// ── Types ──────────────────────────────────────────────────────────────────────
interface PermItem { label: string; visualizar: boolean; criar: boolean; editar: boolean; excluir: boolean }
interface Permission { modulo: string; icon: string; items: PermItem[] }
type ModalTab = 'dados' | 'permissoes';
type ModalMode = 'view' | 'edit';
interface PerfilForm { nome: string; identificador1doc: string; situacao: 'Ativo' | 'Inativo' }

const PERM_COLS: Array<keyof Omit<PermItem, 'label'>> = ['visualizar', 'criar', 'editar', 'excluir'];
const PERM_COL_LABELS: Record<keyof Omit<PermItem, 'label'>, string> = {
  visualizar: 'Visualizar', criar: 'Criar', editar: 'Editar', excluir: 'Excluir',
};

const DEFAULT_PERMS: Permission[] = [
  { modulo: 'Mandatários',              icon: 'bi-people-fill',      items: [{ label: 'Consultar Mandatários', visualizar: true,  criar: false, editar: false, excluir: false }] },
  { modulo: 'Filiação Partidária',      icon: 'bi-diagram-3-fill',   items: [{ label: 'Consultar Filiados',    visualizar: true,  criar: false, editar: false, excluir: false }] },
  { modulo: 'Órgãos Partidários',       icon: 'bi-bank2',            items: [{ label: 'Consultar Órgãos',      visualizar: true,  criar: false, editar: false, excluir: false }] },
  { modulo: 'Dirigentes',               icon: 'bi-person-badge-fill',items: [{ label: 'Consultar Dirigentes',  visualizar: true,  criar: false, editar: false, excluir: false }] },
  { modulo: 'Business Intelligence',    icon: 'bi-speedometer2',     items: [{ label: 'Painel BI',             visualizar: true,  criar: false, editar: false, excluir: false }] },
  { modulo: 'Configurações — Perfis',   icon: 'bi-person-gear', items: [
    { label: 'Gerenciar Perfis', visualizar: true, criar: true, editar: true, excluir: false },
    { label: 'Permissões',       visualizar: true, criar: true, editar: true, excluir: false },
  ]},
  { modulo: 'Configurações — Usuários', icon: 'bi-people-fill',      items: [{ label: 'Gerenciar Usuários',    visualizar: true,  criar: true,  editar: true,  excluir: false }] },
  { modulo: 'Log de Acesso',            icon: 'bi-clock-history',    items: [{ label: 'Visualizar Log',        visualizar: true,  criar: false, editar: false, excluir: false }] },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function SituacaoBadge({ s }: { s: string }) {
  const ok = s === 'Ativo';
  return <span style={{ background: ok ? '#dcfce7' : '#fee2e2', color: ok ? '#15803d' : '#dc2626', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{s}</span>;
}

function getModuleStatus(mod: Permission): { label: string; bg: string; color: string } {
  const allChips = mod.items.flatMap(item => PERM_COLS.map(k => item[k]));
  const active = allChips.filter(Boolean).length;
  if (active === 0) return { label: 'Sem acesso', bg: '#f3f4f6', color: '#6b7280' };
  if (active === allChips.length) return { label: 'Acesso total', bg: '#dcfce7', color: '#15803d' };
  const onlyRead = mod.items.every(i => i.visualizar && !i.criar && !i.editar && !i.excluir);
  if (onlyRead) return { label: 'Somente leitura', bg: '#dbeafe', color: '#1d4ed8' };
  return { label: 'Parcial', bg: '#fef3c7', color: '#d97706' };
}

const FIELD_LABEL: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 };
const FIELD_VALUE: React.CSSProperties = { fontSize: 14, color: '#111827', fontWeight: 400 };
const INP: React.CSSProperties = { width: '100%', height: 42, padding: '0 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif', color: '#111827' };
const SITUACAO_OPTS = [{ value: 'Ativo', label: 'Ativo' }, { value: 'Inativo', label: 'Inativo' }];

const BTN_GHOST: React.CSSProperties = { padding: '8px 18px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#374151', fontFamily: 'Open Sans, sans-serif' };
const BTN_PRIMARY: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: 'none', borderRadius: 8, background: '#00963F', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' };

// ── Permission chip ────────────────────────────────────────────────────────────
function PermChip({ label, active, onToggle, isDelete = false }: { label: string; active: boolean; onToggle: () => void; isDelete?: boolean }) {
  const [hover, setHover] = useState(false);
  let bg: string, color: string, border: string;
  if (active) {
    bg     = isDelete ? '#fee2e2' : '#dcfce7';
    color  = isDelete ? '#dc2626' : '#15803d';
    border = isDelete ? '1px solid #fca5a5' : '1px solid #86efac';
  } else if (hover) {
    bg     = '#fff';
    color  = isDelete ? '#dc2626' : '#15803d';
    border = isDelete ? '1px solid #fca5a5' : '1px solid #86efac';
  } else {
    bg = '#fff'; color = '#9ca3af'; border = '1px solid #e5e7eb';
  }
  return (
    <button onClick={onToggle} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: bg, color, border, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', lineHeight: '18px', transition: 'all 0.12s' }}>
      {label}
    </button>
  );
}

// ── Module card (permissions tab) ──────────────────────────────────────────────
function ModuleCard({ mod, expanded, onToggleExpand, onTogglePerm, onToggleAll }: {
  mod: Permission; expanded: boolean;
  onToggleExpand: () => void;
  onTogglePerm: (ii: number, key: keyof Omit<PermItem, 'label'>) => void;
  onToggleAll: () => void;
}) {
  const status     = getModuleStatus(mod);
  const hasMulti   = mod.items.length > 1;
  const allActive  = mod.items.every(item => PERM_COLS.every(k => item[k]));

  return (
    <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
      {/* card header */}
      <div onClick={onToggleExpand}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#f8fafc', cursor: 'pointer', userSelect: 'none' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f0f4fb')}
        onMouseLeave={e => (e.currentTarget.style.background = '#f8fafc')}>
        <i className={`bi ${mod.icon}`} style={{ fontSize: 14, color: '#00963F', flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#111827' }}>{mod.modulo}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
          {hasMulti && (
            <button onClick={onToggleAll}
              style={{ background: 'none', border: 'none', color: '#00963F', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', padding: '2px 4px', textDecoration: 'underline' }}>
              {allActive ? 'Limpar tudo' : 'Tudo'}
            </button>
          )}
        </div>
        <span style={{ background: status.bg, color: status.color, borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {status.label}
        </span>
        <i className="bi bi-chevron-down"
          style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }} />
      </div>

      {/* card body */}
      {expanded && (
        <div style={{ borderTop: '0.5px solid #e5e7eb' }}>
          {mod.items.map((item, ii) => (
            <div key={item.label}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderBottom: ii < mod.items.length - 1 ? '0.5px solid #f3f4f6' : 'none' }}>
              <span style={{ fontSize: 12, color: '#374151' }}>{item.label}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {PERM_COLS.map(key => (
                  <PermChip key={key} label={PERM_COL_LABELS[key]} active={item[key]}
                    onToggle={() => onTogglePerm(ii, key)} isDelete={key === 'excluir'} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────────
const Spinner = () => (
  <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
);

// ── Modal ──────────────────────────────────────────────────────────────────────
function PerfilModal({ perfil, isCreating, initialTab = 'dados', onClose, onSave }: {
  perfil: Perfil; isCreating: boolean; initialTab?: ModalTab;
  onClose: () => void; onSave: (updated: Perfil) => void;
}) {
  const [tab,  setTab]  = useState<ModalTab>(initialTab);
  const [mode, setMode] = useState<ModalMode>(isCreating ? 'edit' : 'view');
  const [form, setForm] = useState<PerfilForm>({ nome: perfil.nome, identificador1doc: perfil.identificador1doc ?? '', situacao: perfil.situacao });
  const [errors, setErrors]       = useState<Partial<PerfilForm>>({});
  const [perms,  setPerms]        = useState<Permission[]>(DEFAULT_PERMS);
  const [saving,     setSaving]     = useState(false);
  const [permSaving, setPermSaving] = useState(false);
  const [expandedMods, setExpandedMods] = useState<Set<number>>(new Set());

  const validate = () => {
    const e: Partial<PerfilForm> = {};
    if (!form.nome.trim()) e.nome = 'Obrigatório';
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    setTimeout(() => {
      onSave({ ...perfil, ...form, identificador1doc: form.identificador1doc || undefined });
      setSaving(false);
      if (!isCreating) setMode('view');
    }, 600);
  };

  const handleSavePerms = () => {
    setPermSaving(true);
    setTimeout(() => setPermSaving(false), 600);
  };

  const togglePerm = (mi: number, ii: number, key: keyof Omit<PermItem, 'label'>) => {
    setPerms(prev => prev.map((m, i) => i !== mi ? m : {
      ...m, items: m.items.map((item, j) => j !== ii ? item : { ...item, [key]: !item[key] }),
    }));
  };

  const toggleAll = (mi: number) => {
    const allActive = perms[mi].items.every(item => PERM_COLS.every(k => item[k]));
    setPerms(prev => prev.map((m, i) => i !== mi ? m : {
      ...m, items: m.items.map(item => ({ ...item, visualizar: !allActive, criar: !allActive, editar: !allActive, excluir: !allActive })),
    }));
  };

  const toggleExpand = (mi: number) => {
    setExpandedMods(prev => {
      const next = new Set(prev);
      next.has(mi) ? next.delete(mi) : next.add(mi);
      return next;
    });
  };

  const cancelEdit = () => {
    if (isCreating) { onClose(); return; }
    setForm({ nome: perfil.nome, identificador1doc: perfil.identificador1doc ?? '', situacao: perfil.situacao });
    setErrors({});
    setMode('view');
  };

  const modulesWithAccess = perms.filter(mod => mod.items.some(item => PERM_COLS.some(k => item[k]))).length;
  const showFooter = (tab === 'dados' && mode === 'edit') || tab === 'permissoes';

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 1060 }} />

      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 560, maxWidth: 'calc(100vw - 32px)', height: '80vh', maxHeight: '90vh', background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.20)', zIndex: 1070, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ padding: '16px 20px 0', borderBottom: '1px solid #e5e7eb', flexShrink: 0, background: '#fff' }}>
          {/* top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#dcfce7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bi bi-person-gear" style={{ color: '#15803d', fontSize: 17 }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#111827', lineHeight: 1.3 }}>
                  {isCreating ? 'Novo Perfil' : perfil.nome}
                </div>
                {!isCreating && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>ID: {perfil.id}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {tab === 'dados' && mode === 'view' && !isCreating && (
                <button onClick={() => setMode('edit')}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', color: '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                  <i className="bi bi-pencil" style={{ fontSize: 11 }} /> Editar
                </button>
              )}
              <button onClick={onClose}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '2px 6px', borderRadius: 4 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9ca3af'; }}>
                ×
              </button>
            </div>
          </div>

          {/* tab bar */}
          <div style={{ display: 'flex' }}>
            {(['dados', 'permissoes'] as ModalTab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '8px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? '#00963F' : 'transparent'}`, background: 'none', color: tab === t ? '#00963F' : '#6b7280', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', marginBottom: -1, transition: 'color 0.15s' }}>
                {t === 'dados' ? 'Dados' : 'Permissões'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* Dados — view */}
          {tab === 'dados' && mode === 'view' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
              <div>
                <label style={FIELD_LABEL}>Nome do perfil</label>
                <div style={FIELD_VALUE}>{perfil.nome || '—'}</div>
              </div>
              <div>
                <label style={FIELD_LABEL}>Identificador 1Doc</label>
                <div style={FIELD_VALUE}>{perfil.identificador1doc || <span style={{ color: '#9ca3af' }}>—</span>}</div>
              </div>
              <div>
                <label style={FIELD_LABEL}>Situação</label>
                <SituacaoBadge s={perfil.situacao} />
              </div>
              <div>
                <label style={FIELD_LABEL}>Cadastrado em</label>
                <div style={FIELD_VALUE}>{perfil.cadastradoEm}</div>
              </div>
            </div>
          )}

          {/* Dados — edit */}
          {tab === 'dados' && mode === 'edit' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={FIELD_LABEL}>Nome do perfil *</label>
                <input style={{ ...INP, borderColor: errors.nome ? '#dc2626' : '#d1d5db' }}
                  value={form.nome}
                  onChange={e => { setForm(p => ({ ...p, nome: e.target.value })); setErrors(p => ({ ...p, nome: undefined })); }}
                  onFocus={e => (e.target.style.borderColor = '#00963F')}
                  onBlur={e => (e.target.style.borderColor = errors.nome ? '#dc2626' : '#d1d5db')} />
                {errors.nome && <div style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.nome}</div>}
              </div>
              <div>
                <label style={FIELD_LABEL}>Identificador 1Doc</label>
                <input style={INP}
                  value={form.identificador1doc}
                  onChange={e => setForm(p => ({ ...p, identificador1doc: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = '#00963F')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
              </div>
              <div>
                <label style={FIELD_LABEL}>Situação</label>
                <CustomSelect value={form.situacao} onChange={v => setForm(p => ({ ...p, situacao: v as 'Ativo' | 'Inativo' }))} options={SITUACAO_OPTS} placeholder="Selecione" />
              </div>
            </div>
          )}

          {/* Permissões */}
          {tab === 'permissoes' && (
            <div>
              {perms.map((mod, mi) => (
                <ModuleCard key={mod.modulo} mod={mod} expanded={expandedMods.has(mi)}
                  onToggleExpand={() => toggleExpand(mi)}
                  onTogglePerm={(ii, key) => togglePerm(mi, ii, key)}
                  onToggleAll={() => toggleAll(mi)} />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        {showFooter && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: '#fff' }}>
            {tab === 'permissoes'
              ? <span style={{ fontSize: 11, color: '#6b7280' }}>{modulesWithAccess} de {perms.length} módulos com acesso</span>
              : <span />}

            <div style={{ display: 'flex', gap: 8 }}>
              {tab === 'dados' && mode === 'edit' && (
                <>
                  <button onClick={cancelEdit} style={BTN_GHOST}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                    Cancelar
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    style={{ ...BTN_PRIMARY, background: saving ? '#4ade80' : '#00963F', cursor: saving ? 'default' : 'pointer' }}
                    onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#007A32'; }}
                    onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#00963F'; }}>
                    {saving ? <><Spinner /> Salvando…</> : <><i className="bi bi-floppy" /> Salvar</>}
                  </button>
                </>
              )}
              {tab === 'permissoes' && (
                <>
                  <button onClick={onClose} style={BTN_GHOST}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                    Fechar
                  </button>
                  <button onClick={handleSavePerms} disabled={permSaving}
                    style={{ ...BTN_PRIMARY, background: permSaving ? '#4ade80' : '#00963F', cursor: permSaving ? 'default' : 'pointer' }}
                    onMouseEnter={e => { if (!permSaving) e.currentTarget.style.background = '#007A32'; }}
                    onMouseLeave={e => { if (!permSaving) e.currentTarget.style.background = '#00963F'; }}>
                    {permSaving ? <><Spinner /> Salvando…</> : <><i className="bi bi-shield-check" /> Salvar permissões</>}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function PerfilListPage({ onNavigate }: { onNavigate: NavigateFn }) {
  const [search, setSearch]     = useState('');
  const [page,   setPage]       = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data,   setData]       = useState<Perfil[]>(MOCK_PERFIS);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [modal,  setModal]      = useState<{ perfil: Perfil; isCreating: boolean; initialTab?: ModalTab } | null>(null);

  const filtered = useMemo(() => data.filter(p => !search || p.nome.toLowerCase().includes(search.toLowerCase())), [data, search]);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const doDelete = () => {
    if (deleteId !== null) setData(p => p.filter(x => x.id !== deleteId));
    setDeleteId(null);
  };

  const openCreate = () => setModal({
    perfil: { id: Date.now(), nome: '', situacao: 'Ativo', identificador1doc: '', cadastradoEm: new Date().toLocaleDateString('pt-BR') },
    isCreating: true,
  });

  const handleSave = (updated: Perfil) => {
    setData(p => modal?.isCreating ? [...p, updated] : p.map(x => x.id === updated.id ? updated : x));
    if (modal?.isCreating) {
      setModal(null);
    } else {
      setModal(prev => prev ? { ...prev, perfil: updated } : null);
    }
  };

  const columns: Column<Perfil>[] = [
    { key: 'nome', label: 'Nome do perfil' },
    { key: 'identificador1doc', label: 'Identificador 1Doc', render: r => r.identificador1doc || '—' },
    { key: 'situacao', label: 'Situação', render: r => <SituacaoBadge s={r.situacao} /> },
    { key: 'cadastradoEm', label: 'Cadastrado em', width: 180 },
    {
      key: 'acoes', label: 'Ações', sortable: false, width: 124,
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
          <button onClick={() => setModal({ perfil: r, isCreating: false, initialTab: 'dados' })}
            style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', color: '#374151', fontSize: 12, fontWeight: 500, fontFamily: 'Open Sans, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <i className="bi bi-eye" style={{ fontSize: 12 }} /> Ver
          </button>
          <button title="Permissões" onClick={() => setModal({ perfil: r, isCreating: false, initialTab: 'permissoes' })}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', color: '#00963F', fontSize: 13, flexShrink: 0, padding: 0 }}>
            <i className="bi bi-shield-check" />
          </button>
          <button title="Excluir" onClick={() => setDeleteId(r.id)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: '#fff', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', color: '#dc2626', fontSize: 13, flexShrink: 0, padding: 0 }}>
            <i className="bi bi-trash" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Perfis</h1>
          <nav style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            <span style={{ cursor: 'pointer', color: '#00963F' }} onClick={() => onNavigate('home')}>Início</span>
            {' › '}Configurações{' › '}Perfis
          </nav>
        </div>
        <button onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', borderRadius: 8, background: '#00963F', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#007A32')}
          onMouseLeave={e => (e.currentTarget.style.background = '#00963F')}>
          <i className="bi bi-plus-circle-fill" /> Novo perfil
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14, pointerEvents: 'none' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar perfil..."
              style={{ width: '100%', height: 38, paddingLeft: 36, paddingRight: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif' }}
              onFocus={e => (e.target.style.borderColor = '#00963F')}
              onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
          </div>
        </div>
        <DataTable columns={columns as unknown as Column<Record<string, unknown>>[]} data={pageData as unknown as Record<string, unknown>[]} totalRecords={filtered.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} emptyMessage="Nenhum perfil encontrado." />
      </div>

      {modal && (
        <PerfilModal key={modal.perfil.id ?? 'new'} perfil={modal.perfil} isCreating={modal.isCreating} initialTab={modal.initialTab} onClose={() => setModal(null)} onSave={handleSave} />
      )}

      <ConfirmDialog open={deleteId !== null} title="Excluir perfil" message="Esta ação não pode ser desfeita. O perfil será removido permanentemente." confirmLabel="Excluir" confirmVariant="danger" onConfirm={doDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
