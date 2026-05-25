import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { verifyAdminLogin, setAdminSession, isAdminAuthenticated } from '@/lib/store';

// ─── Floating Label Input ────────────────────────────────────────────────────

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  suffix?: React.ReactNode;
}

function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  autoFocus,
  suffix,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0;

  return (
    <div className="relative group">
      <input
        id={id}
        type={type}
        value={value}
        autoFocus={autoFocus}
        autoComplete={type === 'password' ? 'current-password' : 'username'}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={[
          'peer w-full rounded-xl border bg-white/[0.04] px-4 pt-6 pb-2 text-sm text-white/90',
          'outline-none transition-all duration-300 placeholder-transparent',
          focused
            ? 'border-blue-500/60 ring-1 ring-blue-500/20 bg-white/[0.06]'
            : 'border-white/[0.08] hover:border-white/[0.14]',
          suffix ? 'pr-12' : '',
        ].join(' ')}
        placeholder={label}
      />
      <label
        htmlFor={id}
        className={[
          'absolute left-4 transition-all duration-300 pointer-events-none select-none',
          raised
            ? 'top-2 text-[10px] font-medium tracking-wider uppercase'
            : 'top-1/2 -translate-y-1/2 text-sm',
          focused ? 'text-blue-400' : 'text-white/40',
        ].join(' ')}
      >
        {label}
      </label>
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {suffix}
        </div>
      )}
    </div>
  );
}

// ─── Keyframes injected once ─────────────────────────────────────────────────

const gradientCSS = `
@keyframes pkgGradientShift {
  0%   { background-position: 0% 50%; }
  25%  { background-position: 50% 100%; }
  50%  { background-position: 100% 50%; }
  75%  { background-position: 50% 0%; }
  100% { background-position: 0% 50%; }
}
@keyframes pkgPulseRing {
  0%   { transform: scale(0.85); opacity: 0.45; }
  50%  { transform: scale(1.15); opacity: 0.12; }
  100% { transform: scale(0.85); opacity: 0.45; }
}
`;

// ─── Login Page ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // Inject CSS keyframes once
  useEffect(() => {
    if (!styleRef.current) {
      const style = document.createElement('style');
      style.textContent = gradientCSS;
      document.head.appendChild(style);
      styleRef.current = style;
    }
    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      setShakeKey((k) => k + 1);
      return;
    }

    setLoading(true);
    setError('');

    // Simulate network delay for UX
    await new Promise((r) => setTimeout(r, 800));

    if (verifyAdminLogin(username.trim(), password)) {
      setAdminSession(true);
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Invalid username or password.');
      setShakeKey((k) => k + 1);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 120% 80% at 20% 60%, rgba(59,130,246,0.12) 0%, transparent 50%),' +
          'radial-gradient(ellipse 100% 70% at 80% 30%, rgba(99,102,241,0.10) 0%, transparent 50%),' +
          'radial-gradient(ellipse 90% 90% at 50% 80%, rgba(168,85,247,0.08) 0%, transparent 50%),' +
          '#030303',
        backgroundSize: '200% 200%',
        animation: 'pkgGradientShift 16s ease infinite',
      }}
    >
      {/* Subtle floating orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          top: '10%',
          left: '15%',
          animation: 'pkgPulseRing 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)',
          bottom: '5%',
          right: '10%',
          animation: 'pkgPulseRing 10s ease-in-out infinite 2s',
        }}
      />

      {/* Login Card */}
      <motion.div
        key={shakeKey}
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={
          error && shakeKey > 0
            ? {
                opacity: 1,
                scale: 1,
                y: 0,
                x: [0, -12, 12, -8, 8, -4, 4, 0],
              }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={
          error && shakeKey > 0
            ? { duration: 0.5, x: { duration: 0.5 } }
            : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="rounded-2xl border border-white/[0.06] p-8 sm:p-10"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.04) inset,' +
              '0 24px 48px -12px rgba(0,0,0,0.5),' +
              '0 0 80px -20px rgba(59,130,246,0.06)',
          }}
        >
          {/* Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-8 h-8 text-white" strokeWidth={1.8} />
              </div>
              <div
                className="absolute -inset-2 rounded-2xl opacity-30"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(168,85,247,0.3))',
                  filter: 'blur(12px)',
                  zIndex: -1,
                }}
              />
            </div>
            <h1
              className="text-2xl font-bold tracking-tight text-white"
              style={{ fontFamily: "'Outfit', 'Inter', system-ui" }}
            >
              PKG Shop
            </h1>
            <p className="text-xs tracking-[0.25em] uppercase text-white/30 mt-1 font-medium">
              Admin Dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <FloatingInput
              id="admin-username"
              label="Username"
              value={username}
              onChange={setUsername}
              autoFocus
            />

            <FloatingInput
              id="admin-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              suffix={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  className="p-1 rounded-lg text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-2 text-red-400 text-sm overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={[
                'w-full relative rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-300',
                'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600',
                'hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500',
                'text-white shadow-lg shadow-blue-500/20',
                'active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303]',
              ].join(' ')}
            >
              <span
                className={[
                  'flex items-center justify-center gap-2 transition-opacity duration-200',
                  loading ? 'opacity-0' : 'opacity-100',
                ].join(' ')}
              >
                Sign In
              </span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[11px] text-white/20 mt-8">
            Secure admin access · PKG Shop © {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
