import React, { useState } from 'react';
import logoMdb from '../Assets/logo-mdb.png';
import congressoBg from '../Assets/congresso.jpg';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail]         = useState('');
  const [senha, setSenha]         = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<{ email?: string; senha?: string; geral?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Informe o login.';
    if (!senha.trim()) e.senha = 'Informe a senha.';
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    setTimeout(() => {
      if ((email === 'admin' || email === 'admin@mdb.org.br') && senha === '123456') {
        onLogin();
      } else {
        setErrors({ geral: 'Login ou senha incorretos.' });
      }
      setLoading(false);
    }, 900);
  };

  const SHADOW = '0 8px 32px rgba(0,0,0,0.14)';

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      background: '#f4f6f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Open Sans, sans-serif',
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>

        {/* ── Box esquerdo — foto — 798 × 646 ── */}
        <div style={{
          width: 798, height: 646,
          borderRadius: 8, overflow: 'hidden',
          boxShadow: SHADOW, flexShrink: 0, position: 'relative',
        }}>
          <img
            src={congressoBg} alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              display: 'block',
            }}
          />
        </div>

        {/* ── Box direito — 470 × 646 ── */}
        <div style={{
          width: 470, height: 646,
          borderRadius: 8, overflow: 'hidden',
          boxShadow: SHADOW, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          background: '#fff',
        }}>

          {/* Header branco */}
          <div style={{
            background: '#fff',
            padding: '24px 28px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            flexShrink: 0,
          }}>
            <img src={logoMdb} alt="MDB" style={{ width: 120, marginBottom: 10 }} />
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>
              Gestão Partidária
            </div>
            <div style={{ width: '100%', height: 0.5, background: '#e5e7eb', marginTop: 20 }} />
          </div>

          {/* Formulário */}
          <div style={{
            flex: 1,
            padding: '22px 44px 28px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            {/* Conteúdo principal */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                  Bem-vindo!
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  Faça login para acessar o sistema
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {errors.geral && (
                  <div style={{
                    background: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: 8, padding: '10px 14px',
                    marginBottom: 16, fontSize: 13, color: '#dc2626',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <i className="bi bi-exclamation-circle-fill" />
                    {errors.geral}
                  </div>
                )}

                {/* Login */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.6px', marginBottom: 7 }}>
                    Login
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                      color: errors.email ? '#dc2626' : '#9ca3af', fontSize: 14, lineHeight: 1, pointerEvents: 'none',
                    }}>
                      <i className="bi bi-person" />
                    </span>
                    <input
                      type="text" value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined, geral: undefined })); }}
                      placeholder="usuário ou e-mail"
                      style={{
                        width: '100%', height: 46,
                        padding: '0 14px 0 38px',
                        border: `1.5px solid ${errors.email ? '#dc2626' : '#e2e8f0'}`,
                        borderRadius: 8, fontSize: 14, outline: 'none',
                        boxSizing: 'border-box' as const,
                        fontFamily: 'Open Sans, sans-serif',
                        background: '#f8fafc', color: '#1e293b',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#00963F'; e.target.style.boxShadow = '0 0 0 3px rgba(0,150,63,0.12)'; e.target.style.background = '#fff'; }}
                      onBlur={e => { e.target.style.borderColor = errors.email ? '#dc2626' : '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                    />
                  </div>
                  {errors.email && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
                </div>

                {/* Senha */}
                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.6px', marginBottom: 7 }}>
                    Senha
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                      color: errors.senha ? '#dc2626' : '#9ca3af', fontSize: 14, lineHeight: 1, pointerEvents: 'none',
                    }}>
                      <i className="bi bi-lock" />
                    </span>
                    <input
                      type={showSenha ? 'text' : 'password'} value={senha}
                      onChange={e => { setSenha(e.target.value); setErrors(p => ({ ...p, senha: undefined, geral: undefined })); }}
                      placeholder="••••••••"
                      style={{
                        width: '100%', height: 46,
                        padding: '0 44px 0 38px',
                        border: `1.5px solid ${errors.senha ? '#dc2626' : '#e2e8f0'}`,
                        borderRadius: 8, fontSize: 14, outline: 'none',
                        boxSizing: 'border-box' as const,
                        fontFamily: 'Open Sans, sans-serif',
                        background: '#f8fafc', color: '#1e293b',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#00963F'; e.target.style.boxShadow = '0 0 0 3px rgba(0,150,63,0.12)'; e.target.style.background = '#fff'; }}
                      onBlur={e => { e.target.style.borderColor = errors.senha ? '#dc2626' : '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                    />
                    <button
                      type="button" onClick={() => setShowSenha(v => !v)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#9ca3af', fontSize: 15, padding: 0, lineHeight: 1,
                      }}
                    >
                      <i className={`bi bi-eye${showSenha ? '-slash' : ''}`} />
                    </button>
                  </div>
                  {errors.senha && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.senha}</div>}
                </div>

                {/* Botão Entrar */}
                <button
                  type="submit" disabled={loading}
                  style={{
                    width: '100%', height: 48, borderRadius: 8, border: 'none',
                    background: loading ? '#5aaa7a' : '#00963F',
                    color: '#fff', fontWeight: 700, fontSize: 15,
                    cursor: loading ? 'default' : 'pointer',
                    fontFamily: 'Open Sans, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    letterSpacing: 0.3,
                    boxShadow: loading ? 'none' : '0 4px 14px rgba(0,150,63,0.30)',
                    transition: 'background 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#007A32'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#00963F'; }}
                >
                  {loading
                    ? <><span className="spinner-border spinner-border-sm" style={{ width: 16, height: 16, borderWidth: 2 }} /> Entrando...</>
                    : <><i className="bi bi-box-arrow-in-right" /> Entrar</>
                  }
                </button>
              </form>
            </div>

            {/* Link rodapé */}
            <div style={{ textAlign: 'center' }}>
              <a href="#" style={{ fontSize: 13, color: '#00963F', textDecoration: 'none', fontWeight: 500 }}
                onClick={e => e.preventDefault()}>
                Esqueci minha senha
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
