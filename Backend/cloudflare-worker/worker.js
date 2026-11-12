/* eslint-disable */
// ============================================================================
// worker.js — Cloudflare Worker backend for Jagannath Yatra
// UPDATED: Backward-compatible with admin.tsx, payment.tsx, pass.tsx, registration.tsx
//
// Routes:
//   POST   /api/registrations                       — create new registration
//   GET    /api/registrations                       — list all (returns array)
//   GET    /api/registrations/mobile/:mobile        — get by mobile (returns array)
//   GET    /api/registrations/:id                   — get by _id (returns object)
//   PUT    /api/registrations/:id                   — update (returns updated doc)
//   PUT    /api/registrations/allocate/:id          — update room/hotel (returns updated doc)
//   DELETE /api/registrations/:id                   — delete
//   GET    /api/health                              — health check
// ============================================================================

import { MongoClient, ObjectId } from "mongodb";

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// ---------------------------------------------------------------------------
// MONGODB CONNECTION
// ---------------------------------------------------------------------------
let cachedClient = null;

async function getDb(env) {
  if (cachedClient) {
    try {
      await cachedClient.db().command({ ping: 1 });
      return cachedClient.db(env.MONGO_DATABASE || "jagannath");
    } catch {
      cachedClient = null;
    }
  }
  const client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client.db(env.MONGO_DATABASE || "jagannath");
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS,
  });
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function toObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

// Convert Mongo doc for JSON response
function serialize(doc) {
  if (!doc) return null;
  const out = { ...doc };
  if (out._id) out._id = out._id.toString();
  if (out.createdAt instanceof Date) out.createdAt = out.createdAt.toISOString();
  if (out.paymentInitiatedAt instanceof Date)
    out.paymentInitiatedAt = out.paymentInitiatedAt.toISOString();
  if (Array.isArray(out.paymentHistory)) {
    out.paymentHistory = out.paymentHistory.map((p) => {
      const c = { ...p };
      if (c.date instanceof Date) c.date = c.date.toISOString();
      return c;
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// ROUTE HANDLERS
// ---------------------------------------------------------------------------

// POST /api/registrations — create new
// Returns { success, id, message } — registration.tsx uses result.id
async function createRegistration(request, env) {
  const body = await readBody(request);
  const db = await getDb(env);
  const now = new Date();

  const doc = {
    name: body.name || "",
    mobile: body.mobile || "",
    whatsapp: body.whatsapp || "",
    aadhaar: body.aadhaar || "",
    city: body.city || "",
    station: body.station || "",
    roomType: body.roomType || "sharing",
    coachType: body.coachType || "sleeper",
    emergencyName: body.emergencyName || "",
    emergencyRelation: body.emergencyRelation || "",
    emergencyPhone: body.emergencyPhone || "",
    count: body.count || 1,
    coTravellers: body.coTravellers || [],
    verificationStatus: "Pending",
    paymentStatus: "Pending",
    totalPaid: 0,
    paymentMethod: "",
    paymentInitiatedAt: null,
    paymentHistory: [],
    roomNumber: "",
    hotelName: "",
    createdAt: now,
  };

  const result = await db.collection("registrations").insertOne(doc);
  return jsonResponse({
    success: true,
    id: result.insertedId.toString(),
    message: "पंजीकरण सफलतापूर्वक दर्ज हो गया है।",
  });
}

// GET /api/registrations — list all
// Returns ARRAY directly (admin.tsx uses Array.isArray() check)
async function listRegistrations(env) {
  const db = await getDb(env);
  const docs = await db.collection("registrations").find({}).toArray();
  return jsonResponse(docs.map(serialize));
}

// GET /api/registrations/mobile/:mobile
// Returns ARRAY directly (pass.tsx uses Array.isArray() check)
async function getByMobile(mobile, env) {
  const db = await getDb(env);
  const docs = await db
    .collection("registrations")
    .find({ mobile })
    .toArray();
  if (docs.length === 0) {
    return jsonResponse(
      { error: "No registrations found for this mobile" },
      404
    );
  }
  return jsonResponse(docs.map(serialize));
}

// GET /api/registrations/:id
// Returns OBJECT directly (admin.tsx Full Details page)
async function getById(id, env) {
  const oid = toObjectId(id);
  if (!oid) {
    return jsonResponse({ error: "Invalid ID format" }, 400);
  }
  const db = await getDb(env);
  const doc = await db.collection("registrations").findOne({ _id: oid });
  if (!doc) {
    return jsonResponse({ error: "Not found" }, 404);
  }
  return jsonResponse(serialize(doc));
}

// PUT /api/registrations/:id — update fields
// Body may include:
//   - any field to $set (paymentStatus, totalPaid, paymentMethod, etc.)
//   - newPaymentEntry: {amount, date} → pushed to paymentHistory array
//   - paymentInitiatedAt as ISO string → converted to Date
// Returns the UPDATED DOCUMENT (admin.tsx uses updatedReg._id etc.)
async function updateRegistration(id, request, env) {
  const oid = toObjectId(id);
  if (!oid) {
    return jsonResponse({ error: "Invalid ID format" }, 400);
  }
  const body = await readBody(request);

  // Extract special fields that need different handling
  const newPaymentEntry = body.newPaymentEntry;
  delete body.newPaymentEntry;

  // Convert ISO date strings to Date objects
  for (const key of ["paymentInitiatedAt", "createdAt"]) {
    if (body[key] && typeof body[key] === "string") {
      body[key] = new Date(body[key]);
    }
  }

  // BUG FIX (server-side safety): keep verificationStatus in sync with paymentStatus.
  // The admin UI sets paymentStatus to "Verified"/"Partially Paid"/"Fully Paid" when
  // a token/payment is received. The /pass page unlocks only when verificationStatus
  // === "verified". To guarantee the two fields never drift apart again — regardless
  // of which client calls this PUT (admin UI, direct API call, future code) — we
  // derive verificationStatus from paymentStatus here, with paymentStatus as the
  // single source of truth.
  const VERIFIED_PAYMENT_STATES = ["Verified", "Partially Paid", "Fully Paid"];
  if (body.paymentStatus !== undefined) {
    body.verificationStatus = VERIFIED_PAYMENT_STATES.includes(body.paymentStatus)
      ? "verified"
      : "Pending";
  }

  // Build update document
  const updateDoc = {};
  if (Object.keys(body).length > 0) updateDoc.$set = body;
  if (newPaymentEntry) {
    // Ensure date is stored properly
    if (newPaymentEntry.date && typeof newPaymentEntry.date === "string") {
      // Try parsing as date; if invalid, keep as string (admin sends "15 Nov" which is fine)
      const parsed = new Date(newPaymentEntry.date);
      if (!isNaN(parsed.getTime()) && newPaymentEntry.date.length > 6) {
        newPaymentEntry.date = parsed;
      }
    }
    updateDoc.$push = { paymentHistory: newPaymentEntry };
  }

  if (Object.keys(updateDoc).length === 0) {
    return jsonResponse({ error: "No fields to update" }, 400);
  }

  const db = await getDb(env);
  const result = await db
    .collection("registrations")
    .updateOne({ _id: oid }, updateDoc);

  if (result.matchedCount === 0) {
    return jsonResponse({ error: "Not found" }, 404);
  }

  // Fetch and return the updated document — admin.tsx expects this
  const updatedDoc = await db.collection("registrations").findOne({ _id: oid });
  return jsonResponse(serialize(updatedDoc));
}

// PUT /api/registrations/allocate/:id — allocate room
// Body: { hotelName, roomNumber }
// Returns the UPDATED DOCUMENT
async function allocateRoom(id, request, env) {
  const oid = toObjectId(id);
  if (!oid) {
    return jsonResponse({ error: "Invalid ID format" }, 400);
  }
  const body = await readBody(request);

  const updateDoc = {
    $set: {
      hotelName: body.hotelName || "",
      roomNumber: body.roomNumber || "",
    },
  };

  const db = await getDb(env);
  const result = await db
    .collection("registrations")
    .updateOne({ _id: oid }, updateDoc);

  if (result.matchedCount === 0) {
    return jsonResponse({ error: "Not found" }, 404);
  }

  const updatedDoc = await db.collection("registrations").findOne({ _id: oid });
  return jsonResponse(serialize(updatedDoc));
}

// DELETE /api/registrations/:id
async function deleteRegistration(id, env) {
  const oid = toObjectId(id);
  if (!oid) {
    return jsonResponse({ error: "Invalid ID format" }, 400);
  }
  const db = await getDb(env);
  const result = await db.collection("registrations").deleteOne({ _id: oid });
  if (result.deletedCount === 0) {
    return jsonResponse({ error: "Not found" }, 404);
  }
  return jsonResponse({ success: true, message: "Deleted successfully" });
}

// ---------------------------------------------------------------------------
// MAIN WORKER ENTRY POINT
// ---------------------------------------------------------------------------
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      // Health check
      if (path === "/api/health") {
        return jsonResponse({
          success: true,
          message: "Jagannath Worker is alive",
          timestamp: new Date().toISOString(),
        });
      }

      // POST /api/registrations
      if (path === "/api/registrations" && method === "POST") {
        return await createRegistration(request, env);
      }

      // GET /api/registrations (all)
      if (path === "/api/registrations" && method === "GET") {
        return await listRegistrations(env);
      }

      // GET /api/registrations/mobile/:mobile
      const mobileMatch = path.match(/^\/api\/registrations\/mobile\/(\d+)$/);
      if (mobileMatch && method === "GET") {
        return await getByMobile(mobileMatch[1], env);
      }

      // PUT /api/registrations/allocate/:id (must check BEFORE /:id route)
      const allocateMatch = path.match(
        /^\/api\/registrations\/allocate\/([a-f0-9]{24})$/
      );
      if (allocateMatch && method === "PUT") {
        return await allocateRoom(allocateMatch[1], request, env);
      }

      // /api/registrations/:id (GET, PUT, DELETE)
      const idMatch = path.match(/^\/api\/registrations\/([a-f0-9]{24})$/);
      if (idMatch) {
        const id = idMatch[1];
        if (method === "GET") return await getById(id, env);
        if (method === "PUT") return await updateRegistration(id, request, env);
        if (method === "DELETE") return await deleteRegistration(id, env);
      }

      // Unknown route
      return jsonResponse(
        { error: `Route not found: ${method} ${path}` },
        404
      );
    } catch (err) {
      console.error("Worker error:", err);
      return jsonResponse(
        {
          error: "Internal server error",
          message: err.message,
        },
        500
      );
    }
  },
};
