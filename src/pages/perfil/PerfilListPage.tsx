import React, { useState, useMemo } from 'react';
import type { NavigateFn, Perfil } from '../../types';
import DataTable, { Column } from '../../components/shared/DataTable';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import CustomSelect from '../../components/shared/CustomSelect';
import { MOCK_PERFIS } from '../../data/mockData';

// ── Permission types ───────────────────────────────────────────────────────────
interface PermItem { label: string; visualizar: boolean; criar: boolean; editar: boolean; excluir: boolean }
interface Permission { modulo: string; icon: string; items: PermItem[] }

const PERM_COLS: Array<keyof Omit<PermItem, 'label'>> = ['visualizar', 'criar', 'editar', 'excluir'];
const PERM_COL_LABELS = ['Visualizar', 'Criar', 'Editar', 'Excluir'];

const DEFAULT_PERMS: Permission[] = [
  { modulo: 'Mandatários', icon: 'bi-people-fill', items: [{ label: 'Consultar Mandatários', visualizar: true, criar: false, editar: false, excluir: false }] },
  { modulo: 'Filiação Partidária', icon: 'bi-diagram-3-fill', items: [{ label: 'Consultar Filiados', visualizar: true, criar: false, editar: false, excluir: false }] },
  { modulo: 'Órgãos Partidários', icon: 'bi-bank2', items: [{ label: 'Consultar Órgãos', visualizar: true, criar: false, editar: false, excluir: false }] },
  { modulo: 'Dirigentes', icon: 'bi-person-badge-fill', items: [{ label: 'Consultar Dirigentes', visualizar: true, criar: false, editar: false, excluir: false }] },
  { modulo: 'Business Intelligence', icon: 'bi-speedometer2', items: [{ label: 'Painel BI', visualizar: true, criar: false, editar: false, excluir: false }] },
  { modulo: 'Configurações — Perfis', icon: 'bi-person-gear', items: [
    { label: 'Gerenciar Perfis', visualizar: true, criar: true, editar: true, excluir: false },
    { label: 'Permissões', visualizar: true, criar: true, editar: true, excluir: false },
  ]},
  { modulo: 'Configurações — Usuários', icon: 'bi-people-fill', items: [{ label: 'Gerenciar Usuários', visualizar: true, criar: true, editar: true, excluir: false }] },
  { modulo: 'Log de Acesso', icon: 'bi-clock-history', items: [{ label: 'Visualizar Log', visualizar: true, criar: false, editar: false, excluir: false }] },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function SituacaoBadge({ s }: { s: string }) {
  const ok = s === 'Ativo';
  return <span style={{ background: ok ? '#dcfce7' : '#fee2e2', color: ok ? '#15803d' : '#dc2626', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{s}</span>;
}

const FIELD_LABEL: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 };
const FIELD_VALUE: React.CSSProperties = { fontSize: 14, color: '#111827', fontWeight: 400 };
const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif', color: '#111827' };
const SITUACAO_OPTS = [{ value: 'Ativo', label: 'Ativo' }, { value: 'Inativo', label: 'Inativo' }];

// ── Modal ──────────────────────────────────────────────────────────────────────
type ModalTab = 'dados' | 'permissoes';
type ModalMode = 'view' | 'edit';

interface PerfilForm { nome: string; identificador1doc: string; situacao: 'Ativo' | 'Inativo' }

function PerfilModal({
  perfil, isCreating, onClose, onSave,
}: {
  perfil: Perfil; isCreating: boolean;
  onClose: () => void; onSave: (updated: Perfil) => void;
}) {
  const [tab, setTab] = useState<ModalTab>(isCreating ? 'dados' : 'dados');
  const [mode, setMode] = useState<ModalMode>(isCreating ? 'edit' : 'view');
  const [form, setForm] = useState<PerfilForm>({ nome: perfil.nome, identificador1doc: perfil.identificador1doc ?? '', situacao: perfil.situacao });
  const [errors, setErrors] = useState<Partial<PerfilForm>>({});
  const [perms, setPerms] = useState<Permission[]>(DEFAULT_PERMS);
  const [saving, setSaving] = useState(false);
  const [permSaving, setPermSaving] = useState(false);

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
    }, 600);
  };

  const handleSavePerms = () => {
    setPermSaving(true);
    setTimeout(() => { setPermSaving(false); }, 600);
  };

  const togglePerm = (mi: number, ii: number, key: keyof Omit<PermItem, 'label'>) => {
    setPerms(prev => prev.map((m, i) => i !== mi ? m : {
      ...m, items: m.items.map((item, j) => j !== ii ? item : { ...item, [key]: !item[key] }),
    }));
  };

  const cancelEdit = () => {
    if (isCreating) { onClose(); return; }
    setForm({ nome: perfil.nome, identificador1doc: perfil.identificador1doc ?? '', situacao: perfil.situacao });
    setErrors({});
    setMode('view');
  };

  const showFooter = mode === 'edit' || tab === 'permissoes';

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', zIndex: 1060 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 680, maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh', background: '#fff', borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.35)', zIndex: 1070, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Fixed header */}
        <div style={{ background: '#12121f', padding: '16px 22px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, background: 'rgba(0,150,63,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-person-gear" style={{ color: '#00963F', fontSize: 17 }} />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{isCreating ? 'Novo Perfil' : perfil.nome}</div>
                {!isCreating && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>ID: {perfil.id}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {tab === 'dados' && mode === 'view' && !isCreating && (
                <button onClick={() => setMode('edit')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 7, background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
                  <i className="bi bi-pencil" /> Editar
                </button>
              )}
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
          </div>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['dados', 'permissoes'] as ModalTab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 16px', border: 'none', background: tab === t ? 'rgba(255,255,255,0.12)' : 'none', borderRadius: 6, color: tab === t ? '#fff' : 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: tab === t ? 700 : 400, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', borderBottom: `2px solid ${tab === t ? '#00963F' : 'transparent'}` }}>
                {t === 'dados' ? 'Dados' : 'Permissões'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px' }}>

          {/* ── Tab Dados ─────────────────────────────────────────────────── */}
          {tab === 'dados' && mode === 'view' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
              <div>
                <label style={FIELD_LABEL}>Nome do perfil</label>
                <div style={FIELD_VALUE}>{perfil.nome}</div>
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

          {tab === 'dados' && mode === 'edit' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={FIELD_LABEL}>Nome do perfil *</label>
                <input style={{ ...inp, borderColor: errors.nome ? '#dc2626' : '#d1d5db' }} value={form.nome} onChange={e => { setForm(p => ({ ...p, nome: e.target.value })); setErrors(p => ({ ...p, nome: undefined })); }}
                  onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = errors.nome ? '#dc2626' : '#d1d5db')} />
                {errors.nome && <div style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.nome}</div>}
              </div>
              <div>
                <label style={FIELD_LABEL}>Identificador 1Doc</label>
                <input style={inp} value={form.identificador1doc} onChange={e => setForm(p => ({ ...p, identificador1doc: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
              </div>
              <div>
                <label style={FIELD_LABEL}>Situação</label>
                <CustomSelect value={form.situacao} onChange={v => setForm(p => ({ ...p, situacao: v as 'Ativo' | 'Inativo' }))} options={SITUACAO_OPTS} placeholder="Selecione" />
              </div>
            </div>
          )}

          {/* ── Tab Permissões ─────────────────────────────────────────────── */}
          {tab === 'permissoes' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: '#f0f4fb', borderRadius: 8, border: '1px solid #dce6f5' }}>
                <i className="bi bi-info-circle" style={{ color: '#2563eb', fontSize: 14 }} />
                <span style={{ fontSize: 12, color: '#374151' }}>Configure as permissões de acesso para o perfil <strong>{perfil.nome}</strong></span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#6b7280', borderBottom: '2px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Módulo / Funcionalidade</th>
                    {PERM_COL_LABELS.map(l => <th key={l} style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, fontSize: 11, color: '#6b7280', borderBottom: '2px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.5px', width: 80 }}>{l}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {perms.map((mod, mi) => (
                    <React.Fragment key={mod.modulo}>
                      <tr style={{ background: '#f0f4fb' }}>
                        <td colSpan={5} style={{ padding: '7px 12px', fontWeight: 700, color: '#1e40af', fontSize: 11 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><i className={`bi ${mod.icon}`} style={{ fontSize: 12 }} />{mod.modulo}</span>
                        </td>
                      </tr>
                      {mod.items.map((item, ii) => (
                        <tr key={item.label} style={{ borderBottom: '1px solid #f3f4f6' }} onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                          <td style={{ padding: '9px 12px 9px 26px', color: '#374151' }}>{item.label}</td>
                          {PERM_COLS.map(key => (
                            <td key={key} style={{ padding: '9px 12px', textAlign: 'center' }}>
                              <input type="checkbox" checked={item[key]} onChange={() => togglePerm(mi, ii, key)} style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#2563eb' }} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Fixed footer */}
        {showFooter && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0, background: '#fff' }}>
            {tab === 'dados' && mode === 'edit' && (
              <>
                <button onClick={cancelEdit} style={{ padding: '9px 20px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'Open Sans, sans-serif' }}>Cancelar</button>
                <button onClick={handleSave} disabled={saving} style={{ padding: '9px 22px', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {saving ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Salvando…</> : <><i className="bi bi-check2-circle" /> Salvar</>}
                </button>
              </>
            )}
            {tab === 'permissoes' && (
              <>
                <button onClick={onClose} style={{ padding: '9px 20px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'Open Sans, sans-serif' }}>Fechar</button>
                <button onClick={handleSavePerms} disabled={permSaving} style={{ padding: '9px 22px', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: permSaving ? 'default' : 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {permSaving ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Salvando…</> : <><i className="bi bi-shield-check" /> Salvar permissões</>}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function PerfilListPage({ onNavigate }: { onNavigate: NavigateFn }) {
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData]         = useState<Perfil[]>(MOCK_PERFIS);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [modal, setModal]       = useState<{ perfil: Perfil; isCreating: boolean } | null>(null);

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
    if (modal?.isCreating) {
      setData(p => [...p, updated]);
    } else {
      setData(p => p.map(x => x.id === updated.id ? updated : x));
    }
    setModal(null);
  };

  const columns: Column<Perfil>[] = [
    { key: 'nome', label: 'Nome do perfil' },
    { key: 'identificador1doc', label: 'Identificador 1Doc', render: r => r.identificador1doc || '—' },
    { key: 'situacao', label: 'Situação', render: r => <SituacaoBadge s={r.situacao} /> },
    { key: 'cadastradoEm', label: 'Cadastrado em', width: 180 },
    {
      key: 'acoes', label: 'Ações', sortable: false, width: 130,
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setModal({ perfil: r, isCreating: false })} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#374151', fontSize: 12, fontWeight: 500, fontFamily: 'Open Sans, sans-serif' }}>
            <i className="bi bi-pencil" style={{ fontSize: 11 }} /> Ver / Editar
          </button>
          <button onClick={() => setDeleteId(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#dc2626', fontSize: 12, fontFamily: 'Open Sans, sans-serif' }}>
            <i className="bi bi-trash" style={{ fontSize: 11 }} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Perfis</h1>
          <nav style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            <span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={() => onNavigate('home')}>Início</span>
            {' › '}Configurações{' › '}Perfis
          </nav>
        </div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
          <i className="bi bi-plus-circle-fill" /> Novo perfil
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14, pointerEvents: 'none' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar perfil..." style={{ width: '100%', height: 38, paddingLeft: 36, paddingRight: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif' }} onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
          </div>
        </div>
        <DataTable columns={columns as unknown as Column<Record<string, unknown>>[]} data={pageData as unknown as Record<string, unknown>[]} totalRecords={filtered.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} emptyMessage="Nenhum perfil encontrado." />
      </div>

      {modal && (
        <PerfilModal perfil={modal.perfil} isCreating={modal.isCreating} onClose={() => setModal(null)} onSave={handleSave} />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Excluir perfil"
        message="Esta ação não pode ser desfeita. O perfil será removido permanentemente."
        confirmLabel="Excluir"
        confirmVariant="danger"
        onConfirm={doDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
