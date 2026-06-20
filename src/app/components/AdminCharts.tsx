import { useMemo, useEffect, useRef, useState, ReactNode } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';

function ChartFrame({ height, children }: { height: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ width: '100%', height }}>
      {size.w > 0 && size.h > 0 ? children : null}
    </div>
  );
}

const PALETTE = ['#0d9488', '#3b82f6', '#f59e0b', '#e11d48', '#a855f7', '#22c55e'];

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400_000);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function RdvTrendChart({ rdvs }: { rdvs: any[] }) {
  const data = useMemo(() => {
    const days = lastNDays(14);
    return days.map((d) => ({
      day: d.slice(5),
      total: rdvs.filter((r) => (r.date ?? '').slice(0, 10) === d).length,
      confirmed: rdvs.filter((r) => (r.date ?? '').slice(0, 10) === d && (r.status ?? 'confirmed') === 'confirmed').length,
    }));
  }, [rdvs]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ minWidth: 0 }}>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-semibold text-gray-900">RDV · 14 derniers jours</h3>
        <span className="text-xs text-gray-500">{data.reduce((s, d) => s + d.total, 0)} au total</span>
      </div>
      <ChartFrame height={180}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} debounce={50}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis key="x" dataKey="day" stroke="#94a3b8" fontSize={11} />
            <YAxis key="y" stroke="#94a3b8" fontSize={11} allowDecimals={false} domain={[0, (max: number) => Math.max(max, 4)]} />
            <Tooltip key="tt" contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Line key="l-total" type="monotone" dataKey="total" stroke="#0d9488" strokeWidth={2.5} dot={false} name="Total" />
            <Line key="l-confirmed" type="monotone" dataKey="confirmed" stroke="#3b82f6" strokeWidth={2} dot={false} name="Confirmés" />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}

export function RdvStatusChart({ rdvs }: { rdvs: any[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    rdvs.forEach((r) => {
      const s = r.status ?? 'confirmed';
      counts[s] = (counts[s] ?? 0) + 1;
    });
    const entries = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return entries.length ? entries : [{ name: 'Aucun', value: 1 }];
  }, [rdvs]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ minWidth: 0 }}>
      <h3 className="font-semibold text-gray-900 mb-3">Statuts RDV</h3>
      <ChartFrame height={180}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} debounce={50}>
          <PieChart>
            <Pie key="pie" data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
              {data.map((entry, i) => <Cell key={`cell-${entry.name}`} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip key="tt" contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Legend key="lg" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}

export function ProSpecialtyChart({ pros }: { pros: any[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    pros.forEach((p) => {
      const s = p.specialty || 'Autre';
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [pros]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ minWidth: 0 }}>
      <h3 className="font-semibold text-gray-900 mb-3">Top spécialités</h3>
      <ChartFrame height={180}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} debounce={50}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis key="x" dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} />
            <YAxis key="y" stroke="#94a3b8" fontSize={11} allowDecimals={false} domain={[0, (max: number) => Math.max(max, 4)]} />
            <Tooltip key="tt" contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Bar key="bar" dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}
