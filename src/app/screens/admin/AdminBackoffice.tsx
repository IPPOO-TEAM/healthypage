import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Shield, Users, Stethoscope, Building2, Calendar, LogOut, Search, ChevronRight, BarChart3, Download, X, Ban, CheckCircle2, Trash2, CheckSquare, Square, Baby, Globe, Utensils, HandHeart, HeartHandshake, RefreshCw, Activity, Clock, FileText } from 'lucide-react';
import { api } from '../../components/api';
import { AdminSOSPanel } from '../../components/AdminSOSPanel';
import { AdminToastProvider, useToast, useSessionWatchdog } from '../../components/AdminToast';
import { RdvTrendChart, RdvStatusChart, ProSpecialtyChart } from '../../components/AdminCharts';
import { AdminPatientDetail } from '../../components/AdminPatientDetail';
import { AdminAuditLog } from '../../components/AdminAuditLog';
import { AdminCms } from '../../components/AdminCms';
import { endAdminSession, getAdminSession, logAudit } from '../../components/adminSession';

interface Props { onLogout: () => void; }

type Tab = 'overview' | 'patients' | 'pros' | 'centres' | 'rdvs' | 'cms' | 'audit';

type RdvStatus = 'all' | 'proposed' | 'confirmed' | 'cancelled';

export default function AdminBackoffice(props: Props) {
  return (
    <AdminToastProvider>
      <AdminBackofficeInner {...props} />
    </AdminToastProvider>
  );
}

function AdminBackofficeInner({ onLogout }: Props) {
  const navigate = useNavigate();
  const { push } = useToast();
  const session = getAdminSession();
  const adminEmail = session?.email ?? 'admin@healthypage.com';
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const rdvStatus: RdvStatus = (['all', 'proposed', 'confirmed', 'cancelled'] as const).includes(statusParam as RdvStatus)
    ? (statusParam as RdvStatus)
    : 'all';
  const setRdvStatus = (s: RdvStatus) => {
    const next = new URLSearchParams(searchParams);
    if (s === 'all') next.delete('status'); else next.set('status', s);
    setSearchParams(next, { replace: true });
  };
  const tabParam = searchParams.get('tab');
  const tab: Tab = (['overview', 'patients', 'pros', 'centres', 'rdvs', 'cms', 'audit'] as const).includes(tabParam as Tab)
    ? (tabParam as Tab)
    : 'overview';
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useSessionWatchdog(() => {
    push('error', 'Session expirée. Veuillez vous reconnecter.');
    onLogout();
  });
  const setTab = (t: Tab) => {
    const next = new URLSearchParams(searchParams);
    if (t === 'overview') next.delete('tab'); else next.set('tab', t);
    setSearchParams(next, { replace: true });
  };
  const handleLogout = () => {
    if (!confirm('Confirmer la déconnexion ?')) return;
    endAdminSession();
    onLogout();
  };
  const [stats, setStats] = useState<any>({ patients: 0, pros: 0, centres: 0, rdvs: 0 });
  const [patients, setPatients] = useState<any[]>([]);
  const [pros, setPros] = useState<any[]>([]);
  const [centres, setCentres] = useState<any[]>([]);
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selectedPro, setSelectedPro] = useState<any | null>(null);
  const [proBusy, setProBusy] = useState(false);
  const [selectedRdvIds, setSelectedRdvIds] = useState<Set<string>>(new Set());
  const [selectedProIds, setSelectedProIds] = useState<Set<string>>(new Set());
  const [batchBusy, setBatchBusy] = useState(false);
  const [proBatchBusy, setProBatchBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sosPending, setSosPending] = useState(0);

  useEffect(() => {
    const read = () => {
      try {
        const raw = window.localStorage.getItem('healthy-page:sos-alerts');
        if (!raw) return setSosPending(0);
        const list = JSON.parse(raw) as Array<{ acknowledged?: boolean }>;
        setSosPending(list.filter((a) => !a.acknowledged).length);
      } catch { setSosPending(0); }
    };
    read();
    const t = setInterval(read, 4000);
    const onStore = (e: StorageEvent) => { if (e.key === 'healthy-page:sos-alerts') read(); };
    window.addEventListener('storage', onStore);
    return () => { clearInterval(t); window.removeEventListener('storage', onStore); };
  }, []);

  const loadAll = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const [s, pat, pr, ce, rd] = await Promise.all([
        api.adminStats().catch(() => ({ patients: 0, pros: 0, centres: 0, rdvs: 0 })),
        api.adminPatients().catch(() => []),
        api.listPros().catch(() => []),
        api.listCentres().catch(() => []),
        api.adminRdvs().catch(() => [])
      ]);
      setStats(s);
      setPatients(pat ?? []);
      setPros(pr ?? []);
      setCentres(ce ?? []);
      setRdvs(rd ?? []);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
    const t = setInterval(() => loadAll(true), 60_000);
    return () => clearInterval(t);
  }, []);

  const todayIso = new Date().toISOString().slice(0, 10);
  const todayRdvCount = useMemo(
    () => rdvs.filter((r) => (r.date ?? '').slice(0, 10) === todayIso && r.status !== 'cancelled').length,
    [rdvs, todayIso]
  );
  const disabledProsCount = useMemo(() => pros.filter((p) => p.disabled).length, [pros]);

  const TABS: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Aperçu', icon: BarChart3 },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'pros', label: 'Praticiens', icon: Stethoscope, badge: disabledProsCount },
    { id: 'centres', label: 'Centres', icon: Building2 },
    { id: 'rdvs', label: 'RDV', icon: Calendar, badge: todayRdvCount },
    { id: 'cms', label: 'CMS', icon: FileText },
    { id: 'audit', label: 'Audit', icon: Activity },
  ];

  const patientName = (id?: string) => {
    const p = patients.find((x) => x.id === id);
    return p ? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || id : id ?? ', ';
  };
  const proName = (id?: string) => {
    const p = pros.find((x) => x.id === id);
    return p?.name ?? id ?? ', ';
  };

  const filteredRdvs = () =>
    rdvs
      .filter((r) => rdvStatus === 'all' || (r.status ?? 'confirmed') === rdvStatus)
      .filter((r) => !dateFrom || (r.date ?? '') >= dateFrom)
      .filter((r) => !dateTo || (r.date ?? '') <= dateTo)
      .filter((r) => filterFn(`${patientName(r.patientId)} ${proName(r.proId)} ${r.motif ?? ''}`))
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  const buildCsv = (rows: any[]) => {
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Date', 'Heure', 'Patient', 'Praticien', 'Motif', 'Type', 'Statut'];
    const body = rows.map((r) => [
      r.date ?? '', r.time ?? '', patientName(r.patientId), proName(r.proId),
      r.motif ?? '', r.type ?? '', r.status ?? 'confirmed'
    ].map(esc).join(','));
    return [header.map(esc).join(','), ...body].join('\n');
  };

  const downloadCsv = (rows: any[], suffix: string) => {
    const blob = new Blob(["\uFEFF" + buildCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rdv-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const rows = filteredRdvs();
    downloadCsv(rows, rdvStatus);
    logAudit('export-csv', adminEmail, `rdv-${rdvStatus}-${rows.length}`);
    push('success', `${rows.length} rendez-vous exportés.`);
  };

  const exportSelectedCsv = () => {
    const rows = rdvs.filter((r) => selectedRdvIds.has(r.id));
    if (!rows.length) return;
    downloadCsv(rows, `selection-${rows.length}`);
    logAudit('export-csv', adminEmail, `selection-${rows.length}`);
    push('success', `${rows.length} rendez-vous exportés.`);
  };

  const toggleRdv = (id: string) => {
    setSelectedRdvIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    const visible = filteredRdvs();
    const allSelected = visible.length > 0 && visible.every((r) => selectedRdvIds.has(r.id));
    setSelectedRdvIds((prev) => {
      const next = new Set(prev);
      if (allSelected) visible.forEach((r) => next.delete(r.id));
      else visible.forEach((r) => next.add(r.id));
      return next;
    });
  };

  const cancelSelected = async () => {
    const targets = rdvs.filter((r) => selectedRdvIds.has(r.id) && r.status !== 'cancelled');
    if (!targets.length) return;
    if (!confirm(`Annuler ${targets.length} rendez-vous ?`)) return;
    setBatchBusy(true);
    let ok = 0, fail = 0;
    try {
      await Promise.all(targets.map(async (r) => {
        try {
          await api.updateRdv(r.patientId, r.id, { status: 'cancelled' });
          logAudit('cancel-rdv', adminEmail, r.id);
          ok++;
        } catch (e) { fail++; console.error(`cancel rdv ${r.id} failed`, e); }
      }));
      setRdvs((prev) => prev.map((r) => selectedRdvIds.has(r.id) ? { ...r, status: 'cancelled' } : r));
      setSelectedRdvIds(new Set());
      if (fail === 0) push('success', `${ok} rendez-vous annulé(s).`);
      else push('error', `${ok} annulé(s), ${fail} en erreur.`);
    } finally {
      setBatchBusy(false);
    }
  };

  const toggleProId = (id: string) => {
    setSelectedProIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const bulkSetProsDisabled = async (disabled: boolean) => {
    const targets = pros.filter((p) => selectedProIds.has(p.id) && !!p.disabled !== disabled);
    if (!targets.length) return;
    if (!confirm(`${disabled ? 'Désactiver' : 'Réactiver'} ${targets.length} praticien(s) ?`)) return;
    setProBatchBusy(true);
    let ok = 0, fail = 0;
    try {
      await Promise.all(targets.map(async (p) => {
        try {
          const updated = await api.updatePro(p.id, { disabled });
          setPros((prev) => prev.map((x) => x.id === p.id ? updated : x));
          logAudit(disabled ? 'disable-pro' : 'enable-pro', adminEmail, p.id);
          ok++;
        } catch (e) { fail++; console.error('bulk pro toggle', e); }
      }));
      setSelectedProIds(new Set());
      if (fail === 0) push('success', `${ok} praticien(s) ${disabled ? 'désactivé(s)' : 'réactivé(s)'}.`);
      else push('error', `${ok} OK, ${fail} en erreur.`);
    } finally {
      setProBatchBusy(false);
    }
  };

  const togglePro = async (disabled: boolean) => {
    if (!selectedPro) return;
    setProBusy(true);
    try {
      const updated = await api.updatePro(selectedPro.id, { disabled });
      setPros((prev) => prev.map((p) => p.id === selectedPro.id ? updated : p));
      setSelectedPro(updated);
      logAudit(disabled ? 'disable-pro' : 'enable-pro', adminEmail, selectedPro.id);
      push('success', disabled ? 'Praticien désactivé.' : 'Praticien réactivé.');
    } catch (e) {
      console.error('toggle pro disabled failed', e);
      push('error', 'Échec de la mise à jour.');
    } finally {
      setProBusy(false);
    }
  };

  const filterFn = (label: string) => {
    const q = query.toLowerCase().trim();
    return !q || label.toLowerCase().includes(q);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12 relative lg:flex">
      <AdminSOSPanel />

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-2xl"><Shield className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-white/80 uppercase tracking-widest">Back-office</p>
              <h1 className="font-bold text-lg">Healthy Page</h1>
            </div>
          </div>
          <div className="mt-3 text-xs text-white/70 truncate" title={adminEmail}>{adminEmail}</div>
          <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-white/60">
            <Clock className="w-3 h-3" />
            <span>MAJ {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {sosPending > 0 && (
            <div className="mt-3 inline-flex items-center gap-1 bg-rose-500/90 text-white px-2 py-1 rounded-full text-[11px] font-semibold animate-pulse">
              <Activity className="w-3 h-3" /> {sosPending} SOS en attente
            </div>
          )}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2.5 transition ${
                  active ? 'bg-white text-slate-900 shadow-sm' : 'text-white/85 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{t.label}</span>
                {t.badge ? (
                  <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-semibold ${
                    active ? 'bg-slate-900 text-white' : 'bg-rose-500 text-white'
                  }`}>{t.badge}</span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <button
            onClick={() => loadAll(false)}
            disabled={refreshing}
            className="w-full bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-sm inline-flex items-center gap-2 disabled:opacity-50"
            title={`Dernier rafraîchissement : ${lastRefresh.toLocaleTimeString('fr-FR')}`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button onClick={handleLogout} className="w-full bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-sm inline-flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Mobile header + tabs */}
      <header className="lg:hidden bg-gradient-to-br from-slate-900 to-slate-700 text-white px-5 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-2xl"><Shield className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-white/80 uppercase tracking-widest">Back-office</p>
              <h1 className="font-bold text-lg">Healthy Page Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAll(false)}
              disabled={refreshing}
              className="bg-white/15 hover:bg-white/25 p-2 rounded-xl disabled:opacity-50"
              aria-label="Rafraîchir"
              title={`Dernier rafraîchissement : ${lastRefresh.toLocaleTimeString('fr-FR')}`}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleLogout} className="bg-white/15 hover:bg-white/25 p-2 rounded-xl" aria-label="Se déconnecter">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-white/75 flex-wrap">
          <Clock className="w-3.5 h-3.5" />
          <span>Connecté · {adminEmail}</span>
          <span className="opacity-60">·</span>
          <span>MAJ {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          {sosPending > 0 && (
            <span className="ml-1 inline-flex items-center gap-1 bg-rose-500/90 text-white px-2 py-0.5 rounded-full text-[11px] font-semibold animate-pulse">
              <Activity className="w-3 h-3" /> {sosPending} SOS en attente
            </span>
          )}
        </div>

        <div className="flex gap-1 mt-5 bg-white/10 p-1 rounded-2xl overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 min-w-fit px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center justify-center gap-1.5 transition ${
                  tab === t.id ? 'bg-white text-slate-900' : 'text-white/85 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {t.badge ? (
                  <span className={`ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold ${
                    tab === t.id ? 'bg-slate-900 text-white' : 'bg-rose-500 text-white'
                  }`}>{t.badge}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 min-w-0 px-5 mt-5 lg:mt-8 lg:pr-8 space-y-5">
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: 'Patients', value: stats.patients, color: 'teal' },
                { icon: Stethoscope, label: 'Praticiens', value: stats.pros, color: 'blue' },
                { icon: Building2, label: 'Centres', value: stats.centres, color: 'amber' },
                { icon: Calendar, label: 'Rendez-vous', value: stats.rdvs, color: 'rose' }
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white p-5 rounded-2xl shadow-sm"
                  >
                    <div className={`bg-${s.color}-50 p-2 rounded-lg w-fit`}>
                      <Icon className={`w-5 h-5 text-${s.color}-600`} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-3">{s.value}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </motion.div>
                );
              })}
            </div>

            <section className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-3">Modules thématiques</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Baby, label: 'Mesures pédo', value: stats.growth ?? 0, color: 'pink' },
                  { icon: Users, label: 'Famille', value: stats.famille ?? 0, color: 'fuchsia' },
                  { icon: Globe, label: 'Diaspora', value: stats.diaspora ?? 0, color: 'indigo' },
                  { icon: Utensils, label: 'Repas', value: stats.meals ?? 0, color: 'emerald' },
                  { icon: HandHeart, label: 'Contributions', value: stats.contributions ?? 0, color: 'orange' },
                  { icon: HeartHandshake, label: 'Filleuls', value: stats.filleuls ?? 0, color: 'violet' }
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className={`bg-${s.color}-100 text-${s.color}-700 w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-1`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{s.value}</p>
                      <p className="text-[10px] uppercase tracking-wide text-gray-500">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="grid sm:grid-cols-2 gap-3">
              <RdvTrendChart rdvs={rdvs} />
              <RdvStatusChart rdvs={rdvs} />
            </div>
            <ProSpecialtyChart pros={pros} />

            <section className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">Prochains RDV (7 jours)</h2>
                <button
                  onClick={() => {
                    const end = new Date(); end.setDate(end.getDate() + 7);
                    setDateFrom(todayIso); setDateTo(end.toISOString().slice(0, 10)); setTab('rdvs');
                  }}
                  className="text-xs text-blue-700 hover:underline"
                >Voir tout</button>
              </div>
              {(() => {
                const end = new Date(); end.setDate(end.getDate() + 7);
                const endIso = end.toISOString().slice(0, 10);
                const upcoming = rdvs
                  .filter((r) => r.status !== 'cancelled' && (r.date ?? '') >= todayIso && (r.date ?? '') <= endIso)
                  .sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`))
                  .slice(0, 5);
                if (upcoming.length === 0) {
                  return <p className="text-sm text-gray-500">Aucun rendez-vous planifié sur les 7 prochains jours.</p>;
                }
                return (
                  <ul className="space-y-2">
                    {upcoming.map((r) => (
                      <li key={r.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                        <div className="bg-white px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 whitespace-nowrap">
                          {r.date?.slice(5) ?? ''} {r.time ?? ''}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{patientName(r.patientId)}</p>
                          <p className="text-xs text-gray-500 truncate">{proName(r.proId)} · {r.motif ?? '—'}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-wide text-gray-500">{r.type ?? ''}</span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </section>

            <section className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-3">Activité récente</h2>
              {loading ? (
                <p className="text-sm text-gray-500">Chargement…</p>
              ) : (
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• {stats.patients} comptes patient enregistrés</li>
                  <li>• {stats.pros} praticiens connectés</li>
                  <li>• {stats.rdvs} rendez-vous au total</li>
                  <li>• {stats.centres} centres référencés</li>
                  <li>• {stats.notifications ?? 0} notifications générées</li>
                  <li>• {stats.diaspora ?? 0} proches diaspora suivis</li>
                </ul>
              )}
            </section>

            <section className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-3">Exports</h2>
              <p className="text-xs text-gray-500 mb-3">Télécharger les données au format CSV (UTF-8) pour analyses externes.</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    try {
                      const list = await api.adminPatients();
                      exportCsv('patients', list, ['id', 'firstName', 'lastName', 'phone', 'email', 'city', 'country', 'dob', 'gender', 'blood', 'insurer']);
                      logAudit('export-csv', adminEmail, `patients-${list.length}`);
                      push('success', `${list.length} patients exportés.`);
                    } catch (e) { push('error', 'Erreur export patients.'); }
                  }}
                  className="bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Patients CSV
                </button>
                <button
                  onClick={async () => {
                    try {
                      const list = await api.adminRdvs();
                      exportCsv('rendez-vous', list, ['id', 'patientId', 'date', 'time', 'centerId', 'specialty', 'status', 'createdAt']);
                      logAudit('export-csv', adminEmail, `rdvs-${list.length}`);
                      push('success', `${list.length} rendez-vous exportés.`);
                    } catch (e) { push('error', 'Erreur export RDV.'); }
                  }}
                  className="bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Rendez-vous CSV
                </button>
              </div>
            </section>
          </>
        )}

        {tab === 'audit' && <AdminAuditLog />}
        {tab === 'cms' && <AdminCms adminEmail={adminEmail} />}

        {tab !== 'overview' && tab !== 'audit' && tab !== 'cms' && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="w-full pl-10 pr-3 py-2.5 bg-white rounded-xl outline-none focus:ring-2 focus:ring-slate-700 text-sm shadow-sm"
              />
            </div>

            {!query && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs text-gray-500 whitespace-nowrap">Suggestions :</span>
                {(tab === 'patients'
                  ? ['Cotonou', 'Porto-Novo', 'Diabète', 'Hypertension', 'O+', 'A+']
                  : tab === 'pros'
                  ? ['Cardiologie', 'Pédiatrie', 'Gynécologie', 'Dermatologie', 'Cotonou', 'Désactivé']
                  : tab === 'centres'
                  ? ['CNHU-HKM', 'Cotonou', 'Porto-Novo', 'Maternité', 'Pharmacie', 'Cocotomey']
                  : ['Confirmé', 'Annulé', 'Téléconsultation', 'Cabinet', 'Suivi', 'Urgent']
                ).map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-3 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 whitespace-nowrap"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {tab === 'pros' && selectedProIds.size > 0 && (
              <div className="flex items-center gap-2 text-xs bg-white p-2 rounded-xl shadow-sm">
                <span className="text-gray-500">{selectedProIds.size} sélectionné(s)</span>
                <div className="flex-1" />
                <button
                  onClick={() => bulkSetProsDisabled(false)}
                  disabled={proBatchBusy}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg inline-flex items-center gap-1.5 disabled:opacity-40"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> {proBatchBusy ? '…' : 'Réactiver'}
                </button>
                <button
                  onClick={() => bulkSetProsDisabled(true)}
                  disabled={proBatchBusy}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg inline-flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Ban className="w-3.5 h-3.5" /> {proBatchBusy ? '…' : 'Désactiver'}
                </button>
                <button
                  onClick={() => setSelectedProIds(new Set())}
                  className="px-2 py-1.5 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {tab === 'rdvs' && (
              <div className="flex gap-2">
                <div className="flex-1 flex gap-1 bg-white p-1 rounded-xl shadow-sm">
                  {([
                  { id: 'all', label: 'Tous' },
                  { id: 'proposed', label: 'Proposés' },
                  { id: 'confirmed', label: 'Confirmés' },
                  { id: 'cancelled', label: 'Annulés' }
                  ] as const).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setRdvStatus(s.id)}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        rdvStatus === s.id ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-slate-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={exportCsv}
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
            )}

            {tab === 'rdvs' && (
              <div className="flex items-center gap-2 text-xs flex-wrap bg-white p-2 rounded-xl shadow-sm">
                <span className="text-gray-500">Du</span>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-2 py-1 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-slate-700" />
                <span className="text-gray-500">au</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-2 py-1 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-slate-700" />
                {(dateFrom || dateTo) && (
                  <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-rose-600 hover:underline">Réinitialiser</button>
                )}
                <div className="flex-1" />
                <button
                  onClick={() => { setDateFrom(todayIso); setDateTo(todayIso); }}
                  className="px-2 py-1 bg-slate-900 text-white rounded-lg"
                >Aujourd'hui</button>
                <button
                  onClick={() => {
                    const end = new Date(); end.setDate(end.getDate() + 7);
                    setDateFrom(todayIso); setDateTo(end.toISOString().slice(0, 10));
                  }}
                  className="px-2 py-1 bg-slate-700 text-white rounded-lg"
                >7 jours</button>
              </div>
            )}

            {tab === 'rdvs' && (
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={toggleAllVisible}
                  className="px-3 py-1.5 bg-white text-gray-700 rounded-lg shadow-sm inline-flex items-center gap-1.5"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  {(() => {
                    const visible = filteredRdvs();
                    const allSelected = visible.length > 0 && visible.every((r) => selectedRdvIds.has(r.id));
                    return allSelected ? 'Tout désélectionner' : 'Tout sélectionner';
                  })()}
                </button>
                <span className="text-gray-500">{selectedRdvIds.size} sélectionné(s)</span>
                <div className="flex-1" />
                <button
                  onClick={exportSelectedCsv}
                  disabled={selectedRdvIds.size === 0}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg inline-flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
                <button
                  onClick={cancelSelected}
                  disabled={selectedRdvIds.size === 0 || batchBusy}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg inline-flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {batchBusy ? '…' : 'Annuler'}
                </button>
              </div>
            )}

            <section className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
              {tab === 'patients' && patients
                .filter((p) => filterFn(`${p.firstName ?? ''} ${p.lastName ?? ''} ${p.phone ?? ''}`))
                .map((p) => (
                  <Row key={p.id}
                    title={`${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || '(Sans nom)'}
                    subtitle={`${p.phone ?? ', '} • ${p.city ?? ', '} • ${p.blood || 'GS ?'}`}
                    badge={p.dob ? `né(e) ${p.dob}` : undefined}
                    onClick={() => setSelectedPatient(p)}
                  />
                ))}
              {tab === 'pros' && pros
                .filter((p) => filterFn(`${p.name ?? ''} ${p.specialty ?? ''}`))
                .map((p) => {
                  const checked = selectedProIds.has(p.id);
                  return (
                    <div key={p.id} className="flex items-center gap-2 pl-3">
                      <button
                        onClick={() => toggleProId(p.id)}
                        className="p-1 text-slate-700"
                        aria-label={checked ? 'Désélectionner' : 'Sélectionner'}
                      >
                        {checked ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                      </button>
                      <div className="flex-1">
                        <Row
                          title={p.name || '(Sans nom)'}
                          subtitle={`${p.specialty ?? ', '} • ${p.phone ?? ', '}`}
                          badge={p.disabled ? 'désactivé' : p.licence}
                          onClick={() => setSelectedPro(p)}
                        />
                      </div>
                    </div>
                  );
                })}
              {tab === 'centres' && centres
                .filter((c) => filterFn(`${c.name ?? ''} ${c.city ?? ''}`))
                .map((c) => (
                  <Row key={c.id}
                    title={c.name || '(Sans nom)'}
                    subtitle={`${c.specialty ?? ', '} • ${c.address ?? c.city ?? ', '}`}
                  />
                ))}

              {tab === 'rdvs' && filteredRdvs().map((r) => {
                const checked = selectedRdvIds.has(r.id);
                return (
                  <div key={r.id} className="flex items-center gap-2 pl-3">
                    <button
                      onClick={() => toggleRdv(r.id)}
                      className="p-1 text-slate-700"
                      aria-label={checked ? 'Désélectionner' : 'Sélectionner'}
                    >
                      {checked ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                    </button>
                    <div className="flex-1">
                      <Row
                        title={`${patientName(r.patientId)} → ${proName(r.proId)}`}
                        subtitle={`${r.date ?? ', '} ${r.time ?? ''} • ${r.motif ?? ', '} • ${r.type ?? ', '}`}
                        badge={r.status ?? 'planifié'}
                        onClick={r.patientId ? () => {
                          const p = patients.find((x) => x.id === r.patientId);
                          if (p) setSelectedPatient(p);
                        } : undefined}
                      />
                    </div>
                  </div>
                );
              })}
              {tab === 'rdvs' && rdvs.length === 0 && (
                <p className="p-6 text-center text-sm text-gray-500">Aucun rendez-vous.</p>
              )}

              {((tab === 'patients' && patients.length === 0) ||
                (tab === 'pros' && pros.length === 0) ||
                (tab === 'centres' && centres.length === 0)) && (
                <p className="p-6 text-center text-sm text-gray-500">Aucune donnée enregistrée.</p>
              )}
            </section>
          </>
        )}
      </main>

      {selectedPatient && (
        <AdminPatientDetail
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          adminEmail={adminEmail}
        />
      )}

      {selectedPro && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setSelectedPro(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Praticien</p>
                <h3 className="font-bold text-gray-900">{selectedPro.name}</h3>
                {selectedPro.disabled && (
                  <span className="inline-block mt-1 text-[11px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">Compte désactivé</span>
                )}
              </div>
              <button onClick={() => setSelectedPro(null)} className="p-1.5 bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-sm space-y-2 text-gray-700">
              <p><span className="text-gray-500">Spécialité :</span> {selectedPro.specialty ?? ', '}</p>
              <p><span className="text-gray-500">Licence :</span> {selectedPro.licence ?? ', '}</p>
              <p><span className="text-gray-500">Activité :</span> {selectedPro.activity ?? ', '}</p>
              <p><span className="text-gray-500">Ville :</span> {[selectedPro.city, selectedPro.country].filter(Boolean).join(', ') || ', '}</p>
              <p><span className="text-gray-500">Téléphone :</span> {selectedPro.contact?.phonePro ?? selectedPro.phone ?? ', '}</p>
              <p><span className="text-gray-500">Email :</span> {selectedPro.contact?.emailPro ?? ', '}</p>
              <p><span className="text-gray-500">Tarif cabinet :</span> {selectedPro.fees?.cabinet ?? ', '} FCFA</p>
              <p><span className="text-gray-500">Tarif télé :</span> {selectedPro.fees?.tele ?? ', '} FCFA</p>
              <p><span className="text-gray-500">Jours :</span> {(selectedPro.availability?.days ?? []).join(', ') || ', '}</p>
              <p><span className="text-gray-500">Horaires :</span> {selectedPro.availability?.openHours ?? ', '}, {selectedPro.availability?.closeHours ?? ', '}</p>
            </div>
            <div className="mt-5 flex gap-2">
              {selectedPro.disabled ? (
                <button
                  onClick={() => togglePro(false)}
                  disabled={proBusy}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> {proBusy ? '…' : 'Réactiver le compte'}
                </button>
              ) : (
                <button
                  onClick={() => togglePro(true)}
                  disabled={proBusy}
                  className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" /> {proBusy ? '…' : 'Désactiver le compte'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function exportCsv(name: string, rows: any[], cols: string[]) {
  const esc = (v: any) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n;]/.test(s) ? `"${s}"` : s;
  };
  const header = cols.join(',');
  const body = (rows ?? []).map((r) => cols.map((c) => esc(r?.[c])).join(',')).join('\n');
  const csv = '\ufeff' + header + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function Row({ title, subtitle, badge, onClick }: { title: string; subtitle?: string; badge?: string; onClick?: () => void }) {
  const content = (
    <>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
      </div>
      {badge && <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full whitespace-nowrap">{badge}</span>}
      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </>
  );
  if (onClick) {
    return (
      <button onClick={onClick} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition text-left">
        {content}
      </button>
    );
  }
  return <div className="flex items-center gap-3 p-4 hover:bg-slate-50 transition">{content}</div>;
}
