import { Outlet, useLocation, useNavigate } from 'react-router';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BrandedBackground } from './BrandedBackground';
import { ScrollTrack } from './ScrollTrack';
import { Marquee } from './Marquee';

gsap.registerPlugin(ScrollTrigger);

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAtlasWorkspace = location.pathname === '/atlas';
  const isLoginPage = location.pathname === '/login';

  const [isPreloading, setIsPreloading] = useState(true);
  const preloaderContainerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const isFirstRender = useRef(true);

  // 1. Initial Preloader (runs once on mount)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsPreloading(false);
        }
      });

      // Stagger logo reveal
      tl.fromTo('.preloader-logo', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
      .to('.preloader-line', 
        { width: 140, duration: 0.6, ease: 'power2.inOut' }, 
        '-=0.2'
      )
      .to('.preloader-logo, .preloader-line', 
        { opacity: 0, y: -20, duration: 0.5, ease: 'power3.in' },
        '+=0.5'
      )
      // Curtain split wipe reveal
      .to('.preloader-curtain', {
        yPercent: -100,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power4.inOut'
      }, '-=0.1');

    }, preloaderContainerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // 2. Lenis Setup (runs when isAtlasWorkspace changes)
  useEffect(() => {
    if (isAtlasWorkspace) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [isAtlasWorkspace]);

  // 3. Scroll to Top on Route Change
  useEffect(() => {
    if (isPreloading) return;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [location.pathname, isPreloading]);

  // 3.5 Page Slide Transition
  useLayoutEffect(() => {
    if (isPreloading) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const main = document.querySelector('main');
    if (!main) return;

    gsap.fromTo(
      main,
      {
        x: 150,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
      }
    );
  }, [location.pathname, isPreloading]);


  // 4. Global Scroll Reveals (Headings character-reveal + Cards spring stagger)
  useEffect(() => {
    if (isPreloading) return;

    let scrollTriggers: ScrollTrigger[] = [];

    const timer = setTimeout(() => {
      const headings = document.querySelectorAll('main h1, main h2');
      const cards = document.querySelectorAll('.scroll-reveal-card');

      // A. Setup Headings character-staggered reveals
      headings.forEach((heading) => {
        if (heading.getAttribute('data-split') === 'true') return;

        // Save original children nodes list to process elements properly
        const nodesList = Array.from(heading.childNodes);
        heading.innerHTML = ''; // Clear text content
        heading.setAttribute('data-split', 'true');

        const charElements: HTMLElement[] = [];
        const highlightCharElements: HTMLElement[] = [];
        let cursorEl: HTMLElement | null = null;

        nodesList.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent || '';
            const words = textContent.split(' ');
            words.forEach((word, wordIdx) => {
              if (!word && wordIdx > 0) return;
              const wordSpan = document.createElement('span');
              wordSpan.className = 'inline-block whitespace-nowrap';

              const chars = Array.from(word);
              chars.forEach((char) => {
                const charSpan = document.createElement('span');
                charSpan.className = 'char-span inline-block opacity-0 translate-y-[40%]';
                charSpan.textContent = char;
                wordSpan.appendChild(charSpan);
                charElements.push(charSpan);
              });

              heading.appendChild(wordSpan);
              if (wordIdx < words.length - 1) {
                heading.appendChild(document.createTextNode(' '));
              }
            });
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const isHighlight = el.classList.contains('highlight-word');

            const wordSpan = document.createElement('span');
            wordSpan.className = `inline-block whitespace-nowrap relative ${el.className}`;

            let bgHighlight: HTMLElement | null = null;
            if (isHighlight) {
              // Create a background block highlight
              bgHighlight = document.createElement('span');
              bgHighlight.className = 'absolute inset-0 bg-[#D4AF37]/15 scale-x-0 origin-left rounded-sm -z-1 px-1.5 -mx-1.5';
              bgHighlight.style.transform = 'scaleX(0)'; // start at scale 0
              wordSpan.appendChild(bgHighlight);
            }

            const textContent = el.textContent || '';
            const chars = Array.from(textContent);
            chars.forEach((char) => {
              const charSpan = document.createElement('span');
              charSpan.className = 'char-span inline-block opacity-0 translate-y-[40%]';
              charSpan.textContent = char;
              wordSpan.appendChild(charSpan);
              charElements.push(charSpan);
              if (isHighlight) {
                highlightCharElements.push(charSpan);
              }
            });

            if (isHighlight) {
              // Blinking cursor
              cursorEl = document.createElement('span');
              cursorEl.className = 'typing-cursor inline-block w-[2px] h-[0.8em] bg-[#D4AF37] align-middle ml-0.5 opacity-0';
              cursorEl.style.animation = 'blink 0.8s infinite';
              wordSpan.appendChild(cursorEl);
            }

            heading.appendChild(wordSpan);
          }
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heading,
            start: 'top 88%',
            toggleActions: 'play none none none',
          }
        });

        // Loop through all child nodes of the heading in order (left-to-right)
        const childSpans = Array.from(heading.children) as HTMLElement[];
        childSpans.forEach((span, spanIdx) => {
          const isHighlight = span.classList.contains('highlight-word');
          const charSpans = Array.from(span.querySelectorAll('.char-span')) as HTMLElement[];
          const isFirst = spanIdx === 0;

          if (!isHighlight) {
            // Normal word span: animate characters staggered
            tl.to(charSpans, {
              opacity: 1,
              y: 0,
              duration: 0.25,
              stagger: 0.03,
              ease: 'power2.out',
            }, isFirst ? undefined : '-=0.15');
          } else {
            // Highlighted word span:
            const bgHighlight = span.querySelector('.absolute') as HTMLElement | null;
            const cursorEl = span.querySelector('.typing-cursor') as HTMLElement | null;

            // Show cursor and scale background block
            tl.to(cursorEl, { opacity: 1, duration: 0.05 }, isFirst ? undefined : '-=0.1')
              .to(bgHighlight, { scaleX: 1, duration: 0.2, ease: 'power2.out' }, '-=0.05')
              // Type characters out
              .to(charSpans, {
                opacity: 1,
                y: 0,
                duration: 0.25,
                stagger: 0.04,
                ease: 'none',
              })
              // Settle highlighted word
              .add(() => {
                gsap.to(cursorEl, { opacity: 0, duration: 0.2, delay: 0.4 });
                if (bgHighlight) {
                  gsap.to(bgHighlight, { opacity: 0, duration: 0.3, ease: 'power2.in', delay: 0.4 });
                }
                gsap.to(charSpans, {
                  color: 'inherit',
                  duration: 0.4,
                  delay: 0.4,
                });
              });
          }
        });

        if (tl.scrollTrigger) {
          scrollTriggers.push(tl.scrollTrigger);
        }
      });

      // B. Setup Cards spring/bounce stagger reveals
      const cardContainers = new Set<Element>();
      cards.forEach((card) => {
        const parent = card.parentElement;
        if (parent) cardContainers.add(parent);
      });

      cardContainers.forEach((container) => {
        const containerCards = container.querySelectorAll('.scroll-reveal-card');
        
        gsap.set(containerCards, { opacity: 0, y: 70 });

        const st = ScrollTrigger.create({
          trigger: container,
          start: 'top 88%',
          onEnter: () => {
            gsap.to(containerCards, {
              opacity: 1,
              y: 0,
              duration: 1.0,
              stagger: 0.1,
              ease: 'back.out(1.4)', // Premium spring/bounce ease
              overwrite: 'auto',
            });
          },
          once: true,
        });
        scrollTriggers.push(st);
      });

      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      scrollTriggers.forEach((st) => st.kill());
    };
  }, [location.pathname, isPreloading]);

  return (
    <div className={`min-h-screen flex flex-col relative ${isLoginPage ? 'h-screen overflow-hidden' : ''}`} style={{ fontFamily: 'var(--font-ui)' }}>
      <BrandedBackground />
      <ScrollTrack />
      {/* 1. INITIAL PRELOADER OVERLAY */}
      {isPreloading && (
        <div 
          ref={preloaderContainerRef} 
          className="fixed inset-0 z-[99999] flex pointer-events-auto select-none"
        >
          {/* Curtains */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="preloader-curtain flex-1 h-full bg-[#0F172A]" />
            ))}
          </div>
          
          {/* Brand Text Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="overflow-hidden h-9">
              <span className="preloader-logo block text-[#D4AF37] font-bold text-2xl tracking-widest font-mono">
                ATLAS / TAPEITOUT
              </span>
            </div>
            <div className="preloader-line w-0 h-[2px] bg-[#D4AF37] mt-3" />
          </div>
        </div>
      )}

      {!isLoginPage && <Navigation />}
      {!isLoginPage && <div className="h-16 shrink-0" />}
      <Marquee />
      <main className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </main>
      {!isAtlasWorkspace && !isLoginPage && <Footer />}
    </div>
  );
}
