import React from 'react';
import type { NavigateFn } from '../../types';
import Button from '../../components/shared/Button';
import { MOCK_PERFIS } from '../../data/mockData';
import SectionHeader from '../../components/shared/SectionHeader';

const MODULES = [
  { label: 'Mandatários',            icon: 'bi-award-fill',      read: true,  write: true  },
  { label: 'Filiação',               icon: 'bi-diagram-3-fill',  read: true,  write: true  },
  { label: 'Órgãos Partidários',     icon: 'bi-bank2',           read: true,  write: false },
  { label: 'Dirigentes',             icon: 'bi-person-badge-fill', read: true, write: false },
  { label: 'BI',                     icon: 'bi-speedometer2',    read: true,  write: false },
  { label: 'Configurações — Perfis', icon: 'bi-person-gear',     read: true,  write: true  },
  { label: 'Configurações — Usuários', icon: 'bi-people-fill',   read: true,  write: true  },
  { label: 'Log de Acesso',          icon: 'bi-clock-history',   read: true,  write: false },
];

export default function PerfilViewPage({ onNavigate, selectedId }: { onNavigate: NavigateFn; selectedId?: number }) {
  const perfil = MOCK_PERFIS.find(p => p.id === selectedId) ?? MOCK_PERFIS[0];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Visualizar perfil</h1>
        <nav style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
          <span style={{ cursor: 'pointer', color: 'var(--color-info)' }} onClick={() => onNavigate('home')}>Início</span>
          {' › '}<span style={{ cursor: 'pointer', color: 'var(--color-info)' }} onClick={() => onNavigate('perfil')}>Perfis</span>
          {' › '}{perfil.nome}
        </nav>
      </div>

      {/* Card principal */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, padding: '28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid var(--color-bg-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-person-gear" style={{ color: 'var(--color-info)', fontSize: 22 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)' }}>{perfil.nome}</div>
              <span style={{ background: perfil.situacao === 'Ativo' ? '#dcfce7' : '#fee2e2', color: perfil.situacao === 'Ativo' ? 'var(--color-success)' : 'var(--color-error)', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{perfil.situacao}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onNavigate('perfil')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid var(--color-info)', borderRadius: 7, background: '#fff', color: 'var(--color-info)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
              <i className="bi bi-shield-check" /> Permissões
            </button>
            <Button variant="primary" onClick={() => onNavigate('perfil')} icon="bi-pencil">Editar</Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px 28px' }}>
          {[
            ['Nome do perfil', perfil.nome],
            ['Identificador 1Doc', perfil.identificador1doc || '—'],
            ['Situação', perfil.situacao],
            ['Cadastrado em', perfil.cadastradoEm],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 14, color: 'var(--color-text-dark)', fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissões associadas */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, padding: '22px 28px', marginBottom: 16 }}>
        <SectionHeader icon="bi-shield-check" title="Permissões associadas" action={<span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>(somente leitura)</span>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {MODULES.map(m => (
            <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--color-bg-input)', borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className={`bi ${m.icon}`} style={{ color: 'var(--color-info)', fontSize: 14 }} />
                <span style={{ fontSize: 13, color: 'var(--color-text-dark)', fontWeight: 500 }}>{m.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                <span style={{ background: m.read ? '#dbeafe' : 'var(--color-bg-page)', color: m.read ? '#1d4ed8' : 'var(--color-text-muted)', borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>Leitura</span>
                <span style={{ background: m.write ? '#dcfce7' : 'var(--color-bg-page)', color: m.write ? 'var(--color-success)' : 'var(--color-text-muted)', borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>Escrita</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => onNavigate('perfil')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid var(--color-border-input)', borderRadius: 8, background: '#fff', fontSize: 13, color: 'var(--color-text-dark)', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
        <i className="bi bi-arrow-left" /> Voltar
      </button>
    </div>
  );
}
