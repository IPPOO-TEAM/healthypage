// Setup commun aux tests Vitest.
//  - Côté node (default) : aucun polyfill nécessaire ; les modules qui
//    touchent à window/localStorage utilisent des stubs explicites.
//  - Côté jsdom (activé pour *.test.tsx via environmentMatchGlobs) : on
//    charge les matchers @testing-library/jest-dom et on branche le cleanup
//    automatique entre chaque test.

if (typeof window !== 'undefined') {
  const matchers = await import('@testing-library/jest-dom/matchers');
  const { expect, afterEach } = await import('vitest');
  expect.extend((matchers as { default?: unknown }).default ?? matchers);
  const { cleanup } = await import('@testing-library/react');
  afterEach(() => cleanup());
}
