# 🥤 Centrifughe & Estratti

Web-app elegante e **installabile (PWA)** per scoprire **quali centrifughe/estratti puoi preparare** con gli ingredienti che hai in casa. Funziona su **computer, tablet e smartphone (iPhone e Android)**.

- ✅ Seleziona gli ingredienti che possiedi → l'app mostra le ricette **che puoi preparare ora**, quelle a cui **manca un solo ingrediente** e **tutte le ricette**.
- ✅ 38 ricette ragionate, normalizzate per **~600 ml**, con **valori nutrizionali stimati**, micronutrienti, benefici e preparazione.
- ✅ Ricerca, filtri, ordinamenti, **preferiti**, **selettore porzione** (300–1200 ml), pulsante **Sorprendimi**.
- ✅ **Nessuna registrazione richiesta.** Preferiti e selezioni salvati sul dispositivo (localStorage).
- ✅ **Zero build**: è un sito statico. Si pubblica su Netlify senza compilare nulla.
- ✅ **Supabase opzionale**: l'app funziona già con i dati inclusi; puoi collegarla a Supabase quando vuoi.

> **Nota importante sui dati.** I valori nutrizionali sono **stime a scopo informativo** e non sostituiscono un consulto medico o nutrizionale. Le proprietà indicate sono di natura **nutrizionale, non terapeutica**. Nel passaggio a succo gran parte della **fibra** viene rimossa con la polpa.

---

## 📁 Struttura del progetto

```
centrifughe-app/
├── index.html                # pagina principale
├── manifest.webmanifest      # configurazione PWA (nome, icone, colori)
├── sw.js                     # service worker (funzionamento offline)
├── config.js                 # config Supabase (vuota = usa i dati locali)
├── config.example.js         # esempio di configurazione
├── netlify.toml              # configurazione deploy Netlify
├── package.json              # metadati (facoltativo, per chi ha Node)
├── .env.example              # riferimento nomi variabili
├── .gitignore
├── README.md                 # questo file
├── assets/
│   ├── css/styles.css        # stile
│   ├── icons/                # icone PWA (PNG/SVG)
│   └── js/
│       ├── data/             # DATI: ingredienti, ricette, micronutrienti
│       ├── lib/              # logica: storage, calcoli, provider dati
│       └── app.js            # applicazione
└── supabase/
    ├── schema.sql            # creazione tabelle
    ├── policies.sql          # sicurezza (Row Level Security)
    └── seed.sql              # dati iniziali (ingredienti + 38 ricette)
```

---

## 1) Prerequisiti

Per **pubblicare online** ti servono solo tre account **gratuiti**:

- **GitHub** → https://github.com (per conservare il codice)
- **Netlify** → https://netlify.com (per pubblicare il sito)
- **Supabase** → https://supabase.com (**facoltativo**, solo se vuoi usare il database)

Per lavorare in **locale** (facoltativo) è comodo avere [Git](https://git-scm.com/downloads). Non è necessario installare Node.js.

---

## 2) Provare l'app in locale (facoltativo)

L'app è un sito statico. Il modo più semplice per vederla sul tuo computer:

**Con Python** (spesso già presente su Windows/Mac):
```bash
cd centrifughe-app
python -m http.server 8100
```
Poi apri il browser su **http://localhost:8100**

**Oppure con Node** (se lo hai installato):
```bash
cd centrifughe-app
npm start
```

> ⚠️ Non aprire `index.html` con un doppio clic (percorso `file://`): alcune funzioni (service worker/PWA) richiedono un piccolo server come sopra. Per il semplice test dell'interfaccia funziona comunque, ma è meglio usare il server locale.

A questo punto l'app funziona **già completamente**, con tutte le 38 ricette: Supabase non è necessario.

---

## 3) (Facoltativo) Creare il database su Supabase

Serve solo se vuoi gestire ricette/ingredienti da un database in cloud. **Puoi saltare questo passaggio**: l'app funziona anche senza.

### 3.1 Crea il progetto
1. Vai su https://supabase.com → **New project**.
2. Scegli un nome, una password del database e una region vicina a te. Attendi qualche minuto.

### 3.2 Crea le tabelle ed esegui gli script SQL
1. Nel progetto Supabase apri **SQL Editor** (menu a sinistra) → **New query**.
2. Esegui gli script **in quest'ordine**, copiando il contenuto di ciascun file e premendo **Run**:
   1. `supabase/schema.sql`  → crea le tabelle
   2. `supabase/policies.sql` → imposta la sicurezza (lettura pubblica, scrittura protetta)
   3. `supabase/seed.sql`    → inserisce ingredienti e le 38 ricette

### 3.3 Prendi URL e chiave pubblica
1. In Supabase apri **Project Settings → API**.
2. Copia:
   - **Project URL** (es. `https://xxxxxxxx.supabase.co`)
   - **anon public** key (chiave pubblica, sicura da esporre)

> 🔒 **Non usare mai** la chiave **`service_role`** nel sito/frontend o nel repository. Solo la **anon public** key va nel frontend; le policy RLS proteggono i dati.

### 3.4 Attiva Supabase nell'app
Apri il file **`config.js`** e inserisci i valori:
```js
window.APP_CONFIG = {
  supabaseUrl: "https://xxxxxxxx.supabase.co",
  supabaseAnonKey: "eyJhbGciOi...",   // la chiave anon public
};
```
Salva. Se i valori sono validi l'app caricherà i dati da Supabase; in caso di problemi **ricade automaticamente** sui dati locali (in fondo alla pagina vedrai "dati: Supabase" o "dati: locali").

---

## 4) Caricare il progetto su GitHub

Apri un terminale nella cartella `centrifughe-app` ed esegui:

```bash
git init
git add .
git commit -m "Prima versione Centrifughe & Estratti"
```

Crea un nuovo repository **vuoto** su GitHub (https://github.com/new), NON aggiungere README/licenza. Poi collega e invia il codice (sostituisci `TUO-UTENTE` e `NOME-REPO`):

```bash
git branch -M main
git remote add origin https://github.com/TUO-UTENTE/NOME-REPO.git
git push -u origin main
```

---

## 5) Pubblicare su Netlify

1. Vai su https://app.netlify.com → **Add new site → Import an existing project**.
2. Scegli **GitHub** e autorizza; seleziona il repository appena creato.
3. Impostazioni di build (di solito rilevate in automatico dal file `netlify.toml`):
   - **Build command**: *(lasciare vuoto)*
   - **Publish directory**: `.` (la cartella del progetto)
4. Premi **Deploy**. Dopo qualche secondo avrai un indirizzo tipo `https://nome-a-caso.netlify.app`.
5. (Facoltativo) In **Site configuration → Change site name** puoi scegliere un nome più bello.

### 5.1 Environment variables su Netlify (solo se usi Supabase)
Questa app è "zero build", quindi la configurazione Supabase attiva è nel file **`config.js`** (vedi passo 3.4): **non** servono variabili d'ambiente su Netlify.

Se in futuro aggiungerai un passo di build, i nomi di riferimento delle variabili sono in `.env.example`
(`SUPABASE_URL`, `SUPABASE_ANON_KEY`), da impostare in **Site configuration → Environment variables**.

---

## 6) Usare l'app da iPhone / Android (installazione)

**iPhone (Safari):**
1. Apri il sito Netlify in **Safari**.
2. Tocca l'icona **Condividi** (quadrato con freccia).
3. Scegli **“Aggiungi alla schermata Home”** → **Aggiungi**.
4. L'app comparirà come icona a sé, a schermo intero.

**Android (Chrome):**
1. Apri il sito in **Chrome**.
2. Comparirà un banner **“Installa”**, oppure menu **⋮ → Installa app / Aggiungi a schermata Home**.

---

## 7) Aggiornare il sito dopo modifiche future

Ogni volta che modifichi qualcosa (es. aggiungi una ricetta in `assets/js/data/recipes.js`):

```bash
git add .
git commit -m "Descrizione della modifica"
git push
```

Netlify **ripubblica automaticamente** il sito a ogni `push`. 🎉

> Se sul telefono non vedi subito le novità, è la cache della PWA: chiudi e riapri l'app, oppure ricarica la pagina. Il service worker si aggiorna da solo alla riapertura.

---

## 8) Come aggiungere o modificare una ricetta

- **Solo dati locali:** modifica `assets/js/data/recipes.js` (ogni ricetta è un oggetto ben commentato) e fai `git push`.
- **Con Supabase:** modifica le righe nella tabella `recipes` / `recipe_ingredients` dal pannello Supabase (**Table editor**). Le nuove ricette compaiono automaticamente.

Struttura minima di una ricetta:
```js
{
  slug: "id-univoco",
  name: "Nome", subtitle: "Ingr · Ingr", description: "…",
  color_primary: "#RRGGBB", color_secondary: "#RRGGBB",
  ingredients: [ { slug: "mela", grams: 400, qty: "~3 mele" } ],
  nutrition: { kcal: 200, carbs: 46, sugars: 38, fiber: 3, protein: 2, fat: 0.5 },
  micronutrients: ["vitamina_c", "potassio"],   // chiavi da micronutrients.js
  benefits: ["Buona fonte di vitamina C"],
  tags: ["fresca", "agrumata"],
  preparation: "Lavare, sbucciare gli agrumi…"
}
```

---

## 9) Sicurezza (Supabase)

- Nel frontend si usa **solo** la **anon public** key. La `service_role` key **non** deve mai finire nel sito o nel repo.
- La **Row Level Security** è attiva: ricette/ingredienti sono in **sola lettura** per il client; nessuna scrittura è possibile con la anon key.
- I preferiti anonimi restano **sul dispositivo** (localStorage). La tabella `favorites` è predisposta per un futuro login (ogni utente vede solo i propri).

---

## 10) Autenticazione (per il futuro)

La prima versione **non richiede login**. Il progetto è però predisposto: puoi in seguito attivare in Supabase **email / magic link / Google** e salvare i preferiti nella tabella `favorites` (policy già pronte in `policies.sql`).

---

## 11) Test consigliati (già verificati)

| # | Scenario | Atteso |
|---|----------|--------|
| 1 | Seleziono Mela + Carota + Zenzero | Compare **Classico Dorato** in “Puoi preparare” (100%) |
| 2 | Ricetta Mela+Carota+Limone, ho solo Mela+Carota | “**Ti manca: Limone**” |
| 3 | Ricetta con ingrediente mancante | **Non** appare tra quelle 100% disponibili |
| 4 | Pulsante “Tutte le ricette” | Mostra l'intero database |
| 5 | Cerco “finocchio” | Appaiono tutte le ricette che lo contengono |
| 6 | Aggiungo un preferito e riapro l'app | Il preferito resta salvato |
| 7 | Seleziono ingredienti e ricarico | La selezione resta salvata |
| 8 | Da 600 a 300 ml | Grammi, kcal e macro **dimezzati** |
| 9 | Deploy Netlify | Il sito funziona online |
| 10 | Larghezze iPhone | Layout a una colonna, pulsanti grandi |

---

## 12) Risoluzione problemi (troubleshooting)

- **La pagina è bianca / le ricette non compaiono.** Apri con un server locale (passo 2), non con `file://`. Controlla la console del browser (F12) per eventuali errori.
- **In fondo vedo “dati: locali” anche se ho messo Supabase.** URL o chiave in `config.js` errati, tabelle non create o policy mancanti: riesegui `schema.sql` → `policies.sql` → `seed.sql`. L'app comunque **continua a funzionare** con i dati locali.
- **Errore “permission denied” o nessun dato da Supabase.** Manca la lettura pubblica: esegui `policies.sql`.
- **Su Netlify il sito è vuoto.** Verifica che **Publish directory** sia `.` e **Build command** vuoto.
- **Su iPhone non vedo gli aggiornamenti.** È la cache PWA: chiudi e riapri l'app; il service worker si aggiorna alla riapertura.
- **Le icone dell'app non si vedono.** Assicurati che la cartella `assets/icons/` sia stata caricata su GitHub.

---

## 13) Fonti dei dati

Per le informazioni nutrizionali sono state usate come riferimento fonti istituzionali (**USDA FoodData Central**, **CREA**, **EFSA**, **NIH**). Le combinazioni delle ricette derivano dal confronto di più fonti di settore, valutate criticamente. I valori sono **stime**: variano con varietà, maturazione e resa dell'estrattore.

---

## ✅ Checklist rapida

- **PASSO 1 → Supabase** *(facoltativo)*: crea progetto → esegui `schema.sql`, `policies.sql`, `seed.sql` → copia URL + anon key in `config.js`.
- **PASSO 2 → GitHub**: `git init` → `git add .` → `git commit` → crea repo → `git remote add origin …` → `git push`.
- **PASSO 3 → Netlify**: importa il repo → build vuoto, publish `.` → Deploy.
- **PASSO 4 → Test da iPhone**: apri il sito Netlify in Safari e prova selezione/ricette.
- **PASSO 5 → Aggiungi alla schermata Home**: Condividi → “Aggiungi alla schermata Home”.

Buone centrifughe! 🥕🍎🫚
