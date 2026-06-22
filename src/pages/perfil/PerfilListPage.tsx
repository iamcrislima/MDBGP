import React, { useState, useMemo } from 'react';
import type { NavigateFn, Perfil } from '../../types';
import DataTable, { Column } from '../../components/shared/DataTable';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import CustomSelect from '../../components/shared/CustomSelect';
import { MOCK_PERFIS } from '../../data/mockData';
import Badge, { type BadgeVariant } from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import ModalBase from '../../components/shared/ModalBase';
import PageHeader from '../../components/shared/PageHeader';

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
function getModuleStatus(mod: Permission): { label: string; variant: BadgeVariant } {
  const allChips = mod.items.flatMap(item => PERM_COLS.map(k => item[k]));
  const active = allChips.filter(Boolean).length;
  if (active === 0) return { label: 'Sem acesso', variant: 'neutral' };
  if (active === allChips.length) return { label: 'Acesso total', variant: 'success' };
  const onlyRead = mod.items.every(i => i.visualizar && !i.criar && !i.editar && !i.excluir);
  if (onlyRead) return { label: 'Somente leitura', variant: 'info' };
  return { label: 'Parcial', variant: 'warning' };
}

const FIELD_LABEL: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 };
const FIELD_VALUE: React.CSSProperties = { fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 400 };
const INP: React.CSSProperties = { width: '100%', height: 42, padding: '0 12px', border: '1.5px solid var(--color-border-input)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif', color: 'var(--color-text-primary)' };
const SITUACAO_OPTS = [{ value: 'Ativo', label: 'Ativo' }, { value: 'Inativo', label: 'Inativo' }];


// ── Permission chip ────────────────────────────────────────────────────────────
function PermChip({ label, active, onToggle, isDelete = false }: { label: string; active: boolean; onToggle: () => void; isDelete?: boolean }) {
  const [hover, setHover] = useState(false);
  let bg: string, color: string, border: string;
  if (active) {
    bg     = isDelete ? '#fee2e2' : '#dcfce7';
    color  = isDelete ? 'var(--color-error)' : 'var(--color-success)';
    border = isDelete ? '1px solid #fca5a5' : '1px solid #86efac';
  } else if (hover) {
    bg     = '#fff';
    color  = isDelete ? 'var(--color-error)' : 'var(--color-success)';
    border = isDelete ? '1px solid #fca5a5' : '1px solid #86efac';
  } else {
    bg = '#fff'; color = 'var(--color-text-muted)'; border = '1px solid var(--color-border)';
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
    <div style={{ border: '0.5px solid var(--color-border)', borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
      {/* card header */}
      <div onClick={onToggleExpand}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--color-bg-input)', cursor: 'pointer', userSelect: 'none' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-subtle)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-bg-input)')}>
        <i className={`bi ${mod.icon}`} style={{ fontSize: 14, color: 'var(--color-primary)', flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{mod.modulo}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
          {hasMulti && (
            <Button variant="link" onClick={onToggleAll} style={{ fontSize: 11, textDecoration: 'underline' }}>
              {allActive ? 'Limpar tudo' : 'Tudo'}
            </Button>
          )}
        </div>
        <Badge variant={status.variant} label={status.label} size="sm" />
        <i className="bi bi-chevron-down"
          style={{ fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }} />
      </div>

      {/* card body */}
      {expanded && (
        <div style={{ borderTop: '0.5px solid var(--color-border)' }}>
          {mod.items.map((item, ii) => (
            <div key={item.label}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderBottom: ii < mod.items.length - 1 ? '0.5px solid var(--color-bg-page)' : 'none' }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-dark)' }}>{item.label}</span>
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
    <ModalBase open={true} onClose={onClose} width={560} height="80vh" shadow="light" backdropBlur={3}>

      <ModalBase.LightHeader
        onClose={onClose}
        actions={tab === 'dados' && mode === 'view' && !isCreating
          ? <Button variant="ghost" size="sm" onClick={() => setMode('edit')} icon="bi-pencil">Editar</Button>
          : undefined
        }
        tabs={
          <>
            {(['dados', 'permissoes'] as ModalTab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '8px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--color-primary)' : 'transparent'}`, background: 'none', color: tab === t ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', marginBottom: -1, transition: 'color 0.15s' }}>
                {t === 'dados' ? 'Dados' : 'Permissões'}
              </button>
            ))}
          </>
        }
      >
        <div style={{ width: 36, height: 36, background: '#dcfce7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className="bi bi-person-gear" style={{ color: 'var(--color-success)', fontSize: 17 }} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
            {isCreating ? 'Novo Perfil' : perfil.nome}
          </div>
          {!isCreating && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 1 }}>ID: {perfil.id}</div>}
        </div>
      </ModalBase.LightHeader>

      <ModalBase.Body padding="20px">

          {/* Dados — view */}
          {tab === 'dados' && mode === 'view' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
              <div>
                <label style={FIELD_LABEL}>Nome do perfil</label>
                <div style={FIELD_VALUE}>{perfil.nome || '—'}</div>
              </div>
              <div>
                <label style={FIELD_LABEL}>Identificador 1Doc</label>
                <div style={FIELD_VALUE}>{perfil.identificador1doc || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}</div>
              </div>
              <div>
                <label style={FIELD_LABEL}>Situação</label>
                <Badge variant={perfil.situacao === 'Ativo' ? 'success' : 'error'} label={perfil.situacao} />
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
                <input style={{ ...INP, borderColor: errors.nome ? 'var(--color-error)' : 'var(--color-border-input)' }}
                  value={form.nome}
                  onChange={e => { setForm(p => ({ ...p, nome: e.target.value })); setErrors(p => ({ ...p, nome: undefined })); }}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.target.style.borderColor = errors.nome ? 'var(--color-error)' : 'var(--color-border-input)')} />
                {errors.nome && <div style={{ color: 'var(--color-error)', fontSize: 11, marginTop: 3 }}>{errors.nome}</div>}
              </div>
              <div>
                <label style={FIELD_LABEL}>Identificador 1Doc</label>
                <input style={INP}
                  value={form.identificador1doc}
                  onChange={e => setForm(p => ({ ...p, identificador1doc: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
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
      </ModalBase.Body>

      {showFooter && (
        <ModalBase.Footer style={{ justifyContent: 'space-between' }}>
          {tab === 'permissoes'
            ? <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{modulesWithAccess} de {perms.length} módulos com acesso</span>
            : <span />}

          <div style={{ display: 'flex', gap: 8 }}>
            {tab === 'dados' && mode === 'edit' && (
              <>
                <Button variant="ghost" onClick={cancelEdit}>Cancelar</Button>
                <Button variant="primary" onClick={handleSave} loading={saving} icon="bi-floppy">
                  {saving ? 'Salvando…' : 'Salvar'}
                </Button>
              </>
            )}
            {tab === 'permissoes' && (
              <>
                <Button variant="ghost" onClick={onClose}>Fechar</Button>
                <Button variant="primary" onClick={handleSavePerms} loading={permSaving} icon="bi-shield-check">
                  {permSaving ? 'Salvando…' : 'Salvar permissões'}
                </Button>
              </>
            )}
          </div>
        </ModalBase.Footer>
      )}
    </ModalBase>
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
    { key: 'situacao', label: 'Situação', render: r => <Badge variant={r.situacao === 'Ativo' ? 'success' : 'error'} label={r.situacao} /> },
    { key: 'cadastradoEm', label: 'Cadastrado em', width: 180 },
    {
      key: 'acoes', label: 'Ações', sortable: false, width: 124,
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
          <Button variant="ghost" size="sm" onClick={() => setModal({ perfil: r, isCreating: false, initialTab: 'dados' })} icon="bi-eye">Ver</Button>
          <Button variant="icon" size="sm" title="Permissões" onClick={() => setModal({ perfil: r, isCreating: false, initialTab: 'permissoes' })} icon="bi-shield-check" style={{ color: 'var(--color-primary)', border: '1px solid var(--color-border)' }} />
          <Button variant="icon" size="sm" title="Excluir" onClick={() => setDeleteId(r.id)} icon="bi-trash" style={{ color: 'var(--color-error)', border: '1px solid #fca5a5' }} />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <PageHeader
        title="Perfis"
        breadcrumb={[
          { label: 'Início', onClick: () => onNavigate('home') },
          { label: 'Configurações' },
          { label: 'Perfis' },
        ]}
        action={<Button variant="primary" onClick={openCreate} icon="bi-plus-circle-fill">Novo perfil</Button>}
      />

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 14, pointerEvents: 'none' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar perfil..."
              style={{ width: '100%', height: 38, paddingLeft: 36, paddingRight: 12, border: '1px solid var(--color-border-input)', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif' }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
          </div>
        </div>
        <DataTable<Perfil> columns={columns} data={pageData} totalRecords={filtered.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} emptyMessage="Nenhum perfil encontrado." />
      </div>

      {modal && (
        <PerfilModal key={modal.perfil.id ?? 'new'} perfil={modal.perfil} isCreating={modal.isCreating} initialTab={modal.initialTab} onClose={() => setModal(null)} onSave={handleSave} />
      )}

      <ConfirmDialog open={deleteId !== null} title="Excluir perfil" message="Esta ação não pode ser desfeita. O perfil será removido permanentemente." confirmLabel="Excluir" confirmVariant="danger" onConfirm={doDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
