# PROMPT-FRONTEND — MiniCRM React App

> Passa questo prompt dopo aver completato PROMPT-BACKEND.md.
> Esegui tutto in sequenza. Crea tutti i file esattamente come descritti.

---

## CONTESTO

Stai costruendo un **Mini CRM** completo in React + TypeScript + Supabase.
Il risultato è una SPA con 5 sezioni: Overview, Analytics, Clienti, Pipeline, Attività.

---

## STACK TECNOLOGICO

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6",
  "typescript": "^5.2.2",
  "vite": "^5.2.0",
  "@supabase/supabase-js": "^2",
  "tailwindcss": "^3.4.3",
  "recharts": "^3.8.0",
  "@dnd-kit/core": "6.1.0",
  "@dnd-kit/sortable": "8.0.0",
  "@dnd-kit/utilities": "3.2.2",
  "lucide-react": "0.383.0",
  "react-hot-toast": "2.4.1"
}
```

Inizializza il progetto con:
```bash
npm create vite@latest minicrm -- --template react-ts
cd minicrm
npm install react-router-dom @supabase/supabase-js recharts @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities lucide-react react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## STRUTTURA FILE

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── vite-env.d.ts
├── components/
│   ├── Badge.tsx
│   ├── Modal.tsx
│   ├── ConfirmDialog.tsx
│   ├── Skeleton.tsx
│   └── Sidebar.tsx
├── hooks/
│   ├── useClienti.ts
│   ├── useNote.ts
│   ├── useOpportunita.ts
│   └── useAttivita.ts
├── lib/
│   └── supabaseClient.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── Analytics.tsx
│   ├── Clienti.tsx
│   ├── DettaglioCliente.tsx
│   ├── Pipeline.tsx
│   └── AttivitaPage.tsx
└── types/
    └── index.ts
```

---

## FILE DI CONFIGURAZIONE

### `.env`
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### `tailwind.config.js`
```js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7fe', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8', 500: '#4318ff',
          600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
        },
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
      boxShadow: { 'card': '0px 10px 40px -10px rgba(0,0,0,0.05)' },
    }
  },
  plugins: [],
}
```

### `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-base:        #f8fafc;
  --bg-surface:     #ffffff;
  --bg-border:      #eff2f7;
  --accent:         #4318ff;
  --success:        #05cd99;
  --warning:        #ffa02e;
  --danger:         #ee5d50;
  --text-primary:   #1b2559;
  --text-secondary: #a3aed0;
}

* { font-family: 'DM Sans', sans-serif; }
body { background: var(--bg-base); color: var(--text-primary); transition: background-color 0.2s; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

.glass-card { background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

---

## `src/lib/supabaseClient.ts`

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variabili VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY mancanti')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
```

---

## `src/types/index.ts`

```ts
export type StatoCliente = 'lead' | 'prospect' | 'attivo' | 'perso'
export type TipoNota = 'chiamata' | 'email' | 'meeting' | 'altro'
export type TipoAttivita = 'chiamata' | 'email' | 'meeting' | 'task'
export type FaseOpportunita = 'contatto' | 'proposta' | 'trattativa' | 'chiuso_vinto' | 'chiuso_perso'
export type StatoProdotto = 'preparazione' | 'attivo' | 'sospeso'
export type CategoriaProdotto = 'servizio' | 'software' | 'consulenza' | 'formazione'
export type CanaleVendita = 'affiliate' | 'direct_buy' | 'brand_ambassador' | 'adsense'
export type TipoMetrica = 'product_insights' | 'visitors' | 'sales'
export type TipoProgramma = 'affiliate' | 'direct_buy' | 'brand_ambassador' | 'adsense'

export interface Cliente {
  id: string; nome: string; cognome: string; azienda?: string
  email?: string; telefono?: string; stato: StatoCliente
  valore_stimato: number; fonte?: string; created_at: string
}
export interface Nota {
  id: string; cliente_id: string; testo: string; tipo: TipoNota; created_at: string
}
export interface Opportunita {
  id: string; cliente_id: string; titolo: string; valore: number
  fase: FaseOpportunita; probabilita: number; data_chiusura?: string; created_at: string
}
export interface Attivita {
  id: string; cliente_id: string; opportunita_id?: string
  tipo: TipoAttivita; titolo: string; completata: boolean; scadenza?: string; created_at: string
}
export interface Prodotto {
  id: string; nome: string; descrizione?: string
  categoria: CategoriaProdotto; stato: StatoProdotto; prezzo: number; created_at: string
}
export interface Vendita {
  id: string; cliente_id?: string; prodotto_id?: string
  importo: number; canale: CanaleVendita; data_vendita: string; created_at: string
  clienti?: { nome: string; cognome: string }
  prodotti?: { nome: string }
}
export interface MetricaMensile {
  id: string; anno: number; mese: number; tipo: TipoMetrica; valore: number; created_at: string
}
export interface ProgrammaMarketing {
  id: string; nome: string; tipo: TipoProgramma
  budget: number; prodotti_venduti: number; stato: string
  data_inizio?: string; data_fine?: string; created_at: string
}
```

---

## `src/components/Badge.tsx`

Componente che mostra uno stato cliente o una fase opportunità come pill colorata.

- Props: `{ value: StatoCliente | FaseOpportunita }`
- Colori per stato:
  - `lead` → arancione (`bg-orange-100 text-orange-600 border border-orange-200`)
  - `prospect` → blu (`bg-blue-100 text-blue-600 border border-blue-200`)
  - `attivo` → verde (`bg-green-100 text-green-600 border border-green-200`)
  - `perso` → rosso (`bg-red-100 text-red-600 border border-red-200`)
  - `contatto` → slate (`bg-slate-100 text-slate-600 border border-slate-200`)
  - `proposta` → indigo (`bg-indigo-100 text-indigo-600 border border-indigo-200`)
  - `trattativa` → purple (`bg-purple-100 text-purple-600 border border-purple-200`)
  - `chiuso_vinto` → emerald (`bg-emerald-100 text-emerald-600 border border-emerald-200`)
  - `chiuso_perso` → rose (`bg-rose-100 text-rose-600 border border-rose-200`)
- Etichette: `chiuso_vinto` → "Vinto ✅", `chiuso_perso` → "Perso ❌", altri capitalizzati

---

## `src/components/Modal.tsx`

Modale generica con backdrop blur.

- Props: `{ title: string, onClose: () => void, children: ReactNode }`
- Chiude con ESC (event listener su `keydown`)
- Struttura: overlay scuro `bg-black/70 backdrop-blur-sm` + card `rounded-xl` centrata
- Header con titolo e pulsante `X` (icona lucide)
- Max width: `max-w-lg`

---

## `src/components/ConfirmDialog.tsx`

Dialog di conferma eliminazione che usa `Modal`.

- Props: `{ message: string, onConfirm: () => void, onCancel: () => void }`
- Titolo: "Conferma eliminazione"
- Due pulsanti: "Annulla" (border) e "Elimina" (`bg-red-600`)

---

## `src/components/Skeleton.tsx`

Skeleton loader per liste.

- `SkeletonRow`: una riga con 3 blocchi grigi animati (`animate-pulse`)
- `SkeletonList({ rows?: number })`: N righe (default 5), usa `SkeletonRow`

---

## `src/components/Sidebar.tsx`

Header sticky in cima alla pagina (NON sidebar laterale).

**Layout:** Logo | Nav centrale | Azioni destra

**Logo:** Box 40×40 `bg-[var(--accent)] rounded-xl` con lettera "S" italic + testo "MiniCRM"

**Nav links** (in `bg-[#f4f7fe] rounded-2xl p-1.5`):
- Overview → `/`
- Analytics → `/analytics`
- Clienti → `/clienti`
- Pipeline → `/pipeline`
- Attività → `/attivita`

Il link attivo ha `bg-white rounded-xl shadow-sm`. Usa `NavLink` con `end={true}` solo per `/`.

**Azioni destra:**
- Icona search (nascosta su mobile)
- Icona bell con pallino rosso (`w-2 h-2 bg-red-500`)
- Avatar rotondo 40×40 con immagine DiceBear: `https://api.dicebear.com/7.x/avataaars/svg?seed=Jelly`
- Nome "Jelly Grar" + sottotitolo "Pro Plan" (nascosti su tablet)

---

## `src/hooks/useClienti.ts`

```ts
// Fetch tutti clienti da Supabase, ordinati per created_at DESC
// Espone: { clienti, loading, error, refetch }
// Usa useCallback per fetchClienti e useEffect per trigger iniziale
```

## `src/hooks/useNote.ts`

```ts
// Fetch note filtrate per clienteId, ordinate per created_at DESC
// Props: clienteId: string
// Espone: { note, loading, error, refetch }
```

## `src/hooks/useOpportunita.ts`

```ts
// Fetch opportunità, opzionalmente filtrate per clienteId
// Props: clienteId?: string
// Se clienteId presente: .eq('cliente_id', clienteId)
// Ordinate per created_at DESC
// Espone: { opportunita, loading, error, refetch }
```

## `src/hooks/useAttivita.ts`

```ts
// Fetch tutte le attività, ordinate per scadenza ASC
// Espone: { attivita, loading, error, refetch }
```

---

## `src/App.tsx`

```tsx
// BrowserRouter con Toaster (react-hot-toast, posizione top-right)
// Toast style: bg '#1a1a24', testo '#f1f5f9', border '#2a2a3a', rounded-xl
// Layout: min-h-screen bg-[var(--bg-base)]
// Sidebar in cima
// <main> max-w-7xl mx-auto px-4 sm:px-8 py-8

// Routes:
// /            → <Dashboard />
// /analytics   → <Analytics />
// /clienti     → <Clienti />
// /clienti/:id → <DettaglioCliente />
// /pipeline    → <Pipeline />
// /attivita    → <AttivitaPage />
```

---

## `src/pages/Dashboard.tsx`

### Struttura generale
Pagina con header, 5 tab, contenuto condizionale per tab attivo.

### Header
- Titolo: "Good Afternoon, Jelly! 👋"
- Sottotitolo: "Let's see the current product stats."
- Destra: selector "Data Periode: 1-30 June, 2024" (con ChevronDown) + button "Download Data" (blu con icona Download)

### Tabs (state `activeTab`)
5 tab cliccabili: `Product Insights | Products Preparation | Sales Service | Sales Composition | Product Marketing Programs`
- Tab attivo: testo scuro + underline 3px `bg-[var(--accent)]` in `after:` pseudo-element
- Tab inattivo: testo secondario, hover scuro
- Separatore: `border-b border-[var(--bg-border)]`

### TAB "Product Insights" (default)

**KPI Grid** (4 colonne):

Card 1-3 (sfondo bianco, `rounded-[2rem]`, hover border accent):
- Icona in box `w-12 h-12 rounded-2xl bg-gray-50`, hover cambia a blu
- Badge cambio% in alto a destra (verde se su, rosso se giù)
- Numero grande `text-3xl font-black`
- Label sotto

Dati KPI da Supabase:
- **Total Product Insights** → `COUNT(*) FROM prodotti WHERE stato='attivo'`; change statico `-2.33%`; icona `BarChart3`
- **Total Visitor** → `metriche_mensili WHERE anno=2024 AND mese=6 AND tipo='visitors'`; change calcolato mese/mese (giu vs mag); icona `Users`
- **Total Product Sales** → `metriche_mensili WHERE anno=2024 AND mese=6 AND tipo='sales'`; change calcolato; icona `Target`

Card 4 — Blue Featured Card (`bg-[var(--accent)]`, `rounded-[2rem]`, `shadow-xl shadow-blue-500/20`):
- Badge pill "FANTASTIC SALES" (`bg-white/20 backdrop-blur-md`)
- Testo: "This year sales have increased fantastically **54%** from last year. It's reached the target."
- Button "See comparison" (`bg-white/20 hover:bg-white/30 border border-white/30`)
- 2 cerchi decorativi blur in posizione assoluta

**Charts Row** (12 colonne):

Bar Chart (7 col, `rounded-[2rem]`):
- Header: icona TrendingUp + "Analytics" + select menu (Total Product Sales / Total Visitors / Total Product Insights)
- Dati: `metriche_mensili` 2024, mese in ordine, filtrati per tipo selezionato
- Altezza: 280px, `ResponsiveContainer`
- Bar `radius={[10,10,10,10]}` `barSize={18}`
- Colore bar: nero `#000000`, ECCETTO la barra del mese corrente (giugno = mese 6) che è `#4318ff`
- Tooltip custom: box blu accent arrotondato con valore
- XAxis: mesi abbreviati inglesi (Feb, Mar... Dec), no assi

Pie/Donut Chart (5 col, `rounded-[2rem]`):
- Header: icona PieChart + "Sales Category" + label "Total Product Sales" con ChevronDown
- Dati: da `programmi_marketing`, calcola % da `prodotti_venduti / totale * 100`
- Donut: `innerRadius={60}` `outerRadius={90}` `paddingAngle={0}` no stroke
- Colori: affiliate `#4318ff`, direct_buy `#6ad2ff`, brand_ambassador `#eff4fb`, adsense `#e0e7fb`
- Legenda destra: dot colorato + nome + `% · N Product`

### TAB "Products Preparation"

Tabella prodotti con: Prodotto (nome + descrizione truncata), Categoria, Prezzo (formatCurrency), Stato (pill colorata), Creato.
- Stato colors: attivo verde, preparazione giallo, sospeso grigio
- Loading skeleton: 4 righe × 5 colonne
- Header con icona Package + contatore

### TAB "Sales Service"

Tabella vendite con join clienti+prodotti: Cliente, Prodotto, Importo, Canale, Data.
- Canale come pill con colore semi-trasparente del canale
- Loading skeleton

### TAB "Sales Composition"

Grid 12 col:
- Donut chart (5 col): stesso donut del tab insights ma più grande (`innerRadius={70}` `outerRadius={110}`)
- Tabella breakdown (7 col): Canale | % Share (con progress bar) | Prodotti venduti | Trend (mock ±%)

### TAB "Product Marketing Programs"

Tabella programmi: Programma, Tipo (pill), Budget, Prodotti venduti (con progress bar), Inizio, Fine, Stato (pill).

---

## `src/pages/Analytics.tsx`

### Header
- Titolo "Analytics", sottotitolo "Panoramica completa delle performance CRM — 2024"

### KPI Row (4 card)
Fetch parallelo: tutti clienti, tutte opportunità, tutte attività, metriche_mensili anno=2024.

- **Pipeline attiva**: somma `valore` delle opp non chiuse; icona TrendingUp; colore `#4318ff`
- **Ricavi chiusi**: somma valore opp `chiuso_vinto`; icona Award; colore `#22c55e`
- **Win rate**: `vinti / (vinti + persi) * 100` con avg deal size come sub; icona Target; colore `#6366f1`
- **Task completate**: `completate / totale * 100`; icona CheckSquare; colore `#f59e0b`

Ogni card: icona in box colorato (bg `color+'15'`), badge cambio%, valore grande, label, sub-label.

### Row 2 — Trend + Funnel (12 col)

**Line Chart** (8 col):
- Dati: `metriche_mensili` 2024, costruisci array di oggetti `{ name: 'Gen', sales, visitors }` per ogni mese
- Due linee: `visitors` (`#6ad2ff`, strokeWidth 2.5) e `sales` (`#4318ff`)
- No dots, activeDot radius 5
- `CartesianGrid` solo orizzontale
- Legend sotto con traduzione: sales → "Vendite", visitors → "Visitatori"

**Funnel Chart** (4 col):
- Dati: somma valore opp per fase `contatto` (light indigo), `proposta` (medium), `trattativa` (dark)
- `FunnelChart` con `Funnel` + `LabelList` centrato bianco col nome fase
- Tooltip con `formatCurrency`

### Row 3 — Clienti per stato + Fonte (2 col)

**Bar Chart clienti per stato**:
- Dati calcolati dal fetch clienti: count per lead/prospect/attivo/perso
- Colori: lead `#6ad2ff`, prospect `#fbbf24`, attivo `#4318ff`, perso `#f87171`
- `barSize={40}` `radius={[10,10,10,10]}`

**Donut + legenda fonte acquisizione**:
- Raggruppa clienti per campo `fonte`, conta per fonte
- Donut `innerRadius={50}` `outerRadius={80}`
- Legenda destra: dot + nome + progress bar + count

### Row 4 — Pipeline per fase + Attività (12 col)

**Horizontal Bar Chart** (7 col) — opportunità per fase:
- Layout `"vertical"`, dataKey `valore`, `tickFormatter` su X axis: `€${v/1000}k`
- YAxis categorico con nomi fase
- Colori: contatto `#a5b4fc`, proposta `#818cf8`, trattativa `#6366f1`, vinto `#22c55e`, perso `#f87171`

**Attività per tipo** (5 col):
- 4 progress bar (chiamata/email/meeting/task): `completate/totale`
- Colori: chiamata `#4318ff`, email `#6ad2ff`, meeting `#fbbf24`, task `#34d399`
- Ring SVG summary in basso: cerchio con `strokeDasharray="${completionRate} ${100-completionRate}"`
- Testo centrale: % completamento

### Row 5 — Top 5 clienti

Tabella: #rank | Cliente | Azienda | Stato (badge colorato inline) | Fonte | Valore stimato | Opportunità (count + dot per fase)
- Rank: cerchietto blu `w-7 h-7 rounded-full bg-[var(--accent)]/10`
- Dot opportunità: `w-2 h-2 rounded-full` con colore fase

---

## `src/pages/Clienti.tsx`

### Header
- Titolo "Clienti" + count totale
- Pulsanti: "Esporta CSV" (border bianco) + "Nuovo Cliente" (blu accent)

### Barra filtri
Card bianca `rounded-[1.5rem]`:
- Input search con icona Search a sinistra, placeholder "Cerca per nome, azienda o email...", `bg-[#f4f7fe]`
- Select filtro stato: Tutti / Lead / Prospect / Attivo / Perso

### Tabella clienti
- Colonne: Nome & Contatto | Azienda | Stato | Valore Stimato | Azioni
- Avatar iniziali: `w-10 h-10 rounded-full bg-blue-100 text-[var(--accent)]` con `nome[0]+cognome[0]`
- Azioni (visibili solo su hover `group-hover:opacity-100`): eye button (→ `/clienti/:id`) + trash button
- Empty state: icona Users grande + testi
- Loading: `<SkeletonList rows={5} />`

### Export CSV
Genera CSV con BOM UTF-8, colonne: Nome;Cognome;Azienda;Email;Telefono;Stato;Valore

### Modal "Nuovo Cliente"
Form a 2 colonne con campi: Nome*, Cognome*, Azienda, Email, Telefono, Stato (select), Valore Stimato €, Fonte.
Validazione: nome e cognome obbligatori. Toast su successo/errore. Refetch dopo salvataggio.

### Confirm Delete
`<ConfirmDialog>` prima di eliminare. Eliminazione a cascata gestita dal DB.

---

## `src/pages/DettaglioCliente.tsx`

### Header card
- Back button "← Torna ai clienti"
- Nome completo `text-2xl font-semibold` + azienda
- Inline stato edit: click su `<Badge>` → appare `<select>` con autoFocus, onBlur chiude
- Badge fonte (pill grigia)
- Link email (`mailto:`) e telefono (`tel:`) con icone

### Tabs
3 pill tabs: `note | opportunita | attivita`
Tab attivo: `bg-[var(--accent)] text-white`

### Tab Note
**Timeline verticale**: linea verticale assoluta a sinistra, dot colorato per tipo nota, card con tipo + data + testo.
Colori dot: chiamata blu, email verde, meeting viola, altro slate.

**Form aggiungi nota** sotto la timeline:
- Textarea 3 righe
- Select tipo nota
- Button "Aggiungi"

### Tab Opportunità
Grid 2 colonne di card. Ogni card: titolo + `<Badge fase>` + valore bold + probabilità% + data chiusura.
Button "+ Nuova Opportunità" → `<Modal>` con form: titolo*, valore, probabilità (0-100), fase (select), data chiusura (date).

### Tab Attività
Lista con checkbox toggle completamento. Ogni riga: checkbox → tipo (text small) → titolo (line-through se completata) → data scadenza.
Checkbox: cerchio border-2, se completata `bg-[var(--success)]` con icona Check bianca.
Button "+ Nuova Attività" → `<Modal>` con form: titolo*, tipo (select), scadenza (datetime-local).

---

## `src/pages/Pipeline.tsx`

### Kanban Board con Drag & Drop

**Setup dnd-kit:**
```ts
const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
```

**5 colonne:** Contatto | Proposta | Trattativa | Vinto | Perso

Ogni colonna:
- Header: label UPPERCASE bold + contatore in pallino + totale valore in blu su sfondo `blue-50/50`
- `SortableContext` con `id={fase}` e `verticalListSortingStrategy`
- Drop zone: `min-h-[400px]`, quando `activeId` presente → `bg-blue-50/30 border-blue-100/50 ring-4`
- Empty state: bordo dashed, testo "Empty"

**KanbanCard** (componente con `useSortable`):
- `cursor-grab active:cursor-grabbing select-none`
- Header: titolo + pulsante `MoreVertical`
- Mini avatar con iniziale cliente + nome cliente
- Footer con separatore: valore bold | probabilità% in badge grigio
- Hover: `shadow-md border-[var(--accent)]/30`
- Se è la card draggata (`isDragging`): `opacity: 0`

**handleDragEnd:**
- `over.id` può essere un `fase` (colonna) o un `opportunita.id` (altra card)
- Se fase trovata → aggiorna `fase` nell'opp
- Optimistic update + rollback su errore
- Salva su Supabase: `.update({ fase }).eq('id', activeId)`

**DragOverlay:**
- Card preview con `rotate-3 transform-gpu shadow-2xl border-2 border-[var(--accent)]/30`
- Mostra titolo, cliente, valore in blu, icona ArrowUpRight

**Fetch:** `supabase.from('opportunita').select('*, clienti(nome, cognome)')`

---

## `src/pages/AttivitaPage.tsx`

### Logica raggruppamento
Filtra attività non completate e le divide in:
- **inRitardo**: `scadenza < oggi 00:00`
- **oggi**: `scadenza >= oggi 00:00 AND <= oggi 23:59`
- **settimana**: `scadenza <= oggi + 7 giorni` o senza scadenza

### Header
- Titolo "Le Mie Attività"
- Card summary con 3 colonne: **Delay** (rosso) | **Today** (giallo) | **Next** (verde) con contatori

### Sezioni (componente `Section`)
Ogni sezione non viene renderizzata se vuota (`if items.length === 0 return null`).

Header sezione: dot colorato + label uppercase + linea `h-px bg-gray-100` + badge count.

### AttivitaRow
- Checkbox quadrato `w-6 h-6 rounded-lg border-2`, hover mostra Check semi-trasparente
- Icona tipo in box `w-10 h-10 rounded-xl bg-gray-50`:
  - chiamata → `Phone`, email → `Mail`, meeting → `MessageSquare`, task → `CheckSquare`
- Titolo + cliente sotto
- Scadenza formattata: `{ weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }`

Toggle completamento: `UPDATE attivita SET completata=!completata WHERE id=...` + toast + reload.

**Fetch:** `supabase.from('attivita').select('*, clienti(nome, cognome)').order('scadenza')`

---

## DESIGN SYSTEM — REGOLE

### Colori (CSS variables)
```
--bg-base:        #f8fafc   (sfondo pagina)
--bg-surface:     #ffffff   (card, modal)
--bg-border:      #eff2f7   (bordi)
--accent:         #4318ff   (brand blue, pulsanti primari, link attivi)
--text-primary:   #1b2559   (testi principali)
--text-secondary: #a3aed0   (testi secondari, placeholder)
```

### Card style
```
bg-white rounded-[2rem] border border-[var(--bg-border)] shadow-card
```

### Pulsante primario
```
bg-[var(--accent)] text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30
hover:opacity-90 active:scale-[0.98]
```

### Input standard
```
bg-[var(--bg-base)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm
focus:outline-none focus:border-[var(--accent)] transition
```

### Animazione pagina
```
animate-in fade-in slide-in-from-bottom-4 duration-700
```

### Typography
- Titoli pagina: `text-3xl font-bold text-[var(--text-primary)]`
- Sottotitoli: `text-[var(--text-secondary)] font-medium`
- Valori KPI: `text-3xl font-black tracking-tight`
- Badge small: `text-[10px] font-bold uppercase tracking-wider`

---

## COMPORTAMENTI IMPORTANTI

1. **Toast notifications** su ogni operazione CRUD (successo verde, errore rosso)
2. **Optimistic updates** nella Pipeline (aggiorna UI prima della risposta Supabase, rollback su errore)
3. **Skeleton loading** nelle liste durante il fetch
4. **Export CSV** con BOM `\uFEFF` per compatibilità Excel italiano (separatore `;`)
5. **Inline edit stato** nel dettaglio cliente: click badge → select autoFocus → onBlur chiude
6. **Empty states** con icona grande e testo descrittivo in tutte le liste
7. **Responsive**: navbar si riduce su mobile (nav nascosta, solo logo + azioni destra)
8. **No-scrollbar** nella Kanban board (scroll orizzontale senza scrollbar visibile)
9. `end={true}` solo per NavLink `/` per evitare match su tutti i path

---

## NOTE FINALI

- Le variabili d'ambiente sono iniettate da Vite: `import.meta.env.VITE_*`
- Tutte le foreign key usano `ON DELETE CASCADE` → eliminare un cliente elimina tutto
- Il campo `fonte` nei clienti è free text (non enum) — nessuna validazione frontend
- `data_chiusura` nelle opportunità è DATE (non TIMESTAMPTZ) — usa `<input type="date">`
- Le attività senza scadenza finiscono nella sezione "Prossimi 7 giorni"
- Il grafico bar evidenzia **giugno** (mese 6) in blu, tutti gli altri mesi in nero
