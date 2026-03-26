import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  Target,
  FileText,
  Clock,
  ExternalLink,
  ChevronDown,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import type { Cliente, Opportunita, Attivita } from '../types'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { toast } from 'react-hot-toast'

export function DettaglioCliente() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [cliente, setCliente]           = useState<Cliente | null>(null)
  const [opportunita, setOpportunita]   = useState<Opportunita[]>([])
  const [attivita, setAttivita]         = useState<Attivita[]>([])
  const [loading, setLoading]           = useState(true)

  const [isEditModalOpen, setEditModalOpen]       = useState(false)
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [isOppModalOpen, setOppModalOpen]         = useState(false)
  const [isAttModalOpen, setAttModalOpen]         = useState(false)

  useEffect(() => {
    if (id) load()
  }, [id])

  async function load() {
    setLoading(true)
    const [
      { data: c },
      { data: o },
      { data: a }
    ] = await Promise.all([
      supabase.from('clienti').select('*').eq('id', id).single(),
      supabase.from('opportunita').select('*').eq('cliente_id', id).order('created_at', { ascending: false }),
      supabase.from('attivita').select('*').eq('cliente_id', id).order('data_scadenza', { ascending: false }),
    ])

    if (c) setCliente(c)
    if (o) setOpportunita(o)
    if (a) setAttivita(a)
    setLoading(false)
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!cliente) return
    const formData = new FormData(e.currentTarget)
    const update = {
      nome: formData.get('nome') as string,
      cognome: formData.get('cognome') as string,
      email: formData.get('email') as string,
      telefono: formData.get('telefono') as string,
      azienda: formData.get('azienda') as string,
      valore_stimato: Number(formData.get('valore')) || 0,
    }
    const { error } = await supabase.from('clienti').update(update).eq('id', id)
    if (!error) {
      toast.success('Profile Updated', { icon: '✨' })
      setEditModalOpen(false)
      load()
    }
  }

  async function handleDelete() {
    const { error } = await supabase.from('clienti').delete().eq('id', id)
    if (!error) {
      toast.success('Account Deleted')
      navigate('/clienti')
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
      <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">Fetching Database...</p>
    </div>
  )

  if (!cliente) return (
    <div className="text-center py-40 space-y-4">
      <div className="w-20 h-20 bg-red-500/10 text-red-400 rounded-3xl mx-auto flex items-center justify-center border border-red-500/20">
        <AlertCircle size={40} />
      </div>
      <p className="text-xl font-bold text-[var(--text-primary)]">Client not found</p>
      <button onClick={() => navigate('/clienti')} className="text-[var(--accent)] font-bold text-sm tracking-tight flex items-center gap-2 mx-auto hover:underline">
        <ArrowLeft size={16} /> Back to Directory
      </button>
    </div>
  )

  return (
    <div className="space-y-8 animate-in max-w-7xl mx-auto">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/clienti')}
        className="group flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all font-bold text-xs uppercase tracking-widest"
      >
        <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)]/10 transition-all shadow-sm">
          <ArrowLeft size={16} />
        </div>
        Back to Clients
      </button>

      {/* Profile Header Card */}
      <div className="relative bg-[var(--bg-surface)] rounded-[3rem] border border-[var(--bg-border)] shadow-card overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--accent)]/5"></div>
        <div className="relative p-10 mt-6 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="w-40 h-40 rounded-[2.5rem] bg-[var(--bg-base)] border-4 border-[var(--bg-surface)] shadow-2xl overflow-hidden relative group">
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${cliente.nome}%20${cliente.cognome}&backgroundColor=B8FF2B&textColor=0B0D0F&fontWeight=900`} alt="avatar" className="w-full h-full p-1" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Edit2 size={24} className="text-white" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight leading-none truncate">
                  {cliente.nome} {cliente.cognome}
                </h1>
                <Badge value={cliente.stato} />
              </div>
              <p className="text-lg font-bold text-[var(--text-secondary)] opacity-80 flex items-center justify-center md:justify-start gap-2">
                <Building2 size={18} className="text-[var(--accent)]" /> {cliente.azienda || 'Freelance Professional'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditModalOpen(true)}
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--bg-border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition shadow-sm"
            >
              <Edit2 size={20} />
            </button>
            <button
               onClick={() => setConfirmDeleteOpen(true)}
               className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--bg-border)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400/30 transition shadow-sm"
            >
              <Trash2 size={20} />
            </button>
            <button className="bg-[var(--accent)] text-[var(--bg-base)] px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[var(--accent)]/20 hover:scale-[1.02] transition active:scale-[0.98]">
               Export Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-2">
        {/* Left Side: Contact Info & Stats */}
        <div className="lg:col-span-4 space-y-8">

          {/* Contact Information Card */}
          <div className="bg-[var(--bg-surface)] p-8 rounded-[2.5rem] border border-[var(--bg-border)] shadow-card">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-8 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span> Contact Details
             </h3>
             <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)] shrink-0 border border-white/5">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-0.5">Primary Email</p>
                    <p className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent)] cursor-pointer transition">{cliente.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)] shrink-0 border border-white/5">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-0.5">Mobile Phone</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{cliente.telefono || 'Not available'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)] shrink-0 border border-white/5">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-0.5">Added Date</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                       {new Date(cliente.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
             </div>
          </div>

          {/* Quick Metrics Card */}
          <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--bg-border)] shadow-inner relative overflow-hidden group">
             <div className="relative z-10 flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Project Value</h3>
               <TrendingUp size={16} className="text-[var(--accent)]" />
             </div>
             <p className="text-4xl font-black text-[var(--text-primary)] relative z-10 mb-2">
                {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cliente.valore_stimato)}
             </p>
             <p className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 inline-block px-2 py-0.5 rounded-lg uppercase tracking-tight relative z-10">
                Top Client Priority
             </p>
             {/* Glow decor */}
             <div className="absolute top-1/2 right-0 w-32 h-32 bg-[var(--accent)]/10 blur-[60px] rounded-full group-hover:bg-[var(--accent)]/20 transition-all duration-500"></div>
          </div>

        </div>

        {/* Right Side: Opportunities & Activity */}
        <div className="lg:col-span-8 space-y-8">

          {/* Opportunities Section */}
          <div className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--bg-border)] shadow-card overflow-hidden">
            <div className="p-8 border-b border-[var(--bg-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)]">
                   <Target size={20} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Active Opportunities</h3>
              </div>
              <button
                onClick={() => setOppModalOpen(true)}
                className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--bg-border)] text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all"
              >
                <Plus size={18} strokeWidth={3} />
              </button>
            </div>
            <div className="divide-y divide-[var(--bg-border)]">
              {opportunita.length > 0 ? (
                opportunita.map(o => (
                  <div key={o.id} className="p-6 flex items-center justify-between hover:bg-[var(--bg-hover)]/40 transition group">
                    <div className="flex items-center gap-5">
                       <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)]/60 flex items-center justify-center text-[var(--text-secondary)] border border-white/5 font-black text-xs">
                         <FileText size={18} className="opacity-60" />
                       </div>
                       <div>
                         <h4 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">{o.titolo}</h4>
                         <div className="flex items-center gap-2 mt-1">
                           <Badge value={o.fase} />
                           <span className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1 uppercase tracking-tight">
                              <Calendar size={10} /> Created {new Date(o.created_at).toLocaleDateString()}
                           </span>
                         </div>
                       </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                       <span className="text-lg font-black text-[var(--text-primary)] tracking-tight">
                         {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(o.valore)}
                       </span>
                       <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                         <MoreHorizontal size={14} />
                       </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-12 text-center text-[var(--text-secondary)] opacity-40 font-black uppercase text-[10px] tracking-widest">No active deals yet</p>
              )}
            </div>
          </div>

          {/* Activity Logs Timeline */}
          <div className="bg-[var(--bg-surface)] p-8 rounded-[2.5rem] border border-[var(--bg-border)] shadow-card">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)]">
                   <Clock size={20} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Interaction Timeline</h3>
              </div>
              <button
                onClick={() => setAttModalOpen(true)}
                className="text-xs font-black uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-4 py-2 rounded-xl border border-[var(--accent)]/10 hover:bg-[var(--accent)]/20 transition"
              >
                Log Note
              </button>
            </div>
            <div className="relative space-y-8 pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--bg-border)]">
              {attivita.length > 0 ? (
                attivita.map(a => (
                  <div key={a.id} className="relative">
                     <span className={`absolute -left-[30px] top-1.5 w-[22px] h-[22px] rounded-md ring-4 ring-[var(--bg-surface)] flex items-center justify-center ${a.completata ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[var(--bg-card)] border border-[var(--bg-border)]'}`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${a.completata ? 'bg-white' : 'bg-[var(--accent)]'}`}></div>
                     </span>
                     <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase font-black tracking-tighter text-[var(--text-secondary)] bg-[var(--bg-card)] px-2 py-0.5 rounded-lg border border-white/5">{a.tipo}</span>
                            <span className="text-xs font-bold text-[var(--text-primary)]">{a.titolo}</span>
                          </div>
                          <p className="text-[10px] font-bold text-[var(--text-muted)] mt-2 italic flex items-center gap-1">
                             <Calendar size={10} /> {a.scadenza ? new Date(a.scadenza).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </p>
                        </div>
                        {a.completata && (
                           <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">COMPLETED</span>
                        )}
                     </div>
                  </div>
                ))
              ) : (
                <p className="py-2 text-xs font-bold text-[var(--text-muted)] italic">No historical data available for this client.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <Modal title="Advanced Account Setup" onClose={() => setEditModalOpen(false)}>
           <form onSubmit={handleUpdate} className="space-y-5 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">First Name</label>
                  <input name="nome" defaultValue={cliente?.nome} className="w-full bg-[var(--bg-base)] border border-[var(--bg-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--accent)] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Last Name</label>
                  <input name="cognome" defaultValue={cliente?.cognome} className="w-full bg-[var(--bg-base)] border border-[var(--bg-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--accent)] outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Corporate Email</label>
                <input name="email" defaultValue={cliente?.email} className="w-full bg-[var(--bg-base)] border border-[var(--bg-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--accent)] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Company</label>
                  <input name="azienda" defaultValue={cliente?.azienda || ''} className="w-full bg-[var(--bg-base)] border border-[var(--bg-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--accent)] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">LTV Forecast (€)</label>
                  <input name="valore" type="number" defaultValue={cliente?.valore_stimato} className="w-full bg-[var(--bg-base)] border border-[var(--bg-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--accent)] outline-none" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-[var(--bg-border)] text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-base)] text-sm font-black shadow-lg shadow-[var(--accent)]/10 hover:shadow-[var(--accent)]/20 transition"
                >
                  Apply Changes
                </button>
              </div>
           </form>
        </Modal>
      )}

      {/* Modals for Opp and Att (Design Stubs for logic preservation) */}
      {isOppModalOpen && (
        <Modal title="Create Opportunity" onClose={() => setOppModalOpen(false)}>
           <div className="py-8 text-center opacity-40 italic text-sm">Opportunity logic integration...</div>
        </Modal>
      )}
      {isAttModalOpen && (
        <Modal title="Log Activity" onClose={() => setAttModalOpen(false)}>
           <div className="py-8 text-center opacity-40 italic text-sm">Activity logic integration...</div>
        </Modal>
      )}

      {/* Confirm Delete */}
      {isConfirmDeleteOpen && (
        <ConfirmDialog
          message={`Are you sure you want to terminate account ${cliente?.nome} ${cliente?.cognome}? All associated data in the pipeline will be erased.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteOpen(false)}
        />
      )}
    </div>
  )
}
