export function BrandedBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none -z-10 transition-colors duration-500"
      style={{
        background: `
          radial-gradient(circle at 15% 15%, rgba(212, 175, 55, 0.06) 0%, transparent 45%),
          radial-gradient(circle at 85% 85%, rgba(15, 23, 42, 0.04) 0%, transparent 55%),
          radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.025) 0%, transparent 60%),
          var(--background)
        `
      }}
    />
  );
}
