import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Calendar, Droplet, Ruler, Weight, Heart, ShieldAlert, Camera, X } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';
import { compressImage } from '../components/imageCompress';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props { onBack: () => void; }

interface Form {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  dob: string;
  gender: string;
  bloodType: string;
  height: string;
  weight: string;
  bloodPressure: string;
  emName: string;
  emRelation: string;
  emPhone: string;
  photo: string;
}

const EMPTY: Form = {
  firstName: '', lastName: '', phone: '', email: '', address: '',
  dob: '', gender: '', bloodType: '', height: '', weight: '', bloodPressure: '',
  emName: '', emRelation: '', emPhone: '', photo: ''
};

export default function EditProfileScreen({ onBack }: Props) {
  const [f, setF] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      const pid = getPatientId();
      if (!pid) { setLoading(false); return; }
      api.getPatient(pid)
        .then(({ patient, emergency }: any) => {
          setF({
            firstName: patient?.firstName ?? '',
            lastName: patient?.lastName ?? '',
            phone: patient?.phone ?? '',
            email: patient?.email ?? '',
            address: patient?.address ?? '',
            dob: patient?.dob ?? '',
            gender: patient?.gender ?? patient?.sex ?? '',
            bloodType: patient?.bloodType ?? patient?.blood ?? '',
            height: patient?.height ?? '',
            weight: patient?.weight ?? '',
            bloodPressure: patient?.bloodPressure ?? '',
            emName: emergency?.name ?? '',
            emRelation: emergency?.relation ?? '',
            emPhone: emergency?.phone ?? '',
            photo: patient?.photo ?? ''
          });
        })
        .catch((e) => setError(`Erreur de chargement : ${e?.message ?? e}`))
        .finally(() => setLoading(false));
    };
    load();
    const onUpdate = () => load();
    window.addEventListener('hp:profile:updated', onUpdate);
    return () => window.removeEventListener('hp:profile:updated', onUpdate);
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const photoRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [compressing, setCompressing] = useState(false);
  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError(null);
    if (!file.type.startsWith('image/')) {
      setPhotoError('Veuillez choisir une image.');
      return;
    }
    setCompressing(true);
    try {
      const dataUrl = await compressImage(file, { maxBytes: 1.5 * 1024 * 1024, maxDimension: 1024 });
      set('photo', dataUrl);
    } catch (err: any) {
      setPhotoError(err?.message ?? 'Compression impossible.');
    } finally {
      setCompressing(false);
    }
  };

  const save = async () => {
    const pid = getPatientId();
    if (!pid) {
      setError("Aucun compte patient actif. Veuillez vous reconnecter.");
      return;
    }
    setSaving(true); setError(null); setSaved(false);
    try {
      let photoUrl = f.photo;
      if (f.photo && f.photo.startsWith('data:')) {
        const uploaded = await api.uploadPhoto('patient', pid, f.photo);
        photoUrl = uploaded.url;
        set('photo', photoUrl);
      }
      const payload: any = {
        firstName: f.firstName, lastName: f.lastName, phone: f.phone, email: f.email,
        address: f.address, dob: f.dob, gender: f.gender, sex: f.gender,
        bloodType: f.bloodType, blood: f.bloodType,
        height: f.height, weight: f.weight, bloodPressure: f.bloodPressure,
        photo: photoUrl,
        emergency: (f.emName || f.emPhone) ? { name: f.emName, relation: f.emRelation, phone: f.emPhone } : null
      };
      await api.updatePatient(pid, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(`Échec de l'enregistrement : ${e?.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Chargement de votre profil…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-teal-700 via-cyan-600 to-blue-600 p-6 text-white">
        <ImageWithFallback src="https://images.unsplash.com/photo-1600679472868-eae382e28b34?w=1080&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay pointer-events-none" />
        <div className="relative">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><User className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">Modifier mon profil</h2>
            <p className="text-sm text-white/85">Mettez à jour vos informations personnelles</p>
          </div>
        </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-xl">{error}</div>}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-xl"
        >
          ✓ Profil enregistré avec succès
        </motion.div>
      )}

      <Section title="Photo de profil" icon={Camera}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-teal-100 bg-gray-100 flex items-center justify-center">
              {f.photo ? (
                <img src={f.photo} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            {f.photo && (
              <button
                type="button"
                onClick={() => set('photo', '')}
                className="absolute -top-1 -right-1 bg-white shadow rounded-full p-1 text-gray-600 hover:text-red-600"
                aria-label="Retirer la photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={compressing}
              className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 hover:bg-teal-100 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60"
            >
              <Camera className="w-4 h-4" />
              {compressing ? 'Optimisation…' : (f.photo ? 'Changer la photo' : 'Ajouter une photo')}
            </button>
            <p className="text-xs text-gray-500 mt-1.5">L'image est automatiquement redimensionnée et compressée.</p>
            {photoError && <p className="text-xs text-red-600 mt-1">{photoError}</p>}
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </div>
        </div>
      </Section>

      <Section title="Identité">
        <Field label="Prénom" icon={User}>
          <input value={f.firstName} onChange={(e) => set('firstName', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Nom" icon={User}>
          <input value={f.lastName} onChange={(e) => set('lastName', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Date de naissance" icon={Calendar}>
          <input type="date" value={f.dob} onChange={(e) => set('dob', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Genre" icon={User}>
          <select value={f.gender} onChange={(e) => set('gender', e.target.value)} className={inputCls}>
            <option value="">, </option>
            <option value="F">Féminin</option>
            <option value="M">Masculin</option>
            <option value="X">Autre</option>
          </select>
        </Field>
      </Section>

      <Section title="Contact">
        <Field label="Téléphone" icon={Phone}>
          <input value={f.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} placeholder="+229 ..." />
        </Field>
        <Field label="Email" icon={Mail}>
          <input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Adresse" icon={MapPin}>
          <input value={f.address} onChange={(e) => set('address', e.target.value)} className={inputCls} placeholder="Quartier, ville" />
        </Field>
      </Section>

      <Section title="Données médicales">
        <Field label="Groupe sanguin" icon={Droplet}>
          <select value={f.bloodType} onChange={(e) => set('bloodType', e.target.value)} className={inputCls}>
            <option value="">, </option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Taille" icon={Ruler}>
          <input value={f.height} onChange={(e) => set('height', e.target.value)} className={inputCls} placeholder="ex. 1,72 m" />
        </Field>
        <Field label="Poids" icon={Weight}>
          <input value={f.weight} onChange={(e) => set('weight', e.target.value)} className={inputCls} placeholder="ex. 68 kg" />
        </Field>
        <Field label="Tension artérielle" icon={Heart}>
          <input value={f.bloodPressure} onChange={(e) => set('bloodPressure', e.target.value)} className={inputCls} placeholder="ex. 125/82" />
        </Field>
      </Section>

      <Section title="Contact d'urgence" icon={ShieldAlert}>
        <Field label="Nom complet" icon={User}>
          <input value={f.emName} onChange={(e) => set('emName', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Lien" icon={User}>
          <input value={f.emRelation} onChange={(e) => set('emRelation', e.target.value)} className={inputCls} placeholder="ex. Conjoint, parent, ami" />
        </Field>
        <Field label="Téléphone" icon={Phone}>
          <input value={f.emPhone} onChange={(e) => set('emPhone', e.target.value)} className={inputCls} />
        </Field>
      </Section>

      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-2xl font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <Save className="w-5 h-5" />
        {saving ? 'Enregistrement…' : 'Enregistrer mes informations'}
      </button>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white';

function Section({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-teal-600" />}
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5" /> {label}
      </span>
      {children}
    </label>
  );
}
