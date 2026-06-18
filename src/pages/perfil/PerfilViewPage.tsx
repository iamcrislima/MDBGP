import React from 'react';
import type { NavigateFn } from '../../types';
import { MOCK_PERFIS } from '../../data/mockData';

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
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Visualizar perfil</h1>
        <nav style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          <span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={() => onNavigate('home')}>Início</span>
          {' › '}<span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={() => onNavigate('perfil')}>Perfis</span>
          {' › '}{perfil.nome}
        </nav>
      </div>

      {/* Card principal */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid #f0f4fb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-person-gear" style={{ color: '#2563eb', fontSize: 22 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{perfil.nome}</div>
              <span style={{ background: perfil.situacao === 'Ativo' ? '#dcfce7' : '#fee2e2', color: perfil.situacao === 'Ativo' ? '#15803d' : '#dc2626', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{perfil.situacao}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onNavigate('perfil')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #2563eb', borderRadius: 7, background: '#fff', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
              <i className="bi bi-shield-check" /> Permissões
            </button>
            <button onClick={() => onNavigate('perfil')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 'none', borderRadius: 7, background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
              <i className="bi bi-pencil" /> Editar
            </button>
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
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissões associadas */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '22px 28px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 12, borderBottom: '2px solid #f0f4fb' }}>
          <div style={{ width: 30, height: 30, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-shield-check" style={{ color: '#2563eb', fontSize: 14 }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Permissões associadas</span>
          <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>(somente leitura)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {MODULES.map(m => (
            <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className={`bi ${m.icon}`} style={{ color: '#2563eb', fontSize: 14 }} />
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{m.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                <span style={{ background: m.read ? '#dbeafe' : '#f3f4f6', color: m.read ? '#1d4ed8' : '#9ca3af', borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>Leitura</span>
                <span style={{ background: m.write ? '#dcfce7' : '#f3f4f6', color: m.write ? '#15803d' : '#9ca3af', borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>Escrita</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => onNavigate('perfil')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
        <i className="bi bi-arrow-left" /> Voltar
      </button>
    </div>
  );
}
