interface Props { message?: string; }

export default function EmptyState({ message = 'No data available yet.' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <span className="text-2xl">📭</span>
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
