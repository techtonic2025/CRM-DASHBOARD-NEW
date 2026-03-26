import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import type { Cliente, StatoCliente } from '../types'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { toast } from 'react-hot-toast'

export function Clienti() {
  const [clienti, setClienti]   = useState<Cliente[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState<StatoCliente | 'Tutti'>('Tutti')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [page, setPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('clienti')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setClienti(data)
    setLoading(false)
  }

  const filtered = clienti.filter(c => {
    const matchSearch = (c.nome + ' ' + c.cognome + ' ' + (c.azienda || '')).toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Tutti' || c.stato === filter
    return matchSearch && matchFilter
  })

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginatedItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const nuovo = {
      nome: formData.get('nome') as string,
      cognome: formData.get('cognome') as string,
      email: formData.get('email') as string,
      telefono: formData.get('telefono') as string,
      azienda: formData.get('azienda') as string,
      stato: 'lead' as StatoCliente,
      valore_stimato: Number(formData.get('valore')) || 0,
      fonte: 'Direct'
    }

    const { error } = await supabase.from('clienti').insert([nuovo])
    if (error) {
      toast.error('Errore durante il salvataggio')
    } else {
      toast.success('Cliente aggiunto con successo')
      setIsModalOpen(false)
      load()
    }
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Client Directory</h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Manage and track your customer relationships.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--accent)] text-[var(--bg-base)] px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-[var(--accent)]/20 hover:scale-[1.02] transition active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Plus size={18} strokeWidth={3} />
          New Client
        </button>
      </div>

      <div className="bg-[var(--bg-surface)] p-4 rounded-3xl border border-[var(--bg-border)] shadow-card flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, email or company..."
            className="w-full bg-[var(--bg-card)] border border-[var(--bg-border)] rounded-2xl py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/5 transition-all placeholder:text-[var(--text-muted)]"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[var(--bg-card)] border border-[var(--bg-border)] rounded-2xl flex items-center p-1">
            {['Tutti', 'lead', 'prospect', 'attivo'].map((s) => (
              <button
                key={s}
                onClick={() => { setFilter(s as any); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === s
                    ? 'bg-[var(--accent)] text-[var(--bg-base)] shadow-lg'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button className="p-3 bg-[var(--bg-card)] border border-[var(--bg-border)] rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/30 transition shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-[2rem] border border-[var(--bg-border)] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--bg-border)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em]">
                <th className="px-8 py-5">Client Identity</th>
                <th className="px-8 py-5">Company & Contact</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">LTV Value</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--bg-border)]">
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6">
                      <div className="h-10 bg-[var(--bg-card)] rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : paginatedItems.length > 0 ? (
                paginatedItems.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--bg-hover)]/60 transition group cursor-pointer">
                    <td className="px-8 py-5">
                      <Link to={`/clienti/${c.id}`} className="flex items-center gap-4 group/item">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-[var(--bg-card)] flex items-center justify-center border-2 border-[var(--bg-border)] group-hover:border-[var(--accent)] transition-all transform group-hover:scale-110 overflow-hidden relative shadow-inner">
                           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.nome}%20${c.cognome}&backgroundColor=B8FF2B&textColor=0B0D0F&fontWeight=900`} alt="avatar" className="w-full h-full p-0.5" />
                        </div>
                        <div>
                          <p className="font-black text-[var(--text-primary)] text-sm group-hover/item:text-[var(--accent)] transition-colors leading-tight">
                            {c.nome} {c.cognome}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium flex items-center gap-1.5">
                            <Mail size={12} className="opacity-60" /> {c.email}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-8 py-5 text-sm text-[var(--text-secondary)] font-bold">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 group-hover:text-[var(--text-primary)] transition">
                          <Building2 size={14} className="text-[var(--accent)]" /> {c.azienda || 'Freelance'}
                        </span>
                        <span className="flex items-center gap-2 text-[10px] font-medium opacity-70">
                          <Phone size={12} /> {c.telefono || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <Badge value={c.stato} />
                    </td>
                    <td className="px-8 py-5 text-right font-black text-sm text-[var(--text-primary)]">
                       {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(c.valore_stimato)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/clienti/${c.id}`}
                          className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--bg-border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition shadow-sm"
                        >
                          <ExternalLink size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Filter size={48} className="text-[var(--text-secondary)]" />
                    <p className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-sm">No clients found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
