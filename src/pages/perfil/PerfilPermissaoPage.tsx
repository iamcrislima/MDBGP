import React, { useState } from 'react';
import type { NavigateFn } from '../../types';
import { MOCK_PERFIS } from '../../data/mockData';

interface Permission {
  modulo: string;
  icon: string;
  items: { label: string; visualizar: boolean; criar: boolean; editar: boolean; excluir: boolean }[];
}

const DEFAULT_PERMS: Permission[] = [
  { modulo: 'Mandatários', icon: 'bi-people-fill', items: [{ label: 'Consultar Mandatários', visualizar: true, criar: false, editar: false, excluir: false }] },
  { modulo: 'Filiação Partidária', icon: 'bi-diagram-3-fill', items: [{ label: 'Consultar Filiados', visualizar: true, criar: false, editar: false, excluir: false }] },
  { modulo: 'Órgãos Partidários', icon: 'bi-bank2', items: [{ label: 'Consultar Órgãos', visualizar: true, criar: false, editar: false, excluir: false }] },
  { modulo: 'Dirigentes', icon: 'bi-person-badge-fill', items: [{ label: 'Consultar Dirigentes', visualizar: true, criar: false, editar: false, excluir: false }] },
  { modulo: 'Business Intelligence', icon: 'bi-speedometer2', items: [{ label: 'Painel BI', visualizar: true, criar: false, editar: false, excluir: false }] },
  { modulo: 'Configurações — Perfis', icon: 'bi-person-gear', items: [{ label: 'Gerenciar Perfis', visualizar: true, criar: true, editar: true, excluir: false }, { label: 'Permissões', visualizar: true, criar: true, editar: true, excluir: false }] },
  { modulo: 'Configurações — Usuários', icon: 'bi-people-fill', items: [{ label: 'Gerenciar Usuários', visualizar: true, criar: true, editar: true, excluir: false }] },
  { modulo: 'Log de Acesso', icon: 'bi-clock-history', items: [{ label: 'Visualizar Log', visualizar: true, criar: false, editar: false, excluir: false }] },
];

export default function PerfilPermissaoPage({ onNavigate, selectedId }: { onNavigate: NavigateFn; selectedId?: number }) {
  const perfil = MOCK_PERFIS.find(p => p.id === selectedId) ?? MOCK_PERFIS[0];
  const [perms, setPerms] = useState<Permission[]>(DEFAULT_PERMS);
  const [saving, setSaving] = useState(false);

  const toggle = (mi: number, ii: number, key: keyof Omit<Permission['items'][0], 'label'>) => {
    setPerms(prev => prev.map((m, i) => i !== mi ? m : {
      ...m,
      items: m.items.map((item, j) => j !== ii ? item : { ...item, [key]: !item[key] }),
    }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); onNavigate('perfil'); }, 800);
  };

  const colKeys: Array<keyof Omit<Permission['items'][0], 'label'>> = ['visualizar', 'criar', 'editar', 'excluir'];
  const colLabels = ['Visualizar', 'Criar', 'Editar', 'Excluir'];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Permissões do Perfil</h1>
        <nav style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          <span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={() => onNavigate('home')}>Início</span>
          {' › '}<span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={() => onNavigate('perfil')}>Perfis</span>
          {' › '}Permissões — {perfil.nome}
        </nav>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '24px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f0f4fb' }}>
          <div style={{ width: 40, height: 40, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-shield-check" style={{ color: '#2563eb', fontSize: 20 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{perfil.nome}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Configure as permissões de acesso para este perfil</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#6b7280', borderBottom: '2px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Módulo / Funcionalidade</th>
              {colLabels.map(l => (
                <th key={l} style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, fontSize: 11, color: '#6b7280', borderBottom: '2px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.5px', width: 90 }}>{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perms.map((mod, mi) => (
              <React.Fragment key={mod.modulo}>
                {/* Module header row */}
                <tr style={{ background: '#f0f4fb' }}>
                  <td colSpan={5} style={{ padding: '8px 14px', fontWeight: 700, color: '#1e40af', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className={`bi ${mod.icon}`} style={{ fontSize: 13 }} />
                    {mod.modulo}
                  </td>
                </tr>
                {mod.items.map((item, ii) => (
                  <tr key={item.label} style={{ borderBottom: '1px solid #f3f4f6' }} onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')} onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                    <td style={{ padding: '10px 14px 10px 28px', color: '#374151' }}>{item.label}</td>
                    {colKeys.map(key => (
                      <td key={key} style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={item[key]}
                          onChange={() => toggle(mi, ii, key)}
                          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#2563eb' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={() => onNavigate('perfil')} style={{ padding: '10px 22px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'Open Sans, sans-serif' }}>Cancelar</button>
        <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'Open Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
          {saving ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Salvando…</> : <><i className="bi bi-check2-circle" /> Salvar Permissões</>}
        </button>
      </div>
    </div>
  );
}
