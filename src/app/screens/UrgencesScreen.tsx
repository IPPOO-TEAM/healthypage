import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Siren, Phone, MapPin, Flame, Shield, Ambulance, Volume2, VolumeX, Vibrate,
  Activity, AlertTriangle, ChevronRight, Send, Plane, Scale, Users, BookOpen, Heart, ShieldAlert, Clock,
} from 'lucide-react';

interface Props { onBack: () => void; }

type Section = 'accueil' | 'pompiers' | 'police' | 'ambulance' | 'gestes' | 'alerte' | 'drone' | 'juridique' | 'metiers';

const PHONE = {
  pompiers: '18',
  police: '17',
  ambulance: '15',
  europe: '112',
};

export default function UrgencesScreen({ onBack }: Props) {
  const [section, setSection] = useState<Section>('accueil');
  const [pos, setPos] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [posError, setPosError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) { setPosError('Géolocalisation indisponible'); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      (e) => setPosError(e.message || 'Position non autorisée'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const sharePosition = async () => {
    const url = pos ? `https://maps.google.com/?q=${pos.lat},${pos.lng}` : '';
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: 'Ma position', text: 'Ma position en cas d\'urgence', url });
      else await navigator.clipboard.writeText(url);
    } catch {}
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-red-700 via-red-600 to-rose-600">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,.4), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,.2), transparent 60%)' }} />
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="inline-flex items-center gap-1 text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full ring-1 ring-white/30 hover:bg-white/25 mb-4">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex items-start gap-3">
            <div className="bg-white/15 ring-1 ring-white/30 p-2.5 rounded-2xl"><Siren className="w-7 h-7" /></div>
            <div>
              <h1 className="text-3xl font-bold">Urgences</h1>
              <p className="text-sm text-red-50 mt-1 max-w-xl">Un accès immédiat aux secours, des gestes utiles, une position prête à transmettre.</p>
            </div>
          </div>
        </div>
      </div>

      {section === 'accueil' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <BigEmergencyButton color="from-orange-600 to-red-600" icon={Flame} label="Pompiers" phone={PHONE.pompiers} onClick={() => setSection('pompiers')} />
            <BigEmergencyButton color="from-blue-700 to-blue-900" icon={Shield} label="Police" phone={PHONE.police} onClick={() => setSection('police')} />
            <BigEmergencyButton color="from-rose-600 to-red-700" icon={Ambulance} label="Ambulance / SAMU" phone={PHONE.ambulance} onClick={() => setSection('ambulance')} />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 p-2 rounded-xl"><MapPin className="w-5 h-5 text-amber-700" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900">Ma position actuelle</h3>
                {pos
                  ? <p className="text-xs text-slate-500 font-mono">{pos.lat.toFixed(5)}, {pos.lng.toFixed(5)} (±{Math.round(pos.accuracy)} m)</p>
                  : <p className="text-xs text-slate-500">{posError ?? 'Recherche en cours…'}</p>}
              </div>
              <button onClick={sharePosition} disabled={!pos} className="px-3 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold disabled:opacity-50 hover:bg-amber-700">
                Partager
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SubTile onClick={() => setSection('alerte')} icon={Volume2} bg="bg-amber-50" color="text-amber-700" label="Alerte & alarme" />
            <SubTile onClick={() => setSection('gestes')} icon={BookOpen} bg="bg-emerald-50" color="text-emerald-700" label="Gestes d'urgence" />
            <SubTile onClick={() => setSection('drone')} icon={Plane} bg="bg-cyan-50" color="text-cyan-700" label="Drone zone pilote" />
            <SubTile onClick={() => setSection('juridique')} icon={Scale} bg="bg-violet-50" color="text-violet-700" label="Assistance juridique" />
            <SubTile onClick={() => setSection('metiers')} icon={Users} bg="bg-blue-50" color="text-blue-700" label="Métiers de l'urgence" />
            <a href={`tel:${PHONE.europe}`} className="p-4 rounded-2xl bg-red-50 ring-1 ring-red-100 hover:bg-red-100 transition-colors block">
              <Phone className="w-6 h-6 text-red-700" />
              <span className="block text-sm font-semibold text-red-900 mt-2">112 (Europe)</span>
            </a>
          </div>
        </>
      )}

      {section === 'pompiers' && (
        <SosDetail
          onBack={() => setSection('accueil')}
          color="from-orange-600 to-red-600"
          icon={Flame}
          title="SOS Pompiers"
          phone={PHONE.pompiers}
          intro="Gagnez des secondes précieuses, protégez la zone, guidez l'intervention."
          situations={[
            { id: 'incendie', label: 'Incendie domestique', steps: ['Évacuer immédiatement, fermer les portes derrière soi.', 'Ne pas utiliser d\'ascenseur.', 'Rester au sol pour éviter la fumée.', 'Appeler depuis l\'extérieur.'] },
            { id: 'fumee', label: 'Fumée intense', steps: ['Se baisser sous la fumée.', 'Mettre un linge humide sur le nez.', 'Sortir par le chemin le moins enfumé.'] },
            { id: 'brulure', label: 'Brûlure', steps: ['Refroidir 15 min sous eau tiède (15-25°C).', 'Ne pas percer les cloques.', 'Recouvrir d\'un linge propre.'] },
            { id: 'electrocution', label: 'Électrocution', steps: ['Couper le courant avant de toucher la victime.', 'Ne pas toucher la victime à mains nues si encore en contact.', 'Vérifier la respiration.'] },
            { id: 'noyade', label: 'Noyade', steps: ['Sortir la victime de l\'eau si possible sans danger.', 'Vérifier la respiration.', 'Démarrer la RCP si arrêt respiratoire.'] },
            { id: 'respi', label: 'Détresse respiratoire', steps: ['Position assise, dos droit.', 'Desserrer les vêtements.', 'Aérer la pièce.'] },
          ]}
          pos={pos}
        />
      )}

      {section === 'police' && (
        <PoliceDetail onBack={() => setSection('accueil')} pos={pos} />
      )}

      {section === 'ambulance' && (
        <SosDetail
          onBack={() => setSection('accueil')}
          color="from-rose-600 to-red-700"
          icon={Ambulance}
          title="SOS Ambulance & SAMU"
          phone={PHONE.ambulance}
          intro="Reconnaître vite, agir juste, transmettre les bonnes informations."
          situations={[
            { id: 'avc', label: 'Suspicion d\'AVC', steps: ['Visage : sourire asymétrique ?', 'Bras : un bras tombe ?', 'Parole : difficile, incompréhensible ?', 'Heure d\'apparition à transmettre au régulateur.'] },
            { id: 'infarct', label: 'Infarctus', steps: ['Douleur thoracique > 20 min, irradiant bras/mâchoire.', 'Allonger, jambes surélevées.', 'Donner aspirine si pas de contre-indication.'] },
            { id: 'asthme', label: 'Crise d\'asthme', steps: ['Position assise.', 'Bronchodilatateur 2 bouffées toutes les 10 min.', 'Si persistance > 20 min : SAMU.'] },
            { id: 'allergie', label: 'Allergie sévère', steps: ['Allonger, jambes surélevées.', 'Stylo auto-injecteur d\'adrénaline si prescrit.', 'Surveiller respiration.'] },
            { id: 'connaissance', label: 'Perte de connaissance', steps: ['Vérifier respiration.', 'Position latérale de sécurité.', 'Surveiller jusqu\'à l\'arrivée des secours.'] },
            { id: 'hemorragie', label: 'Hémorragie', steps: ['Compression manuelle sur la plaie.', 'Allonger la victime.', 'Surveiller la conscience.'] },
          ]}
          pos={pos}
          showRegulator
        />
      )}

      {section === 'gestes' && <GestesUrgence onBack={() => setSection('accueil')} />}
      {section === 'alerte' && <AlertePage onBack={() => setSection('accueil')} />}
      {section === 'drone' && <DronePage onBack={() => setSection('accueil')} pos={pos} />}
      {section === 'juridique' && <JuridiquePage onBack={() => setSection('accueil')} />}
      {section === 'metiers' && <MetiersPage onBack={() => setSection('accueil')} />}
    </div>
  );
}

function BigEmergencyButton({ color, icon: Icon, label, phone, onClick }: any) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${color} text-white shadow-md`}>
      <Icon className="w-9 h-9" />
      <h3 className="text-xl font-bold mt-3">{label}</h3>
      <p className="text-xs text-white/85 mt-1">Numéro : {phone}</p>
      <div className="mt-4 flex gap-2">
        <a href={`tel:${phone}`} className="flex-1 inline-flex items-center justify-center gap-1 bg-white text-slate-900 py-2 rounded-xl font-semibold text-sm hover:bg-slate-100">
          <Phone className="w-4 h-4" /> Appeler
        </a>
        <button onClick={onClick} className="px-3 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 ring-1 ring-white/30">
          Détails
        </button>
      </div>
    </div>
  );
}

function SubTile({ onClick, icon: Icon, bg, color, label }: any) {
  return (
    <button onClick={onClick} className={`text-left p-4 rounded-2xl ${bg} ring-1 ring-black/5 hover:shadow-md transition-shadow`}>
      <Icon className={`w-6 h-6 ${color}`} />
      <span className={`block text-sm font-semibold mt-2 ${color}`}>{label}</span>
    </button>
  );
}

function BackBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="p-2 rounded-xl bg-white ring-1 ring-slate-200 hover:bg-slate-50">
        <ArrowLeft className="w-4 h-4" />
      </button>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
    </div>
  );
}

function SosDetail({ onBack, color, icon: Icon, title, phone, intro, situations, pos, showRegulator }: any) {
  const [active, setActive] = useState<string>(situations[0].id);
  const cur = situations.find((s: any) => s.id === active);
  return (
    <>
      <BackBar onBack={onBack} title={title} />
      <div className={`rounded-2xl p-5 bg-gradient-to-br ${color} text-white shadow-md`}>
        <div className="flex items-center gap-3">
          <Icon className="w-9 h-9" />
          <div>
            <p className="text-xs uppercase tracking-widest text-white/80">Numéro vital</p>
            <p className="text-3xl font-bold">{phone}</p>
          </div>
        </div>
        <p className="text-sm text-white/90 mt-3">{intro}</p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <a href={`tel:${phone}`} className="bg-white text-slate-900 py-3 rounded-xl text-center font-semibold hover:bg-slate-100 inline-flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" /> Appeler maintenant
          </a>
          <button onClick={() => {
            const url = pos ? `https://maps.google.com/?q=${pos.lat},${pos.lng}` : '';
            if (navigator.share && url) navigator.share({ title: 'Ma position', url }).catch(() => {});
            else if (url) navigator.clipboard.writeText(url).catch(() => {});
          }} className="bg-white/20 ring-1 ring-white/30 py-3 rounded-xl font-semibold hover:bg-white/30 inline-flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" /> Partager position
          </button>
        </div>
      </div>

      <section className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Premières actions</h3>
        <p className="text-xs text-slate-500 mt-1">Choisissez la situation qui correspond.</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {situations.map((s: any) => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${active === s.id ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {s.label}
            </button>
          ))}
        </div>
        <ol className="mt-4 space-y-2">
          {cur.steps.map((step: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span className="bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="text-sm text-slate-700">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {showRegulator && (
        <section className="bg-rose-50 rounded-2xl p-5 ring-1 ring-rose-100">
          <h3 className="font-semibold text-rose-900 inline-flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> À transmettre au régulateur</h3>
          <ul className="mt-3 space-y-1 text-sm text-rose-900">
            <li>• Âge approximatif et sexe</li>
            <li>• Symptômes principaux et heure d'apparition</li>
            <li>• Traitements connus et allergies</li>
            <li>• Localisation précise + point de repère</li>
            <li>• Numéro de rappel si la ligne coupe</li>
          </ul>
        </section>
      )}
    </>
  );
}

function PoliceDetail({ onBack, pos }: { onBack: () => void; pos: any }) {
  const [silent, setSilent] = useState(false);
  const [msg, setMsg] = useState('');
  return (
    <>
      <BackBar onBack={onBack} title="SOS Police" />
      <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-md">
        <Shield className="w-9 h-9" />
        <p className="text-xs uppercase tracking-widest text-white/80 mt-3">Numéro vital</p>
        <p className="text-3xl font-bold">{PHONE.police}</p>
        <p className="text-sm text-white/90 mt-3">Signalez, géolocalisez, alertez sans vous exposer.</p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <a href={`tel:${PHONE.police}`} className="bg-white text-slate-900 py-3 rounded-xl text-center font-semibold hover:bg-slate-100 inline-flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" /> Appeler la Police
          </a>
          <button onClick={() => setSilent(s => !s)} className={`py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 ${silent ? 'bg-amber-400 text-slate-900' : 'bg-white/20 ring-1 ring-white/30 hover:bg-white/30'}`}>
            <ShieldAlert className="w-4 h-4" /> {silent ? 'Mode discret activé' : 'Activer mode discret'}
          </button>
        </div>
      </div>

      <section className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Signalement discret</h3>
        <p className="text-xs text-slate-500 mt-1">Préparez votre message d'urgence. Il sera envoyé avec votre position lorsque vous le déclencherez.</p>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3}
          placeholder="Ex : Je suis en danger à cette adresse, envoyez de l'aide rapidement."
          className="mt-3 w-full px-3 py-2 rounded-xl ring-1 ring-slate-200 text-sm focus:ring-blue-400 focus:outline-none" />
        <button
          onClick={() => {
            const url = pos ? `https://maps.google.com/?q=${pos.lat},${pos.lng}` : '';
            const body = encodeURIComponent(`${msg}\n${url}`);
            window.location.href = `sms:?body=${body}`;
          }}
          disabled={!msg}
          className="mt-3 w-full py-2.5 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" /> Envoyer aux contacts de confiance
        </button>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Historique des alertes</h3>
        <p className="text-xs text-slate-500 mt-1">Vos signalements depuis ce compte apparaissent ici.</p>
        <div className="mt-3 text-sm text-slate-500 italic">Aucune alerte enregistrée pour le moment.</div>
      </section>
    </>
  );
}

function GestesUrgence({ onBack }: { onBack: () => void }) {
  const fiches = [
    { id: 'pls', t: 'Position latérale de sécurité', d: 'Pour une victime inconsciente qui respire.', steps: ['Allonger sur le dos.', 'Plier la jambe opposée à vous.', 'Tourner la victime sur le côté.', 'Stabiliser la tête, ouvrir la bouche.'] },
    { id: 'hemo', t: 'Compression d\'hémorragie', d: 'Stopper un saignement abondant.', steps: ['Comprimer fort avec un linge propre.', 'Allonger la victime.', 'Maintenir la compression.', 'Surveiller la conscience.'] },
    { id: 'etouf', t: 'Étouffement', d: 'Manœuvre de Heimlich pour adulte.', steps: ['5 claques dorsales.', 'Sinon, 5 compressions abdominales.', 'Alterner jusqu\'à expulsion.', 'Si inconscience : RCP.'] },
    { id: 'allerg', t: 'Réaction allergique', d: 'Œdème, urticaire, gêne respiratoire.', steps: ['Allonger, jambes surélevées.', 'Antihistaminique si prescrit.', 'Adrénaline auto-injectable si choc.', 'Appeler le SAMU.'] },
    { id: 'brul', t: 'Brûlure thermique', d: 'Refroidir et protéger la zone.', steps: ['Eau tiède 15 min.', 'Retirer vêtements non collés.', 'Ne pas percer les cloques.', 'Couvrir d\'un linge propre.'] },
    { id: 'malaise', t: 'Malaise', d: 'Vertige, faiblesse, sueurs.', steps: ['Allonger ou asseoir.', 'Desserrer vêtements.', 'Hydrater par petites gorgées.', 'Surveiller jusqu\'à amélioration.'] },
  ];
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <BackBar onBack={onBack} title="Guides gestes d'urgence" />
      <p className="text-sm text-slate-600">Des gestes simples pour stabiliser la situation avant l'arrivée des secours.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fiches.map(f => (
          <button key={f.id} onClick={() => setOpen(open === f.id ? null : f.id)} className="text-left bg-white rounded-2xl p-4 shadow-sm ring-1 ring-slate-100 hover:ring-emerald-300 transition">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{f.t}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{f.d}</p>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${open === f.id ? 'rotate-90' : ''}`} />
            </div>
            {open === f.id && (
              <ol className="mt-3 space-y-2">
                {f.steps.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="bg-emerald-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

function AlertePage({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<'sound' | 'silent' | 'vibrate' | 'malaise'>('sound');
  const [armed, setArmed] = useState(false);

  const trigger = () => {
    setArmed(true);
    if (mode === 'sound') {
      try {
        const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
        if (Ctx) {
          const ctx = new Ctx();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'square';
          o.frequency.value = 1000;
          g.gain.value = 0.3;
          o.connect(g).connect(ctx.destination);
          o.start();
          setTimeout(() => { o.stop(); ctx.close(); setArmed(false); }, 3000);
        }
      } catch {}
    } else if (mode === 'vibrate' && 'vibrate' in navigator) {
      try { navigator.vibrate([400, 200, 400, 200, 400]); } catch {}
      setTimeout(() => setArmed(false), 2000);
    } else {
      setTimeout(() => setArmed(false), 2000);
    }
  };

  const opts: { id: typeof mode; label: string; icon: any }[] = [
    { id: 'sound', label: 'Sonore', icon: Volume2 },
    { id: 'silent', label: 'Silencieux', icon: VolumeX },
    { id: 'vibrate', label: 'Vibration', icon: Vibrate },
    { id: 'malaise', label: 'Mode malaise', icon: Heart },
  ];

  return (
    <>
      <BackBar onBack={onBack} title="Alerte & Alarme" />
      <p className="text-sm text-slate-600">Une alerte qui se déclenche vite, une localisation qui se partage sans effort.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {opts.map(o => {
          const Icon = o.icon;
          return (
            <button key={o.id} onClick={() => setMode(o.id)} className={`p-4 rounded-2xl text-center ring-1 ${mode === o.id ? 'bg-amber-600 text-white ring-amber-700' : 'bg-white text-slate-700 ring-slate-200'}`}>
              <Icon className="w-6 h-6 mx-auto" />
              <span className="block text-sm font-semibold mt-2">{o.label}</span>
            </button>
          );
        })}
      </div>

      <button onClick={trigger}
        className={`w-full py-5 rounded-2xl font-bold text-lg transition-colors ${armed ? 'bg-red-700 text-white animate-pulse' : 'bg-red-600 text-white hover:bg-red-700'}`}>
        {armed ? 'ALERTE ACTIVE' : 'DÉCLENCHER L\'ALERTE'}
      </button>

      <section className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Mode malaise</h3>
        <p className="text-xs text-slate-500 mt-1">Détection d'immobilité prolongée. Si activé, une alerte est envoyée automatiquement à vos contacts si aucun mouvement n'est détecté pendant 3 minutes.</p>
        <p className="text-xs text-amber-700 mt-2 inline-flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> Nécessite l'autorisation des capteurs de mouvement (à activer dans les paramètres système).</p>
      </section>
    </>
  );
}

function DronePage({ onBack, pos }: { onBack: () => void; pos: any }) {
  const [status, setStatus] = useState<'idle' | 'sent' | 'taken' | 'searching'>('idle');
  const [desc, setDesc] = useState('');
  const send = () => {
    setStatus('sent');
    setTimeout(() => setStatus('taken'), 1200);
    setTimeout(() => setStatus('searching'), 2500);
  };
  return (
    <>
      <BackBar onBack={onBack} title="Drone zone pilote" />
      <p className="text-sm text-slate-600">Localiser plus vite quand le terrain complique tout. Service partenaire disponible dans certaines zones.</p>
      <section className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-700">Description de la situation</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 rounded-xl ring-1 ring-slate-200 text-sm focus:ring-cyan-400 focus:outline-none" placeholder="Ex : Disparition randonnée, dernière position connue il y a 1h..." />
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
          Position transmise : {pos ? `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}` : 'indisponible'}
        </div>
        <button onClick={send} disabled={!desc || status !== 'idle'} className="w-full py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 disabled:opacity-60">
          Envoyer une demande de repérage
        </button>
        {status !== 'idle' && (
          <ol className="space-y-2 mt-2">
            {[
              { k: 'sent', label: 'Demande envoyée' },
              { k: 'taken', label: 'Prise en charge par l\'opérateur' },
              { k: 'searching', label: 'Drone en zone de recherche' },
            ].map(s => {
              const order = ['sent', 'taken', 'searching'];
              const reached = order.indexOf(status) >= order.indexOf(s.k);
              return (
                <li key={s.k} className={`flex items-center gap-2 text-sm ${reached ? 'text-cyan-800' : 'text-slate-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${reached ? 'bg-cyan-600' : 'bg-slate-300'}`} />
                  {s.label}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </>
  );
}

function JuridiquePage({ onBack }: { onBack: () => void }) {
  const items = [
    { t: 'Parler à un juriste', d: 'Mise en relation avec un juriste partenaire (sous 24h).', icon: Scale },
    { t: 'Dépôt de plainte', d: 'Préparer les éléments, modèles de courrier, étapes.', icon: ShieldAlert },
    { t: 'Violences domestiques', d: 'Ressources confidentielles, hébergements d\'urgence, contacts.', icon: Heart },
    { t: 'Accident', d: 'Constat, attestation, recours, démarches assurance.', icon: AlertTriangle },
  ];
  return (
    <>
      <BackBar onBack={onBack} title="Assistance juridique" />
      <p className="text-sm text-slate-600">Être accompagné, protéger ses droits, avancer étape par étape.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(it => {
          const Icon = it.icon;
          return (
            <div key={it.t} className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start gap-3">
                <div className="bg-violet-50 p-2 rounded-xl"><Icon className="w-5 h-5 text-violet-700" /></div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">{it.t}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{it.d}</p>
                </div>
              </div>
              <button className="mt-3 w-full py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">Ouvrir</button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function MetiersPage({ onBack }: { onBack: () => void }) {
  const metiers = [
    { t: 'Pompiers', d: 'Premiers à intervenir : feu, accidents, sauvetage.', icon: Flame, color: 'text-orange-700', bg: 'bg-orange-50' },
    { t: 'Ambulanciers', d: 'Transport sanitaire et premiers gestes médicaux.', icon: Ambulance, color: 'text-rose-700', bg: 'bg-rose-50' },
    { t: 'Médecins urgentistes', d: 'Régulation SAMU, prise en charge médicale en urgence.', icon: Activity, color: 'text-red-700', bg: 'bg-red-50' },
    { t: 'Policiers', d: 'Sécurité, intervention, ordre public.', icon: Shield, color: 'text-blue-700', bg: 'bg-blue-50' },
    { t: 'Secouristes bénévoles', d: 'Premiers secours, événementiel, soutien.', icon: Users, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { t: 'Psychologues d\'urgence', d: 'Accompagnement post-traumatique, cellule de crise.', icon: Heart, color: 'text-violet-700', bg: 'bg-violet-50' },
  ];
  return (
    <>
      <BackBar onBack={onBack} title="Métiers de l'urgence" />
      <p className="text-sm text-slate-600">Comprendre l'intervention, mieux coopérer, améliorer la prise en charge.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metiers.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.t} className={`rounded-2xl p-4 ${m.bg} ring-1 ring-black/5`}>
              <Icon className={`w-6 h-6 ${m.color}`} />
              <h3 className="font-semibold text-slate-900 mt-2">{m.t}</h3>
              <p className="text-xs text-slate-600 mt-1">{m.d}</p>
            </div>
          );
        })}
      </div>
      <div className="bg-blue-50 rounded-2xl p-4 ring-1 ring-blue-100 text-sm text-blue-900 inline-flex items-start gap-2">
        <Clock className="w-4 h-4 mt-0.5 shrink-0" />
        Donnez toujours une information précise au régulateur : symptômes, durée, position. Cela accélère la prise en charge.
      </div>
    </>
  );
}
