'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, CreditCard, TrendingUp,
  AlertTriangle, CheckCircle2,
  Store, Activity, Banknote,
} from 'lucide-react';
import { api, OverviewData } from '@/lib/api';
import { fmtUSD, fmtNum, fmtPct, fmtShortDate } from '@/lib/format';
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const BRAND     = '#CC0000';
const PIE_COLORS = ['#CC0000','#3B82F6','#00843D','#F59E0B'];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-gray-800 mb-4">{children}</h2>;
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card p-5 h-28"><div className="skeleton h-4 w-1/2 mb-3" /><div className="skeleton h-7 w-3/4" /></div>
      ))}
    </div>
  );
}

export default function OverviewPage() {
  const [data, setData]   = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.overview()
      .then(setData)
      .catch((e) => setError(e.message));

    const id = setInterval(() => {
      api.overview().then(setData).catch(() => {});
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-2 text-red-500" size={32} />
          <p className="text-gray-600 text-sm">Could not load dashboard data.</p>
          <p className="text-gray-400 text-xs mt-1">{error}</p>
          <p className="text-gray-400 text-xs mt-1">Make sure the backend is running on port 3000.</p>
        </div>
      </div>
    );
  }

  if (!data) return <Skeleton />;

  const verifiedPct = data.totalUsers > 0 ? (data.verifiedUsers / data.totalUsers) * 100 : 0;

  return (
    <div className="fade-in">
      <PageHeader
        title="Dashboard Overview"
        subtitle={`Civil Servant Credit Programme — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      {/* KPI Row 1 — Users */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard title="Total Registered"   value={fmtNum(data.totalUsers)}
          icon={Users}         iconBg="bg-blue-50"   iconColor="text-blue-600"
          sub={`${fmtNum(data.verifiedUsers)} verified`} accent="#3B82F6" />
        <StatCard title="Pending KYC"        value={fmtNum(data.pendingVerifications)}
          icon={AlertTriangle} iconBg="bg-yellow-50" iconColor="text-yellow-600"
          sub="Awaiting verification" accent="#F59E0B" />
        <StatCard title="Verified Users"     value={`${verifiedPct.toFixed(1)}%`}
          icon={Activity}      iconBg="bg-gray-100"  iconColor="text-gray-600"
          sub={`${fmtNum(data.verifiedUsers)} of ${fmtNum(data.totalUsers)}`} />
        <StatCard title="Active Stores"      value={fmtNum(data.totalStores)}
          icon={Store}         iconBg="bg-indigo-50" iconColor="text-indigo-600"
          sub="OK Zimbabwe stores" accent="#6366F1" />
      </div>

      {/* KPI Row 2 — Credit & Collections */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Credit Issued"        value={fmtUSD(data.totalCreditIssued, true)}
          icon={CreditCard}   iconBg="bg-red-50"    iconColor="text-red-600"
          sub={`${fmtPct(data.utilizationRate)} utilised`} accent={BRAND} />
        <StatCard title="Amount Owed"          value={fmtUSD(data.totalAmountOwed, true)}
          icon={TrendingUp}   iconBg="bg-orange-50" iconColor="text-orange-600"
          sub={`${fmtUSD(data.totalAvailableCredit, true)} available`} accent="#F97316" />
        <StatCard title="Collected This Month" value={fmtUSD(data.thisMonthCollections, true)}
          icon={CheckCircle2} iconBg="bg-teal-50"   iconColor="text-teal-600"
          sub={`${fmtNum(data.thisMonthDeductions)} deductions`} accent="#14B8A6" />
        <StatCard title="Purchases This Month" value={fmtNum(data.thisMonthTransactions)}
          icon={Store}        iconBg="bg-green-50"  iconColor="text-green-600"
          sub="Transactions at OK stores" accent="#00843D" />
      </div>

      {/* KPI Row 3 — Platform Revenue */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8 max-w-lg">
        <StatCard title="Platform Revenue (All Time)" value={fmtUSD(data.totalPlatformRevenue, true)}
          icon={Banknote} iconBg="bg-purple-50" iconColor="text-purple-600"
          sub="1% fee on all purchases" accent="#8B5CF6" />
        <StatCard title="Platform Revenue (This Month)" value={fmtUSD(data.thisMonthPlatformRevenue, true)}
          icon={Banknote} iconBg="bg-purple-50" iconColor="text-purple-600"
          sub={`from ${fmtNum(data.thisMonthTransactions)} transactions`} accent="#8B5CF6" />
      </div>

      {/* Charts — Registrations + Channel breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Registration Trend */}
        <div className="card p-6">
          <SectionTitle>User Registrations — Last 30 Days</SectionTitle>
          {data.registrationTrend.length === 0
            ? <EmptyState message="No registrations in the last 30 days." />
            : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.registrationTrend} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tickFormatter={fmtShortDate} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: number) => [fmtNum(v), 'Registrations']}
                  labelFormatter={(l) => fmtShortDate(String(l))}
                  contentStyle={{ border: 'none', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2.5} fill="url(#regGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Channel pie */}
        <div className="card p-6">
          <SectionTitle>Payment Channel Distribution</SectionTitle>
          {data.channelBreakdown.length === 0
            ? <EmptyState message="No collections recorded yet." />
            : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.channelBreakdown} dataKey="count" nameKey="channel"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={48} paddingAngle={3}>
                  {data.channelBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [fmtNum(v), name]}
                  contentStyle={{ border: 'none', borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
