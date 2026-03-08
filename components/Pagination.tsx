import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  pages: number;
  total: number;
  perPage: number;
  onChange: (p: number) => void;
  onPerPageChange?: (n: number) => void;
  perPageOptions?: number[];
}

export default function Pagination({
  page, pages, total, perPage, onChange,
  onPerPageChange, perPageOptions = [10, 25, 50, 100],
}: Props) {
  const from = (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  // Build visible page numbers: always show first, last, and ±1 around current
  const visible = new Set<number>();
  visible.add(1);
  visible.add(pages);
  for (let i = Math.max(1, page - 1); i <= Math.min(pages, page + 1); i++) visible.add(i);
  const pageNums = Array.from(visible).sort((a, b) => a - b);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm flex-wrap gap-2">
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">
          {total === 0 ? '0' : `${from}–${to}`} of {total.toLocaleString()}
        </span>
        {onPerPageChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Rows:</span>
            <select
              value={perPage}
              onChange={(e) => { onPerPageChange(Number(e.target.value)); onChange(1); }}
              className="text-xs border border-gray-200 rounded-md px-1.5 py-0.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/30 cursor-pointer"
            >
              {perPageOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(page - 1)}
            disabled={page === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>

          {pageNums.map((p, i) => (
            <span key={p} className="flex items-center gap-1">
              {i > 0 && pageNums[i - 1] !== p - 1 && (
                <span className="w-4 text-center text-gray-300 text-xs">…</span>
              )}
              <button
                onClick={() => onChange(p)}
                className="w-8 h-8 rounded-lg text-xs font-medium transition-colors"
                style={
                  p === page
                    ? { backgroundColor: '#CC0000', color: '#FFFFFF' }
                    : { color: '#6B7280' }
                }
                onMouseEnter={(e) => { if (p !== page) (e.currentTarget as HTMLElement).style.backgroundColor = '#F3F4F6'; }}
                onMouseLeave={(e) => { if (p !== page) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                {p}
              </button>
            </span>
          ))}

          <button
            onClick={() => onChange(page + 1)}
            disabled={page === pages}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
