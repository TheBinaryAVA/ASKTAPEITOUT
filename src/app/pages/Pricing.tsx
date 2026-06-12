import { useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle, X, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Community',
    price: { monthly: 0, annual: 0 },
    desc: 'For individual engineers and students exploring open-source EDA.',
    cta: 'Start Free',
    ctaHref: '/login',
    highlight: false,
    features: [
      'Atlas AI (10 queries/month)',
      'Error Encyclopedia access',
      'Community Q&A',
      'Learning Hub (free modules)',
      'OpenROAD Cookbook',
      'Basic search',
    ],
    notIncluded: ['Advanced Atlas analysis', 'Knowledge Graph', 'Priority support', 'Team features', 'API access'],
  },
  {
    name: 'Pro',
    price: { monthly: 29, annual: 23 },
    desc: 'For professional engineers and small teams running real implementations.',
    cta: 'Start Pro Trial',
    ctaHref: '/login',
    highlight: true,
    features: [
      'Atlas AI (unlimited queries)',
      'Advanced diagnosis with evidence',
      'Knowledge Graph explorer',
      'Full Learning Hub access',
      'Community Intelligence dashboard',
      'Priority support',
      'Export & share diagnoses',
      'Saved sessions & history',
      'Email alerts for trending failures',
    ],
    notIncluded: ['Team management', 'SSO', 'SLA', 'API access'],
  },
  {
    name: 'Enterprise',
    price: { monthly: null, annual: null },
    desc: 'For semiconductor teams, EDA vendors, and design services companies.',
    cta: 'Contact Sales',
    ctaHref: 'mailto:hello@tapeitout.com',
    highlight: false,
    features: [
      'Everything in Pro',
      'Team management & SSO',
      'API access',
      'Custom knowledge ingestion',
      'Private Atlas deployment option',
      'Dedicated success engineer',
      'SLA & uptime guarantee',
      'Custom integrations',
      'Volume pricing',
      'On-premise option',
    ],
    notIncluded: [],
  },
];

const comparisonRows = [
  { feature: 'Atlas AI queries', community: '10/month', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Error Encyclopedia', community: '✓', pro: '✓', enterprise: '✓' },
  { feature: 'Community Q&A', community: '✓', pro: '✓', enterprise: '✓' },
  { feature: 'Learning Hub', community: 'Free only', pro: 'Full', enterprise: 'Full' },
  { feature: 'Knowledge Graph', community: '✗', pro: '✓', enterprise: '✓' },
  { feature: 'Confidence scores', community: '✗', pro: '✓', enterprise: '✓' },
  { feature: 'Evidence & reasoning', community: '✗', pro: '✓', enterprise: '✓' },
  { feature: 'Community Intelligence', community: '✗', pro: '✓', enterprise: '✓' },
  { feature: 'Session history', community: '✗', pro: '✓', enterprise: '✓' },
  { feature: 'API access', community: '✗', pro: '✗', enterprise: '✓' },
  { feature: 'SSO', community: '✗', pro: '✗', enterprise: '✓' },
  { feature: 'SLA', community: '✗', pro: '✗', enterprise: '✓' },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <div style={{ background: 'transparent', fontFamily: 'var(--font-ui)' }}>
      {/* Header */}
      <section className="pt-20 pb-16 px-6 lg:px-8 text-center" style={{ background: 'var(--abyss-ink)' }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--meridian-gold)' }}>Pricing</p>
        <h1 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '2.75rem', fontWeight: 700, color: '#FFFFFF' }}>
          Simple, honest pricing.
        </h1>
        <p className="mb-8" style={{ color: 'rgba(243,242,237,0.6)', fontSize: '1.0625rem' }}>
          Start free. Upgrade when Atlas becomes indispensable.
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center gap-3 p-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setAnnual(false)}
            className="px-4 py-1.5 rounded-full text-sm transition-all"
            style={{ background: !annual ? 'var(--meridian-gold)' : 'transparent', color: !annual ? 'var(--abyss-ink)' : 'rgba(243,242,237,0.6)', fontWeight: !annual ? 600 : 400 }}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className="px-4 py-1.5 rounded-full text-sm transition-all"
            style={{ background: annual ? 'var(--meridian-gold)' : 'transparent', color: annual ? 'var(--abyss-ink)' : 'rgba(243,242,237,0.6)', fontWeight: annual ? 600 : 400 }}
          >
            Annual
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: annual ? 'rgba(15,23,42,0.15)' : 'rgba(212,175,55,0.2)', color: annual ? 'var(--abyss-ink)' : 'var(--meridian-gold)' }}>
              Save 20%
            </span>
          </button>
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 lg:px-8 -mt-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map(plan => (
              <div
                key={plan.name}
                className="scroll-reveal-card rounded-2xl overflow-hidden border"
                style={{
                  border: plan.highlight ? '2px solid var(--meridian-gold)' : '1px solid var(--stone-ridge)',
                  background: plan.highlight ? 'var(--abyss-ink)' : '#FFFFFF',
                  boxShadow: plan.highlight ? '0 20px 60px rgba(15,23,42,0.3)' : 'none',
                }}
              >
                {plan.highlight && (
                  <div className="py-2 text-center text-xs font-semibold" style={{ background: 'var(--meridian-gold)', color: 'var(--abyss-ink)' }}>
                    <Zap className="w-3.5 h-3.5 inline mr-1" /> Most Popular
                  </div>
                )}
                <div className="p-7">
                  <h3 className="font-bold mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: plan.highlight ? '#FFFFFF' : 'var(--abyss-ink)' }}>
                    {plan.name}
                  </h3>
                  <p className="text-xs mb-6" style={{ color: plan.highlight ? 'rgba(243,242,237,0.5)' : '#94A3B8' }}>{plan.desc}</p>

                  <div className="mb-6">
                    {plan.price.monthly === null ? (
                      <div>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: plan.highlight ? '#FFFFFF' : 'var(--abyss-ink)' }}>
                          Custom
                        </span>
                      </div>
                    ) : plan.price.monthly === 0 ? (
                      <div>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: plan.highlight ? '#FFFFFF' : 'var(--abyss-ink)' }}>
                          Free
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-end gap-2">
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: plan.highlight ? '#FFFFFF' : 'var(--abyss-ink)' }}>
                          ${annual ? plan.price.annual : plan.price.monthly}
                        </span>
                        <span className="pb-2 text-sm" style={{ color: plan.highlight ? 'rgba(243,242,237,0.4)' : '#94A3B8' }}>/month</span>
                      </div>
                    )}
                    {plan.price.monthly !== null && plan.price.monthly !== 0 && annual && (
                      <p className="text-xs mt-1" style={{ color: plan.highlight ? 'rgba(243,242,237,0.4)' : '#94A3B8' }}>
                        Billed annually (${plan.price.annual! * 12}/yr)
                      </p>
                    )}
                  </div>

                  <Link
                    to={plan.ctaHref}
                    className="block w-full py-3 rounded-lg text-sm font-semibold text-center transition-all mb-6"
                    style={{
                      background: plan.highlight ? 'var(--meridian-gold)' : plan.name === 'Enterprise' ? 'transparent' : 'var(--abyss-ink)',
                      color: plan.highlight ? 'var(--abyss-ink)' : plan.name === 'Enterprise' ? '#64748B' : 'var(--canvas-bone)',
                      border: plan.name === 'Enterprise' ? '1.5px solid var(--stone-ridge)' : 'none',
                    }}
                  >
                    {plan.cta}
                  </Link>

                  <div className="space-y-2.5">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: plan.highlight ? 'var(--meridian-gold)' : '#10B981' }} />
                        <span style={{ color: plan.highlight ? 'rgba(243,242,237,0.85)' : '#374151' }}>{f}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map(f => (
                      <div key={f} className="flex items-start gap-2.5 text-sm">
                        <X className="w-4 h-4 shrink-0 mt-0.5" style={{ color: plan.highlight ? 'rgba(243,242,237,0.2)' : '#D1D5DB' }} />
                        <span style={{ color: plan.highlight ? 'rgba(243,242,237,0.3)' : '#9CA3AF' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-6 lg:px-8 border-t" style={{ background: '#FFFFFF', borderColor: 'var(--stone-ridge)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center mb-10" style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--abyss-ink)' }}>
            Feature comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--stone-ridge)' }}>
                  <th className="text-left py-3 pr-6 text-sm font-semibold" style={{ color: '#94A3B8' }}>Feature</th>
                  {['Community', 'Pro', 'Enterprise'].map(p => (
                    <th key={p} className="py-3 px-6 text-sm font-semibold text-center" style={{ color: p === 'Pro' ? 'var(--meridian-gold)' : '#94A3B8' }}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className="border-b" style={{ borderColor: i % 2 === 0 ? 'transparent' : 'var(--stone-ridge)', background: i % 2 === 0 ? '#F9F8F3' : '#FFFFFF' }}>
                    <td className="py-3.5 pr-6 text-sm" style={{ color: '#374151' }}>{row.feature}</td>
                    {[row.community, row.pro, row.enterprise].map((val, j) => (
                      <td key={j} className="py-3.5 px-6 text-sm text-center" style={{ color: val === '✓' ? '#10B981' : val === '✗' ? '#D1D5DB' : '#475569' }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 lg:px-8" style={{ background: 'transparent' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--abyss-ink)' }}>
            Questions? Talk to us.
          </h2>
          <p className="mb-6" style={{ color: '#64748B' }}>We're engineers who understand your implementation challenges.</p>
          <a href="mailto:hello@tapeitout.com" className="inline-block px-8 py-3 rounded-lg text-sm font-semibold border" style={{ border: '1.5px solid var(--stone-ridge)', color: '#475569' }}>
            Contact Sales
          </a>
        </div>
      </section>
    </div>
  );
}
