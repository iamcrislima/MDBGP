import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption { value: string; label: string }

function DropItem({ label, selected, onClick, highlight }: { label: string; selected: boolean; onClick: () => void; highlight?: string }) {
  const [hov, setHov] = useState(false);

  const rendered = highlight && label.toLowerCase().includes(highlight.toLowerCase())
    ? (() => {
        const idx = label.toLowerCase().indexOf(highlight.toLowerCase());
        return <>{label.slice(0, idx)}<strong style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{label.slice(idx, idx + highlight.length)}</strong>{label.slice(idx + highlight.length)}</>;
      })()
    : label;

  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '9px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: selected ? 'var(--color-primary-light)' : hov ? 'var(--color-bg-input)' : '#fff', color: selected ? 'var(--color-primary-dark)' : 'var(--color-text-dark)', fontWeight: selected ? 600 : 400, fontFamily: 'Open Sans, sans-serif', transition: 'background 0.1s' }}>
      <span style={{ width: 16, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {selected && <i className="bi bi-check2" style={{ color: 'var(--color-primary)', fontSize: 13 }} />}
      </span>
      {rendered}
    </div>
  );
}

export default function CustomSelect({ value, onChange, options, placeholder, disabled }: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch(''); }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (open) { setSearch(''); setTimeout(() => searchRef.current?.focus(), 0); }
  }, [open]);

  const label = options.find(o => o.value === value)?.label ?? placeholder;
  const showSearch = options.length > 5;
  const filtered = search ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())) : options;

  const close = () => { setOpen(false); setSearch(''); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => !disabled && setOpen(o => !o)}
        style={{ height: 38, padding: '0 10px', border: `1.5px solid ${open ? 'var(--color-primary)' : 'var(--color-border-input)'}`, borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: disabled ? '#f9fafb' : value ? 'var(--color-primary-light)' : '#fff', cursor: disabled ? 'not-allowed' : 'pointer', color: value ? 'var(--color-primary-dark)' : 'var(--color-text-dark)', fontFamily: 'Open Sans, sans-serif', boxShadow: open ? '0 0 0 3px rgba(0,150,63,0.15)' : 'none', transition: 'border-color 0.15s, box-shadow 0.15s', userSelect: 'none', opacity: disabled ? 0.55 : 1, gap: 8, width: '100%', boxSizing: 'border-box' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{label}</span>
        <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: 10, flexShrink: 0, color: 'var(--color-text-muted)' }} />
      </div>

      {open && !disabled && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 500, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {showSearch && (
            <div style={{ padding: '7px 8px', borderBottom: '1px solid var(--color-bg-subtle)', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-search" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 11, pointerEvents: 'none' }} />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  style={{ width: '100%', height: 30, paddingLeft: 26, paddingRight: 8, border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12, outline: 'none', fontFamily: 'Open Sans, sans-serif', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
                  onKeyDown={e => { if (e.key === 'Escape') close(); }}
                />
              </div>
            </div>
          )}

          <div style={{ overflowY: 'auto', maxHeight: showSearch ? 200 : 260 }}>
            <DropItem label={placeholder} selected={!value} onClick={() => { onChange(''); close(); }} />
            {filtered.length === 0
              ? <div style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12, fontFamily: 'Open Sans, sans-serif' }}>Nenhum resultado</div>
              : filtered.map(o => (
                  <DropItem key={o.value} label={o.label} selected={value === o.value}
                    onClick={() => { onChange(o.value); close(); }}
                    highlight={search || undefined} />
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
