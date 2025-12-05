
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      let swUrl = './service-worker.js';

      try {
        // Attempt to construct an absolute URL to fix "Origin Mismatch" issues 
        // prevalent in cloud preview environments (editor domain vs preview domain).
        // We only do this if we are in a standard http context to avoid "Invalid URL" errors in srcdoc/sandboxes.
        if (window.location.protocol.startsWith('http')) {
           swUrl = new URL('service-worker.js', window.location.href).href;
        }
      } catch (error) {
        console.warn('Could not construct absolute Service Worker URL, falling back to relative path.', error);
      }

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch((error) => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
