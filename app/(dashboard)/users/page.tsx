'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search, RefreshCw, Download, X, ChevronRight,
  User, CreditCard, ShieldCheck, Banknote, ArrowDownUp,
  CheckCircle2, XCircle, Clock, Building2, Phone, Mail,
  Hash, Calendar, DollarSign, AlertTriangle,
} from 'lucide-react';
import { api, type UsersData, type UserRow, type UserDetail } from '@/lib/api';
import { fmtUSD, fmtPct, fmtDate, fmtDateTime, utilizationColor, statusColor } from '@/lib/format';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import { Users, CheckCircle2 as CheckIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const MINISTRIES = [
  'Ministry of Education','Ministry of Health','Ministry of Finance',
  'Ministry of Home Affairs','Ministry of Agriculture','Ministry of Transport',
  'Ministry of Information','Ministry of Foreign Affairs','Ministry of Justice',
];
const PIE_COLORS = ['#CC0000','#3B82F6','#00843D','#F59E0B','#8B5CF6','#14B8A6','#F97316','#EC4899','#6366F1'];

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User        },
  { id: 'wallet',        label: 'Wallet',        icon: CreditCard  },
  { id: 'verification',  label: 'Verification',  icon: ShieldCheck },
  { id: 'payment',       label: 'Payment',       icon: Banknote    },
  { id: 'transactions',  label: 'Transactions',  icon: ArrowDownUp },
] as const;
type TabId = typeof TABS[number]['id'];

export default function UsersPage() {
  const [data, setData]             = useState<UsersData | null>(null);
  const [search, setSearch]         = useState('');
  const [ministry, setMinistry]     = useState('');
  const [verified, setVerified]     = useState('');
  const [page, setPage]             = useState(1);
  const [perPage, setPerPage]       = useState(25);
  const [loading, setLoading]       = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stats, setStats]           = useState<{
    total: number; verified: number; pending: number;
    byMinistry: { ministry: string; count: number }[];
  } | null>(null);

  const doFetch = useCallback(() => {
    setLoading(true);
    api.users({ page, limit: perPage, search: search || undefined, ministry: ministry || undefined, verified: verified || undefined })
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, perPage, search, ministry, verified]);

  useEffect(() => { doFetch(); }, [doFetch]);
  useEffect(() => { api.userStats().then(setStats).catch(() => {}); }, []);

  function downloadCSV() {
    if (!data) return;
    const rows = [
      ['Name','Employee ID','National ID','Ministry','Department','Salary','Credit Limit','Amount Owed','Utilisation','Verified','Joined'].join(','),
      ...data.data.map((u) => [
        `"${u.name}"`, u.employeeId, u.nationalId, `"${u.ministry}"`, `"${u.department}"`,
        u.monthlySalary.toFixed(2),
        u.wallet?.creditLimit.toFixed(2) ?? '',
        u.wallet?.amountUsed.toFixed(2) ?? '',
        u.wallet?.utilizationPct.toFixed(1) ?? '',
        u.isVerified ? 'Yes' : 'No',
        fmtDate(u.createdAt),
      ].join(',')),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rows], { type: 'text/csv' }));
    a.download = `ok-users-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  return (
    <>
    <div className="fade-in">
      <PageHeader
        title="User Management"
        subtitle={`${stats ? stats.total.toLocaleString() : '—'} registered civil servants`}
        action={
          <button onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={14} />
            Export CSV
          </button>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Users"       value={stats.total.toLocaleString()}
            icon={Users}         iconBg="bg-blue-50"   iconColor="text-blue-600"   accent="#3B82F6" />
          <StatCard title="Verified"          value={stats.verified.toLocaleString()}
            icon={CheckIcon}     iconBg="bg-green-50"  iconColor="text-green-600"  accent="#00843D" />
          <StatCard title="Pending KYC"       value={stats.pending.toLocaleString()}
            icon={AlertTriangle} iconBg="bg-yellow-50" iconColor="text-yellow-600" accent="#F59E0B" />
          <StatCard title="Verification Rate" value={stats.total > 0 ? `${((stats.verified/stats.total)*100).toFixed(1)}%` : '0%'}
            icon={CreditCard}    iconBg="bg-red-50"    iconColor="text-red-600"    accent="#CC0000" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Ministry Pie */}
        {stats && stats.byMinistry.length > 0 && (
          <div className="card p-5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">By Ministry</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={stats.byMinistry.slice(0, 9)} dataKey="count" nameKey="ministry"
                  cx="50%" cy="50%" outerRadius={60} innerRadius={32} paddingAngle={2}>
                  {stats.byMinistry.slice(0,9).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, n: string) => [v.toLocaleString(), n.replace('Ministry of ','')]}
                  contentStyle={{ border: 'none', borderRadius: 8, fontSize: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {stats.byMinistry.slice(0, 5).map((m, i) => (
                <div key={m.ministry} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-gray-500 truncate">{m.ministry.replace('Ministry of ','')}</span>
                  <span className="ml-auto font-semibold text-gray-700">{m.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + Table */}
        <div className="lg:col-span-3 card">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, employee ID, national ID…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <select value={ministry} onChange={(e) => { setMinistry(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-gray-700">
              <option value="">All Ministries</option>
              {MINISTRIES.map((m) => <option key={m} value={m}>{m.replace('Ministry of ','')}</option>)}
            </select>
            <select value={verified} onChange={(e) => { setVerified(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-gray-700">
              <option value="">All Status</option>
              <option value="true">Verified</option>
              <option value="false">Pending</option>
            </select>
            <button onClick={doFetch}
              className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {data && data.data.length === 0
              ? <EmptyState message="No users match the current filters." />
              : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Ministry / Dept</th>
                    <th>Salary</th>
                    <th>Credit</th>
                    <th>Owed</th>
                    <th>Utilisation</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((u) => (
                    <UserTableRow key={u.id} user={u} onOpen={() => setSelectedId(u.id)} />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {data && (
            <Pagination
              page={page} pages={data.pages} total={data.total} perPage={perPage}
              onChange={setPage}
              onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
            />
          )}
        </div>
      </div>

    </div>

    {/* Modal rendered outside fade-in to avoid transform containing-block issue */}
    {selectedId && (
      <UserDetailModal userId={selectedId} onClose={() => setSelectedId(null)} />
    )}
    </>
  );
}

// ─── Table Row ───────────────────────────────────────────────

function UserTableRow({ user: u, onOpen }: { user: UserRow; onOpen: () => void }) {
  const util = u.wallet?.utilizationPct ?? 0;
  const initials = u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <tr onClick={onOpen} className="cursor-pointer">
      <td>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)' }}>
            {initials}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{u.name}</p>
            <p className="text-xs text-gray-400 font-mono">{u.employeeId}</p>
          </div>
        </div>
      </td>
      <td>
        <p className="text-sm text-gray-700">{u.ministry.replace('Ministry of ','')}</p>
        <p className="text-xs text-gray-400">{u.department}</p>
      </td>
      <td className="text-sm tabular-nums text-gray-700">{fmtUSD(u.monthlySalary)}</td>
      <td className="text-sm tabular-nums text-gray-700">{u.wallet ? fmtUSD(u.wallet.creditLimit) : '—'}</td>
      <td className="text-sm tabular-nums text-gray-700">{u.wallet ? fmtUSD(u.wallet.amountUsed) : '—'}</td>
      <td>
        {u.wallet ? (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all" style={{
                width: `${Math.min(util, 100)}%`,
                backgroundColor: util > 90 ? '#EF4444' : util > 75 ? '#F59E0B' : '#00843D',
              }} />
            </div>
            <span className={`text-xs font-semibold ${utilizationColor(util)}`}>{fmtPct(util)}</span>
          </div>
        ) : '—'}
      </td>
      <td>
        <span className={`badge ${u.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {u.isVerified ? '✓ Verified' : '○ Pending'}
        </span>
      </td>
      <td className="text-xs text-gray-400">{fmtDate(u.createdAt)}</td>
      <td><ChevronRight size={14} className="text-gray-300" /></td>
    </tr>
  );
}

// ─── User Detail Modal (Centered, Tabbed) ───────────────────

function UserDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [user, setUser]   = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab]     = useState<TabId>('profile');

  useEffect(() => {
    setLoading(true); setError(''); setTab('profile');
    api.userDetail(userId)
      .then(setUser)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const util = user?.wallet
    ? Math.min((user.wallet.amountUsed / user.wallet.creditLimit) * 100, 100)
    : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 fade-only"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto slide-in flex flex-col"
          style={{ maxHeight: '88vh' }}
        >
          {/* ── Header ──────────────────────────────────────── */}
          <div
            className="relative flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8B0000 0%, #CC0000 60%, #AA0000 100%)' }}
          >
            {/* Decorative circle */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />

            <div className="relative px-7 pt-6 pb-5">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all"
              >
                <X size={16} />
              </button>

              {loading ? (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 animate-pulse" />
                  <div>
                    <div className="h-5 w-40 bg-white/20 rounded animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-white/15 rounded animate-pulse" />
                  </div>
                </div>
              ) : user ? (
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0"
                    style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)' }}
                  >
                    {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white font-bold text-xl leading-tight">{user.name}</h2>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-white/60 text-sm font-mono">{user.employeeId}</span>
                      <span className="text-white/30">·</span>
                      <span className="text-white/60 text-sm">{user.ministry.replace('Ministry of ','')}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <span className={`badge text-[11px] ${user.isVerified ? 'bg-green-400/20 text-green-200' : 'bg-amber-400/20 text-amber-200'}`}>
                      {user.isVerified ? '✓ Verified' : '○ Pending KYC'}
                    </span>
                    <span className={`badge text-[11px] ${user.isActive ? 'bg-white/15 text-white/70' : 'bg-red-900/40 text-red-200'}`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* ── Tab Bar ─────────────────────────────────── */}
            <div className="flex px-5 gap-0.5 bg-black/10">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  disabled={loading || !!error}
                  className="flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-all duration-150 border-b-2 whitespace-nowrap"
                  style={{
                    color: tab === id ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                    borderBottomColor: tab === id ? '#FFFFFF' : 'transparent',
                    backgroundColor: tab === id ? 'rgba(255,255,255,0.08)' : 'transparent',
                  }}
                >
                  <Icon size={13} strokeWidth={tab === id ? 2.5 : 2} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab Content ─────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto" style={{ background: '#F8F9FC' }}>
            {error && (
              <div className="flex items-center justify-center h-48 text-red-600 text-sm gap-2">
                <AlertTriangle size={16} /> Error: {error}
              </div>
            )}
            {loading && !error && (
              <div className="p-6 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 skeleton rounded-xl" />
                ))}
              </div>
            )}

            {user && !loading && (
              <div className="p-6">
                {/* Profile Tab */}
                {tab === 'profile' && (
                  <div className="space-y-4 fade-in">
                    <InfoGrid>
                      <InfoCard icon={User} label="Full Name" value={user.name} />
                      <InfoCard icon={Hash} label="National ID" value={user.nationalId} mono />
                      <InfoCard icon={Phone} label="Phone" value={user.phone} mono />
                      <InfoCard icon={Mail} label="Email" value={user.email ?? 'Not provided'} muted={!user.email} />
                      <InfoCard icon={Hash} label="Employee ID" value={user.employeeId} mono />
                      <InfoCard icon={Hash} label="Employer Code" value={user.employerCode} mono />
                      <InfoCard icon={Building2} label="Ministry" value={user.ministry} />
                      <InfoCard icon={User} label="Department" value={user.department} />
                      <InfoCard icon={DollarSign} label="Monthly Salary" value={fmtUSD(user.monthlySalary)} highlight />
                      <InfoCard icon={Calendar} label="Registered" value={fmtDate(user.joinedDate)} />
                    </InfoGrid>
                  </div>
                )}

                {/* Wallet Tab */}
                {tab === 'wallet' && (
                  <div className="fade-in space-y-4">
                    {!user.wallet ? (
                      <Empty message="No wallet created yet" />
                    ) : (
                      <>
                        {/* Credit meter + stats */}
                        <div className="grid grid-cols-4 gap-3">
                          {/* Circle meter */}
                          <div className="col-span-1 card p-4 flex flex-col items-center justify-center">
                            <div className="relative w-24 h-24">
                              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                                <circle cx="48" cy="48" r="38" fill="none" stroke="#F3F4F6" strokeWidth="10" />
                                <circle cx="48" cy="48" r="38" fill="none"
                                  stroke={util > 90 ? '#EF4444' : util > 75 ? '#F59E0B' : '#CC0000'}
                                  strokeWidth="10"
                                  strokeDasharray={`${2 * Math.PI * 38}`}
                                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - util / 100)}`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-lg font-black text-gray-900">{util.toFixed(0)}%</span>
                                <span className="text-[10px] text-gray-400 font-medium">used</span>
                              </div>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Utilisation</p>
                          </div>

                          {/* Stats */}
                          <div className="col-span-3 grid grid-cols-3 gap-3">
                            <WalletStat label="Credit Limit" value={fmtUSD(user.wallet.creditLimit)} color="#6366F1" />
                            <WalletStat label="Available" value={fmtUSD(user.wallet.availableCredit)} color="#00843D" />
                            <WalletStat label="Amount Owed" value={fmtUSD(user.wallet.amountUsed)} color="#CC0000" />
                          </div>
                        </div>

                        {/* Wallet details */}
                        <InfoGrid>
                          <InfoCard icon={Hash} label="Wallet ID" value={user.wallet.walletId} mono />
                          <InfoCard icon={Calendar} label="Billing Cycle" value={`Day ${user.wallet.cycleStart} – Day ${user.wallet.cycleEnd}`} />
                          {user.wallet.nextDeductionDate && (
                            <InfoCard icon={Calendar} label="Next Deduction Date" value={fmtDate(user.wallet.nextDeductionDate)} />
                          )}
                          {user.wallet.nextDeductionAmount > 0 && (
                            <InfoCard icon={DollarSign} label="Next Deduction Amount" value={fmtUSD(user.wallet.nextDeductionAmount)} highlight />
                          )}
                        </InfoGrid>
                      </>
                    )}
                  </div>
                )}

                {/* Verification Tab */}
                {tab === 'verification' && (
                  <div className="fade-in grid grid-cols-2 gap-4">
                    {/* ID Verification */}
                    <div className="card p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck size={15} className="text-gray-400" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">National ID</p>
                        {user.idVerification && <VerifBadge status={user.idVerification.status} />}
                      </div>
                      {!user.idVerification ? (
                        <Empty message="No record" />
                      ) : (
                        <div className="space-y-3">
                          <InfoCard icon={Hash} label="National ID" value={user.idVerification.nationalId} mono />
                          {user.idVerification.fullNameOnId && (
                            <InfoCard icon={User} label="Name on ID" value={user.idVerification.fullNameOnId} />
                          )}
                          {user.idVerification.dateOfBirth && (
                            <InfoCard icon={Calendar} label="Date of Birth" value={fmtDate(user.idVerification.dateOfBirth)} />
                          )}
                          {user.idVerification.verifiedAt && (
                            <InfoCard icon={CheckCircle2} label="Verified At" value={fmtDateTime(user.idVerification.verifiedAt)} />
                          )}
                          {user.idVerification.failureReason && (
                            <InfoCard icon={XCircle} label="Failure Reason" value={user.idVerification.failureReason} error />
                          )}
                          <InfoCard icon={Clock} label="Retry Count" value={String(user.idVerification.retryCount)} />
                        </div>
                      )}
                    </div>

                    {/* Employment Verification */}
                    <div className="card p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 size={15} className="text-gray-400" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Employment</p>
                        {user.employmentVerification && <VerifBadge status={user.employmentVerification.status} />}
                      </div>
                      {!user.employmentVerification ? (
                        <Empty message="No record" />
                      ) : (
                        <div className="space-y-3">
                          <InfoCard icon={Building2} label="Ministry" value={user.employmentVerification.ministry} />
                          <InfoCard icon={User} label="Department" value={user.employmentVerification.department} />
                          <InfoCard icon={Hash} label="Employer Code" value={user.employmentVerification.employerCode} mono />
                          {user.employmentVerification.salaryBand && (
                            <InfoCard icon={DollarSign} label="Salary Band" value={user.employmentVerification.salaryBand} />
                          )}
                          {user.employmentVerification.monthlySalary && (
                            <InfoCard icon={DollarSign} label="Verified Salary" value={fmtUSD(user.employmentVerification.monthlySalary)} highlight />
                          )}
                          {user.employmentVerification.verifiedAt && (
                            <InfoCard icon={CheckCircle2} label="Verified At" value={fmtDateTime(user.employmentVerification.verifiedAt)} />
                          )}
                          {user.employmentVerification.failureReason && (
                            <InfoCard icon={XCircle} label="Failure Reason" value={user.employmentVerification.failureReason} error />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Tab */}
                {tab === 'payment' && (
                  <div className="fade-in space-y-4">
                    {!user.directDebitSchedule ? (
                      <Empty message="No direct debit schedule set up" />
                    ) : (
                      <>
                        <InfoGrid>
                          <InfoCard icon={Banknote} label="Payment Channel" value={user.directDebitSchedule.paymentChannel} />
                          <InfoCard icon={Calendar} label="Deduction Day" value={`Day ${user.directDebitSchedule.deductionDay} of month`} />
                          <InfoCard icon={Hash} label="Deduction Type" value={user.directDebitSchedule.deductionType.replace('_',' ')} />
                          {user.directDebitSchedule.fixedAmount && (
                            <InfoCard icon={DollarSign} label="Fixed Amount" value={fmtUSD(user.directDebitSchedule.fixedAmount)} highlight />
                          )}
                          {user.directDebitSchedule.bankName && (
                            <InfoCard icon={Building2} label="Bank Name" value={user.directDebitSchedule.bankName} />
                          )}
                          {user.directDebitSchedule.bankBranchCode && (
                            <InfoCard icon={Hash} label="Branch Code" value={user.directDebitSchedule.bankBranchCode} mono />
                          )}
                          <InfoCard
                            icon={CreditCard}
                            label="Account"
                            value={user.directDebitSchedule.hasBank ? '•••• •••• (Bank Account)' : user.directDebitSchedule.hasWallet ? '•••• •••• (Mobile Wallet)' : 'Not configured'}
                            mono
                          />
                          {user.directDebitSchedule.lastDeductionDate && (
                            <InfoCard icon={Calendar} label="Last Deduction" value={fmtDate(user.directDebitSchedule.lastDeductionDate)} />
                          )}
                          {user.directDebitSchedule.lastDeductionAmount != null && (
                            <InfoCard icon={DollarSign} label="Last Amount" value={fmtUSD(user.directDebitSchedule.lastDeductionAmount)} />
                          )}
                          <InfoCard icon={XCircle} label="Failure Count" value={String(user.directDebitSchedule.failureCount)} error={user.directDebitSchedule.failureCount > 0} />
                        </InfoGrid>

                        {/* Recent Attempts */}
                        {user.directDebitSchedule.recentAttempts.length > 0 && (
                          <div className="card overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Recent Deduction Attempts</p>
                            </div>
                            <div className="divide-y divide-gray-50">
                              {user.directDebitSchedule.recentAttempts.map((a) => (
                                <div key={a.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                                  <div className={`w-2 h-2 rounded-full shrink-0 ${a.status === 'SUCCESS' ? 'bg-green-400' : 'bg-red-400'}`} />
                                  <span className="font-mono text-gray-400 text-xs w-24 shrink-0">{fmtDate(a.attemptedAt)}</span>
                                  <span className="font-semibold text-gray-800 tabular-nums">{fmtUSD(a.amount)}</span>
                                  <span className="text-gray-400 text-xs">{a.paymentChannel}</span>
                                  {a.externalRef && <span className="font-mono text-gray-300 text-xs">{a.externalRef}</span>}
                                  <span className={`ml-auto text-xs font-semibold ${a.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>{a.status}</span>
                                  {a.failureReason && <span className="text-red-400 text-xs truncate max-w-28">{a.failureReason}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Transactions Tab */}
                {tab === 'transactions' && (
                  <div className="fade-in">
                    {user.transactions.length === 0 ? (
                      <Empty message="No transactions yet" />
                    ) : (
                      <div className="card overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Recent Transactions</p>
                          <span className="text-[11px] text-gray-400">{user.transactions.length} records</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {user.transactions.map((t) => (
                            <div key={t.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                <Banknote size={15} className="text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{t.storeName}</p>
                                <p className="text-xs text-gray-400">{t.category} · {fmtDate(t.createdAt)}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-gray-900 tabular-nums">{fmtUSD(t.amount)}</p>
                                <span className={`text-[11px] font-semibold ${statusColor(t.status)}`}>{t.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function InfoCard({
  icon: Icon, label, value, mono, highlight, error, muted,
}: {
  icon: React.ElementType; label: string; value: string;
  mono?: boolean; highlight?: boolean; error?: boolean; muted?: boolean;
}) {
  return (
    <div className="card-flat px-4 py-3 rounded-xl">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className="text-gray-300" strokeWidth={2} />
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-sm leading-snug
        ${mono ? 'font-mono' : 'font-semibold'}
        ${error ? 'text-red-600' : highlight ? 'text-gray-900' : muted ? 'text-gray-400 italic' : 'text-gray-700'}
      `}>
        {value || '—'}
      </p>
    </div>
  );
}

function WalletStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card-flat rounded-xl p-4 text-center" style={{ borderLeft: `3px solid ${color}` }}>
      <p className="text-lg font-black text-gray-900 tabular-nums">{value}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-gray-400 text-sm">{message}</div>
  );
}

function VerifBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    VERIFIED:    'bg-green-100 text-green-700',
    PENDING:     'bg-amber-100 text-amber-700',
    FAILED:      'bg-red-100 text-red-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    EXPIRED:     'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`badge ml-auto text-[10px] ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>{status}</span>
  );
}
