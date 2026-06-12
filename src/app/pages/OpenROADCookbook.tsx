import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, ChevronRight, CheckCircle, Copy, Check } from 'lucide-react';

const recipes = [
  {
    id: 1,
    category: 'CTS',
    title: 'Fix: CTS Fails with "No Clock Defined"',
    problem: 'OpenROAD\'s CTS stage fails with ERROR CTS-0008: No clock defined in design, halting the flow.',
    cause: 'The SDC constraints file does not contain a create_clock directive. Without an explicit clock definition, TritonCTS cannot identify the clock source.',
    solution: 'Add a create_clock constraint to your SDC file pointing to the clock input port of your design.',
    expectedResult: 'CTS proceeds successfully, builds the clock tree, and downstream timing analysis reflects proper clock propagation.',
    difficulty: 'Easy',
    timeEstimate: '~15 min',
    code: `# Step 1: Verify your clock port exists
openroad> get_ports *clk*
# Should return: {clk}

# Step 2: Add to your constraints.sdc file
create_clock -name clk \\
  -period 10.0 \\
  [get_ports clk]

set_clock_uncertainty 0.1 [get_clocks clk]
set_clock_transition 0.15 [get_clocks clk]

# Step 3: Re-run from CTS
make cts`,
    verified: true,
    successRate: 96,
  },
  {
    id: 2,
    category: 'Timing',
    title: 'Recipe: Resolve Hold Violations After CTS',
    problem: 'After CTS completes, STA reports negative hold slack (e.g., -0.23ns) on multiple paths. Hold repair does not fully resolve them.',
    cause: 'Clock skew introduced during CTS creates paths where data arrives too quickly relative to the capturing clock edge. Hold violations are fundamentally a skew management problem.',
    solution: 'Enable hold repair during CTS and tune the hold slack target. If violations persist, manually add hold buffers to the worst-offending paths.',
    expectedResult: 'Hold slack becomes positive (≥0.05ns) across all paths after optimization. Setup slack should remain unaffected.',
    difficulty: 'Intermediate',
    timeEstimate: '~1 hour',
    code: `# In your OpenROAD script, during CTS:
clock_tree_synthesis \\
  -root_buf sky130_fd_sc_hd__clkbuf_16 \\
  -buf_list {sky130_fd_sc_hd__clkbuf_4 \\
             sky130_fd_sc_hd__clkbuf_8} \\
  -wire_unit 20 \\
  -clk_nets clk

# Immediately after CTS, repair hold:
repair_timing \\
  -hold \\
  -slack_margin 0.1 \\
  -max_buffer_percent 20

# Check results:
report_check_types -max_slew -max_cap -max_fanout -violators
report_tns
report_wns`,
    verified: true,
    successRate: 88,
  },
  {
    id: 3,
    category: 'Routing',
    title: 'Recipe: Reduce Metal3 Routing Congestion',
    problem: 'Global routing reports >90% utilization on Metal3, causing detailed routing failure with unrouted nets.',
    cause: 'High-fanout nets, insufficient placement spread, or macro blockages are pushing too many routes through the same metal layer.',
    solution: 'Lower placement density, add routing blockages around macros, and adjust layer assignment weights in the global router.',
    expectedResult: 'Metal3 utilization drops below 80%, detailed routing completes with 0 unrouted nets.',
    difficulty: 'Intermediate',
    timeEstimate: '~2 hours',
    code: `# Step 1: Check congestion map
global_route -verbose
report_routing_congestion

# Step 2: Lower placement density and re-place
global_placement \\
  -density 0.70 \\
  -pad_left 2 \\
  -pad_right 2

# Step 3: Add routing blockages if needed
make_blockage \\
  -layers {M3} \\
  -bbox {100 100 200 200}

# Step 4: Adjust global router layer weights
set_global_routing_layer_adjustment M3 0.5

# Re-run global route
global_route`,
    verified: true,
    successRate: 79,
  },
  {
    id: 4,
    category: 'DRC',
    title: 'Recipe: Fix Antenna Violations on Metal3',
    problem: 'Signoff DRC reports antenna violations on Metal3 VIAs, risking gate oxide damage during manufacturing.',
    cause: 'Long metal routes accumulate charge during plasma etching. When the ratio of metal area to connected gate area exceeds the PDK antenna ratio, the gate oxide may be damaged.',
    solution: 'Add antenna diodes near the antenna-violating gates, or use jumpers to break the long metal routes with higher layers.',
    expectedResult: 'All antenna DRC violations are resolved. Antenna ratio is below PDK limits for all gates.',
    difficulty: 'Intermediate',
    timeEstimate: '~45 min',
    code: `# Check antenna violations
check_antennas -verbose

# Option 1: Insert antenna repair (OpenROAD)
repair_antennas -diode_cell sky130_fd_sc_hd__diode_2

# Option 2: Manual antenna diode insertion
# In your Verilog, add diode instance near antenna gate:
# sky130_fd_sc_hd__diode_2 ANTENNA_D1 (
#   .DIODE(antenna_net)
# );

# Verify fix
check_antennas
report_antenna_violations`,
    verified: true,
    successRate: 93,
  },
];

const categoryColors: Record<string, string> = {
  CTS: '#EC4899',
  Timing: '#3B82F6',
  Routing: '#10B981',
  DRC: '#F59E0B',
  LVS: '#8B5CF6',
  Power: '#EF4444',
};

const difficultyColors: Record<string, { color: string; bg: string }> = {
  Easy: { color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  Intermediate: { color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  Advanced: { color: 'var(--topography-rust)', bg: 'rgba(194,65,12,0.08)' },
};

function RecipeCard({ recipe }: { recipe: typeof recipes[0] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const diff = difficultyColors[recipe.difficulty];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(recipe.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border overflow-hidden transition-all" style={{ border: '1px solid var(--stone-ridge)', background: '#FFFFFF' }}>
      <button
        className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: `${categoryColors[recipe.category]}1A`, color: categoryColors[recipe.category] }}>
              {recipe.category}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: diff.bg, color: diff.color }}>
              {recipe.difficulty}
            </span>
            <span className="text-xs" style={{ color: '#94A3B8' }}>{recipe.timeEstimate}</span>
            {recipe.verified && (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#10B981' }}>
                <CheckCircle className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>
          <h3 className="font-semibold" style={{ color: 'var(--abyss-ink)', fontSize: '0.9375rem' }}>{recipe.title}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 mt-1 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: '#94A3B8' }} />
      </button>

      {open && (
        <div className="border-t px-6 py-6 space-y-6" style={{ borderColor: 'var(--stone-ridge)', background: '#FAFAF7' }}>
          {/* Problem */}
          <div className="rounded-lg p-4" style={{ background: 'rgba(194,65,12,0.05)', border: '1px solid rgba(194,65,12,0.15)' }}>
            <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--topography-rust)', letterSpacing: '0.08em' }}>PROBLEM</h4>
            <p className="text-sm leading-relaxed" style={{ color: '#374151', fontFamily: 'var(--font-editorial)' }}>{recipe.problem}</p>
          </div>

          {/* Cause */}
          <div>
            <h4 className="text-xs font-semibold mb-2" style={{ color: '#94A3B8', letterSpacing: '0.08em' }}>ROOT CAUSE</h4>
            <p className="text-sm leading-relaxed" style={{ color: '#475569', fontFamily: 'var(--font-editorial)' }}>{recipe.cause}</p>
          </div>

          {/* Solution */}
          <div>
            <h4 className="text-xs font-semibold mb-2" style={{ color: '#94A3B8', letterSpacing: '0.08em' }}>SOLUTION</h4>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#475569', fontFamily: 'var(--font-editorial)' }}>{recipe.solution}</p>

            {/* Code */}
            <div className="rounded-lg overflow-hidden" style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#161B22' }}>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>tcl / shell</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: copied ? '#10B981' : 'rgba(255,255,255,0.4)' }}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 text-sm overflow-x-auto" style={{ fontFamily: 'var(--font-mono)', color: '#E6EDF3', fontSize: '0.8rem', lineHeight: 1.6 }}>
                {recipe.code}
              </pre>
            </div>
          </div>

          {/* Expected Result */}
          <div className="rounded-lg p-4" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <h4 className="text-xs font-semibold mb-2" style={{ color: '#10B981', letterSpacing: '0.08em' }}>EXPECTED RESULT</h4>
            <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{recipe.expectedResult}</p>
            <p className="text-xs mt-2" style={{ color: '#10B981' }}>Community success rate: {recipe.successRate}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function OpenROADCookbook() {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(recipes.map(r => r.category)))];
  const filtered = recipes.filter(r => activeCategory === 'All' || r.category === activeCategory);

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', fontFamily: 'var(--font-ui)' }}>
      {/* Header */}
      <div style={{ background: 'var(--abyss-ink)' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-12 pb-10">
          <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'rgba(243,242,237,0.4)' }}>
            <Link to="/docs" style={{ color: 'rgba(243,242,237,0.4)' }}>Docs</Link>
            <ChevronRight className="w-3 h-3" />
            <span>OpenROAD Cookbook</span>
          </div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--meridian-gold)' }}>OpenROAD Cookbook</p>
          <h1 className="mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: '#FFFFFF' }}>
            Practical Implementation Recipes.
          </h1>
          <p style={{ color: 'rgba(243,242,237,0.6)', maxWidth: '40rem' }}>
            Battle-tested solutions for common OpenROAD implementation challenges. Each recipe includes root cause analysis, step-by-step solution, and expected results.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
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
              {cat === 'All' ? `All Recipes (${recipes.length})` : cat}
            </button>
          ))}
        </div>

        {/* Recipes */}
        <div className="space-y-4">
          {filtered.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-xl p-8 text-center" style={{ background: 'var(--abyss-ink)' }}>
          <h3 className="mb-2" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF' }}>
            Can't find your recipe?
          </h3>
          <p className="mb-6" style={{ color: 'rgba(243,242,237,0.6)' }}>Ask Atlas to diagnose your specific implementation failure.</p>
          <Link to="/atlas" className="inline-block px-8 py-3 rounded-lg font-semibold text-sm" style={{ background: 'var(--meridian-gold)', color: 'var(--abyss-ink)' }}>
            Run Atlas Analysis
          </Link>
        </div>
      </div>
    </div>
  );
}
