'use client';

import { useEffect, useState, useRef } from 'react';
import { FlaskConical, Play, Square, RefreshCw, Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { api, Simulation, StartSimDto } from '@/lib/api';
import { fmtNum, fmtDateTime, fmtPct, statusColor } from '@/lib/format';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';

const SIM_TYPES: StartSimDto['type'][] = [
  'SPENDING','FULL_FLOW','ID_VERIFICATION','EMPLOYMENT_VERIFICATION','ACCOUNT_VERIFICATION','DIRECT_DEBIT',
];
const SIM_LABELS: Record<string, string> = {
  SPENDING:                'Spending (Real DB Transactions)',
  ID_VERIFICATION:         'ID Verification',
  EMPLOYMENT_VERIFICATION: 'Employment Verification',
  ACCOUNT_VERIFICATION:    'Account Verification',
  DIRECT_DEBIT:            'Direct Debit',
  FULL_FLOW:               'Full Onboarding Flow',
};

export default function SandboxPage() {
  const [sims, setSims]         = useState<Simulation[]>([]);
  const [loading, setLoading]   = useState(false);
  const [starting, setStarting] = useState(false);
  const [page, setPage]         = useState(1);
  const [perPage, setPerPage]   = useState(25);
  const [form, setForm]         = useState<StartSimDto>({
    type: 'SPENDING', batchSize: 100, totalUsers: 10000, intervalMs: 500,
  });
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  function loadSims() {
    api.simulations().then(setSims).catch(() => {});
  }

  useEffect(() => {
    loadSims();
    pollRef.current = setInterval(loadSims, 2000); // poll every 2s while page is open
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  async function start() {
    setStarting(true);
    try {
      await api.startSimulation(form);
      loadSims();
    } catch (e: unknown) {
      alert('Failed to start simulation: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setStarting(false);
    }
  }

  async function stop(id: string) {
    await api.stopSimulation(id).catch(() => {});
    loadSims();
  }

  const running = sims.filter((s) => s.status === 'RUNNING');
  const finished = sims.filter((s) => s.status !== 'RUNNING');

  return (
    <div className="fade-in">
      <PageHeader
        title="Sandbox Simulations"
        subtitle="Run controlled simulations against the 500k civil servant pool to test backend robustness"
        action={
          <button onClick={loadSims} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Launch form */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#CC0000' }}>
              <FlaskConical size={16} className="text-white" />
            </div>
            <p className="font-semibold text-gray-800">Launch Simulation</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Simulation Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as StartSimDto['type'] })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 bg-white">
                {SIM_TYPES.map((t) => <option key={t} value={t}>{SIM_LABELS[t]}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Batch Size</label>
                <input type="number" min={1} max={500} value={form.batchSize}
                  onChange={(e) => setForm({ ...form, batchSize: +e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                <p className="text-xs text-gray-400 mt-0.5">users per tick</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Interval (ms)</label>
                <input type="number" min={50} max={5000} value={form.intervalMs}
                  onChange={(e) => setForm({ ...form, intervalMs: +e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                <p className="text-xs text-gray-400 mt-0.5">between ticks</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Total Users <span className="font-normal text-gray-400">(0 = unlimited)</span>
              </label>
              <input type="number" min={0} max={500000} value={form.totalUsers}
                onChange={(e) => setForm({ ...form, totalUsers: +e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30" />
            </div>

            <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-0.5">
              <p>Pool size: <strong>500,000</strong> deterministic users</p>
              <p>Est. throughput: <strong>~{Math.round((form.batchSize ?? 50) / ((form.intervalMs ?? 200) / 1000))}/s</strong></p>
              {(form.totalUsers ?? 0) > 0 && (
                <p>Est. duration: <strong>~{Math.round((form.totalUsers ?? 0) / ((form.batchSize ?? 50) / ((form.intervalMs ?? 200) / 1000)))}s</strong></p>
              )}
            </div>

            <button
              onClick={start}
              disabled={starting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white text-sm font-semibold transition-all disabled:opacity-50"
              style={{ backgroundColor: '#CC0000' }}>
              <Play size={15} />
              {starting ? 'Starting...' : 'Start Simulation'}
            </button>
          </div>
        </div>

        {/* Running sims */}
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Running ({running.length})
          </p>
          {running.length === 0 ? (
            <div className="card p-8 flex flex-col items-center text-gray-400">
              <Activity size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No active simulations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {running.map((sim) => (
                <SimCard key={sim.id} sim={sim} onStop={() => stop(sim.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completed sims */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-800">Simulation History</p>
          <p className="text-xs text-gray-500 mt-0.5">{finished.length} completed simulations</p>
        </div>
        <div className="overflow-x-auto">
          {finished.length === 0
            ? <EmptyState message="No completed simulations yet. Start one above." />
            : (() => {
                const pages = Math.ceil(finished.length / perPage);
                const slice = finished.slice((page - 1) * perPage, page * perPage);
                return (
                  <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Processed</th>
                        <th>Success Rate</th>
                        <th>Avg Latency</th>
                        <th>p95 Latency</th>
                        <th>Config</th>
                        <th>Started</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slice.map((sim) => {
                        const successRate = sim.processed > 0 ? (sim.succeeded / sim.processed) * 100 : 0;
                        const cfg = sim.config as Record<string, number>;
                        const duration = sim.completedAt || sim.stoppedAt
                          ? Math.round((new Date(sim.completedAt ?? sim.stoppedAt!).getTime() - new Date(sim.startedAt).getTime()) / 1000)
                          : null;
                        return (
                          <tr key={sim.id}>
                            <td>
                              <p className="font-medium text-sm">{SIM_LABELS[sim.type] ?? sim.type}</p>
                              <p className="text-xs text-gray-400 font-mono">{sim.id.slice(0, 8)}…</p>
                            </td>
                            <td>
                              <span className={`badge ${statusColor(sim.status)}`}>{sim.status}</span>
                            </td>
                            <td>
                              <p className="text-sm">{fmtNum(sim.processed)}</p>
                              <p className="text-xs text-gray-400">{fmtNum(sim.succeeded)} ok / {fmtNum(sim.failed)} fail</p>
                            </td>
                            <td>
                              <span className={`font-bold text-sm ${successRate >= 90 ? 'text-green-600' : successRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {fmtPct(successRate)}
                              </span>
                            </td>
                            <td className="text-sm">{sim.avgLatencyMs.toFixed(2)}ms</td>
                            <td className="text-sm">{sim.p95LatencyMs.toFixed(2)}ms</td>
                            <td className="text-xs text-gray-500">
                              batch={cfg.batchSize} interval={cfg.intervalMs}ms
                            </td>
                            <td className="text-xs text-gray-500 whitespace-nowrap">{fmtDateTime(sim.startedAt)}</td>
                            <td className="text-xs text-gray-500">{duration != null ? `${duration}s` : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <Pagination
                    page={page} pages={pages} total={finished.length} perPage={perPage}
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

function SimCard({ sim, onStop }: { sim: Simulation; onStop: () => void }) {
  const successRate = sim.processed > 0 ? (sim.succeeded / sim.processed) * 100 : 0;
  const cfg = sim.config as Record<string, number>;
  const target = cfg.totalUsers > 0 ? cfg.totalUsers : null;
  const progress = target ? Math.min((sim.processed / target) * 100, 100) : null;

  return (
    <div className="card p-5 border-l-4" style={{ borderLeftColor: '#CC0000' }}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="font-semibold text-gray-800">{SIM_LABELS[sim.type] ?? sim.type}</p>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{sim.id.slice(0, 8)}…</p>
        </div>
        <button onClick={onStop}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
          <Square size={11} />
          Stop
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-lg font-bold text-gray-900">{fmtNum(sim.processed)}</p>
          <p className="text-xs text-gray-500">Processed</p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <p className="text-lg font-bold text-green-700">{fmtNum(sim.succeeded)}</p>
          <p className="text-xs text-gray-500">Succeeded</p>
        </div>
        <div className="text-center p-2 bg-red-50 rounded-lg">
          <p className="text-lg font-bold text-red-700">{fmtNum(sim.failed)}</p>
          <p className="text-xs text-gray-500">Failed</p>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <p className="text-lg font-bold text-blue-700">{fmtPct(successRate)}</p>
          <p className="text-xs text-gray-500">Success Rate</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
        <span>Avg: <strong className="text-gray-700">{sim.avgLatencyMs.toFixed(2)}ms</strong></span>
        <span>p95: <strong className="text-gray-700">{sim.p95LatencyMs.toFixed(2)}ms</strong></span>
        {sim.throughputPerSec && <span>Throughput: <strong className="text-gray-700">{sim.throughputPerSec}/s</strong></span>}
        {sim.elapsedMs && <span>Elapsed: <strong className="text-gray-700">{(sim.elapsedMs / 1000).toFixed(1)}s</strong></span>}
      </div>

      {progress !== null && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{fmtNum(sim.processed)} / {fmtNum(target!)}</span>
            <span>{fmtPct(progress)}</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2">
            <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: '#CC0000' }} />
          </div>
        </div>
      )}

      {sim.sampleErrors && sim.sampleErrors.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-red-600 cursor-pointer font-medium">
            {sim.sampleErrors.length} sample errors
          </summary>
          <div className="mt-2 bg-red-50 rounded p-2 space-y-1">
            {sim.sampleErrors.slice(0, 3).map((e, i) => (
              <p key={i} className="text-xs text-red-700 font-mono truncate">{e}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
