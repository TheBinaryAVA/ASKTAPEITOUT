import { useParams, Link } from 'react-router';
import { AlertTriangle, CheckCircle, ArrowRight, TrendingUp, Users, Zap } from 'lucide-react';
import { ConfidenceMeter } from '../components/ConfidenceMeter';
import { StatusBadge } from '../components/StatusBadge';
import { CodeViewer } from '../components/CodeViewer';

const pipelineStages = ['RTL', 'Synthesis', 'Floorplan', 'Placement', 'CTS', 'Routing', 'Signoff'];

const errorData = {
  name: 'CTS-0008: No Clock Defined',
  severity: 'Critical',
  frequency: 'Very Common',
  stage: 'CTS',
  stageIndex: 4,
  description: 'The Clock Tree Synthesis (CTS) stage cannot proceed because no clock source has been defined in the design\'s timing constraints.',
  confidence: 97,
  rootCauses: [
    'Missing create_clock directive in SDC file',
    'Clock port name mismatch between SDC and netlist',
    'SDC file not loaded before CTS invocation',
    'Clock source removed during synthesis optimization',
  ],
  fixSteps: [
    { step: 1, title: 'Identify clock port name', desc: 'Run get_ports * in OpenROAD and identify your clock input port' },
    { step: 2, title: 'Add create_clock constraint', desc: 'Add create_clock -name clk -period <ns> [get_ports <port>] to your SDC file' },
    { step: 3, title: 'Set clock uncertainty', desc: 'Optional but recommended: add set_clock_uncertainty for realistic analysis' },
    { step: 4, title: 'Re-run CTS', desc: 'Re-invoke the CTS stage — clock tree will be built from your defined source' },
  ],
  communityStats: {
    seen: 2847,
    successRate: 96,
    mostEffectiveFix: 'Adding create_clock to SDC file',
    avgFixTime: '~15 minutes',
  },
};

const badCode = `# constraints.sdc — BROKEN
set_units -time ns -resistance kOhm -capacitance pF
set_max_fanout 20 [current_design]

# No create_clock defined!
set_input_delay 0.5 -clock clk [all_inputs]
set_output_delay 0.5 -clock clk [all_outputs]`;

const goodCode = `# constraints.sdc — FIXED
set_units -time ns -resistance kOhm -capacitance pF
set_max_fanout 20 [current_design]

# Add this: define your clock source
create_clock -name clk -period 10.0 [get_ports clk]
set_clock_uncertainty 0.1 [get_clocks clk]

set_input_delay 0.5 -clock clk [all_inputs]
set_output_delay 0.5 -clock clk [all_outputs]`;

const errorLog = `[INFO] Running Clock Tree Synthesis...
[INFO] Reading timing constraints from constraints.sdc
[INFO] Loading liberty files for Sky130...
[INFO] Building clock tree...
[ERROR CTS-0008] No clock defined in design.
[ERROR CTS-0008] Ensure create_clock or create_generated_clock is
                 present in your SDC file before invoking CTS.
[ERROR] OpenROAD exited with errors.
make: *** [Makefile:156: 5_cts.sdc] Error 1`;

export function FailureExplanation() {
  const { errorName } = useParams();

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', fontFamily: 'var(--font-ui)' }}>
      {/* Hero */}
      <div style={{ background: 'var(--abyss-ink)' }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-12 pb-10">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Link to="/errors" className="text-xs" style={{ color: 'rgba(243,242,237,0.4)' }}>Error Encyclopedia</Link>
            <span style={{ color: 'rgba(243,242,237,0.2)' }}>/</span>
            <span className="text-xs" style={{ color: 'rgba(243,242,237,0.4)' }}>CTS</span>
            <span style={{ color: 'rgba(243,242,237,0.2)' }}>/</span>
            <span className="text-xs" style={{ color: 'rgba(243,242,237,0.6)' }}>CTS-0008</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded text-xs font-semibold" style={{ background: 'rgba(194,65,12,0.2)', color: '#F97316', border: '1px solid rgba(194,65,12,0.3)' }}>
                  {errorData.severity}
                </span>
                <span className="px-2.5 py-1 rounded text-xs" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(243,242,237,0.6)' }}>
                  {errorData.frequency}
                </span>
                <span className="px-2.5 py-1 rounded text-xs" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--meridian-gold)' }}>
                  Stage: {errorData.stage}
                </span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                {errorData.name}
              </h1>
              <p className="mt-3 max-w-xl" style={{ color: 'rgba(243,242,237,0.6)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                {errorData.description}
              </p>
            </div>

            <div className="rounded-xl p-5 min-w-48" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ConfidenceMeter score={errorData.confidence} />
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'rgba(243,242,237,0.4)' }}>Seen</span>
                  <span style={{ color: 'rgba(243,242,237,0.8)', fontFamily: 'var(--font-mono)' }}>{errorData.communityStats.seen.toLocaleString()}×</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'rgba(243,242,237,0.4)' }}>Fix Rate</span>
                  <span style={{ color: '#10B981', fontFamily: 'var(--font-mono)' }}>{errorData.communityStats.successRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid var(--stone-ridge)' }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
          <h3 className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: '#94A3B8' }}>Failing Stage in Pipeline</h3>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {pipelineStages.map((stage, i) => {
              const isFailing = i === errorData.stageIndex;
              const isPast = i < errorData.stageIndex;
              const isFuture = i > errorData.stageIndex;
              return (
                <div key={stage} className="flex items-center">
                  <div
                    className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg min-w-20"
                    style={{
                      background: isFailing ? 'rgba(194,65,12,0.08)' : isPast ? 'rgba(16,185,129,0.06)' : 'transparent',
                      border: isFailing ? '2px solid var(--topography-rust)' : isPast ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: isFailing ? 'var(--topography-rust)' : isPast ? '#10B981' : '#E5E7EB',
                        color: isFailing || isPast ? '#FFFFFF' : '#9CA3AF',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      {isFailing ? '!' : isPast ? '✓' : i + 1}
                    </div>
                    <span className="text-xs font-medium text-center" style={{ color: isFailing ? 'var(--topography-rust)' : isPast ? '#10B981' : '#9CA3AF' }}>
                      {stage}
                    </span>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <div className="w-6 h-px mx-1" style={{ background: i < errorData.stageIndex ? '#10B981' : '#E5E7EB' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Root Causes */}
            <div className="rounded-xl border p-6" style={{ background: '#FFFFFF', border: '1px solid var(--stone-ridge)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--abyss-ink)', marginBottom: '1rem' }}>
                Root Causes
              </h2>
              <div className="space-y-3">
                {errorData.rootCauses.map((cause, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--topography-rust)' }} />
                    <span className="text-sm" style={{ color: '#475569', fontFamily: 'var(--font-editorial)' }}>{cause}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fix Steps */}
            <div className="rounded-xl border p-6" style={{ background: '#FFFFFF', border: '1px solid var(--stone-ridge)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--abyss-ink)', marginBottom: '1rem' }}>
                Fix Steps
              </h2>
              <div className="space-y-4">
                {errorData.fixSteps.map(step => (
                  <div key={step.step} className="flex gap-4">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--abyss-ink)', color: 'var(--canvas-bone)', fontSize: '0.75rem', fontWeight: 600 }}>
                      {step.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--abyss-ink)' }}>{step.title}</h4>
                      <p className="text-sm" style={{ color: '#64748B' }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Before/After Comparison */}
            <div className="rounded-xl border p-6" style={{ background: '#FFFFFF', border: '1px solid var(--stone-ridge)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--abyss-ink)', marginBottom: '1rem' }}>
                Before / After
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: 'var(--topography-rust)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--topography-rust)' }}>BROKEN — Causes CTS-0008</span>
                  </div>
                  <CodeViewer code={badCode} language="sdc" highlightLines={[5]} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#10B981' }} />
                    <span className="text-xs font-semibold" style={{ color: '#10B981' }}>FIXED — CTS proceeds</span>
                  </div>
                  <CodeViewer code={goodCode} language="sdc" highlightLines={[5, 6]} />
                </div>
              </div>
            </div>

            {/* Error Log */}
            <div className="rounded-xl border p-6" style={{ background: '#FFFFFF', border: '1px solid var(--stone-ridge)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--abyss-ink)', marginBottom: '1rem' }}>
                Example Log Output
              </h2>
              <CodeViewer code={errorLog} language="log" title="openroad.log" highlightLines={[5, 6, 7, 8, 9]} />
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-5">
            {/* Community Stats */}
            <div className="rounded-xl overflow-hidden border" style={{ border: '1px solid var(--stone-ridge)' }}>
              <div className="px-4 py-3 border-b" style={{ background: 'var(--abyss-ink)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <h4 className="text-sm font-semibold text-white">Community Intelligence</h4>
              </div>
              <div className="p-4 space-y-4" style={{ background: '#FAFAF7' }}>
                {[
                  { label: 'Seen', value: '2,847×', color: 'var(--abyss-ink)' },
                  { label: 'Success Rate', value: '96%', color: '#10B981' },
                  { label: 'Avg Fix Time', value: '~15 min', color: 'var(--meridian-gold)' },
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: '#64748B' }}>{stat.label}</span>
                    <span className="text-sm font-bold" style={{ color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--stone-ridge)' }}>
                  <p className="text-xs mb-2" style={{ color: '#94A3B8' }}>Most Effective Fix</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--abyss-ink)' }}>{errorData.communityStats.mostEffectiveFix}</p>
                </div>
              </div>
            </div>

            {/* Atlas CTA */}
            <div className="rounded-xl border p-5 text-center" style={{ background: 'var(--abyss-ink)', border: '1px solid var(--abyss-ink)' }}>
              <p className="text-sm font-semibold text-white mb-2">Seeing this error?</p>
              <p className="text-xs mb-4" style={{ color: 'rgba(243,242,237,0.5)' }}>Let Atlas analyze your specific logs.</p>
              <Link to="/atlas" className="block w-full py-2.5 rounded-lg text-sm font-semibold" style={{ background: 'var(--meridian-gold)', color: 'var(--abyss-ink)' }}>
                Run Atlas Analysis
              </Link>
            </div>

            {/* Related Questions */}
            <div className="rounded-xl border p-5" style={{ border: '1px solid var(--stone-ridge)', background: '#FFFFFF' }}>
              <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#94A3B8' }}>Related Questions</h4>
              <div className="space-y-2.5">
                {['CTS-0008 in Cadence Innovus', 'Generated clock issues', 'Multi-domain CTS setup'].map(q => (
                  <Link key={q} to={`/questions/1`} className="flex items-center gap-2 text-xs group" style={{ color: '#475569' }}>
                    <ArrowRight className="w-3 h-3 shrink-0" style={{ color: '#D1D5DB' }} />
                    <span className="group-hover:underline">{q}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
