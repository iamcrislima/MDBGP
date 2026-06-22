import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';

const GEOJSON_URL =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

const NAME_TO_UF: Record<string, string> = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
  'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
  'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
  'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
  'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO',
};

function stepColor(value: number): string {
  if (value >= 500) return 'var(--color-primary)';
  if (value >= 300) return '#4CAF50';
  if (value >= 150) return 'var(--color-primary-border)';
  if (value > 0)    return 'var(--color-primary-light)';
  return 'var(--color-border)';
}

const LARGE_STATES = new Set(['AM', 'PA', 'MT', 'BA', 'MG', 'GO', 'SP', 'RS', 'MS', 'PI', 'MA', 'TO']);

interface StateData {
  uf: string;
  value: number;
  ibge?: number;
}

interface BrazilMapProps {
  data?: StateData[];
  onStateClick?: (uf: string) => void;
  colorScale?: [string, string]; // kept for API compat — ignored
  height?: number;
  selectedUF?: string;
}

interface Feature {
  name: string;
  uf: string;
  pathD: string;
  centroid: [number, number] | null;
}

const W = 520, H = 540;

export default function BrazilMap({ data = [], onStateClick, height = 420, selectedUF }: BrazilMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; uf: string; value: number; ibge?: number } | null>(null);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(geo => { setGeoData(geo); setLoading(false); })
      .catch(() => { setFailed(true); setLoading(false); });
  }, []);

  const dataMap = useMemo(() =>
    Object.fromEntries(data.map(d => [d.uf, d])), [data]);

  const features = useMemo((): Feature[] => {
    if (!geoData) return [];
    const projection = d3.geoMercator().fitSize([W, H], geoData);
    const pathFn = d3.geoPath().projection(projection);
    return geoData.features.map((feat: any) => {
      const name: string = feat.properties?.name ?? '';
      const uf = NAME_TO_UF[name] ?? '';
      return {
        name,
        uf,
        pathD: pathFn(feat) ?? '',
        centroid: uf ? pathFn.centroid(feat) as [number, number] : null,
      };
    });
  }, [geoData]);

  if (loading) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
        Carregando mapa...
      </div>
    );
  }

  if (failed) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: 13 }}>
        Erro ao carregar mapa.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height, maxWidth: '100%' }}
      >
        {features.map(({ name, uf, pathD, centroid }) => {
          if (!pathD) return null;
          const d = dataMap[uf];
          const isSelected = uf === selectedUF;
          const isHovered = uf === hovered;
          const baseFill = isSelected ? '#FFD000' : stepColor(d?.value ?? 0);

          const darkFill = (() => {
            if (isSelected) return '#e6bb00';
            const c = stepColor(d?.value ?? 0);
            // darken by blending with black at 12%
            const hex = c.replace('#', '');
            const r = Math.round(parseInt(hex.slice(0, 2), 16) * 0.88);
            const g = Math.round(parseInt(hex.slice(2, 4), 16) * 0.88);
            const b = Math.round(parseInt(hex.slice(4, 6), 16) * 0.88);
            return `rgb(${r},${g},${b})`;
          })();

          const fill = isHovered ? darkFill : baseFill;
          const stroke = isSelected ? '#cc9a00' : isHovered ? 'rgba(0,0,0,0.2)' : '#fff';
          const strokeW = isSelected ? 1.5 : isHovered ? 1 : 0.5;

          // text color: white on dark fills, dark on light
          const textFill = isSelected
            ? '#1a1f2e'
            : (d && d.value >= 300) ? '#fff' : 'var(--color-text-dark)';

          const fontSize = LARGE_STATES.has(uf) ? 9 : 7.5;

          return (
            <g key={name || uf}>
              <path
                d={pathD}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeW}
                style={{ cursor: 'pointer', transition: 'fill 0.1s' }}
                onMouseEnter={e => {
                  setHovered(uf);
                  const svg = (e.currentTarget.closest('svg') as SVGSVGElement)!;
                  const rect = svg.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * W;
                  const y = ((e.clientY - rect.top) / rect.height) * H;
                  setTooltip({ x, y, name, uf, value: d?.value ?? 0, ibge: d?.ibge });
                }}
                onMouseMove={e => {
                  const svg = (e.currentTarget.closest('svg') as SVGSVGElement)!;
                  const rect = svg.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * W;
                  const y = ((e.clientY - rect.top) / rect.height) * H;
                  setTooltip(prev => prev ? { ...prev, x, y } : null);
                }}
                onMouseLeave={() => { setHovered(null); setTooltip(null); }}
                onClick={() => uf && onStateClick?.(uf)}
              />
              {uf && centroid && (
                <text
                  x={centroid[0]} y={centroid[1]}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={fontSize}
                  fontWeight="700"
                  fill={textFill}
                  fontFamily="Open Sans, Arial, sans-serif"
                  pointerEvents="none"
                >
                  {uf}
                </text>
              )}
            </g>
          );
        })}

        {/* Tooltip */}
        {tooltip && (() => {
          const hasIbge = tooltip.ibge !== undefined;
          const tw = 200, th = hasIbge ? 82 : 62;
          const tx = Math.min(Math.max(tooltip.x + 12, 2), W - tw - 2);
          const ty = Math.max(tooltip.y - th - 10, 2);
          return (
            <g transform={`translate(${tx},${ty})`} pointerEvents="none">
              <rect width={tw} height={th} rx={7} fill="var(--color-text-strong)" opacity={0.96} />
              {/* Header label */}
              <text x={12} y={16} fontSize={8.5} fontWeight="600" fill="rgba(148,163,184,0.85)" fontFamily="Open Sans, sans-serif" letterSpacing="0.6">
                ÓRGÃOS VIGENTES
              </text>
              {/* State name */}
              <text x={12} y={31} fontSize={12.5} fontWeight="700" fill="var(--color-bg-input)" fontFamily="Open Sans, sans-serif">
                {tooltip.name}
              </text>
              {/* Divider */}
              <line x1={12} y1={38} x2={tw - 12} y2={38} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
              {/* Total Órgãos */}
              <text x={12} y={53} fontSize={10} fill="#94a3b8" fontFamily="Open Sans, sans-serif">Total Órgãos</text>
              <text x={tw - 12} y={53} fontSize={10} fontWeight="700" fill="var(--color-bg-input)" fontFamily="Open Sans, sans-serif" textAnchor="end">
                {tooltip.value.toLocaleString('pt-BR')}
              </text>
              {/* IBGE */}
              {hasIbge && (
                <>
                  <text x={12} y={69} fontSize={10} fill="#94a3b8" fontFamily="Open Sans, sans-serif">Total IBGE</text>
                  <text x={tw - 12} y={69} fontSize={10} fontWeight="700" fill="var(--color-bg-input)" fontFamily="Open Sans, sans-serif" textAnchor="end">
                    {tooltip.ibge!.toLocaleString('pt-BR')} mun.
                  </text>
                </>
              )}
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
