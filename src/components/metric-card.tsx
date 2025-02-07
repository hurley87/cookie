interface MetricCardProps {
  label: string;
  value: string;
  change: number;
}

export function MetricCard({ label, value, change }: MetricCardProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      {change !== 0 && (
        <div
          className={`text-sm ${
            change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
        </div>
      )}
    </div>
  );
}
