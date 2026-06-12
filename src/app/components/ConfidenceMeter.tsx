interface ConfidenceMeterProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ConfidenceMeter({ score, size = 'md', showLabel = true }: ConfidenceMeterProps) {
  const color = score >= 85 ? 'var(--meridian-gold)' : score >= 60 ? '#F59E0B' : 'var(--topography-rust)';
  const label = score >= 85 ? 'High Confidence' : score >= 60 ? 'Moderate' : 'Low Confidence';

  const heights = { sm: 'h-1', md: 'h-1.5', lg: 'h-2' };
  const textSizes = { sm: 'text-xs', md: 'text-xs', lg: 'text-sm' };

  return (
    <div className="flex flex-col gap-1.5">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={`${textSizes[size]} font-medium`} style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-ui)' }}>
            Confidence
          </span>
          <span className={`${textSizes[size]} font-semibold`} style={{ color, fontFamily: 'var(--font-mono)' }}>
            {score}%
          </span>
        </div>
      )}
      <div className={`w-full rounded-full overflow-hidden ${heights[size]}`} style={{ background: 'rgba(0,0,0,0.08)' }}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-700`}
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs" style={{ color, fontFamily: 'var(--font-ui)' }}>{label}</span>
      )}
    </div>
  );
}
