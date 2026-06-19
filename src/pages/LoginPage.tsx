import React, { useState } from 'react';
import LogoMDB from '../components/LogoMDB';
import congressoBg from '../Assets/congresso.jpg';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { isMobile, isTablet } = useBreakpoint();
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

  // ── Mobile: form only, centered ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#fff',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Open Sans, sans-serif',
        padding: '32px 24px',
        boxSizing: 'border-box',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
            <LogoMDB style={{ width: 100, marginBottom: 10 }} />
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Gestão Partidária</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Bem-vindo!</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Faça login para acessar o sistema</div>
          </div>

          <FormBody
            email={email} setEmail={setEmail}
            senha={senha} setSenha={setSenha}
            showSenha={showSenha} setShowSenha={setShowSenha}
            loading={loading} errors={errors} setErrors={setErrors}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    );
  }

  // ── Tablet/Desktop: split layout ─────────────────────────────────────────────
  const imgRatio  = isTablet ? '45%' : '55%';
  const formRatio = isTablet ? '55%' : '45%';

  return (
    <div style={{
      height: '100vh', overflow: 'hidden',
      background: '#f4f6f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Open Sans, sans-serif',
      padding: isTablet ? '16px' : '24px',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isTablet ? 20 : 32, maxWidth: 1300, width: '100%' }}>

        {/* ── Imagem ── */}
        <div style={{
          flex: imgRatio, height: isTablet ? 'min(560px, 80vh)' : 646,
          borderRadius: 8, overflow: 'hidden',
          boxShadow: SHADOW, flexShrink: 0, position: 'relative', minWidth: 0,
        }}>
          <img
            src={congressoBg} alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          />
        </div>

        {/* ── Formulário ── */}
        <div style={{
          flex: formRatio, height: isTablet ? 'min(560px, 80vh)' : 646,
          borderRadius: 8, overflow: 'hidden',
          boxShadow: SHADOW, flexShrink: 0, minWidth: 0,
          display: 'flex', flexDirection: 'column',
          background: '#fff',
        }}>
          {/* Header branco */}
          <div style={{ background: '#fff', padding: '22px 28px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <LogoMDB style={{ width: 110, marginBottom: 8 }} />
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>Gestão Partidária</div>
            <div style={{ width: '100%', height: 0.5, background: '#e5e7eb', marginTop: 18 }} />
          </div>

          {/* Form */}
          <div style={{ flex: 1, padding: '20px 40px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
            <div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 19, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Bem-vindo!</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Faça login para acessar o sistema</div>
              </div>
              <FormBody
                email={email} setEmail={setEmail}
                senha={senha} setSenha={setSenha}
                showSenha={showSenha} setShowSenha={setShowSenha}
                loading={loading} errors={errors} setErrors={setErrors}
                handleSubmit={handleSubmit}
              />
            </div>
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

// ── Shared form body ──────────────────────────────────────────────────────────
function FormBody({
  email, setEmail, senha, setSenha,
  showSenha, setShowSenha,
  loading, errors, setErrors, handleSubmit,
}: {
  email: string; setEmail: (v: string) => void;
  senha: string; setSenha: (v: string) => void;
  showSenha: boolean; setShowSenha: (v: boolean) => void;
  loading: boolean;
  errors: { email?: string; senha?: string; geral?: string };
  setErrors: React.Dispatch<React.SetStateAction<{ email?: string; senha?: string; geral?: string }>>;
  handleSubmit: (e: React.FormEvent) => void;
}) {
  const lb: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.6px', marginBottom: 7 };
  const inp = (hasErr: boolean): React.CSSProperties => ({
    width: '100%', height: 46, padding: '0 14px',
    border: `1.5px solid ${hasErr ? '#dc2626' : '#e2e8f0'}`,
    borderRadius: 8, fontSize: 14, outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'Open Sans, sans-serif',
    background: '#f8fafc', color: '#1e293b',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.geral && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-exclamation-circle-fill" />
          {errors.geral}
        </div>
      )}

      {/* Login */}
      <div style={{ marginBottom: 16 }}>
        <label style={lb}>Login</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: errors.email ? '#dc2626' : '#9ca3af', fontSize: 14, lineHeight: 1, pointerEvents: 'none' }}>
            <i className="bi bi-person" />
          </span>
          <input
            type="text" value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined, geral: undefined })); }}
            placeholder="usuário ou e-mail"
            style={{ ...inp(!!errors.email), paddingLeft: 38 }}
            onFocus={e => { e.target.style.borderColor = '#00963F'; e.target.style.boxShadow = '0 0 0 3px rgba(0,150,63,0.12)'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = errors.email ? '#dc2626' : '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
          />
        </div>
        {errors.email && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
      </div>

      {/* Senha */}
      <div style={{ marginBottom: 22 }}>
        <label style={lb}>Senha</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: errors.senha ? '#dc2626' : '#9ca3af', fontSize: 14, lineHeight: 1, pointerEvents: 'none' }}>
            <i className="bi bi-lock" />
          </span>
          <input
            type={showSenha ? 'text' : 'password'} value={senha}
            onChange={e => { setSenha(e.target.value); setErrors(p => ({ ...p, senha: undefined, geral: undefined })); }}
            placeholder="••••••••"
            style={{ ...inp(!!errors.senha), paddingLeft: 38, paddingRight: 44 }}
            onFocus={e => { e.target.style.borderColor = '#00963F'; e.target.style.boxShadow = '0 0 0 3px rgba(0,150,63,0.12)'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = errors.senha ? '#dc2626' : '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
          />
          <button type="button" onClick={() => setShowSenha(!showSenha)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 15, padding: 0, lineHeight: 1, minWidth: 28, minHeight: 28 }}>
            <i className={`bi bi-eye${showSenha ? '-slash' : ''}`} />
          </button>
        </div>
        {errors.senha && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.senha}</div>}
      </div>

      <button type="submit" disabled={loading}
        style={{ width: '100%', height: 48, borderRadius: 8, border: 'none', background: loading ? '#5aaa7a' : '#00963F', color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: 0.3, boxShadow: loading ? 'none' : '0 4px 14px rgba(0,150,63,0.30)', transition: 'background 0.15s' }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#007A32'; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#00963F'; }}
      >
        {loading
          ? <><span className="spinner-border spinner-border-sm" style={{ width: 16, height: 16, borderWidth: 2 }} /> Entrando...</>
          : <><i className="bi bi-box-arrow-in-right" /> Entrar</>
        }
      </button>
    </form>
  );
}
