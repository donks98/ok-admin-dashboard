'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, CreditCard, ArrowDownUp,
  Store, FlaskConical, LogOut,
} from 'lucide-react';
import { logout } from '@/lib/api';
import { getRole, getAdminName, ROLE_META, type AdminRole, ROLE_PAGES } from '@/lib/auth';

const ALL_NAV = [
  { href: '/',             label: 'Overview',      icon: LayoutDashboard },
  { href: '/users',        label: 'Users',         icon: Users           },
  { href: '/credit',       label: 'Credit & Debt', icon: CreditCard      },
  { href: '/direct-debit', label: 'Direct Debits', icon: ArrowDownUp     },
  { href: '/stores',       label: 'Store Revenue', icon: Store           },
  { href: '/sandbox',      label: 'Sandbox',       icon: FlaskConical    },
];

export default function Sidebar() {
  const path = usePathname();
  const [role, setRole]     = useState<AdminRole>('VIEWER');
  const [name, setName]     = useState('Admin');

  useEffect(() => {
    setRole(getRole());
    setName(getAdminName());
  }, []);

  const allowedPages = ROLE_PAGES[role] ?? ['/'];
  const nav = ALL_NAV.filter(({ href }) =>
    allowedPages.some(p => p === href)
  );

  const meta = ROLE_META[role];

  return (
    <aside
      className="fixed inset-y-0 left-0 w-64 flex flex-col z-30"
      style={{
        background: 'linear-gradient(180deg, #0C0C14 0%, #0F1020 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-[18px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="relative shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm select-none"
            style={{
              background: 'linear-gradient(135deg, #CC0000 0%, #8B0000 100%)',
              boxShadow: '0 4px 14px rgba(204,0,0,0.5)',
            }}
          >
            OK
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2"
            style={{ borderColor: '#0C0C14', boxShadow: '0 0 0 2px rgba(74,222,128,0.3)' }} />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">OK Zimbabwe</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Admin Console</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="mx-3 mt-3 px-3 py-2 rounded-xl flex items-center gap-2.5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
          style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}99)` }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[12px] font-semibold truncate leading-tight">{name}</p>
          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
            style={{ background: meta.bg, color: meta.color }}>
            {meta.label}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] px-3 mb-3"
          style={{ color: 'rgba(255,255,255,0.2)' }}>
          Navigation
        </p>
        <div className="space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = path === href || (href !== '/' && path.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                  ${active ? 'text-white' : 'hover:text-white/80'}`}
                style={{
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.42)',
                  backgroundColor: active ? 'rgba(204,0,0,0.18)' : 'transparent',
                  boxShadow: active ? 'inset 0 0 0 1px rgba(204,0,0,0.25)' : 'none',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
                  style={{ backgroundColor: active ? 'rgba(204,0,0,0.25)' : 'rgba(255,255,255,0.06)' }}
                >
                  <Icon
                    size={15}
                    strokeWidth={active ? 2.5 : 2}
                    style={{ color: active ? '#FF8080' : 'rgba(255,255,255,0.45)' }}
                  />
                </div>
                <span className="flex-1">{label}</span>
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FF6666' }} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2 px-3 py-2 mb-1">
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px rgba(74,222,128,0.6)' }} />
            <div className="absolute w-4 h-4 rounded-full bg-green-400/20 animate-ping" />
          </div>
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>All systems operational</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
          style={{ color: 'rgba(255,255,255,0.38)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)';
            e.currentTarget.style.color = '#FCA5A5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.38)';
          }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <LogOut size={14} />
          </div>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
