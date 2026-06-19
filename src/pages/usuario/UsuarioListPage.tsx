import React, { useState, useMemo } from 'react';
import type { NavigateFn, Usuario } from '../../types';
import DataTable, { Column } from '../../components/shared/DataTable';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import CustomSelect from '../../components/shared/CustomSelect';
import { MOCK_USUARIOS, MOCK_PERFIS } from '../../data/mockData';

// ── Constants ──────────────────────────────────────────────────────────────────
const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
const UF_OPTS = UFS.map(v => ({ value: v, label: v }));
const TIPO_OPTS = [{ value: 'Nacional', label: 'Nacional' }, { value: 'Estadual', label: 'Estadual' }, { value: 'Municipal', label: 'Municipal' }];
const SITUACAO_OPTS = [{ value: 'Ativo', label: 'Ativo' }, { value: 'Inativo', label: 'Inativo' }];

// ── Helpers ────────────────────────────────────────────────────────────────────
function SituacaoBadge({ s }: { s: string }) {
  const ok = s === 'Ativo';
  return <span style={{ background: ok ? '#dcfce7' : '#fee2e2', color: ok ? '#15803d' : '#dc2626', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{s}</span>;
}

function TipoAcessoBadge({ tipo, uf }: { tipo: string; uf?: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    Nacional:  { bg: '#E8F5E9', color: '#007A32' },
    Estadual:  { bg: '#fdf4ff', color: '#7e22ce' },
    Municipal: { bg: '#f0fdf4', color: '#15803d' },
  };
  const s = styles[tipo] ?? { bg: '#f3f4f6', color: '#374151' };
  return <span style={{ ...s, borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{tipo}{uf ? ` — ${uf}` : ''}</span>;
}

function Avatar({ nome, size = 32 }: { nome: string; size?: number }) {
  const initials = nome.split(' ').slice(0, 2).map(n => n[0]).join('');
  return <div style={{ width: size, height: size, background: 'linear-gradient(135deg, #00963F, #4CAF50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.34, flexShrink: 0 }}>{initials}</div>;
}

const FIELD_LABEL: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 };
const FIELD_VALUE: React.CSSProperties = { fontSize: 14, color: '#111827' };
const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif', color: '#111827' };
const SEC_HDR: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid #f0f4fb' };

// ── Modal ──────────────────────────────────────────────────────────────────────
type ModalTab = 'dados' | 'acesso';
type ModalMode = 'view' | 'edit';

interface UsuarioForm {
  nome: string; login: string; situacao: 'Ativo' | 'Inativo';
  tipoAcesso: 'Nacional' | 'Estadual' | 'Municipal';
  uf: string; municipio: string; perfis: string[];
}

function UsuarioModal({
  usuario, isCreating, onClose, onSave,
}: {
  usuario: Usuario; isCreating: boolean;
  onClose: () => void; onSave: (updated: Usuario) => void;
}) {
  const [tab, setTab]   = useState<ModalTab>('dados');
  const [mode, setMode] = useState<ModalMode>(isCreating ? 'edit' : 'view');
  const [form, setForm] = useState<UsuarioForm>({
    nome: usuario.nome, login: usuario.login, situacao: usuario.situacao,
    tipoAcesso: usuario.tipoAcesso, uf: usuario.uf ?? '', municipio: usuario.municipio ?? '',
    perfis: [...usuario.perfis],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UsuarioForm, string>>>({});
  const [saving, setSaving] = useState(false);
  const [senhaOpen, setSenhaOpen]     = useState(false);
  const [novaSenha, setNovaSenha]     = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [showNova, setShowNova]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [senhaError, setSenhaError]   = useState('');

  const validate = () => {
    const e: Partial<Record<keyof UsuarioForm, string>> = {};
    if (!form.nome.trim()) e.nome = 'Obrigatório';
    if (!form.login.trim()) e.login = 'Obrigatório';
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (senhaOpen && novaSenha) {
      if (novaSenha.length < 8) { setSenhaError('Mínimo 8 caracteres'); return; }
      if (novaSenha !== confirmSenha) { setSenhaError('As senhas não coincidem'); return; }
    }
    setSenhaError('');
    setSaving(true);
    setTimeout(() => {
      onSave({ ...usuario, ...form, uf: form.uf || undefined, municipio: form.municipio || undefined });
      setSaving(false);
    }, 600);
  };

  const cancelEdit = () => {
    if (isCreating) { onClose(); return; }
    setForm({ nome: usuario.nome, login: usuario.login, situacao: usuario.situacao, tipoAcesso: usuario.tipoAcesso, uf: usuario.uf ?? '', municipio: usuario.municipio ?? '', perfis: [...usuario.perfis] });
    setErrors({});
    setMode('view');
  };

  const togglePerfil = (nome: string) => setForm(p => ({ ...p, perfis: p.perfis.includes(nome) ? p.perfis.filter(x => x !== nome) : [...p.perfis, nome] }));

  const focusH = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#2563eb'; };
  const blurH  = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#d1d5db'; };

  const isEditing = mode === 'edit';

  const activePerfis = MOCK_PERFIS.filter(p => p.situacao === 'Ativo');

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', zIndex: 1060 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 720, maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh', background: '#fff', borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.35)', zIndex: 1070, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Fixed header */}
        <div style={{ background: '#12121f', padding: '16px 22px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar nome={form.nome || 'U'} size={40} />
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{isCreating ? 'Novo Usuário' : usuario.nome}</div>
                {!isCreating && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{usuario.login}</div>}
              </div>
              {!isCreating && (
                <span style={{ background: usuario.situacao === 'Ativo' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: usuario.situacao === 'Ativo' ? '#4ade80' : '#f87171', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                  {usuario.situacao}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {mode === 'view' && !isCreating && (
                <button onClick={() => setMode('edit')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 7, background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
                  <i className="bi bi-pencil" /> Editar
                </button>
              )}
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['dados', 'acesso'] as ModalTab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 16px', border: 'none', background: tab === t ? 'rgba(255,255,255,0.12)' : 'none', borderRadius: 6, color: tab === t ? '#fff' : 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: tab === t ? 700 : 400, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', borderBottom: `2px solid ${tab === t ? '#3b82f6' : 'transparent'}` }}>
                {t === 'dados' ? 'Dados' : 'Nível de acesso'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* ── Tab Dados — view ─────────────────────────────────────────── */}
          {tab === 'dados' && mode === 'view' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 28px', marginBottom: 8 }}>
                <div><label style={FIELD_LABEL}>Nome completo</label><div style={FIELD_VALUE}>{usuario.nome}</div></div>
                <div><label style={FIELD_LABEL}>Login / E-mail</label><div style={FIELD_VALUE}>{usuario.login}</div></div>
                <div><label style={FIELD_LABEL}>Situação</label><SituacaoBadge s={usuario.situacao} /></div>
                <div><label style={FIELD_LABEL}>Cadastrado em</label><div style={FIELD_VALUE}>{usuario.cadastradoEm}</div></div>
                <div><label style={FIELD_LABEL}>Última alteração</label><div style={FIELD_VALUE}>{usuario.ultimaAlteracao || <span style={{ color: '#9ca3af' }}>—</span>}</div></div>
                <div><label style={FIELD_LABEL}>Último acesso</label><div style={FIELD_VALUE}>{usuario.ultimoAcesso}</div></div>
              </div>
            </div>
          )}

          {/* ── Tab Dados — edit ─────────────────────────────────────────── */}
          {tab === 'dados' && mode === 'edit' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={FIELD_LABEL}>Nome completo *</label>
                <input style={{ ...inp, borderColor: errors.nome ? '#dc2626' : '#d1d5db' }} value={form.nome} onChange={e => { setForm(p => ({ ...p, nome: e.target.value })); setErrors(p => ({ ...p, nome: undefined })); }} onFocus={focusH} onBlur={blurH} />
                {errors.nome && <div style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.nome}</div>}
              </div>
              <div>
                <label style={FIELD_LABEL}>Login / E-mail *</label>
                <input type="email" style={{ ...inp, borderColor: errors.login ? '#dc2626' : '#d1d5db' }} value={form.login} onChange={e => { setForm(p => ({ ...p, login: e.target.value })); setErrors(p => ({ ...p, login: undefined })); }} onFocus={focusH} onBlur={blurH} />
                {errors.login && <div style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.login}</div>}
              </div>
              <div>
                <label style={FIELD_LABEL}>Situação</label>
                <CustomSelect value={form.situacao} onChange={v => setForm(p => ({ ...p, situacao: v as 'Ativo' | 'Inativo' }))} options={SITUACAO_OPTS} placeholder="Selecione" />
              </div>

              {/* ── Alterar senha ─────────────────────────────────────────── */}
              <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => { setSenhaOpen(p => !p); setSenhaError(''); setNovaSenha(''); setConfirmSenha(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '10px 14px', background: senhaOpen ? '#f0f4fb' : '#f8fafc', border: `1px solid ${senhaOpen ? '#dce6f5' : '#e5e7eb'}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', color: '#374151', fontSize: 13, fontWeight: 600, textAlign: 'left' }}
                >
                  <i className="bi bi-key" style={{ color: '#2563eb', fontSize: 14 }} />
                  Alterar senha
                  <i className={`bi bi-chevron-${senhaOpen ? 'up' : 'down'}`} style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }} />
                </button>

                {senhaOpen && (
                  <div style={{ padding: '16px 14px 4px', border: '1px solid #dce6f5', borderTop: 'none', borderRadius: '0 0 8px 8px', background: '#fff' }}>
                    <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 14 }}>Deixe em branco para manter a senha atual.</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                      <div>
                        <label style={FIELD_LABEL}>Nova senha</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showNova ? 'text' : 'password'}
                            value={novaSenha}
                            onChange={e => { setNovaSenha(e.target.value); setSenhaError(''); }}
                            placeholder="Mín. 8 caracteres"
                            style={{ ...inp, paddingRight: 40, borderColor: senhaError ? '#dc2626' : '#d1d5db', fontSize: 16 }}
                            onFocus={e => (e.target.style.borderColor = '#2563eb')}
                            onBlur={e => (e.target.style.borderColor = senhaError ? '#dc2626' : '#d1d5db')}
                          />
                          <button type="button" onClick={() => setShowNova(!showNova)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 15, padding: 0, lineHeight: 1 }}>
                            <i className={`bi bi-eye${showNova ? '-slash' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label style={FIELD_LABEL}>Confirmar nova senha</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmSenha}
                            onChange={e => { setConfirmSenha(e.target.value); setSenhaError(''); }}
                            placeholder="Repita a nova senha"
                            style={{ ...inp, paddingRight: 40, borderColor: senhaError ? '#dc2626' : '#d1d5db', fontSize: 16 }}
                            onFocus={e => (e.target.style.borderColor = '#2563eb')}
                            onBlur={e => (e.target.style.borderColor = senhaError ? '#dc2626' : '#d1d5db')}
                          />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 15, padding: 0, lineHeight: 1 }}>
                            <i className={`bi bi-eye${showConfirm ? '-slash' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {senhaError && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 8 }}>{senhaError}</div>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tab Nível de acesso ───────────────────────────────────────── */}
          {tab === 'acesso' && (
            <div>
              <div style={SEC_HDR}>
                <div style={{ width: 28, height: 28, background: '#eff6ff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="bi bi-shield-check" style={{ color: '#2563eb', fontSize: 13 }} /></div>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Tipo de acesso</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 20px', marginBottom: 24 }}>
                <div>
                  <label style={FIELD_LABEL}>Tipo de acesso</label>
                  {isEditing ? (
                    <CustomSelect value={form.tipoAcesso} onChange={v => setForm(p => ({ ...p, tipoAcesso: v as 'Nacional' | 'Estadual' | 'Municipal', uf: '', municipio: '' }))} options={TIPO_OPTS} placeholder="Selecione" />
                  ) : (
                    <TipoAcessoBadge tipo={usuario.tipoAcesso} />
                  )}
                </div>
                {(isEditing ? form.tipoAcesso : usuario.tipoAcesso) !== 'Nacional' && (
                  <div>
                    <label style={FIELD_LABEL}>UF</label>
                    {isEditing ? (
                      <CustomSelect value={form.uf} onChange={v => setForm(p => ({ ...p, uf: v }))} options={UF_OPTS} placeholder="Selecione" />
                    ) : (
                      <div style={FIELD_VALUE}>{usuario.uf || '—'}</div>
                    )}
                  </div>
                )}
                {(isEditing ? form.tipoAcesso : usuario.tipoAcesso) === 'Municipal' && (
                  <div>
                    <label style={FIELD_LABEL}>Município</label>
                    {isEditing ? (
                      <input style={inp} value={form.municipio} onChange={e => setForm(p => ({ ...p, municipio: e.target.value }))} onFocus={focusH} onBlur={blurH} />
                    ) : (
                      <div style={FIELD_VALUE}>{usuario.municipio || '—'}</div>
                    )}
                  </div>
                )}
              </div>

              <div style={SEC_HDR}>
                <div style={{ width: 28, height: 28, background: '#eff6ff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="bi bi-person-gear" style={{ color: '#2563eb', fontSize: 13 }} /></div>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Perfis de acesso</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {activePerfis.map(p => {
                  const sel = isEditing ? form.perfis.includes(p.nome) : usuario.perfis.includes(p.nome);
                  return (
                    <button key={p.id} onClick={() => isEditing && togglePerfil(p.nome)} style={{ padding: '6px 14px', border: `1.5px solid ${sel ? '#2563eb' : '#d1d5db'}`, borderRadius: 20, background: sel ? '#eff6ff' : '#fff', color: sel ? '#2563eb' : '#374151', fontSize: 12, fontWeight: sel ? 600 : 400, cursor: isEditing ? 'pointer' : 'default', fontFamily: 'Open Sans, sans-serif' }}>
                      {sel && <i className="bi bi-check2" style={{ marginRight: 4 }} />}{p.nome}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0, background: '#fff' }}>
            <button onClick={cancelEdit} style={{ padding: '9px 20px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'Open Sans, sans-serif' }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '9px 22px', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
              {saving ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Salvando…</> : <><i className="bi bi-check2-circle" /> Salvar</>}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function UsuarioListPage({ onNavigate }: { onNavigate: NavigateFn }) {
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData]         = useState<Usuario[]>(MOCK_USUARIOS);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [modal, setModal]       = useState<{ usuario: Usuario; isCreating: boolean } | null>(null);

  const filtered = useMemo(() =>
    data.filter(u => !search || u.nome.toLowerCase().includes(search.toLowerCase()) || u.login.toLowerCase().includes(search.toLowerCase())),
    [data, search]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const doDelete = () => {
    if (deleteId !== null) setData(p => p.filter(x => x.id !== deleteId));
    setDeleteId(null);
  };

  const openCreate = () => setModal({
    usuario: { id: Date.now(), nome: '', login: '', tipoAcesso: 'Nacional', situacao: 'Ativo', perfis: [], ultimoAcesso: '—', cadastradoEm: new Date().toLocaleDateString('pt-BR') },
    isCreating: true,
  });

  const handleSave = (updated: Usuario) => {
    if (modal?.isCreating) {
      setData(p => [...p, updated]);
    } else {
      setData(p => p.map(x => x.id === updated.id ? updated : x));
    }
    setModal(null);
  };

  const columns: Column<Usuario>[] = [
    {
      key: 'nome', label: 'Usuário', render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar nome={r.nome} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.nome}</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.login}</div>
          </div>
        </div>
      )
    },
    { key: 'tipoAcesso', label: 'Tipo de acesso', render: r => <TipoAcessoBadge tipo={r.tipoAcesso} uf={r.uf} /> },
    { key: 'perfis', label: 'Perfis', render: r => r.perfis.join(', ') },
    { key: 'situacao', label: 'Situação', render: r => <SituacaoBadge s={r.situacao} /> },
    { key: 'ultimoAcesso', label: 'Último acesso', width: 180 },
    {
      key: 'acoes', label: 'Ações', sortable: false, width: 90,
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
          <button onClick={() => setModal({ usuario: r, isCreating: false })} style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', color: '#374151', fontSize: 12, fontWeight: 500, fontFamily: 'Open Sans, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <i className="bi bi-eye" style={{ fontSize: 12 }} /> Ver
          </button>
          <button title="Excluir" onClick={() => setDeleteId(r.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, padding: 0, background: '#fff', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', color: '#dc2626', fontSize: 13, flexShrink: 0 }}>
            <i className="bi bi-trash" />
          </button>
        </div>
      )
    },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Usuários</h1>
          <nav style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            <span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={() => onNavigate('home')}>Início</span>
            {' › '}Configurações{' › '}Usuários
          </nav>
        </div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
          <i className="bi bi-person-plus-fill" /> Novo usuário
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14, pointerEvents: 'none' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nome ou login..." style={{ width: '100%', height: 38, paddingLeft: 36, paddingRight: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif' }} onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
          </div>
        </div>
        <DataTable columns={columns as unknown as Column<Record<string, unknown>>[]} data={pageData as unknown as Record<string, unknown>[]} totalRecords={filtered.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} emptyMessage="Nenhum usuário encontrado." />
      </div>

      {modal && (
        <UsuarioModal usuario={modal.usuario} isCreating={modal.isCreating} onClose={() => setModal(null)} onSave={handleSave} />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Excluir usuário"
        message="Esta ação não pode ser desfeita. O usuário será removido permanentemente."
        confirmLabel="Excluir"
        confirmVariant="danger"
        onConfirm={doDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
