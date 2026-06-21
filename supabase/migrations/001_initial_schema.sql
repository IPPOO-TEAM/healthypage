-- ============================================================
-- Healthy Page – Schéma SQL complet
-- Migration : kv_store_7cbeffac (1 table) → 35 tables hp_*
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- Instance : https://essaisupabase.ippoo-aptdc.com
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. Table de fallback (compatibilité, clés inconnues)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kv_store_7cbeffac (
  key   TEXT    NOT NULL PRIMARY KEY,
  value JSONB   NOT NULL
);

-- ─────────────────────────────────────────────────────────────
-- 1. Patients (profil principal)
--    Clé KV : patient:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_patients (
  key        TEXT        PRIMARY KEY,   -- 'patient:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_patients_id      ON hp_patients ((value->>'id'));
CREATE INDEX IF NOT EXISTS idx_hp_patients_phone   ON hp_patients ((value->>'phone'));
CREATE INDEX IF NOT EXISTS idx_hp_patients_email   ON hp_patients ((value->>'email'));

-- ─────────────────────────────────────────────────────────────
-- 2. Contact d'urgence
--    Clé KV : patient:{id}:emergency
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_patient_emergency (
  key        TEXT        PRIMARY KEY,   -- 'patient:{id}:emergency'
  value      JSONB       NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 3. Consentements RGPD
--    Clé KV : patient:{id}:consents
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_patient_consents (
  key        TEXT        PRIMARY KEY,   -- 'patient:{id}:consents'
  value      JSONB       NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 4. Carnet de santé (lien / métadonnées)
--    Clé KV : patient:{id}:carnet
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_patient_carnet (
  key        TEXT        PRIMARY KEY,   -- 'patient:{id}:carnet'
  value      JSONB       NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 5. Rendez-vous
--    Clé KV : rdv:{patientId}:{rdvId}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_rdv (
  key        TEXT        PRIMARY KEY,   -- 'rdv:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_rdv_patient ON hp_rdv ((value->>'patientId'));
CREATE INDEX IF NOT EXISTS idx_hp_rdv_pro     ON hp_rdv ((value->>'proId'));
CREATE INDEX IF NOT EXISTS idx_hp_rdv_status  ON hp_rdv ((value->>'status'));
CREATE INDEX IF NOT EXISTS idx_hp_rdv_date    ON hp_rdv ((value->>'date'));

-- ─────────────────────────────────────────────────────────────
-- 6. Ordonnances (prescriptions)
--    Clé KV : ordonnance:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_ordonnances (
  key        TEXT        PRIMARY KEY,   -- 'ordonnance:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_ordonnances_patient ON hp_ordonnances ((value->>'patientId'));

-- ─────────────────────────────────────────────────────────────
-- 7. Traitements en cours
--    Clé KV : traitement:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_traitements (
  key        TEXT        PRIMARY KEY,   -- 'traitement:{pid}:{id}'
  value      JSONB       NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_traitements_patient ON hp_traitements ((value->>'patientId'));

-- ─────────────────────────────────────────────────────────────
-- 8. Notifications in-app
--    Clé KV : notification:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_notifications (
  key        TEXT        PRIMARY KEY,   -- 'notification:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_notifications_patient ON hp_notifications ((value->>'patientId'));
CREATE INDEX IF NOT EXISTS idx_hp_notifications_read    ON hp_notifications ((value->>'read'));
CREATE INDEX IF NOT EXISTS idx_hp_notifications_type    ON hp_notifications ((value->>'type'));

-- ─────────────────────────────────────────────────────────────
-- 9. Notes médicales / personnelles
--    Clé KV : note:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_notes (
  key        TEXT        PRIMARY KEY,   -- 'note:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_notes_patient ON hp_notes ((value->>'patientId'));

-- ─────────────────────────────────────────────────────────────
-- 10. Assistances juridiques / administratives
--     Clé KV : assistance:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_assistances (
  key        TEXT        PRIMARY KEY,   -- 'assistance:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_assistances_patient ON hp_assistances ((value->>'patientId'));

-- ─────────────────────────────────────────────────────────────
-- 11. Filleuls (parrainage)
--     Clé KV : filleul:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_filleuls (
  key        TEXT        PRIMARY KEY,   -- 'filleul:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_filleuls_patient ON hp_filleuls ((value->>'patientId'));

-- ─────────────────────────────────────────────────────────────
-- 12. Contributions financières
--     Clé KV : contribution:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_contributions (
  key        TEXT        PRIMARY KEY,   -- 'contribution:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_contributions_patient ON hp_contributions ((value->>'patientId'));

-- ─────────────────────────────────────────────────────────────
-- 13. Carnet familial / Diaspora
--     Clé KV : famille:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_famille (
  key        TEXT        PRIMARY KEY,   -- 'famille:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_famille_patient  ON hp_famille ((value->>'patientId'));
CREATE INDEX IF NOT EXISTS idx_hp_famille_diaspora ON hp_famille ((value->>'diaspora'));

-- ─────────────────────────────────────────────────────────────
-- 14. Suivi de croissance (pédiatrie)
--     Clé KV : growth:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_croissance (
  key        TEXT        PRIMARY KEY,   -- 'growth:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_croissance_patient ON hp_croissance ((value->>'patientId'));

-- ─────────────────────────────────────────────────────────────
-- 15. Journal alimentaire (repas)
--     Clé KV : meal:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_repas (
  key        TEXT        PRIMARY KEY,   -- 'meal:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_repas_patient ON hp_repas ((value->>'patientId'));

-- ─────────────────────────────────────────────────────────────
-- 16. Carnet vaccinal
--     Clé KV : vaccin:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_vaccins (
  key        TEXT        PRIMARY KEY,   -- 'vaccin:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_vaccins_patient  ON hp_vaccins ((value->>'patientId'));
CREATE INDEX IF NOT EXISTS idx_hp_vaccins_next_due ON hp_vaccins ((value->>'nextDueDate'));

-- ─────────────────────────────────────────────────────────────
-- 17. Profil santé (antécédents par section)
--     Clé KV : profilsante:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_profil_sante (
  key        TEXT        PRIMARY KEY,   -- 'profilsante:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_profil_sante_patient  ON hp_profil_sante ((value->>'patientId'));
CREATE INDEX IF NOT EXISTS idx_hp_profil_sante_section  ON hp_profil_sante ((value->>'section'));

-- ─────────────────────────────────────────────────────────────
-- 18. Ressentis / bien-être quotidien
--     Clé KV : ressenti:{patientId}:{date}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_ressentis (
  key        TEXT        PRIMARY KEY,   -- 'ressenti:{pid}:{date}'
  value      JSONB       NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_ressentis_patient ON hp_ressentis ((value->>'patientId'));
CREATE INDEX IF NOT EXISTS idx_hp_ressentis_date    ON hp_ressentis ((value->>'date'));

-- ─────────────────────────────────────────────────────────────
-- 19. Professionnels de santé
--     Clé KV : pro:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_pros (
  key        TEXT        PRIMARY KEY,   -- 'pro:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_pros_id        ON hp_pros ((value->>'id'));
CREATE INDEX IF NOT EXISTS idx_hp_pros_specialty ON hp_pros ((value->>'specialty'));
CREATE INDEX IF NOT EXISTS idx_hp_pros_city      ON hp_pros ((value->>'city'));
CREATE INDEX IF NOT EXISTS idx_hp_pros_name      ON hp_pros (lower(value->>'name'));

-- ─────────────────────────────────────────────────────────────
-- 20. Centres médicaux
--     Clé KV : centre:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_centres (
  key        TEXT        PRIMARY KEY,   -- 'centre:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_centres_name ON hp_centres (lower(value->>'name'));
CREATE INDEX IF NOT EXISTS idx_hp_centres_city ON hp_centres ((value->>'city'));

-- ─────────────────────────────────────────────────────────────
-- 21. Agenda pro (créneaux de consultation)
--     Clé KV : agendapro:{proId}:{slotId}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_agenda_pro (
  key        TEXT        PRIMARY KEY,   -- 'agendapro:{proId}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_agenda_pro_pro     ON hp_agenda_pro ((value->>'proId'));
CREATE INDEX IF NOT EXISTS idx_hp_agenda_pro_status  ON hp_agenda_pro ((value->>'status'));
CREATE INDEX IF NOT EXISTS idx_hp_agenda_pro_patient ON hp_agenda_pro ((value->>'patientId'));
CREATE INDEX IF NOT EXISTS idx_hp_agenda_pro_date    ON hp_agenda_pro ((value->>'date'));

-- ─────────────────────────────────────────────────────────────
-- 22. Messages (conversation pro ↔ patient)
--     Clé KV : message:{conversationId}:{messageId}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_messages (
  key        TEXT        PRIMARY KEY,   -- 'message:{conv}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_messages_conv ON hp_messages ((value->>'conversationId'));

-- ─────────────────────────────────────────────────────────────
-- 23. Paiements (Mobile Money, carte, virement)
--     Clé KV : payment:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_paiements (
  key        TEXT        PRIMARY KEY,   -- 'payment:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_paiements_patient ON hp_paiements ((value->>'patientId'));
CREATE INDEX IF NOT EXISTS idx_hp_paiements_status  ON hp_paiements ((value->>'status'));
CREATE INDEX IF NOT EXISTS idx_hp_paiements_method  ON hp_paiements ((value->>'method'));

-- ─────────────────────────────────────────────────────────────
-- 24. Avis sur les médecins
--     Clé KV : proReview:{proId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_reviews_pro (
  key        TEXT        PRIMARY KEY,   -- 'proReview:{proId}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_reviews_pro_pro    ON hp_reviews_pro ((value->>'proId'));
CREATE INDEX IF NOT EXISTS idx_hp_reviews_pro_rating ON hp_reviews_pro ((value->>'rating'));

-- ─────────────────────────────────────────────────────────────
-- 25. Avis sur les centres médicaux
--     Clé KV : centerReview:{centerId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_reviews_centre (
  key        TEXT        PRIMARY KEY,   -- 'centerReview:{cid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_reviews_centre_centre ON hp_reviews_centre ((value->>'centerId'));

-- ─────────────────────────────────────────────────────────────
-- 26. Liste d'attente (par praticien)
--     Clé KV : waitlist:{proId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_waitlist (
  key        TEXT        PRIMARY KEY,   -- 'waitlist:{proId}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_waitlist_pro     ON hp_waitlist ((value->>'proId'));
CREATE INDEX IF NOT EXISTS idx_hp_waitlist_patient ON hp_waitlist ((value->>'patientId'));

-- ─────────────────────────────────────────────────────────────
-- 27. Coffre-fort numérique (métadonnées – fichier chiffré dans Storage)
--     Clé KV : vault:{patientId}:{id}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_vault_docs (
  key        TEXT        PRIMARY KEY,   -- 'vault:{pid}:{id}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hp_vault_patient  ON hp_vault_docs ((value->>'patientId'));
CREATE INDEX IF NOT EXISTS idx_hp_vault_category ON hp_vault_docs ((value->>'category'));

-- ─────────────────────────────────────────────────────────────
-- 28. Feed podcast (liste des épisodes publiés, enregistrement singleton)
--     Clé KV : podcast:feed
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_podcast_feed (
  key        TEXT        PRIMARY KEY DEFAULT 'podcast:feed',
  value      JSONB       NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- Seed du singleton
INSERT INTO hp_podcast_feed (key, value) VALUES ('podcast:feed', '[]') ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 29. Transcriptions podcast (cache Whisper)
--     Clé KV : podcast:{episodeId}:transcript
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_podcast_transcripts (
  key        TEXT        PRIMARY KEY,   -- 'podcast:{episodeId}:transcript'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 30. État podcast par patient (favoris, historique, téléchargements)
--     Clé KV : patient:{id}:podcast-state
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_podcast_state (
  key        TEXT        PRIMARY KEY,   -- 'patient:{id}:podcast-state'
  value      JSONB       NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 31. Préférences notifications podcast par patient
--     Clé KV : patient:{id}:podcast-notif
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_podcast_notif (
  key        TEXT        PRIMARY KEY,   -- 'patient:{id}:podcast-notif'
  value      JSONB       NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 32. Codes OTP temporaires (auth par téléphone, TTL 5 min)
--     Clé KV : otp:{normalizedPhone}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_otp_store (
  key        TEXT        PRIMARY KEY,   -- 'otp:{phone}'
  value      JSONB       NOT NULL
);
-- Index partiel pour nettoyage des OTP expirés
CREATE INDEX IF NOT EXISTS idx_hp_otp_expires ON hp_otp_store (
  (to_timestamp((value->>'expiresAt')::bigint / 1000.0))
);

-- ─────────────────────────────────────────────────────────────
-- 33. Tokens de confirmation RDV par SMS (lien 1-clic)
--     Clé KV : rdvtoken:{token}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_rdv_tokens (
  key        TEXT        PRIMARY KEY,   -- 'rdvtoken:{token}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 34. Déduplication des rappels de RDV (J-1, H-2)
--     Clé KV : reminder:{pid}:{rdvId}:{kind}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_reminders_dedup (
  key        TEXT        PRIMARY KEY,   -- 'reminder:{pid}:{rdvId}:{kind}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 35. Déduplication des rappels de vaccins
--     Clé KV : vaccin-reminder:{pid}:{vaccinId}:{nextDueDate}
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hp_vaccin_reminders_dedup (
  key        TEXT        PRIMARY KEY,   -- 'vaccin-reminder:{pid}:{vaccinId}:{date}'
  value      JSONB       NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- Trigger utilitaire : met à jour updated_at automatiquement
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION hp_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'hp_patients', 'hp_patient_emergency', 'hp_patient_consents', 'hp_patient_carnet',
    'hp_rdv', 'hp_ordonnances', 'hp_traitements', 'hp_ressentis',
    'hp_vaccins', 'hp_pros', 'hp_centres', 'hp_agenda_pro',
    'hp_paiements', 'hp_podcast_feed', 'hp_podcast_state', 'hp_podcast_notif'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;
       CREATE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION hp_set_updated_at();',
      t, t, t, t
    );
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- Vue pratique : nombre de lignes par table (admin dashboard)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW hp_table_stats AS
SELECT 'hp_patients'              AS table_name, COUNT(*) AS row_count FROM hp_patients
UNION ALL SELECT 'hp_rdv',               COUNT(*) FROM hp_rdv
UNION ALL SELECT 'hp_ordonnances',       COUNT(*) FROM hp_ordonnances
UNION ALL SELECT 'hp_traitements',       COUNT(*) FROM hp_traitements
UNION ALL SELECT 'hp_notifications',     COUNT(*) FROM hp_notifications
UNION ALL SELECT 'hp_notes',             COUNT(*) FROM hp_notes
UNION ALL SELECT 'hp_assistances',       COUNT(*) FROM hp_assistances
UNION ALL SELECT 'hp_filleuls',          COUNT(*) FROM hp_filleuls
UNION ALL SELECT 'hp_contributions',     COUNT(*) FROM hp_contributions
UNION ALL SELECT 'hp_famille',           COUNT(*) FROM hp_famille
UNION ALL SELECT 'hp_croissance',        COUNT(*) FROM hp_croissance
UNION ALL SELECT 'hp_repas',             COUNT(*) FROM hp_repas
UNION ALL SELECT 'hp_vaccins',           COUNT(*) FROM hp_vaccins
UNION ALL SELECT 'hp_profil_sante',      COUNT(*) FROM hp_profil_sante
UNION ALL SELECT 'hp_ressentis',         COUNT(*) FROM hp_ressentis
UNION ALL SELECT 'hp_pros',              COUNT(*) FROM hp_pros
UNION ALL SELECT 'hp_centres',           COUNT(*) FROM hp_centres
UNION ALL SELECT 'hp_agenda_pro',        COUNT(*) FROM hp_agenda_pro
UNION ALL SELECT 'hp_messages',          COUNT(*) FROM hp_messages
UNION ALL SELECT 'hp_paiements',         COUNT(*) FROM hp_paiements
UNION ALL SELECT 'hp_reviews_pro',       COUNT(*) FROM hp_reviews_pro
UNION ALL SELECT 'hp_reviews_centre',    COUNT(*) FROM hp_reviews_centre
UNION ALL SELECT 'hp_waitlist',          COUNT(*) FROM hp_waitlist
UNION ALL SELECT 'hp_vault_docs',        COUNT(*) FROM hp_vault_docs
UNION ALL SELECT 'hp_podcast_transcripts',COUNT(*) FROM hp_podcast_transcripts
UNION ALL SELECT 'hp_podcast_state',     COUNT(*) FROM hp_podcast_state
UNION ALL SELECT 'hp_otp_store',         COUNT(*) FROM hp_otp_store
UNION ALL SELECT 'hp_rdv_tokens',        COUNT(*) FROM hp_rdv_tokens
UNION ALL SELECT 'hp_reminders_dedup',   COUNT(*) FROM hp_reminders_dedup
UNION ALL SELECT 'hp_vaccin_reminders_dedup', COUNT(*) FROM hp_vaccin_reminders_dedup;
