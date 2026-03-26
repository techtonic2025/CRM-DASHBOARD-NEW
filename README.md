# Mini CRM Dashboard

Dashboard completo per la gestione di un mini CRM con React, TypeScript, Tailwind CSS e Supabase.

## Caratteristiche

- **Overview**: Dashboard con statistiche generali
- **Analytics**: Grafici e analisi dei dati
- **Clienti**: Gestione completa dei clienti
- **Pipeline**: Gestione della pipeline di vendita con drag & drop
- **Attivita**: Gestione delle attivita e task

## Stack Tecnologico

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase
- React Router v6
- Recharts (grafici)
- dnd-kit (drag & drop)
- Lucide React (icone)
- React Hot Toast (notifiche)

## Setup Iniziale

### 1. Installazione Dipendenze

Le dipendenze sono gia state installate. Se necessario:

```bash
npm install
```

### 2. Configurazione Supabase

**IMPORTANTE**: Devi configurare la ANON KEY nel file `.env`

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il progetto: `umjjfcekxvlvqjavkcqu`
3. Vai su **Project Settings** → **API**
4. Copia la chiave **anon public** (Project API keys)
5. Incollala nel file `.env`:

```env
VITE_SUPABASE_URL=https://umjjfcekxvlvqjavkcqu.supabase.co
VITE_SUPABASE_ANON_KEY=LA_TUA_CHIAVE_ANON_QUI
```

### 3. Schema Database

Assicurati che il database Supabase abbia le seguenti tabelle:

#### Tabella `clienti`
```sql
CREATE TABLE clienti (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  azienda TEXT,
  stato TEXT CHECK (stato IN ('lead', 'cliente', 'inattivo')) DEFAULT 'lead',
  valore_stimato DECIMAL(10,2),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabella `pipeline`
```sql
CREATE TABLE pipeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clienti(id) ON DELETE CASCADE,
  titolo TEXT NOT NULL,
  fase TEXT CHECK (fase IN ('contatto', 'qualifica', 'proposta', 'negoziazione', 'chiuso-vinto', 'chiuso-perso')) DEFAULT 'contatto',
  valore DECIMAL(10,2),
  probabilita INTEGER CHECK (probabilita >= 0 AND probabilita <= 100),
  data_chiusura_prevista DATE,
  note TEXT,
  ordine INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabella `attivita`
```sql
CREATE TABLE attivita (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clienti(id) ON DELETE SET NULL,
  pipeline_id UUID REFERENCES pipeline(id) ON DELETE SET NULL,
  tipo TEXT CHECK (tipo IN ('chiamata', 'email', 'incontro', 'task')) NOT NULL,
  titolo TEXT NOT NULL,
  descrizione TEXT,
  data_scadenza DATE,
  completata BOOLEAN DEFAULT FALSE,
  priorita TEXT CHECK (priorita IN ('bassa', 'media', 'alta')) DEFAULT 'media',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Avvio dell'Applicazione

```bash
npm run dev
```

L'applicazione sara disponibile su `http://localhost:5173`

## Struttura del Progetto

```
src/
├── components/
│   └── Layout.tsx          # Layout principale con sidebar
├── pages/
│   ├── Overview.tsx        # Dashboard overview
│   ├── Analytics.tsx       # Pagina analytics con grafici
│   ├── Clienti.tsx         # Gestione clienti
│   ├── Pipeline.tsx        # Pipeline con drag & drop
│   └── Attivita.tsx        # Gestione attivita
├── lib/
│   └── supabase.ts         # Client Supabase
├── types/
│   └── database.ts         # Type definitions per database
├── App.tsx                 # Router principale
├── main.tsx               # Entry point
└── index.css              # Stili globali + Tailwind

```

## Build per Produzione

```bash
npm run build
```

I file di build saranno generati nella cartella `dist/`.

## Troubleshooting

### Errore "Missing Supabase environment variables"

Assicurati che il file `.env` sia configurato correttamente con le chiavi Supabase.

### Errori di connessione al database

Verifica che:
1. Le tabelle siano create correttamente
2. Le Row Level Security (RLS) policies permettano le operazioni (o siano disabilitate per lo sviluppo)
3. La ANON KEY sia corretta

### Problemi con npm install

Prova a cancellare `node_modules` e `package-lock.json` e reinstalla:

```bash
rm -rf node_modules package-lock.json
npm install
```

## License

MIT
