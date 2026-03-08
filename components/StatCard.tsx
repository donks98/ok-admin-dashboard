import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  iconColor?: string;   // Tailwind class e.g. "text-blue-600"
  iconBg?: string;      // Tailwind class e.g. "bg-blue-50"
  trend?: { value: string; up?: boolean; neutral?: boolean };
  accent?: string;      // CSS hex color e.g. "#3B82F6"
}

export default function StatCard({
  title, value, sub, icon: Icon,
  iconColor = 'text-gray-500',
  iconBg = 'bg-gray-100',
  trend,
  accent,
}: Props) {
  return (
    <div
      className="card fade-in p-5 relative overflow-hidden group cursor-default select-none"
      style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
      {/* Icon + Trend */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${iconBg}`}>
          <Icon size={18} className={iconColor} strokeWidth={2} />
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg
            ${trend.neutral
              ? 'bg-gray-100 text-gray-500'
              : trend.up
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'}`}>
            {!trend.neutral && (trend.up
              ? <TrendingUp size={10} strokeWidth={2.5} />
              : <TrendingDown size={10} strokeWidth={2.5} />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-[26px] font-bold leading-none tabular-nums text-gray-900 num mb-1.5">{value}</p>

      {/* Label */}
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{title}</p>

      {/* Sub */}
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}

      {/* Hover accent bar */}
      {accent && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, ${accent} 0%, transparent 100%)` }}
        />
      )}

      {/* Hover corner glow */}
      {accent && (
        <div
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)` }}
        />
      )}
    </div>
  );
}
