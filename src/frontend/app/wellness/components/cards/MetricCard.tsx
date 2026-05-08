'use client';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'amber' | 'rose';
  loading?: boolean;
}

export const MetricCard = ({
  label,
  value,
  unit,
  icon,
  color = 'blue',
  loading
}: MetricCardProps) => {
  if (loading) {
    return <div className="bg-slate-100 rounded-lg p-4 h-32 animate-pulse" />;
  }

  const getColors = () => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'amber':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'rose':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getColors()}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium">{label}</p>
        {icon && <div className="text-lg">{icon}</div>}
      </div>
      <p className="text-2xl md:text-3xl font-bold">
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
    </div>
  );
};
