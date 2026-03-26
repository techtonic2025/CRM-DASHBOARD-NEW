export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clienti: {
        Row: {
          id: string
          nome: string
          email: string | null
          telefono: string | null
          azienda: string | null
          stato: 'lead' | 'cliente' | 'inattivo'
          valore_stimato: number | null
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          email?: string | null
          telefono?: string | null
          azienda?: string | null
          stato?: 'lead' | 'cliente' | 'inattivo'
          valore_stimato?: number | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string | null
          telefono?: string | null
          azienda?: string | null
          stato?: 'lead' | 'cliente' | 'inattivo'
          valore_stimato?: number | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pipeline: {
        Row: {
          id: string
          cliente_id: string
          titolo: string
          fase: 'contatto' | 'qualifica' | 'proposta' | 'negoziazione' | 'chiuso-vinto' | 'chiuso-perso'
          valore: number | null
          probabilita: number | null
          data_chiusura_prevista: string | null
          note: string | null
          ordine: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          titolo: string
          fase?: 'contatto' | 'qualifica' | 'proposta' | 'negoziazione' | 'chiuso-vinto' | 'chiuso-perso'
          valore?: number | null
          probabilita?: number | null
          data_chiusura_prevista?: string | null
          note?: string | null
          ordine?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          titolo?: string
          fase?: 'contatto' | 'qualifica' | 'proposta' | 'negoziazione' | 'chiuso-vinto' | 'chiuso-perso'
          valore?: number | null
          probabilita?: number | null
          data_chiusura_prevista?: string | null
          note?: string | null
          ordine?: number
          created_at?: string
          updated_at?: string
        }
      }
      attivita: {
        Row: {
          id: string
          cliente_id: string | null
          pipeline_id: string | null
          tipo: 'chiamata' | 'email' | 'incontro' | 'task'
          titolo: string
          descrizione: string | null
          data_scadenza: string | null
          completata: boolean
          priorita: 'bassa' | 'media' | 'alta'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_id?: string | null
          pipeline_id?: string | null
          tipo: 'chiamata' | 'email' | 'incontro' | 'task'
          titolo: string
          descrizione?: string | null
          data_scadenza?: string | null
          completata?: boolean
          priorita?: 'bassa' | 'media' | 'alta'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string | null
          pipeline_id?: string | null
          tipo?: 'chiamata' | 'email' | 'incontro' | 'task'
          titolo?: string
          descrizione?: string | null
          data_scadenza?: string | null
          completata?: boolean
          priorita?: 'bassa' | 'media' | 'alta'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
