import { useEffect, useState } from 'react'
import {
  Users,
  TrendingUp,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  BarChart3,
  PieChart as PieIcon,
  ChevronDown,
  Package,
  ShoppingCart,
  Megaphone,
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
  AreaChart,
  Area,
} from 'recharts'
import { supabase } from '../lib/supabaseClient'
import type {
  Prodotto,
  Vendita,
  MetricaMensile,
  ProgrammaMarketing,
  TipoMetrica,
} from '../types'

type TabKey = 'insights' | 'preparation' | 'service' | 'composition' | 'marketing'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'insights',    label: 'Product Insights' },
  { key: 'preparation', label: 'Products Preparation' },
  { key: 'service',     label: 'Sales Service' },
  { key: 'composition', label: 'Sales Composition' },
  { key: 'marketing',   label: 'Product Marketing Programs' },
]

const MESI = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CANALE_COLORS: Record<string, string> = {
  affiliate:       '#B8FF2B', // Neon Green
  direct_buy:      '#6ad2ff',
  brand_ambassador:'#1E2228',
  adsense:         '#334155',
}

const CANALE_LABEL: Record<string, string> = {
  affiliate:        'Affiliate Program',
  direct_buy:       'Direct Buy',
  brand_ambassador: 'Brand Ambassador',
  adsense:          'Adsense',
}

const STATO_PRODOTTO_COLORS: Record<string, string> = {
  attivo:       'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  preparazione: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  sospeso:      'bg-slate-500/10 text-slate-400 border border-slate-500/20',
}

const STATO_PROG_COLORS: Record<string, string> = {
  attivo:     'bg-emerald-500/10 text-emerald-400',
  sospeso:    'bg-red-500/10 text-red-400',
  completato: 'bg-blue-500/10 text-blue-400',
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function pctChange(curr: number, prev: number): { label: string; up: boolean } {
  if (!prev) return { label: '—', up: true }
  const pct = ((curr - prev) / prev) * 100
  return { label: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`, up: pct >= 0 }
}

export function Dashboard() {
  const [activeTab, setActiveTab]     = useState<TabKey>('insights')
  const [barMetric, setBarMetric]     = useState<TipoMetrica>('sales')
  const [loading, setLoading]         = useState(true)

  // data
  const [prodottiAttivi, setProdottiAttivi]   = useState(0)
  const [visitorsKpi, setVisitorsKpi]         = useState({ curr: 0, prev: 0 })
  const [salesKpi, setSalesKpi]               = useState({ curr: 0, prev: 0 })
  const [metriche, setMetriche]               = useState<MetricaMensile[]>([])
  const [programmi, setProgrammi]             = useState<ProgrammaMarketing[]>([])
  const [prodotti, setProdotti]               = useState<Prodotto[]>([])
  const [vendite, setVendite]                 = useState<Vendita[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [
        { count: attivi },
        { data: metricheData },
        { data: programmiData },
        { data: prodottiData },
        { data: venditeData },
      ] = await Promise.all([
        supabase.from('prodotti').select('*', { count: 'exact', head: true }).eq('stato', 'attivo'),
        supabase.from('metriche_mensili').select('*').eq('anno', 2024).order('mese'),
        supabase.from('programmi_marketing').select('*').order('prodotti_venduti', { ascending: false }),
        supabase.from('prodotti').select('*').order('created_at', { ascending: false }),
        supabase.from('vendite').select('*, clienti(nome, cognome), prodotti(nome)').order('data_vendita', { ascending: false }),
      ])

      setProdottiAttivi(attivi ?? 0)
      setMetriche(metricheData ?? [])
      setProgrammi(programmiData ?? [])
      setProdotti(prodottiData ?? [])
      setVendite(venditeData ?? [])

      // KPI visitors: June vs May
      const vis = (metricheData ?? []).filter(m => m.tipo === 'visitors')
      const visJun = vis.find(m => m.mese === 6)?.valore ?? 0
      const visMay = vis.find(m => m.mese === 5)?.valore ?? 0
      setVisitorsKpi({ curr: visJun, prev: visMay })

      // KPI sales count: June vs May
      const sal = (metricheData ?? []).filter(m => m.tipo === 'sales')
      const salJun = sal.find(m => m.mese === 6)?.valore ?? 0
      const salMay = sal.find(m => m.mese === 5)?.valore ?? 0
      setSalesKpi({ curr: salJun, prev: salMay })

      setLoading(false)
    }
    load()
  }, [])

  // Bar chart data
  const barData = metriche
    .filter(m => m.tipo === barMetric)
    .map(m => ({ name: MESI[m.mese], value: m.valore, mese: m.mese }))

  // Pie chart data
  const totalProdottiVenduti = programmi.reduce((s, p) => s + p.prodotti_venduti, 0)
  const pieData = programmi.map(p => ({
    name:  CANALE_LABEL[p.tipo] ?? p.tipo,
    value: totalProdottiVenduti > 0 ? Math.round((p.prodotti_venduti / totalProdottiVenduti) * 100) : 0,
    count: p.prodotti_venduti,
    color: CANALE_COLORS[p.tipo] ?? '#1E2228',
  }))

  const visChange  = pctChange(visitorsKpi.curr, visitorsKpi.prev)
  const salChange  = pctChange(salesKpi.curr, salesKpi.prev)
  const kpis = [
    {
      label: 'Products',
      value: loading ? '—' : prodottiAttivi.toString(),
      change: '-2.33%', up: false,
      icon: BarChart3,
    },
    {
      label: 'Visitors',
      value: loading ? '—' : visitorsKpi.curr.toLocaleString(),
      change: visChange.label, up: visChange.up,
      icon: Users,
    },
    {
      label: 'Sales',
      value: loading ? '—' : salesKpi.curr.toString(),
      change: salChange.label, up: salChange.up,
      icon: Target,
    },
  ]

  // Current month index for bar highlight (June = mese 6)
  const currentMese = 6
  const highlightIndex = barData.findIndex(d => d.mese === currentMese)

  return (
    <div className="space-y-8 animate-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Dashboard Overview</h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Monitoring your CRM performance and marketing trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--bg-surface)] px-4 py-2.5 rounded-2xl border border-[var(--bg-border)] shadow-sm cursor-pointer hover:bg-[var(--bg-hover)] transition group">
            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Periode:</span>
            <span className="text-sm font-bold text-[var(--text-primary)]">June, 2024</span>
            <ChevronDown size={14} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition" />
          </div>
          <button className="bg-[var(--accent)] text-[var(--bg-base)] px-6 py-2.5 rounded-2xl font-black text-sm shadow-xl shadow-[var(--accent)]/20 hover:scale-[1.02] transition active:scale-[0.98] flex items-center gap-2">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-[var(--bg-border)] pb-2 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-sm font-bold whitespace-nowrap pb-2 outline-none transition-all relative ${
              activeTab === tab.key
                ? 'text-[var(--accent)] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[3px] after:bg-[var(--accent)] after:rounded-full after:shadow-[0_0_8px_var(--accent-glow)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'insights' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((item, i) => (
              <div key={i} className="bg-[var(--bg-surface)] p-6 rounded-[2rem] border border-[var(--bg-border)] shadow-card flex flex-col justify-between group hover:border-[var(--accent)]/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)] transition-colors">
                    <item.icon size={24} />
                  </div>
                  <div className={`flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${item.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {item.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {item.change}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-[var(--text-primary)] mb-1 leading-none tracking-tight">{item.value}</div>
                  <p className="text-sm font-bold text-[var(--text-secondary)]">{item.label}</p>
                </div>
              </div>
            ))}
            <div className="bg-[var(--accent)] p-6 rounded-[2rem] text-[var(--bg-base)] relative overflow-hidden shadow-glow group cursor-pointer">
              <div className="relative z-10">
                <div className="bg-[var(--bg-base)] text-[var(--accent)] px-3 py-1.5 rounded-full text-[10px] font-black inline-block mb-6 uppercase tracking-widest border border-[var(--bg-base)]">Great Results</div>
                <p className="text-sm font-bold leading-relaxed mb-6">
                  Your monthly sales target is <span className="underline decoration-2 font-black">reached</span> with a conversion increase of <span className="font-black underline decoration-2">54%</span>.
                </p>
                <button className="bg-[var(--bg-base)]/10 hover:bg-[var(--bg-base)]/20 transition px-6 py-2.5 rounded-2xl text-xs font-black w-full border border-[var(--bg-base)]/20">
                  Detailed Stats
                </button>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-[var(--bg-base)]/10 rounded-full blur-2xl"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12 xl:col-span-8 bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--bg-border)] shadow-card">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)]">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Sales Trends</h3>
                </div>
                <select
                  value={barMetric}
                  onChange={e => setBarMetric(e.target.value as TipoMetrica)}
                  className="bg-[var(--bg-card)] border border-[var(--bg-border)] text-[var(--text-secondary)] text-xs font-bold px-4 py-2 rounded-xl cursor-pointer outline-none hover:bg-[var(--bg-hover)] transition appearance-none min-w-[160px]"
                >
                  <option value="sales">Product Sales</option>
                  <option value="visitors">Visitors</option>
                  <option value="product_insights">Insights</option>
                </select>
              </div>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B8FF2B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#B8FF2B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2228" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[var(--bg-card)] border border-[var(--bg-border)] p-3 rounded-xl shadow-2xl">
                              <p className="text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] mb-1">{payload[0].payload.name}</p>
                              <p className="text-lg font-black text-[var(--accent)]">{payload[0].value.toLocaleString()}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#B8FF2B" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="lg:col-span-12 xl:col-span-4 bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--bg-border)] shadow-card">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Monthly Sales</h3>
                <div className="bg-[var(--bg-card)] px-3 py-1.5 rounded-xl text-[10px] font-black text-[var(--text-secondary)] border border-[var(--bg-border)] uppercase tracking-widest">Year: 2024</div>
              </div>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2228" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} hide />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[var(--accent)] text-[var(--bg-base)] px-3 py-1.5 rounded-xl shadow-glow font-black text-xs leading-none">
                              {payload[0].value}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={12}>
                      {barData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === highlightIndex ? '#B8FF2B' : '#ffffff'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
