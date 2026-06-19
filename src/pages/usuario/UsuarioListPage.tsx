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

const TIPO_HINT: Record<string, string> = {
  Nacional:  'Acesso a todos os estados e municípios',
  Estadual:  'Acesso restrito ao estado selecionado',
  Municipal: 'Acesso restrito ao município selecionado',
};

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
  const initials = nome.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?';
  return (
    <div style={{ width: size, height: size, background: '#00963F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.34, flexShrink: 0, fontFamily: 'Open Sans, sans-serif' }}>
      {initials}
    </div>
  );
}

const FIELD_LABEL: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 };
const FIELD_VALUE: React.CSSProperties = { fontSize: 14, color: '#111827' };
const INP: React.CSSProperties = { width: '100%', height: 42, padding: '0 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif', color: '#111827' };
const BTN_GHOST: React.CSSProperties = { padding: '8px 18px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#374151', fontFamily: 'Open Sans, sans-serif' };
const BTN_PRIMARY: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: 'none', borderRadius: 8, background: '#00963F', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' };

const Spinner = () => (
  <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
);

function SecHdr({ icon, label, sub }: { icon: string; label: string; sub?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f0f4fb' }}>
      <div style={{ width: 28, height: 28, background: '#f0fdf4', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={`bi ${icon}`} style={{ color: '#00963F', fontSize: 13 }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', flex: 1 }}>{label}</span>
      {sub}
    </div>
  );
}

function PerfilChip({ nome, selected, onToggle }: { nome: string; selected: boolean; onToggle: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onToggle}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '6px 14px', border: `1.5px solid ${selected ? '#86efac' : hov ? '#86efac' : '#e5e7eb'}`, borderRadius: 20, background: selected ? '#dcfce7' : '#fff', color: selected ? '#15803d' : hov ? '#15803d' : '#374151', fontSize: 12, fontWeight: selected ? 600 : 400, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', transition: 'all 0.12s' }}>
      {selected && <i className="bi bi-check2" style={{ marginRight: 4 }} />}{nome}
    </button>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
type ModalTab  = 'dados' | 'acesso';
type ModalMode = 'view' | 'edit';

interface UsuarioForm {
  nome: string; login: string; situacao: 'Ativo' | 'Inativo';
  tipoAcesso: 'Nacional' | 'Estadual' | 'Municipal';
  uf: string; municipio: string; perfis: string[];
}

function UsuarioModal({ usuario, isCreating, onClose, onSave }: {
  usuario: Usuario; isCreating: boolean;
  onClose: () => void; onSave: (updated: Usuario) => void;
}) {
  const [tab,  setTab]  = useState<ModalTab>('dados');
  const [mode, setMode] = useState<ModalMode>(isCreating ? 'edit' : 'view');
  const [form, setForm] = useState<UsuarioForm>({
    nome: usuario.nome, login: usuario.login, situacao: usuario.situacao,
    tipoAcesso: usuario.tipoAcesso, uf: usuario.uf ?? '', municipio: usuario.municipio ?? '',
    perfis: [...usuario.perfis],
  });
  const [errors,      setErrors]      = useState<Partial<Record<keyof UsuarioForm, string>>>({});
  const [saving,      setSaving]      = useState(false);
  const [senhaOpen,   setSenhaOpen]   = useState(false);
  const [novaSenha,   setNovaSenha]   = useState('');
  const [confirmSenha,setConfirmSenha]= useState('');
  const [showNova,    setShowNova]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [senhaError,  setSenhaError]  = useState('');

  const validate = () => {
    const e: Partial<Record<keyof UsuarioForm, string>> = {};
    if (!form.nome.trim())  e.nome  = 'Obrigatório';
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
      if (!isCreating) setMode('view');
    }, 600);
  };

  const cancelEdit = () => {
    if (isCreating) { onClose(); return; }
    setForm({ nome: usuario.nome, login: usuario.login, situacao: usuario.situacao, tipoAcesso: usuario.tipoAcesso, uf: usuario.uf ?? '', municipio: usuario.municipio ?? '', perfis: [...usuario.perfis] });
    setErrors({});
    setSenhaOpen(false);
    setSenhaError('');
    setNovaSenha('');
    setConfirmSenha('');
    setMode('view');
  };

  const togglePerfil = (nome: string) =>
    setForm(p => ({ ...p, perfis: p.perfis.includes(nome) ? p.perfis.filter(x => x !== nome) : [...p.perfis, nome] }));

  const activePerfis = MOCK_PERFIS.filter(p => p.situacao === 'Ativo');

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 1060 }} />

      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 560, maxWidth: 'calc(100vw - 32px)', height: '80vh', maxHeight: '90vh', background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.20)', zIndex: 1070, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Open Sans, sans-serif' }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ padding: '16px 20px 0', borderBottom: '1px solid #e5e7eb', flexShrink: 0, background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar nome={isCreating ? 'NU' : usuario.nome} size={38} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#111827', lineHeight: 1.3 }}>
                  {isCreating ? 'Novo Usuário' : usuario.nome}
                </div>
                {!isCreating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{usuario.login}</span>
                    <SituacaoBadge s={usuario.situacao} />
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {mode === 'view' && !isCreating && (
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
            {(['dados', 'acesso'] as ModalTab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '8px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? '#00963F' : 'transparent'}`, background: 'none', color: tab === t ? '#00963F' : '#6b7280', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', marginBottom: -1, transition: 'color 0.15s' }}>
                {t === 'dados' ? 'Dados' : 'Nível de acesso'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* Dados — view */}
          {tab === 'dados' && mode === 'view' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
              <div><label style={FIELD_LABEL}>Nome completo</label><div style={FIELD_VALUE}>{usuario.nome || '—'}</div></div>
              <div><label style={FIELD_LABEL}>Login / E-mail</label><div style={FIELD_VALUE}>{usuario.login || '—'}</div></div>
              <div><label style={FIELD_LABEL}>Situação</label><SituacaoBadge s={usuario.situacao} /></div>
              <div><label style={FIELD_LABEL}>Cadastrado em</label><div style={FIELD_VALUE}>{usuario.cadastradoEm}</div></div>
              <div><label style={FIELD_LABEL}>Última alteração</label><div style={FIELD_VALUE}>{usuario.ultimaAlteracao || <span style={{ color: '#9ca3af' }}>—</span>}</div></div>
              <div><label style={FIELD_LABEL}>Último acesso</label><div style={FIELD_VALUE}>{usuario.ultimoAcesso}</div></div>
            </div>
          )}

          {/* Dados — edit */}
          {tab === 'dados' && mode === 'edit' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={FIELD_LABEL}>Nome completo *</label>
                <input style={{ ...INP, borderColor: errors.nome ? '#dc2626' : '#d1d5db' }}
                  value={form.nome}
                  onChange={e => { setForm(p => ({ ...p, nome: e.target.value })); setErrors(p => ({ ...p, nome: undefined })); }}
                  onFocus={e => (e.target.style.borderColor = '#00963F')}
                  onBlur={e => (e.target.style.borderColor = errors.nome ? '#dc2626' : '#d1d5db')} />
                {errors.nome && <div style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.nome}</div>}
              </div>
              <div>
                <label style={FIELD_LABEL}>Login / E-mail *</label>
                <input type="email" style={{ ...INP, borderColor: errors.login ? '#dc2626' : '#d1d5db' }}
                  value={form.login}
                  onChange={e => { setForm(p => ({ ...p, login: e.target.value })); setErrors(p => ({ ...p, login: undefined })); }}
                  onFocus={e => (e.target.style.borderColor = '#00963F')}
                  onBlur={e => (e.target.style.borderColor = errors.login ? '#dc2626' : '#d1d5db')} />
                {errors.login && <div style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.login}</div>}
              </div>
              <div>
                <label style={FIELD_LABEL}>Situação</label>
                <CustomSelect value={form.situacao} onChange={v => setForm(p => ({ ...p, situacao: v as 'Ativo' | 'Inativo' }))} options={SITUACAO_OPTS} placeholder="Selecione" />
              </div>

              {/* Alterar senha */}
              <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                <button type="button"
                  onClick={() => { setSenhaOpen(p => !p); setSenhaError(''); setNovaSenha(''); setConfirmSenha(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '10px 14px', background: senhaOpen ? '#f0fdf4' : '#f8fafc', border: `1px solid ${senhaOpen ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: senhaOpen ? '8px 8px 0 0' : 8, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', color: '#374151', fontSize: 13, fontWeight: 600, textAlign: 'left' }}>
                  <i className="bi bi-key" style={{ color: '#00963F', fontSize: 14 }} />
                  Alterar senha
                  <i className={`bi bi-chevron-${senhaOpen ? 'up' : 'down'}`} style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }} />
                </button>
                {senhaOpen && (
                  <div style={{ padding: '16px 14px 12px', border: '1px solid #bbf7d0', borderTop: 'none', borderRadius: '0 0 8px 8px', background: '#fff' }}>
                    <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 14 }}>Deixe em branco para manter a senha atual.</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                      <div>
                        <label style={FIELD_LABEL}>Nova senha</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showNova ? 'text' : 'password'} value={novaSenha}
                            onChange={e => { setNovaSenha(e.target.value); setSenhaError(''); }}
                            placeholder="Mín. 8 caracteres"
                            style={{ ...INP, paddingRight: 40, borderColor: senhaError ? '#dc2626' : '#d1d5db', fontSize: 16 }}
                            onFocus={e => (e.target.style.borderColor = '#00963F')}
                            onBlur={e => (e.target.style.borderColor = senhaError ? '#dc2626' : '#d1d5db')} />
                          <button type="button" onClick={() => setShowNova(!showNova)}
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 15, padding: 0, lineHeight: 1 }}>
                            <i className={`bi bi-eye${showNova ? '-slash' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label style={FIELD_LABEL}>Confirmar nova senha</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showConfirm ? 'text' : 'password'} value={confirmSenha}
                            onChange={e => { setConfirmSenha(e.target.value); setSenhaError(''); }}
                            placeholder="Repita a nova senha"
                            style={{ ...INP, paddingRight: 40, borderColor: senhaError ? '#dc2626' : '#d1d5db', fontSize: 16 }}
                            onFocus={e => (e.target.style.borderColor = '#00963F')}
                            onBlur={e => (e.target.style.borderColor = senhaError ? '#dc2626' : '#d1d5db')} />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 15, padding: 0, lineHeight: 1 }}>
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

          {/* Nível de acesso — view */}
          {tab === 'acesso' && mode === 'view' && (
            <div>
              <SecHdr icon="bi-shield-check" label="Tipo de acesso" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <TipoAcessoBadge tipo={usuario.tipoAcesso} />
                {usuario.tipoAcesso !== 'Nacional' && usuario.uf && (
                  <span style={{ fontSize: 13, color: '#374151' }}>UF: <strong>{usuario.uf}</strong></span>
                )}
                {usuario.tipoAcesso === 'Municipal' && usuario.municipio && (
                  <span style={{ fontSize: 13, color: '#374151' }}>Município: <strong>{usuario.municipio}</strong></span>
                )}
              </div>

              <SecHdr
                icon="bi-person-gear"
                label="Perfis de acesso"
                sub={<span style={{ fontSize: 11, color: '#6b7280' }}>{usuario.perfis.length} selecionado(s)</span>}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {activePerfis.map(p => {
                  const sel = usuario.perfis.includes(p.nome);
                  return (
                    <span key={p.id} style={{ padding: '6px 14px', border: `1.5px solid ${sel ? '#86efac' : '#e5e7eb'}`, borderRadius: 20, background: sel ? '#dcfce7' : '#fff', color: sel ? '#15803d' : '#9ca3af', fontSize: 12, fontWeight: sel ? 600 : 400, fontFamily: 'Open Sans, sans-serif' }}>
                      {sel && <i className="bi bi-check2" style={{ marginRight: 4 }} />}{p.nome}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nível de acesso — edit */}
          {tab === 'acesso' && mode === 'edit' && (
            <div>
              <SecHdr icon="bi-shield-check" label="Tipo de acesso" />
              <div style={{ marginBottom: 24 }}>
                <div style={{ width: 180 }}>
                  <CustomSelect value={form.tipoAcesso} onChange={v => setForm(p => ({ ...p, tipoAcesso: v as 'Nacional' | 'Estadual' | 'Municipal', uf: '', municipio: '' }))} options={TIPO_OPTS} placeholder="Selecione" />
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>{TIPO_HINT[form.tipoAcesso]}</div>
                {form.tipoAcesso !== 'Nacional' && (
                  <div style={{ display: 'grid', gridTemplateColumns: form.tipoAcesso === 'Municipal' ? '1fr 1fr' : '180px', gap: '14px 20px', marginTop: 14 }}>
                    <div>
                      <label style={FIELD_LABEL}>UF</label>
                      <CustomSelect value={form.uf} onChange={v => setForm(p => ({ ...p, uf: v }))} options={UF_OPTS} placeholder="Selecione" />
                    </div>
                    {form.tipoAcesso === 'Municipal' && (
                      <div>
                        <label style={FIELD_LABEL}>Município</label>
                        <input style={INP} value={form.municipio}
                          onChange={e => setForm(p => ({ ...p, municipio: e.target.value }))}
                          onFocus={e => (e.target.style.borderColor = '#00963F')}
                          onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <SecHdr
                icon="bi-person-gear"
                label="Perfis de acesso"
                sub={<span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', borderRadius: 100, padding: '2px 8px' }}>{form.perfis.length} selecionado(s)</span>}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {activePerfis.map(p => (
                  <PerfilChip key={p.id} nome={p.nome} selected={form.perfis.includes(p.nome)} onToggle={() => togglePerfil(p.nome)} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        {mode === 'edit' && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0, background: '#fff' }}>
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
          </div>
        )}
      </div>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function UsuarioListPage({ onNavigate }: { onNavigate: NavigateFn }) {
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data,     setData]     = useState<Usuario[]>(MOCK_USUARIOS);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [modal,    setModal]    = useState<{ usuario: Usuario; isCreating: boolean } | null>(null);

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
    setData(p => modal?.isCreating ? [...p, updated] : p.map(x => x.id === updated.id ? updated : x));
    if (modal?.isCreating) {
      setModal(null);
    } else {
      setModal(prev => prev ? { ...prev, usuario: updated } : null);
    }
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
      ),
    },
    { key: 'tipoAcesso', label: 'Tipo de acesso', render: r => <TipoAcessoBadge tipo={r.tipoAcesso} uf={r.uf} /> },
    { key: 'perfis',     label: 'Perfis',          render: r => r.perfis.join(', ') || <span style={{ color: '#9ca3af' }}>—</span> },
    { key: 'situacao',   label: 'Situação',         render: r => <SituacaoBadge s={r.situacao} /> },
    { key: 'ultimoAcesso', label: 'Último acesso',  width: 180 },
    {
      key: 'acoes', label: 'Ações', sortable: false, width: 90,
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
          <button onClick={() => setModal({ usuario: r, isCreating: false })}
            style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', color: '#374151', fontSize: 12, fontWeight: 500, fontFamily: 'Open Sans, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <i className="bi bi-eye" style={{ fontSize: 12 }} /> Ver
          </button>
          <button title="Excluir" onClick={() => setDeleteId(r.id)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, padding: 0, background: '#fff', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', color: '#dc2626', fontSize: 13, flexShrink: 0 }}>
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
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Usuários</h1>
          <nav style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            <span style={{ cursor: 'pointer', color: '#00963F' }} onClick={() => onNavigate('home')}>Início</span>
            {' › '}Configurações{' › '}Usuários
          </nav>
        </div>
        <button onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', borderRadius: 8, background: '#00963F', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#007A32')}
          onMouseLeave={e => (e.currentTarget.style.background = '#00963F')}>
          <i className="bi bi-person-plus-fill" /> Novo usuário
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14, pointerEvents: 'none' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nome ou login..."
              style={{ width: '100%', height: 38, paddingLeft: 36, paddingRight: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif' }}
              onFocus={e => (e.target.style.borderColor = '#00963F')}
              onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
          </div>
        </div>
        <DataTable
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          data={pageData as unknown as Record<string, unknown>[]}
          totalRecords={filtered.length}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={s => { setPageSize(s); setPage(1); }}
          emptyMessage="Nenhum usuário encontrado." />
      </div>

      {modal && (
        <UsuarioModal key={modal.usuario.id ?? 'new'} usuario={modal.usuario} isCreating={modal.isCreating} onClose={() => setModal(null)} onSave={handleSave} />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Excluir usuário"
        message="Esta ação não pode ser desfeita. O usuário será removido permanentemente."
        confirmLabel="Excluir"
        confirmVariant="danger"
        onConfirm={doDelete}
        onCancel={() => setDeleteId(null)} />
    </div>
  );
}
