import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import type { Page, NavigateFn } from './types';
import logoMdb from './Assets/logo-mdb.png';

// ── Pages (lazy loaded) ────────────────────────────────────────────────────────
const LoginPage        = lazy(() => import('./pages/LoginPage'));
const BIPage           = lazy(() => import('./pages/BIPage'));
const MandatarioPage   = lazy(() => import('./pages/MandatarioPage'));
const FiliacaoPage     = lazy(() => import('./pages/FiliacaoPage'));
const OrgaoPage        = lazy(() => import('./pages/OrgaoPage'));
const DirigentePage    = lazy(() => import('./pages/DirigentePage'));
const LogAcessoPage    = lazy(() => import('./pages/LogAcessoPage'));
const PerfilListPage   = lazy(() => import('./pages/perfil/PerfilListPage'));
const UsuarioListPage  = lazy(() => import('./pages/usuario/UsuarioListPage'));
const BIDataPage              = lazy(() => import('./pages/BIDataPage'));
const GerenciarFiliadosPage   = lazy(() => import('./pages/GerenciarFiliadosPage'));

// ── Constants ─────────────────────────────────────────────────────────────────
const NAVBAR_H       = 60;
const SIDEBAR_OPEN_W = 240;
const SIDEBAR_CLOSED_W = 64;
const MOBILE_BP      = 768;

// ── Nav model ─────────────────────────────────────────────────────────────────
type SubItem = { label: string; page: Page };
type NavItem = { id: string; label: string; icon: string; page?: Page; children?: SubItem[] };

const NAV_ITEMS: NavItem[] = [
  { id: 'home',       label: 'Tela Inicial',       icon: 'bi-house-door-fill', page: 'home' },
  { id: 'mandatarios',label: 'Mandatários',         icon: 'bi-people-fill',
    children: [{ label: 'Consultar Mandatários', page: 'mandatario' }] },
  { id: 'filiacao',   label: 'Filiação Partidária', icon: 'bi-diagram-3-fill',
    children: [
      { label: 'Consultar Filiados',  page: 'filiacao' },
      { label: 'Gerenciar Filiados',  page: 'gerenciar-filiados' },
    ] },
  { id: 'orgaos',     label: 'Órgãos Partidários',  icon: 'bi-bank2',
    children: [{ label: 'Consultar Órgãos Partidários', page: 'orgao' }] },
  { id: 'dirigentes', label: 'Dirigentes',           icon: 'bi-person-badge-fill',
    children: [{ label: 'Consultar Dirigentes', page: 'dirigente' }] },
  { id: 'bi',         label: 'BI',                   icon: 'bi-speedometer2', page: 'bi' },
  { id: 'config',     label: 'Configurações',        icon: 'bi-gear-fill',
    children: [
      { label: 'Perfis',        page: 'perfil' },
      { label: 'Usuários',      page: 'usuario' },
      { label: 'Log de Acesso', page: 'log-acesso' },
    ] },
];

const ACTIVE_MAP: Record<Page, string> = {
  'home': 'home', 'bi': 'bi',
  'mandatario': 'mandatarios',
  'filiacao': 'filiacao',
  'orgao': 'orgaos',
  'dirigente': 'dirigentes',
  'log-acesso': 'config', 'perfil': 'config',
  'usuario': 'config',
  'gerenciar-filiados': 'filiacao',
};

// ── Spinner for Suspense ──────────────────────────────────────────────────────
function PageSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner-border text-success" role="status" style={{ width: 32, height: 32, borderWidth: 3 }}>
        <span className="visually-hidden">Carregando...</span>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [currentPage,  setCurrentPage]  = useState<Page>('home');
  const [selectedId,   setSelectedId]   = useState<number | undefined>();
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [isMobile,     setIsMobile]     = useState(false);
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [pwForm,       setPwForm]       = useState({ atual: '', nova: '', confirmar: '' });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < MOBILE_BP;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate: NavigateFn = useCallback((page: Page, id?: number) => {
    setCurrentPage(page);
    setSelectedId(id);
    const sidebarId = ACTIVE_MAP[page];
    const navItem = NAV_ITEMS.find(n => n.id === sidebarId);
    if (navItem?.children) setExpandedId(sidebarId);
    if (isMobile) setSidebarOpen(false);
    window.scrollTo({ top: 0 });
  }, [isMobile]);

  const handleNavClick = (item: NavItem) => {
    if (item.children) {
      setExpandedId(p => (p === item.id ? null : item.id));
    } else if (item.page) {
      navigate(item.page);
    }
  };

  const sidebarW = isMobile
    ? (sidebarOpen ? SIDEBAR_OPEN_W : 0)
    : (sidebarOpen ? SIDEBAR_OPEN_W : SIDEBAR_CLOSED_W);
  const contentML = isMobile ? 0 : sidebarW;
  const activeId  = ACTIVE_MAP[currentPage] || 'home';

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <Suspense fallback={<div style={{ background: '#0a1628', minHeight: '100vh' }} />}>
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      </Suspense>
    );
  }

  // ── Page router ─────────────────────────────────────────────────────────────
  const pageContent = (() => {
    switch (currentPage) {
      case 'home':            return <BIPage onNavigate={navigate} />;
      case 'bi':              return <BIDataPage onNavigate={navigate} />;
      case 'mandatario':      return <MandatarioPage onNavigate={navigate} selectedId={selectedId} />;
      case 'filiacao':        return <FiliacaoPage onNavigate={navigate} />;
      case 'orgao':           return <OrgaoPage onNavigate={navigate} />;
      case 'dirigente':       return <DirigentePage onNavigate={navigate} />;
      case 'log-acesso':      return <LogAcessoPage onNavigate={navigate} />;
      case 'perfil':          return <PerfilListPage onNavigate={navigate} />;
      case 'usuario':         return <UsuarioListPage onNavigate={navigate} />;
      case 'gerenciar-filiados':   return <GerenciarFiliadosPage onNavigate={navigate} />;
      default:                     return <WelcomeCard onNavigate={navigate} />;
    }
  })();

  return (
    <div style={{ fontFamily: 'Open Sans, sans-serif', minHeight: '100vh' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: NAVBAR_H,
        background: '#ffffff', borderBottom: '0.5px solid #e5e7eb',
        display: 'flex', alignItems: 'center', padding: '0 18px 0 20px',
        zIndex: 1040, gap: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <button
            title={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
            onClick={() => setSidebarOpen(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 18, width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 4 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280'; }}
          >
            <i className="bi bi-list" />
          </button>
          <img src={logoMdb} alt="MDB" style={{ height: 28, flexShrink: 0 }} />
          <span style={{ color: '#111827', fontWeight: 600, fontSize: 14 }}>Gestão Partidária</span>
        </div>

        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(v => !v)}
            style={{
              background: showDropdown ? '#f3f4f6' : 'none',
              border: 'none', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { if (!showDropdown) e.currentTarget.style.background = '#f9fafb'; }}
            onMouseLeave={e => { if (!showDropdown) e.currentTarget.style.background = 'none'; }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #00963F 0%, #007A32 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0,
            }}>IS</div>
            <span style={{ color: '#374151', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>Inácio Steffen</span>
            <i className="bi bi-chevron-down" style={{ color: '#9ca3af', fontSize: 11 }} />
          </button>
          {showDropdown && (
            <UserDropdown onAlterarSenha={() => { setShowModal(true); setShowDropdown(false); }} />
          )}
        </div>
      </header>

      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, top: NAVBAR_H,
          background: 'rgba(0,0,0,0.55)', zIndex: 1028,
        }} />
      )}

      <aside style={{
        position: 'fixed', top: NAVBAR_H, left: 0,
        width: sidebarW, height: `calc(100vh - ${NAVBAR_H}px)`,
        background: '#f8f9fa', borderRight: '0.5px solid #e5e7eb',
        overflowY: 'auto', overflowX: 'hidden',
        transition: 'width 0.25s ease', zIndex: 1029,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* MENU label */}
        {sidebarOpen && (
          <div style={{ padding: '14px 20px 6px', fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em' }}>
            MENU
          </div>
        )}

        <nav style={{ flex: 1, paddingBottom: 8, paddingTop: sidebarOpen ? 0 : 8 }}>
          {NAV_ITEMS.map(item => {
            const isActive   = activeId === item.id;
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id}>
                <button
                  title={!sidebarOpen ? item.label : undefined}
                  onClick={() => handleNavClick(item)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    width: '100%', border: 'none',
                    background: isActive ? '#f0fdf4' : 'none',
                    borderLeft: isActive ? '3px solid #00963F' : '3px solid transparent',
                    padding: sidebarOpen ? '10px 16px 10px 17px' : '11px 0',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    cursor: 'pointer', gap: 11,
                    color: isActive ? '#00963F' : '#374151',
                    transition: 'background 0.15s, color 0.15s',
                    fontFamily: 'Open Sans, sans-serif',
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827'; }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#374151'; }
                  }}
                >
                  <i className={`bi ${item.icon}`} style={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: 'center', color: isActive ? '#00963F' : '#6b7280' }} />
                  {sidebarOpen && (
                    <>
                      <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                      {item.children && (
                        <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`} style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }} />
                      )}
                    </>
                  )}
                </button>

                {item.children && isExpanded && sidebarOpen && (
                  <div style={{ background: '#f1f3f5' }}>
                    {item.children.map(sub => {
                      const subActive = currentPage === sub.page;
                      return (
                        <button
                          key={sub.page}
                          onClick={() => navigate(sub.page)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            width: '100%', padding: '8px 16px 8px 48px',
                            background: subActive ? '#dcfce7' : 'none',
                            border: 'none', borderLeft: 'none',
                            color: subActive ? '#00963F' : '#6b7280',
                            textDecoration: 'none', fontSize: 12, cursor: 'pointer',
                            fontFamily: 'Open Sans, sans-serif', textAlign: 'left',
                            fontWeight: subActive ? 600 : 400,
                          }}
                          onMouseEnter={e => { if (!subActive) { e.currentTarget.style.color = '#111827'; e.currentTarget.style.background = '#e9ecef'; } }}
                          onMouseLeave={e => { if (!subActive) { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'none'; } }}
                        >
                          <i className="bi bi-chevron-right" style={{ fontSize: 9, color: '#9ca3af' }} />
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div style={{
            padding: '11px 18px',
            borderTop: '0.5px solid #e5e7eb',
            background: '#f8f9fa',
          }}>
            <span style={{ color: '#9ca3af', fontSize: 11 }}>v1.0.0</span>
          </div>
        )}
      </aside>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      <div style={{
        marginLeft: contentML, marginTop: NAVBAR_H,
        minHeight: `calc(100vh - ${NAVBAR_H}px)`,
        transition: 'margin-left 0.25s ease',
        display: 'flex', flexDirection: 'column',
      }}>
        <main style={{ flex: 1, background: '#f3f4f6' }}>
          <Suspense fallback={<PageSpinner />}>
            {pageContent}
          </Suspense>
        </main>

        <footer style={{
          background: '#ffffff', borderTop: '0.5px solid #e5e7eb',
          padding: '14px 24px', textAlign: 'center',
          color: '#9ca3af', fontSize: 12,
        }}>
          2026 © MDB
        </footer>
      </div>

      {/* ── MODAL ALTERAR SENHA ─────────────────────────────────────────────── */}
      {showModal && (
        <>
          <div onClick={() => setShowModal(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)', zIndex: 1060,
          }} />
          <div role="dialog" aria-modal style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: 12,
            width: 440, maxWidth: 'calc(100vw - 32px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
            zIndex: 1070, overflow: 'hidden',
          }}>
            <div style={{ padding: '18px 22px', background: '#fff', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, background: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-shield-lock-fill" style={{ color: '#00963F', fontSize: 17 }} />
                </div>
                <h5 style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 15 }}>Alterar Senha</h5>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 22 }}>×</button>
            </div>
            <div style={{ padding: '24px 22px 8px' }}>
              {(['Senha Atual|bi-lock-fill|atual', 'Nova Senha|bi-key-fill|nova', 'Confirmar Nova Senha|bi-shield-check|confirmar'] as const).map((s) => {
                const [label, icon, field] = s.split('|') as [string, string, 'atual' | 'nova' | 'confirmar'];
                return <PasswordField key={field} label={label} icon={icon} value={pwForm[field]} onChange={v => setPwForm(p => ({ ...p, [field]: v }))} />;
              })}
            </div>
            <div style={{ padding: '16px 22px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => { setShowModal(false); setPwForm({ atual: '', nova: '', confirmar: '' }); }} style={{ padding: '9px 20px', borderRadius: 8, border: '1.5px solid #e0e0e0', background: '#fff', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>Cancelar</button>
              <button onClick={() => { setShowModal(false); setPwForm({ atual: '', nova: '', confirmar: '' }); }} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#00963F', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="bi bi-check2-circle" style={{ fontSize: 15 }} /> Salvar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── UserDropdown ──────────────────────────────────────────────────────────────
function UserDropdown({ onAlterarSenha }: { onAlterarSenha: () => void }) {
  return (
    <div style={{
      position: 'absolute', right: 0, top: 44,
      background: '#ffffff', border: '1px solid #e5e7eb',
      borderRadius: 10, width: 214,
      boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 1050, overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #00963F 0%, #007A32 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>IS</div>
          <div>
            <div style={{ color: '#111827', fontWeight: 600, fontSize: 13 }}>Inacio Steffen</div>
            <div style={{ color: '#9ca3af', fontSize: 11 }}>Administrador</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '6px 0' }}>
        <button onClick={onAlterarSenha} style={dropBtnStyle(false)}>
          <i className="bi bi-key-fill" style={{ fontSize: 14, width: 16 }} /> Alterar Senha
        </button>
        <div style={{ height: 1, background: '#f3f4f6', margin: '4px 10px' }} />
        <button onClick={() => window.location.reload()} style={dropBtnStyle(true)}>
          <i className="bi bi-box-arrow-right" style={{ fontSize: 14, width: 16 }} /> Sair
        </button>
      </div>
    </div>
  );
}

function dropBtnStyle(danger: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '9px 16px',
    color: danger ? '#dc2626' : '#374151',
    fontSize: 13, cursor: 'pointer',
    background: 'none', border: 'none',
    textAlign: 'left', fontFamily: 'Open Sans, sans-serif',
  };
}

// ── PasswordField ─────────────────────────────────────────────────────────────
function PasswordField({ label, icon, value, onChange }: { label: string; icon: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <i className={`bi ${icon}`} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14, pointerEvents: 'none' }} />
        <input
          type="password" value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', height: 42, paddingLeft: 36, paddingRight: 14, border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif' }}
          onFocus={e => { e.target.style.borderColor = '#00963F'; e.target.style.boxShadow = '0 0 0 3px rgba(0,150,63,0.12)'; }}
          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
    </div>
  );
}

// ── MdbLogoMark ──────────────────────────────────────────────────────────────
function MdbLogoMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="34" height="34" rx="7" fill="url(#g1)" />
      <text x="3.5" y="23.5" fontSize="11" fontWeight="800" fill="#0f0e17" fontFamily="Open Sans, Arial, sans-serif" letterSpacing="-0.5">MDB</text>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5d000" />
          <stop offset="100%" stopColor="#d99600" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── WelcomeCard ───────────────────────────────────────────────────────────────
function WelcomeCard({ onNavigate }: { onNavigate: NavigateFn }) {
  const quickLinks = [
    { label: 'Mandatários', icon: 'bi-people-fill', page: 'mandatario' as Page, color: '#3b82f6' },
    { label: 'Filiados', icon: 'bi-diagram-3-fill', page: 'filiacao' as Page, color: '#8b5cf6' },
    { label: 'Órgãos', icon: 'bi-bank2', page: 'orgao' as Page, color: '#0ea5e9' },
    { label: 'Dirigentes', icon: 'bi-person-badge-fill', page: 'dirigente' as Page, color: '#10b981' },
    { label: 'BI', icon: 'bi-speedometer2', page: 'bi' as Page, color: '#f59e0b' },
    { label: 'Usuários', icon: 'bi-person-gear', page: 'usuario' as Page, color: '#ec4899' },
  ];

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>
      <div style={{
        background: 'linear-gradient(135deg, #003d1a 0%, #005229 50%, #00963F 100%)',
        borderRadius: 12, padding: '32px 32px 28px', marginBottom: 24,
        boxShadow: '0 4px 20px rgba(0,150,63,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.12)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
            <i className="bi bi-shield-fill-check" style={{ color: '#fff', fontSize: 28 }} />
          </div>
          <div>
            <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 20, margin: 0 }}>Gestão Partidária MDB</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: 0 }}>Painel administrativo interno do partido</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { icon: 'bi-people-fill', label: 'Filiados', value: '1.444' },
            { icon: 'bi-person-badge-fill', label: 'Mandatários', value: '10.085' },
            { icon: 'bi-bank2', label: 'Órgãos Partidários', value: '311' },
            { icon: 'bi-person-workspace', label: 'Dirigentes', value: '11.232' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '16px 14px' }}>
              <i className={`bi ${s.icon}`} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20, marginBottom: 8, display: 'block' }} />
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Acesso Rápido</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {quickLinks.map(l => (
            <button key={l.page} onClick={() => onNavigate(l.page)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 20,
              border: `1.5px solid ${l.color}20`, background: `${l.color}0d`,
              color: l.color, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              fontFamily: 'Open Sans, sans-serif',
            }}>
              <i className={`bi ${l.icon}`} style={{ fontSize: 14 }} /> {l.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <i className="bi bi-hand-wave-fill" style={{ color: '#f59e0b', fontSize: 22 }} />
          <h5 style={{ fontWeight: 700, color: '#1e1e2d', margin: 0, fontSize: 16 }}>Bem-vindo, Inacio Steffen!</h5>
        </div>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0, lineHeight: 1.7 }}>
          Utilize o menu lateral para navegar entre os módulos do sistema. Gerencie filiados, mandatários, órgãos partidários e muito mais.
        </p>
      </div>
    </div>
  );
}
