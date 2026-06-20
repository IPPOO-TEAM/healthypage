import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, Star, ThumbsUp, Send, Sparkles } from 'lucide-react';
import { LIEUX } from '../data';
import { addReview, ensureReviewSeed, listReviews, Review } from '../bookingStore';

export default function AvisScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const lieu = LIEUX.find((l) => l.id === id) ?? LIEUX[0];
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(params.get('write') === '1');
  const [, force] = useState(0);

  useEffect(() => {
    ensureReviewSeed();
    setReviews(listReviews(lieu.id));
  }, [lieu.id]);

  const stats = useMemo(() => {
    if (reviews.length === 0) return null;
    const avg = (k: keyof Review) => reviews.reduce((s, r) => s + (r[k] as number), 0) / reviews.length;
    return {
      overall: avg('ratingOverall'),
      cleanliness: avg('ratingCleanliness'),
      service: avg('ratingService'),
      location: avg('ratingLocation'),
      comfort: avg('ratingComfort'),
      count: reviews.length,
    };
  }, [reviews]);

  return (
    <div className="pb-10">
      <header className="sticky top-0 z-10 bg-white/85 backdrop-blur-xl border-b border-stone-200/60 px-6 sm:px-8 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Retour" className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-stone-500">Avis</div>
          <div className="font-semibold text-stone-900 text-sm truncate">{lieu.name}</div>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-semibold inline-flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> {showForm ? 'Fermer' : 'Écrire'}
        </button>
      </header>

      {stats && (
        <section className="px-6 sm:px-8 pt-5">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-stone-900">{stats.overall.toFixed(1)}</div>
              <div>
                <Stars n={stats.overall} />
                <div className="text-xs text-stone-500 mt-1">{stats.count} avis vérifiés</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Bar label="Propreté" v={stats.cleanliness} />
              <Bar label="Service" v={stats.service} />
              <Bar label="Emplacement" v={stats.location} />
              <Bar label="Confort" v={stats.comfort} />
            </div>
          </div>
        </section>
      )}

      {showForm && (
        <ReviewForm
          lieuId={lieu.id}
          onSubmitted={() => {
            setReviews(listReviews(lieu.id));
            setShowForm(false);
            force((n) => n + 1);
          }}
        />
      )}

      <section className="px-6 sm:px-8 mt-6 space-y-4">
        {reviews.length === 0 && (
          <div className="text-center text-sm text-stone-500 py-12">
            Pas encore d'avis. Soyez le premier !
          </div>
        )}
        {reviews.map((r) => (
          <article key={r.id} className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm text-stone-900">{r.author}</div>
                <div className="text-[11px] text-stone-500">Séjour en {fmtMonth(r.stayMonthISO)}</div>
              </div>
              <Stars n={r.ratingOverall} />
            </div>
            <h3 className="mt-2 font-semibold text-stone-900">{r.title}</h3>
            <p className="mt-1 text-sm text-stone-700 leading-relaxed">{r.body}</p>
            <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-stone-500">
              <ThumbsUp className="w-3 h-3" /> {r.helpful} personnes ont trouvé cet avis utile
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 0.5 <= n;
        return <Star key={i} className={`w-3.5 h-3.5 ${filled ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />;
      })}
    </div>
  );
}

function Bar({ label, v }: { label: string; v: number }) {
  return (
    <div className="grid grid-cols-[80px_1fr_28px] items-center gap-2 text-xs">
      <span className="text-stone-500">{label}</span>
      <span className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <span className="block h-full bg-rose-500" style={{ width: `${(v / 5) * 100}%` }} />
      </span>
      <span className="font-semibold text-stone-700 text-right">{v.toFixed(1)}</span>
    </div>
  );
}

function fmtMonth(iso: string) {
  const [y, m] = iso.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function ReviewForm({ lieuId, onSubmitted }: { lieuId: string; onSubmitted: () => void }) {
  const [overall, setOverall] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [service, setService] = useState(5);
  const [location, setLocation] = useState(5);
  const [comfort, setComfort] = useState(5);
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const submit = () => {
    if (!author.trim() || !title.trim() || body.trim().length < 10) return;
    addReview({
      id: `r-${Date.now()}`,
      lieuId,
      author: author.trim(),
      ratingOverall: overall,
      ratingCleanliness: cleanliness,
      ratingService: service,
      ratingLocation: location,
      ratingComfort: comfort,
      title: title.trim(),
      body: body.trim(),
      stayMonthISO: new Date().toISOString().slice(0, 7),
      createdAtISO: new Date().toISOString(),
      helpful: 0,
    });
    onSubmitted();
  };

  return (
    <section className="px-6 sm:px-8 mt-5">
      <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
        <h2 className="font-bold text-stone-900">Votre expérience</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Slider label="Note générale" v={overall} setV={setOverall} />
          <Slider label="Propreté" v={cleanliness} setV={setCleanliness} />
          <Slider label="Service" v={service} setV={setService} />
          <Slider label="Emplacement" v={location} setV={setLocation} />
          <Slider label="Confort" v={comfort} setV={setComfort} />
        </div>
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Votre prénom" className="w-full px-3 py-2.5 rounded-lg border border-stone-200 outline-none text-sm focus:border-rose-300" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Un titre marquant" className="w-full px-3 py-2.5 rounded-lg border border-stone-200 outline-none text-sm focus:border-rose-300" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Racontez votre séjour…" rows={4} className="w-full px-3 py-2.5 rounded-lg border border-stone-200 outline-none text-sm focus:border-rose-300 resize-none" />
        <button onClick={submit} className="w-full py-3 rounded-xl bg-rose-600 text-white font-semibold inline-flex items-center justify-center gap-2">
          <Send className="w-4 h-4" /> Publier mon avis
        </button>
      </div>
    </section>
  );
}

function Slider({ label, v, setV }: { label: string; v: number; setV: (n: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold text-stone-800">{v}/5</span>
      </div>
      <div className="inline-flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setV(n)} aria-label={`${label} ${n}`}>
            <Star className={`w-5 h-5 ${n <= v ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
