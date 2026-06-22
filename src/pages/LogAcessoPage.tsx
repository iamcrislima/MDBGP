import React, { useState, useMemo } from 'react';
import type { NavigateFn, LogAcesso } from '../types';
import DataTable, { Column } from '../components/shared/DataTable';
import KPICard from '../components/shared/KPICard';
import Avatar from '../components/shared/Avatar';
import { MOCK_LOG_ACESSO } from '../data/mockData';

export default function LogAcessoPage({ onNavigate: _onNavigate }: { onNavigate: NavigateFn }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    MOCK_LOG_ACESSO.filter(l =>
      !search || l.usuario.toLowerCase().includes(search.toLowerCase()) || l.ip.includes(search)
    ), [search]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<LogAcesso>[] = [
    {
      key: 'usuario', label: 'Usuário', render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar nome={r.usuario} size={28} palette="gradient-blue" />
          <span>{r.usuario}</span>
        </div>
      )
    },
    { key: 'dataHoraAcesso', label: 'Data e hora do acesso', width: 180 },
    { key: 'ip', label: 'IP', width: 140 },
    { key: 'browser', label: 'Browser / S.O.' },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Log de Acesso</h1>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginTop: 2 }}>Histórico de acessos ao sistema</div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid var(--color-border-input)', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-dark)', fontFamily: 'Open Sans, sans-serif' }}>
          <i className="bi bi-download" style={{ color: 'var(--color-info)' }} /> Exportar
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <KPICard title="Total de acessos" value={MOCK_LOG_ACESSO.length.toLocaleString('pt-BR')} icon="bi-door-open-fill" borderColor="var(--color-info)" />
        <KPICard title="Usuários únicos" value="5" icon="bi-people-fill" borderColor="#8b5cf6" />
        <KPICard title="Acessos hoje" value="42" icon="bi-calendar-check-fill" borderColor="#10b981" />
        <KPICard title="Últimas 24h" value="87" icon="bi-clock-history" borderColor="#f59e0b" />
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 14, pointerEvents: 'none' }} />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por usuário ou IP..."
              style={{ width: '100%', height: 38, paddingLeft: 36, paddingRight: 12, border: '1px solid var(--color-border-input)', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'Open Sans, sans-serif' }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-info)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border-input)')}
            />
          </div>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-info)' }}>{filtered.length.toLocaleString('pt-BR')}</strong> registros
          </span>
        </div>

        <DataTable
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          data={pageData as unknown as Record<string, unknown>[]}
          totalRecords={filtered.length}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={s => { setPageSize(s); setPage(1); }}
          emptyMessage="Nenhum acesso encontrado para o filtro informado."
        />
      </div>
    </div>
  );
}
