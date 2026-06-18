import React from 'react';
import type { NavigateFn } from '../../types';
import { MOCK_USUARIOS } from '../../data/mockData';

export default function UsuarioViewPage({ onNavigate, selectedId }: { onNavigate: NavigateFn; selectedId?: number }) {
  const usuario = MOCK_USUARIOS.find(u => u.id === selectedId) ?? MOCK_USUARIOS[0];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Visualizar usuário</h1>
        <nav style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          <span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={() => onNavigate('home')}>Início</span>
          {' › '}<span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={() => onNavigate('usuario')}>Usuários</span>
          {' › '}{usuario.nome}
        </nav>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f4fb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
              {usuario.nome.split(' ').slice(0, 2).map(n => n[0]).join('')}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>{usuario.nome}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{usuario.login}</div>
              <span style={{ background: usuario.situacao === 'Ativo' ? '#dcfce7' : '#fee2e2', color: usuario.situacao === 'Ativo' ? '#15803d' : '#dc2626', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600, display: 'inline-block', marginTop: 4 }}>{usuario.situacao}</span>
            </div>
          </div>
          <button onClick={() => onNavigate('usuario')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
            <i className="bi bi-pencil" /> Editar
          </button>
        </div>

        {[
          {
            title: 'Dados do usuário', icon: 'bi-person-fill',
            fields: [
              ['Nome', usuario.nome],
              ['Login', usuario.login],
              ['Situação', usuario.situacao],
              ['Cadastrado em', usuario.cadastradoEm],
              ['Última alteração', usuario.ultimaAlteracao || '—'],
              ['Último acesso', usuario.ultimoAcesso],
            ]
          },
          {
            title: 'Nível de acesso', icon: 'bi-shield-check',
            fields: [
              ['Tipo de acesso', usuario.tipoAcesso],
              ['UF', usuario.uf || '—'],
              ['Município', usuario.municipio || '—'],
            ]
          },
          {
            title: 'Perfis de acesso', icon: 'bi-person-gear',
            fields: [['Perfis', usuario.perfis.join(', ') || 'Nenhum']]
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #f0f4fb' }}>
              <div style={{ width: 28, height: 28, background: '#eff6ff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`bi ${section.icon}`} style={{ color: '#2563eb', fontSize: 13 }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{section.title}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 24px' }}>
              {section.fields.map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => onNavigate('usuario')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
          <i className="bi bi-arrow-left" /> Voltar
        </button>
      </div>
    </div>
  );
}
