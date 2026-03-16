'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Terminal, LogOut } from 'lucide-react';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/platform/login') return;
    const token = localStorage.getItem('platform_token');
    if (!token) router.replace('/platform/login');
  }, [pathname, router]);

  function logout() {
    localStorage.removeItem('platform_token');
    document.cookie = 'platform_token=; path=/; max-age=0';
    router.push('/platform/login');
  }

  if (pathname === '/platform/login') return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0F', color: 'white' }}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 sticky top-0 z-10"
        style={{ background: '#0D0D1A', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <Terminal size={16} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">OK Zimbabwe</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)' }}>
            DEVELOPER PORTAL
          </span>
        </div>
        <button onClick={logout}
          className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg transition-all"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#FCA5A5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}>
          <LogOut size={13} /> Sign Out
        </button>
      </header>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
