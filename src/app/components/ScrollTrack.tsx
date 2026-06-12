import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollTrack() {
  const activePathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const activePath = activePathRef.current;
    if (!activePath) return;

    // Measure path length in SVG coordinate space with a safe fallback
    let length = 1025;
    try {
      const measured = activePath.getTotalLength();
      if (measured > 0) length = measured;
    } catch (e) {
      // Safe fallback if SVG is not fully initialized
    }

    // Set initial stroke dash properties
    gsap.set(activePath, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1,
      onUpdate: (self) => {
        gsap.set(activePath, {
          strokeDashoffset: length * (1 - self.progress),
          opacity: self.progress > 0.95
              ? (1 - (self.progress - 0.95) / 0.05)
              : 1,
        });
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  // Symmetric repeating squiggly path
  const pathD = "M 12,0 C 18,80 6,120 12,200 C 18,280 6,320 12,400 C 18,480 6,520 12,600 C 18,680 6,720 12,800 C 18,880 6,920 12,1000";

  return (
      <div className="hidden lg:flex fixed top-0 left-8 w-6 h-screen flex-col items-center py-4 select-none pointer-events-none z-50">
        {/* Track container SVG */}
        <svg
            className="flex-1 w-full"
            viewBox="0 0 24 1000"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background squiggly path (faint guide) - 2.5px thickness */}
          <path
              d={pathD}
              stroke="rgba(100, 116, 139, 0.12)"
              strokeWidth="2.5"
              strokeLinecap="round"
          />

          {/* Foreground active progress squiggly path (gold) - 2.5px thickness */}
          <path
              ref={activePathRef}
              d={pathD}
              stroke="var(--meridian-gold)"
              strokeWidth="2.5"
              strokeLinecap="round"
          />
        </svg>
      </div>
  );
}