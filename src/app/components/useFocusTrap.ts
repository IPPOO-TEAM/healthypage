import { RefObject, useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

/**
 * Piège le focus clavier dans un conteneur (modale, feuille, drawer).
 * - Place le focus sur le premier élément focusable à l'ouverture.
 * - Boucle Tab/Shift+Tab à l'intérieur du conteneur.
 * - Restaure le focus précédent à la fermeture.
 *
 * @param ref       Conteneur à piéger.
 * @param active    Active/désactive le trap (typiquement l'état "open" de la modale).
 */
export function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusables = (): HTMLElement[] => {
      return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
    };

    // Focus initial : premier élément focusable, sinon le conteneur.
    const focusables = getFocusables();
    (focusables[0] ?? container).focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = getFocusables();
      if (list.length === 0) { e.preventDefault(); return; }
      const first = list[0];
      const last = list[list.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (current === first || !container.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (current === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      // Restaure le focus à l'élément qui avait le focus avant l'ouverture.
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [ref, active]);
}
