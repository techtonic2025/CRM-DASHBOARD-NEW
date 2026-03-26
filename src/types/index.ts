export type StatoCliente = 'lead' | 'prospect' | 'attivo' | 'perso'
export type TipoNota = 'chiamata' | 'email' | 'meeting' | 'altro'
export type TipoAttivita = 'chiamata' | 'email' | 'meeting' | 'task'
export type FaseOpportunita =
  | 'contatto'
  | 'proposta'
  | 'trattativa'
  | 'chiuso_vinto'
  | 'chiuso_perso'

export interface Cliente {
  id: string
  nome: string
  cognome: string
  azienda?: string
  email?: string
  telefono?: string
  stato: StatoCliente
  valore_stimato: number
  fonte?: string
  created_at: string
}

export interface Nota {
  id: string
  cliente_id: string
  testo: string
  tipo: TipoNota
  created_at: string
}

export interface Opportunita {
  id: string
  cliente_id: string
  titolo: string
  valore: number
  fase: FaseOpportunita
  probabilita: number
  data_chiusura?: string
  created_at: string
}

export interface Attivita {
  id: string
  cliente_id: string
  opportunita_id?: string
  tipo: TipoAttivita
  titolo: string
  completata: boolean
  scadenza?: string
  created_at: string
  clienti?: { nome: string; cognome: string }
}

export type StatoProdotto = 'preparazione' | 'attivo' | 'sospeso'
export type CategoriaProdotto = 'servizio' | 'software' | 'consulenza' | 'formazione'
export type CanaleVendita = 'affiliate' | 'direct_buy' | 'brand_ambassador' | 'adsense'
export type TipoMetrica = 'product_insights' | 'visitors' | 'sales'
export type TipoProgramma = 'affiliate' | 'direct_buy' | 'brand_ambassador' | 'adsense'

export interface Prodotto {
  id: string
  nome: string
  descrizione?: string
  categoria: CategoriaProdotto
  stato: StatoProdotto
  prezzo: number
  created_at: string
}

export interface Vendita {
  id: string
  cliente_id?: string
  prodotto_id?: string
  importo: number
  canale: CanaleVendita
  data_vendita: string
  created_at: string
  clienti?: { nome: string; cognome: string }
  prodotti?: { nome: string }
}

export interface MetricaMensile {
  id: string
  anno: number
  mese: number
  tipo: TipoMetrica
  valore: number
  created_at: string
}

export interface ProgrammaMarketing {
  id: string
  nome: string
  tipo: TipoProgramma
  budget: number
  prodotti_venduti: number
  stato: string
  data_inizio?: string
  data_fine?: string
  created_at: string
}
