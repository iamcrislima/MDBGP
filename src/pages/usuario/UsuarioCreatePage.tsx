import React, { useState } from 'react';
import type { NavigateFn } from '../../types';
import { MOCK_PERFIS } from '../../data/mockData';

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

export default function UsuarioCreatePage({ onNavigate }: { onNavigate: NavigateFn }) {
  const [form, setForm] = useState({ nome: '', login: '', senha: '', tipoAcesso: 'Nacional', uf: '', municipio: '', perfis: [] as string[], situacao: 'Ativo' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório.';
    if (!form.login.trim()) e.login = 'Login é obrigatório.';
    if (!form.senha.trim()) e.senha = 'Senha é obrigatória.';
    return e;
  };

  const togglePerfil = (nome: string) => setForm(p => ({ ...p, perfis: p.perfis.includes(nome) ? p.perfis.filter(x => x !== nome) : [...p.perfis, nome] }));

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    setTimeout(() => { setSaving(false); onNavigate('usuario'); }, 800);
  };

  const inputStyle = (err?: string): React.CSSProperties => ({ width: '100%', height: 42, padding: '0 12px', border: `1.5px solid ${err ? '#dc2626' : '#d1d5db'}`, borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif' });
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 };
  const focusStyle = { onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }, onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; } };

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Novo Usuário</h1>
        <nav style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          <span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={() => onNavigate('home')}>Início</span>
          {' › '}<span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={() => onNavigate('usuario')}>Usuários</span>
          {' › '}Novo Usuário
        </nav>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '28px', maxWidth: 760 }}>
        {/* Dados Pessoais */}
        <SectionHeader icon="bi-person-fill" title="Dados do Usuário" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px', marginBottom: 28 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Nome Completo *</label>
            <input style={inputStyle(errors.nome)} value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" {...focusStyle} />
            {errors.nome && <div style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.nome}</div>}
          </div>
          <div>
            <label style={labelStyle}>Login / E-mail *</label>
            <input type="email" style={inputStyle(errors.login)} value={form.login} onChange={e => setForm(p => ({ ...p, login: e.target.value }))} placeholder="usuario@mdb.org.br" {...focusStyle} />
            {errors.login && <div style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.login}</div>}
          </div>
          <div>
            <label style={labelStyle}>Senha *</label>
            <input type="password" style={inputStyle(errors.senha)} value={form.senha} onChange={e => setForm(p => ({ ...p, senha: e.target.value }))} placeholder="Senha inicial" {...focusStyle} />
            {errors.senha && <div style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.senha}</div>}
          </div>
        </div>

        {/* Acesso */}
        <SectionHeader icon="bi-shield-check" title="Nível de Acesso" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px 24px', marginBottom: 28 }}>
          <div>
            <label style={labelStyle}>Tipo de Acesso</label>
            <select style={inputStyle() as React.CSSProperties} value={form.tipoAcesso} onChange={e => setForm(p => ({ ...p, tipoAcesso: e.target.value, uf: '', municipio: '' }))} {...focusStyle}>
              {['Nacional', 'Estadual', 'Municipal'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          {(form.tipoAcesso === 'Estadual' || form.tipoAcesso === 'Municipal') && (
            <div>
              <label style={labelStyle}>UF</label>
              <select style={inputStyle() as React.CSSProperties} value={form.uf} onChange={e => setForm(p => ({ ...p, uf: e.target.value }))} {...focusStyle}>
                <option value="">Selecione</option>
                {UFS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          )}
          {form.tipoAcesso === 'Municipal' && (
            <div>
              <label style={labelStyle}>Município</label>
              <input style={inputStyle()} value={form.municipio} onChange={e => setForm(p => ({ ...p, municipio: e.target.value }))} placeholder="Município" {...focusStyle} />
            </div>
          )}
          <div>
            <label style={labelStyle}>Situação</label>
            <select style={inputStyle() as React.CSSProperties} value={form.situacao} onChange={e => setForm(p => ({ ...p, situacao: e.target.value }))} {...focusStyle}>
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>
        </div>

        {/* Perfis */}
        <SectionHeader icon="bi-person-gear" title="Perfis de Acesso" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
          {MOCK_PERFIS.filter(p => p.situacao === 'Ativo').map(p => {
            const sel = form.perfis.includes(p.nome);
            return (
              <button key={p.id} onClick={() => togglePerfil(p.nome)} style={{ padding: '6px 14px', border: `1.5px solid ${sel ? '#2563eb' : '#d1d5db'}`, borderRadius: 20, background: sel ? '#eff6ff' : '#fff', color: sel ? '#2563eb' : '#374151', fontSize: 12, fontWeight: sel ? 600 : 400, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
                {sel && <i className="bi bi-check2" style={{ marginRight: 4 }} />}{p.nome}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid #f0f4fb' }}>
          <button onClick={() => onNavigate('usuario')} style={{ padding: '10px 22px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'Open Sans, sans-serif' }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
            {saving ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Salvando…</> : <><i className="bi bi-check2-circle" /> Salvar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid #f0f4fb' }}>
      <div style={{ width: 30, height: 30, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className={`bi ${icon}`} style={{ color: '#2563eb', fontSize: 14 }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{title}</span>
    </div>
  );
}
