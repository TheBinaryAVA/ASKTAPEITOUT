import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Github, ArrowRight, ArrowLeft, Loader } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../lib/supabaseClient';

const badges = [
  { label: 'CTS', color: '#EC4899', depth: 25, position: { left: '8%', top: '20%' }, metric: 'Skew: 18ps' },
  { label: 'Timing', color: '#3B82F6', depth: 35, position: { right: '10%', top: '15%' }, metric: 'Slack: +0.04ns' },
  { label: 'DRC', color: '#F59E0B', depth: 18, position: { left: '5%', top: '50%' }, metric: 'Violations: 0' },
  { label: 'Routing', color: '#10B981', depth: 30, position: { right: '8%', top: '56%' }, metric: 'Density: 84%' },
  { label: 'LVS', color: '#8B5CF6', depth: 22, position: { left: '15%', bottom: '18%' }, metric: 'Status: Clean' },
  { label: 'Power', color: '#EF4444', depth: 28, position: { right: '14%', bottom: '20%' }, metric: 'IR Drop: 4.2%' },
];

function ProcessorHub() {
  return (
    <div className="relative w-36 h-36 rounded-2xl border-2 border-[#D4AF37]/35 bg-[#0F172A] flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.12)]">
      {/* Silicon Die internal structure */}
      <div className="absolute inset-2 border border-[#D4AF37]/15 rounded-xl flex items-center justify-center">
        <div className="w-14 h-14 rounded-lg border border-[#D4AF37]/25 flex items-center justify-center bg-[#D4AF37]/5">
          <span className="font-mono text-2xl font-bold text-[#D4AF37]">A</span>
        </div>
      </div>
      {/* Laser Etched grid design */}
      <div className="absolute inset-4 border border-dashed border-[#D4AF37]/10 rounded-lg pointer-events-none" />
      {/* Processor Pins (L/R/T/B sides) */}
      {Array.from({ length: 4 }).map((_, side) => (
        <div key={side} className={`absolute flex gap-2 ${
          side === 0 ? '-top-1 left-1/2 -translate-x-1/2 flex-row' :
          side === 1 ? '-bottom-1 left-1/2 -translate-x-1/2 flex-row' :
          side === 2 ? '-left-1 top-1/2 -translate-y-1/2 flex-col' :
          '-right-1 top-1/2 -translate-y-1/2 flex-col'
        }`}>
          {Array.from({ length: 4 }).map((_, pin) => (
            <div key={pin} className={`w-1 h-1 bg-[#D4AF37]/45 rounded-full`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LoginSignup() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Reset notifications when changing modes
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === 'forgot') {
      if (!email) {
        setError('Please enter your email address.');
        setLoading(false);
        return;
      }
    } else {
      if (!email || !password || (mode === 'signup' && !fullName.trim())) {
        setError(mode === 'signup' ? 'Please enter your name, email, and password.' : 'Please enter your email and password.');
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/atlas');
      } else if (mode === 'signup') {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });
        if (error) throw error;

        if (data?.session) {
          navigate('/atlas');
        } else {
          setSuccess('Registration successful! Please check your email to confirm your account.');
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccess('Password reset link sent! Please check your email.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/atlas`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `An error occurred during ${provider} authentication.`);
      setLoading(false);
    }
  };

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<(HTMLDivElement | null)[]>([]);
  const linesRef = useRef<(SVGPathElement | null)[]>([]);
  const flowLinesRef = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const panel = leftPanelRef.current;
    if (!panel) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = panel.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      const mouseX = (localX / rect.width) * 2 - 1; // -1 to 1
      const mouseY = (localY / rect.height) * 2 - 1; // -1 to 1

      // Translate central hub
      gsap.to(hubRef.current, {
        x: mouseX * 12,
        y: mouseY * 12,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      // Translate badges at different depths (parallax)
      badges.forEach((badge, idx) => {
        const el = badgesRef.current[idx];
        if (el) {
          gsap.to(el, {
            x: mouseX * badge.depth,
            y: mouseY * badge.depth,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      });
    };

    const onMouseLeave = () => {
      // Return elements back to center
      gsap.to([hubRef.current, ...badgesRef.current], {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    panel.addEventListener('mousemove', onMouseMove);
    panel.addEventListener('mouseleave', onMouseLeave);
    return () => {
      panel.removeEventListener('mousemove', onMouseMove);
      panel.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  // Update SVG traces in real-time
  useEffect(() => {
    let active = true;

    const updateTraces = () => {
      if (!active) return;

      const parent = parentRef.current;
      const hub = hubRef.current;
      if (parent && hub) {
        const parentRect = parent.getBoundingClientRect();
        const hubRect = hub.getBoundingClientRect();
        const hubX = hubRect.left - parentRect.left + hubRect.width / 2;
        const hubY = hubRect.top - parentRect.top + hubRect.height / 2;

        badges.forEach((badge, idx) => {
          const el = badgesRef.current[idx];
          const pathEl = linesRef.current[idx];
          const flowEl = flowLinesRef.current[idx];
          if (el && (pathEl || flowEl)) {
            const elRect = el.getBoundingClientRect();
            const elX = elRect.left - parentRect.left + elRect.width / 2;
            const elY = elRect.top - parentRect.top + elRect.height / 2;

            // Draw a PCB trace: from center, horizontal, then vertical, then horizontal to badge
            const dx = elX - hubX;
            const midX = hubX + dx * 0.4;

            // Path: start at hub, go horizontally to midX, then vertically to badge Y, then horizontally to badge X
            const pathData = `M ${hubX} ${hubY} L ${midX} ${hubY} L ${midX} ${elY} L ${elX} ${elY}`;
            
            if (pathEl) pathEl.setAttribute('d', pathData);
            if (flowEl) flowEl.setAttribute('d', pathData);
          }
        });
      }

      requestAnimationFrame(updateTraces);
    };

    requestAnimationFrame(updateTraces);

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="h-full flex-1 flex relative" style={{ background: 'var(--abyss-ink)', fontFamily: 'var(--font-ui)' }}>
      {/* Top Right Back Button */}
      <Link 
        to="/" 
        className="absolute top-6 right-8 p-2.5 rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all duration-300 z-50 flex items-center justify-center group"
        title="Back to Home"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      </Link>

      {/* Left - Illustration / Brand with CAD grid background */}
      <div 
        ref={leftPanelRef}
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden" 
        style={{ 
          background: 'var(--abyss-ink)', 
          backgroundImage: 'radial-gradient(rgba(212, 175, 55, 0.08) 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
          borderRight: '1px solid rgba(255,255,255,0.06)' 
        }}
      >
        <Link to="/" className="flex items-center gap-3 z-20">
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'var(--meridian-gold)' }}>
            <span className="text-xs font-bold" style={{ color: 'var(--abyss-ink)', fontFamily: 'var(--font-mono)' }}>T</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white text-sm font-semibold">Ask</span>
            <span className="text-xs" style={{ color: 'var(--meridian-gold)', letterSpacing: '0.12em' }}>TAPEITOUT</span>
          </div>
        </Link>

        {/* Interactive Parallax Visualization */}
        <div ref={parentRef} className="flex-1 flex items-center justify-center relative select-none">
          {/* SVG Canvas for PCB Traces */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {badges.map((badge, idx) => (
              <g key={badge.label}>
                {/* Background static trace */}
                <path
                  ref={el => (linesRef.current[idx] = el)}
                  fill="none"
                  stroke="rgba(212, 175, 55, 0.1)"
                  strokeWidth="1.5"
                />
                {/* Flowing animated signal trace */}
                <path
                  ref={el => (flowLinesRef.current[idx] = el)}
                  fill="none"
                  stroke={`url(#gradient-${idx})`}
                  strokeWidth="1.5"
                  className="animate-trace-flow"
                />
                <defs>
                  <linearGradient id={`gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.1" />
                    <stop offset="50%" stopColor={badge.color} stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </g>
            ))}
          </svg>

          {/* Central Area with concentric radar circles */}
          <div className="absolute w-72 h-72 rounded-full border border-[#D4AF37]/5 pointer-events-none z-0 flex items-center justify-center">
            <div className="absolute w-56 h-56 rounded-full border border-[#D4AF37]/5 pointer-events-none" />
            <div className="absolute w-36 h-36 rounded-full border border-[#D4AF37]/10 pointer-events-none" />
          </div>

          <div className="relative w-full max-w-md h-96 flex items-center justify-center z-10">
            {/* Background ambient light */}
            <div className="absolute w-64 h-64 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />

            {/* Central Graphic (Silicon Die Processor Hub) */}
            <div ref={hubRef} className="absolute z-10 animate-float-1">
              <ProcessorHub />
            </div>

            {/* Floating Badges */}
            {badges.map((badge, idx) => (
              <div
                key={badge.label}
                ref={el => (badgesRef.current[idx] = el)}
                className="absolute"
                style={badge.position}
              >
                {/* Nested container: inner handles float animation, outer handles GSAP parallax */}
                <div 
                  className={`px-3 py-1.5 rounded-lg border shadow-lg cursor-default flex flex-col gap-0.5 animate-float-${(idx % 3) + 1}`}
                  style={{
                    borderColor: `${badge.color}35`,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    boxShadow: `0 4px 24px ${badge.color}08`
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: badge.color }} />
                    <span className="font-mono text-[9px] uppercase tracking-wider text-white/50">{badge.label}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold" style={{ color: badge.color }}>{badge.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="z-20">
          <blockquote style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.0625rem', color: 'rgba(243,242,237,0.65)', lineHeight: 1.7 }}>
            "Routing a chip shouldn't feel like being lost in the dark."
          </blockquote>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-1 h-8 rounded-full" style={{ background: 'var(--meridian-gold)' }} />
            <div>
              <p className="text-xs font-semibold text-white">TapeItOut Brand Promise</p>
              <p className="text-xs" style={{ color: 'rgba(243,242,237,0.35)' }}>ask.tapeitout.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-6 overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'var(--meridian-gold)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--abyss-ink)', fontFamily: 'var(--font-mono)' }}>T</span>
            </div>
            <span className="text-white font-semibold">Ask TapeItOut</span>
          </Link>

          <div className="mb-8">
            <h1 
              data-split="true"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}
            >
              {mode === 'login' ? 'Welcome back.' : mode === 'signup' ? 'Start mapping.' : 'Reset Password'}
            </h1>
            <p style={{ color: 'rgba(243,242,237,0.5)', fontSize: '0.9375rem' }}>
              {mode === 'login' ? 'Sign in to your TapeItOut account.' : mode === 'signup' ? 'Create your free account. No credit card required.' : 'Enter your email to receive a password reset link.'}
            </p>
          </div>

          {/* OAuth - hide in forgot password mode */}
          {mode !== 'forgot' && (
            <>
              <div className="space-y-3 mb-6">
                <button 
                  onClick={() => handleOAuthSignIn('github')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }}
                >
                  <Github className="w-4 h-4" />
                  Continue with GitHub
                </button>
                <button 
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(243,242,237,0.7)' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <span className="text-xs" style={{ color: 'rgba(243,242,237,0.3)' }}>or</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </div>
            </>
          )}

          {/* Email Form */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-lg p-3 mb-4 font-mono">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs rounded-lg p-3 mb-4 font-mono">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(243,242,237,0.6)' }}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'var(--font-ui)' }}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(243,242,237,0.6)' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'var(--font-ui)' }}
              />
            </div>
            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(243,242,237,0.6)' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'var(--font-ui)' }}
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs hover:text-[#D4AF37] transition-colors cursor-pointer"
                  style={{ color: 'rgba(243,242,237,0.4)', background: 'none', border: 'none', padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: 'var(--meridian-gold)', color: 'var(--abyss-ink)' }}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {mode === 'forgot' ? (
            <p className="text-center mt-6 text-sm" style={{ color: 'rgba(243,242,237,0.4)' }}>
              Remember your password?{' '}
              <button
                onClick={() => setMode('login')}
                className="font-medium hover:underline cursor-pointer"
                style={{ color: 'var(--meridian-gold)', background: 'none', border: 'none', padding: 0 }}
              >
                Sign in
              </button>
            </p>
          ) : (
            <p className="text-center mt-6 text-sm" style={{ color: 'rgba(243,242,237,0.4)' }}>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="font-medium hover:underline cursor-pointer"
                style={{ color: 'var(--meridian-gold)', background: 'none', border: 'none', padding: 0 }}
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p className="text-center mt-4 text-xs" style={{ color: 'rgba(243,242,237,0.25)' }}>
              By creating an account, you agree to our{' '}
              <a href="#" style={{ color: 'rgba(243,242,237,0.4)' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" style={{ color: 'rgba(243,242,237,0.4)' }}>Privacy Policy</a>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
