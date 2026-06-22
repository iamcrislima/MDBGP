import React, { useState, useRef, useEffect, useMemo } from 'react';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const WEEKDAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

function parseDate(s: string): Date | null {
  if (!s || s.length < 10) return null;
  const parts = s.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y || y < 1900 || y > 2100) return null;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d ? dt : null;
}

function fmtDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export default function DatePicker({ value, onChange, placeholder = 'dd/mm/aaaa' }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    const p = parseDate(value);
    return p ? p.getFullYear() : today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const p = parseDate(value);
    return p ? p.getMonth() : today.getMonth();
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Sync view when value changes from outside
  useEffect(() => {
    const p = parseDate(value);
    if (p) { setViewYear(p.getFullYear()); setViewMonth(p.getMonth()); }
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
    if (v.length > 5) v = v.slice(0, 5) + '/' + v.slice(5);
    if (v.length > 10) v = v.slice(0, 10);
    onChange(v);
  };

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const count = new Date(viewYear, viewMonth + 1, 0).getDate();
    const result: (Date | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= count; d++) result.push(new Date(viewYear, viewMonth, d));
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [viewYear, viewMonth]);

  const selected = parseDate(value);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };
  const pick = (d: Date) => { onChange(fmtDate(d)); setOpen(false); };
  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isSel = (d: Date) => !!selected && d.toDateString() === selected.toDateString();

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          value={value}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          maxLength={10}
          style={{ border: `1.5px solid ${open ? 'var(--color-primary)' : 'var(--color-border-input)'}`, borderRadius: 8, padding: '8px 36px 8px 10px', fontSize: 13, background: '#fff', width: '100%', fontFamily: 'Open Sans, sans-serif', color: 'var(--color-text-dark)', height: 38, boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s', boxShadow: open ? '0 0 0 3px rgba(0,150,63,0.15)' : 'none' }}
        />
        <i className="bi bi-calendar3" onClick={() => setOpen(o => !o)}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 14, cursor: 'pointer', pointerEvents: 'all' }} />
      </div>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,0.13)', zIndex: 600, padding: '12px 14px', width: 262, fontFamily: 'Open Sans, sans-serif' }}>

          {/* Month/Year header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px 8px', borderRadius: 6, fontSize: 13, lineHeight: 1 }}>
              <i className="bi bi-chevron-left" />
            </button>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-strong)' }}>{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px 8px', borderRadius: 6, fontSize: 13, lineHeight: 1 }}>
              <i className="bi bi-chevron-right" />
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {WEEKDAYS.map(w => (
              <div key={w} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', padding: '2px 0' }}>{w}</div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const sel = isSel(d);
              const tod = isToday(d);
              return (
                <DayCell key={i} day={d.getDate()} selected={sel} today={tod} onClick={() => pick(d)} />
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-bg-subtle)' }}>
            <button onClick={() => { onChange(''); setOpen(false); }}
              style={{ background: 'none', border: '1px solid var(--color-border-input)', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'Open Sans, sans-serif' }}>
              Limpar
            </button>
            <button onClick={() => { pick(today); }}
              style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 6, padding: '4px 14px', fontSize: 12, cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600, fontFamily: 'Open Sans, sans-serif' }}>
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DayCell({ day, selected, today, onClick }: { day: number; selected: boolean; today: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textAlign: 'center', padding: '6px 0', borderRadius: 6, fontSize: 12, cursor: 'pointer',
        fontWeight: selected ? 700 : 400,
        background: selected ? 'var(--color-primary)' : hov ? '#f0fdf4' : 'transparent',
        color: selected ? '#fff' : today ? 'var(--color-primary)' : 'var(--color-text-dark)',
        border: today && !selected ? '1.5px solid var(--color-primary)' : selected ? '1.5px solid var(--color-primary)' : '1.5px solid transparent',
        transition: 'background 0.1s',
      }}>
      {day}
    </div>
  );
}
