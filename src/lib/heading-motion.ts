import gsap from 'gsap';

const heroSelector = 'h1, .hero-main-title, .page-header-title, .jobs-hero-title, .casos-hero-title, .perfiles-hero-title, .blog-hero-title, .about-hero-title, .article-headline';
const sectionSelector = 'h2, .section-heading, .bento-box-title, .enterprise-title, .split-title, .final-cta-title, .metrics-banner-title';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let cleanup: (() => void) | undefined;

async function initHeadingMotion() {
  cleanup?.();
  cleanup = undefined;
  if (reducedMotion.matches || (document.documentElement.dataset.session === 'member' && document.body.hasAttribute('data-app-surface'))) return;

  const controller = new AbortController();
  const context = gsap.context(() => {});
  const prepared: { heading: HTMLElement; words: HTMLElement[]; html: string; label: string | null }[] = [];
  let observer: IntersectionObserver | undefined;
  cleanup = () => {
    controller.abort();
    observer?.disconnect();
    context.revert();
    for (const { heading, html, label } of prepared) {
      heading.innerHTML = html;
      if (label === null) heading.removeAttribute('aria-label');
      else heading.setAttribute('aria-label', label);
    }
  };

  await document.fonts.ready;
  if (controller.signal.aborted) return;

  // Read visibility together before adding any spans. Native text wrapping is
  // preserved: no measured lines, block masks or rebuilding while scrolling.
  const headings = [...document.querySelectorAll<HTMLElement>(`${heroSelector}, ${sectionSelector}`)]
    .filter(heading => heading.getClientRects().length && !heading.querySelector('a, button, input, svg'));

  for (const heading of headings) {
    const text = heading.textContent?.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const entry = { heading, html: heading.innerHTML, label: heading.getAttribute('aria-label'), words: [] as HTMLElement[] };
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const part of node.data.match(/\s+|\S+/g) || []) {
        if (/^\s+$/.test(part)) fragment.append(document.createTextNode(part));
        else {
          const word = document.createElement('span');
          word.className = 'heading-word';
          word.setAttribute('aria-hidden', 'true');
          word.textContent = part;
          fragment.append(word);
          entry.words.push(word);
        }
      }
      node.replaceWith(fragment);
    }
    heading.setAttribute('aria-label', entry.label || text);
    prepared.push(entry);
  }

  context.add(() => {
    gsap.set(prepared.flatMap(entry => entry.words), { x: -16, opacity: 0 });
  });

  const pending = new Map(prepared.map(entry => [entry.heading, entry.words]));
  function reveal(heading: HTMLElement) {
    const words = pending.get(heading);
    if (!words || controller.signal.aborted) return;
    pending.delete(heading);
    context.add(() => {
      gsap.to(words, {
        x: 0, opacity: 1, duration: 0.45, ease: 'power3.out',
        stagger: { each: Math.min(0.09, 0.5 / Math.max(words.length - 1, 1)), from: 'start' },
        clearProps: 'transform,opacity',
      });
    });
  }

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target as HTMLElement);
        observer?.unobserve(entry.target);
      }
    }, { threshold: 0.01, rootMargin: '0px 0px 120px 0px' });
  }
  for (const { heading } of prepared) {
    if (heading.matches(heroSelector) || !observer) reveal(heading);
    else observer.observe(heading);
  }
}

document.addEventListener('astro:page-load', initHeadingMotion);
document.addEventListener('astro:before-swap', () => {
  cleanup?.();
  cleanup = undefined;
});
reducedMotion.addEventListener('change', initHeadingMotion);
