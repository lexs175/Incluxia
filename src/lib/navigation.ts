import type { TransitionBeforeSwapEvent } from 'astro:transitions/client';

document.addEventListener('astro:before-swap', (event: TransitionBeforeSwapEvent) => {
  const session = document.documentElement.dataset.session === 'member' ? 'member' : 'guest';

  // Apply the session before Astro installs the incoming document and captures it.
  event.newDocument.documentElement.dataset.session = session;

  // Account pages update directly, including Astro's non-native fallback.
  if (session === 'member') {
    // Skipping a native transition intentionally rejects its ready promise.
    void event.viewTransition.ready.catch((error: DOMException) => {
      if (error.name !== 'AbortError') throw error;
    });
    event.viewTransition.skipTransition();
  }
});
