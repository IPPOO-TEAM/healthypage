import { useEffect, useRef, useState } from 'react';
import { User, CreditCard, LogOut, Phone, Mail, MapPin, Briefcase, Shield, Award, Calendar, X, Plus, Camera, UserPlus, Users2, Trash2 } from 'lucide-react';
import { api } from '../../components/api';
import { compressImage } from '../../components/imageCompress';
import MaCarteScreen from '../MaCarteScreen';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface Props {
  proId: string;
  onLogout: () => void;
}

export default function ProfilProScreen({ proId, onLogout }: Props) {
  const [pro, setPro] = useState<any>(null);
  const [showCard, setShowCard] = useState(false);
  const [editDispos, setEditDispos] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    api.getPro(proId).then(setPro).catch(() => setPro(null));
  }, [proId]);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError(null);
    if (!file.type.startsWith('image/')) {
      setPhotoError('Veuillez choisir une image.');
      return;
    }
    setPhotoBusy(true);
    try {
      const dataUrl = await compressImage(file, { maxBytes: 1.5 * 1024 * 1024, maxDimension: 1024 });
      const { url } = await api.uploadPhoto('pro', proId, dataUrl);
      const updated = await api.updatePro(proId, { photo: url });
      setPro(updated);
    } catch (err: any) {
      console.error('Pro photo upload:', err);
      setPhotoError(err?.message ?? 'Échec de la mise à jour.');
    } finally {
      setPhotoBusy(false);
    }
  };

  if (showCard && pro) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6">
        <MaCarteScreen
          subject={{
            id: pro.id,
            fullName: pro.name ?? 'Praticien',
            role: 'Praticien',
            photo: pro.photo ?? null,
            subtitle: pro.specialty,
            meta: {
              'Licence': pro.licence,
              'Activité': pro.activity,
              'Ville': pro.city,
              'Téléphone': pro.contact?.phonePro ?? pro.phone
            }
          }}
          onBack={() => setShowCard(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <header className="bg-gradient-to-br from-blue-700 to-indigo-700 text-white px-5 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative">
            {pro?.photo ? (
              <img src={pro.photo} alt={pro?.name ?? 'Praticien'} className="w-16 h-16 rounded-full object-cover ring-2 ring-white/40" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {(pro?.name ?? 'PR').split(' ').map((s: string) => s[0]).slice(0, 2).join('')}
              </div>
            )}
            <button
              onClick={() => photoRef.current?.click()}
              disabled={photoBusy}
              aria-label="Changer la photo"
              className="absolute -bottom-1 -right-1 bg-white text-blue-700 p-1.5 rounded-full shadow ring-2 ring-blue-700/10 hover:bg-blue-50 disabled:opacity-60"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/80 uppercase tracking-widest">Profil</p>
            <h1 className="font-bold text-lg truncate">{pro?.name ?? 'Praticien'}</h1>
            <p className="text-xs text-white/80 truncate">{pro?.specialty ?? ', '}</p>
            {photoBusy && <p className="text-[11px] text-white/80 mt-1">Optimisation de la photo…</p>}
            {photoError && <p className="text-[11px] text-red-200 mt-1">{photoError}</p>}
          </div>
        </div>
      </header>

      <main className="px-5 mt-5 space-y-4">
        <button
          onClick={() => setShowCard(true)}
          className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-md flex items-center gap-4"
        >
          <div className="bg-white/20 p-3 rounded-xl"><CreditCard className="w-6 h-6" /></div>
          <div className="flex-1 text-left">
            <p className="font-bold">Ma carte praticien</p>
            <p className="text-xs text-white/80">QR code • PDF / PNG / SVG / Imprimer</p>
          </div>
        </button>

        <section className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-700" /> Informations
          </h2>
          <Row icon={Award} label="Licence" value={pro?.licence} />
          <Row icon={Briefcase} label="Activité" value={pro?.activity} />
          <Row icon={MapPin} label="Ville" value={[pro?.city, pro?.country].filter(Boolean).join(', ')} />
          <Row icon={Phone} label="Téléphone pro" value={pro?.contact?.phonePro ?? pro?.phone} />
          <Row icon={Mail} label="Email pro" value={pro?.contact?.emailPro} />
          <Row icon={Shield} label="2FA" value={pro?.security?.twoFA ? 'Activé' : 'Désactivé'} />
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-700" /> Disponibilités
            </h2>
            <button
              onClick={() => setEditDispos(true)}
              className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium"
            >
              Modifier
            </button>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p><span className="text-gray-500">Jours :</span> {(pro?.availability?.days ?? []).join(', ') || ', '}</p>
            <p><span className="text-gray-500">Horaires :</span> {pro?.availability?.openHours ?? ', '}, {pro?.availability?.closeHours ?? ', '}</p>
            <p><span className="text-gray-500">Pauses :</span> {(pro?.availability?.breaks ?? []).map((b: any) => `${b.label || 'Pause'} ${b.from}-${b.to}`).join(' • ') || ', '}</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-900">Tarifs</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-xs text-gray-500">Cabinet</p>
              <p className="font-bold text-gray-900">{pro?.fees?.cabinet ?? ', '} FCFA</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-xs text-gray-500">Téléconsultation</p>
              <p className="font-bold text-gray-900">{pro?.fees?.tele ?? ', '} FCFA</p>
            </div>
          </div>
        </section>

        <DelegationsSection proId={proId} />

        <button
          onClick={onLogout}
          className="w-full bg-white text-red-700 py-3 rounded-2xl font-medium shadow-sm flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Se déconnecter
        </button>
      </main>

      {editDispos && pro && (
        <DisposModal
          pro={pro}
          onClose={() => setEditDispos(false)}
          onSaved={(updated) => { setPro(updated); setEditDispos(false); }}
        />
      )}
    </div>
  );
}

function DisposModal({ pro, onClose, onSaved }: { pro: any; onClose: () => void; onSaved: (p: any) => void }) {
  const [days, setDays] = useState<string[]>(pro?.availability?.days ?? []);
  const [openHours, setOpenHours] = useState<string>(pro?.availability?.openHours ?? '08:00');
  const [closeHours, setCloseHours] = useState<string>(pro?.availability?.closeHours ?? '18:00');
  const [breaks, setBreaks] = useState<{ from: string; to: string; label: string }[]>(
    pro?.availability?.breaks ?? []
  );
  const [saving, setSaving] = useState(false);

  const toggleDay = (d: string) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.updatePro(pro.id, {
        availability: {
          ...(pro.availability ?? {}),
          days,
          openHours,
          closeHours,
          breaks: breaks.filter((b) => b.from && b.to),
        },
      });
      onSaved(updated);
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Modifier mes disponibilités</h3>
          <button onClick={onClose} className="p-1.5 bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Jours d'ouverture</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    days.includes(d) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-gray-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ouverture</p>
              <input type="time" value={openHours} onChange={(e) => setOpenHours(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fermeture</p>
              <input type="time" value={closeHours} onChange={(e) => setCloseHours(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Plages de pause</p>
            <div className="space-y-2">
              {breaks.map((b, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                  <input
                    value={b.label}
                    onChange={(e) => setBreaks(breaks.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))}
                    placeholder="Libellé"
                    className="px-2 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input type="time" value={b.from}
                    onChange={(e) => setBreaks(breaks.map((x, idx) => idx === i ? { ...x, from: e.target.value } : x))}
                    className="px-2 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="time" value={b.to}
                    onChange={(e) => setBreaks(breaks.map((x, idx) => idx === i ? { ...x, to: e.target.value } : x))}
                    className="px-2 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <button
                    onClick={() => setBreaks(breaks.filter((_, idx) => idx !== i))}
                    className="p-2 bg-red-50 text-red-600 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setBreaks([...breaks, { from: '', to: '', label: 'Pause' }])}
                className="w-full py-2 border-2 border-dashed border-slate-300 text-sm text-gray-600 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Ajouter une plage
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-gray-700 rounded-xl font-medium">Annuler</button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DelegationsSection({ proId }: { proId: string }) {
  const [delegates, setDelegates] = useState<any[]>([]);
  const [delegateInput, setDelegateInput] = useState('');
  const [role, setRole] = useState<'praticien' | 'secretaire'>('secretaire');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => api.listDelegates(proId).then((l) => setDelegates(l ?? [])).catch(() => setDelegates([]));
  useEffect(() => { refresh(); }, [proId]);

  const add = async () => {
    const id = delegateInput.trim();
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      const { delegates: next } = await api.addDelegate(proId, { delegateProId: id, role });
      setDelegates(next ?? []);
      setDelegateInput('');
    } catch (e: any) {
      setError(e?.message ?? 'Ajout impossible.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (delegateId: string) => {
    setBusy(true);
    try {
      const { delegates: next } = await api.removeDelegate(proId, delegateId);
      setDelegates(next ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Suppression impossible.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <Users2 className="w-5 h-5 text-fuchsia-700" /> Délégations & secrétariat
      </h2>
      <p className="text-xs text-slate-500">
        Autorisez un autre compte pro (associé ou secrétaire) à gérer votre agenda et vos patients depuis son propre espace.
      </p>

      {delegates.length === 0 ? (
        <p className="text-sm text-slate-400 italic">Aucune délégation active.</p>
      ) : (
        <ul className="space-y-2">
          {delegates.map((d: any) => (
            <li key={d.proId} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
              <div className="min-w-0">
                <p className="font-medium text-sm text-slate-900 truncate">{d.name}</p>
                <p className="text-[11px] text-slate-500">
                  <span className={`inline-block px-1.5 py-0.5 rounded ${d.role === 'praticien' ? 'bg-blue-100 text-blue-800' : 'bg-fuchsia-100 text-fuchsia-800'}`}>
                    {d.role === 'praticien' ? 'Praticien associé' : 'Secrétariat'}
                  </span>
                  <span className="ml-2 font-mono">{d.proId.slice(0, 8)}…</span>
                </p>
              </div>
              <button
                onClick={() => remove(d.proId)}
                disabled={busy}
                className="p-2 rounded-lg bg-white text-red-600 hover:bg-red-50"
                aria-label="Retirer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-slate-100 pt-3 space-y-2">
        <p className="text-xs font-semibold text-slate-600">Ajouter une délégation</p>
        <input
          value={delegateInput}
          onChange={(e) => setDelegateInput(e.target.value)}
          placeholder="ID du compte pro à autoriser"
          className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setRole('secretaire')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${role === 'secretaire' ? 'bg-fuchsia-600 text-white border-fuchsia-600' : 'bg-white text-slate-600 border-slate-200'}`}
          >Secrétaire</button>
          <button
            onClick={() => setRole('praticien')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${role === 'praticien' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
          >Praticien associé</button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          onClick={add}
          disabled={busy || !delegateInput.trim()}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <UserPlus className="w-4 h-4" /> Autoriser ce compte
        </button>
        <p className="text-[10px] text-slate-400">L'utilisateur autorisé verra apparaître votre praticien dans son sélecteur en haut de l'espace pro.</p>
      </div>
    </section>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="bg-slate-50 p-2 rounded-lg"><Icon className="w-4 h-4 text-blue-700" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-900 truncate">{value || ', '}</p>
      </div>
    </div>
  );
}
