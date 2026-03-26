import { StatoCliente, FaseOpportunita } from '../types'

type BadgeProps = {
  value: StatoCliente | FaseOpportunita
}

const colori: Record<string, string> = {
  lead:          'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  prospect:      'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  attivo:        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  perso:         'bg-red-500/15 text-red-400 border border-red-500/20',
  contatto:      'bg-slate-500/15 text-slate-400 border border-slate-500/20',
  proposta:      'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
  trattativa:    'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  chiuso_vinto:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  chiuso_perso:  'bg-rose-500/15 text-rose-400 border border-rose-500/20',
}

const etichette: Record<string, string> = {
  lead: 'Lead', prospect: 'Prospect', attivo: 'Attivo', perso: 'Perso',
  contatto: 'Contatto', proposta: 'Proposta', trattativa: 'Trattativa',
  chiuso_vinto: 'Vinto ✅', chiuso_perso: 'Perso ❌',
}

export function Badge({ value }: BadgeProps) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colori[value] ?? ''}`}>
      {etichette[value] ?? value}
    </span>
  )
}
