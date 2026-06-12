import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Search, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'atlas' | 'error' | 'tool' | 'metric' | 'fix' | 'stage';
  x: number;
  y: number;
  connections: string[];
}

const typeConfig = {
  atlas: { color: 'var(--meridian-gold)', border: '#B8962E', size: 44, textColor: '#FFFFFF' },
  error: { color: 'var(--topography-rust)', border: '#9A3510', size: 32, textColor: '#FFFFFF' },
  tool: { color: '#3B82F6', border: '#2563EB', size: 28, textColor: '#FFFFFF' },
  metric: { color: '#8B5CF6', border: '#7C3AED', size: 26, textColor: '#FFFFFF' },
  fix: { color: '#10B981', border: '#059669', size: 28, textColor: '#FFFFFF' },
  stage: { color: '#64748B', border: '#475569', size: 30, textColor: '#FFFFFF' },
};

const nodes: GraphNode[] = [
  { id: 'atlas', label: 'Atlas', type: 'atlas', x: 400, y: 300, connections: ['cts0008', 'tim0023', 'rou0041', 'openroad', 'sky130', 'timing', 'routing', 'cts_stage', 'fix_clock'] },
  { id: 'cts0008', label: 'CTS-0008', type: 'error', x: 220, y: 160, connections: ['atlas', 'cts_stage', 'openroad', 'fix_clock', 'skew'] },
  { id: 'tim0023', label: 'TIM-0023', type: 'error', x: 600, y: 140, connections: ['atlas', 'timing', 'hold', 'fix_hold'] },
  { id: 'rou0041', label: 'ROU-0041', type: 'error', x: 620, y: 430, connections: ['atlas', 'routing', 'congestion', 'openroad'] },
  { id: 'openroad', label: 'OpenROAD', type: 'tool', x: 240, y: 420, connections: ['atlas', 'cts0008', 'rou0041', 'cts_stage'] },
  { id: 'sky130', label: 'Sky130', type: 'tool', x: 180, y: 300, connections: ['atlas', 'openroad'] },
  { id: 'timing', label: 'Timing', type: 'metric', x: 560, y: 230, connections: ['atlas', 'tim0023', 'hold', 'setup'] },
  { id: 'routing', label: 'Routing', type: 'metric', x: 550, y: 370, connections: ['atlas', 'rou0041', 'congestion'] },
  { id: 'cts_stage', label: 'CTS Stage', type: 'stage', x: 320, y: 90, connections: ['cts0008', 'openroad', 'atlas'] },
  { id: 'fix_clock', label: 'create_clock fix', type: 'fix', x: 140, y: 80, connections: ['cts0008', 'atlas'] },
  { id: 'fix_hold', label: 'Hold Buffer fix', type: 'fix', x: 700, y: 200, connections: ['tim0023'] },
  { id: 'hold', label: 'Hold Slack', type: 'metric', x: 680, y: 310, connections: ['tim0023', 'timing', 'fix_hold'] },
  { id: 'setup', label: 'Setup Slack', type: 'metric', x: 490, y: 140, connections: ['timing'] },
  { id: 'skew', label: 'Clock Skew', type: 'metric', x: 310, y: 50, connections: ['cts0008', 'cts_stage'] },
  { id: 'congestion', label: 'Congestion', type: 'metric', x: 700, y: 480, connections: ['rou0041', 'routing'] },
];

const typeLabels = {
  atlas: 'Atlas Core',
  error: 'Failure Pattern',
  tool: 'EDA Tool',
  metric: 'Design Metric',
  fix: 'Known Fix',
  stage: 'Pipeline Stage',
};

export function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState('');

  const visibleNodes = search
    ? nodes.filter(n => n.label.toLowerCase().includes(search.toLowerCase()) || n.id.includes(search.toLowerCase()))
    : nodes;

  const isConnectedToSelected = (nodeId: string) => {
    if (!selected) return true;
    return selected.id === nodeId || selected.connections.includes(nodeId);
  };

  const zoom = (dir: 1 | -1) => setScale(s => Math.max(0.4, Math.min(2, s + dir * 0.15)));

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', fontFamily: 'var(--font-ui)' }}>
      {/* Header */}
      <div className="border-b" style={{ background: '#FFFFFF', borderColor: 'var(--stone-ridge)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--meridian-gold)' }}>Atlas Knowledge Graph</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--abyss-ink)' }}>
                The Map of Failures
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search nodes..."
                  className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none border"
                  style={{ border: '1px solid var(--stone-ridge)', fontFamily: 'var(--font-ui)', color: 'var(--abyss-ink)', background: 'var(--canvas-bone)' }}
                />
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => zoom(1)} className="w-8 h-8 rounded flex items-center justify-center border transition-colors" style={{ border: '1px solid var(--stone-ridge)', background: '#FFFFFF' }}>
                  <ZoomIn className="w-4 h-4" style={{ color: '#64748B' }} />
                </button>
                <button onClick={() => zoom(-1)} className="w-8 h-8 rounded flex items-center justify-center border transition-colors" style={{ border: '1px solid var(--stone-ridge)', background: '#FFFFFF' }}>
                  <ZoomOut className="w-4 h-4" style={{ color: '#64748B' }} />
                </button>
                <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); setSelected(null); }} className="w-8 h-8 rounded flex items-center justify-center border transition-colors" style={{ border: '1px solid var(--stone-ridge)', background: '#FFFFFF' }}>
                  <RotateCcw className="w-4 h-4" style={{ color: '#64748B' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {Object.entries(typeConfig).map(([type, config]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: config.color }} />
                {typeLabels[type as keyof typeof typeLabels]}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Graph */}
        <div className="flex-1 relative overflow-hidden" style={{ background: 'var(--canvas-bone)' }}>
          <svg
            ref={svgRef}
            className="w-full h-full"
            viewBox="0 0 800 580"
            style={{ cursor: 'grab' }}
          >
            <g transform={`scale(${scale}) translate(${pan.x}, ${pan.y})`}>
              {/* Edges */}
              {nodes.map(node =>
                node.connections.map(targetId => {
                  const target = nodes.find(n => n.id === targetId);
                  if (!target || target.id < node.id) return null;
                  const faded = selected && !isConnectedToSelected(node.id) && !isConnectedToSelected(targetId);
                  return (
                    <line
                      key={`${node.id}-${targetId}`}
                      x1={node.x} y1={node.y}
                      x2={target.x} y2={target.y}
                      stroke={faded ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.12)'}
                      strokeWidth={1.5}
                      strokeDasharray={node.type === 'fix' || target.type === 'fix' ? '4 3' : undefined}
                    />
                  );
                })
              )}

              {/* Nodes */}
              {nodes.map(node => {
                const config = typeConfig[node.type];
                const isVisible = !search || visibleNodes.some(n => n.id === node.id);
                const faded = selected ? !isConnectedToSelected(node.id) : !isVisible;
                const isSelected = selected?.id === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer"
                    onClick={() => setSelected(selected?.id === node.id ? null : node)}
                    style={{ opacity: faded ? 0.2 : 1, transition: 'opacity 0.2s' }}
                  >
                    {isSelected && (
                      <circle
                        r={config.size / 2 + 8}
                        fill="none"
                        stroke={config.color}
                        strokeWidth={2}
                        strokeDasharray="4 3"
                        opacity={0.5}
                      />
                    )}
                    <circle
                      r={config.size / 2}
                      fill={config.color}
                      stroke={config.border}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={node.type === 'atlas' ? 11 : 8.5}
                      fontWeight={700}
                      fill={config.textColor}
                      fontFamily="Work Sans, sans-serif"
                    >
                      {node.type === 'atlas' ? 'Atlas' : node.label.length > 10 ? node.label.slice(0, 8) + '…' : node.label}
                    </text>
                    {node.type !== 'atlas' && (
                      <text
                        y={config.size / 2 + 12}
                        textAnchor="middle"
                        fontSize={8}
                        fill="rgba(15,23,42,0.55)"
                        fontFamily="Work Sans, sans-serif"
                      >
                        {node.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Right Panel */}
        <aside className="w-72 border-l overflow-y-auto" style={{ background: '#FFFFFF', borderColor: 'var(--stone-ridge)' }}>
          {selected ? (
            <div className="p-5">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full" style={{ background: typeConfig[selected.type].color }} />
                  <span className="text-xs" style={{ color: '#94A3B8' }}>{typeLabels[selected.type]}</span>
                </div>
                <h3 className="font-bold mb-1" style={{ color: 'var(--abyss-ink)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
                  {selected.label}
                </h3>
                <span className="text-xs" style={{ color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>{selected.id}</span>
              </div>

              <div className="h-px mb-4" style={{ background: 'var(--stone-ridge)' }} />

              <div className="mb-4">
                <p className="text-xs font-semibold mb-2" style={{ color: '#94A3B8', letterSpacing: '0.08em' }}>CONNECTIONS ({selected.connections.length})</p>
                <div className="space-y-1.5">
                  {selected.connections.map(cId => {
                    const connected = nodes.find(n => n.id === cId);
                    if (!connected) return null;
                    return (
                      <button
                        key={cId}
                        onClick={() => setSelected(connected)}
                        className="w-full flex items-center gap-2 text-xs text-left px-2 py-1.5 rounded transition-colors"
                        style={{ color: '#475569', background: 'var(--canvas-bone)' }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: typeConfig[connected.type].color }} />
                        {connected.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selected.type === 'error' && (
                <Link
                  to={`/atlas/error/${selected.id}`}
                  className="block w-full py-2.5 text-center rounded-lg text-sm font-medium"
                  style={{ background: 'var(--abyss-ink)', color: 'var(--canvas-bone)' }}
                >
                  View Full Analysis →
                </Link>
              )}
            </div>
          ) : (
            <div className="p-5">
              <h3 className="font-semibold mb-2" style={{ color: 'var(--abyss-ink)' }}>Explore the Graph</h3>
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#64748B' }}>
                Click any node to explore its connections. Atlas sits at the center, connected to all known failure patterns, tools, metrics, and fixes.
              </p>

              <div className="space-y-2">
                <p className="text-xs font-semibold" style={{ color: '#94A3B8', letterSpacing: '0.08em' }}>ALL NODES</p>
                {nodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => setSelected(node)}
                    className="w-full flex items-center gap-2 text-xs text-left px-2 py-1.5 rounded transition-colors"
                    style={{ color: '#475569' }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: typeConfig[node.type].color }} />
                    <span>{node.label}</span>
                    <span className="ml-auto" style={{ color: '#C8C7C2' }}>{node.connections.length}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
