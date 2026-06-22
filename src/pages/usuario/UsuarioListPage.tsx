import React, { useState, useMemo } from 'react';
import type { NavigateFn, Usuario } from '../../types';
import DataTable, { Column } from '../../components/shared/DataTable';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import CustomSelect from '../../components/shared/CustomSelect';
import { MOCK_USUARIOS, MOCK_PERFIS } from '../../data/mockData';
import Badge, { type BadgeVariant } from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import ModalBase from '../../components/shared/ModalBase';
import Avatar from '../../components/shared/Avatar';
import PageHeader from '../../components/shared/PageHeader';
import SectionHeader from '../../components/shared/SectionHeader';

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
function tipoAcessoVariant(tipo: string): BadgeVariant {
  if (tipo === 'Estadual') return 'transferido';
  if (tipo === 'Nacional' || tipo === 'Municipal') return 'success';
  return 'neutral';
}


const FIELD_LABEL: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 };
const FIELD_VALUE: React.CSSProperties = { fontSize: 14, color: 'var(--color-text-primary)' };
const INP: React.CSSProperties = { width: '100%', height: 42, padding: '0 12px', border: '1.5px solid var(--color-border-input)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif', color: 'var(--color-text-primary)' };


function PerfilChip({ nome, selected, onToggle }: { nome: string; selected: boolean; onToggle: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onToggle}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '6px 14px', border: `1.5px solid ${selected ? '#86efac' : hov ? '#86efac' : 'var(--color-border)'}`, borderRadius: 20, background: selected ? '#dcfce7' : '#fff', color: selected ? 'var(--color-success)' : hov ? 'var(--color-success)' : 'var(--color-text-dark)', fontSize: 12, fontWeight: selected ? 600 : 400, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', transition: 'all 0.12s' }}>
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
    <ModalBase open={true} onClose={onClose} width={560} height="80vh" shadow="light" backdropBlur={3}>

      <ModalBase.LightHeader
        onClose={onClose}
        actions={mode === 'view' && !isCreating
          ? <Button variant="ghost" size="sm" onClick={() => setMode('edit')} icon="bi-pencil">Editar</Button>
          : undefined
        }
        tabs={
          <>
            {(['dados', 'acesso'] as ModalTab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '8px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--color-primary)' : 'transparent'}`, background: 'none', color: tab === t ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', marginBottom: -1, transition: 'color 0.15s' }}>
                {t === 'dados' ? 'Dados' : 'Nível de acesso'}
              </button>
            ))}
          </>
        }
      >
        <Avatar nome={isCreating ? 'NU' : usuario.nome} size={38} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
            {isCreating ? 'Novo Usuário' : usuario.nome}
          </div>
          {!isCreating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{usuario.login}</span>
              <Badge variant={usuario.situacao === 'Ativo' ? 'success' : 'error'} label={usuario.situacao} />
            </div>
          )}
        </div>
      </ModalBase.LightHeader>

      <ModalBase.Body padding="20px">

          {/* Dados — view */}
          {tab === 'dados' && mode === 'view' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
              <div><label style={FIELD_LABEL}>Nome completo</label><div style={FIELD_VALUE}>{usuario.nome || '—'}</div></div>
              <div><label style={FIELD_LABEL}>Login / E-mail</label><div style={FIELD_VALUE}>{usuario.login || '—'}</div></div>
              <div><label style={FIELD_LABEL}>Situação</label><Badge variant={usuario.situacao === 'Ativo' ? 'success' : 'error'} label={usuario.situacao} /></div>
              <div><label style={FIELD_LABEL}>Cadastrado em</label><div style={FIELD_VALUE}>{usuario.cadastradoEm}</div></div>
              <div><label style={FIELD_LABEL}>Última alteração</label><div style={FIELD_VALUE}>{usuario.ultimaAlteracao || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}</div></div>
              <div><label style={FIELD_LABEL}>Último acesso</label><div style={FIELD_VALUE}>{usuario.ultimoAcesso}</div></div>
            </div>
          )}

          {/* Dados — edit */}
          {tab === 'dados' && mode === 'edit' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={FIELD_LABEL}>Nome completo *</label>
                <input style={{ ...INP, borderColor: errors.nome ? 'var(--color-error)' : 'var(--color-border-input)' }}
                  value={form.nome}
                  onChange={e => { setForm(p => ({ ...p, nome: e.target.value })); setErrors(p => ({ ...p, nome: undefined })); }}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.target.style.borderColor = errors.nome ? 'var(--color-error)' : 'var(--color-border-input)')} />
                {errors.nome && <div style={{ color: 'var(--color-error)', fontSize: 11, marginTop: 3 }}>{errors.nome}</div>}
              </div>
              <div>
                <label style={FIELD_LABEL}>Login / E-mail *</label>
                <input type="email" style={{ ...INP, borderColor: errors.login ? 'var(--color-error)' : 'var(--color-border-input)' }}
                  value={form.login}
                  onChange={e => { setForm(p => ({ ...p, login: e.target.value })); setErrors(p => ({ ...p, login: undefined })); }}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.target.style.borderColor = errors.login ? 'var(--color-error)' : 'var(--color-border-input)')} />
                {errors.login && <div style={{ color: 'var(--color-error)', fontSize: 11, marginTop: 3 }}>{errors.login}</div>}
              </div>
              <div>
                <label style={FIELD_LABEL}>Situação</label>
                <CustomSelect value={form.situacao} onChange={v => setForm(p => ({ ...p, situacao: v as 'Ativo' | 'Inativo' }))} options={SITUACAO_OPTS} placeholder="Selecione" />
              </div>

              {/* Alterar senha */}
              <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                <button type="button"
                  onClick={() => { setSenhaOpen(p => !p); setSenhaError(''); setNovaSenha(''); setConfirmSenha(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '10px 14px', background: senhaOpen ? '#f0fdf4' : 'var(--color-bg-input)', border: `1px solid ${senhaOpen ? '#bbf7d0' : 'var(--color-border)'}`, borderRadius: senhaOpen ? '8px 8px 0 0' : 8, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', color: 'var(--color-text-dark)', fontSize: 13, fontWeight: 600, textAlign: 'left' }}>
                  <i className="bi bi-key" style={{ color: 'var(--color-primary)', fontSize: 14 }} />
                  Alterar senha
                  <i className={`bi bi-chevron-${senhaOpen ? 'up' : 'down'}`} style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-muted)' }} />
                </button>
                {senhaOpen && (
                  <div style={{ padding: '16px 14px 12px', border: '1px solid #bbf7d0', borderTop: 'none', borderRadius: '0 0 8px 8px', background: '#fff' }}>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: 12, marginBottom: 14 }}>Deixe em branco para manter a senha atual.</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                      <div>
                        <label style={FIELD_LABEL}>Nova senha</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showNova ? 'text' : 'password'} value={novaSenha}
                            onChange={e => { setNovaSenha(e.target.value); setSenhaError(''); }}
                            placeholder="Mín. 8 caracteres"
                            style={{ ...INP, paddingRight: 40, borderColor: senhaError ? 'var(--color-error)' : 'var(--color-border-input)', fontSize: 16 }}
                            onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                            onBlur={e => (e.target.style.borderColor = senhaError ? 'var(--color-error)' : 'var(--color-border-input)')} />
                          <Button variant="icon" size="sm" type="button" onClick={() => setShowNova(!showNova)} icon={`bi-eye${showNova ? '-slash' : ''}`} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 'auto', height: 'auto', minHeight: 'auto' }} />
                        </div>
                      </div>
                      <div>
                        <label style={FIELD_LABEL}>Confirmar nova senha</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showConfirm ? 'text' : 'password'} value={confirmSenha}
                            onChange={e => { setConfirmSenha(e.target.value); setSenhaError(''); }}
                            placeholder="Repita a nova senha"
                            style={{ ...INP, paddingRight: 40, borderColor: senhaError ? 'var(--color-error)' : 'var(--color-border-input)', fontSize: 16 }}
                            onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                            onBlur={e => (e.target.style.borderColor = senhaError ? 'var(--color-error)' : 'var(--color-border-input)')} />
                          <Button variant="icon" size="sm" type="button" onClick={() => setShowConfirm(!showConfirm)} icon={`bi-eye${showConfirm ? '-slash' : ''}`} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 'auto', height: 'auto', minHeight: 'auto' }} />
                        </div>
                      </div>
                    </div>
                    {senhaError && <div style={{ color: 'var(--color-error)', fontSize: 12, marginTop: 8 }}>{senhaError}</div>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nível de acesso — view */}
          {tab === 'acesso' && mode === 'view' && (
            <div>
              <SectionHeader icon="bi-shield-check" title="Tipo de acesso" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Badge variant={tipoAcessoVariant(usuario.tipoAcesso)} label={usuario.tipoAcesso} />
                {usuario.tipoAcesso !== 'Nacional' && usuario.uf && (
                  <span style={{ fontSize: 13, color: 'var(--color-text-dark)' }}>UF: <strong>{usuario.uf}</strong></span>
                )}
                {usuario.tipoAcesso === 'Municipal' && usuario.municipio && (
                  <span style={{ fontSize: 13, color: 'var(--color-text-dark)' }}>Município: <strong>{usuario.municipio}</strong></span>
                )}
              </div>

              <SectionHeader
                icon="bi-person-gear"
                title="Perfis de acesso"
                action={<span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{usuario.perfis.length} selecionado(s)</span>}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {activePerfis.map(p => {
                  const sel = usuario.perfis.includes(p.nome);
                  return (
                    <span key={p.id} style={{ padding: '6px 14px', border: `1.5px solid ${sel ? '#86efac' : 'var(--color-border)'}`, borderRadius: 20, background: sel ? '#dcfce7' : '#fff', color: sel ? 'var(--color-success)' : 'var(--color-text-muted)', fontSize: 12, fontWeight: sel ? 600 : 400, fontFamily: 'Open Sans, sans-serif' }}>
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
              <SectionHeader icon="bi-shield-check" title="Tipo de acesso" />
              <div style={{ marginBottom: 24 }}>
                <div style={{ width: 180 }}>
                  <CustomSelect value={form.tipoAcesso} onChange={v => setForm(p => ({ ...p, tipoAcesso: v as 'Nacional' | 'Estadual' | 'Municipal', uf: '', municipio: '' }))} options={TIPO_OPTS} placeholder="Selecione" />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>{TIPO_HINT[form.tipoAcesso]}</div>
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
                          onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <SectionHeader
                icon="bi-person-gear"
                title="Perfis de acesso"
                action={<span style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-bg-page)', borderRadius: 100, padding: '2px 8px' }}>{form.perfis.length} selecionado(s)</span>}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {activePerfis.map(p => (
                  <PerfilChip key={p.id} nome={p.nome} selected={form.perfis.includes(p.nome)} onToggle={() => togglePerfil(p.nome)} />
                ))}
              </div>
            </div>
          )}
      </ModalBase.Body>

      {mode === 'edit' && (
        <ModalBase.Footer>
          <Button variant="ghost" onClick={cancelEdit}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} loading={saving} icon="bi-floppy">
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </ModalBase.Footer>
      )}
    </ModalBase>
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
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{r.login}</div>
          </div>
        </div>
      ),
    },
    { key: 'tipoAcesso', label: 'Tipo de acesso', render: r => <Badge variant={tipoAcessoVariant(r.tipoAcesso)} label={`${r.tipoAcesso}${r.uf ? ` — ${r.uf}` : ''}`} /> },
    { key: 'perfis',     label: 'Perfis',          render: r => r.perfis.join(', ') || <span style={{ color: 'var(--color-text-muted)' }}>—</span> },
    { key: 'situacao',   label: 'Situação',         render: r => <Badge variant={r.situacao === 'Ativo' ? 'success' : 'error'} label={r.situacao} /> },
    { key: 'ultimoAcesso', label: 'Último acesso',  width: 180 },
    {
      key: 'acoes', label: 'Ações', sortable: false, width: 90,
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
          <Button variant="ghost" size="sm" onClick={() => setModal({ usuario: r, isCreating: false })} icon="bi-eye">Ver</Button>
          <Button variant="icon" size="sm" title="Excluir" onClick={() => setDeleteId(r.id)} icon="bi-trash" style={{ color: 'var(--color-error)', border: '1px solid #fca5a5' }} />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <PageHeader
        title="Usuários"
        breadcrumb={[
          { label: 'Início', onClick: () => onNavigate('home') },
          { label: 'Configurações' },
          { label: 'Usuários' },
        ]}
        action={<Button variant="primary" onClick={openCreate} icon="bi-person-plus-fill">Novo usuário</Button>}
      />

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 14, pointerEvents: 'none' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nome ou login..."
              style={{ width: '100%', height: 38, paddingLeft: 36, paddingRight: 12, border: '1px solid var(--color-border-input)', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif' }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')} />
          </div>
        </div>
        <DataTable<Usuario>
          columns={columns}
          data={pageData}
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
