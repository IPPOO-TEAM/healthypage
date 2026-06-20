import { useEffect } from 'react';

export type ShortcutMap = Record<string, (e: KeyboardEvent) => void>;

/**
 * Branche des raccourcis clavier globaux pendant le montage du composant.
 *
 * Format des clés :
 *   - "Escape", "Enter", "/", "?", "k", "ArrowDown"…
 *   - Avec modificateurs : "mod+k" (mod = Ctrl sous Windows/Linux, Cmd sous macOS)
 *   - "shift+/" pour "?"
 *
 * Les raccourcis sont ignorés si l'utilisateur est en train de taper dans un
 * champ texte/textarea/contenteditable, SAUF Escape qui passe toujours.
 *
 * Exemple :
 *   useShortcuts({
 *     'Escape': () => setOpen(false),
 *     'mod+k': (e) => { e.preventDefault(); openSearch(); },
 *     '/': (e) => { e.preventDefault(); focusSearch(); },
 *   });
 */
export function useShortcuts(map: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = !!target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );

      const key = e.key;
      const mod = e.metaKey || e.ctrlKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Construit la signature : "mod+shift+k"
      const parts: string[] = [];
      if (mod) parts.push('mod');
      if (alt) parts.push('alt');
      if (shift) parts.push('shift');
      parts.push(key.length === 1 ? key.toLowerCase() : key);
      const combo = parts.join('+');

      // Bloque la plupart des raccourcis pendant la saisie, sauf Escape.
      if (isTyping && key !== 'Escape') return;

      const handler = map[combo] ?? map[key] ?? (key.length === 1 ? map[key.toLowerCase()] : undefined);
      if (handler) handler(e);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [map, enabled]);
}
