import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Search, Filter, ChevronDown, ArrowRight, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { ConfidenceMeter } from '../components/ConfidenceMeter';
import { StatusBadge } from '../components/StatusBadge';

const results = [
  {
    id: 1,
    title: 'OpenROAD CTS failure: "No clock defined in design"',
    summary: 'This error occurs when the Clock Tree Synthesis stage cannot find a valid clock source. The root cause is typically a missing or incorrectly scoped create_clock constraint in the SDC file.',
    confidence: 94,
    tags: ['CTS', 'OpenROAD', 'Sky130', 'Clock'],
    views: 2847,
    solved: true,
    stage: 'CTS',
    severity: 'Critical',
    tool: 'OpenROAD',
    fix: 'Add create_clock constraint to SDC file before CTS stage',
  },
  {
    id: 2,
    title: 'Hold timing violation persists after repair_timing in OpenROAD',
    summary: 'Hold violations that persist after hold repair are typically caused by clock skew exceeding the slack budget, or insufficient hold buffers being inserted due to placement constraints.',
    confidence: 88,
    tags: ['Timing', 'Hold', 'GF180'],
    views: 1923,
    solved: true,
    stage: 'Signoff',
    severity: 'High',
    tool: 'OpenROAD',
    fix: 'Increase hold buffer drive strength and relax placement density',
  },
  {
    id: 3,
    title: 'Routing congestion hotspot exceeds 95% utilization in metal3',
    summary: 'Metal layer congestion above 90% utilization will cause global routing failures. This is commonly caused by high-fanout nets, macro blockages, or insufficient routing tracks.',
    confidence: 76,
    tags: ['Routing', 'Congestion', 'Metal3'],
    views: 1456,
    solved: false,
    stage: 'Routing',
    severity: 'High',
    tool: 'OpenROAD',
    fix: 'Adjust placement density target and add routing blockages',
  },
  {
    id: 4,
    title: 'LVS mismatch: floating gate on PMOS device in Sky130',
    summary: 'Floating gate errors in LVS indicate that the extracted netlist has a device terminal unconnected that is connected in the schematic. This often results from PDK connectivity rules for well taps.',
    confidence: 91,
    tags: ['LVS', 'Sky130', 'DRC'],
    views: 987,
    solved: true,
    stage: 'Signoff',
    severity: 'Critical',
    tool: 'Magic',
    fix: 'Add substrate contact connections in layout',
  },
];

const filters = {
  Technology: ['Sky130', 'GF180', 'TSMC 28nm', 'Intel 16'],
  Tool: ['OpenROAD', 'Cadence Innovus', 'Synopsys ICC2', 'Magic', 'KLayout'],
  Stage: ['RTL', 'Synthesis', 'Floorplanning', 'Placement', 'CTS', 'Routing', 'Signoff'],
  Severity: ['Critical', 'High', 'Medium', 'Low'],
  Node: ['130nm', '180nm', '28nm', '16nm', '7nm'],
};

const atlasInsights = [
  { label: 'Most Common Cause', value: 'Missing SDC constraints', color: 'var(--topography-rust)' },
  { label: 'Success Rate', value: '94% of similar fixes work', color: '#10B981' },
  { label: 'Avg Fix Time', value: '2.3 hours', color: '#3B82F6' },
  { label: 'Seen This Week', value: '47 engineers', color: 'var(--meridian-gold)' },
];

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters(prev => {
      const curr = prev[category] || [];
      return {
        ...prev,
        [category]: curr.includes(value) ? curr.filter(v => v !== value) : [...curr, value],
      };
    });
  };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh' }}>
      {/* Search Header */}
      <div className="border-b" style={{ background: '#FFFFFF', borderColor: 'var(--stone-ridge)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-lg border" style={{ background: 'var(--canvas-bone)', border: '1.5px solid var(--stone-ridge)' }}>
              <Search className="w-4 h-4" style={{ color: '#94A3B8' }} />
              <input defaultValue={query} className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--abyss-ink)' }} />
            </div>
            <button className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ background: 'var(--abyss-ink)', color: 'var(--canvas-bone)' }}>
              Search
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm" style={{ color: '#64748B' }}>
            <span>{results.length} results for <strong style={{ color: 'var(--abyss-ink)' }}>"{query}"</strong></span>
            <span>·</span>
            <span>Ranked by Atlas confidence</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="lg:col-span-2">
            <div className="sticky top-24">
              <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#94A3B8' }}>Filters</h3>
              <div className="space-y-2">
                {Object.entries(filters).map(([category, options]) => (
                  <div key={category} className="rounded-lg overflow-hidden border" style={{ border: '1px solid var(--stone-ridge)', background: '#FFFFFF' }}>
                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium"
                      style={{ color: 'var(--abyss-ink)' }}
                      onClick={() => setOpenFilter(openFilter === category ? null : category)}
                    >
                      {category}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openFilter === category ? 'rotate-180' : ''}`} style={{ color: '#94A3B8' }} />
                    </button>
                    {openFilter === category && (
                      <div className="border-t px-3 py-2 space-y-1.5" style={{ borderColor: 'var(--stone-ridge)' }}>
                        {options.map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(activeFilters[category] || []).includes(opt)}
                              onChange={() => toggleFilter(category, opt)}
                              className="rounded"
                            />
                            <span className="text-xs" style={{ color: '#475569' }}>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Center - Results */}
          <main className="lg:col-span-7 space-y-4">
            {results.map((result) => (
              <Link
                key={result.id}
                to={`/questions/${result.id}`}
                className="block rounded-xl border p-6 transition-all hover:shadow-md group"
                style={{ background: '#FFFFFF', border: '1px solid var(--stone-ridge)' }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-semibold group-hover:underline" style={{ color: 'var(--abyss-ink)', fontSize: '0.9375rem' }}>
                    {result.title}
                  </h3>
                  {result.solved
                    ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#10B981' }} />
                    : <Clock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
                  }
                </div>

                <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748B' }}>{result.summary}</p>

                <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <span className="font-medium" style={{ color: 'var(--meridian-gold)' }}>Recommended Fix: </span>
                  <span style={{ color: '#475569' }}>{result.fix}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--secondary)', color: '#475569' }}>{tag}</span>
                    ))}
                    <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(194,65,12,0.08)', color: 'var(--topography-rust)' }}>{result.severity}</span>
                  </div>
                  <div className="shrink-0 w-28">
                    <ConfidenceMeter score={result.confidence} size="sm" showLabel={false} />
                    <p className="text-xs mt-1 text-right" style={{ color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>{result.confidence}% confidence</p>
                  </div>
                </div>
              </Link>
            ))}
          </main>

          {/* Right Sidebar - Atlas Insights */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-5">
              {/* Atlas Panel */}
              <div className="rounded-xl overflow-hidden border" style={{ border: '1px solid var(--stone-ridge)' }}>
                <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ background: 'var(--abyss-ink)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--meridian-gold)' }}>
                    <span style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--abyss-ink)', fontFamily: 'var(--font-mono)' }}>A</span>
                  </div>
                  <span className="text-sm font-medium text-white">Atlas Insights</span>
                </div>
                <div className="p-4 space-y-4" style={{ background: '#FAFAF7' }}>
                  <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
                    Based on 2,847 similar queries, Atlas identifies these patterns as most relevant:
                  </p>
                  {atlasInsights.map(insight => (
                    <div key={insight.label} className="flex items-start justify-between gap-2">
                      <span className="text-xs" style={{ color: '#94A3B8' }}>{insight.label}</span>
                      <span className="text-xs font-medium text-right" style={{ color: insight.color }}>{insight.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Failures */}
              <div className="rounded-xl border p-4" style={{ border: '1px solid var(--stone-ridge)', background: '#FFFFFF' }}>
                <h4 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#94A3B8' }}>Related Failures</h4>
                <div className="space-y-2">
                  {['CTS clock propagation', 'SDC constraint errors', 'Hold buffer overflow', 'Clock skew violations'].map(f => (
                    <Link key={f} to={`/atlas/error/${f.replace(/\s/g, '-').toLowerCase()}`} className="flex items-center justify-between py-1.5 text-xs group" style={{ color: '#475569' }}>
                      <span className="group-hover:underline">{f}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Suggested Learning */}
              <div className="rounded-xl border p-4" style={{ border: '1px solid var(--stone-ridge)', background: '#FFFFFF' }}>
                <h4 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#94A3B8' }}>Suggested Learning</h4>
                <div className="space-y-2.5">
                  {['Understanding CTS fundamentals', 'SDC constraint writing guide', 'Hold timing analysis'].map(l => (
                    <Link key={l} to="/learn" className="flex items-center gap-2 text-xs group" style={{ color: '#475569' }}>
                      <ExternalLink className="w-3 h-3 shrink-0" style={{ color: '#94A3B8' }} />
                      <span className="group-hover:underline">{l}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
