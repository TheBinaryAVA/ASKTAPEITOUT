import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowRight, Loader, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if we have an active session (Supabase automatically logs in the user temporarily from the email link)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Your password reset session has expired or is invalid. Please request a new reset link.');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess('Your password has been successfully reset! You can now log in.');
      setPassword('');
      setConfirmPassword('');
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative" style={{ background: 'var(--abyss-ink)', fontFamily: 'var(--font-ui)' }}>
      {/* Top Right Back Button */}
      <Link 
        to="/login" 
        className="absolute top-6 right-8 p-2.5 rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all duration-300 z-50 flex items-center justify-center group"
        title="Back to Sign In"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      </Link>

      {/* Decorative ambient background light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-4" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <Lock className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Set New Password
          </h1>
          <p style={{ color: 'rgba(243,242,237,0.5)', fontSize: '0.9375rem' }}>
            Please enter and confirm your new secure password.
          </p>
        </div>

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
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(243,242,237,0.6)' }}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading || !!success}
              className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'var(--font-ui)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(243,242,237,0.6)' }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading || !!success}
              className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'var(--font-ui)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ background: 'var(--meridian-gold)', color: 'var(--abyss-ink)' }}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Updating password...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'rgba(243,242,237,0.4)' }}>
          Back to{' '}
          <Link
            to="/login"
            className="font-medium hover:underline"
            style={{ color: 'var(--meridian-gold)' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
