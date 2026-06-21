/**
 * kv_store.tsx – Routeur KV intelligent pour Healthy Page
 *
 * Au lieu d'une table générique, chaque clé est routée vers la bonne table
 * SQL selon son préfixe. L'API publique reste identique à l'original :
 *   set / get / del / mset / mget / mdel / getByPrefix
 *
 * Format des clés :
 *   patient:{id}                      → hp_patients
 *   patient:{id}:emergency            → hp_patient_emergency
 *   patient:{id}:consents             → hp_patient_consents
 *   patient:{id}:carnet               → hp_patient_carnet
 *   patient:{id}:podcast-state        → hp_podcast_state
 *   patient:{id}:podcast-notif        → hp_podcast_notif
 *   rdv:{pid}:{id}                    → hp_rdv
 *   ordonnance:{pid}:{id}             → hp_ordonnances
 *   traitement:{pid}:{id}             → hp_traitements
 *   notification:{pid}:{id}           → hp_notifications
 *   note:{pid}:{id}                   → hp_notes
 *   assistance:{pid}:{id}             → hp_assistances
 *   filleul:{pid}:{id}                → hp_filleuls
 *   contribution:{pid}:{id}           → hp_contributions
 *   famille:{pid}:{id}                → hp_famille
 *   growth:{pid}:{id}                 → hp_croissance
 *   meal:{pid}:{id}                   → hp_repas
 *   vaccin-reminder:{pid}:{vid}:{dt}  → hp_vaccin_reminders_dedup
 *   vaccin:{pid}:{id}                 → hp_vaccins
 *   profilsante:{pid}:{id}            → hp_profil_sante
 *   ressenti:{pid}:{date}             → hp_ressentis
 *   pro:{id}                          → hp_pros
 *   centre:{id}                       → hp_centres
 *   agendapro:{proId}:{slotId}        → hp_agenda_pro
 *   message:{conv}:{id}               → hp_messages
 *   payment:{pid}:{id}                → hp_paiements
 *   proReview:{proId}:{id}            → hp_reviews_pro
 *   centerReview:{cid}:{id}           → hp_reviews_centre
 *   waitlist:{proId}:{id}             → hp_waitlist
 *   vault:{pid}:{id}                  → hp_vault_docs
 *   podcast:feed                      → hp_podcast_feed
 *   podcast:{episodeId}:transcript    → hp_podcast_transcripts
 *   otp:{phone}                       → hp_otp_store
 *   rdvtoken:{token}                  → hp_rdv_tokens
 *   reminder:{pid}:{rdvId}:{kind}     → hp_reminders_dedup
 *   <inconnu>                         → kv_store_7cbeffac  (fallback)
 */

import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// ─────────────────────────────────────────────────────────────────────────────
// Client Supabase (service role – accès complet)
// ─────────────────────────────────────────────────────────────────────────────
const client = () =>
  createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

// ─────────────────────────────────────────────────────────────────────────────
// Routeur : clé → table
// L'ordre des conditions est important (plus spécifique en premier).
// ─────────────────────────────────────────────────────────────────────────────
function tableFor(key: string): string {
  // Patient + sous-enregistrements (check suffixe avant préfixe générique)
  if (key.startsWith("patient:")) {
    if (key.endsWith(":emergency"))    return "hp_patient_emergency";
    if (key.endsWith(":consents"))     return "hp_patient_consents";
    if (key.endsWith(":carnet"))       return "hp_patient_carnet";
    if (key.endsWith(":podcast-state")) return "hp_podcast_state";
    if (key.endsWith(":podcast-notif")) return "hp_podcast_notif";
    return "hp_patients";
  }

  // Domaines patient-scoped
  if (key.startsWith("rdv:"))          return "hp_rdv";
  if (key.startsWith("ordonnance:"))   return "hp_ordonnances";
  if (key.startsWith("traitement:"))   return "hp_traitements";
  if (key.startsWith("notification:")) return "hp_notifications";
  if (key.startsWith("note:"))         return "hp_notes";
  if (key.startsWith("assistance:"))   return "hp_assistances";
  if (key.startsWith("filleul:"))      return "hp_filleuls";
  if (key.startsWith("contribution:")) return "hp_contributions";
  if (key.startsWith("famille:"))      return "hp_famille";
  if (key.startsWith("growth:"))       return "hp_croissance";
  if (key.startsWith("meal:"))         return "hp_repas";
  // ⚠️  vaccin-reminder avant vaccin (préfixe plus long en premier)
  if (key.startsWith("vaccin-reminder:")) return "hp_vaccin_reminders_dedup";
  if (key.startsWith("vaccin:"))       return "hp_vaccins";
  if (key.startsWith("profilsante:"))  return "hp_profil_sante";
  if (key.startsWith("ressenti:"))     return "hp_ressentis";

  // Entités globales
  if (key.startsWith("pro:"))          return "hp_pros";
  if (key.startsWith("centre:"))       return "hp_centres";
  if (key.startsWith("agendapro:"))    return "hp_agenda_pro";
  if (key.startsWith("message:"))      return "hp_messages";
  if (key.startsWith("payment:"))      return "hp_paiements";
  if (key.startsWith("proReview:"))    return "hp_reviews_pro";
  if (key.startsWith("centerReview:")) return "hp_reviews_centre";
  if (key.startsWith("waitlist:"))     return "hp_waitlist";
  if (key.startsWith("vault:"))        return "hp_vault_docs";

  // Podcast
  if (key === "podcast:feed")          return "hp_podcast_feed";
  if (key.startsWith("podcast:"))      return "hp_podcast_transcripts";

  // Auth / temporaire
  if (key.startsWith("otp:"))          return "hp_otp_store";
  if (key.startsWith("rdvtoken:"))     return "hp_rdv_tokens";
  if (key.startsWith("reminder:"))     return "hp_reminders_dedup";

  // Fallback (ne devrait pas arriver en production)
  console.warn(`[kv_router] préfixe inconnu → fallback: ${key}`);
  return "kv_store_7cbeffac";
}

/**
 * tableForPrefix : identique à tableFor mais pour les appels getByPrefix.
 * Le préfixe se termine toujours par ':' sauf pour les clés exactes.
 */
function tableForPrefix(prefix: string): string {
  // Clé exacte singleton
  if (prefix === "podcast:feed") return "hp_podcast_feed";

  // Patient sous-tables (cas rares mais gérés)
  if (prefix.startsWith("patient:")) {
    if (prefix.includes(":emergency")) return "hp_patient_emergency";
    if (prefix.includes(":consents"))  return "hp_patient_consents";
    if (prefix.includes(":carnet"))    return "hp_patient_carnet";
    return "hp_patients";
  }

  if (prefix.startsWith("rdv:"))          return "hp_rdv";
  if (prefix.startsWith("ordonnance:"))   return "hp_ordonnances";
  if (prefix.startsWith("traitement:"))   return "hp_traitements";
  if (prefix.startsWith("notification:")) return "hp_notifications";
  if (prefix.startsWith("note:"))         return "hp_notes";
  if (prefix.startsWith("assistance:"))   return "hp_assistances";
  if (prefix.startsWith("filleul:"))      return "hp_filleuls";
  if (prefix.startsWith("contribution:")) return "hp_contributions";
  if (prefix.startsWith("famille:"))      return "hp_famille";
  if (prefix.startsWith("growth:"))       return "hp_croissance";
  if (prefix.startsWith("meal:"))         return "hp_repas";
  if (prefix.startsWith("vaccin-reminder:")) return "hp_vaccin_reminders_dedup";
  if (prefix.startsWith("vaccin:"))       return "hp_vaccins";
  if (prefix.startsWith("profilsante:"))  return "hp_profil_sante";
  if (prefix.startsWith("ressenti:"))     return "hp_ressentis";

  if (prefix.startsWith("pro:"))          return "hp_pros";
  if (prefix.startsWith("centre:"))       return "hp_centres";
  if (prefix.startsWith("agendapro:"))    return "hp_agenda_pro";
  if (prefix.startsWith("message:"))      return "hp_messages";
  if (prefix.startsWith("payment:"))      return "hp_paiements";
  if (prefix.startsWith("proReview:"))    return "hp_reviews_pro";
  if (prefix.startsWith("centerReview:")) return "hp_reviews_centre";
  if (prefix.startsWith("waitlist:"))     return "hp_waitlist";
  if (prefix.startsWith("vault:"))        return "hp_vault_docs";
  if (prefix.startsWith("podcast:"))      return "hp_podcast_transcripts";
  if (prefix.startsWith("otp:"))          return "hp_otp_store";
  if (prefix.startsWith("rdvtoken:"))     return "hp_rdv_tokens";
  if (prefix.startsWith("reminder:"))     return "hp_reminders_dedup";

  console.warn(`[kv_router] préfixe inconnu → fallback: ${prefix}`);
  return "kv_store_7cbeffac";
}

// ─────────────────────────────────────────────────────────────────────────────
// API publique
// ─────────────────────────────────────────────────────────────────────────────

/** Stocke une valeur JSON associée à une clé. */
export const set = async (key: string, value: any): Promise<void> => {
  const { error } = await client().from(tableFor(key)).upsert({ key, value });
  if (error) throw new Error(`kv.set("${key}"): ${error.message}`);
};

/** Récupère la valeur associée à une clé (null si absente). */
export const get = async (key: string): Promise<any> => {
  const { data, error } = await client()
    .from(tableFor(key))
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw new Error(`kv.get("${key}"): ${error.message}`);
  return data?.value ?? null;
};

/** Supprime la paire clé-valeur. */
export const del = async (key: string): Promise<void> => {
  const { error } = await client().from(tableFor(key)).delete().eq("key", key);
  if (error) throw new Error(`kv.del("${key}"): ${error.message}`);
};

/**
 * Récupère plusieurs clés en une fois.
 * Les clés peuvent appartenir à des tables différentes.
 * Retourne les valeurs dans le même ordre que les clés d'entrée (null si absent).
 */
export const mget = async (keys: string[]): Promise<any[]> => {
  if (keys.length === 0) return [];
  const supabase = client();

  // Regrouper les clés par table
  const byTable = new Map<string, string[]>();
  for (const key of keys) {
    const t = tableFor(key);
    if (!byTable.has(t)) byTable.set(t, []);
    byTable.get(t)!.push(key);
  }

  // Requête parallèle sur chaque table
  const resultMap = new Map<string, any>();
  await Promise.all(
    [...byTable.entries()].map(async ([table, tKeys]) => {
      const { data, error } = await supabase
        .from(table)
        .select("key, value")
        .in("key", tKeys);
      if (error) throw new Error(`kv.mget table=${table}: ${error.message}`);
      for (const row of data ?? []) resultMap.set(row.key, row.value);
    }),
  );

  // Restituer dans l'ordre original
  return keys.map((k) => resultMap.get(k) ?? null);
};

/**
 * Stocke plusieurs paires clé-valeur.
 * Les clés peuvent appartenir à des tables différentes.
 */
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  if (keys.length === 0) return;
  const supabase = client();

  const byTable = new Map<string, Array<{ key: string; value: any }>>();
  for (let i = 0; i < keys.length; i++) {
    const t = tableFor(keys[i]);
    if (!byTable.has(t)) byTable.set(t, []);
    byTable.get(t)!.push({ key: keys[i], value: values[i] });
  }

  await Promise.all(
    [...byTable.entries()].map(async ([table, rows]) => {
      const { error } = await supabase.from(table).upsert(rows);
      if (error) throw new Error(`kv.mset table=${table}: ${error.message}`);
    }),
  );
};

/**
 * Supprime plusieurs clés.
 * Les clés peuvent appartenir à des tables différentes.
 */
export const mdel = async (keys: string[]): Promise<void> => {
  if (keys.length === 0) return;
  const supabase = client();

  const byTable = new Map<string, string[]>();
  for (const key of keys) {
    const t = tableFor(key);
    if (!byTable.has(t)) byTable.set(t, []);
    byTable.get(t)!.push(key);
  }

  await Promise.all(
    [...byTable.entries()].map(async ([table, tKeys]) => {
      const { error } = await supabase.from(table).delete().in("key", tKeys);
      if (error) throw new Error(`kv.mdel table=${table}: ${error.message}`);
    }),
  );
};

/**
 * Récupère toutes les valeurs dont la clé commence par un préfixe.
 * Le préfixe détermine la table à interroger.
 */
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const table = tableForPrefix(prefix);
  const { data, error } = await client()
    .from(table)
    .select("key, value")
    .like("key", prefix + "%");
  if (error) throw new Error(`kv.getByPrefix("${prefix}"): ${error.message}`);
  return (data ?? []).map((d) => d.value);
};