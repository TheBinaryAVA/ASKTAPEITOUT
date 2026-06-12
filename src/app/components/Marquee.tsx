export function Marquee() {
  const message = "Routing a chip shouldn't feel like being lost in the dark.";
  // Repeat the message 8 times per block to easily span wide screens (e.g. 4K)
  const blockContent = Array(8).fill(message).join("  •  ") + "  •  ";

  return (
    <div 
      className="w-full overflow-hidden whitespace-nowrap flex select-none py-2 border-b"
      style={{
        background: 'var(--abyss-ink)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        color: 'var(--meridian-gold)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.05em',
      }}
    >
      <div className="marquee-track">
        <span className="inline-block px-4">
          {blockContent}
        </span>
        <span className="inline-block px-4" aria-hidden="true">
          {blockContent}
        </span>
      </div>
    </div>
  );
}
