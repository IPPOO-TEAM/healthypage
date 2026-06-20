import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, HandHeart, UserPlus, Heart, Trash2, Plus, CheckCircle2, Wallet, TrendingUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props { onBack: () => void; }

interface Filleul {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  relation: string;
  vulnerability: string;
  status: 'pending' | 'active' | 'rejected';
  createdAt?: string;
}

interface Contribution {
  id: string;
  amount: number;
  type: 'cotisation' | 'don' | 'parrainage';
  note?: string;
  createdAt?: string;
}

const VULNERABILITES = [
  'Faibles revenus',
  'Personne âgée isolée',
  'Maladie chronique',
  'Handicap',
  'Grossesse / jeune mère',
  'Enfant à charge',
  'Zone enclavée'
];

const STATUS_META: Record<Filleul['status'], { label: string; color: string }> = {
  pending: { label: 'En vérification', color: 'amber' },
  active: { label: 'Pris en charge', color: 'green' },
  rejected: { label: 'Non éligible', color: 'red' }
};

export default function ParrainageScreen({ onBack }: Props) {
  const pid = getPatientId();
  const [filleuls, setFilleuls] = useState<Filleul[]>([]);
  const [contribs, setContribs] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddFilleul, setShowAddFilleul] = useState(false);
  const [showAddContrib, setShowAddContrib] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Filleul | null>(null);

  useEffect(() => {
    if (!pid) { setLoading(false); return; }
    Promise.all([api.listFilleuls(pid), api.listContributions(pid)])
      .then(([f, c]) => {
        setFilleuls((f as Filleul[]) ?? []);
        setContribs((c as Contribution[]) ?? []);
      })
      .catch((e) => setError(e?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [pid]);

  const totalContrib = useMemo(() => contribs.reduce((s, c) => s + (Number(c.amount) || 0), 0), [contribs]);
  const activeFilleuls = filleuls.filter((f) => f.status === 'active').length;
  const remaining = Math.max(0, 2 - filleuls.filter((f) => f.status !== 'rejected').length);

  if (!pid) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-gray-700">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-sm">
          Veuillez d'abord créer ou retrouver votre compte patient pour accéder au parrainage.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 p-6 text-white">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1080&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay pointer-events-none"
        />
        <div className="relative">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-3 rounded-2xl"><HandHeart className="w-7 h-7" /></div>
            <div>
              <h2 className="text-2xl font-bold">Parrainage solidaire</h2>
              <p className="text-sm text-white/85">Aujourd'hui pour toi, demain pour moi</p>
            </div>
          </div>
          <p className="text-sm text-white/90 leading-relaxed">
            Chaque adhérent peut parrainer 2 personnes vulnérables qui bénéficieront du même panier de soins, sans surcoût, grâce au Fonds de solidarité.
          </p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-xl">{error}</div>}

      <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-teal-500">
        <p className="text-sm font-semibold text-gray-900 mb-1">Comment fonctionne votre couverture ?</p>
        <p className="text-xs text-gray-600 leading-relaxed">
          Option individuelle : <strong>1 titulaire</strong> + jusqu'à <strong>4 proches</strong> (parents, frères/sœurs) + <strong>2 filleuls</strong> = 7 personnes couvertes. Les filleuls sont financés par le Fonds de solidarité, sans surcoût pour vous.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat icon={Users} label="Filleuls actifs" value={String(activeFilleuls)} color="teal" />
        <Stat icon={UserPlus} label="Places restantes" value={String(remaining)} color="amber" />
        <Stat icon={Wallet} label="Mes contributions" value={`${totalContrib.toLocaleString('fr-FR')} F`} color="emerald" />
      </div>

      <section className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-teal-600" />
            Mes filleuls ({filleuls.length}/2)
          </h3>
          {remaining > 0 ? (
            <button
              onClick={() => setShowAddFilleul(true)}
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm px-3 py-1.5 rounded-xl"
            >
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          ) : (
            <span className="text-xs text-gray-500">Liste complète</span>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : filleuls.length === 0 ? (
          <div className="text-center py-6">
            <HandHeart className="w-10 h-10 text-teal-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Aucun filleul déclaré pour l'instant.</p>
            <p className="text-xs text-gray-500 mt-1">Désignez jusqu'à 2 personnes vulnérables que vous souhaitez soutenir.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filleuls.map((f) => {
              const s = STATUS_META[f.status];
              return (
                <li key={f.id} className="border border-gray-100 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-medium shrink-0">
                    {(f.firstName?.[0] ?? '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 truncate">{f.firstName} {f.lastName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-${s.color}-50 text-${s.color}-700 border border-${s.color}-200`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{f.relation || ', '} · {f.phone || 'Tél. non renseigné'}</p>
                    {f.vulnerability && (
                      <p className="text-xs text-gray-600 mt-1">Vulnérabilité : <span className="text-gray-800">{f.vulnerability}</span></p>
                    )}
                  </div>
                  <button
                    onClick={() => setConfirmDelete(f)}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                    aria-label="Retirer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Fonds de solidarité
          </h3>
          <button
            onClick={() => setShowAddContrib(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded-xl"
          >
            <Plus className="w-4 h-4" /> Contribuer
          </button>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 mb-4">
          <p className="text-xs text-emerald-700 mb-1">Cumul de vos contributions</p>
          <p className="text-2xl font-bold text-emerald-900">{totalContrib.toLocaleString('fr-FR')} FCFA</p>
          <p className="text-xs text-emerald-700 mt-1">10 % alimentent le Fonds d'aide humanitaire.</p>
        </div>

        {contribs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Aucune contribution enregistrée.</p>
        ) : (
          <ul className="space-y-2">
            {contribs.slice().reverse().slice(0, 8).map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm border-b border-gray-50 last:border-0 py-2">
                <div>
                  <p className="text-gray-900 font-medium capitalize">{c.type}</p>
                  <p className="text-xs text-gray-500">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : ', '}
                    {c.note ? ` · ${c.note}` : ''}
                  </p>
                </div>
                <span className="text-emerald-700 font-semibold">{Number(c.amount).toLocaleString('fr-FR')} F</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-sm text-teal-900 flex gap-3">
        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Chaque filleul accepté bénéficie des consultations de première ligne, vaccinations, suivi materno-infantile et examens de base, validés par le programme.</p>
      </div>

      <AnimatePresence>
        {showAddFilleul && (
          <FilleulModal
            onClose={() => setShowAddFilleul(false)}
            onSave={async (data) => {
              try {
                const res = await api.createFilleul(pid, { ...data, status: 'pending' });
                setFilleuls((arr) => [...arr, res as Filleul]);
                setShowAddFilleul(false);
              } catch (e: any) {
                setError(e?.message ?? 'Création impossible');
              }
            }}
          />
        )}
        {confirmDelete && (
          <ModalShell onClose={() => setConfirmDelete(null)} title="Retirer ce filleul ?">
            <p className="text-sm text-gray-700 mb-4">
              <strong>{confirmDelete.firstName} {confirmDelete.lastName}</strong> ne sera plus rattaché à votre parrainage. Cette action est réversible (vous pourrez ajouter un remplaçant).
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm">Annuler</button>
              <button
                onClick={async () => {
                  const f = confirmDelete;
                  setConfirmDelete(null);
                  try {
                    await api.deleteFilleul(pid, f.id);
                    setFilleuls((arr) => arr.filter((x) => x.id !== f.id));
                  } catch (e: any) {
                    setError(e?.message ?? 'Suppression impossible');
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
              >
                Retirer
              </button>
            </div>
          </ModalShell>
        )}
        {showAddContrib && (
          <ContribModal
            onClose={() => setShowAddContrib(false)}
            onSave={async (data) => {
              try {
                const res = await api.createContribution(pid, data);
                setContribs((arr) => [...arr, res as Contribution]);
                setShowAddContrib(false);
              } catch (e: any) {
                setError(e?.message ?? 'Création impossible');
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-3`}>
      <Icon className={`w-5 h-5 text-${color}-600 mb-1`} />
      <p className="text-xs text-gray-600">{label}</p>
      <p className={`text-lg font-bold text-${color}-900`}>{value}</p>
    </div>
  );
}

function FilleulModal({ onClose, onSave }: { onClose: () => void; onSave: (d: any) => Promise<void> }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [vulnerability, setVulnerability] = useState(VULNERABILITES[0]);
  const [busy, setBusy] = useState(false);

  return (
    <ModalShell onClose={onClose} title="Déclarer un filleul">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Input label="Prénom" value={firstName} onChange={setFirstName} />
          <Input label="Nom" value={lastName} onChange={setLastName} />
        </div>
        <Input label="Téléphone" value={phone} onChange={setPhone} placeholder="+229 ..." />
        <Input label="Lien (parent, voisin…)" value={relation} onChange={setRelation} />
        <label className="block">
          <span className="text-xs text-gray-500 mb-1 block">Vulnérabilité</span>
          <select
            value={vulnerability}
            onChange={(e) => setVulnerability(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
          >
            {VULNERABILITES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm">Annuler</button>
        <button
          disabled={busy || !firstName.trim()}
          onClick={async () => {
            setBusy(true);
            await onSave({ firstName, lastName, phone, relation, vulnerability });
            setBusy(false);
          }}
          className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium disabled:opacity-60"
        >
          {busy ? 'Envoi…' : 'Envoyer pour validation'}
        </button>
      </div>
    </ModalShell>
  );
}

function ContribModal({ onClose, onSave }: { onClose: () => void; onSave: (d: any) => Promise<void> }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'cotisation' | 'don' | 'parrainage'>('cotisation');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const valid = Number(amount) > 0;

  return (
    <ModalShell onClose={onClose} title="Nouvelle contribution">
      <div className="space-y-3">
        <Input label="Montant (FCFA)" value={amount} onChange={setAmount} placeholder="ex. 5000" type="number" />
        <label className="block">
          <span className="text-xs text-gray-500 mb-1 block">Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="cotisation">Cotisation mensuelle</option>
            <option value="don">Don ponctuel</option>
            <option value="parrainage">Parrainage ciblé</option>
          </select>
        </label>
        <Input label="Note (facultatif)" value={note} onChange={setNote} />
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm">Annuler</button>
        <button
          disabled={busy || !valid}
          onClick={async () => {
            setBusy(true);
            await onSave({ amount: Number(amount), type, note });
            setBusy(false);
          }}
          className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-60"
        >
          {busy ? 'Envoi…' : 'Enregistrer'}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl p-5 shadow-xl"
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 mb-1 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
      />
    </label>
  );
}
