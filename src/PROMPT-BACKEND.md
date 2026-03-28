# PROMPT-BACKEND — MiniCRM Supabase Setup

> Esegui tutto in sequenza senza fermarti. Logga ogni fase completata con ✅.
> Usa il MCP Supabase per eseguire tutto l'SQL che segue.

---

## CONTESTO

Stai costruendo il backend Supabase per un **Mini CRM** con le seguenti funzionalità:
- Gestione clienti (lead → prospect → attivo → perso)
- Note per cliente con tipo (chiamata, email, meeting, altro)
- Opportunità commerciali con kanban per fase
- Attività/task con scadenza e completamento
- Prodotti con stato pipeline (preparazione, attivo, sospeso)
- Vendite con canale di acquisizione
- Metriche mensili per grafici analytics
- Programmi marketing con breakdown per canale

RLS è **disabilitato** — ambiente demo locale.

---

## FASE 1 — TABELLE CRM BASE

```sql
-- ========================
-- TABELLA: clienti
-- ========================
CREATE TABLE IF NOT EXISTS clienti (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           TEXT NOT NULL,
  cognome        TEXT NOT NULL,
  azienda        TEXT,
  email          TEXT,
  telefono       TEXT,
  stato          TEXT NOT NULL DEFAULT 'lead'
                 CHECK (stato IN ('lead','prospect','attivo','perso')),
  valore_stimato NUMERIC DEFAULT 0,
  fonte          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE clienti DISABLE ROW LEVEL SECURITY;

-- ========================
-- TABELLA: note
-- ========================
CREATE TABLE IF NOT EXISTS note (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  testo       TEXT NOT NULL,
  tipo        TEXT NOT NULL DEFAULT 'altro'
              CHECK (tipo IN ('chiamata','email','meeting','altro')),
  created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE note DISABLE ROW LEVEL SECURITY;

-- ========================
-- TABELLA: opportunita
-- ========================
CREATE TABLE IF NOT EXISTS opportunita (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id     UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  titolo         TEXT NOT NULL,
  valore         NUMERIC DEFAULT 0,
  fase           TEXT NOT NULL DEFAULT 'contatto'
                 CHECK (fase IN (
                   'contatto','proposta','trattativa',
                   'chiuso_vinto','chiuso_perso'
                 )),
  probabilita    INTEGER DEFAULT 20
                 CHECK (probabilita BETWEEN 0 AND 100),
  data_chiusura  DATE,
  created_at     TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE opportunita DISABLE ROW LEVEL SECURITY;

-- ========================
-- TABELLA: attivita
-- ========================
CREATE TABLE IF NOT EXISTS attivita (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id      UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  opportunita_id  UUID REFERENCES opportunita(id) ON DELETE SET NULL,
  tipo            TEXT NOT NULL DEFAULT 'task'
                  CHECK (tipo IN ('chiamata','email','meeting','task')),
  titolo          TEXT NOT NULL,
  completata      BOOLEAN DEFAULT false,
  scadenza        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE attivita DISABLE ROW LEVEL SECURITY;
```

Verifica che le 4 tabelle siano state create. ✅

---

## FASE 2 — TABELLE DASHBOARD & ANALYTICS

```sql
-- ========================
-- TABELLA: prodotti
-- ========================
CREATE TABLE IF NOT EXISTS prodotti (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  descrizione TEXT,
  categoria   TEXT NOT NULL DEFAULT 'servizio'
              CHECK (categoria IN ('servizio','software','consulenza','formazione')),
  stato       TEXT NOT NULL DEFAULT 'preparazione'
              CHECK (stato IN ('preparazione','attivo','sospeso')),
  prezzo      NUMERIC DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE prodotti DISABLE ROW LEVEL SECURITY;

-- ========================
-- TABELLA: vendite
-- ========================
CREATE TABLE IF NOT EXISTS vendite (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID REFERENCES clienti(id) ON DELETE SET NULL,
  prodotto_id  UUID REFERENCES prodotti(id) ON DELETE SET NULL,
  importo      NUMERIC NOT NULL DEFAULT 0,
  canale       TEXT NOT NULL DEFAULT 'direct_buy'
               CHECK (canale IN ('affiliate','direct_buy','brand_ambassador','adsense')),
  data_vendita DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vendite DISABLE ROW LEVEL SECURITY;

-- ========================
-- TABELLA: metriche_mensili
-- ========================
CREATE TABLE IF NOT EXISTS metriche_mensili (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anno       INTEGER NOT NULL,
  mese       INTEGER NOT NULL CHECK (mese BETWEEN 1 AND 12),
  tipo       TEXT NOT NULL
             CHECK (tipo IN ('product_insights','visitors','sales')),
  valore     NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(anno, mese, tipo)
);
ALTER TABLE metriche_mensili DISABLE ROW LEVEL SECURITY;

-- ========================
-- TABELLA: programmi_marketing
-- ========================
CREATE TABLE IF NOT EXISTS programmi_marketing (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             TEXT NOT NULL,
  tipo             TEXT NOT NULL DEFAULT 'affiliate'
                   CHECK (tipo IN ('affiliate','direct_buy','brand_ambassador','adsense')),
  budget           NUMERIC DEFAULT 0,
  prodotti_venduti INTEGER DEFAULT 0,
  stato            TEXT NOT NULL DEFAULT 'attivo'
                   CHECK (stato IN ('attivo','sospeso','completato')),
  data_inizio      DATE,
  data_fine        DATE,
  created_at       TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE programmi_marketing DISABLE ROW LEVEL SECURITY;
```

Verifica che le 4 nuove tabelle siano state create. ✅

---

## FASE 3 — DATI DEMO: CRM BASE

```sql
-- ========================
-- INSERT: clienti (8 record)
-- ========================
INSERT INTO clienti (nome, cognome, azienda, email, telefono, stato, valore_stimato, fonte)
VALUES
  ('Marco',    'Rossi',     'Idraulica Rossi Srl',       'marco@idraulicarossi.it',    '333-1234567', 'attivo',   2500,  'passaparola'),
  ('Giulia',   'Ferretti',  'Studio Legale Ferretti',    'giulia@ferretti-law.it',     '02-9876543',  'attivo',   4000,  'sito web'),
  ('Antonio',  'Esposito',  'Ristorante Da Antonio',     'info@daantonio.it',          '081-5554433', 'lead',     1200,  'social'),
  ('Sara',     'Conti',     'Estetica Sara',             'sara.conti@gmail.com',       '347-9876543', 'prospect', 800,   'passaparola'),
  ('Luca',     'Bianchi',   'Agenzia Web Bianchi',       'luca@agenziawebianchi.it',   '02-1234567',  'attivo',   6000,  'sito web'),
  ('Federica', 'Marino',    'Marino Assicurazioni',      'federica@marinoass.it',      '06-8877665',  'perso',    0,     'social'),
  ('Roberto',  'Gallo',     'Gallo Costruzioni',         'roberto@gallocostruzioni.it','011-2233445', 'lead',     15000, 'fiera'),
  ('Chiara',   'Ricci',     'Ricci Consulting',          'chiara@ricciconsulting.it',  '055-3344556', 'prospect', 3500,  'linkedin');

-- ========================
-- INSERT: note (10 record, subquery per FK)
-- ========================
INSERT INTO note (cliente_id, testo, tipo) VALUES
  ((SELECT id FROM clienti WHERE cognome='Rossi'),    'Prima chiamata conoscitiva, interessato al gestionale.', 'chiamata'),
  ((SELECT id FROM clienti WHERE cognome='Rossi'),    'Inviata proposta via email.', 'email'),
  ((SELECT id FROM clienti WHERE cognome='Ferretti'), 'Meeting in studio, richiede CRM per gestione clienti.', 'meeting'),
  ((SELECT id FROM clienti WHERE cognome='Ferretti'), 'Follow-up telefonico positivo.', 'chiamata'),
  ((SELECT id FROM clienti WHERE cognome='Esposito'), 'Contatto freddo da Instagram, vuole sistema prenotazioni.', 'altro'),
  ((SELECT id FROM clienti WHERE cognome='Conti'),    'Presentato il prodotto, molto interessata.', 'meeting'),
  ((SELECT id FROM clienti WHERE cognome='Bianchi'),  'Cliente storico, rinnovo contratto annuale.', 'email'),
  ((SELECT id FROM clienti WHERE cognome='Gallo'),    'Richiesta preventivo per software gestione cantieri.', 'chiamata'),
  ((SELECT id FROM clienti WHERE cognome='Ricci'),    'Demo del prodotto completata con successo.', 'meeting'),
  ((SELECT id FROM clienti WHERE cognome='Marino'),   'Cliente non ha rinnovato, budget tagliato.', 'altro');

-- ========================
-- INSERT: opportunita (8 record)
-- ========================
INSERT INTO opportunita (cliente_id, titolo, valore, fase, probabilita, data_chiusura) VALUES
  ((SELECT id FROM clienti WHERE cognome='Rossi'),    'CRM Base Annuale',            2500,  'trattativa',    70, CURRENT_DATE + 15),
  ((SELECT id FROM clienti WHERE cognome='Ferretti'), 'CRM Premium + Formazione',    4000,  'proposta',      50, CURRENT_DATE + 30),
  ((SELECT id FROM clienti WHERE cognome='Esposito'), 'Sistema Prenotazioni',        1200,  'contatto',      20, CURRENT_DATE + 45),
  ((SELECT id FROM clienti WHERE cognome='Conti'),    'Tool Gestione Appuntamenti',   800,  'proposta',      60, CURRENT_DATE + 20),
  ((SELECT id FROM clienti WHERE cognome='Bianchi'),  'Rinnovo Contratto Enterprise', 6000, 'chiuso_vinto',  100, CURRENT_DATE - 5),
  ((SELECT id FROM clienti WHERE cognome='Gallo'),    'Software Cantieri Custom',    15000, 'contatto',      15, CURRENT_DATE + 60),
  ((SELECT id FROM clienti WHERE cognome='Ricci'),    'Consulenza + Implementazione', 3500, 'trattativa',    80, CURRENT_DATE + 10),
  ((SELECT id FROM clienti WHERE cognome='Marino'),   'CRM Standard',                   0, 'chiuso_perso',   0, CURRENT_DATE - 30);

-- ========================
-- INSERT: attivita (8 record)
-- ========================
INSERT INTO attivita (cliente_id, tipo, titolo, completata, scadenza) VALUES
  ((SELECT id FROM clienti WHERE cognome='Rossi'),    'chiamata', 'Richiamata per conferma proposta',  false, now() + interval '1 day'),
  ((SELECT id FROM clienti WHERE cognome='Ferretti'), 'meeting',  'Meeting finale firma contratto',     false, now() + interval '3 days'),
  ((SELECT id FROM clienti WHERE cognome='Esposito'), 'email',    'Inviare presentazione prodotto',     false, now() + interval '2 days'),
  ((SELECT id FROM clienti WHERE cognome='Conti'),    'task',     'Preparare demo personalizzata',      false, now()),
  ((SELECT id FROM clienti WHERE cognome='Bianchi'),  'email',    'Inviare fattura rinnovo',            true,  now() - interval '2 days'),
  ((SELECT id FROM clienti WHERE cognome='Gallo'),    'chiamata', 'Prima chiamata conoscitiva',         false, now() - interval '1 day'),
  ((SELECT id FROM clienti WHERE cognome='Ricci'),    'meeting',  'Presentazione offerta definitiva',   false, now()),
  ((SELECT id FROM clienti WHERE cognome='Rossi'),    'task',     'Aggiornare documentazione tecnica',  true,  now() - interval '5 days');
```

✅

---

## FASE 4 — DATI DEMO: DASHBOARD & ANALYTICS

```sql
-- ========================
-- INSERT: prodotti (6 record: 3 attivi, 2 preparazione, 1 sospeso)
-- ========================
INSERT INTO prodotti (nome, descrizione, categoria, stato, prezzo) VALUES
  ('CRM Base',         'Gestionale CRM per PMI, fino a 100 clienti',           'software',   'attivo',        990),
  ('CRM Premium',      'CRM avanzato con analytics e automazioni',              'software',   'attivo',       2490),
  ('Consulenza Setup', 'Onboarding e configurazione personalizzata del CRM',    'consulenza', 'attivo',        450),
  ('CRM Enterprise',   'Soluzione enterprise multi-utente con API custom',      'software',   'preparazione', 5900),
  ('Formazione Team',  'Corso di formazione 8h per team commerciale',           'formazione', 'preparazione',  380),
  ('Modulo Analytics', 'Add-on dashboard analytics avanzata',                   'software',   'sospeso',       290);

-- ========================
-- INSERT: vendite (6 record, cross-join clienti + prodotti)
-- ========================
INSERT INTO vendite (cliente_id, prodotto_id, importo, canale, data_vendita) VALUES
  ((SELECT id FROM clienti WHERE cognome='Bianchi'),  (SELECT id FROM prodotti WHERE nome='CRM Premium'),      2490, 'affiliate',       CURRENT_DATE - 5),
  ((SELECT id FROM clienti WHERE cognome='Rossi'),    (SELECT id FROM prodotti WHERE nome='CRM Base'),          990, 'direct_buy',      CURRENT_DATE - 12),
  ((SELECT id FROM clienti WHERE cognome='Ferretti'), (SELECT id FROM prodotti WHERE nome='Consulenza Setup'),  450, 'brand_ambassador', CURRENT_DATE - 8),
  ((SELECT id FROM clienti WHERE cognome='Ricci'),    (SELECT id FROM prodotti WHERE nome='CRM Premium'),      2490, 'affiliate',       CURRENT_DATE - 3),
  ((SELECT id FROM clienti WHERE cognome='Conti'),    (SELECT id FROM prodotti WHERE nome='Consulenza Setup'),  450, 'direct_buy',      CURRENT_DATE - 15),
  ((SELECT id FROM clienti WHERE cognome='Gallo'),    (SELECT id FROM prodotti WHERE nome='CRM Base'),          990, 'adsense',         CURRENT_DATE - 1);

-- ========================
-- INSERT: metriche_mensili 2024 (Feb–Dic, 3 tipi)
-- ========================
INSERT INTO metriche_mensili (anno, mese, tipo, valore) VALUES
  (2024,2,'product_insights',2),(2024,3,'product_insights',4),(2024,4,'product_insights',7),
  (2024,5,'product_insights',9),(2024,6,'product_insights',3),(2024,7,'product_insights',5),
  (2024,8,'product_insights',4),(2024,9,'product_insights',6),(2024,10,'product_insights',8),
  (2024,11,'product_insights',5),(2024,12,'product_insights',6),
  (2024,2,'visitors',180),(2024,3,'visitors',210),(2024,4,'visitors',290),
  (2024,5,'visitors',340),(2024,6,'visitors',330),(2024,7,'visitors',275),
  (2024,8,'visitors',260),(2024,9,'visitors',310),(2024,10,'visitors',350),
  (2024,11,'visitors',320),(2024,12,'visitors',290),
  (2024,2,'sales',3),(2024,3,'sales',4),(2024,4,'sales',8),
  (2024,5,'sales',10),(2024,6,'sales',6),(2024,7,'sales',5),
  (2024,8,'sales',4),(2024,9,'sales',7),(2024,10,'sales',9),
  (2024,11,'sales',7),(2024,12,'sales',8);

-- ========================
-- INSERT: programmi_marketing (4 canali)
-- Sales Category: Affiliate 48%, Direct Buy 33%, Brand Ambassador 12%, Adsense 7%
-- ========================
INSERT INTO programmi_marketing (nome, tipo, budget, prodotti_venduti, stato, data_inizio, data_fine) VALUES
  ('Affiliate Network Pro',   'affiliate',       12000, 2040, 'attivo',  '2024-01-01', '2024-12-31'),
  ('Direct Sales Campaign',   'direct_buy',       8500, 1403, 'attivo',  '2024-01-01', '2024-12-31'),
  ('Ambassador Program 2024', 'brand_ambassador', 4200,  510, 'attivo',  '2024-03-01', '2024-12-31'),
  ('Google Adsense Display',  'adsense',          1800,  298, 'sospeso', '2024-01-01', '2024-06-30');
```

✅

---

## FASE 5 — VERIFICA CONTEGGI

```sql
SELECT 'clienti'            AS tabella, COUNT(*) AS righe FROM clienti
UNION ALL
SELECT 'note',                           COUNT(*)          FROM note
UNION ALL
SELECT 'opportunita',                    COUNT(*)          FROM opportunita
UNION ALL
SELECT 'attivita',                       COUNT(*)          FROM attivita
UNION ALL
SELECT 'prodotti',                       COUNT(*)          FROM prodotti
UNION ALL
SELECT 'vendite',                        COUNT(*)          FROM vendite
UNION ALL
SELECT 'metriche_mensili',               COUNT(*)          FROM metriche_mensili
UNION ALL
SELECT 'programmi_marketing',            COUNT(*)          FROM programmi_marketing;
```

**Risultati attesi:**

| Tabella | Righe |
|---|---|
| clienti | 8 |
| note | 10 |
| opportunita | 8 |
| attivita | 8 |
| prodotti | 6 |
| vendite | 6 |
| metriche_mensili | 33 |
| programmi_marketing | 4 |

Se tutti i conteggi sono corretti → ✅ **Backend pronto.**

---

## SCHEMA RELAZIONI

```
clienti (1)──(N) note
clienti (1)──(N) opportunita
clienti (1)──(N) attivita
clienti (1)──(N) vendite
opportunita (1)──(N) attivita
prodotti (1)──(N) vendite
```

## NOTE TECNICHE

- **RLS disabilitato** su tutte le tabelle — ambiente demo
- In produzione: abilitare RLS e aggiungere policy per `auth.uid()`
- `ON DELETE CASCADE` su tutte le FK figlie di `clienti`
- I campi `stato` e `fase` usano `CHECK` constraints — valori non validi vengono rifiutati
- `metriche_mensili` ha un `UNIQUE(anno, mese, tipo)` per evitare duplicati
- Le `vendite` collegano `clienti` e `prodotti` tramite FK nullable (permettono record orfani)
