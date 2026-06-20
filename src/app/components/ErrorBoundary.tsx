import { Component, ErrorInfo, Fragment, ReactNode, Suspense } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Si fourni, affiche un fallback local compact (au lieu du fallback plein écran). */
  scope?: string;
  /** Callback optionnel quand l'utilisateur réessaie. */
  onReset?: () => void;
}
interface State { error: Error | null; attempt: number; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, attempt: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Healthy Page – erreur non gérée${this.props.scope ? ` [${this.props.scope}]` : ''} :`, error, info.componentStack);
  }

  reset = () => {
    this.setState((s) => ({ error: null, attempt: s.attempt + 1 }));
    this.props.onReset?.();
  };

  hardReload = () => {
    this.setState({ error: null, attempt: 0 });
    try { window.location.reload(); } catch {}
  };

  goHome = () => {
    this.setState({ error: null, attempt: 0 });
    try { window.location.href = '/'; } catch {}
  };

  render() {
    if (!this.state.error) {
      // `key` force le remount du sous-arbre quand on reset, ce qui relance
      // les imports lazy qui ont échoué (chunk load error, etc.).
      return <Fragment key={this.state.attempt}>{this.props.children}</Fragment>;
    }

    // Fallback compact pour erreurs locales (route lazy en échec).
    if (this.props.scope) {
      return (
        <div className="m-4 rounded-2xl bg-white ring-1 ring-rose-100 p-4 text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="font-bold text-slate-900">Impossible de charger cette page</div>
          <p className="text-sm text-slate-600 mt-1">
            Vérifiez votre connexion puis réessayez.
          </p>
          <pre className="mt-2 text-[10px] text-left bg-slate-50 rounded-lg p-2 overflow-auto max-h-20 text-slate-500">
            {this.state.error.message}
          </pre>
          <div className="mt-3 flex gap-2 justify-center">
            <button onClick={this.reset}
              className="h-10 px-4 rounded-xl bg-teal-600 text-white font-bold inline-flex items-center gap-2 hover:brightness-105">
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
            <button onClick={this.hardReload}
              className="h-10 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold">
              Recharger
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-emerald-50 via-white to-rose-50/40 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 p-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Une erreur est survenue</h2>
          <p className="text-sm text-slate-600 mt-2">
            Pas de panique, vos données restent en sécurité. Rechargez la page ou revenez à l'accueil.
          </p>
          <pre className="mt-3 text-[10px] text-left bg-slate-50 rounded-lg p-2 overflow-auto max-h-24 text-slate-500">
            {this.state.error.message}
          </pre>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button onClick={this.hardReload}
              className="h-11 rounded-xl bg-emerald-600 text-white font-bold inline-flex items-center justify-center gap-2 hover:brightness-105">
              <RefreshCw className="w-4 h-4" /> Recharger
            </button>
            <button onClick={this.goHome}
              className="h-11 rounded-xl bg-slate-100 text-slate-700 font-bold inline-flex items-center justify-center gap-2 hover:bg-slate-200">
              <Home className="w-4 h-4" /> Accueil
            </button>
          </div>
        </div>
      </div>
    );
  }
}

/** Combine ErrorBoundary (scope local) + Suspense pour les routes lazy. */
export function SafeSuspense({
  children,
  fallback,
  scope = 'lazy-route',
}: { children: ReactNode; fallback?: ReactNode; scope?: string }) {
  return (
    <ErrorBoundary scope={scope}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
