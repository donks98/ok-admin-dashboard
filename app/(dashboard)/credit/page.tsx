'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CreditCard, TrendingUp, AlertTriangle, Users, ShieldAlert, DollarSign } from 'lucide-react';
import { api, CreditData } from '@/lib/api';
import { fmtUSD, fmtPct, fmtNum, utilizationColor } from '@/lib/format';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';

const COLORS = ['#00843D','#3B82F6','#F59E0B','#F97316','#EF4444'];
const BAND_ORDER = ['0%', '1–25%', '25–50%', '50–75%', '75–90%', '90–100%', 'No Limit'];

export default function CreditPage() {
  const [data, setData]   = useState<CreditData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage]   = useState(1);
  const [perPage, setPerPage] = useState(25);

  useEffect(() => {
    api.credit().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="p-8 text-red-600 text-sm">Error: {error}</div>;
  if (!data) return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-5 h-28"><div className="skeleton h-4 w-1/2 mb-3" /><div className="skeleton h-7 w-3/4" /></div>
      ))}
    </div>
  );

  const bands = BAND_ORDER
    .map((b) => data.utilizationBands.find((x) => x.band === b))
    .filter(Boolean) as { band: string; count: number }[];

  return (
    <div className="fade-in">
      <PageHeader title="Credit & Debt" subtitle="Outstanding balances, utilisation, and risk analysis" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="Total Credit Issued"   value={fmtUSD(data.totalCreditIssued, true)}
          icon={CreditCard}   iconBg="bg-red-50"    iconColor="text-red-600"    accent="#CC0000" />
        <StatCard title="Total Owed"            value={fmtUSD(data.totalAmountOwed, true)}
          icon={TrendingUp}   iconBg="bg-orange-50" iconColor="text-orange-600" accent="#F97316" />
        <StatCard title="Available Credit"      value={fmtUSD(data.totalAvailable, true)}
          icon={DollarSign}   iconBg="bg-green-50"  iconColor="text-green-600"  accent="#00843D" />
        <StatCard title="Avg Utilisation"       value={fmtPct(data.avgUtilization)}
          icon={TrendingUp}   iconBg="bg-blue-50"   iconColor="text-blue-600"   accent="#3B82F6" />
        <StatCard title="Active Wallets"        value={fmtNum(data.totalWallets)}
          icon={Users}        iconBg="bg-gray-100"  iconColor="text-gray-600" />
        <StatCard title="Users at Risk (>90%)"  value={fmtNum(data.usersAtRisk)}
          icon={ShieldAlert}  iconBg="bg-red-100"   iconColor="text-red-600"    accent="#EF4444" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ministry bar chart */}
        <div className="card p-6">
          <p className="text-base font-semibold text-gray-800 mb-4">Credit by Ministry</p>
          {data.byMinistry.length === 0
            ? <EmptyState message="No verified users yet." />
            : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                layout="vertical"
                data={data.byMinistry.map((m) => ({
                  name: m.ministry.replace('Ministry of ',''),
                  owed: m.owed, limit: m.limit,
                }))}
                margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} width={90} />
                <Tooltip formatter={(v: number, n: string) => [fmtUSD(v), n === 'owed' ? 'Owed' : 'Limit']}
                  contentStyle={{ border: 'none', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="limit" fill="#E5E7EB" radius={[0,4,4,0]} barSize={12} name="limit" />
                <Bar dataKey="owed"  fill="#CC0000" radius={[0,4,4,0]} barSize={12} name="owed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Utilisation bands */}
        <div className="card p-6">
          <p className="text-base font-semibold text-gray-800 mb-4">Utilisation Distribution</p>
          {bands.length === 0
            ? <EmptyState message="No wallet data available." />
            : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={bands} dataKey="count" nameKey="band" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2}>
                    {bands.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [fmtNum(v) + ' users', n]}
                    contentStyle={{ border: 'none', borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {bands.map((b, i) => (
                  <div key={b.band} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-600">{b.band}</span>
                    <span className="ml-auto text-xs font-semibold text-gray-800">{fmtNum(b.count)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ministry table */}
      <div className="card mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-800">Ministry Credit Summary</p>
        </div>
        <div className="overflow-x-auto">
          {data.byMinistry.length === 0
            ? <EmptyState />
            : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ministry</th>
                  <th>Active Users</th>
                  <th>Total Credit Limit</th>
                  <th>Amount Owed</th>
                  <th>Available</th>
                  <th>Utilisation</th>
                </tr>
              </thead>
              <tbody>
                {data.byMinistry.map((m) => (
                  <tr key={m.ministry}>
                    <td className="font-medium">{m.ministry}</td>
                    <td>{fmtNum(m.users)}</td>
                    <td>{fmtUSD(m.limit)}</td>
                    <td className="font-semibold">{fmtUSD(m.owed)}</td>
                    <td className="text-green-700">{fmtUSD(m.limit - m.owed)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(m.utilizationPct, 100)}%`, backgroundColor: m.utilizationPct > 80 ? '#EF4444' : m.utilizationPct > 60 ? '#F59E0B' : '#00843D' }} />
                        </div>
                        <span className={`text-xs font-bold w-12 text-right ${utilizationColor(m.utilizationPct)}`}>
                          {fmtPct(m.utilizationPct)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Top Debtors */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-800">Top Debtors</p>
          <p className="text-xs text-gray-500 mt-0.5">Users with highest outstanding balances</p>
        </div>
        <div className="overflow-x-auto">
          {data.topDebtors.length === 0
            ? <EmptyState message="No outstanding balances yet." />
            : (() => {
                const debtors = data.topDebtors;
                const pages = Math.ceil(debtors.length / perPage);
                const slice = debtors.slice((page - 1) * perPage, page * perPage);
                const offset = (page - 1) * perPage;
                return (
                  <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Employee</th>
                        <th>Ministry</th>
                        <th>Credit Limit</th>
                        <th>Amount Owed</th>
                        <th>Utilisation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slice.map((u, i) => (
                        <tr key={u.id}>
                          <td className="text-gray-400 font-mono text-xs">{offset + i + 1}</td>
                          <td>
                            <p className="font-medium text-sm">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.employeeId}</p>
                          </td>
                          <td className="text-sm">{u.ministry.replace('Ministry of ','')}</td>
                          <td>{u.wallet ? fmtUSD(u.wallet.creditLimit) : '—'}</td>
                          <td className="font-semibold">{u.wallet ? fmtUSD(u.wallet.amountUsed) : '—'}</td>
                          <td>
                            {u.wallet ? (
                              <span className={`font-bold text-sm ${utilizationColor(u.wallet.utilizationPct)}`}>
                                {fmtPct(u.wallet.utilizationPct)}
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination
                    page={page} pages={pages} total={debtors.length} perPage={perPage}
                    onChange={setPage} onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
                  />
                  </>
                );
              })()
          }
        </div>
      </div>
    </div>
  );
}
