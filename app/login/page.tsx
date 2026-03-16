'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Zap, TrendingUp, Eye, EyeOff } from 'lucide-react';

const FEATURES = [
  { icon: ShieldCheck, text: 'End-to-end encrypted civil servant data' },
  { icon: Zap,         text: 'Real-time salary deduction processing'   },
  { icon: TrendingUp,  text: 'Live credit utilisation analytics'        },
];

function LoginForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Invalid credentials');
        return;
      }
      const { accessToken, role, name } = await res.json();
      localStorage.setItem('admin_token', accessToken);
      localStorage.setItem('admin_role', role ?? 'VIEWER');
      localStorage.setItem('admin_name', name ?? username);
      document.cookie = `admin_token=${accessToken}; path=/; max-age=86400; SameSite=Strict`;
      const from = params.get('from') || '/';
      router.push(from);
      router.refresh();
    } catch {
      setError('Network error — is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── Left panel (brand) ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #8B0000 0%, #CC0000 45%, #AA0000 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #FFFFFF 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #FFFFFF 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #FFFFFF 0%, transparent 60%)' }} />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center font-black text-white text-base">
            OK
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">OK Zimbabwe</p>
            <p className="text-white/50 text-xs">Civil Servant Credit Programme</p>
          </div>
        </div>

        {/* Middle: Headline */}
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-[1.1] mb-5 tracking-tight">
            Manage the nation&apos;s<br />credit programme
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-10 max-w-sm">
            Monitor civil servant wallets, track salary deductions, and oversee store revenue across Zimbabwe.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/12 border border-white/15 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-white/80" strokeWidth={2} />
                </div>
                <span className="text-white/70 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Stats strip */}
        <div className="relative z-10 flex items-center gap-8 pt-8 border-t border-white/10">
          {[
            { label: 'Civil Servants', value: '50K+' },
            { label: 'OK Stores',      value: '65'    },
            { label: 'Uptime',         value: '99.9%' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-white text-xl font-black">{value}</p>
              <p className="text-white/45 text-[11px] font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel (form) ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12" style={{ background: '#F4F6FA' }}>
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)' }}>OK</div>
            <p className="text-gray-900 font-bold text-sm">OK Zimbabwe Admin</p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome back</h1>
            <p className="text-sm text-gray-400 mt-1.5">Sign in to the admin console</p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder="admin"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300
                    outline-none transition-all duration-150
                    focus:bg-white focus:border-red-400 focus:ring-3 focus:ring-red-100"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900
                      outline-none transition-all duration-150
                      focus:bg-white focus:border-red-400 focus:ring-3 focus:ring-red-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white text-sm font-bold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading ? '#CC0000' : 'linear-gradient(135deg, #CC0000 0%, #990000 100%)',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(204,0,0,0.35)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(204,0,0,0.5)';
                }}
                onMouseLeave={(e) => {
                  if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(204,0,0,0.35)';
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            <ShieldCheck size={12} className="text-gray-300" />
            <p className="text-[11px] text-gray-300">
              Protected · OK Zimbabwe Internal System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
