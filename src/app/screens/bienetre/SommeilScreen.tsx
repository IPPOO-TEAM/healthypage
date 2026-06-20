import { ArrowLeft, Moon, Bed, Sunrise, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

interface Props { onBack: () => void; }

const WEEK = [
  { day: 'L', h: 6.5 }, { day: 'M', h: 7.2 }, { day: 'M', h: 6.0 },
  { day: 'J', h: 7.8 }, { day: 'V', h: 7.0 }, { day: 'S', h: 8.4 }, { day: 'D', h: 8.0 }
];

export default function SommeilScreen({ onBack }: Props) {
  const avg = (WEEK.reduce((s, d) => s + d.h, 0) / WEEK.length).toFixed(1);
  return (
    <div className="space-y-6">
      <div className="rounded-3xl shadow-lg bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 p-6 text-white">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><Moon className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">Sommeil</h2>
            <p className="text-sm text-white/85">Qualité et durée de vos nuits</p>
          </div>
        </div>
      </div>

      <div className="relative h-36 rounded-2xl overflow-hidden">
        <ImageWithFallback src="https://images.unsplash.com/photo-1631891337287-2cc11b6c46f7?w=1080" alt="Repos paisible" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/75 to-transparent flex items-end p-4">
          <p className="text-white text-sm">Nuits réparatrices · le sommeil comme médecine</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <Bed className="w-5 h-5 text-teal-600" />
          <p className="text-xs text-gray-500 mt-2">Couché</p>
          <p className="text-xl font-bold">23:10</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <Sunrise className="w-5 h-5 text-amber-500" />
          <p className="text-xs text-gray-500 mt-2">Levé</p>
          <p className="text-xl font-bold">06:45</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <p className="text-xs text-gray-500 mt-2">Moy. semaine</p>
          <p className="text-xl font-bold">{avg}h</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Heures de sommeil</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={WEEK}>
              <CartesianGrid key="g" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis key="x" dataKey="day" stroke="#9ca3af" fontSize={12} />
              <YAxis key="y" stroke="#9ca3af" fontSize={12} domain={[4, 10]} />
              <Tooltip key="t" />
              <Area key="a" type="monotone" dataKey="h" stroke="#0d9488" strokeWidth={3} fill="#0d9488" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5">
        <h3 className="font-semibold text-teal-900 mb-2">💡 Conseils</h3>
        <ul className="text-sm text-teal-800 space-y-1.5">
          <li>• Couchez-vous à heure fixe, idéalement avant 23h</li>
          <li>• Évitez les écrans 1h avant le coucher</li>
          <li>• Maintenez la chambre fraîche (18-20°C)</li>
          <li>• Évitez la caféine après 16h</li>
        </ul>
      </div>
    </div>
  );
}
