import React, { useState } from 'react';
import type { NavigateFn } from '../../types';
import Button from '../../components/shared/Button';

export default function PerfilCreatePage({ onNavigate }: { onNavigate: NavigateFn }) {
  const [form, setForm] = useState({ nome: '', identificador1doc: '', situacao: 'Ativo' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório.';
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    setTimeout(() => { setSaving(false); onNavigate('perfil'); }, 800);
  };

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: '100%', height: 42, padding: '0 12px',
    border: `1.5px solid ${err ? 'var(--color-error)' : 'var(--color-border-input)'}`,
    borderRadius: 8, fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif',
  });

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Novo Perfil</h1>
        <nav style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
          <span style={{ cursor: 'pointer', color: 'var(--color-info)' }} onClick={() => onNavigate('home')}>Início</span>
          {' › '}<span style={{ cursor: 'pointer', color: 'var(--color-info)' }} onClick={() => onNavigate('perfil')}>Perfis</span>
          {' › '}Novo Perfil
        </nav>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, padding: '28px 28px', maxWidth: 680 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-strong)', marginBottom: 22, paddingBottom: 14, borderBottom: '1px solid var(--color-bg-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-person-gear" style={{ color: 'var(--color-info)' }} /> Dados do Perfil
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Nome do Perfil *</label>
            <input style={inputStyle(errors.nome)} value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex.: Administrador Estadual" onFocus={e => { e.target.style.borderColor = 'var(--color-info)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={e => { e.target.style.borderColor = errors.nome ? 'var(--color-error)' : 'var(--color-border-input)'; e.target.style.boxShadow = 'none'; }} />
            {errors.nome && <div style={{ color: 'var(--color-error)', fontSize: 11, marginTop: 3 }}>{errors.nome}</div>}
          </div>

          <div>
            <label style={labelStyle}>Identificador 1Doc</label>
            <input style={inputStyle()} value={form.identificador1doc} onChange={e => setForm(p => ({ ...p, identificador1doc: e.target.value }))} placeholder="identificador_sistema" onFocus={e => { e.target.style.borderColor = 'var(--color-info)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--color-border-input)'; e.target.style.boxShadow = 'none'; }} />
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>Opcional — para integração com 1Doc.</div>
          </div>

          <div>
            <label style={labelStyle}>Situação</label>
            <select value={form.situacao} onChange={e => setForm(p => ({ ...p, situacao: e.target.value }))} style={{ ...inputStyle(), cursor: 'pointer' }}>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--color-bg-subtle)' }}>
          <button onClick={() => onNavigate('perfil')} style={{ padding: '10px 22px', border: '1.5px solid var(--color-border-input)', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--color-text-dark)', fontFamily: 'Open Sans, sans-serif' }}>Cancelar</button>
          <Button variant="primary" onClick={handleSave} loading={saving} icon="bi-check2-circle">
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 };
