import { AppRouter } from './routes';
import { LocaleProvider } from './i18n';
import { AIAssistant } from './components/AIAssistant';
import { UniversalAuthProvider } from './auth/UniversalAuth';
import { GlobalTranslator } from './i18n/GlobalTranslator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner';
import { HpToaster } from './components/Notify';
import { installCSP } from './components/csp';
import { installAutoFlush } from './components/offlineQueue';
import { replayMutation } from './components/api';

// Installer la CSP avant tout rendu (idempotent, no-op côté Node).
try { installCSP(); } catch { /* noop */ }
// Rejeu automatique des mutations enfilées hors-ligne à la reconnexion.
try { installAutoFlush(replayMutation); } catch { /* noop */ }

// PWA (manifest, SW, install banner) chargé en différé via useEffect dans
// AppShell pour éviter tout impact sur le rendu initial. Voir components/pwa.ts.

export default function App() {
  return (
    <ErrorBoundary>
      <a href="#hp-main" className="hp-skip-link">Aller au contenu principal</a>
      <OfflineBanner />
      <LocaleProvider>
        <UniversalAuthProvider>
          <div id="hp-main" tabIndex={-1}>
            <AppRouter />
          </div>
          <AIAssistant />
          <GlobalTranslator />
          <HpToaster />
        </UniversalAuthProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}
