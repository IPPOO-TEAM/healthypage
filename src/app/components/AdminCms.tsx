import { useState } from 'react';
import { Save, Eye, Megaphone, Wrench, Phone, RotateCcw } from 'lucide-react';
import { CmsConfig, CmsBannerSeverity, DEFAULT_CMS, loadCms, saveCms } from './cms';
import { CmsBanner } from './CmsBanner';
import { useToast } from './AdminToast';
import { logAudit } from './adminSession';

interface Props { adminEmail: string; }

const SEVERITIES: { id: CmsBannerSeverity; label: string }[] = [
  { id: 'info', label: 'Info' },
  { id: 'success', label: 'Succès' },
  { id: 'warning', label: 'Attention' },
  { id: 'critical', label: 'Critique' },
];

export function AdminCms({ adminEmail }: Props) {
  const { push } = useToast();
  const [cfg, setCfg] = useState<CmsConfig>(() => loadCms());
  const [dirty, setDirty] = useState(false);

  const update = <K extends keyof CmsConfig>(key: K, value: CmsConfig[K]) => {
    setCfg((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    saveCms(cfg);
    setDirty(false);
    logAudit('cms-update', adminEmail, cfg.maintenanceMode ? 'maintenance-on' : 'standard');
    push('success', 'Contenu publié.');
  };

  const handleReset = () => {
    if (!confirm('Réinitialiser tous les contenus CMS ?')) return;
    setCfg(DEFAULT_CMS);
    setDirty(true);
  };

  return (
    <div className="space-y-4">
      {cfg.banner.active && (
        <div>
          <p className="text-xs text-gray-500 mb-2 inline-flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Aperçu bannière</p>
          <CmsBanner />
        </div>
      )}

      <section className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 inline-flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-600" /> Bannière annonce
          </h3>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={cfg.banner.active}
              onChange={(e) => update('banner', { ...cfg.banner, active: e.target.checked })}
            />
            Active
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SEVERITIES.map((s) => (
            <button
              key={s.id}
              onClick={() => update('banner', { ...cfg.banner, severity: s.id })}
              className={`px-3 py-2 rounded-lg text-sm border transition ${
                cfg.banner.severity === s.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <Field label="Titre">
          <input
            value={cfg.banner.title}
            onChange={(e) => update('banner', { ...cfg.banner, title: e.target.value })}
            placeholder="Maintenance prévue jeudi 8 mai"
            className="w-full px-3 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-slate-700 text-sm"
          />
        </Field>
        <Field label="Message">
          <textarea
            value={cfg.banner.message}
            onChange={(e) => update('banner', { ...cfg.banner, message: e.target.value })}
            rows={3}
            placeholder="L'application sera indisponible de 22h à 23h pour mise à jour."
            className="w-full px-3 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-slate-700 text-sm"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Texte du bouton">
            <input
              value={cfg.banner.ctaLabel ?? ''}
              onChange={(e) => update('banner', { ...cfg.banner, ctaLabel: e.target.value })}
              placeholder="En savoir plus"
              className="w-full px-3 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-slate-700 text-sm"
            />
          </Field>
          <Field label="Lien (URL ou route)">
            <input
              value={cfg.banner.ctaHref ?? ''}
              onChange={(e) => update('banner', { ...cfg.banner, ctaHref: e.target.value })}
              placeholder="/assistance ou https://…"
              className="w-full px-3 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-slate-700 text-sm"
            />
          </Field>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Bloc d'accueil personnalisé</h3>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={cfg.hero.active}
              onChange={(e) => update('hero', { ...cfg.hero, active: e.target.checked })}
            />
            Active
          </label>
        </div>
        <Field label="Eyebrow">
          <input
            value={cfg.hero.eyebrow}
            onChange={(e) => update('hero', { ...cfg.hero, eyebrow: e.target.value })}
            placeholder="Nouveauté"
            className="w-full px-3 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-slate-700 text-sm"
          />
        </Field>
        <Field label="Titre">
          <input
            value={cfg.hero.title}
            onChange={(e) => update('hero', { ...cfg.hero, title: e.target.value })}
            placeholder="Bienvenue sur Healthy Page"
            className="w-full px-3 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-slate-700 text-sm"
          />
        </Field>
        <Field label="Sous-titre">
          <textarea
            value={cfg.hero.subtitle}
            onChange={(e) => update('hero', { ...cfg.hero, subtitle: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-slate-700 text-sm"
          />
        </Field>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 inline-flex items-center gap-2">
            <Phone className="w-5 h-5 text-teal-600" /> Coordonnées support
          </h3>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={cfg.contact.active}
              onChange={(e) => update('contact', { ...cfg.contact, active: e.target.checked })}
            />
            Affiché
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Urgences">
            <input
              value={cfg.contact.emergencyPhone}
              onChange={(e) => update('contact', { ...cfg.contact, emergencyPhone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-slate-700 text-sm"
            />
          </Field>
          <Field label="Email support">
            <input
              value={cfg.contact.supportEmail}
              onChange={(e) => update('contact', { ...cfg.contact, supportEmail: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-slate-700 text-sm"
            />
          </Field>
        </div>
        <Field label="Horaires">
          <input
            value={cfg.contact.supportHours}
            onChange={(e) => update('contact', { ...cfg.contact, supportHours: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-slate-700 text-sm"
          />
        </Field>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={cfg.maintenanceMode}
            onChange={(e) => update('maintenanceMode', e.target.checked)}
            className="mt-1"
          />
          <div>
            <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Mode maintenance
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Affiche un message « service indisponible » sur l'app patient.
            </p>
          </div>
        </label>
      </section>

      <div className="sticky bottom-0 -mx-5 px-5 py-3 bg-white/95 backdrop-blur border-t border-slate-200 flex items-center gap-2">
        <button
          onClick={handleReset}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" /> Réinitialiser
        </button>
        <div className="flex-1" />
        {dirty && <span className="text-xs text-amber-700">Modifications non publiées</span>}
        <button
          onClick={handleSave}
          disabled={!dirty}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-sm font-semibold inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Publier
        </button>
      </div>
      {cfg.updatedAt && (
        <p className="text-[11px] text-gray-400 text-center">
          Dernière publication : {new Date(cfg.updatedAt).toLocaleString('fr-FR')}
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
