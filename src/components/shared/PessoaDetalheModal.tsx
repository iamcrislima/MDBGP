import React, { useState } from 'react';
import type { Mandatario, CargoPoliticoHistorico, CargoPartidarioHistorico } from '../../types';
import Badge from './Badge';
import ModalBase from './ModalBase';
import Avatar from './Avatar';
import SectionHeader from './SectionHeader';

export function ev(v: string | number | undefined | null): string {
  if (v === null || v === undefined || v === '') return '—';
  const s = String(v).trim();
  return ['nao informada', 'nao informado', 'n/a', '---', 'undefined', 'null'].includes(s.toLowerCase()) ? '—' : s;
}

export { SectionHeader };

export function FieldGrid({ fields }: { fields: [string, string | React.ReactNode][] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 24px' }}>
      {fields.map(([label, value]) => (
        <div key={label}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 13, color: value === '—' ? 'var(--color-border-input)' : 'var(--color-text-dark)', fontWeight: 500 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function CollapsibleSection({ icon, title, defaultOpen = false, children }: { icon: string; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 8, border: '1px solid var(--color-bg-subtle)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: open ? 'var(--color-bg-input)' : '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', borderBottom: open ? '1px solid var(--color-bg-subtle)' : 'none' }}
      >
        <div style={{ width: 28, height: 28, background: 'var(--color-primary-light)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`bi ${icon}`} style={{ color: 'var(--color-primary)', fontSize: 13 }} />
        </div>
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 13, color: 'var(--color-text-strong)' }}>{title}</span>
        <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
      </button>
      {open && (
        <div style={{ padding: '14px 16px 16px' }}>
          {children}
        </div>
      )}
    </div>
  );
}


function CargoPoliticoTimeline({ rows }: { rows: CargoPoliticoHistorico[] }) {
  if (rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--color-text-muted)', fontSize: 13 }}>
        <i className="bi bi-clock-history" style={{ fontSize: 28, color: 'var(--color-border-input)', display: 'block', marginBottom: 8 }} />
        Nenhum cargo político registrado.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: 22 }}>
      <div style={{ position: 'absolute', left: 7, top: 10, bottom: 10, width: 1, background: 'var(--color-border)' }} />
      {rows.map((r, i) => {
        const eleito = r.eleito === 'Sim';
        return (
          <div key={i} style={{ position: 'relative', marginBottom: i < rows.length - 1 ? 14 : 0 }}>
            <div style={{ position: 'absolute', left: -16, top: 8, width: 9, height: 9, borderRadius: '50%', background: eleito ? 'var(--color-primary)' : 'var(--color-border-input)', border: '2px solid #fff', boxShadow: `0 0 0 1.5px ${eleito ? 'var(--color-primary)' : 'var(--color-border-input)'}` }} />
            <div style={{ background: 'var(--color-bg-input)', border: '1px solid #edf2f7', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-strong)', marginBottom: 2 }}>{r.cargo}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{r.municipio}/{r.uf}</div>
                </div>
                <Badge variant={eleito ? 'success' : 'neutral'} label={eleito ? 'Eleito' : 'Não eleito'} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}><span style={{ color: 'var(--color-text-muted)', fontWeight: 600, marginRight: 4 }}>Ano</span>{r.anoEleicao}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}><span style={{ color: 'var(--color-text-muted)', fontWeight: 600, marginRight: 4 }}>Votos</span>{r.totalVotos.toLocaleString('pt-BR')}</span>
                <Badge variant={r.situacao.toLowerCase().startsWith('eleito') ? 'success' : 'neutral'} label={r.situacao} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CargoPartidarioTable({ rows }: { rows: CargoPartidarioHistorico[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 180px 90px 1fr', gap: 10, alignItems: 'center', padding: '10px 14px', background: 'var(--color-bg-input)', borderRadius: 8, border: '1px solid #f0f0f0', fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{r.cargo}</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{r.dataInicio} – {r.dataFim}</div>
          <div>
            <Badge variant="success" label={r.abrangencia} />
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{r.municipio}/{r.uf}</div>
        </div>
      ))}
    </div>
  );
}

export default function PessoaDetalheModal({ item, onClose }: { item: Mandatario; onClose: () => void }) {
  const [showPhoto, setShowPhoto] = useState(false);

  const cargosPolíticos: CargoPoliticoHistorico[] = item.historicoCargos ?? [
    { cargo: item.cargo, anoEleicao: item.anoEleicao, situacao: item.situacao, totalVotos: item.totalVotos, eleito: item.eleito, uf: item.uf, municipio: item.municipio },
  ];

  // Escape closes photo lightbox first, then modal
  const handleClose = () => { if (showPhoto) { setShowPhoto(false); } else { onClose(); } };

  return (
    <>
      <ModalBase open={true} onClose={handleClose} width={820}>

        <ModalBase.NavyHeader onClose={handleClose}>
          <div
            onClick={() => setShowPhoto(true)}
            title="Clique para ampliar"
            style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', position: 'relative' }}
          >
            <Avatar nome={item.nome} size={44} src={item.foto} palette="gradient-green" />
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
        </ModalBase.NavyHeader>

        <ModalBase.Body padding="20px 20px 28px">

          <CollapsibleSection icon="bi-person-fill" title="Identificação" defaultOpen={true}>
            <FieldGrid fields={[
              ['Nome completo',       ev(item.nome)],
              ['Nome de urna',        ev(item.nomeUrna)],
              ['CPF',                 ev(item.cpf)],
              ['Título de eleitor',   ev(item.tituloEleitor)],
              ['Zona de votação',     ev(item.zonaVotacao)],
              ['Ano pré-candidatura', item.anoPrecandidatura ? String(item.anoPrecandidatura) : '—'],
            ]} />
          </CollapsibleSection>

          <CollapsibleSection icon="bi-card-list" title="Dados pessoais">
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
          </CollapsibleSection>

          <CollapsibleSection icon="bi-diagram-3-fill" title="Filiação partidária">
            <FieldGrid fields={[
              ['Data de filiação',    ev(item.dataFiliacao)],
              ['Data de desfiliação', ev(item.dataDesfiliacao)],
              ['Situação',            ev(item.situacaoFiliacao) === '—' ? 'Regular' : ev(item.situacaoFiliacao)],
            ]} />
          </CollapsibleSection>

          <CollapsibleSection icon="bi-geo-alt-fill" title="Endereço declarado na filiação">
            <FieldGrid fields={[
              ['UF',        ev(item.uf)],
              ['Município', ev(item.municipio)],
              ['Endereço',  ev(item.endereco)],
              ['Número',    ev(item.numero)],
              ['Bairro',    ev(item.bairro)],
              ['CEP',       ev(item.cep)],
            ]} />
          </CollapsibleSection>

          <CollapsibleSection icon="bi-telephone-fill" title="Contato">
            <FieldGrid fields={[
              ['E-mail',        ev(item.email)],
              ['Celular',       ev(item.celular)],
              ['Telefone fixo', ev(item.telefone)],
            ]} />
          </CollapsibleSection>

          {/* Histórico de cargos políticos — sempre visível */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-bg-subtle)' }}>
            <SectionHeader icon="bi-award-fill" title="Histórico de cargos políticos" />
            <CargoPoliticoTimeline rows={cargosPolíticos} />
          </div>

          {item.historicoOrgaos && item.historicoOrgaos.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-bg-subtle)' }}>
              <SectionHeader icon="bi-building" title="Histórico de cargos partidários" />
              <div style={{ marginBottom: 8, display: 'grid', gridTemplateColumns: '1fr 180px 90px 1fr', gap: 10, padding: '0 14px' }}>
                {['Cargo','Período','Abrangência','Local'].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
                ))}
              </div>
              <CargoPartidarioTable rows={item.historicoOrgaos} />
            </div>
          )}
        </ModalBase.Body>
      </ModalBase>

      {/* Lightbox — sibling a ModalBase, full-viewport */}
      {showPhoto && (
        <>
          <div onClick={() => setShowPhoto(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1090 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1091, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            {item.foto ? (
              <img src={item.foto} alt={item.nome} style={{ maxWidth: 400, maxHeight: 400, borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }} />
            ) : (
              <Avatar nome={item.nome} size={200} palette="gradient-green" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }} />
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
