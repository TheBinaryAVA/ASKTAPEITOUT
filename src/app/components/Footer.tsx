import { Link } from 'react-router';
import { Github, Twitter, MessageSquare } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Atlas AI', href: '/atlas-platform' },
    { label: 'Error Encyclopedia', href: '/errors' },
    { label: 'Knowledge Graph', href: '/knowledge-graph' },
    { label: 'Community', href: '/community' },
  ],
  Learn: [
    { label: 'Learning Hub', href: '/learn' },
    { label: 'Docs', href: '/docs' },
    { label: 'OpenROAD Cookbook', href: '/docs/openroad-cookbook' },
    { label: 'Failure Atlas', href: '/errors' },
  ],
  Company: [
    { label: 'About TapeItOut', href: '#' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer style={{ background: 'var(--abyss-ink)', fontFamily: 'var(--font-ui)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'var(--meridian-gold)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--abyss-ink)', fontFamily: 'var(--font-mono)' }}>T</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white text-sm font-semibold">Ask</span>
                <span className="text-xs" style={{ color: 'var(--meridian-gold)', letterSpacing: '0.12em' }}>TAPEITOUT</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(243,242,237,0.5)' }}>
              Atlas maps the unknown. We help semiconductor engineers navigate RTL-to-GDSII with confidence.
            </p>
            <div className="flex items-center gap-3">
              {[Github, Twitter, MessageSquare].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(243,242,237,0.5)' }}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(243,242,237,0.35)' }}>
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm transition-colors" style={{ color: 'rgba(243,242,237,0.55)' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs" style={{ color: 'rgba(243,242,237,0.3)' }}>
            © 2024 TapeItOut. All rights reserved. Ask.TapeItOut is powered by Atlas.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--meridian-gold)' }} />
            <span className="text-xs" style={{ color: 'rgba(243,242,237,0.3)' }}>Atlas Online — 99.9% Uptime</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
