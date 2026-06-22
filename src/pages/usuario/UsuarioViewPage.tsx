import React from 'react';
import type { NavigateFn } from '../../types';
import Button from '../../components/shared/Button';
import { MOCK_USUARIOS } from '../../data/mockData';
import Avatar from '../../components/shared/Avatar';
import SectionHeader from '../../components/shared/SectionHeader';

export default function UsuarioViewPage({ onNavigate, selectedId }: { onNavigate: NavigateFn; selectedId?: number }) {
  const usuario = MOCK_USUARIOS.find(u => u.id === selectedId) ?? MOCK_USUARIOS[0];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Visualizar usuário</h1>
        <nav style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
          <span style={{ cursor: 'pointer', color: 'var(--color-info)' }} onClick={() => onNavigate('home')}>Início</span>
          {' › '}<span style={{ cursor: 'pointer', color: 'var(--color-info)' }} onClick={() => onNavigate('usuario')}>Usuários</span>
          {' › '}{usuario.nome}
        </nav>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-bg-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar nome={usuario.nome} size={52} palette="gradient-blue" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--color-text-primary)' }}>{usuario.nome}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{usuario.login}</div>
              <span style={{ background: usuario.situacao === 'Ativo' ? '#dcfce7' : '#fee2e2', color: usuario.situacao === 'Ativo' ? 'var(--color-success)' : 'var(--color-error)', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600, display: 'inline-block', marginTop: 4 }}>{usuario.situacao}</span>
            </div>
          </div>
          <Button variant="primary" onClick={() => onNavigate('usuario')} icon="bi-pencil">Editar</Button>
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
            <SectionHeader icon={section.icon} title={section.title} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 24px' }}>
              {section.fields.map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-dark)', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => onNavigate('usuario')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid var(--color-border-input)', borderRadius: 8, background: '#fff', fontSize: 13, color: 'var(--color-text-dark)', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
          <i className="bi bi-arrow-left" /> Voltar
        </button>
      </div>
    </div>
  );
}
