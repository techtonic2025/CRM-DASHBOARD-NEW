import { useEffect, useState } from 'react'
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Activity,
  ListTodo,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import type { Attivita } from '../types'
import { toast } from 'react-hot-toast'

export function AttivitaPage() {
  const [attivita, setAttivita] = useState<Attivita[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter] = useState<'Tutte' | 'Pendente' | 'Completata'>('Tutte')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('attivita')
      .select('*, clienti(nome, cognome)')
      .order('scadenza', { ascending: true })
    if (data) setAttivita(data)
    setLoading(false)
  }

  async function toggleComplete(id: string, current: boolean) {
    const { error } = await supabase.from('attivita').update({ completata: !current }).eq('id', id)
    if (!error) {
      setAttivita(prev => prev.map(a => a.id === id ? { ...a, completata: !current } : a))
      toast.success(current ? 'Re-opened' : 'Completed')
    }
  }

  const filtered = attivita.filter(a => {
    if (filter === 'Pendente') return !a.completata
    if (filter === 'Completata') return a.completata
    return true
  })

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Active Tasks</h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Keep track of your appointments and daily duties.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="bg-[var(--accent)] text-[var(--bg-base)] px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-[var(--accent)]/20 hover:scale-[1.02] transition active:scale-[0.98] flex items-center gap-2"
          >
            <Plus size={18} strokeWidth={3} />
            Quick Task
          </button>
        </div>
      </div>
      <div className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--bg-border)] shadow-card overflow-hidden">
        <div className="p-8 border-b border-[var(--bg-border)] flex items-center gap-3">
          <Activity size={20} className="text-[var(--accent)]" />
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Productivity Feed</h3>
        </div>
        <div className="divide-y divide-[var(--bg-border)]">
          {loading ? (
            <div className="p-6">Loading...</div>
          ) : filtered.length > 0 ? (
            filtered.map((a) => (
              <div key={a.id} className="p-6 flex items-center gap-6">
                <button onClick={() => toggleComplete(a.id, a.completata)}>
                   <CheckCircle2 size={18} className={a.completata ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'} />
                </button>
                <div className="flex-1">
                   <h4 className="text-sm font-black">{a.titolo}</h4>
                </div>
              </div>
            ))
          ) : (
            <div className="p-24 text-center opacity-30">
               <ListTodo size={64} />
               <p className="mt-6">Zero activities on target</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
