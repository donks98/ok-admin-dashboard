'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Shield } from 'lucide-react';

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
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(
      new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pageName = PAGE_NAMES[pathname] ?? 'Dashboard';

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
                style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)', boxShadow: '0 2px 8px rgba(204,0,0,0.35)' }}
              >
                A
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>Administrator</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Shield size={9} style={{ color: '#CC0000' }} strokeWidth={2.5} />
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Full Access</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Content ──────────────────────────────────── */}
        <main className="flex-1 p-8" style={{ background: 'var(--surface-2)' }}>
          <div className="max-w-screen-2xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
