'use client';

import { useState, useCallback } from 'react';
import {
  Users, ArrowDownUp, CreditCard, Store,
  Download, Loader2, FileText, Filter,
} from 'lucide-react';
import { api } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────

type ReportType = 'users' | 'transactions' | 'collections' | 'credit' | 'stores';

interface ReportDef {
  id:       ReportType;
  label:    string;
  desc:     string;
  icon:     React.ElementType;
  color:    string;
  bg:       string;
  filters:  ('ministry' | 'verified' | 'dateRange')[];
  columns:  { key: string; label: string }[];
}

const REPORTS: ReportDef[] = [
  {
    id: 'users', label: 'Civil Servant Register', icon: Users,
    desc: 'All registered civil servants with credit limits and balances.',
    color: '#CC0000', bg: 'bg-red-50',
    filters: ['ministry', 'verified'],
    columns: [
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'name',       label: 'Name' },
      { key: 'nationalId', label: 'National ID' },
      { key: 'phone',      label: 'Phone' },
      { key: 'ministry',   label: 'Ministry' },
      { key: 'department', label: 'Department' },
      { key: 'monthlySalary', label: 'Salary (USD)' },
      { key: 'creditLimit',   label: 'Credit Limit' },
      { key: 'amountOwed',    label: 'Amount Owed' },
      { key: 'utilisationPct', label: 'Utilisation %' },
      { key: 'status',    label: 'Status' },
      { key: 'joinedDate', label: 'Joined' },
    ],
  },
  {
    id: 'transactions', label: 'Transaction Report', icon: FileText,
    desc: 'All approved purchases at OK stores, filterable by date and ministry.',
    color: '#0EA5E9', bg: 'bg-sky-50',
    filters: ['dateRange', 'ministry'],
    columns: [
      { key: 'date',        label: 'Date' },
      { key: 'reference',   label: 'Reference' },
      { key: 'employeeId',  label: 'Employee ID' },
      { key: 'civilServant', label: 'Civil Servant' },
      { key: 'ministry',    label: 'Ministry' },
      { key: 'department',  label: 'Department' },
      { key: 'store',       label: 'Store' },
      { key: 'city',        label: 'City' },
      { key: 'amount',      label: 'Amount (USD)' },
      { key: 'status',      label: 'Status' },
    ],
  },
  {
    id: 'collections', label: 'Collections Report', icon: ArrowDownUp,
    desc: 'Salary deduction attempts — successful and failed — by date range.',
    color: '#10B981', bg: 'bg-emerald-50',
    filters: ['dateRange'],
    columns: [
      { key: 'date',         label: 'Date' },
      { key: 'employeeId',   label: 'Employee ID' },
      { key: 'civilServant', label: 'Civil Servant' },
      { key: 'ministry',     label: 'Ministry' },
      { key: 'amount',       label: 'Amount (USD)' },
      { key: 'channel',      label: 'Channel' },
      { key: 'status',       label: 'Status' },
      { key: 'failureReason', label: 'Failure Reason' },
    ],
  },
  {
    id: 'credit', label: 'Credit Utilisation Report', icon: CreditCard,
    desc: 'Outstanding balances for all civil servants with active credit.',
    color: '#F59E0B', bg: 'bg-amber-50',
    filters: ['ministry'],
    columns: [
      { key: 'employeeId',     label: 'Employee ID' },
      { key: 'name',           label: 'Name' },
      { key: 'ministry',       label: 'Ministry' },
      { key: 'department',     label: 'Department' },
      { key: 'creditLimit',    label: 'Credit Limit' },
      { key: 'amountOwed',     label: 'Amount Owed' },
      { key: 'available',      label: 'Available' },
      { key: 'utilisationPct', label: 'Utilisation %' },
      { key: 'directDebitActive', label: 'Direct Debit' },
      { key: 'paymentChannel',    label: 'Channel' },
      { key: 'lastDeductionDate', label: 'Last Deduction' },
    ],
  },
  {
    id: 'stores', label: 'Store Revenue Report', icon: Store,
    desc: 'Revenue per OK store for a given period.',
    color: '#8B5CF6', bg: 'bg-violet-50',
    filters: ['dateRange'],
    columns: [
      { key: 'store',        label: 'Store' },
      { key: 'brand',        label: 'Brand' },
      { key: 'city',         label: 'City' },
      { key: 'isActive',     label: 'Status' },
      { key: 'transactions', label: 'Transactions' },
      { key: 'revenue',      label: 'Revenue (USD)' },
    ],
  },
];

const MINISTRIES = [
  'Ministry of Education', 'Ministry of Health', 'Ministry of Finance',
  'Ministry of Home Affairs', 'Ministry of Agriculture', 'Ministry of Transport',
  'Ministry of Information', 'Ministry of Foreign Affairs', 'Ministry of Justice',
];

// ── CSV helper ────────────────────────────────────────────────

function exportCSV(rows: any[], columns: { key: string; label: string }[], filename: string) {
  const header = columns.map(c => `"${c.label}"`).join(',');
  const body   = rows.map(row =>
    columns.map(c => {
      const v = row[c.key] ?? '';
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────

export default function ReportsPage() {
  const [selected, setSelected] = useState<ReportType>('users');
  const [from, setFrom]         = useState('');
  const [to, setTo]             = useState('');
  const [ministry, setMinistry] = useState('');
  const [verified, setVerified] = useState('');
  const [rows, setRows]         = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [ran, setRan]           = useState(false);

  const def = REPORTS.find(r => r.id === selected)!;

  const run = useCallback(async () => {
    setLoading(true); setRan(false);
    try {
      const params = new URLSearchParams({ type: selected });
      if (from)     params.set('from', from);
      if (to)       params.set('to', to);
      if (ministry) params.set('ministry', ministry);
      if (verified) params.set('verified', verified);

      const token = localStorage.getItem('admin_token') ?? '';
      const res   = await fetch(`/api/admin/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
      setRan(true);
    } catch {
      setRows([]);
    }
    setLoading(false);
  }, [selected, from, to, ministry, verified]);

  function doExport() {
    const date = new Date().toISOString().slice(0, 10);
    exportCSV(rows, def.columns, `${def.id}-report-${date}.csv`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Reports</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Generate and export data reports</p>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {REPORTS.map(r => {
          const Icon    = r.icon;
          const active  = selected === r.id;
          return (
            <button
              key={r.id}
              onClick={() => { setSelected(r.id); setRows([]); setRan(false); }}
              className={`flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all duration-150 ${active ? 'shadow-md' : 'hover:border-gray-300'}`}
              style={{
                background:   active ? `${r.color}08` : 'white',
                borderColor:  active ? r.color : '#E5E7EB',
                boxShadow:    active ? `0 0 0 2px ${r.color}25` : undefined,
              }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.bg}`}>
                <Icon size={15} style={{ color: r.color }} />
              </div>
              <span className="text-[12px] font-bold leading-tight" style={{ color: active ? r.color : 'var(--text-primary)' }}>
                {r.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters + Run */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
            Filters — {def.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          {def.filters.includes('dateRange') && (
            <>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>From</label>
                <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                  className="input text-sm" style={{ width: 150 }} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>To</label>
                <input type="date" value={to} onChange={e => setTo(e.target.value)}
                  className="input text-sm" style={{ width: 150 }} />
              </div>
            </>
          )}

          {def.filters.includes('ministry') && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Ministry</label>
              <select value={ministry} onChange={e => setMinistry(e.target.value)} className="input text-sm" style={{ width: 220 }}>
                <option value="">All Ministries</option>
                {MINISTRIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}

          {def.filters.includes('verified') && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Status</label>
              <select value={verified} onChange={e => setVerified(e.target.value)} className="input text-sm" style={{ width: 140 }}>
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Pending</option>
              </select>
            </div>
          )}

          <button
            onClick={run}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${def.color}, ${def.color}cc)`, boxShadow: `0 4px 14px ${def.color}35` }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            {loading ? 'Generating…' : 'Run Report'}
          </button>

          {ran && rows.length > 0 && (
            <button
              onClick={doExport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all hover:bg-gray-50"
              style={{ color: 'var(--text-secondary)', borderColor: '#E5E7EB' }}
            >
              <Download size={14} />
              Export CSV ({rows.length.toLocaleString()} rows)
            </button>
          )}
        </div>
      </div>

      {/* Results table */}
      {ran && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{def.label}</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {rows.length === 0 ? 'No data found' : `${rows.length.toLocaleString()} rows${rows.length === 10000 ? ' (capped at 10,000)' : ''}`}
              </p>
            </div>
            {rows.length > 0 && (
              <button onClick={doExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all hover:bg-gray-50"
                style={{ color: 'var(--text-secondary)', borderColor: '#E5E7EB' }}>
                <Download size={13} /> Export CSV
              </button>
            )}
          </div>

          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                    {def.columns.map(col => (
                      <th key={col.key} className="px-4 py-2.5 text-left font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 100).map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                      style={{ borderBottom: '1px solid #F9FAFB' }}>
                      {def.columns.map(col => (
                        <td key={col.key} className="px-4 py-2.5 whitespace-nowrap"
                          style={{ color: 'var(--text-secondary)' }}>
                          {col.key === 'utilisationPct'
                            ? <UtilBar pct={row[col.key]} />
                            : col.key === 'status'
                              ? <StatusBadge value={row[col.key]} />
                              : String(row[col.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 100 && (
                <p className="px-5 py-3 text-[12px] border-t border-gray-100" style={{ color: 'var(--text-tertiary)' }}>
                  Showing first 100 of {rows.length.toLocaleString()} rows — export CSV to see all
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                <FileText size={20} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>No data matches your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UtilBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? '#EF4444' : pct >= 75 ? '#F59E0B' : '#10B981';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <span>{pct}%</span>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Verified: '#10B981', Pending: '#F59E0B',
    Active: '#10B981', Inactive: '#6B7280',
    SUCCESS: '#10B981', FAILED: '#EF4444', PENDING: '#F59E0B',
  };
  const color = map[value] ?? '#6B7280';
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: `${color}15`, color }}>
      {value}
    </span>
  );
}
