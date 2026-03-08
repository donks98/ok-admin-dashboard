interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 mb-7">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0 mt-0.5">{action}</div>
      )}
    </div>
  );
}
