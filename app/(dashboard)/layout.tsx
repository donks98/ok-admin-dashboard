'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { getRole, getAdminName, ROLE_META, canAccess, type AdminRole } from '@/lib/auth';

const PAGE_NAMES: Record<string, string> = {
  '/':             'Overview',
  '/users':        'User Management',
  '/credit':       'Credit & Debt',
  '/direct-debit': 'Direct Debits',
  '/stores':       'Store Revenue',
  '/sandbox':      'Sandbox',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [time, setTime]     = useState('');
  const [role, setRole]     = useState<AdminRole>('VIEWER');
  const [name, setName]     = useState('Admin');
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    const r = getRole();
    const n = getAdminName();
    setRole(r);
    setName(n);

    // Route guard — redirect to overview if role can't access this page
    if (!canAccess(r, pathname)) {
      router.replace('/');
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  useEffect(() => {
    const tick = () => setTime(
      new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pageName = PAGE_NAMES[pathname] ?? 'Dashboard';
  const meta = ROLE_META[role];

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* ── Top Bar ───────────────────────────────────────── */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-8"
          style={{
            height: 56,
            background: 'rgba(244,246,250,0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium" style={{ color: 'var(--text-tertiary)' }}>OK Zimbabwe</span>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pageName}</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-5">
            {/* Live clock */}
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"
                style={{ boxShadow: '0 0 6px rgba(74,222,128,0.7)' }} />
              <span className="text-[11px] font-mono tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                {time}
              </span>
            </div>

            <div className="w-px h-5 bg-gray-200" />

            {/* Admin profile */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}99)`, boxShadow: `0 2px 8px ${meta.color}55` }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</span>
                <span className="text-[10px] font-bold mt-0.5" style={{ color: meta.color }}>
                  {meta.label}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Content ──────────────────────────────────── */}
        <main className="flex-1 p-8" style={{ background: 'var(--surface-2)' }}>
          <div className="max-w-screen-2xl">
            {ready ? children : (
              <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-red-500 animate-spin" />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
