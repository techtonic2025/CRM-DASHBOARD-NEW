import { useEffect, useState } from 'react'
import {
  TrendingUp,
  Users,
  Target,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Activity,
  ChevronDown,
  Calendar,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
  AreaChart,
  Area,
} from 'recharts'
import { supabase } from '../lib/supabaseClient'
import type { Cliente, Opportunita, Attivita, MetricaMensile } from '../types'

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
function formatCurrency(n: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

const MESI_SHORT = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const STATO_COLOR: Record<string, string> = {
  lead:     '#6ad2ff',
  prospect: '#fbbf24',
  attivo:   '#B8FF2B', // Neon Green
  perso:    '#f87171',
}

const FASE_COLOR: Record<string, string> = {
  contatto:     '#64748B',
  proposta:     '#818cf8',
  trattativa:   '#b8ff2b',
  chiuso_vinto: '#22c55e',
  chiuso_perso: '#f87171',
}

const FASE_LABEL: Record<string, string> = {
  contatto:     'Contact',
  proposta:     'Proposal',
  trattativa:   'Negotiation',
  chiuso_vinto: 'Won',
  chiuso_perso: 'Lost',
}

const FONTE_COLORS = ['#B8FF2B', '#6ad2ff', '#fbbf24', '#34d399', '#f87171', '#a78bfa']

const TIPO_ATT_COLOR: Record<string, string> = {
  chiamata: '#B8FF2B',
  email:    '#6ad2ff',
  meeting:  '#fbbf24',
  task:     '#34d399',
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────
export function Analytics() {
  const [loading, setLoading] = useState(true)

  // raw data
  const [clienti, setClienti]       = useState<Cliente[]>([])
  const [opportunita, setOpportunita] = useState<Opportunita[]>([])
  const [attivita, setAttivita]     = useState<Attivita[]>([])
  const [metriche, setMetriche]     = useState<MetricaMensile[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [
        { data: c },
        { data: o },
        { data: a },
        { data: m },
      ] = await Promise.all([
        supabase.from('clienti').select('*'),
        supabase.from('opportunita').select('*'),
        supabase.from('attivita').select('*'),
        supabase.from('metriche_mensili').select('*').eq('anno', 2024).order('mese'),
      ])
      setClienti(c ?? [])
      setOpportunita(o ?? [])
      setAttivita(a ?? [])
      setMetriche(m ?? [])
      setLoading(false)
    }
    load()
  }, [])

  // ── Derived metrics ────────────────────────────────────────────────────────

  // KPI
  const totalPipeline = opportunita
    .filter(o => !['chiuso_vinto','chiuso_perso'].includes(o.fase))
    .reduce((s, o) => s + o.valore, 0)

  const totalVinto    = opportunita.filter(o => o.fase === 'chiuso_vinto').reduce((s, o) => s + o.valore, 0)
  const totalOpp      = opportunita.length
  const vinte         = opportunita.filter(o => o.fase === 'chiuso_vinto').length
  const perse         = opportunita.filter(o => o.fase === 'chiuso_perso').length
  const winRate       = totalOpp > 0 ? Math.round((vinte / (vinte + perse || 1)) * 100) : 0
  const avgDeal       = vinte > 0 ? totalVinto / vinte : 0
  const attivitaOpen  = attivita.filter(a => !a.completata).length
  const attivitaDone  = attivita.filter(a => a.completata).length
  const completionRate = attivita.length > 0 ? Math.round((attivitaDone / attivita.length) * 100) : 0

  const kpis = [
    { label: 'Active Pipeline', value: formatCurrency(totalPipeline), sub: `${opportunita.filter(o => !['chiuso_vinto','chiuso_perso'].includes(o.fase)).length} open deals`, icon: TrendingUp, color: '#B8FF2B', up: true,  change: '+12.4%' },
    { label: 'Revenue Won',      value: formatCurrency(totalVinto),    sub: `${vinte} won deals`,        icon: Award,       color: '#22c55e', up: true,  change: '+54.0%' },
    { label: 'Win Rate',         value: `${winRate}%`,                 sub: `Avg deal ${formatCurrency(avgDeal)}`, icon: Target,  color: '#6366f1', up: winRate > 50, change: winRate > 50 ? '+8%' : '-3%' },
    { label: 'Completion',       value: `${completionRate}%`,          sub: `${attivitaOpen} pending tasks`, icon: CheckSquare, color: '#f59e0b', up: completionRate > 60, change: `${attivitaDone}/${attivita.length}` },
  ]

  // Clienti per stato
  const clientiPerStato = ['lead','prospect','attivo','perso'].map(stato => ({
    name:  stato.charAt(0).toUpperCase() + stato.slice(1),
    value: clienti.filter(c => c.stato === stato).length,
    color: STATO_COLOR[stato],
  }))

  // Clienti per fonte
  const fontiRaw = clienti.reduce<Record<string, number>>((acc, c) => {
    const f = c.fonte ?? 'Others'
    acc[f] = (acc[f] ?? 0) + 1
    return acc
  }, {})
  const clientiPerFonte = Object.entries(fontiRaw)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({ name, value, color: FONTE_COLORS[i % FONTE_COLORS.length] }))

  // Opportunità per fase (valore aggregato)
  const oppPerFase = ['contatto','proposta','trattativa','chiuso_vinto','chiuso_perso'].map(fase => ({
    name:  FASE_LABEL[fase],
    count: opportunita.filter(o => o.fase === fase).length,
    valore: opportunita.filter(o => o.fase === fase).reduce((s, o) => s + o.valore, 0),
    color: FASE_COLOR[fase],
  }))

  // Pipeline funnel (solo open)
  const funnelData = ['contatto','proposta','trattativa'].map((fase, i) => ({
    value: opportunita.filter(o => o.fase === fase).reduce((s, o) => s + o.valore, 0),
    name:  FASE_LABEL[fase],
    fill:  ['#64748B','#818cf8','#B8FF2B'][i],
  }))

  // Attività per tipo
  const attPerTipo = ['chiamata','email','meeting','task'].map(tipo => ({
    name:  tipo.charAt(0).toUpperCase() + tipo.slice(1),
    totale: attivita.filter(a => a.tipo === tipo).length,
    completate: attivita.filter(a => a.tipo === tipo && a.completata).length,
    color: TIPO_ATT_COLOR[tipo],
  }))

  // Monthly trend: sales + visitors da metriche_mensili
  const monthlyTrend = MESI_SHORT.slice(1).map((name, i) => {
    const mese = i + 1
    return {
      name,
      sales:    metriche.find(m => m.mese === mese && m.tipo === 'sales')?.valore    ?? 0,
      visitors: metriche.find(m => m.mese === mese && m.tipo === 'visitors')?.valore ?? 0,
    }
  })

  // Top clienti per valore stimato
  const topClienti = [...clienti]
    .sort((a, b) => b.valore_stimato - a.valore_stimato)
    .slice(0, 5)

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Advanced Analytics</h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Detailed performance charts for your CRM strategy.</p>
        </div>
        <div className="bg-[var(--bg-surface)] px-4 py-2 rounded-2xl border border-[var(--bg-border)] flex items-center gap-3 cursor-pointer hover:bg-[var(--bg-hover)] transition">
          <Calendar size={16} className="text-[var(--accent)]" />
          <span className="text-sm font-bold text-[var(--text-primary)]">FY 2024 Report</span>
          <ChevronDown size={14} className="text-[var(--text-secondary)]" />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k, i) => (
          <div key={i} className="bg-[var(--bg-surface)] p-6 rounded-[2rem] border border-[var(--bg-border)] shadow-card flex flex-col gap-4 group hover:border-[var(--accent)]/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--bg-card)] ring-1 ring-white/5 shadow-inner">
                <k.icon size={22} style={{ color: k.color }} />
              </div>
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${k.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {k.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {k.change}
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--text-primary)] leading-none tracking-tight">{loading ? '—' : k.value}</div>
              <p className="text-xs font-bold text-[var(--text-secondary)] mt-2 uppercase tracking-wide">{k.label}</p>
              <p className="text-[10px] font-medium text-[var(--text-secondary)] mt-0.5 opacity-60 italic">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Monthly trend + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Line chart mensile */}
        <div className="lg:col-span-8 bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--bg-border)] shadow-card">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)]">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Monthly Traffic & Sales</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Comparative traffic and revenue over the year.</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                   <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#B8FF2B" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#B8FF2B" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2228" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1A1D21', border: '1px solid #1E2228', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                  labelStyle={{ fontWeight: 800, color: '#B8FF2B', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                  itemStyle={{ fontWeight: 600, fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="top" align="right"
                  wrapperStyle={{ top: -40, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                  formatter={(v) => v === 'sales' ? 'Revenue' : 'Visitors'}
                />
                <Area type="monotone" dataKey="visitors" stroke="#6ad2ff" strokeWidth={2.5} dot={false} fill="transparent" activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="sales"    stroke="#B8FF2B" strokeWidth={3} dot={false} fill="url(#colorSales)" activeDot={{ r: 6, strokeWidth: 2, stroke: '#141619' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline funnel */}
        <div className="lg:col-span-4 bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--bg-border)] shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)]">
              <Target size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Sales Funnel</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Conversion pipeline value.</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v))}
                  contentStyle={{ background: '#1A1D21', border: '1px solid #1E2228', borderRadius: '1rem' }}
                />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="center" fill="#0B0D0F" stroke="none" dataKey="name" style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Clienti stato + Fonte acquisizione */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Clienti per stato */}
        <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--bg-border)] shadow-card">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)]">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Clients by Status</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">{clienti.length} database entries.</p>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientiPerStato} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2228" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ background: '#1A1D21', border: '1px solid #1E2228', borderRadius: '1rem' }}
                />
                <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40} name="Clients">
                  {clientiPerStato.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fonte acquisizione */}
        <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--bg-border)] shadow-card">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)]">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Acquisition Channels</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Leading sources for new clients.</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="h-[220px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={clientiPerFonte} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                    {clientiPerFonte.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1A1D21', border: 'none', borderRadius: '1rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4">
              {clientiPerFonte.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-tight truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1 bg-[var(--bg-card)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 shadow-glow" style={{ width: `${(item.value / clienti.length) * 100}%`, backgroundColor: item.color }} />
                    </div>
                    <span className="text-xs font-black text-[var(--text-primary)] w-4 text-right leading-none">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Opportunità per fase + Attività per tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Opportunità per fase */}
        <div className="lg:col-span-7 bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--bg-border)] shadow-card">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)]">
              <Target size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Pipeline Value by Phase</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Aggregated deal value across the pipeline.</p>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={oppPerFase} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1E2228" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} width={90} />
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v))}
                  contentStyle={{ background: '#1A1D21', border: '1px solid #1E2228', borderRadius: '1rem' }}
                />
                <Bar dataKey="valore" radius={[0, 8, 8, 0]} barSize={22} name="Value">
                  {oppPerFase.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attività per tipo */}
        <div className="lg:col-span-5 bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--bg-border)] shadow-card">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)]">
              <CheckSquare size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Task Productivity</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">{completionRate}% total completion rate.</p>
            </div>
          </div>
          <div className="space-y-5">
            {attPerTipo.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)]">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-tighter">
                    {item.completate} / {item.totale}
                  </span>
                </div>
                <div className="h-1.5 bg-[var(--bg-card)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 shadow-glow"
                    style={{
                      width: item.totale > 0 ? `${(item.completate / item.totale) * 100}%` : '0%',
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--bg-border)] flex items-center gap-5">
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1E2228" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#B8FF2B" strokeWidth="3"
                  strokeDasharray={`${completionRate} ${100 - completionRate}`}
                  strokeLinecap="round"
                  className="shadow-glow"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-[var(--accent)]">
                {completionRate}%
              </span>
            </div>
            <div>
              <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">Productivity Goal</p>
              <p className="text-xs text-[var(--text-secondary)] font-medium">{attivitaDone} activities finished this month.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
