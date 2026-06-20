import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplet,
  Shield,
  FileText,
  Clock,
  ChevronRight,
  Camera,
  Heart,
  Activity,
  Apple,
  Brain,
  Award,
  Target,
  TrendingUp,
  Users,
  Flame,
  Sparkles,
  Footprints,
  Moon,
  Quote,
  Image as ImageIcon
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { IMAGES } from '../components/images';
import { useFavorites } from '../components/useFavorites';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';
import { isDemoPatient } from '../components/demo';

interface ProfileScreenProps {
  onNavigate?: (screen: string) => void;
}

function calcAge(dob?: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function ProfileScreen({ onNavigate }: ProfileScreenProps = {}) {
  const { ids: favIds } = useFavorites();
  const demo = isDemoPatient();
  const [patient, setPatient] = useState<any>(null);
  const [emergency, setEmergency] = useState<any>(null);

  useEffect(() => {
    const pid = getPatientId();
    if (!pid) return;
    api.getPatient(pid).then((res: any) => {
      setPatient(res?.patient ?? null);
      setEmergency(res?.emergency ?? null);
    }).catch(() => {});
  }, []);

  const fullName = patient ? `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim() : '';
  const age = calcAge(patient?.dob);
  const gender = patient?.gender === 'F' ? 'Féminin' : patient?.gender === 'M' ? 'Masculin' : '';
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1763739528420-bdc297ff4ec7?w=1080&q=80"
          alt="Profil"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/75"></div>
        <div className="relative p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/40 shadow-lg">
                <ImageWithFallback
                  src={patient?.photo || IMAGES.profileAvatar}
                  alt={fullName || 'Profil'}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <button onClick={() => onNavigate?.('editProfile')} className="absolute bottom-0 right-0 bg-white text-teal-700 p-2 rounded-full hover:bg-teal-50 transition-colors shadow">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{fullName || 'Profil'}</h2>
              {patient?.id && <p className="text-teal-50 text-sm mt-1">Patient ID: {patient.id.slice(0, 12)}</p>}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {age !== null && <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs ring-1 ring-white/30">{age} ans</span>}
                {gender && <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs ring-1 ring-white/30">{gender}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Informations personnelles</h3>
          <button
            onClick={() => onNavigate?.('editProfile')}
            className="text-sm text-teal-600 font-medium hover:text-teal-700"
          >
            Modifier
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Phone className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Téléphone</p>
              <p className="text-sm font-medium text-gray-900">{patient?.phone || ', '}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Mail className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{patient?.email || ', '}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="bg-gray-100 p-2 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Adresse</p>
              <p className="text-sm font-medium text-gray-900">{patient?.address || patient?.region || ', '}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Date de naissance</p>
              <p className="text-sm font-medium text-gray-900">{patient?.dob ? new Date(patient.dob).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ', '}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Droplet className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Groupe sanguin</p>
              <p className="text-sm font-medium text-gray-900">{patient?.bloodType || patient?.blood || ', '}</p>
            </div>
          </div>

          {(patient?.height || patient?.weight || patient?.bloodPressure) && (
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Taille</p>
                <p className="text-sm font-medium text-gray-900">{patient?.height || ', '}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Poids</p>
                <p className="text-sm font-medium text-gray-900">{patient?.weight || ', '}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tension</p>
                <p className="text-sm font-medium text-gray-900">{patient?.bloodPressure || ', '}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mon parcours bien-être */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-gray-900 inline-flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FFD400]" /> Mon parcours bien-être
          </h3>
          <span className="text-xs text-gray-500">Cette semaine</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative rounded-2xl overflow-hidden h-36 text-white shadow-sm">
            <ImageWithFallback src="https://images.unsplash.com/photo-1543364195-bfe6e4932397?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=900" alt="Nutrition" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F8A4F]/95 via-[#0F8A4F]/45 to-transparent" />
            <div className="relative h-full p-3 flex flex-col justify-between">
              <Apple className="w-5 h-5" />
              <div>
                <div className="text-[11px] opacity-90">Nutrition</div>
                <div className="font-black text-xl leading-none mt-0.5">82%</div>
                <div className="text-[10px] opacity-90 mt-1">5 repas équilibrés</div>
              </div>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-36 text-white shadow-sm">
            <ImageWithFallback src="https://images.unsplash.com/photo-1731512612807-9219775bcd2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=900" alt="Sport" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#A85800]/95 via-[#A85800]/45 to-transparent" />
            <div className="relative h-full p-3 flex flex-col justify-between">
              <Activity className="w-5 h-5" />
              <div>
                <div className="text-[11px] opacity-90">Activité</div>
                <div className="font-black text-xl leading-none mt-0.5">3 séances</div>
                <div className="text-[10px] opacity-90 mt-1">+ 22 km marchés</div>
              </div>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-36 text-white shadow-sm">
            <ImageWithFallback src="https://images.unsplash.com/photo-1606471059439-2dfc9bbfb150?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=900" alt="Mental" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3046C7]/95 via-[#3046C7]/45 to-transparent" />
            <div className="relative h-full p-3 flex flex-col justify-between">
              <Brain className="w-5 h-5" />
              <div>
                <div className="text-[11px] opacity-90">Mental</div>
                <div className="font-black text-xl leading-none mt-0.5">7,8/10</div>
                <div className="text-[10px] opacity-90 mt-1">Sommeil stable</div>
              </div>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-36 text-white shadow-sm">
            <ImageWithFallback src="https://images.unsplash.com/photo-1647113768168-26d409dfe3b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=900" alt="Tension" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1240C7]/95 via-[#1240C7]/45 to-transparent" />
            <div className="relative h-full p-3 flex flex-col justify-between">
              <Heart className="w-5 h-5" />
              <div>
                <div className="text-[11px] opacity-90">Tension</div>
                <div className="font-black text-xl leading-none mt-0.5">12/8</div>
                <div className="text-[10px] opacity-90 mt-1">Stable depuis 6 sem.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-xl bg-white p-3 ring-1 ring-gray-100 text-center">
          <Footprints className="w-5 h-5 text-[#FF8A00] mx-auto" />
          <div className="font-black text-base mt-1">8 412</div>
          <div className="text-[10px] text-gray-500">pas / jour</div>
        </div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-gray-100 text-center">
          <Flame className="w-5 h-5 text-[#FF4D8D] mx-auto" />
          <div className="font-black text-base mt-1">21 j</div>
          <div className="text-[10px] text-gray-500">série active</div>
        </div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-gray-100 text-center">
          <Moon className="w-5 h-5 text-[#3046C7] mx-auto" />
          <div className="font-black text-base mt-1">7 h 12</div>
          <div className="text-[10px] text-gray-500">sommeil</div>
        </div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-gray-100 text-center">
          <Heart className="w-5 h-5 text-[#FF2D2D] mx-auto fill-current" />
          <div className="font-black text-base mt-1">68 bpm</div>
          <div className="text-[10px] text-gray-500">au repos</div>
        </div>
      </div>

      {/* Mes objectifs santé */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-gray-900 inline-flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#1E5BFF]" /> Mes objectifs
          </h3>
          <button className="text-xs text-teal-600 font-medium">Modifier</button>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden bg-white ring-1 ring-gray-100 flex">
            <div className="relative w-24 shrink-0">
              <ImageWithFallback src="https://images.unsplash.com/photo-1773561212492-66b0404b72aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=600" alt="Marche" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#A85800]/55 to-transparent" />
            </div>
            <div className="flex-1 p-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-gray-900">Marcher 10 000 pas/jour</div>
                <div className="text-xs font-bold text-[#FF8A00]">84%</div>
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#A85800] to-[#FF8A00]" style={{ width: '84%' }} />
              </div>
              <div className="text-[11px] text-gray-500 mt-1.5">8 412 / 10 000 aujourd'hui</div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-white ring-1 ring-gray-100 flex">
            <div className="relative w-24 shrink-0">
              <ImageWithFallback src="https://images.unsplash.com/photo-1572357243457-fc153742e7a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=600" alt="Légumes" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0F8A4F]/55 to-transparent" />
            </div>
            <div className="flex-1 p-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-gray-900">5 portions de fruits & légumes</div>
                <div className="text-xs font-bold text-[#0F8A4F]">60%</div>
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0F8A4F] to-[#12C76F]" style={{ width: '60%' }} />
              </div>
              <div className="text-[11px] text-gray-500 mt-1.5">3 / 5 portions</div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-white ring-1 ring-gray-100 flex">
            <div className="relative w-24 shrink-0">
              <ImageWithFallback src="https://images.unsplash.com/photo-1758885428976-dd612a7f3046?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=600" alt="Méditation" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#3046C7]/55 to-transparent" />
            </div>
            <div className="flex-1 p-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-gray-900">10 min de respiration</div>
                <div className="text-xs font-bold text-[#3046C7]">100%</div>
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#3046C7] to-[#5B6BFF]" style={{ width: '100%' }} />
              </div>
              <div className="text-[11px] text-gray-500 mt-1.5">Objectif atteint • série de 12 jours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mes réussites / Badges */}
      <div className="rounded-2xl overflow-hidden relative bg-[#0B1220] text-white shadow-lg">
        <ImageWithFallback src="https://images.unsplash.com/photo-1658092967527-4e140d9bdaea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220] via-[#0B1220]/85 to-[#1E5BFF]/40" />
        <div className="relative p-5">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#FFD400]" />
            <h3 className="font-bold">Mes réussites</h3>
            <span className="ml-auto text-xs text-white/70">12 / 30 badges</span>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { e: '🏃‍♀️', t: 'Coureuse' },
              { e: '🥗', t: 'Équilibre' },
              { e: '💧', t: 'Hydratée' },
              { e: '😴', t: '7 h dodo' },
              { e: '🧘', t: 'Zen 12j' },
              { e: '❤️', t: 'Tension OK' },
              { e: '🌿', t: 'Tradition' },
              { e: '👯', t: 'Cercle' },
            ].map((b) => (
              <div key={b.t} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-white/15 ring-1 ring-white/20 grid place-items-center text-xl backdrop-blur">{b.e}</div>
                <div className="text-[10px] text-white/85 mt-1.5 text-center leading-tight">{b.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mon cercle de soutien */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-gray-900 inline-flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#FF4D8D]" /> Mon cercle de soutien
          </h3>
          <button className="text-xs text-teal-600 font-medium">Inviter</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {[
            { name: 'Aminata', role: 'Sœur', img: 'https://images.unsplash.com/photo-1770283553838-769c5f97d55c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=400' },
            { name: 'Mariam', role: 'Mère', img: 'https://images.unsplash.com/photo-1709513641614-f1b8fd550761?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=400' },
            { name: 'Adjoa', role: 'Amie', img: 'https://images.unsplash.com/photo-1764662028086-e74ce491080e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=400' },
            { name: 'Dr Bah', role: 'Médecin', img: 'https://images.unsplash.com/photo-1666886573681-a8fbe983a3fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=400' },
            { name: 'Coach Y.', role: 'Sport', img: 'https://images.unsplash.com/photo-1731512612807-9219775bcd2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=400' },
          ].map((p) => (
            <button key={p.name} className="shrink-0 flex flex-col items-center w-20">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-[#FFE0EC] shadow-sm">
                <ImageWithFallback src={p.img} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-[12px] font-bold text-gray-900 mt-1.5 leading-tight">{p.name}</div>
              <div className="text-[10px] text-gray-500">{p.role}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Galerie de souvenirs santé */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-gray-900 inline-flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#1E5BFF]" /> Mes souvenirs
          </h3>
          <button className="text-xs text-teal-600 font-medium">Tout voir</button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            'https://images.unsplash.com/photo-1773858440557-cdb7fa2275bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=600',
            'https://images.unsplash.com/photo-1683194613814-6929a919c1fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=600',
            'https://images.unsplash.com/photo-1739302750675-042ed497a429?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=600',
            'https://images.unsplash.com/photo-1773858441008-4badd2bf99b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=600',
            'https://images.unsplash.com/photo-1606471059439-2dfc9bbfb150?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=600',
            'https://images.unsplash.com/photo-1773227060313-7623fd5bfa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=600',
            'https://images.unsplash.com/photo-1746791784434-76536c57f36d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=600',
            'https://images.unsplash.com/photo-1631558556874-1d127211f574?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=600',
            'https://images.unsplash.com/photo-1664575600796-ffa828c5cb6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=600',
          ].map((url, i) => (
            <button key={i} className="relative aspect-square rounded-lg overflow-hidden">
              <ImageWithFallback src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Citation inspirante */}
      <div className="rounded-2xl overflow-hidden relative bg-[#0B1220] text-white shadow-md">
        <ImageWithFallback src="https://images.unsplash.com/photo-1773858441346-b145862fdb0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220] via-[#0B1220]/80 to-[#FF4D8D]/40" />
        <div className="relative p-5">
          <Quote className="w-6 h-6 text-[#FFD400]" />
          <p className="text-base font-bold leading-snug mt-2">"La santé n'est pas un luxe, c'est un droit quotidien que je m'offre."</p>
          <div className="text-xs text-white/75 mt-3">— Mantra du jour, choisi pour vous</div>
        </div>
      </div>

      {/* Tendance hebdo */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-[#12C76F]" />
          <h3 className="font-bold text-gray-900">Tendance des 7 derniers jours</h3>
        </div>
        <div className="flex items-end gap-2 h-24">
          {[40, 65, 55, 80, 72, 90, 84].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-md bg-gradient-to-t from-[#1E5BFF] to-[#5B6BFF]" style={{ height: `${v}%` }} />
              <div className="text-[10px] text-gray-500">{['L','M','M','J','V','S','D'][i]}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500">Score bien-être moyen <span className="font-bold text-[#0B1220]">7,8/10</span> — en hausse de +0,6 vs semaine précédente.</div>
      </div>

      {/* Mes favoris */}
      <button
        onClick={() => onNavigate?.('favorites')}
        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left"
      >
        <div className="bg-white/20 backdrop-blur p-3 rounded-xl ring-1 ring-white/30">
          <Heart className="w-6 h-6 fill-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Mes favoris</h3>
          <p className="text-xs text-rose-50 mt-0.5">
            {favIds.length === 0
              ? 'Aucun centre sauvegardé pour le moment'
              : `${favIds.length} centre${favIds.length > 1 ? 's' : ''} sauvegardé${favIds.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Contact d'urgence */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-red-900">Contact d'urgence</h3>
        </div>
        <div className="space-y-2">
          {emergency?.name || emergency?.phone ? (
            <>
              <p className="text-sm font-medium text-gray-900">{emergency?.name}{emergency?.relation ? ` (${emergency.relation})` : ''}</p>
              <p className="text-sm text-gray-600">{emergency?.phone}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Aucun contact d'urgence renseigné</p>
          )}
        </div>
      </div>

      {/* Carnet de santé */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-teal-50 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Carnet de santé numérique</h3>
                <p className="text-xs text-gray-500">Synchronisé avec le carnet physique</p>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          <button onClick={() => onNavigate?.('macarte')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium text-gray-900">Ma carte Healthy Page (QR)</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => onNavigate?.('carnet')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium text-gray-900">Ouvrir mon carnet de santé</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => onNavigate?.('mesrdv')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium text-gray-900">Mes rendez-vous</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => onNavigate?.('ressentis')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium text-gray-900">Mes ressentis (auto-évaluation)</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => onNavigate?.('historique')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium text-gray-900">Historique des soins complet</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => onNavigate?.('parrainage')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium text-gray-900">Mon parrainage solidaire</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Historique des soins */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Historique des soins récents</h3>
        </div>

        {!demo ? (
          <p className="text-sm text-gray-500 py-4">Aucun soin enregistré pour le moment.</p>
        ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-teal-600 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Consultation générale</p>
              <p className="text-xs text-gray-600 mt-1">Dr. Camara, Centre Médical Akpakpa</p>
              <p className="text-xs text-gray-500 mt-1">12 Avril 2026</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Analyse de sang</p>
              <p className="text-xs text-gray-600 mt-1">Laboratoire BioMed Cadjèhoun</p>
              <p className="text-xs text-gray-500 mt-1">28 Mars 2026</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Radiographie thoracique</p>
              <p className="text-xs text-gray-600 mt-1">Centre d'Imagerie Ganhi</p>
              <p className="text-xs text-gray-500 mt-1">15 Février 2026</p>
            </div>
          </div>
        </div>
        )}

        <button onClick={() => onNavigate?.('historique')} className="w-full mt-4 text-sm text-teal-600 font-medium hover:text-teal-700 transition-colors">
          Voir l'historique complet
        </button>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onNavigate?.('carnet')} className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-teal-600 hover:bg-teal-50 transition-all">
          <span className="text-sm font-medium text-gray-900">Exporter le dossier</span>
        </button>
        <button onClick={() => onNavigate?.('parametres')} className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-teal-600 hover:bg-teal-50 transition-all">
          <span className="text-sm font-medium text-gray-900">Paramètres</span>
        </button>
      </div>
    </div>
  );
}
