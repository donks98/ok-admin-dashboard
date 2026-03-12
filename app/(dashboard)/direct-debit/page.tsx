'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowDownUp, CheckCircle2, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { api, DirectDebitData } from '@/lib/api';
import { fmtUSD, fmtNum, fmtPct } from '@/lib/format';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';

const CHANNEL_LABEL: Record<string, string> = {
  BANK_TRANSFER: 'Bank Transfer',
  ECOCASH:       'EcoCash',
  TELECASH:      'TeleCash',
  INNBUCKS:      'InnBucks',
};

export default function DirectDebitPage() {
  const [data, setData]       = useState<DirectDebitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function load() {
    setLoading(true);
    api.directDebits().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); const id = setInterval(load, 30_000); return () => clearInterval(id); }, []);

  if (error) return <div className="p-8 text-red-600 text-sm">Error loading direct debit data: {error}</div>;

  const s = data?.summary;

  return (
    <div className="fade-in">
      <PageHeader
        title="Direct Debit Monitoring"
        subtitle="Real-time collection status and channel performance"
        action={
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Direct Debits"  value={fmtNum(s?.activeSetups ?? 0)}
          icon={ArrowDownUp}  iconBg="bg-purple-50" iconColor="text-purple-600" accent="#8B5CF6" />
        <StatCard title="Success Rate"          value={fmtPct(s?.successRate ?? 0)}
          icon={CheckCircle2} iconBg="bg-green-50"  iconColor="text-green-600"  accent="#00843D" />
        <StatCard title="Collected All-Time"    value={fmtUSD(s?.totalCollectedAllTime ?? 0, true)}
          icon={DollarSign}   iconBg="bg-teal-50"   iconColor="text-teal-600"   accent="#14B8A6" />
        <StatCard title="Collected This Month"  value={fmtUSD(s?.thisMonthCollected ?? 0, true)}
          icon={TrendingUp}   iconBg="bg-red-50"    iconColor="text-red-600"    accent="#CC0000"
          sub={`${fmtNum(s?.thisMonthCount ?? 0)} deductions`} />
      </div>

      {/* Monthly trend + by channel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <p className="text-base font-semibold text-gray-800 mb-4">Monthly Collections (Last 12 Months)</p>
          {!data || data.monthlyTrend.length === 0
            ? <EmptyState message="No collection history yet." />
            : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.monthlyTrend} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number, n: string) => [n === 'collected' ? fmtUSD(v) : fmtNum(v), n === 'collected' ? 'Collected' : 'Failed']}
                  contentStyle={{ border: 'none', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="collected" fill="#00843D" name="collected" radius={[4,4,0,0]} />
                <Bar dataKey="failed"    fill="#EF4444" name="failed"    radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By Channel */}
        <div className="card p-6">
          <p className="text-base font-semibold text-gray-800 mb-4">By Payment Channel</p>
          {!data || data.byChannel.length === 0
            ? <EmptyState message="No channel data yet." />
            : (
            <div className="space-y-3">
              {data.byChannel.map((c) => (
                <div key={c.channel} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800">{CHANNEL_LABEL[c.channel] ?? c.channel}</span>
                    <span className="badge bg-green-100 text-green-800">{fmtPct(c.successRate)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{fmtNum(c.total)} attempts</span>
                    <span className="font-medium text-gray-700">{fmtUSD(c.amount, true)}</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${c.successRate}%` }} />
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-green-700">{fmtNum(c.success)} ok</span>
                    <span className="text-red-600">{fmtNum(c.failed)} failed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
