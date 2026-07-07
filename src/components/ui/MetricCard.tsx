import { ArrowUpRight, type LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'highlight';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  tooltip?: string;
  loading?: boolean;
  onClick?: () => void;
  icon?: LucideIcon;
  color?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  variant = 'default',
  trend,
  tooltip,
  loading = false,
  onClick,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 animate-pulse min-h-[160px]">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
    );
  }

  const isHighlight = variant === 'highlight';

  const base =
    'group relative rounded-3xl p-6 min-h-[160px] flex flex-col justify-between transition-all duration-300 cursor-pointer';
  const styles = isHighlight
    ? 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-md hover:shadow-lg'
    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:shadow-md';

  return (
    <div className={`${base} ${styles}`} title={tooltip} onClick={onClick}>
      <div className="flex items-start justify-between">
        <h3
          className={`text-base font-semibold ${
            isHighlight ? 'text-white' : 'text-gray-900 dark:text-white'
          }`}
        >
          {title}
        </h3>
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 ${
            isHighlight
              ? 'bg-white/15 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      <div>
        <p
          className={`text-4xl font-bold leading-none mb-4 ${
            isHighlight ? 'text-white' : 'text-gray-900 dark:text-white'
          }`}
        >
          {value}
        </p>
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                isHighlight
                  ? 'bg-white/15 text-white'
                  : trend.isPositive
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}
            >
              <ArrowUpRight
                className={`h-3 w-3 ${trend.isPositive ? '' : 'rotate-90'}`}
              />
              {Math.abs(trend.value)}%
            </span>
          )}
          <p
            className={`text-xs ${
              isHighlight ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {subtitle || (trend ? (trend.isPositive ? 'Increased from last month' : 'Decreased from last month') : '')}
          </p>
        </div>
      </div>
    </div>
  );
}
