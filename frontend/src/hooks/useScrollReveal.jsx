import { useEffect, useRef } from 'react';

/**
 * Attaches an IntersectionObserver to a container element.
 * Any child with data-reveal will be animated when it
 * enters the viewport.
 *
 * Uses a standard useRef + polling approach so it works
 * even when the container mounts after the initial render
 * (e.g. conditional sections).
 *
 * Usage:
 *   const sectionRef = useScrollReveal();
 *   <section ref={sectionRef}>
 *     <div data-reveal="true" data-delay="0">...</div>
 *   </section>
 */
export default function useScrollReveal(threshold = 0.05) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay || '0';
            el.style.transitionDelay = `${delay}ms`;
            el.classList.add('revealed');
            io.unobserve(el);
          }
        });
      },
      { threshold }
    );

    // Observe all current [data-reveal] elements
    const observeAll = () => {
      root.querySelectorAll('[data-reveal]').forEach((el) => {
        if (!el.classList.contains('revealed')) {
          io.observe(el);
        }
      });
    };

    observeAll();

    // Watch for dynamically added children (e.g. after state change)
    const mo = new MutationObserver(() => observeAll());
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [threshold]);

  return ref;
}
