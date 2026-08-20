/**
 * Configurazione Supabase (OPZIONALE).
 *
 * L'app funziona perfettamente anche senza Supabase, usando i dati inclusi nel codice.
 * Se vuoi caricare ricette e ingredienti dal tuo database Supabase:
 *   1. copia questo file in "config.js"
 *   2. inserisci qui sotto l'URL del progetto e la chiave anon (pubblica)
 *
 * Usa SOLO la anon/public key: NON inserire mai la service_role key nel frontend.
 * La anon key è pensata per essere pubblica; le policy RLS proteggono i dati.
 */
window.APP_CONFIG = {
  supabaseUrl: "",       // es. "https://xxxxxxxx.supabase.co"
  supabaseAnonKey: "",   // es. "eyJhbGciOi..." (chiave anon/public)
};
