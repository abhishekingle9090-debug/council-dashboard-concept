// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import {
  Users,
  Radio,
  Zap,
  Globe2,
  MessageSquare,
  UserPlus2,
  CheckCircle2,
  Handshake,
  ArrowUpRight,
} from 'lucide-react';

// ---------- helpers ----------
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const fmt = (n) => n.toLocaleString('en-IN');

const FEED_TEMPLATES = [
  {
    icon: CheckCircle2,
    text: (n) => `${n} checked in at the Innovation Hall`,
    color: '#34E7B0',
  },
  {
    icon: MessageSquare,
    text: (n) => `New question raised in "AI in Alumni Networks"`,
    color: '#4F9DFF',
  },
  {
    icon: UserPlus2,
    text: (n) => `Alumnus from the 2019 batch joined the stream`,
    color: '#B98CFF',
  },
  {
    icon: Handshake,
    text: () => `Sponsor rep pinged the "Collaborate" desk`,
    color: '#FFB347',
  },
  {
    icon: Zap,
    text: () => `Engagement spike on the live poll`,
    color: '#4F9DFF',
  },
];

const NAMES = [
  'R. Mehta',
  'S. Iyer',
  'A. Kulkarni',
  'P. Sharma',
  'K. Verma',
  'J. Fernandes',
  'N. Rao',
  'T. Desai',
];

function seedHeatmap(rows, cols) {
  return Array.from({ length: rows * cols }, () => Math.random() * 0.5 + 0.05);
}

// ---------- small building blocks ----------
function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
    </span>
  );
}

function Panel({ children, className = '' }) {
  return (
    <div
      className={`relative rounded-2xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02)] ${className}`}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, delta, icon: Icon, accent, suffix = '' }) {
  const [display, setDisplay] = useState(value);
  const raf = useRef(null);

  useEffect(() => {
    const start = display;
    const end = value;
    const startTime = performance.now();
    const dur = 700;
    cancelAnimationFrame(raf.current);
    const tick = (t) => {
      const p = clamp((t - startTime) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Panel className="p-5 flex flex-col gap-3 overflow-hidden">
      <div className="flex items-start justify-between">
        <span className="text-[13px] tracking-wide text-slate-400">
          {label}
        </span>
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}1A` }}
        >
          <Icon size={16} style={{ color: accent }} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-semibold text-slate-50 tabular-nums tracking-tight">
          {fmt(display)}
          {suffix}
        </span>
        {delta != null && (
          <span
            className={`flex items-center gap-0.5 text-xs mb-1 ${
              delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            <ArrowUpRight size={12} className={delta < 0 ? 'rotate-90' : ''} />
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div
        className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full blur-2xl opacity-20"
        style={{ background: accent }}
      />
    </Panel>
  );
}

function Heatmap({ grid, rows, cols }) {
  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
    >
      {grid.map((v, i) => (
        <div
          key={i}
          className="aspect-square rounded-[3px] transition-colors duration-700"
          style={{
            background: `rgba(79,157,255,${0.08 + v * 0.75})`,
            boxShadow: v > 0.7 ? '0 0 8px rgba(79,157,255,0.55)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

// ---------- main ----------
export default function TicPulseDashboard() {
  const [attendees, setAttendees] = useState(1842);
  const [engagement, setEngagement] = useState(76);
  const [rsvpRate, setRsvpRate] = useState(68);
  const [alumniOnline, setAlumniOnline] = useState(214);
  const [clock, setClock] = useState(new Date());
  const [feed, setFeed] = useState(() =>
    Array.from({ length: 5 }, (_, i) => {
      const t = FEED_TEMPLATES[i % FEED_TEMPLATES.length];
      return {
        id: i,
        ...t,
        name: NAMES[i % NAMES.length],
        time: new Date(Date.now() - i * 60000),
      };
    })
  );
  const [history, setHistory] = useState(() =>
    Array.from({ length: 14 }, (_, i) => ({
      t: i,
      engagement: 55 + Math.round(Math.sin(i / 2) * 10 + Math.random() * 8),
    }))
  );
  const [heat, setHeat] = useState(() => seedHeatmap(4, 12));

  useEffect(() => {
    const clockId = setInterval(() => setClock(new Date()), 1000);
    const dataId = setInterval(() => {
      setAttendees((a) => a + Math.round(Math.random() * 6));
      setEngagement((e) =>
        clamp(e + Math.round((Math.random() - 0.45) * 6), 40, 99)
      );
      setRsvpRate((r) =>
        clamp(r + Math.round((Math.random() - 0.5) * 2), 50, 92)
      );
      setAlumniOnline((a) =>
        clamp(a + Math.round((Math.random() - 0.4) * 5), 120, 400)
      );

      setHistory((h) => {
        const next = [
          ...h.slice(1),
          {
            t: h[h.length - 1].t + 1,
            engagement: clamp(
              h[h.length - 1].engagement +
                Math.round((Math.random() - 0.5) * 12),
              35,
              98
            ),
          },
        ];
        return next;
      });

      setHeat((g) =>
        g.map((v) => clamp(v + (Math.random() - 0.5) * 0.35, 0.05, 1))
      );

      setFeed((f) => {
        const t =
          FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        const entry = { id: Date.now(), ...t, name, time: new Date() };
        return [entry, ...f].slice(0, 8);
      });
    }, 2600);
    return () => {
      clearInterval(clockId);
      clearInterval(dataId);
    };
  }, []);

  const funnelData = useMemo(
    () => [
      { name: 'Registered', value: 3120, fill: '#4F9DFF' },
      { name: 'Confirmed', value: 2340, fill: '#7CB4FF' },
      { name: 'Checked-in', value: attendees, fill: '#B98CFF' },
    ],
    [attendees]
  );

  const sessionData = [
    { name: 'AI in Alumni Networks', value: 92 },
    { name: "Founders' Roundtable", value: 84 },
    { name: 'Research Showcase', value: 77 },
    { name: 'Career Bridge Talk', value: 63 },
  ];

  const regionData = [
    { name: 'Pune', value: 38 },
    { name: 'Bengaluru', value: 24 },
    { name: 'Mumbai', value: 19 },
    { name: 'Delhi NCR', value: 12 },
    { name: 'Overseas', value: 7 },
  ];

  return (
    <div className="min-h-full w-full bg-[#05070D] text-slate-200 p-4 md:p-6 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .tabular-nums { font-variant-numeric: tabular-nums; }
      `}</style>

      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#4F9DFF] to-[#B98CFF] flex items-center justify-center shadow-[0_0_20px_rgba(79,157,255,0.4)]">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-white tracking-tight leading-none">
              I2IAOC Pulse
            </h1>
            <p className="text-[12px] text-slate-500 leading-tight mt-0.5">
              I2IAOC — live event console
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px]">
            <LiveDot />
            <span className="text-emerald-400 font-medium">Live</span>
          </div>
          <span className="text-[12px] text-slate-500 tabular-nums hidden sm:block">
            {clock.toLocaleTimeString('en-IN', { hour12: false })}
          </span>
        </div>
      </div>

      {/* hero stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Live attendees"
          value={attendees}
          delta={4.2}
          icon={Users}
          accent="#4F9DFF"
        />
        <StatCard
          label="RSVP conversion"
          value={rsvpRate}
          delta={1.1}
          icon={CheckCircle2}
          accent="#34E7B0"
          suffix="%"
        />
        <StatCard
          label="Engagement score"
          value={engagement}
          delta={-0.8}
          icon={Zap}
          accent="#FFB347"
          suffix="%"
        />
        <StatCard
          label="Alumni online"
          value={alumniOnline}
          delta={2.6}
          icon={Globe2}
          accent="#B98CFF"
        />
      </div>

      {/* main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* live feed */}
        <Panel className="lg:col-span-1 p-4 flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-medium text-slate-300">
              Live activity
            </h2>
            <Radio size={14} className="text-slate-500" />
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="flex flex-col gap-2">
              {feed.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 border border-white/[0.05] bg-white/[0.02]"
                  style={{
                    animation: i === 0 ? 'fadeIn 0.5s ease-out' : 'none',
                  }}
                >
                  <item.icon
                    size={14}
                    style={{ color: item.color }}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[12.5px] text-slate-300 leading-snug truncate">
                      {item.text(item.name)}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {item.name} ·{' '}
                      {item.time.toLocaleTimeString('en-IN', { hour12: false })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <style>{`@keyframes fadeIn { from { opacity:0; transform: translateY(-6px);} to {opacity:1; transform:translateY(0);} }`}</style>
        </Panel>

        {/* engagement chart */}
        <Panel className="lg:col-span-2 p-4 h-[360px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[13px] font-medium text-slate-300">
              Engagement over time
            </h2>
            <span className="text-[11px] text-slate-500">last 35 min</span>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={history}
                margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="eng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F9DFF" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#4F9DFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis dataKey="t" hide />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0B0F1A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  labelFormatter={() => ''}
                  formatter={(v) => [`${v}%`, 'Engagement']}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#4F9DFF"
                  strokeWidth={2}
                  fill="url(#eng)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* pulse heatmap */}
        <Panel className="lg:col-span-1 p-4">
          <h2 className="text-[13px] font-medium text-slate-300 mb-3">
            Event pulse
          </h2>
          <Heatmap grid={heat} rows={4} cols={12} />
          <p className="text-[11px] text-slate-600 mt-3">
            Track activity across the last four session slots
          </p>
        </Panel>

        {/* funnel */}
        <Panel className="p-4 h-[260px] flex flex-col">
          <h2 className="text-[13px] font-medium text-slate-300 mb-1">
            RSVP funnel
          </h2>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip
                  contentStyle={{
                    background: '#0B0F1A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(v) => fmt(v)}
                />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList
                    position="right"
                    dataKey="name"
                    fill="#94A3B8"
                    fontSize={11}
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* top sessions */}
        <Panel className="p-4 h-[260px] flex flex-col">
          <h2 className="text-[13px] font-medium text-slate-300 mb-1">
            Top sessions by engagement
          </h2>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sessionData}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{
                    background: '#0B0F1A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                  {sessionData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#B98CFF' : '#3B4258'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* alumni reach */}
      <Panel className="p-4 mt-4 h-[220px] flex flex-col">
        <h2 className="text-[13px] font-medium text-slate-300 mb-1">
          Alumni reach by region
        </h2>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData} margin={{ top: 10, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{
                  background: '#0B0F1A',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                fill="#34E7B0"
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
