// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { OfflineBanner } from './OfflineBanner';
import { clearQueue, enqueue } from './offlineQueue';

function setOnline(v: boolean) {
  Object.defineProperty(window.navigator, 'onLine', { value: v, configurable: true });
}

beforeEach(() => {
  clearQueue();
  setOnline(true);
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  clearQueue();
});

describe('<OfflineBanner />', () => {
  it('ne rend rien quand on est en ligne et que la file est vide', () => {
    const { container } = render(<OfflineBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('affiche le bandeau ambré quand offline + pastille N en attente', () => {
    setOnline(false);
    enqueue({ kind: 'createNote', url: '/x', method: 'POST' });
    render(<OfflineBanner />);
    expect(screen.getByRole('status')).toHaveTextContent(/Connexion perdue/);
    expect(screen.getByText(/1 en attente/)).toBeInTheDocument();
  });

  it('affiche "Synchronisation… N action(s) en attente" en ligne avec file non vide', () => {
    enqueue({ kind: 'a', url: '/a', method: 'POST' });
    enqueue({ kind: 'b', url: '/b', method: 'POST' });
    render(<OfflineBanner />);
    expect(screen.getByRole('status')).toHaveTextContent(/Synchronisation/);
    expect(screen.getByRole('status')).toHaveTextContent(/2 actions en attente/);
  });

  it('réagit aux events online/offline', () => {
    render(<OfflineBanner />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/Connexion perdue/);
  });
});
