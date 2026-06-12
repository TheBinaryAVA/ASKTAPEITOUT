import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Learn', href: '/learn' },
  { label: 'Errors', href: '/errors' },
  { label: 'Atlas', href: '/atlas-platform' },
  { label: 'Docs', href: '/docs' },
  { label: 'Community', href: '/community' },
  { label: 'Pricing', href: '/pricing' },
];

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.08)',
        boxShadow: '0 4px 30px rgba(15, 23, 42, 0.15)',
        fontFamily: 'var(--font-ui)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: 'var(--meridian-gold)' }}
            >
              <span className="text-xs font-bold" style={{ color: 'var(--abyss-ink)', fontFamily: 'var(--font-mono)' }}>T</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white text-sm font-semibold tracking-wide">Ask</span>
              <span className="text-xs font-medium" style={{ color: 'var(--meridian-gold)', letterSpacing: '0.12em' }}>TAPEITOUT</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-2 text-sm rounded transition-colors"
                style={{
                  color: location.pathname === link.href ? 'var(--meridian-gold)' : 'rgba(243,242,237,0.7)',
                  fontWeight: location.pathname === link.href ? '500' : '400',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(243,242,237,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
              <kbd className="ml-2 px-1.5 py-0.5 text-xs rounded" style={{ background: 'rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)' }}>⌘K</kbd>
            </button>

            {isAuthenticated && user ? (
              <>
                <span className="hidden lg:inline text-xs font-mono text-white/50 px-2 select-none truncate max-w-[120px]" title={user.email}>
                  {user.email}
                </span>
                <Link
                  to="/atlas"
                  className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-medium transition-all"
                  style={{
                    background: 'var(--meridian-gold)',
                    color: 'var(--abyss-ink)',
                  }}
                >
                  Workspace
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden md:block text-sm px-4 py-1.5 rounded transition-colors hover:text-red-400 cursor-pointer"
                  style={{ color: 'rgba(243,242,237,0.7)' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:block text-sm px-4 py-1.5 rounded transition-colors"
                  style={{ color: 'rgba(243,242,237,0.7)' }}
                >
                  Sign In
                </Link>

                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-medium transition-all"
                  style={{
                    background: 'var(--meridian-gold)',
                    color: 'var(--abyss-ink)',
                  }}
                >
                  Start Routing
                </Link>
              </>
            )}

            <button
              className="md:hidden p-2 rounded"
              style={{ color: 'rgba(243,242,237,0.7)' }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Dropdown */}
        {searchOpen && (
          <div className="border-t py-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(243,242,237,0.4)' }} />
              <input
                autoFocus
                type="text"
                placeholder="Search errors, questions, documentation..."
                className="w-full pl-10 pr-4 py-2.5 rounded text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--canvas-bone)',
                  fontFamily: 'var(--font-ui)',
                }}
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t py-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-2 py-2.5 text-sm"
                style={{ color: 'rgba(243,242,237,0.7)' }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t flex flex-col gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {isAuthenticated && user ? (
                <>
                  <div className="px-2 py-1.5 text-xs font-mono text-white/50 truncate">
                    {user.email}
                  </div>
                  <Link
                    to="/atlas"
                    className="px-4 py-2 rounded text-sm font-medium text-center"
                    style={{ background: 'var(--meridian-gold)', color: 'var(--abyss-ink)' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Go to Workspace
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMenuOpen(false);
                    }}
                    className="text-left text-sm px-2 py-2 text-red-400 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm px-2 py-2"
                    style={{ color: 'rgba(243,242,237,0.7)' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded text-sm font-medium text-center"
                    style={{ background: 'var(--meridian-gold)', color: 'var(--abyss-ink)' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Start Routing
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
