export type AdminRole = 'SUPER_ADMIN' | 'FINANCE' | 'HR' | 'VIEWER';

export const ROLE_PAGES: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ['/', '/users', '/credit', '/direct-debit', '/stores', '/reports', '/sandbox'],
  FINANCE:     ['/', '/credit', '/direct-debit', '/stores', '/reports'],
  HR:          ['/', '/users'],
  VIEWER:      ['/'],
};

export const ROLE_META: Record<AdminRole, { label: string; color: string; bg: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: '#CC0000', bg: 'rgba(204,0,0,0.12)' },
  FINANCE:     { label: 'Finance',     color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)' },
  HR:          { label: 'HR',          color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  VIEWER:      { label: 'Viewer',      color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

export function getRole(): AdminRole {
  if (typeof window === 'undefined') return 'VIEWER';
  return (localStorage.getItem('admin_role') as AdminRole) ?? 'VIEWER';
}

export function getAdminName(): string {
  if (typeof window === 'undefined') return 'Admin';
  return localStorage.getItem('admin_name') ?? 'Admin';
}

export function canAccess(role: AdminRole, path: string): boolean {
  const pages = ROLE_PAGES[role] ?? ['/'];
  return pages.some(p => p === path || (p !== '/' && path.startsWith(p)));
}
