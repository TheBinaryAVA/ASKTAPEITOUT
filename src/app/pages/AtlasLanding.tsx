import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CheckCircle, Zap, Shield, Map } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { ConfidenceMeter } from '../components/ConfidenceMeter';

const atlasStates = [
  {
    status: 'analyzing' as const,
    label: 'Analyzing',
    desc: 'Atlas ingests your error logs, constraint files, and design context. It cross-references your failure signature against 47,000+ documented tapeout incidents.',
    detail: 'Parsing 2,847 CTS failure patterns...',
  },
  {
    status: 'charting' as const,
    label: 'Charting Path',
    desc: 'Atlas maps the causal chain from symptom to root cause. It builds a diagnostic graph connecting your failure to known failure modes, tools, and fixes.',
    detail: 'Mapping: CTS-0008 → SDC → create_clock → Resolution',
  },
  {
    status: 'fixed' as const,
    label: 'Fixed',
    desc: 'Atlas delivers a prioritized diagnosis with confidence score, evidence, recommended fix, and expected outcome. You act with certainty.',
    detail: '94% confidence · Fix verified by 2,847 engineers',
  },
];

const tiers = [
  {
    number: '01',
    name: 'Public Knowledge',
    desc: 'Documented error patterns, OpenROAD documentation, PDK design rules, and community Q&A — all indexed and made searchable by Atlas.',
    items: ['Error encyclopedia', 'Community questions', 'Documentation', 'Learning resources'],
    color: '#3B82F6',
  },
  {
    number: '02',
    name: 'Community Intelligence',
    desc: 'Anonymized, aggregated patterns from thousands of real implementation flows. Success rates, common fixes, trending failures — without exposing any proprietary data.',
    items: ['Anonymized patterns', 'Success rate data', 'Trending failures', 'Fix effectiveness'],
    color: 'var(--meridian-gold)',
  },
  {
    number: '03',
    name: 'Failure Atlas',
    desc: 'The deep failure corpus — a curated, structured database of implementation failure modes, root causes, and validated fixes built by the TapeItOut team.',
    items: ['Curated failure modes', 'Validated root causes', 'Structured evidence', 'Expert annotations'],
    color: 'var(--topography-rust)',
  },
];

const capabilities = [
  { icon: Map, title: 'Fragmented Toolchains', desc: 'Atlas maps the entire RTL-to-GDSII flow, stitching Vivado, Yosys, OpenROAD, and Magic into a single diagnostic layer.' },
  { icon: Shield, title: 'Discarded Telemetry', desc: 'Instead of discarding valuable logs and PDK reports, Atlas ingests telemetry from 47,000+ tapeouts to model failures.' },
  { icon: Zap, title: 'Actionable Fixes', desc: 'Get precise SDC constraint edits, script corrections, and physical parameter tuning backed by confidence scores.' },
  { icon: CheckCircle, title: 'Community Intelligence', desc: 'Share and reference physical design patterns securely and anonymously across teams with zero NDA or IP exposure.' },
];

export function AtlasLanding() {
  const [activeState, setActiveState] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveState(s => (s + 1) % 3), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: 'transparent', fontFamily: 'var(--font-ui)' }}>
      {/* Hero */}
      <section className="pt-24 pb-20 px-6 lg:px-8" style={{ background: 'var(--abyss-ink)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 7vw, 5rem)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.08 }}>
            Atlas Maps The <span className="highlight-word text-[#D4AF37]">Unknown.</span>
          </h1>

          <p className="max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontSize: '1.125rem', color: 'rgba(243,242,237,0.65)' }}>
            TapeItOut's AI implementation intelligence engine. Atlas turns RTL-to-GDSII failures into understood, actionable fixes — with evidence, confidence, and a clear path forward.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/atlas" className="px-8 py-3.5 rounded-lg font-semibold text-sm" style={{ background: 'var(--meridian-gold)', color: 'var(--abyss-ink)' }}>
              Try Atlas Free
            </Link>
            <Link to="/pricing" className="px-8 py-3.5 rounded-lg font-medium text-sm border" style={{ border: '1.5px solid rgba(255,255,255,0.2)', color: 'rgba(243,242,237,0.7)' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Three States */}
      <section className="py-20 px-6 lg:px-8 border-b" style={{ background: '#FFFFFF', borderColor: 'var(--stone-ridge)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--meridian-gold)' }}>How Atlas Works</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--abyss-ink)' }}>
              Three states. One <span className="highlight-word text-[#D4AF37]">confident answer.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {atlasStates.map((state, i) => (
              <div
                key={state.label}
                className="rounded-xl p-6 cursor-pointer transition-all"
                style={{
                  border: activeState === i ? '2px solid var(--meridian-gold)' : '1px solid var(--stone-ridge)',
                  background: activeState === i ? 'var(--abyss-ink)' : '#FAFAF7',
                }}
                onClick={() => setActiveState(i)}
              >
                <div className="mb-4">
                  <StatusBadge status={state.status} pulse={activeState === i} />
                </div>
                <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', color: activeState === i ? '#FFFFFF' : 'var(--abyss-ink)' }}>
                  {state.label}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: activeState === i ? 'rgba(243,242,237,0.65)' : '#64748B' }}>
                  {state.desc}
                </p>
                <div className="rounded-lg px-3 py-2 text-xs" style={{ fontFamily: 'var(--font-mono)', background: activeState === i ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: activeState === i ? 'rgba(243,242,237,0.5)' : '#94A3B8' }}>
                  {state.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20 px-6 lg:px-8" style={{ background: 'transparent' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--meridian-gold)' }}>Atlas Architecture</p>
             <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--abyss-ink)' }}>
              Three tiers. Zero <span className="highlight-word text-[#D4AF37]">proprietary exposure.</span>
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: '#64748B' }}>
              Atlas is built on layered knowledge — from public documentation to community intelligence — with strict privacy boundaries at every tier.
            </p>
          </div>

          <div className="space-y-4">
            {tiers.map((tier, i) => (
              <div
                key={tier.name}
                className="rounded-xl border p-6 md:p-8"
                style={{ background: '#FFFFFF', border: '1px solid var(--stone-ridge)' }}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="shrink-0">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ background: `${tier.color}15`, border: `1.5px solid ${tier.color}30` }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: tier.color }}>
                        {tier.number}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--abyss-ink)' }}>
                        {tier.name}
                      </h3>
                      <div className="h-px flex-1" style={{ background: 'var(--stone-ridge)' }} />
                    </div>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#475569' }}>{tier.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {tier.items.map(item => (
                        <span key={item} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: `${tier.color}0D`, color: tier.color, border: `1px solid ${tier.color}25` }}>
                          <CheckCircle className="w-3 h-3" /> {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 px-6 lg:px-8 border-t" style={{ background: '#FFFFFF', borderColor: 'var(--stone-ridge)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--abyss-ink)' }}>
              Atlas <span className="highlight-word text-[#D4AF37]">capabilities.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map(cap => (
              <div key={cap.title} className="scroll-reveal-card flex gap-4 p-6 rounded-xl border" style={{ border: '1px solid var(--stone-ridge)', background: '#FAFAF7' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--secondary)' }}>
                  <cap.icon className="w-5 h-5" style={{ color: 'var(--abyss-ink)' }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1.5" style={{ color: 'var(--abyss-ink)' }}>{cap.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 lg:px-8 text-center" style={{ background: 'var(--abyss-ink)' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: '#FFFFFF' }}>
            Start routing with <span className="highlight-word text-[#D4AF37]">confidence.</span>
          </h2>
          <p className="mb-8" style={{ color: 'rgba(243,242,237,0.6)', fontSize: '1.0625rem' }}>
            Atlas is free for individuals. Join 3,400+ engineers who've already mapped the unknown.
          </p>
          <Link to="/login" className="inline-block px-10 py-4 rounded-lg font-semibold" style={{ background: 'var(--meridian-gold)', color: 'var(--abyss-ink)' }}>
            Try Atlas Free → No credit card required
          </Link>
        </div>
      </section>
    </div>
  );
}
