import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  MoreHorizontal,
  DollarSign,
  Building2,
  TrendingUp,
  Target,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import type { Opportunita, FaseOpportunita } from '../types'
import { toast } from 'react-hot-toast'

const FASI: { id: FaseOpportunita; label: string; color: string }[] = [
  { id: 'contatto',     label: 'Contact',    color: '#64748B' },
  { id: 'proposta',     label: 'Proposal',   color: '#818cf8' },
  { id: 'trattativa',   label: 'Negotiation', color: '#B8FF2B' },
  { id: 'chiuso_vinto', label: 'Won',        color: '#22c55e' },
  { id: 'chiuso_perso', label: 'Lost',       color: '#f87171' },
]

function SortableItem({ id, item }: { id: string; item: Opportunita }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--bg-border)] shadow-sm hover:border-[var(--accent)]/30 hover:shadow-glow transition-all duration-300 cursor-grab active:cursor-grabbing mb-4 ${
        isDragging ? 'ring-2 ring-[var(--accent)] shadow-2xl scale-[1.02] z-50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-black text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight">
          {item.titolo}
        </h4>
        <button className="p-1.5 opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition rounded-lg">
          <MoreHorizontal size={14} />
        </button>
      </div>
      <div className="flex items-center gap-2 mb-4 text-[11px] font-bold text-[var(--text-secondary)]">
        <Building2 size={12} className="text-[var(--accent)]" />
        <span className="truncate">{item.clienti?.azienda || 'No Company'}</span>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] mb-0.5">Value</span>
          <span className="text-sm font-black text-[var(--text-primary)]">
            {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(item.valore)}
          </span>
        </div>
      </div>
    </div>
  )
}

function PipelineColumn({ fase, items }: { fase: typeof FASI[0]; items: Opportunita[] }) {
  const totalValore = items.reduce((s, i) => s + i.valore, 0)

  return (
    <div className="flex flex-col w-[320px] min-w-[320px] bg-[var(--bg-surface)]/40 rounded-[2.5rem] p-3 border border-[var(--bg-border)] shadow-inner">
      <div className="flex items-center justify-between px-5 pt-5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: fase.color }}></div>
          <h3 className="font-black text-[var(--text-primary)] text-sm tracking-tight uppercase flex items-center gap-2">
            {fase.label}
            <span className="bg-[var(--bg-card)] border border-[var(--bg-border)] text-[var(--accent)] text-[10px] px-2 py-0.5 rounded-full font-black">
              {items.length}
            </span>
          </h3>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 min-h-[400px] no-scrollbar">
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map(item => (
            <SortableItem key={item.id} id={item.id} item={item} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

export function Pipeline() {
  const [items, setItems] = useState<Opportunita[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('opportunita')
      .select('*, clienti(nome, azienda)')
    if (data) setItems(data)
    setLoading(false)
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragOver = async (event: any) => {
    const { active, over } = event
    if (!over) return
    const activeItem = items.find(i => i.id === active.id)
    if (!activeItem) return
    const overId = over.id
    const overItem = items.find(i => i.id === overId)
    let newFase: FaseOpportunita | null = null
    if (FASI.some(f => f.id === overId)) {
      newFase = overId as FaseOpportunita
    } else if (overItem && overItem.fase !== activeItem.fase) {
      newFase = overItem.fase
    }
    if (newFase && newFase !== activeItem.fase) {
      const updated = items.map(i => i.id === active.id ? { ...i, fase: newFase! } : i)
      setItems(updated)
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const activeItem = items.find(i => i.id === active.id)
    if (!activeItem) return
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)
      setItems(prev => arrayMove(prev, oldIndex, newIndex))
    }
    await supabase.from('opportunita').update({ fase: activeItem.fase }).eq('id', active.id)
    toast.success('Opportunity phase updated', { icon: '🚀' })
  }

  return (
    <div className="space-y-8 h-full animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Sales Pipeline</h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium italic">Track your opportunities through every stage of the funnel.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-[var(--accent)] text-[var(--bg-base)] px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-[var(--accent)]/20 hover:scale-[1.02] transition active:scale-[0.98] flex items-center gap-2">
            <Plus size={18} strokeWidth={3} />
            New Deal
          </button>
        </div>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-8 pt-2 no-scrollbar scroll-smooth">
        {loading ? (
          <div className="flex gap-6">
            {FASI.map((_, i) => (
              <div key={i} className="w-[320px] h-[600px] bg-[var(--bg-card)]/50 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {FASI.map(fase => (
              <PipelineColumn
                key={fase.id}
                fase={fase}
                items={items.filter(i => i.fase === fase.id)}
              />
            ))}
            <DragOverlay>
              {activeId ? (
                <div className="bg-[var(--bg-card)] p-5 rounded-2xl border-2 border-[var(--accent)] shadow-glow scale-[1.05]">
                   <h4 className="font-black text-sm text-[var(--text-primary)]">Dragging Deal</h4>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  )
}
