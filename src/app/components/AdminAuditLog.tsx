import { useEffect, useState } from 'react';
import { Activity, Trash2 } from 'lucide-react';
import { readAudit, AuditEntry } from './adminSession';

const LABELS: Record<string, string> = {
  'login': 'Connexion',
  'logout': 'Déconnexion',
  'view-patient': 'Consultation patient',
  'cancel-rdv': 'Annulation RDV',
  'disable-pro': 'Désactivation praticien',
  'enable-pro': 'Réactivation praticien',
  'export-csv': 'Export CSV',
  'sos-acknowledge': 'SOS traité',
};

export function AdminAuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    const refresh = () => setEntries(readAudit());
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  const clear = () => {
    if (!confirm('Effacer tout le journal d\'audit ? (action irréversible)')) return;
    try { window.localStorage.removeItem('healthy-page:admin-audit'); } catch {}
    setEntries([]);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700" />
          <h2 className="font-semibold text-gray-900">Journal d'audit</h2>
          <span className="text-xs text-gray-500">({entries.length})</span>
        </div>
        {entries.length > 0 && (
          <button onClick={clear} className="text-xs text-rose-600 hover:text-rose-700 inline-flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Effacer
          </button>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="p-6 text-center text-sm text-gray-500">Aucune action enregistrée.</p>
      ) : (
        <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {entries.map((e) => (
            <li key={e.id} className="p-3 text-sm flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">{LABELS[e.action] ?? e.action}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(e.ts).toLocaleString('fr-FR')}</span>
                </div>
                <div className="text-xs text-gray-500 truncate">{e.actor}{e.target ? ` → ${e.target}` : ''}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
