'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Store, DollarSign, ShoppingCart, TrendingUp, Activity } from 'lucide-react';
import { api, type StoresData, type StoreRow } from '@/lib/api';
import { fmtUSD, fmtNum } from '@/lib/format';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';

const BRAND_COLORS: Record<string, string> = {
  OK:         '#CC0000',
  BON_MARCHE: '#3B82F6',
  OKMART:     '#F97316',
  OK_GRAND:   '#8B5CF6',
};

const BRAND_LABELS: Record<string, string> = {
  OK: 'OK', BON_MARCHE: 'Bon Marché', OKMART: 'OK Mart', OK_GRAND: 'OK Grand',
};

export default function StoresPage() {
  const [data, setData]   = useState<StoresData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage]   = useState(1);
  const [perPage, setPerPage] = useState(25);

  useEffect(() => {
    api.stores().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="p-8 text-red-600 text-sm">Error: {error}</div>;

  const s = data?.summary;

  return (
    <div className="fade-in">
      <PageHeader title="Store Revenue" subtitle="Revenue and transaction performance across all OK Zimbabwe locations" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="Total Stores"        value={fmtNum(s?.totalStores ?? 0)}
          icon={Store}         iconBg="bg-red-50"    iconColor="text-red-600"    accent="#CC0000" />
        <StatCard title="Active Stores"       value={fmtNum(s?.activeStores ?? 0)}
          icon={Activity}      iconBg="bg-green-50"  iconColor="text-green-600"  accent="#00843D" />
        <StatCard title="Total Revenue"       value={fmtUSD(s?.totalRevenue ?? 0, true)}
          icon={DollarSign}    iconBg="bg-teal-50"   iconColor="text-teal-600"   accent="#14B8A6" />
        <StatCard title="Total Transactions"  value={fmtNum(s?.totalTransactions ?? 0)}
          icon={ShoppingCart}  iconBg="bg-blue-50"   iconColor="text-blue-600"   accent="#3B82F6" />
        <StatCard title="This Month Revenue"  value={fmtUSD(s?.thisMonthRevenue ?? 0, true)}
          icon={TrendingUp}    iconBg="bg-purple-50" iconColor="text-purple-600" accent="#8B5CF6" />
        <StatCard title="Avg Revenue / Store" value={fmtUSD(s?.avgRevenuePerStore ?? 0, true)}
          icon={Store}         iconBg="bg-gray-100"  iconColor="text-gray-600" />
      </div>

      {/* Revenue bar chart */}
      <div className="card p-6 mb-6">
        <p className="text-base font-semibold text-gray-800 mb-4">Revenue by Store</p>
        {!data || data.stores.length === 0
          ? <EmptyState message="No store transactions recorded yet." />
          : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.stores.slice(0, 15).map((s) => ({
                name: s.name.replace('OK ', '').replace('Bon Marché ','BM '),
                revenue: s.totalRevenue,
                month: s.thisMonthRevenue,
                brand: s.brand,
              }))}
              margin={{ top: 5, right: 10, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: number, n: string) => [fmtUSD(v), n === 'revenue' ? 'All-Time Revenue' : 'This Month']}
                contentStyle={{ border: 'none', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="revenue" name="revenue" radius={[4,4,0,0]}>
                {data.stores.slice(0,15).map((s, i) => (
                  <Cell key={i} fill={BRAND_COLORS[s.brand] ?? '#CC0000'} opacity={0.85} />
                ))}
              </Bar>
              <Bar dataKey="month" name="month" radius={[4,4,0,0]} fill="#E5E7EB" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stores table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="font-semibold text-gray-800">All Stores</p>
          <div className="flex gap-2">
            {Object.entries(BRAND_LABELS).map(([k, v]) => (
              <span key={k} className="badge text-white text-xs" style={{ backgroundColor: BRAND_COLORS[k] }}>
                {v}
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          {!data || data.stores.length === 0
            ? <EmptyState message="No stores found." />
            : (() => {
                const stores = data.stores;
                const pages = Math.ceil(stores.length / perPage);
                const slice = stores.slice((page - 1) * perPage, page * perPage);
                return (
                  <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Store Name</th>
                        <th>Brand</th>
                        <th>City</th>
                        <th>Status</th>
                        <th>Total Revenue</th>
                        <th>Total Txns</th>
                        <th>This Month</th>
                        <th>Avg Txn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slice.map((store) => (
                        <StoreRow key={store.id} store={store} />
                      ))}
                    </tbody>
                  </table>
                  <Pagination
                    page={page} pages={pages} total={stores.length} perPage={perPage}
                    onChange={setPage} onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
                  />
                  </>
                );
              })()
          }
        </div>

        {data && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700">Total</span>
            <div className="flex gap-8 text-gray-700">
              <span><span className="text-gray-500">Revenue: </span><strong>{fmtUSD(data.summary.totalRevenue, true)}</strong></span>
              <span><span className="text-gray-500">Transactions: </span><strong>{fmtNum(data.summary.totalTransactions)}</strong></span>
              <span><span className="text-gray-500">This Month: </span><strong>{fmtUSD(data.summary.thisMonthRevenue, true)}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StoreRow({ store: s }: { store: StoreRow }) {
  return (
    <tr>
      <td>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: BRAND_COLORS[s.brand] ?? '#CC0000' }}>
            {s.name[0]}
          </div>
          <span className="font-medium text-sm">{s.name}</span>
        </div>
      </td>
      <td>
        <span className="badge text-white text-xs" style={{ backgroundColor: BRAND_COLORS[s.brand] ?? '#CC0000' }}>
          {BRAND_LABELS[s.brand] ?? s.brand}
        </span>
      </td>
      <td className="text-sm text-gray-600">{s.city}</td>
      <td>
        <span className={`badge ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          {s.isActive ? 'Open' : 'Closed'}
        </span>
      </td>
      <td className="font-semibold text-sm">{fmtUSD(s.totalRevenue)}</td>
      <td className="text-sm">{fmtNum(s.totalTransactions)}</td>
      <td className="text-sm text-purple-700 font-medium">{fmtUSD(s.thisMonthRevenue)}</td>
      <td className="text-sm text-gray-500">{s.avgTransactionValue > 0 ? fmtUSD(s.avgTransactionValue) : '—'}</td>
    </tr>
  );
}
