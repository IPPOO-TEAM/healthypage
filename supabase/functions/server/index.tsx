import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const BASE = "/make-server-7cbeffac";

// Logical "tables" via key prefixes:
//   patient:{id}                        -> patient profile
//   patient:{id}:emergency              -> emergency contact
//   patient:{id}:carnet                 -> health booklet link
//   patient:{id}:consents               -> consent record
//   rdv:{patientId}:{rdvId}             -> appointment
//   ordonnance:{patientId}:{ordoId}     -> prescription
//   traitement:{patientId}:{medId}      -> ongoing treatment
//   ressenti:{patientId}:{date}         -> daily wellbeing score
//   notification:{patientId}:{notifId}  -> notification
//   pro:{proId}                         -> health professional
//   centre:{centreId}                   -> medical center

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const ok = (data: unknown) => ({ ok: true, data });
const err = (message: string, status = 400) => ({ ok: false, error: message, status });

// ---------- Health ----------
app.get(`${BASE}/health`, (c) => c.json({ status: "ok" }));

// ---------- Storage (avatars) ----------
const PHOTO_BUCKET = "make-7cbeffac-photos";
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

async function ensurePhotoBucket() {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === PHOTO_BUCKET);
    if (!exists) await supabaseAdmin.storage.createBucket(PHOTO_BUCKET, { public: false });
  } catch (e) {
    console.log(`Bucket init failed: ${e}`);
  }
}
ensurePhotoBucket();

function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; contentType: string } | null {
  const m = /^data:([^;,]+)(;base64)?,(.*)$/i.exec(dataUrl);
  if (!m) return null;
  const contentType = m[1] || "application/octet-stream";
  const isB64 = !!m[2];
  const payload = m[3] ?? "";
  const bin = isB64 ? atob(payload) : decodeURIComponent(payload);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, contentType };
}

app.post(`${BASE}/photos`, async (c) => {
  try {
    const { kind, ownerId, dataUrl } = await c.req.json();
    if (!ownerId || !dataUrl || !kind) return c.json(err("ownerId, kind, dataUrl required"), 400);
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return c.json(err("dataUrl must be a base64 image data URL"), 400);
    }
    const decoded = decodeDataUrl(dataUrl);
    if (!decoded) return c.json(err("Invalid data URL"), 400);
    if (decoded.bytes.byteLength > 3 * 1024 * 1024) {
      return c.json(err(`Image too large after decode: ${decoded.bytes.byteLength} bytes`), 413);
    }
    const ext = decoded.contentType.split("/")[1]?.split("+")[0] ?? "jpg";
    const path = `${kind}/${ownerId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from(PHOTO_BUCKET)
      .upload(path, decoded.bytes, { contentType: decoded.contentType, upsert: true });
    if (upErr) return c.json(err(`Upload failed: ${upErr.message}`), 500);
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from(PHOTO_BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signErr || !signed?.signedUrl) {
      return c.json(err(`Sign URL failed: ${signErr?.message ?? "unknown"}`), 500);
    }
    return c.json(ok({ path, url: signed.signedUrl }));
  } catch (e) {
    console.log(`Photo upload error: ${e}`);
    return c.json(err(`Photo upload failed: ${e}`), 500);
  }
});

// ---------- Coffre-fort de documents (chiffré AES-GCM côté serveur) ----------
const VAULT_BUCKET = "make-7cbeffac-vault";

async function ensureVaultBucket() {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === VAULT_BUCKET);
    if (!exists) await supabaseAdmin.storage.createBucket(VAULT_BUCKET, { public: false });
  } catch (e) {
    console.log(`Vault bucket init failed: ${e}`);
  }
}
ensureVaultBucket();

let _vaultKeyPromise: Promise<CryptoKey> | null = null;
async function getVaultKey(): Promise<CryptoKey> {
  if (!_vaultKeyPromise) {
    _vaultKeyPromise = (async () => {
      const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "healthy-page-vault-fallback-key";
      const seed = new TextEncoder().encode(`hp-vault-v1::${secret}`);
      const hash = await crypto.subtle.digest("SHA-256", seed);
      return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    })();
  }
  return _vaultKeyPromise;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

app.post(`${BASE}/patients/:pid/vault`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const { name, dataUrl, category, notes } = await c.req.json();
    if (!name || !dataUrl) return c.json(err("name & dataUrl requis"), 400);
    const decoded = decodeDataUrl(dataUrl);
    if (!decoded) return c.json(err("dataUrl invalide"), 400);
    if (decoded.bytes.byteLength > 8 * 1024 * 1024) return c.json(err("Document > 8 Mo"), 413);

    const key = await getVaultKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, decoded.bytes));

    const id = uid();
    const path = `${pid}/${id}.bin`;
    const { error: upErr } = await supabaseAdmin.storage
      .from(VAULT_BUCKET)
      .upload(path, cipher, { contentType: "application/octet-stream", upsert: false });
    if (upErr) return c.json(err(`Upload chiffré échoué: ${upErr.message}`), 500);

    const record = {
      id,
      patientId: pid,
      name: String(name).slice(0, 200),
      category: category ? String(category).slice(0, 60) : "",
      notes: notes ? String(notes).slice(0, 500) : "",
      mime: decoded.contentType,
      size: decoded.bytes.byteLength,
      iv: bytesToBase64(iv),
      path,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`vault:${pid}:${id}`, record);
    return c.json(ok({ id, name: record.name, category: record.category, notes: record.notes, mime: record.mime, size: record.size, createdAt: record.createdAt }));
  } catch (e) {
    return c.json(err(`vault upload failed: ${e}`), 500);
  }
});

app.get(`${BASE}/patients/:pid/vault`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const list: any[] = (await kv.getByPrefix(`vault:${pid}:`)) ?? [];
    const safe = list.map((r) => ({
      id: r.id, name: r.name, category: r.category, notes: r.notes,
      mime: r.mime, size: r.size, createdAt: r.createdAt,
    }));
    return c.json(ok(safe));
  } catch (e) { return c.json(err(`vault list failed: ${e}`), 500); }
});

app.get(`${BASE}/patients/:pid/vault/:id/content`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const id = c.req.param("id");
    const record: any = await kv.get(`vault:${pid}:${id}`);
    if (!record) return c.json(err("document introuvable", 404), 404);
    const { data: blob, error } = await supabaseAdmin.storage.from(VAULT_BUCKET).download(record.path);
    if (error || !blob) return c.json(err(`download échoué: ${error?.message ?? "vide"}`), 500);
    const cipher = new Uint8Array(await blob.arrayBuffer());
    const key = await getVaultKey();
    const iv = base64ToBytes(record.iv);
    const plain = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher));
    return c.json(ok({
      name: record.name,
      mime: record.mime,
      size: record.size,
      base64: bytesToBase64(plain),
    }));
  } catch (e) { return c.json(err(`vault content failed: ${e}`), 500); }
});

app.delete(`${BASE}/patients/:pid/vault/:id`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const id = c.req.param("id");
    const record: any = await kv.get(`vault:${pid}:${id}`);
    if (record?.path) {
      await supabaseAdmin.storage.from(VAULT_BUCKET).remove([record.path]).catch(() => null);
    }
    await kv.del(`vault:${pid}:${id}`);
    return c.json(ok({ id }));
  } catch (e) { return c.json(err(`vault delete failed: ${e}`), 500); }
});

// ---------- Patients ----------
app.post(`${BASE}/patients`, async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id ?? uid();
    const now = new Date().toISOString();

    const { emergency, consents, carnet, ...profile } = body;
    const record = { ...profile, id, createdAt: now, updatedAt: now };

    await kv.set(`patient:${id}`, record);
    if (emergency) await kv.set(`patient:${id}:emergency`, emergency);
    if (consents) await kv.set(`patient:${id}:consents`, { ...consents, signedAt: now });
    if (carnet) await kv.set(`patient:${id}:carnet`, carnet);

    return c.json(ok({ id, patient: record }));
  } catch (e) {
    console.log(`Error creating patient: ${e}`);
    return c.json(err(`Patient create failed: ${e}`), 500);
  }
});

app.get(`${BASE}/patients/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const [patient, emergency, consents, carnet] = await kv.mget([
      `patient:${id}`,
      `patient:${id}:emergency`,
      `patient:${id}:consents`,
      `patient:${id}:carnet`,
    ]);
    if (!patient) return c.json(err("Patient not found", 404), 404);
    return c.json(ok({ patient, emergency, consents, carnet }));
  } catch (e) {
    console.log(`Error fetching patient: ${e}`);
    return c.json(err(`Patient fetch failed: ${e}`), 500);
  }
});

app.delete(`${BASE}/patients/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`patient:${id}`);
    await kv.del(`patient:${id}:emergency`);
    await kv.del(`patient:${id}:consents`);
    await kv.del(`patient:${id}:carnet`);
    for (const domain of PATIENT_SCOPED) {
      const items = await kv.getByPrefix(`${domain}:${id}:`);
      for (const it of items) {
        const k = (it as any)?.key ?? (it as any)?.id;
        if (k) await kv.del(`${domain}:${id}:${k}`);
      }
    }
    return c.json(ok({ id }));
  } catch (e) {
    console.log(`Error deleting patient: ${e}`);
    return c.json(err(`Patient delete failed: ${e}`), 500);
  }
});

app.delete(`${BASE}/pro/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`pro:${id}`);
    return c.json(ok({ id }));
  } catch (e) {
    console.log(`Error deleting pro: ${e}`);
    return c.json(err(`Pro delete failed: ${e}`), 500);
  }
});

app.put(`${BASE}/patients/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`patient:${id}`);
    if (!existing) return c.json(err("Patient not found", 404), 404);
    const { emergency, consents, carnet, ...profile } = body;
    const updated = { ...existing, ...profile, id, updatedAt: new Date().toISOString() };
    await kv.set(`patient:${id}`, updated);
    if (emergency !== undefined) await kv.set(`patient:${id}:emergency`, emergency);
    if (consents !== undefined) await kv.set(`patient:${id}:consents`, consents);
    if (carnet !== undefined) await kv.set(`patient:${id}:carnet`, carnet);
    return c.json(ok(updated));
  } catch (e) {
    console.log(`Error updating patient: ${e}`);
    return c.json(err(`Patient update failed: ${e}`), 500);
  }
});

// ---------- Generic per-domain CRUD factory ----------
// Domains scoped to a patient: rdv, ordonnance, traitement, notification
const PATIENT_SCOPED = ["rdv", "ordonnance", "traitement", "notification", "note", "assistance", "filleul", "contribution", "meal", "famille", "growth", "vaccin", "profilsante"] as const;
for (const domain of PATIENT_SCOPED) {
  app.get(`${BASE}/patients/:pid/${domain}`, async (c) => {
    try {
      const pid = c.req.param("pid");
      const items = await kv.getByPrefix(`${domain}:${pid}:`);
      return c.json(ok(items));
    } catch (e) {
      console.log(`Error listing ${domain}: ${e}`);
      return c.json(err(`${domain} list failed: ${e}`), 500);
    }
  });

  app.post(`${BASE}/patients/:pid/${domain}`, async (c) => {
    try {
      const pid = c.req.param("pid");
      const body = await c.req.json();
      const id = body.id ?? uid();
      const now = new Date().toISOString();
      const record = { ...body, id, patientId: pid, createdAt: now, updatedAt: now };
      await kv.set(`${domain}:${pid}:${id}`, record);
      return c.json(ok(record));
    } catch (e) {
      console.log(`Error creating ${domain}: ${e}`);
      return c.json(err(`${domain} create failed: ${e}`), 500);
    }
  });

  app.put(`${BASE}/patients/:pid/${domain}/:id`, async (c) => {
    try {
      const pid = c.req.param("pid");
      const id = c.req.param("id");
      const body = await c.req.json();
      const key = `${domain}:${pid}:${id}`;
      const existing = await kv.get(key);
      if (!existing) return c.json(err(`${domain} not found`, 404), 404);
      const updated = { ...existing, ...body, id, patientId: pid, updatedAt: new Date().toISOString() };
      await kv.set(key, updated);
      if (domain === 'rdv' && body?.status === 'cancelled' && (existing as any)?.status !== 'cancelled' && (updated as any)?.proId) {
        await freeProSlotForRdv(updated);
        await notifyWaitlistForPro((updated as any).proId, updated);
      }
      return c.json(ok(updated));
    } catch (e) {
      console.log(`Error updating ${domain}: ${e}`);
      return c.json(err(`${domain} update failed: ${e}`), 500);
    }
  });

  app.delete(`${BASE}/patients/:pid/${domain}/:id`, async (c) => {
    try {
      const pid = c.req.param("pid");
      const id = c.req.param("id");
      await kv.del(`${domain}:${pid}:${id}`);
      return c.json(ok({ id }));
    } catch (e) {
      console.log(`Error deleting ${domain}: ${e}`);
      return c.json(err(`${domain} delete failed: ${e}`), 500);
    }
  });
}

// ---------- Ressentis (keyed by date, not uuid) ----------
app.get(`${BASE}/patients/:pid/ressenti`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const items = await kv.getByPrefix(`ressenti:${pid}:`);
    return c.json(ok(items));
  } catch (e) {
    console.log(`Error listing ressenti: ${e}`);
    return c.json(err(`ressenti list failed: ${e}`), 500);
  }
});

app.post(`${BASE}/patients/:pid/ressenti`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const body = await c.req.json();
    const date = body.date ?? new Date().toISOString().slice(0, 10);
    const record = { ...body, date, patientId: pid, updatedAt: new Date().toISOString() };
    await kv.set(`ressenti:${pid}:${date}`, record);
    return c.json(ok(record));
  } catch (e) {
    console.log(`Error saving ressenti: ${e}`);
    return c.json(err(`ressenti save failed: ${e}`), 500);
  }
});

// ---------- Pros & Centres (global) ----------
for (const domain of ["pro", "centre"] as const) {
  app.get(`${BASE}/${domain}`, async (c) => {
    try {
      const items = await kv.getByPrefix(`${domain}:`);
      return c.json(ok(items));
    } catch (e) {
      console.log(`Error listing ${domain}: ${e}`);
      return c.json(err(`${domain} list failed: ${e}`), 500);
    }
  });

  app.get(`${BASE}/${domain}/:id`, async (c) => {
    try {
      const id = c.req.param("id");
      const item = await kv.get(`${domain}:${id}`);
      if (!item) return c.json(err(`${domain} not found`, 404), 404);
      return c.json(ok(item));
    } catch (e) {
      console.log(`Error fetching ${domain}: ${e}`);
      return c.json(err(`${domain} fetch failed: ${e}`), 500);
    }
  });

  app.post(`${BASE}/${domain}`, async (c) => {
    try {
      const body = await c.req.json();
      const id = body.id ?? uid();
      const now = new Date().toISOString();
      const record = { ...body, id, createdAt: now, updatedAt: now };
      await kv.set(`${domain}:${id}`, record);
      return c.json(ok(record));
    } catch (e) {
      console.log(`Error creating ${domain}: ${e}`);
      return c.json(err(`${domain} create failed: ${e}`), 500);
    }
  });

  app.put(`${BASE}/${domain}/:id`, async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const existing = await kv.get(`${domain}:${id}`);
      if (!existing) return c.json(err(`${domain} not found`, 404), 404);
      const updated = { ...existing, ...body, id, updatedAt: new Date().toISOString() };
      await kv.set(`${domain}:${id}`, updated);
      return c.json(ok(updated));
    } catch (e) {
      console.log(`Error updating ${domain}: ${e}`);
      return c.json(err(`${domain} update failed: ${e}`), 500);
    }
  });
}

// ---------- Centre reviews (key: centerReview:{centerId}:{id}) ----------
app.get(`${BASE}/centre/:cid/reviews`, async (c) => {
  try {
    const cid = c.req.param("cid");
    const items = await kv.getByPrefix(`centerReview:${cid}:`);
    return c.json(ok(items));
  } catch (e) {
    console.log(`Error listing centre reviews: ${e}`);
    return c.json(err(`centre reviews list failed: ${e}`), 500);
  }
});

app.post(`${BASE}/centre/:cid/reviews`, async (c) => {
  try {
    const cid = c.req.param("cid");
    const body = await c.req.json();
    const id = body.id ?? uid();
    const now = new Date().toISOString();
    const record = { ...body, id, centerId: cid, createdAt: now };
    await kv.set(`centerReview:${cid}:${id}`, record);
    return c.json(ok(record));
  } catch (e) {
    console.log(`Error creating centre review: ${e}`);
    return c.json(err(`centre review create failed: ${e}`), 500);
  }
});

app.delete(`${BASE}/centre/:cid/reviews/:id`, async (c) => {
  try {
    const cid = c.req.param("cid");
    const id = c.req.param("id");
    await kv.del(`centerReview:${cid}:${id}`);
    return c.json(ok({ id }));
  } catch (e) {
    console.log(`Error deleting centre review: ${e}`);
    return c.json(err(`centre review delete failed: ${e}`), 500);
  }
});

// ---------- Pro reviews (key: proReview:{proId}:{id}) ----------
app.get(`${BASE}/pro/:pid/reviews`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const items = await kv.getByPrefix(`proReview:${pid}:`);
    return c.json(ok(items));
  } catch (e) {
    console.log(`Error listing pro reviews: ${e}`);
    return c.json(err(`pro reviews list failed: ${e}`), 500);
  }
});

app.post(`${BASE}/pro/:pid/reviews`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const body = await c.req.json();
    const id = body.id ?? uid();
    const now = new Date().toISOString();
    const record = { ...body, id, proId: pid, createdAt: now };
    await kv.set(`proReview:${pid}:${id}`, record);
    return c.json(ok(record));
  } catch (e) {
    console.log(`Error creating pro review: ${e}`);
    return c.json(err(`pro review create failed: ${e}`), 500);
  }
});

app.delete(`${BASE}/pro/:pid/reviews/:id`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const id = c.req.param("id");
    await kv.del(`proReview:${pid}:${id}`);
    return c.json(ok({ id }));
  } catch (e) {
    console.log(`Error deleting pro review: ${e}`);
    return c.json(err(`pro review delete failed: ${e}`), 500);
  }
});

// ---------- Pro search (with filters + computed rating + hasFreeSlots) ----------
app.get(`${BASE}/pros/search`, async (c) => {
  try {
    const q = (c.req.query("q") ?? "").trim().toLowerCase();
    const specialty = (c.req.query("specialty") ?? "").trim().toLowerCase();
    const city = (c.req.query("city") ?? "").trim().toLowerCase();
    const minRating = Number(c.req.query("minRating") ?? "0") || 0;
    const hasFreeSlots = c.req.query("hasFreeSlots") === "true";
    const type = (c.req.query("type") ?? "").trim().toLowerCase();

    const pros = (await kv.getByPrefix(`pro:`)) as any[];
    const results: any[] = [];
    for (const pro of pros) {
      if (!pro || typeof pro !== "object") continue;
      // Skip nested keys (e.g. pro:id:something) — only top-level pro records
      const name = String(pro.name ?? "").toLowerCase();
      const sp = String(pro.specialty ?? "").toLowerCase();
      const ct = String(pro.city ?? pro.contact?.city ?? "").toLowerCase();
      const tp = String(pro.type ?? pro.activity ?? "").toLowerCase();
      if (q && !(name.includes(q) || sp.includes(q) || ct.includes(q))) continue;
      if (specialty && !sp.includes(specialty)) continue;
      if (city && !ct.includes(city)) continue;
      if (type && !tp.includes(type)) continue;

      const reviews = (await kv.getByPrefix(`proReview:${pro.id}:`)) as any[];
      const ratings = reviews.map((r) => Number(r?.rating ?? 0)).filter((n) => n > 0);
      const avgRating = ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : 0;
      const reviewCount = reviews.length;
      if (minRating > 0 && avgRating < minRating) continue;

      let freeSlotsCount = 0;
      if (hasFreeSlots) {
        const slots = (await kv.getByPrefix(`agendapro:${pro.id}:`)) as any[];
        freeSlotsCount = slots.filter((s) => s?.status === "free").length;
        if (freeSlotsCount === 0) continue;
      }

      results.push({ ...pro, avgRating, reviewCount, freeSlotsCount });
    }

    results.sort((a, b) => (b.avgRating - a.avgRating) || (b.reviewCount - a.reviewCount));
    return c.json(ok(results));
  } catch (e) {
    console.log(`Error searching pros: ${e}`);
    return c.json(err(`pro search failed: ${e}`), 500);
  }
});

// ---------- Pro Agenda (slots) ----------
// key: agendapro:{proId}:{slotId}
app.get(`${BASE}/pro/:pid/agenda`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const items = await kv.getByPrefix(`agendapro:${pid}:`);
    return c.json(ok(items));
  } catch (e) {
    console.log(`Error listing agenda: ${e}`);
    return c.json(err(`agenda list failed: ${e}`), 500);
  }
});

app.post(`${BASE}/pro/:pid/agenda`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const body = await c.req.json();
    const id = body.id ?? uid();
    const now = new Date().toISOString();
    const record = { ...body, id, proId: pid, createdAt: now, updatedAt: now };
    await kv.set(`agendapro:${pid}:${id}`, record);
    return c.json(ok(record));
  } catch (e) {
    console.log(`Error creating agenda slot: ${e}`);
    return c.json(err(`agenda create failed: ${e}`), 500);
  }
});

app.put(`${BASE}/pro/:pid/agenda/:id`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const id = c.req.param("id");
    const body = await c.req.json();
    const key = `agendapro:${pid}:${id}`;
    const existing = await kv.get(key);
    if (!existing) return c.json(err("slot not found", 404), 404);
    const updated = { ...existing, ...body, id, proId: pid, updatedAt: new Date().toISOString() };
    await kv.set(key, updated);
    return c.json(ok(updated));
  } catch (e) {
    console.log(`Error updating agenda slot: ${e}`);
    return c.json(err(`agenda update failed: ${e}`), 500);
  }
});

app.delete(`${BASE}/pro/:pid/agenda/:id`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const id = c.req.param("id");
    await kv.del(`agendapro:${pid}:${id}`);
    return c.json(ok({ id }));
  } catch (e) {
    console.log(`Error deleting agenda slot: ${e}`);
    return c.json(err(`agenda delete failed: ${e}`), 500);
  }
});

// ---------- Messages (pro <-> patient) ----------
// key: message:{conversationId}:{messageId} where conversationId = `${proId}__${patientId}`
app.get(`${BASE}/messages/:conv`, async (c) => {
  try {
    const conv = c.req.param("conv");
    const items = await kv.getByPrefix(`message:${conv}:`);
    items.sort((a: any, b: any) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    return c.json(ok(items));
  } catch (e) {
    console.log(`Error listing messages: ${e}`);
    return c.json(err(`messages list failed: ${e}`), 500);
  }
});

app.post(`${BASE}/messages/:conv`, async (c) => {
  try {
    const conv = c.req.param("conv");
    const body = await c.req.json();
    const id = body.id ?? uid();
    const now = new Date().toISOString();
    const record = { ...body, id, conversationId: conv, createdAt: now };
    await kv.set(`message:${conv}:${id}`, record);
    return c.json(ok(record));
  } catch (e) {
    console.log(`Error sending message: ${e}`);
    return c.json(err(`message send failed: ${e}`), 500);
  }
});

// ---------- Lookups ----------
app.get(`${BASE}/patients/by-phone/:phone`, async (c) => {
  try {
    const raw = c.req.param("phone") ?? "";
    const norm = (s: string) => String(s ?? "").replace(/[\s\-+().]/g, "");
    const target = norm(raw);
    if (!target || target.length < 6) return c.json(err("phone too short"), 400);
    const all = await kv.getByPrefix("patient:");
    const real = all.filter((p: any) => p?.id && !p.patientId && !p.relation);
    const match = real.find((p: any) => {
      const n = norm(p.phone ?? "");
      if (!n) return false;
      if (n === target) return true;
      const min = Math.min(n.length, target.length);
      return min >= 9 && (n.endsWith(target) || target.endsWith(n));
    });
    if (!match) return c.json(err("not found"), 404);
    return c.json(ok({ id: match.id, firstName: match.firstName ?? null, lastName: match.lastName ?? null }));
  } catch (e) {
    console.log(`Error finding patient by phone: ${e}`);
    return c.json(err(`lookup failed: ${e}`), 500);
  }
});

app.get(`${BASE}/pros/:pid/patients`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const rdvs = await kv.getByPrefix("rdv:");
    const ids = new Set<string>(
      rdvs.filter((r: any) => r?.proId === pid && r?.patientId).map((r: any) => r.patientId)
    );
    if (ids.size === 0) return c.json(ok([]));
    const all = await kv.getByPrefix("patient:");
    const list = all.filter((p: any) => p?.id && ids.has(p.id) && !p.patientId && !p.relation);
    return c.json(ok(list));
  } catch (e) {
    console.log(`Error listing pro patients: ${e}`);
    return c.json(err(`pro patients list failed: ${e}`), 500);
  }
});

// ---------- Payments (Mobile Money + Bank) ----------
type PaymentMethod = 'mtn_momo' | 'orange_money' | 'moov_money' | 'wave' | 'card' | 'bank_transfer';
type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';

interface PaymentRecord {
  id: string;
  patientId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  purpose: string;
  ref?: string;
  rdvId?: string;
  ordonnanceId?: string;
  proId?: string;
  phone?: string;
  bankIban?: string;
  cardLast4?: string;
  providerRef?: string;
  providerUrl?: string;
  provider?: string;
  mocked?: boolean;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

function methodLabel(m: PaymentMethod) {
  return ({
    mtn_momo: 'MTN Mobile Money',
    orange_money: 'Orange Money',
    moov_money: 'Moov Money',
    wave: 'Wave',
    card: 'Carte bancaire',
    bank_transfer: 'Virement bancaire',
  } as const)[m] ?? String(m);
}

async function fedaPayInitiate(payload: { amount: number; currency: string; description: string; customer: { phone?: string; name?: string; email?: string }; method: PaymentMethod; callbackUrl?: string }) {
  const apiKey = Deno.env.get('FEDAPAY_SECRET_KEY');
  if (!apiKey) {
    return { mocked: true, providerRef: `mock-${uid()}`, providerUrl: '', provider: 'mock' as const };
  }
  try {
    const url = 'https://api.fedapay.com/v1/transactions';
    const body = {
      amount: payload.amount,
      currency: { iso: payload.currency },
      description: payload.description,
      callback_url: payload.callbackUrl,
      customer: {
        firstname: (payload.customer.name ?? '').split(' ')[0] || 'Client',
        lastname: (payload.customer.name ?? '').split(' ').slice(1).join(' ') || 'Healthy',
        email: payload.customer.email ?? `noreply+${uid()}@healthy-page.app`,
        phone_number: { number: payload.customer.phone ?? '', country: 'bj' },
      },
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.['v1/transaction']) {
      return { mocked: false, providerRef: '', providerUrl: '', provider: 'fedapay' as const, error: data?.message || `fedapay ${res.status}` };
    }
    const tx = data['v1/transaction'];
    const tokenUrl = `https://api.fedapay.com/v1/transactions/${tx.id}/token`;
    const tokRes = await fetch(tokenUrl, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` } });
    const tokData = await tokRes.json().catch(() => ({}));
    return {
      mocked: false,
      provider: 'fedapay' as const,
      providerRef: String(tx.id),
      providerUrl: tokData?.url ?? '',
    };
  } catch (e) {
    return { mocked: false, provider: 'fedapay' as const, providerRef: '', providerUrl: '', error: String(e) };
  }
}

app.post(`${BASE}/payments/initiate`, async (c) => {
  try {
    const body = await c.req.json();
    const {
      patientId, amount, currency = 'XOF', method, purpose,
      rdvId, ordonnanceId, proId, phone, bankIban, cardLast4, ref,
    } = body || {};
    if (!patientId || !amount || !method || !purpose) {
      return c.json(err('missing patientId/amount/method/purpose'), 400);
    }
    if (!['mtn_momo', 'orange_money', 'moov_money', 'wave', 'card', 'bank_transfer'].includes(method)) {
      return c.json(err('invalid method'), 400);
    }
    const id = uid();
    const patient: any = await kv.get(`patient:${patientId}`);
    const customer = {
      phone: phone ?? patient?.phone,
      name: `${patient?.firstName ?? ''} ${patient?.lastName ?? ''}`.trim() || 'Patient',
      email: patient?.email,
    };
    let providerInfo: any = { mocked: true, providerRef: `mock-${id}`, providerUrl: '', provider: 'mock' };
    if (method !== 'bank_transfer') {
      providerInfo = await fedaPayInitiate({
        amount, currency, description: purpose, customer, method,
        callbackUrl: `${c.req.url.split('/payments/')[0]}/payments/webhook/fedapay?pid=${patientId}&id=${id}`,
      });
    }
    const status: PaymentStatus = method === 'bank_transfer' ? 'pending' : (providerInfo?.providerUrl || providerInfo?.mocked ? 'processing' : 'pending');
    const now = new Date().toISOString();
    const record: PaymentRecord = {
      id, patientId, amount: Number(amount), currency, method, status, purpose,
      rdvId, ordonnanceId, proId, phone: customer.phone, bankIban, cardLast4,
      providerRef: providerInfo?.providerRef, providerUrl: providerInfo?.providerUrl,
      provider: providerInfo?.provider, mocked: !!providerInfo?.mocked, ref,
      failureReason: providerInfo?.error,
      createdAt: now, updatedAt: now,
    };
    await kv.set(`payment:${patientId}:${id}`, record);
    if (providerInfo?.mocked) {
      setTimeout(async () => {
        try {
          const cur: any = await kv.get(`payment:${patientId}:${id}`);
          if (cur && cur.status === 'processing') {
            await kv.set(`payment:${patientId}:${id}`, { ...cur, status: 'succeeded', updatedAt: new Date().toISOString() });
            const notifId = uid();
            await kv.set(`notification:${patientId}:${notifId}`, {
              id: notifId, patientId, title: 'Paiement reçu',
              body: `${cur.amount} ${cur.currency} via ${methodLabel(cur.method as PaymentMethod)} · ${cur.purpose}`,
              type: 'payment', read: false, createdAt: new Date().toISOString(),
            });
          }
        } catch (e) { console.log('mock settle err', e); }
      }, 2500);
    }
    return c.json(ok(record));
  } catch (e) {
    console.log('payments initiate error', e);
    return c.json(err(`payments initiate failed: ${e}`), 500);
  }
});

app.get(`${BASE}/payments/:pid/:id`, async (c) => {
  try {
    const pid = c.req.param('pid');
    const id = c.req.param('id');
    const rec: any = await kv.get(`payment:${pid}:${id}`);
    if (!rec) return c.json(err('not found'), 404);
    return c.json(ok(rec));
  } catch (e) {
    return c.json(err(`payment get failed: ${e}`), 500);
  }
});

app.get(`${BASE}/patients/:pid/payments`, async (c) => {
  try {
    const pid = c.req.param('pid');
    const list = await kv.getByPrefix(`payment:${pid}:`);
    const sorted = (list ?? []).filter(Boolean).sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return c.json(ok(sorted));
  } catch (e) {
    return c.json(err(`payments list failed: ${e}`), 500);
  }
});

app.post(`${BASE}/payments/webhook/:provider`, async (c) => {
  try {
    const provider = c.req.param('provider');
    const url = new URL(c.req.url);
    const pid = url.searchParams.get('pid');
    const id = url.searchParams.get('id');
    const body = await c.req.json().catch(() => ({} as any));
    if (!pid || !id) return c.json(err('missing pid/id'), 400);
    const rec: any = await kv.get(`payment:${pid}:${id}`);
    if (!rec) return c.json(err('payment not found'), 404);
    const evt = String(body?.event ?? body?.entity?.status ?? '').toLowerCase();
    let nextStatus: PaymentStatus = rec.status;
    if (evt.includes('approve') || evt.includes('succeed')) nextStatus = 'succeeded';
    else if (evt.includes('decline') || evt.includes('fail')) nextStatus = 'failed';
    else if (evt.includes('cancel')) nextStatus = 'cancelled';
    const updated = { ...rec, status: nextStatus, provider, updatedAt: new Date().toISOString() };
    await kv.set(`payment:${pid}:${id}`, updated);
    if (nextStatus === 'succeeded') {
      const notifId = uid();
      await kv.set(`notification:${pid}:${notifId}`, {
        id: notifId, patientId: pid, title: 'Paiement confirmé',
        body: `${rec.amount} ${rec.currency} · ${rec.purpose}`,
        type: 'payment', read: false, createdAt: new Date().toISOString(),
      });
    }
    return c.json(ok(updated));
  } catch (e) {
    return c.json(err(`webhook failed: ${e}`), 500);
  }
});

app.post(`${BASE}/payments/:pid/:id/confirm`, async (c) => {
  try {
    const pid = c.req.param('pid');
    const id = c.req.param('id');
    const rec: any = await kv.get(`payment:${pid}:${id}`);
    if (!rec) return c.json(err('not found'), 404);
    if (rec.method !== 'bank_transfer') return c.json(err('only bank_transfer supports manual confirm'), 400);
    const updated = { ...rec, status: 'processing' as PaymentStatus, updatedAt: new Date().toISOString() };
    await kv.set(`payment:${pid}:${id}`, updated);
    return c.json(ok(updated));
  } catch (e) {
    return c.json(err(`confirm failed: ${e}`), 500);
  }
});

// ---------- Reminders (J-1, H-2) ----------
const FR_MONTHS_R: Record<string, number> = {
  janvier: 0, fevrier: 1, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, aout: 7, août: 7, septembre: 8, octobre: 9, novembre: 10, decembre: 11, décembre: 11,
};
function parseRdvWhen(date: string, time: string): Date | null {
  const m = String(date || '').trim().toLowerCase().match(/^(\d{1,2})\s+([a-zéûô]+)\s+(\d{4})$/);
  if (!m) return null;
  const month = FR_MONTHS_R[m[2]];
  if (month === undefined) return null;
  const [hh, mm] = String(time || '00:00').split(':').map((x) => parseInt(x, 10));
  return new Date(parseInt(m[3], 10), month, parseInt(m[1], 10), hh || 0, mm || 0);
}

async function sendSmsTwilio(to: string, body: string): Promise<{ ok: boolean; mocked?: boolean; error?: string }> {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_FROM_NUMBER");
  if (!sid || !token || !from) {
    console.log(`[sms:mock] to=${to} body=${body.slice(0, 80)}`);
    return { ok: true, mocked: true };
  }
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const params = new URLSearchParams({ To: to, From: from, Body: body });
    const auth = btoa(`${sid}:${token}`);
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `twilio ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

app.post(`${BASE}/reminders/scan/:pid`, async (c) => {
  try {
    const pid = c.req.param("pid");
    const body = await c.req.json().catch(() => ({} as any));
    const channels: string[] = Array.isArray(body?.channels) && body.channels.length
      ? body.channels
      : ["sms", "push", "inapp"];
    const patient: any = await kv.get(`patient:${pid}`);
    const phone: string | undefined = patient?.phone;
    const rdvs: any[] = (await kv.getByPrefix(`rdv:${pid}:`)) ?? [];
    const now = Date.now();
    const sent: Array<{ rdvId: string; kind: 'J1' | 'H2'; smsOk?: boolean; mocked?: boolean }> = [];

    for (const r of rdvs) {
      if (!r || r.status !== 'upcoming') continue;
      const when = parseRdvWhen(r.date, r.time);
      if (!when) continue;
      const ms = when.getTime() - now;
      const minutes = ms / 60000;
      let kind: 'J1' | 'H2' | null = null;
      if (minutes > 22 * 60 && minutes <= 26 * 60) kind = 'J1';
      else if (minutes > 90 && minutes <= 150) kind = 'H2';
      if (!kind) continue;
      const dedupKey = `reminder:${pid}:${r.id}:${kind}`;
      const already = await kv.get(dedupKey);
      if (already) continue;

      const human = kind === 'J1' ? 'demain' : 'dans 2h';
      const token = await issueRdvToken(pid, r.id).catch(() => null);
      const appUrl = Deno.env.get('APP_PUBLIC_URL') ?? 'https://healthypage.app';
      const linkLine = token ? ` Confirmer/Annuler : ${appUrl}/r/${token}` : '';
      const msg = `Healthy Page · Rappel : RDV ${human} avec ${r.doctor ?? 'votre praticien'} (${r.specialty ?? ''}) le ${r.date} à ${r.time}. Lieu : ${r.location ?? ''}.${linkLine}`;
      let smsResult: { ok: boolean; mocked?: boolean; error?: string } = { ok: false };
      if (channels.includes('sms') && phone) {
        smsResult = await sendSmsTwilio(phone, msg);
      }
      if (channels.includes('inapp')) {
        const notifId = uid();
        await kv.set(`notification:${pid}:${notifId}`, {
          id: notifId,
          patientId: pid,
          title: kind === 'J1' ? 'RDV demain' : 'RDV dans 2 heures',
          body: msg,
          type: 'rdv',
          rdvId: r.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
      await kv.set(dedupKey, { rdvId: r.id, kind, sentAt: new Date().toISOString(), smsOk: smsResult.ok, mocked: smsResult.mocked ?? false });
      sent.push({ rdvId: r.id, kind, smsOk: smsResult.ok, mocked: smsResult.mocked });
    }
    return c.json(ok({ sent, count: sent.length }));
  } catch (e) {
    console.log(`Error reminders scan: ${e}`);
    return c.json(err(`reminders scan failed: ${e}`), 500);
  }
});

// Daily job: scan all patients' vaccines, create in-app notification + SMS
// for any rappel within the next `withinDays` days (default 30).
// Idempotent via dedupKey `vaccin-reminder:{pid}:{vaccinId}:{nextDueDate}`.
app.post(`${BASE}/reminders/scan-vaccins`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({} as any));
    const withinDays: number = Number.isFinite(body?.withinDays) ? Number(body.withinDays) : 30;
    const channels: string[] = Array.isArray(body?.channels) && body.channels.length
      ? body.channels
      : ["sms", "inapp"];
    const adminToken = Deno.env.get("ADMIN_CRON_TOKEN");
    if (adminToken) {
      const provided = c.req.header("x-cron-token") ?? body?.token ?? "";
      if (provided !== adminToken) return c.json(err("forbidden", 403), 403);
    }

    const all: any[] = (await kv.getByPrefix("vaccin:")) ?? [];
    const now = Date.now();
    const sent: Array<{ patientId: string; vaccinId: string; name: string; daysLeft: number; smsOk: boolean; mocked?: boolean }> = [];
    const skipped: Array<{ patientId: string; vaccinId: string; reason: string }> = [];

    const patientCache = new Map<string, any>();
    const getPatient = async (pid: string) => {
      if (patientCache.has(pid)) return patientCache.get(pid);
      const p = await kv.get(`patient:${pid}`);
      patientCache.set(pid, p);
      return p;
    };

    for (const v of all) {
      if (!v?.id || !v?.patientId || !v?.nextDueDate) {
        skipped.push({ patientId: v?.patientId ?? '?', vaccinId: v?.id ?? '?', reason: 'no-due-date' });
        continue;
      }
      const due = new Date(v.nextDueDate).getTime();
      if (Number.isNaN(due)) { skipped.push({ patientId: v.patientId, vaccinId: v.id, reason: 'bad-date' }); continue; }
      const daysLeft = Math.round((due - now) / (24 * 3600 * 1000));
      if (daysLeft < 0 || daysLeft > withinDays) continue;

      const dedupKey = `vaccin-reminder:${v.patientId}:${v.id}:${v.nextDueDate}`;
      if (await kv.get(dedupKey)) continue;

      const patient = await getPatient(v.patientId);
      const phone: string | undefined = patient?.phone;
      const dueLabel = new Date(v.nextDueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      const msg = `Healthy Page · Rappel vaccin ${v.name}${v.doseLabel ? ` (${v.doseLabel})` : ''} prévu le ${dueLabel}${daysLeft === 0 ? ' (aujourd\'hui)' : ` (dans ${daysLeft}j)`}.`;

      let smsResult: { ok: boolean; mocked?: boolean; error?: string } = { ok: false };
      if (channels.includes('sms') && phone) {
        smsResult = await sendSmsTwilio(phone, msg);
      }
      if (channels.includes('inapp')) {
        const notifId = uid();
        await kv.set(`notification:${v.patientId}:${notifId}`, {
          id: notifId,
          patientId: v.patientId,
          title: `Rappel vaccin ${v.name}`,
          body: msg,
          type: 'vaccin',
          vaccinId: v.id,
          dueAt: v.nextDueDate,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
      await kv.set(dedupKey, { patientId: v.patientId, vaccinId: v.id, nextDueDate: v.nextDueDate, sentAt: new Date().toISOString(), smsOk: smsResult.ok, mocked: smsResult.mocked ?? false });
      sent.push({ patientId: v.patientId, vaccinId: v.id, name: v.name, daysLeft, smsOk: smsResult.ok, mocked: smsResult.mocked });
    }

    return c.json(ok({ sent, count: sent.length, scanned: all.length, withinDays, skipped: skipped.length }));
  } catch (e) {
    console.log(`Error vaccin scan: ${e}`);
    return c.json(err(`vaccin scan failed: ${e}`), 500);
  }
});

app.post(`${BASE}/reminders/test`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({} as any));
    const to: string = body?.to ?? '';
    const text: string = body?.body ?? 'Healthy Page · Test rappel';
    if (!to) return c.json(err('missing to'), 400);
    const r = await sendSmsTwilio(to, text);
    return c.json(ok(r));
  } catch (e) {
    return c.json(err(`reminders test failed: ${e}`), 500);
  }
});

// ---------- RDV one-click confirm/cancel via signed token ----------
async function issueRdvToken(pid: string, rdvId: string): Promise<string> {
  const rdv: any = await kv.get(`rdv:${pid}:${rdvId}`);
  if (!rdv) throw new Error('rdv not found');
  if (rdv.token) return rdv.token;
  const token = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  await kv.set(`rdvtoken:${token}`, { patientId: pid, rdvId, createdAt: new Date().toISOString() });
  rdv.token = token;
  await kv.set(`rdv:${pid}:${rdvId}`, rdv);
  return token;
}

app.get(`${BASE}/rdv-action/:token`, async (c) => {
  try {
    const token = c.req.param('token');
    const ref: any = await kv.get(`rdvtoken:${token}`);
    if (!ref) return c.json(err('lien invalide ou expiré', 404), 404);
    const rdv: any = await kv.get(`rdv:${ref.patientId}:${ref.rdvId}`);
    if (!rdv) return c.json(err('rendez-vous introuvable', 404), 404);
    const patient: any = await kv.get(`patient:${ref.patientId}`);
    return c.json(ok({
      rdv: { id: rdv.id, doctor: rdv.doctor, specialty: rdv.specialty, date: rdv.date, time: rdv.time, location: rdv.location, type: rdv.type, status: rdv.status, proId: rdv.proId },
      patientName: `${patient?.firstName ?? ''} ${patient?.lastName ?? ''}`.trim() || 'Patient',
    }));
  } catch (e) {
    return c.json(err(`rdv-action lookup failed: ${e}`), 500);
  }
});

async function notifyWaitlistForPro(proId: string, freedRdv: any) {
  if (!proId) return;
  try {
    const list: any[] = (await kv.getByPrefix(`waitlist:${proId}:`)) ?? [];
    const targets = list.filter((w) => !w?.notifiedAt && w?.patientId);
    for (const w of targets) {
      const notifId = uid();
      await kv.set(`notification:${w.patientId}:${notifId}`, {
        id: notifId,
        patientId: w.patientId,
        title: 'Créneau libéré 🎉',
        body: `Un créneau s'est libéré chez ${freedRdv?.doctor ?? 'votre praticien'}${freedRdv?.specialty ? ` (${freedRdv.specialty})` : ''}. Réservez vite !`,
        type: 'waitlist',
        proId,
        rdvId: freedRdv?.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
      await kv.set(`waitlist:${proId}:${w.id}`, { ...w, notifiedAt: new Date().toISOString() });
    }
  } catch (_) {}
}

async function freeProSlotForRdv(rdv: any) {
  if (!rdv?.proId) return;
  try {
    const slots: any[] = (await kv.getByPrefix(`agendapro:${rdv.proId}:`)) ?? [];
    const slot = slots.find((s) => s?.rdvId === rdv.id || (s?.patientId === rdv.patientId && s?.date === rdv.date && s?.time === rdv.time));
    if (slot) {
      await kv.set(`agendapro:${rdv.proId}:${slot.id}`, { ...slot, status: 'free', patientId: '', patient: 'Disponible', rdvId: '' });
    }
  } catch (_) {}
}

app.post(`${BASE}/rdv-action/:token/:action`, async (c) => {
  try {
    const token = c.req.param('token');
    const action = c.req.param('action');
    if (!['confirm', 'cancel'].includes(action)) return c.json(err('action invalide'), 400);
    const ref: any = await kv.get(`rdvtoken:${token}`);
    if (!ref) return c.json(err('lien invalide ou expiré', 404), 404);
    const key = `rdv:${ref.patientId}:${ref.rdvId}`;
    const rdv: any = await kv.get(key);
    if (!rdv) return c.json(err('rendez-vous introuvable', 404), 404);
    const next = action === 'confirm' ? 'confirmed' : 'cancelled';
    const updated = { ...rdv, status: next, [`${next}At`]: new Date().toISOString(), [`${next}Source`]: 'sms-1click' };
    await kv.set(key, updated);
    if (next === 'cancelled') {
      await freeProSlotForRdv(rdv);
      if (rdv.proId) await notifyWaitlistForPro(rdv.proId, rdv);
    }
    const notifId = uid();
    await kv.set(`notification:${ref.patientId}:${notifId}`, {
      id: notifId,
      patientId: ref.patientId,
      title: next === 'confirmed' ? 'RDV confirmé' : 'RDV annulé',
      body: `Votre RDV ${rdv.date} à ${rdv.time} avec ${rdv.doctor ?? 'votre praticien'} a été ${next === 'confirmed' ? 'confirmé' : 'annulé'} via SMS.`,
      type: 'rdv',
      rdvId: rdv.id,
      read: false,
      createdAt: new Date().toISOString(),
    });
    return c.json(ok({ rdv: updated }));
  } catch (e) {
    return c.json(err(`rdv-action failed: ${e}`), 500);
  }
});

// ---------- Délégations praticiens / secrétariat ----------
app.get(`${BASE}/pro/:proId/delegates`, async (c) => {
  try {
    const proId = c.req.param('proId');
    const pro: any = await kv.get(`pro:${proId}`);
    if (!pro) return c.json(err('pro introuvable', 404), 404);
    return c.json(ok(pro.delegates ?? []));
  } catch (e) { return c.json(err(`delegates list failed: ${e}`), 500); }
});

app.post(`${BASE}/pro/:proId/delegates`, async (c) => {
  try {
    const proId = c.req.param('proId');
    const body = await c.req.json();
    const delegateId = String(body?.delegateProId ?? '').trim();
    const role = body?.role === 'praticien' ? 'praticien' : 'secretaire';
    if (!delegateId) return c.json(err('delegateProId requis'), 400);
    if (delegateId === proId) return c.json(err('Impossible de se déléguer à soi-même'), 400);
    const pro: any = await kv.get(`pro:${proId}`);
    if (!pro) return c.json(err('pro introuvable', 404), 404);
    const delegate: any = await kv.get(`pro:${delegateId}`);
    if (!delegate) return c.json(err('Compte pro délégué introuvable'), 404);
    const list: any[] = Array.isArray(pro.delegates) ? pro.delegates : [];
    if (list.some((d) => d.proId === delegateId)) return c.json(ok({ delegates: list, alreadyExists: true }));
    const name = delegate.name?.trim() || `${delegate.firstName ?? ''} ${delegate.lastName ?? ''}`.trim() || 'Pro';
    const next = [...list, { proId: delegateId, name, role, addedAt: new Date().toISOString() }];
    await kv.set(`pro:${proId}`, { ...pro, delegates: next });
    return c.json(ok({ delegates: next }));
  } catch (e) { return c.json(err(`delegate add failed: ${e}`), 500); }
});

app.delete(`${BASE}/pro/:proId/delegates/:delegateProId`, async (c) => {
  try {
    const proId = c.req.param('proId');
    const delegateId = c.req.param('delegateProId');
    const pro: any = await kv.get(`pro:${proId}`);
    if (!pro) return c.json(err('pro introuvable', 404), 404);
    const next = (pro.delegates ?? []).filter((d: any) => d.proId !== delegateId);
    await kv.set(`pro:${proId}`, { ...pro, delegates: next });
    return c.json(ok({ delegates: next }));
  } catch (e) { return c.json(err(`delegate delete failed: ${e}`), 500); }
});

app.get(`${BASE}/pros/:proId/managed`, async (c) => {
  try {
    const proId = c.req.param('proId');
    const all: any[] = (await kv.getByPrefix(`pro:`)) ?? [];
    const managed = all.filter((p) => Array.isArray(p?.delegates) && p.delegates.some((d: any) => d.proId === proId))
      .map((p) => ({
        proId: p.id,
        name: p.name?.trim() || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Praticien',
        specialty: p.specialty ?? '',
        role: (p.delegates.find((d: any) => d.proId === proId)?.role) ?? 'secretaire',
      }));
    return c.json(ok(managed));
  } catch (e) { return c.json(err(`managed list failed: ${e}`), 500); }
});

// ---------- Agenda ICS feed (sync Google/Outlook côté pro) ----------
const FR_MONTHS_ICS: Record<string, number> = {
  janvier: 0, fevrier: 1, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, aout: 7, août: 7, septembre: 8, octobre: 9, novembre: 10, decembre: 11, décembre: 11,
};

function parseFrDate(date?: string, time?: string): Date | null {
  if (!date) return null;
  const m = date.trim().toLowerCase().match(/^(\d{1,2})\s+([a-zéû]+)\s+(\d{4})$/);
  if (!m) return null;
  const month = FR_MONTHS_ICS[m[2]];
  if (month === undefined) return null;
  const [hh, mm] = (time || '00:00').split(':').map((x) => parseInt(x, 10));
  return new Date(parseInt(m[3], 10), month, parseInt(m[1], 10), hh || 0, mm || 0);
}

function dayHourToDate(day: number, hour: number, weekOffset = 0): Date {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow + day + weekOffset * 7);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function icsEscape(s: string): string {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

app.post(`${BASE}/pro/:proId/agenda/feed-token`, async (c) => {
  try {
    const proId = c.req.param('proId');
    const pro: any = await kv.get(`pro:${proId}`);
    if (!pro) return c.json(err('pro introuvable', 404), 404);
    const token = uid().replace(/-/g, '');
    const updated = { ...pro, feedToken: token, feedTokenAt: new Date().toISOString() };
    await kv.set(`pro:${proId}`, updated);
    return c.json(ok({ token }));
  } catch (e) { return c.json(err(`feed-token failed: ${e}`), 500); }
});

app.get(`${BASE}/pro/:proId/agenda.ics`, async (c) => {
  try {
    const proId = c.req.param('proId');
    const token = c.req.query('token');
    const pro: any = await kv.get(`pro:${proId}`);
    if (!pro) return c.text('Pro introuvable', 404);
    if (!token || token !== pro.feedToken) return c.text('Token invalide', 403);
    const slots: any[] = (await kv.getByPrefix(`agendapro:${proId}:`)) ?? [];
    const proName = pro.name?.trim() || `${pro.firstName ?? ''} ${pro.lastName ?? ''}`.trim() || 'Praticien';
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HealthyPage//ProAgenda//FR',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:Healthy Page – ${icsEscape(proName)}`,
      'X-WR-TIMEZONE:UTC',
    ];
    const stamp = icsDate(new Date());
    for (const s of slots) {
      if (!s || s.status === 'cancelled' || s.status === 'free') continue;
      let start: Date | null = null;
      if (s.date) start = parseFrDate(s.date, `${String(s.hour ?? 9).padStart(2, '0')}:00`);
      if (!start) start = dayHourToDate(s.day ?? 0, s.hour ?? 9, 0);
      if (!start) continue;
      const end = new Date(start.getTime() + 30 * 60000);
      const summary = `${s.patient || 'Patient'}${s.motif ? ' · ' + s.motif : ''}`;
      lines.push(
        'BEGIN:VEVENT',
        `UID:slot-${s.id}@healthy-page`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${icsDate(start)}`,
        `DTEND:${icsDate(end)}`,
        `SUMMARY:${icsEscape(summary)}`,
        `LOCATION:${icsEscape(s.type === 'tele' ? 'Téléconsultation' : (pro.cabinet ?? pro.city ?? ''))}`,
        `DESCRIPTION:${icsEscape(`Healthy Page – ${proName}${s.status ? ' (' + s.status + ')' : ''}`)}`,
        'END:VEVENT'
      );
    }
    lines.push('END:VCALENDAR');
    return new Response(lines.join('\r\n'), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="healthy-page-${proId}.ics"`,
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return c.text(`feed failed: ${e}`, 500);
  }
});

// ---------- Waitlist (file d'attente par praticien) ----------
app.get(`${BASE}/pro/:proId/waitlist`, async (c) => {
  try {
    const proId = c.req.param('proId');
    const list = await kv.getByPrefix(`waitlist:${proId}:`);
    return c.json(ok(list));
  } catch (e) { return c.json(err(`waitlist list failed: ${e}`), 500); }
});

app.post(`${BASE}/pro/:proId/waitlist`, async (c) => {
  try {
    const proId = c.req.param('proId');
    const body = await c.req.json();
    if (!body?.patientId) return c.json(err('patientId requis'), 400);
    const existing: any[] = (await kv.getByPrefix(`waitlist:${proId}:`)) ?? [];
    const dup = existing.find((w) => w.patientId === body.patientId);
    if (dup) return c.json(ok(dup));
    const id = uid();
    const record = {
      id,
      proId,
      patientId: body.patientId,
      patientName: body.patientName ?? '',
      patientPhone: body.patientPhone ?? '',
      specialty: body.specialty ?? '',
      desiredFrom: body.desiredFrom ?? null,
      desiredTo: body.desiredTo ?? null,
      createdAt: new Date().toISOString(),
      notifiedAt: null,
    };
    await kv.set(`waitlist:${proId}:${id}`, record);
    return c.json(ok(record));
  } catch (e) { return c.json(err(`waitlist create failed: ${e}`), 500); }
});

app.delete(`${BASE}/pro/:proId/waitlist/:id`, async (c) => {
  try {
    const proId = c.req.param('proId');
    const id = c.req.param('id');
    await kv.del(`waitlist:${proId}:${id}`);
    return c.json(ok({ id }));
  } catch (e) { return c.json(err(`waitlist delete failed: ${e}`), 500); }
});

app.get(`${BASE}/patients/:pid/waitlist`, async (c) => {
  try {
    const pid = c.req.param('pid');
    const all: any[] = (await kv.getByPrefix(`waitlist:`)) ?? [];
    return c.json(ok(all.filter((w) => w?.patientId === pid)));
  } catch (e) { return c.json(err(`waitlist patient list failed: ${e}`), 500); }
});

// ---------- Admin ----------
app.get(`${BASE}/admin/patients`, async (c) => {
  try {
    const all = await kv.getByPrefix("patient:");
    const patients = all.filter((p: any) => p?.id && !p.patientId && !p.relation);
    return c.json(ok(patients));
  } catch (e) {
    console.log(`Error listing patients: ${e}`);
    return c.json(err(`patients list failed: ${e}`), 500);
  }
});

app.get(`${BASE}/admin/rdvs`, async (c) => {
  try {
    const rdvs = await kv.getByPrefix("rdv:");
    return c.json(ok(rdvs));
  } catch (e) {
    console.log(`Error listing rdvs: ${e}`);
    return c.json(err(`rdvs list failed: ${e}`), 500);
  }
});

app.get(`${BASE}/admin/stats`, async (c) => {
  try {
    const [patients, pros, centres, rdvs, growth, famille, meal, contribution, filleul, notification] = await Promise.all([
      kv.getByPrefix("patient:"),
      kv.getByPrefix("pro:"),
      kv.getByPrefix("centre:"),
      kv.getByPrefix("rdv:"),
      kv.getByPrefix("growth:"),
      kv.getByPrefix("famille:"),
      kv.getByPrefix("meal:"),
      kv.getByPrefix("contribution:"),
      kv.getByPrefix("filleul:"),
      kv.getByPrefix("notification:"),
    ]);
    const realPatients = patients.filter((p: any) => p?.id && !p.patientId && !p.relation);
    const diaspora = (famille as any[]).filter((f: any) => f?.diaspora === true).length;
    return c.json(ok({
      patients: realPatients.length,
      pros: pros.length,
      centres: centres.length,
      rdvs: rdvs.length,
      growth: growth.length,
      famille: famille.length,
      diaspora,
      meals: meal.length,
      contributions: contribution.length,
      filleuls: filleul.length,
      notifications: notification.length,
    }));
  } catch (e) {
    console.log(`Error computing stats: ${e}`);
    return c.json(err(`stats failed: ${e}`), 500);
  }
});

// ---------- Podcast state (multi-device sync) ----------
const podcastStateKey = (pid: string) => `patient:${pid}:podcast-state`;

type PodcastHistoryEntry = { id: string; at: number; pos: number; duration?: number };
type PodcastState = { favs: string[]; downloads: string[]; history: PodcastHistoryEntry[] };

const emptyPodcastState = (): PodcastState => ({ favs: [], downloads: [], history: [] });

const sanitizePodcastState = (raw: any): PodcastState => {
  const favs = Array.isArray(raw?.favs) ? raw.favs.filter((x: unknown) => typeof x === "string") : [];
  const downloads = Array.isArray(raw?.downloads) ? raw.downloads.filter((x: unknown) => typeof x === "string") : [];
  const history: PodcastHistoryEntry[] = Array.isArray(raw?.history)
    ? raw.history
        .filter((h: any) => h && typeof h.id === "string" && typeof h.at === "number" && typeof h.pos === "number")
        .map((h: any) => ({ id: h.id, at: h.at, pos: h.pos, duration: typeof h.duration === "number" ? h.duration : undefined }))
        .slice(0, 50)
    : [];
  return { favs: Array.from(new Set(favs)), downloads: Array.from(new Set(downloads)), history };
};

app.get(`${BASE}/patients/:id/podcast-state`, async (c) => {
  try {
    const id = c.req.param("id");
    const state = (await kv.get(podcastStateKey(id))) ?? emptyPodcastState();
    return c.json(ok(state));
  } catch (e) {
    console.log(`Error reading podcast state: ${e}`);
    return c.json(err(`failed: ${e}`), 500);
  }
});

app.put(`${BASE}/patients/:id/podcast-state`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const state = sanitizePodcastState(body);
    await kv.set(podcastStateKey(id), state);
    return c.json(ok(state));
  } catch (e) {
    console.log(`Error saving podcast state: ${e}`);
    return c.json(err(`failed: ${e}`), 500);
  }
});

// ---------- Podcast transcription via OpenAI Whisper ----------
type TimedWord = { w: string; t: number };
type TranscriptCache = { words: TimedWord[]; lang: string; cachedAt: number };
const transcriptKey = (episodeId: string) => `podcast:${episodeId}:transcript`;

async function callWhisper(audioUrl: string): Promise<{ words: TimedWord[]; lang: string }> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) throw new Error(`audio fetch failed: ${audioRes.status}`);
  const audioBlob = await audioRes.blob();

  const guessedName = audioUrl.split("?")[0].split("/").pop() || "audio.mp3";
  const form = new FormData();
  form.append("file", audioBlob, guessedName);
  form.append("model", "whisper-1");
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "word");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`whisper failed: ${res.status} ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  const lang = typeof json.language === "string" ? json.language : "fr";

  let words: TimedWord[] = [];
  if (Array.isArray(json.words) && json.words.length) {
    words = json.words
      .filter((w: any) => typeof w?.word === "string" && typeof w?.start === "number")
      .map((w: any) => ({ w: w.word.trim(), t: Math.round(w.start * 10) / 10 }))
      .filter((w: TimedWord) => w.w.length > 0);
  } else if (Array.isArray(json.segments) && json.segments.length) {
    for (const seg of json.segments) {
      if (typeof seg.text !== "string" || typeof seg.start !== "number" || typeof seg.end !== "number") continue;
      const tokens = seg.text.trim().split(/\s+/).filter(Boolean);
      const span = Math.max(seg.end - seg.start, 0.1);
      const step = span / Math.max(tokens.length, 1);
      tokens.forEach((tok: string, i: number) => words.push({ w: tok, t: Math.round((seg.start + i * step) * 10) / 10 }));
    }
  }
  return { words, lang };
}

app.post(`${BASE}/podcast/:id/transcribe`, async (c) => {
  try {
    const episodeId = c.req.param("id");
    const { audioUrl, force } = await c.req.json().catch(() => ({}));
    if (!audioUrl || typeof audioUrl !== "string") return c.json(err("audioUrl required"), 400);

    if (!force) {
      const cached = (await kv.get(transcriptKey(episodeId))) as TranscriptCache | undefined;
      if (cached?.words?.length) {
        return c.json(ok({ words: cached.words, lang: cached.lang, cached: true }));
      }
    }

    const { words, lang } = await callWhisper(audioUrl);
    const payload: TranscriptCache = { words, lang, cachedAt: Date.now() };
    await kv.set(transcriptKey(episodeId), payload);
    return c.json(ok({ words, lang, cached: false }));
  } catch (e) {
    console.log(`Whisper transcription failed: ${e}`);
    return c.json(err(`transcribe failed: ${e}`), 500);
  }
});

// ---------- Podcast feed & notifications ----------
type PodcastFeedItem = {
  id: string; title: string; cat: string; host: string; duration: string; cover: string;
  lang: string; publishedAt: number;
};

const FEED_KEY = "podcast:feed";
const subKey = (pid: string) => `patient:${pid}:podcast-notif`;

app.get(`${BASE}/podcast/feed`, async (c) => {
  try {
    const lang = c.req.query("lang");
    const since = Number(c.req.query("since") ?? 0);
    const items = ((await kv.get(FEED_KEY)) ?? []) as PodcastFeedItem[];
    const filtered = items
      .filter((i) => (!lang || i.lang === lang) && i.publishedAt > since)
      .sort((a, b) => b.publishedAt - a.publishedAt);
    return c.json(ok(filtered));
  } catch (e) {
    console.log(`Feed read failed: ${e}`);
    return c.json(err(`feed failed: ${e}`), 500);
  }
});

app.post(`${BASE}/podcast/episodes`, async (c) => {
  try {
    const body = await c.req.json();
    if (!body?.id || !body?.title) return c.json(err("id and title required"), 400);
    const items = ((await kv.get(FEED_KEY)) ?? []) as PodcastFeedItem[];
    const item: PodcastFeedItem = {
      id: String(body.id),
      title: String(body.title),
      cat: String(body.cat ?? "general"),
      host: String(body.host ?? ""),
      duration: String(body.duration ?? ""),
      cover: String(body.cover ?? ""),
      lang: String(body.lang ?? "fr"),
      publishedAt: typeof body.publishedAt === "number" ? body.publishedAt : Date.now(),
    };
    const next = [item, ...items.filter((i) => i.id !== item.id)].slice(0, 200);
    await kv.set(FEED_KEY, next);
    return c.json(ok(item));
  } catch (e) {
    console.log(`Feed publish failed: ${e}`);
    return c.json(err(`publish failed: ${e}`), 500);
  }
});

app.put(`${BASE}/patients/:id/podcast-notif`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const sub = {
      enabled: !!body?.enabled,
      lang: typeof body?.lang === "string" ? body.lang : "fr",
      lastSeenAt: typeof body?.lastSeenAt === "number" ? body.lastSeenAt : Date.now(),
      endpoint: typeof body?.endpoint === "string" ? body.endpoint : null,
      keys: body?.keys && typeof body.keys === "object" ? body.keys : null,
      updatedAt: Date.now(),
    };
    await kv.set(subKey(id), sub);
    return c.json(ok(sub));
  } catch (e) {
    console.log(`Notif sub failed: ${e}`);
    return c.json(err(`subscribe failed: ${e}`), 500);
  }
});

app.get(`${BASE}/patients/:id/podcast-notif`, async (c) => {
  try {
    const id = c.req.param("id");
    const sub = (await kv.get(subKey(id))) ?? null;
    return c.json(ok(sub));
  } catch (e) {
    return c.json(err(`read failed: ${e}`), 500);
  }
});

// ---------- Triage IA (Claude) ----------
import Anthropic from "npm:@anthropic-ai/sdk";

const TRIAGE_SYSTEM = `Tu es un assistant médical de triage pour Healthy Page, plateforme santé au Bénin et en Afrique.
Tu reçois la description en langage naturel d'un patient (symptômes, durée, contexte).
Tu dois renvoyer STRICTEMENT un objet JSON avec ces champs:
- urgency: "urgence" (appel SAMU/166 immédiat), "conseil" (téléconsultation rapide < 24h), ou "rdv" (consultation programmée).
- specialty: une spécialité médicale française parmi: "Médecine générale", "Cardiologie", "Pneumologie", "Neurologie", "Gastro-entérologie", "Pédiatrie", "Gynécologie", "Dermatologie", "Ophtalmologie", "ORL", "Orthopédie", "Urgences", "Psychiatrie", "Endocrinologie", "Urologie", "Infectiologie".
- reasoning: 1-2 phrases en français expliquant ton raisonnement au patient (ton bienveillant, vouvoiement).
- redFlags: liste de signes d'alerte détectés (vide si aucun).
- followUpQuestions: 2 à 4 questions précises à poser pour affiner le triage.
Sois prudent: en cas de doute sérieux (douleur thoracique, signe AVC, dyspnée brutale, perte de conscience, fièvre + raideur de nuque, hémorragie), classe en "urgence". Ne donne JAMAIS de diagnostic définitif ni de prescription.`;

app.post(`${BASE}/triage/ai`, async (c) => {
  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) return c.json(err("ANTHROPIC_API_KEY manquant côté serveur.", 500), 500);
    const body = await c.req.json().catch(() => ({}));
    const description = String(body?.description ?? "").trim();
    const age = body?.age ? `Âge: ${body.age}. ` : "";
    const sex = body?.sex ? `Sexe: ${body.sex}. ` : "";
    const context = body?.context ? `Contexte: ${body.context}. ` : "";
    if (description.length < 5) return c.json(err("Description trop courte.", 400), 400);
    if (description.length > 2000) return c.json(err("Description trop longue (max 2000).", 400), 400);

    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system: [
        { type: "text", text: TRIAGE_SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              urgency: { type: "string", enum: ["urgence", "conseil", "rdv"] },
              specialty: { type: "string" },
              reasoning: { type: "string" },
              redFlags: { type: "array", items: { type: "string" } },
              followUpQuestions: { type: "array", items: { type: "string" } },
            },
            required: ["urgency", "specialty", "reasoning", "redFlags", "followUpQuestions"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        { role: "user", content: `${age}${sex}${context}Description du patient: ${description}` },
      ],
    } as any);

    const textBlock = (msg.content as any[]).find((b) => b.type === "text");
    const raw = textBlock?.text ?? "";
    let parsed: any = null;
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
    }
    if (!parsed) return c.json(err("Réponse IA non parsable.", 502), 502);
    return c.json(ok({
      urgency: parsed.urgency,
      specialty: parsed.specialty,
      reasoning: parsed.reasoning,
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
      followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
      usage: msg.usage ?? null,
    }));
  } catch (e: any) {
    console.log(`Triage IA failed: ${e?.message ?? e}`);
    return c.json(err(`Triage IA échoué: ${e?.message ?? e}`, 500), 500);
  }
});

// ---------- OTP (auth par téléphone) ----------
// Stockage : otp:{normalizedPhone} -> { codeHash, expiresAt, attempts, scope }
// Le code est hashé (SHA-256), TTL 5 min, max 5 tentatives, 1 envoi / 30 s.

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;

function normalizePhone(s: string): string {
  return (s ?? "").replace(/[\s\-+().]/g, "");
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateNumericOtp(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (100000 + (buf[0] % 900000)).toString();
}

app.post(`${BASE}/otp/send`, async (c) => {
  try {
    const { phone, scope } = await c.req.json();
    const normalized = normalizePhone(phone);
    if (normalized.length < 6) return c.json(err("Numéro invalide", 400), 400);
    const allowedScope: "patient" | "pro" | "centre" | "admin" =
      ["patient", "pro", "centre", "admin"].includes(scope) ? scope : "patient";

    const key = `otp:${normalized}`;
    const existing = await kv.get(key);
    if (existing && typeof existing === "object" && existing.lastSentAt) {
      const elapsed = Date.now() - Number(existing.lastSentAt);
      if (elapsed < OTP_RESEND_COOLDOWN_MS) {
        const wait = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
        return c.json(err(`Patientez ${wait}s avant un nouvel envoi`, 429), 429);
      }
    }

    const code = generateNumericOtp();
    const codeHash = await sha256Hex(code + ":" + normalized);
    await kv.set(key, {
      codeHash,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
      scope: allowedScope,
      lastSentAt: Date.now(),
    });

    // En l'absence de fournisseur SMS configuré, on retourne le code dans la
    // réponse uniquement si DEMO_OTP=1 (variable d'env). Sinon, le code n'est
    // jamais exposé au client — il faudra brancher un provider SMS réel.
    const demo = Deno.env.get("DEMO_OTP") === "1";
    return c.json(ok({ sent: true, ttlSeconds: OTP_TTL_MS / 1000, scope: allowedScope, demoCode: demo ? code : null }));
  } catch (e) {
    return c.json(err(`OTP send failed: ${(e as Error).message}`, 500), 500);
  }
});

app.post(`${BASE}/otp/verify`, async (c) => {
  try {
    const { phone, code } = await c.req.json();
    const normalized = normalizePhone(phone);
    if (normalized.length < 6 || !code) return c.json(err("Numéro et code requis", 400), 400);

    const key = `otp:${normalized}`;
    const rec = await kv.get(key);
    if (!rec || typeof rec !== "object") return c.json(err("Aucun code en attente", 404), 404);
    if (Number(rec.expiresAt) < Date.now()) {
      await kv.del(key);
      return c.json(err("Code expiré", 410), 410);
    }
    if (Number(rec.attempts) >= OTP_MAX_ATTEMPTS) {
      await kv.del(key);
      return c.json(err("Trop de tentatives", 429), 429);
    }
    const hash = await sha256Hex(String(code) + ":" + normalized);
    if (hash !== rec.codeHash) {
      await kv.set(key, { ...rec, attempts: Number(rec.attempts) + 1 });
      return c.json(err("Code incorrect", 401), 401);
    }
    await kv.del(key);
    return c.json(ok({ verified: true, scope: rec.scope }));
  } catch (e) {
    return c.json(err(`OTP verify failed: ${(e as Error).message}`, 500), 500);
  }
});

Deno.serve(app.fetch);
