'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Activity, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function authHeader(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('platform_token') : '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path: string) {
  const res = await fetch(path, { headers: authHeader() });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function StatCard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <div className="rounded-xl p-4" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-xl font-black text-white font-mono">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{title}</p>
      {sub && <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>{sub}</p>}
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {text}
    </span>
  );
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN_SUCCESS: '#10B981',      LOGIN_FAILED: '#EF4444',
  ADMIN_LOGIN: '#10B981',        ADMIN_LOGIN_SUCCESS: '#10B981',  ADMIN_LOGIN_FAILED: '#EF4444',
  REGISTERED: '#6366F1',         OTP_VERIFIED: '#6366F1',
  PIN_CHANGED: '#F59E0B',        PIN_RESET: '#F59E0B',
  PAYMENT_APPROVED: '#10B981',   PAYMENT_INITIATED: '#0EA5E9',
  PAYMENT_DECLINED: '#EF4444',   DISPUTE_RAISED: '#F59E0B',
  DIRECT_DEBIT_SETUP: '#8B5CF6', SCHEDULE_CREATED: '#8B5CF6',
  SALARY_RECEIVED: '#10B981',    SALARY_WEBHOOK_RECEIVED: '#10B981',
  DEDUCTION_SUCCESS: '#10B981',  DEDUCTION_FAILED: '#EF4444',
  ADMIN_REGISTERED_CIVIL_SERVANT: '#6366F1',
  ID_VERIFICATION_STARTED: '#0EA5E9', EMP_VERIFICATION_STARTED: '#0EA5E9',
  BALANCE_CHECKED: '#475569',    QR_GENERATED: '#475569',
  FAMILY_MEMBER_ADDED: '#8B5CF6', FAMILY_MEMBER_REMOVED: '#EF4444',
  CREDIT_REQUEST_SUBMITTED: '#F59E0B',
  ADMIN_VIEWED_OVERVIEW: '#475569',    ADMIN_VIEWED_USERS: '#475569',
  ADMIN_VIEWED_USER_STATS: '#475569',  ADMIN_VIEWED_USER_DETAIL: '#475569',
  ADMIN_VIEWED_CREDIT: '#475569',      ADMIN_VIEWED_DIRECT_DEBIT: '#475569',
  ADMIN_VIEWED_STORES: '#475569',      ADMIN_EXPORTED_REPORT: '#F59E0B',
};

export default function PlatformPage() {
  const [revenue, setRevenue]   = useState<any>(null);
  const [stats, setStats]       = useState<any>(null);
  const [auditLogs, setAudit]   = useState<any>({ data: [], total: 0, pages: 1 });
  const [errorLogs, setErrors]  = useState<any>({ data: [], total: 0, pages: 1 });
  const [auditPage, setAuditPage] = useState(1);
  const [errorPage, setErrorPage] = useState(1);
  const [tab, setTab]           = useState<'audit' | 'errors'>('audit');
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [rev, st, audit, err] = await Promise.all([
      fetch('/api/platform/revenue').then(r => r.json()).catch(() => null),
      fetch('/api/platform/stats').then(r => r.json()).catch(() => null),
      fetch(`/api/platform/audit-logs?page=${auditPage}&limit=20`).then(r => r.json()).catch(() => null),
      fetch(`/api/platform/error-logs?page=${errorPage}&limit=20`).then(r => r.json()).catch(() => null),
    ]);
    if (rev)   setRevenue(rev);
    if (st)    setStats(st);
    if (audit) setAudit(audit);
    if (err)   setErrors(err);
    setLoading(false);
  }, [auditPage, errorPage]);

  useEffect(() => { load(); }, [load]);

  const fmt = (n: number) => `$${Number(n ?? 0).toFixed(4)}`;
  const fmtUSD = (n: number) => `$${Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Platform Revenue & Logs</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>1% fee on all civil servant transactions</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all disabled:opacity-50"
          style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)' }}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Revenue stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Earned (All Time)" value={fmt(revenue?.totalFeeAllTime)} sub={`from ${fmtUSD(revenue?.totalVolumeAllTime ?? 0)} volume`} icon={DollarSign} color="#10B981" />
        <StatCard title="This Month" value={fmt(revenue?.thisMonthFee)} sub={`${revenue?.thisMonthTxns ?? 0} transactions`} icon={TrendingUp} color="#6366F1" />
        <StatCard title="System Errors (24h)" value={stats?.recentErrors ?? 0} sub={`${stats?.totalErrors ?? 0} total`} icon={AlertTriangle} color="#EF4444" />
        <StatCard title="Audit Events" value={stats?.totalAudit ?? 0} sub="all time" icon={Activity} color="#F59E0B" />
      </div>

      {/* Revenue chart */}
      {revenue?.monthlyBreakdown?.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Monthly Fee Revenue</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={revenue.monthlyBreakdown}>
              <defs>
                <linearGradient id="fee" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)' }} itemStyle={{ color: '#818CF8' }}
                formatter={(v: any) => [`$${Number(v).toFixed(4)}`, 'Fee']} />
              <Area type="monotone" dataKey="fee" stroke="#6366F1" fill="url(#fee)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs: Audit / Errors */}
      <div>
        <div className="flex gap-1 mb-4">
          {(['audit', 'errors'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all"
              style={{
                background: tab === t ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: tab === t ? '#818CF8' : 'rgba(255,255,255,0.3)',
                border: tab === t ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              }}>
              {t === 'audit' ? `Audit Logs (${auditLogs.total})` : `Error Logs (${errorLogs.total})`}
            </button>
          ))}
        </div>

        {/* Audit Logs */}
        {tab === 'audit' && (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ background: '#13131f', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Time', 'Action', 'Resource', 'User', 'IP'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditLogs.data.map((log: any, i: number) => (
                  <tr key={log.id} style={{ background: i % 2 === 0 ? '#0D0D1A' : '#10101C', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="px-4 py-2.5 font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge text={log.action} color={ACTION_COLORS[log.action] ?? '#6366F1'} />
                    </td>
                    <td className="px-4 py-2.5 font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{log.resource}</td>
                    <td className="px-4 py-2.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {log.user ? `${log.user.name} (${log.user.employeeId})` : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                    </td>
                    <td className="px-4 py-2.5 font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>{log.ipAddress ?? '—'}</td>
                  </tr>
                ))}
                {auditLogs.data.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>No audit events yet</td></tr>
                )}
              </tbody>
            </table>
            <Pagination page={auditPage} pages={auditLogs.pages} onChange={setAuditPage} />
          </div>
        )}

        {/* Error Logs */}
        {tab === 'errors' && (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ background: '#13131f', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Time', 'Status', 'Method', 'Path', 'Message'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {errorLogs.data.map((log: any, i: number) => (
                  <tr key={log.id} style={{ background: i % 2 === 0 ? '#0D0D1A' : '#10101C', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="px-4 py-2.5 font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge text={String(log.statusCode)} color={log.statusCode >= 500 ? '#EF4444' : '#F59E0B'} />
                    </td>
                    <td className="px-4 py-2.5 font-mono font-bold" style={{ color: '#818CF8' }}>{log.method}</td>
                    <td className="px-4 py-2.5 font-mono max-w-[200px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{log.path}</td>
                    <td className="px-4 py-2.5 max-w-[300px] truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{log.message}</td>
                  </tr>
                ))}
                {errorLogs.data.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>No errors recorded — all good!</td></tr>
                )}
              </tbody>
            </table>
            <Pagination page={errorPage} pages={errorLogs.pages} onChange={setErrorPage} />
          </div>
        )}
      </div>
    </div>
  );
}

function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ background: '#13131f', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Page {page} of {pages}</span>
      <div className="flex gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}
          className="p-1.5 rounded-lg disabled:opacity-30 transition-all hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ChevronLeft size={14} />
        </button>
        <button disabled={page >= pages} onClick={() => onChange(page + 1)}
          className="p-1.5 rounded-lg disabled:opacity-30 transition-all hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
