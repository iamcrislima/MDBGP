import React, { useState } from 'react';
import type { Mandatario, CargoPoliticoHistorico, CargoPartidarioHistorico } from '../../types';

export function ev(v: string | number | undefined | null): string {
  if (v === null || v === undefined || v === '') return '—';
  const s = String(v).trim();
  return ['nao informada', 'nao informado', 'n/a', '---', 'undefined', 'null'].includes(s.toLowerCase()) ? '—' : s;
}

export function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f0f4fb' }}>
      <div style={{ width: 28, height: 28, background: '#E8F5E9', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={`bi ${icon}`} style={{ color: '#00963F', fontSize: 13 }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{title}</span>
    </div>
  );
}

export function FieldGrid({ fields }: { fields: [string, string | React.ReactNode][] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 24px' }}>
      {fields.map(([label, value]) => (
        <div key={label}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 13, color: value === '—' ? '#d1d5db' : '#374151', fontWeight: 500 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function SituacaoPoliticaBadge({ value }: { value: string }) {
  const isEleito = value.toLowerCase().startsWith('eleito');
  return (
    <span style={{ background: isEleito ? '#E8F5E9' : '#f3f4f6', color: isEleito ? '#007A32' : '#6b7280', borderRadius: 100, padding: '2px 8px', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>
      {value}
    </span>
  );
}

function CargoPoliticoTable({ rows }: { rows: CargoPoliticoHistorico[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 1fr 100px 60px 48px 1fr', gap: 10, alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f0f0f0', fontSize: 13 }}>
          <div><span style={{ fontWeight: 600, color: '#374151' }}>{r.cargo}</span></div>
          <div style={{ color: '#6b7280' }}>{r.anoEleicao}</div>
          <div><SituacaoPoliticaBadge value={r.situacao} /></div>
          <div style={{ fontFamily: 'ui-monospace, monospace', color: '#374151', textAlign: 'right' }}>{r.totalVotos.toLocaleString('pt-BR')}</div>
          <div>
            <span style={{ background: r.eleito === 'Sim' ? '#dcfce7' : '#f3f4f6', color: r.eleito === 'Sim' ? '#15803d' : '#6b7280', borderRadius: 100, padding: '2px 8px', fontWeight: 600, fontSize: 11 }}>{r.eleito}</span>
          </div>
          <div style={{ color: '#00963F', fontWeight: 600 }}>{r.uf}</div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>{r.municipio}</div>
        </div>
      ))}
    </div>
  );
}

function CargoPartidarioTable({ rows }: { rows: CargoPartidarioHistorico[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 180px 90px 1fr', gap: 10, alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f0f0f0', fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: '#374151' }}>{r.cargo}</div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>{r.dataInicio} – {r.dataFim}</div>
          <div>
            <span style={{ background: '#E8F5E9', color: '#007A32', borderRadius: 100, padding: '2px 8px', fontWeight: 600, fontSize: 11 }}>{r.abrangencia}</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>{r.municipio}/{r.uf}</div>
        </div>
      ))}
    </div>
  );
}

export default function PessoaDetalheModal({ item, onClose }: { item: Mandatario; onClose: () => void }) {
  const [showPhoto, setShowPhoto] = useState(false);

  const initials = item.nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');

  const cargosPolíticos: CargoPoliticoHistorico[] = item.historicoCargos ?? [
    { cargo: item.cargo, anoEleicao: item.anoEleicao, situacao: item.situacao, totalVotos: item.totalVotos, eleito: item.eleito, uf: item.uf, municipio: item.municipio },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 1060 }} />

      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: 12, width: 820, maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh', overflow: 'hidden', zIndex: 1070, boxShadow: '0 24px 64px rgba(0,0,0,0.28)', display: 'flex', flexDirection: 'column' }}>

        {/* Header fixo */}
        <div style={{ background: '#12121f', padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              onClick={() => setShowPhoto(true)}
              title="Clique para ampliar"
              style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', position: 'relative' }}
            >
              {item.foto ? (
                <img src={item.foto} alt={item.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #00963F, #4CAF50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                  {initials}
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}>
                <i className="bi bi-zoom-in" style={{ color: 'rgba(255,255,255,0)', fontSize: 14 }} />
              </div>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{item.nome}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>{item.nomeUrna} · {item.cargo} · {item.municipio}/{item.uf}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 24, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {/* Corpo com scroll */}
        <div style={{ overflowY: 'auto', padding: '22px 24px 28px', flex: 1 }}>

          <div style={{ marginBottom: 22 }}>
            <SectionHeader icon="bi-person-fill" title="Identificação" />
            <FieldGrid fields={[
              ['Nome completo',      ev(item.nome)],
              ['Nome de urna',       ev(item.nomeUrna)],
              ['CPF',                ev(item.cpf)],
              ['Título de eleitor',  ev(item.tituloEleitor)],
              ['Zona de votação',    ev(item.zonaVotacao)],
              ['Ano pré-candidatura', item.anoPrecandidatura ? String(item.anoPrecandidatura) : '—'],
            ]} />
          </div>

          <div style={{ marginBottom: 22 }}>
            <SectionHeader icon="bi-card-list" title="Dados pessoais" />
            <FieldGrid fields={[
              ['Data de nascimento', ev(item.dataNascimento)],
              ['Idade',              item.idade ? `${item.idade} anos` : '—'],
              ['Sexo',               ev(item.sexo)],
              ['Raça/Cor',           ev(item.raca)],
              ['Escolaridade',       ev(item.escolaridade)],
              ['Profissão',          ev(item.profissao)],
              ['Nacionalidade',      ev(item.nacionalidade)],
              ['Naturalidade',       ev(item.naturalidade)],
            ]} />
          </div>

          <div style={{ marginBottom: 22 }}>
            <SectionHeader icon="bi-diagram-3-fill" title="Filiação partidária" />
            <FieldGrid fields={[
              ['Data de filiação',    ev(item.dataFiliacao)],
              ['Data de desfiliação', ev(item.dataDesfiliacao)],
              ['Situação',            ev(item.situacaoFiliacao) === '—' ? 'Regular' : ev(item.situacaoFiliacao)],
            ]} />
          </div>

          <div style={{ marginBottom: 22 }}>
            <SectionHeader icon="bi-geo-alt-fill" title="Endereço declarado na filiação" />
            <FieldGrid fields={[
              ['UF',        ev(item.uf)],
              ['Município', ev(item.municipio)],
              ['Endereço',  ev(item.endereco)],
              ['Número',    ev(item.numero)],
              ['Bairro',    ev(item.bairro)],
              ['CEP',       ev(item.cep)],
            ]} />
          </div>

          <div style={{ marginBottom: 22 }}>
            <SectionHeader icon="bi-telephone-fill" title="Contato" />
            <FieldGrid fields={[
              ['E-mail',        ev(item.email)],
              ['Celular',       ev(item.celular)],
              ['Telefone fixo', ev(item.telefone)],
            ]} />
          </div>

          <div style={{ marginBottom: 22 }}>
            <SectionHeader icon="bi-award-fill" title="Histórico de cargos políticos" />
            <div style={{ marginBottom: 8, display: 'grid', gridTemplateColumns: '1fr 64px 1fr 100px 60px 48px 1fr', gap: 10, padding: '0 14px' }}>
              {['Cargo','Ano','Situação','Total votos','Eleito?','UF','Município'].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
              ))}
            </div>
            <CargoPoliticoTable rows={cargosPolíticos} />
          </div>

          {item.historicoOrgaos && item.historicoOrgaos.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <SectionHeader icon="bi-building" title="Histórico de cargos partidários" />
              <div style={{ marginBottom: 8, display: 'grid', gridTemplateColumns: '1fr 180px 90px 1fr', gap: 10, padding: '0 14px' }}>
                {['Cargo','Período','Abrangência','Local'].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
                ))}
              </div>
              <CargoPartidarioTable rows={item.historicoOrgaos} />
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {showPhoto && (
        <>
          <div onClick={() => setShowPhoto(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1090 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1091, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            {item.foto ? (
              <img src={item.foto} alt={item.nome} style={{ maxWidth: 400, maxHeight: 400, borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }} />
            ) : (
              <div style={{ width: 200, height: 200, background: 'linear-gradient(135deg, #00963F, #4CAF50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 64, boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
                {initials}
              </div>
            )}
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{item.nome}</div>
            <button onClick={() => setShowPhoto(false)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', padding: '6px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
              Fechar
            </button>
          </div>
        </>
      )}
    </>
  );
}
