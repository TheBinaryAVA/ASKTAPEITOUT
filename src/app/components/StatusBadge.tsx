interface StatusBadgeProps {
  status: 'analyzing' | 'charting' | 'fixed' | 'needs-review' | 'critical' | 'warning' | 'info';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const statusConfig = {
  analyzing: { label: 'Analyzing', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', dot: true },
  charting: { label: 'Charting Path', color: 'var(--meridian-gold)', bg: 'rgba(212,175,55,0.12)', dot: true },
  fixed: { label: 'Fixed', color: '#10B981', bg: 'rgba(16,185,129,0.1)', dot: false },
  'needs-review': { label: 'Needs Review', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', dot: false },
  critical: { label: 'Critical', color: 'var(--topography-rust)', bg: 'rgba(194,65,12,0.1)', dot: false },
  warning: { label: 'Warning', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', dot: false },
  info: { label: 'Info', color: '#64748B', bg: 'rgba(100,116,139,0.1)', dot: false },
};

export function StatusBadge({ status, size = 'md', pulse = false }: StatusBadgeProps) {
  const config = statusConfig[status];
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const textSize = size === 'sm' ? 'text-xs' : 'text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${padding} ${textSize} font-medium`}
      style={{ background: config.bg, color: config.color, fontFamily: 'var(--font-ui)' }}
    >
      {config.dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${pulse ? 'animate-pulse' : ''}`}
          style={{ background: config.color }}
        />
      )}
      {config.label}
    </span>
  );
}
