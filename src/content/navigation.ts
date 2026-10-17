/**
 * SPA Navigation watcher for LeetCode
 * Detects URL changes in Next.js / React client-side routing without full page reload.
 */
import { SlugChangeHandler, NavigationWatcher } from '../core/types';

/**
 * Extracts problem slug from LeetCode pathname
 * e.g. "/problems/two-sum/description/" -> "two-sum"
 */
export function extractProblemSlug(pathname: string = window.location.pathname): string | null {
  const match = pathname.match(/^\/problems\/([^/]+)/);
  if (!match) return null;
  const slug = match[1].trim();
  // Filter out any non-problem subpaths if any exist
  if (!slug || slug === 'all') return null;
  return slug;
}

/**
 * Monitors URL changes via history API patching, popstate, and a fallback interval ticker.
 */
export function initNavigationWatcher(onSlugChange: SlugChangeHandler): NavigationWatcher {
  let currentSlug = extractProblemSlug();
  let destroyed = false;

  const checkSlug = () => {
    if (destroyed) return;
    const newSlug = extractProblemSlug();
    if (newSlug !== currentSlug) {
      const oldSlug = currentSlug;
      currentSlug = newSlug;
      if (newSlug) {
        onSlugChange(newSlug, oldSlug);
      }
    }
  };

  // 1. Monkey patch pushState and replaceState if in browser environment
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    const res = originalPushState.apply(this, args);
    window.dispatchEvent(new CustomEvent('dsa:url_change'));
    return res;
  };

  history.replaceState = function (...args) {
    const res = originalReplaceState.apply(this, args);
    window.dispatchEvent(new CustomEvent('dsa:url_change'));
    return res;
  };

  // 2. Event listeners
  const handleUrlEvent = () => checkSlug();
  window.addEventListener('popstate', handleUrlEvent);
  window.addEventListener('dsa:url_change', handleUrlEvent);

  // 3. Fallback heartbeat interval (detects DOM/Next.js router edge cases)
  const intervalId = window.setInterval(checkSlug, 800);

  return {
    getCurrentSlug: () => currentSlug,
    destroy: () => {
      destroyed = true;
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleUrlEvent);
      window.removeEventListener('dsa:url_change', handleUrlEvent);
      window.clearInterval(intervalId);
    },
  };
}
