import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, TrendingUp, Link as LinkIcon } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { ConfidenceMeter } from '../components/ConfidenceMeter';

const categories = ['All', 'Timing', 'CTS', 'Routing', 'Power', 'Placement', 'DRC', 'LVS', 'OpenROAD'];

const errors = [
  { id: 'CTS-0008', name: 'No Clock Defined in Design', category: 'CTS', severity: 'Critical', frequency: 2847, confidence: 97, successRate: 96, tool: 'OpenROAD', stage: 'CTS', desc: 'CTS fails because no create_clock constraint is defined in the SDC file.' },
  { id: 'TIM-0023', name: 'Hold Violation: Negative Slack', category: 'Timing', severity: 'High', frequency: 1923, confidence: 91, successRate: 88, tool: 'OpenROAD', stage: 'Signoff', desc: 'Hold timing violations persist after repair_timing, indicating insufficient hold buffers or excessive clock skew.' },
  { id: 'ROU-0041', name: 'Routing Congestion: Metal3 >90%', category: 'Routing', severity: 'High', frequency: 1456, confidence: 84, successRate: 79, tool: 'OpenROAD', stage: 'Routing', desc: 'Global routing reports congestion exceeding 90% on metal3, blocking detailed routing.' },
  { id: 'DRC-0015', name: 'Antenna Violation on VIA2', category: 'DRC', severity: 'Medium', frequency: 3201, confidence: 95, successRate: 93, tool: 'OpenROAD/KLayout', stage: 'Signoff', desc: 'Metal accumulation during etching creates antenna effect, potentially damaging gate oxide.' },
  { id: 'LVS-0007', name: 'Floating Gate on PMOS Device', category: 'LVS', severity: 'Critical', frequency: 987, confidence: 92, successRate: 89, tool: 'Magic', stage: 'Signoff', desc: 'Extracted netlist shows unconnected gate terminal on PMOS, mismatching schematic.' },
  { id: 'PWR-0019', name: 'IR Drop Exceeding 5% VDD', category: 'Power', severity: 'High', frequency: 734, confidence: 87, successRate: 81, tool: 'OpenROAD', stage: 'Signoff', desc: 'Power rail voltage drop exceeds 5% threshold in high-activity regions.' },
  { id: 'PLA-0033', name: 'Placement Density >95%', category: 'Placement', severity: 'Medium', frequency: 1102, confidence: 88, successRate: 84, tool: 'OpenROAD', stage: 'Placement', desc: 'Placement density exceeds threshold, leaving insufficient space for routing and optimization.' },
  { id: 'TIM-0009', name: 'Setup Violation: Critical Path', category: 'Timing', severity: 'Critical', frequency: 2341, confidence: 93, successRate: 86, tool: 'OpenROAD', stage: 'Signoff', desc: 'Setup timing violation on critical path — slack is negative after global placement.' },
  { id: 'ROU-0088', name: 'Unrouted Nets: 47 Remaining', category: 'Routing', severity: 'Critical', frequency: 445, confidence: 79, successRate: 72, tool: 'OpenROAD', stage: 'Routing', desc: 'Detailed routing cannot complete — 47 nets remain unrouted after maximum iterations.' },
  { id: 'CTS-0003', name: 'Clock Skew Exceeds Budget', category: 'CTS', severity: 'High', frequency: 892, confidence: 90, successRate: 85, tool: 'OpenROAD', stage: 'CTS', desc: 'Clock tree synthesis produces skew exceeding timing budget, causing hold violations.' },
  { id: 'DRC-0029', name: 'Metal1 Min Spacing Violation', category: 'DRC', severity: 'Medium', frequency: 1678, confidence: 96, successRate: 94, tool: 'KLayout/Magic', stage: 'Signoff', desc: 'Minimum spacing rule violation on Metal1 layer between adjacent wires.' },
  { id: 'LVS-0012', name: 'Missing Substrate Contact', category: 'LVS', severity: 'High', frequency: 623, confidence: 88, successRate: 91, tool: 'Magic', stage: 'Signoff', desc: 'LVS detects missing substrate contact connections required by PDK design rules.' },
];

const severityColor = {
  Critical: 'var(--topography-rust)',
  High: '#F59E0B',
  Medium: '#3B82F6',
  Low: '#10B981',
};

const severityBg = {
  Critical: 'rgba(194,65,12,0.08)',
  High: 'rgba(245,158,11,0.08)',
  Medium: 'rgba(59,130,246,0.08)',
  Low: 'rgba(16,185,129,0.08)',
};

export function ErrorEncyclopedia() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [activeSeverity, setActiveSeverity] = useState('All');

  const filtered = errors.filter(e => {
    const matchCategory = activeCategory === 'All' || e.category.toLowerCase() === activeCategory.toLowerCase() || e.tool.toLowerCase().includes(activeCategory.toLowerCase());
    const matchSeverity = activeSeverity === 'All' || e.severity === activeSeverity;
    const matchQuery = !query || e.name.toLowerCase().includes(query.toLowerCase()) || e.id.toLowerCase().includes(query.toLowerCase()) || e.desc.toLowerCase().includes(query.toLowerCase());
    return matchCategory && matchSeverity && matchQuery;
  });

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', fontFamily: 'var(--font-ui)' }}>
      {/* Header */}
      <div style={{ background: 'var(--abyss-ink)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-12 pb-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--meridian-gold)' }}>Error Encyclopedia</p>
          <h1 className="mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: '#FFFFFF' }}>
            Every Failure. Mapped.
          </h1>
          <p className="mb-8" style={{ color: 'rgba(243,242,237,0.6)', maxWidth: '40rem' }}>
            {errors.length} documented failure patterns across RTL-to-GDSII implementation, each with Atlas confidence scores, root causes, and community-validated fixes.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by error code, name, or description..."
              className="w-full pl-11 pr-4 py-3 rounded-lg outline-none text-sm"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontFamily: 'var(--font-ui)' }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: activeCategory === cat ? 'var(--abyss-ink)' : '#FFFFFF',
                  color: activeCategory === cat ? 'var(--canvas-bone)' : '#64748B',
                  border: activeCategory === cat ? '1px solid var(--abyss-ink)' : '1px solid var(--stone-ridge)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="w-px h-4 mx-1" style={{ background: 'var(--stone-ridge)' }} />
          {['All', 'Critical', 'High', 'Medium'].map(sev => (
            <button
              key={sev}
              onClick={() => setActiveSeverity(sev)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: activeSeverity === sev ? 'var(--abyss-ink)' : '#FFFFFF',
                color: activeSeverity === sev ? 'var(--canvas-bone)' : '#64748B',
                border: activeSeverity === sev ? '1px solid var(--abyss-ink)' : '1px solid var(--stone-ridge)',
              }}
            >
              {sev === 'All' ? 'All Severity' : sev}
            </button>
          ))}
          <span className="ml-auto text-xs" style={{ color: '#94A3B8' }}>{filtered.length} errors</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(error => (
            <Link
              key={error.id}
              to={`/atlas/error/${error.id.toLowerCase()}`}
              className="group rounded-xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ background: '#FFFFFF', border: '1px solid var(--stone-ridge)' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-xs font-semibold" style={{ color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>{error.id}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                  style={{ background: severityBg[error.severity as keyof typeof severityBg], color: severityColor[error.severity as keyof typeof severityColor] }}
                >
                  {error.severity}
                </span>
              </div>

              <h3 className="font-semibold mb-2 group-hover:underline" style={{ color: 'var(--abyss-ink)', fontSize: '0.875rem', lineHeight: 1.4 }}>
                {error.name}
              </h3>
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#64748B' }}>{error.desc}</p>

              {/* Meta */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--secondary)', color: '#475569' }}>{error.category}</span>
                <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--secondary)', color: '#475569' }}>{error.tool}</span>
                <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--secondary)', color: '#475569' }}>{error.stage}</span>
              </div>

              {/* Metrics */}
              <div className="space-y-2.5">
                <ConfidenceMeter score={error.confidence} size="sm" />
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1" style={{ color: '#94A3B8' }}>
                    <TrendingUp className="w-3 h-3" />
                    {error.frequency.toLocaleString()} cases
                  </div>
                  <div className="flex items-center gap-1" style={{ color: '#10B981' }}>
                    <CheckCircle className="w-3 h-3" />
                    {error.successRate}% fixed
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
            <p className="font-medium mb-2" style={{ color: '#94A3B8' }}>No errors found</p>
            <p className="text-sm" style={{ color: '#D1D5DB' }}>Try a different search term or category</p>
          </div>
        )}
      </div>
    </div>
  );
}
