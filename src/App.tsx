import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import type { Page, NavigateFn } from './types';
import LogoMDB from './components/LogoMDB';
import Button from './components/shared/Button';
import Avatar from './components/shared/Avatar';
import ModalBase from './components/shared/ModalBase';
import LoadingSpinner from './components/shared/LoadingSpinner';

// ── Pages (lazy loaded) ────────────────────────────────────────────────────────
const LoginPage              = lazy(() => import('./pages/LoginPage'));
const BIPage                 = lazy(() => import('./pages/BIPage'));
const MandatarioPage         = lazy(() => import('./pages/MandatarioPage'));
const FiliacaoPage           = lazy(() => import('./pages/FiliacaoPage'));
const OrgaoPage              = lazy(() => import('./pages/OrgaoPage'));
const DirigentePage          = lazy(() => import('./pages/DirigentePage'));
const LogAcessoPage          = lazy(() => import('./pages/LogAcessoPage'));
const PerfilListPage         = lazy(() => import('./pages/perfil/PerfilListPage'));
const UsuarioListPage        = lazy(() => import('./pages/usuario/UsuarioListPage'));
const BIDataPage             = lazy(() => import('./pages/BIDataPage'));
const GerenciarFiliadosPage  = lazy(() => import('./pages/GerenciarFiliadosPage'));
const VisaoGeralFiliacaoPage = lazy(() => import('./pages/VisaoGeralFiliacaoPage'));

// ── Constants ─────────────────────────────────────────────────────────────────
const SIDEBAR_OPEN_W   = 240;
const SIDEBAR_CLOSED_W = 64;
const SIDEBAR_TABLET_W = 56;
const TABLET_BP        = 1024;
const MOBILE_BP        = 768;

// ── Nav model ─────────────────────────────────────────────────────────────────
type SubItem = { label: string; page: Page };
type NavItem = { id: string; label: string; icon: string; page?: Page; children?: SubItem[] };

const NAV_ITEMS: NavItem[] = [
  { id: 'home',       label: 'Tela Inicial',       icon: 'bi-house-door-fill', page: 'home' },
  { id: 'mandatarios',label: 'Mandatários',         icon: 'bi-people-fill',
    children: [{ label: 'Consultar Mandatários', page: 'mandatario' }] },
  { id: 'filiacao',   label: 'Filiação Partidária', icon: 'bi-diagram-3-fill',
    children: [
      { label: 'Visão Geral',        page: 'visao-geral-filiacao' },
      { label: 'Consultar Filiados', page: 'filiacao' },
      { label: 'Gerenciar Filiados', page: 'gerenciar-filiados' },
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
  'gerenciar-filiados':     'filiacao',
  'visao-geral-filiacao':   'filiacao',
};

function PageSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <LoadingSpinner size="lg" color="primary" />
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [currentPage,  setCurrentPage]  = useState<Page>('home');
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [darkMode,     setDarkMode]     = useState(false);
  const [pwForm,       setPwForm]       = useState({ atual: '', nova: '', confirmar: '' });

  // ── Responsive state ────────────────────────────────────────────────────────
  const [windowW, setWindowW] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const isMobile  = windowW < MOBILE_BP;
  const isTablet  = windowW >= MOBILE_BP && windowW < TABLET_BP;
  const isDesktop = windowW >= TABLET_BP;
  const navbarH   = isDesktop ? 56 : 48;

  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= TABLET_BP : true
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let prevDesktop = window.innerWidth >= TABLET_BP;
    let raf = 0;
    const check = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = window.innerWidth;
        setWindowW(w);
        const nowDesktop = w >= TABLET_BP;
        if (prevDesktop !== nowDesktop) {
          setSidebarOpen(nowDesktop);
          prevDesktop = nowDesktop;
        }
      });
    };
    window.addEventListener('resize', check);
    return () => { window.removeEventListener('resize', check); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-dark', String(darkMode));
  }, [darkMode]);

  const navigate: NavigateFn = useCallback((page: Page, id?: number) => {
    setCurrentPage(page);
    const sidebarId = ACTIVE_MAP[page];
    const navItem = NAV_ITEMS.find(n => n.id === sidebarId);
    if (navItem?.children) setExpandedId(sidebarId);
    if (!isDesktop) setSidebarOpen(false);
    window.scrollTo({ top: 0 });
  }, [isDesktop]);

  const handleNavClick = (item: NavItem) => {
    if (item.children) {
      setExpandedId(p => (p === item.id ? null : item.id));
    } else if (item.page) {
      navigate(item.page);
    }
  };

  const sidebarW = isMobile
    ? (sidebarOpen ? SIDEBAR_OPEN_W : 0)
    : isTablet
      ? (sidebarOpen ? SIDEBAR_OPEN_W : SIDEBAR_TABLET_W)
      : (sidebarOpen ? SIDEBAR_OPEN_W : SIDEBAR_CLOSED_W);

  // Content left margin — tablet always 56px (sidebar overlaps when open)
  const contentML  = isMobile ? 0 : isTablet ? SIDEBAR_TABLET_W : sidebarW;
  const showOverlay = !isDesktop && sidebarOpen;
  const showLabels  = sidebarOpen;
  const activeId    = ACTIVE_MAP[currentPage] || 'home';

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <Suspense fallback={<div style={{ background: 'var(--color-bg-page)', minHeight: '100vh' }} />}>
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      </Suspense>
    );
  }

  // ── Page router ─────────────────────────────────────────────────────────────
  const pageContent = (() => {
    switch (currentPage) {
      case 'home':                 return <BIPage onNavigate={navigate} />;
      case 'bi':                   return <BIDataPage onNavigate={navigate} />;
      case 'mandatario':           return <MandatarioPage onNavigate={navigate} />;
      case 'filiacao':             return <FiliacaoPage onNavigate={navigate} />;
      case 'orgao':                return <OrgaoPage onNavigate={navigate} />;
      case 'dirigente':            return <DirigentePage onNavigate={navigate} />;
      case 'log-acesso':           return <LogAcessoPage onNavigate={navigate} />;
      case 'perfil':               return <PerfilListPage onNavigate={navigate} />;
      case 'usuario':              return <UsuarioListPage onNavigate={navigate} />;
      case 'gerenciar-filiados':   return <GerenciarFiliadosPage onNavigate={navigate} />;
      case 'visao-geral-filiacao': return <VisaoGeralFiliacaoPage onNavigate={navigate} />;
      default:                     return <WelcomeCard onNavigate={navigate} isMobile={isMobile} />;
    }
  })();

  return (
    <div style={{ fontFamily: 'Open Sans, sans-serif', minHeight: '100vh' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: navbarH,
        background: '#ffffff', borderBottom: '0.5px solid var(--color-border)',
        display: 'flex', alignItems: 'center', padding: isMobile ? '0 12px 0 12px' : '0 18px 0 20px',
        zIndex: 1040, gap: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10, flex: 1, minWidth: 0 }}>
          {/* Hamburger */}
          <Button
            variant="icon"
            title={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
            onClick={() => setSidebarOpen(v => !v)}
            icon="bi-list"
            style={{ fontSize: 18, width: 44, height: 44, minHeight: 44, flexShrink: 0 }}
          />

          <LogoMDB style={{ height: isMobile ? 22 : 28, flexShrink: 0 }} />

          {/* Title — desktop only */}
          {isDesktop && (
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>
              Gestão Partidária
            </span>
          )}
        </div>

        {/* Dark mode toggle */}
        <Button
          variant="icon"
          title={darkMode ? 'Modo claro' : 'Modo escuro'}
          onClick={() => setDarkMode(v => !v)}
          icon={`bi-${darkMode ? 'sun' : 'moon-stars'}`}
          style={{ fontSize: 17, width: 44, height: 44, minHeight: 44 }}
        />

        {/* User avatar */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(v => !v)}
            style={{
              background: showDropdown ? 'var(--color-bg-page)' : 'none',
              border: 'none', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: isDesktop ? 8 : 0,
              padding: isDesktop ? '5px 8px' : '5px',
              cursor: 'pointer', minHeight: 44,
            }}
            onMouseEnter={e => { if (!showDropdown) e.currentTarget.style.background = '#f9fafb'; }}
            onMouseLeave={e => { if (!showDropdown) e.currentTarget.style.background = 'none'; }}
          >
            <Avatar nome="Inácio Steffen" size={30} palette="gradient-green" />
            {isDesktop && (
              <>
                <span style={{ color: 'var(--color-text-dark)', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>Inácio Steffen</span>
                <i className="bi bi-chevron-down" style={{ color: 'var(--color-text-muted)', fontSize: 11 }} />
              </>
            )}
          </button>
          {showDropdown && (
            <UserDropdown onAlterarSenha={() => { setShowModal(true); setShowDropdown(false); }} />
          )}
        </div>
      </header>

      {/* ── SIDEBAR OVERLAY ────────────────────────────────────────────────── */}
      {showOverlay && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, top: navbarH,
            background: isMobile ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.25)',
            zIndex: 1028,
          }}
        />
      )}

      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside
        className={isTablet && !sidebarOpen ? 'sidebar-tablet-hover' : undefined}
        style={{
          position: 'fixed', top: navbarH, left: 0,
          width: sidebarW, height: `calc(100vh - ${navbarH}px)`,
          background: '#f8f9fa', borderRight: '0.5px solid var(--color-border)',
          overflowY: 'auto', overflowX: 'hidden',
          transition: 'width 0.22s ease', zIndex: 1029,
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* MENU label */}
        {showLabels && (
          <div className="sidebar-menu-header" style={{ padding: '14px 20px 6px', fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
            MENU
          </div>
        )}

        <nav style={{ flex: 1, paddingBottom: 8, paddingTop: showLabels ? 0 : 8 }}>
          {NAV_ITEMS.map(item => {
            const isActive   = activeId === item.id;
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id}>
                <button
                  title={!showLabels ? item.label : undefined}
                  onClick={() => handleNavClick(item)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    width: '100%', border: 'none',
                    background: isActive ? '#f0fdf4' : 'none',
                    borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                    padding: showLabels ? '10px 16px 10px 17px' : '11px 0',
                    justifyContent: showLabels ? 'flex-start' : 'center',
                    cursor: 'pointer', gap: 11, minHeight: 44,
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-dark)',
                    transition: 'background 0.15s, color 0.15s',
                    fontFamily: 'Open Sans, sans-serif',
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) { e.currentTarget.style.background = 'var(--color-bg-page)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--color-text-dark)'; }
                  }}
                >
                  <i className={`bi ${item.icon}`} style={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: 'center', color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)' }} />
                  {showLabels && (
                    <>
                      <span className="sidebar-label" style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                      {item.children && (
                        <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} sidebar-chevron`} style={{ fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0 }} />
                      )}
                    </>
                  )}
                </button>

                {item.children && isExpanded && showLabels && (
                  <div style={{ background: '#f1f3f5' }}>
                    {item.children.map(sub => {
                      const subActive = currentPage === sub.page;
                      return (
                        <button
                          key={sub.page}
                          onClick={() => navigate(sub.page)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            width: '100%', padding: '8px 16px 8px 48px', minHeight: 44,
                            background: subActive ? '#dcfce7' : 'none',
                            border: 'none', borderLeft: 'none',
                            color: subActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            textDecoration: 'none', fontSize: 12, cursor: 'pointer',
                            fontFamily: 'Open Sans, sans-serif', textAlign: 'left',
                            fontWeight: subActive ? 600 : 400,
                          }}
                          onMouseEnter={e => { if (!subActive) { e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.background = '#e9ecef'; } }}
                          onMouseLeave={e => { if (!subActive) { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'none'; } }}
                        >
                          <i className="bi bi-chevron-right" style={{ fontSize: 9, color: 'var(--color-text-muted)' }} />
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

        {showLabels && (
          <div style={{ padding: '11px 18px', borderTop: '0.5px solid var(--color-border)', background: '#f8f9fa' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>v1.0.0</span>
          </div>
        )}
      </aside>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      <div style={{
        marginLeft: contentML, marginTop: navbarH,
        minHeight: `calc(100vh - ${navbarH}px)`,
        transition: 'margin-left 0.22s ease',
        display: 'flex', flexDirection: 'column',
      }}>
        <main style={{ flex: 1, background: 'var(--color-bg-page)' }}>
          <Suspense fallback={<PageSpinner />}>
            {pageContent}
          </Suspense>
        </main>

        <footer style={{
          background: '#ffffff', borderTop: '0.5px solid var(--color-border)',
          padding: '12px 24px', textAlign: 'center',
          color: 'var(--color-text-muted)', fontSize: 12,
        }}>
          2026 © MDB
        </footer>
      </div>

      {/* ── MODAL ALTERAR SENHA ─────────────────────────────────────────────── */}
      <ModalBase open={showModal} onClose={() => setShowModal(false)} width={440} mobileBottomSheet={isMobile} backdropOpacity={0.65} backdropBlur={4}>
        <ModalBase.LightHeader onClose={() => setShowModal(false)}>
          <div style={{ width: 34, height: 34, background: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-shield-lock-fill" style={{ color: 'var(--color-primary)', fontSize: 17 }} />
          </div>
          <h5 style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-primary)', fontSize: 15 }}>Alterar Senha</h5>
        </ModalBase.LightHeader>
        <ModalBase.Body padding="24px 22px 8px">
          {(['Senha Atual|bi-lock-fill|atual', 'Nova Senha|bi-key-fill|nova', 'Confirmar Nova Senha|bi-shield-check|confirmar'] as const).map((s) => {
            const [label, icon, field] = s.split('|') as [string, string, 'atual' | 'nova' | 'confirmar'];
            return <PasswordField key={field} label={label} icon={icon} value={pwForm[field]} onChange={v => setPwForm(p => ({ ...p, [field]: v }))} />;
          })}
        </ModalBase.Body>
        <ModalBase.Footer style={{ padding: '16px 22px', gap: 10 }}>
          <Button
            variant="ghost"
            onClick={() => { setShowModal(false); setPwForm({ atual: '', nova: '', confirmar: '' }); }}
            style={{ minHeight: 44 }}
          >Cancelar</Button>
          <Button
            variant="primary"
            onClick={() => { setShowModal(false); setPwForm({ atual: '', nova: '', confirmar: '' }); }}
            icon="bi-check2-circle"
            style={{ minHeight: 44 }}
          >Salvar</Button>
        </ModalBase.Footer>
      </ModalBase>
    </div>
  );
}

// ── UserDropdown ──────────────────────────────────────────────────────────────
function UserDropdown({ onAlterarSenha }: { onAlterarSenha: () => void }) {
  return (
    <div style={{
      position: 'absolute', right: 0, top: 44,
      background: '#ffffff', border: '1px solid var(--color-border)',
      borderRadius: 10, width: 214,
      boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 1050, overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--color-bg-page)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar nome="Inácio Steffen" size={36} palette="gradient-green" />
          <div>
            <div style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 13 }}>Inacio Steffen</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>Administrador</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '6px 0' }}>
        <button onClick={onAlterarSenha} style={dropBtnStyle(false)}>
          <i className="bi bi-key-fill" style={{ fontSize: 14, width: 16 }} /> Alterar Senha
        </button>
        <div style={{ height: 1, background: 'var(--color-bg-page)', margin: '4px 10px' }} />
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
    width: '100%', padding: '9px 16px', minHeight: 44,
    color: danger ? 'var(--color-error)' : 'var(--color-text-dark)',
    fontSize: 13, cursor: 'pointer',
    background: 'none', border: 'none',
    textAlign: 'left', fontFamily: 'Open Sans, sans-serif',
  };
}

// ── PasswordField ─────────────────────────────────────────────────────────────
function PasswordField({ label, icon, value, onChange }: { label: string; icon: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <i className={`bi ${icon}`} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 14, pointerEvents: 'none' }} />
        <input
          type="password" value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', height: 44, paddingLeft: 36, paddingRight: 14, border: '1.5px solid var(--color-border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif' }}
          onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,150,63,0.12)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
    </div>
  );
}

// ── WelcomeCard ───────────────────────────────────────────────────────────────
function WelcomeCard({ onNavigate, isMobile }: { onNavigate: NavigateFn; isMobile: boolean }) {
  const quickLinks = [
    { label: 'Mandatários', icon: 'bi-people-fill',       page: 'mandatario' as Page, color: '#3b82f6' },
    { label: 'Filiados',    icon: 'bi-diagram-3-fill',    page: 'filiacao'   as Page, color: '#8b5cf6' },
    { label: 'Órgãos',      icon: 'bi-bank2',             page: 'orgao'      as Page, color: '#0ea5e9' },
    { label: 'Dirigentes',  icon: 'bi-person-badge-fill', page: 'dirigente'  as Page, color: '#10b981' },
    { label: 'BI',          icon: 'bi-speedometer2',      page: 'bi'         as Page, color: '#f59e0b' },
    { label: 'Usuários',    icon: 'bi-person-gear',       page: 'usuario'    as Page, color: '#ec4899' },
  ];

  const pad = isMobile ? '16px' : '28px';

  return (
    <div style={{ padding: pad, maxWidth: 1100 }}>
      <div style={{
        background: 'linear-gradient(135deg, #003d1a 0%, #005229 50%, var(--color-primary) 100%)',
        borderRadius: 12, padding: isMobile ? '22px 18px 18px' : '32px 32px 28px', marginBottom: 18,
        boxShadow: '0 4px 20px rgba(0,150,63,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{ width: isMobile ? 44 : 56, height: isMobile ? 44 : 56, background: 'rgba(255,255,255,0.12)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
            <i className="bi bi-shield-fill-check" style={{ color: '#fff', fontSize: isMobile ? 22 : 28 }} />
          </div>
          <div>
            <h1 style={{ color: '#fff', fontWeight: 700, fontSize: isMobile ? 16 : 20, margin: 0 }}>Gestão Partidária MDB</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: isMobile ? 12 : 13, margin: 0 }}>Painel administrativo interno do partido</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(140px, 1fr))', gap: isMobile ? 10 : 12 }}>
          {[
            { icon: 'bi-people-fill',        label: 'Filiados',     value: '1.444' },
            { icon: 'bi-person-badge-fill',  label: 'Mandatários',  value: '10.085' },
            { icon: 'bi-bank2',              label: 'Órgãos',       value: '311' },
            { icon: 'bi-person-workspace',   label: 'Dirigentes',   value: '11.232' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: isMobile ? '12px 10px' : '16px 14px' }}>
              <i className={`bi ${s.icon}`} style={{ color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? 16 : 20, marginBottom: 6, display: 'block' }} />
              <div style={{ color: '#fff', fontWeight: 700, fontSize: isMobile ? 18 : 22, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: isMobile ? 10 : 11, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid var(--color-border)', padding: isMobile ? '14px 16px' : '20px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Acesso Rápido</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {quickLinks.map(l => (
            <button key={l.page} onClick={() => onNavigate(l.page)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 20, minHeight: 44,
              border: `1.5px solid ${l.color}20`, background: `${l.color}0d`,
              color: l.color, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              fontFamily: 'Open Sans, sans-serif',
            }}>
              <i className={`bi ${l.icon}`} style={{ fontSize: 14 }} /> {l.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid var(--color-border)', padding: isMobile ? '14px 16px' : '20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <i className="bi bi-hand-wave-fill" style={{ color: '#f59e0b', fontSize: isMobile ? 18 : 22 }} />
          <h5 style={{ fontWeight: 700, color: '#1e1e2d', margin: 0, fontSize: isMobile ? 14 : 16 }}>Bem-vindo, Inacio Steffen!</h5>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: isMobile ? 13 : 14, margin: 0, lineHeight: 1.7 }}>
          Utilize o menu lateral para navegar entre os módulos do sistema. Gerencie filiados, mandatários, órgãos partidários e muito mais.
        </p>
      </div>
    </div>
  );
}
