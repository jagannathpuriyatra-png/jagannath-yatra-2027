/* eslint-disable */
// ============================================================================
// PassPage.tsx — Automatic Yatri Pass Generation with decorative template
//
// Uses the user-uploaded original decorative template (Image 1.png) as a fixed
// background image, with 4 dynamic fields positioned by percentage coordinates
// so they scale identically on mobile, desktop, PDF preview, and print.
//
// Required npm package (install once):
//   npm install html2canvas
//
// (jsPDF is NOT needed — we export JPG, not PDF.)
//
// Background image must be at:
//   public/assets/pass-template.png   (1086 × 1448 — your Image 1.png)
//
// Backend API expected:
//   GET /api/registrations/mobile/:mobile  →  returns Yatri document(s)
//
//   Each Yatri document should contain at least:
//     { _id, name, mobile, coTravellers: [{name, age, gender}], verificationStatus }
// ============================================================================

import { useState, useRef, useEffect, type FormEvent, type CSSProperties } from "react";
import { A } from "@/components/A";
import { Header } from "@/components/Header";

// --------------------------------------------------------------------------
// CONFIGURATION
// --------------------------------------------------------------------------

const PASS_TEMPLATE = "/assets/pass-template.png";
const BACKEND_URL = "https://jagannath-backend.jagannath1.workers.dev/api";

// Field coordinates as % of the 1086 × 1448 template.
// User-supplied and verified against the actual template via VLM analysis.
// Name field height increased from 5.5% → 7% to prevent text clipping
// (mobile box starts at 48.8%, so 42.3% + 7% = 49.3% — still safe, doesn't overlap visually).
const FIELDS = {
  name:  { x: 23,   y: 41.8, w: 51,   h: 7    },  // taller + slightly higher for vertical centering
  mobile:{ x: 29,   y: 48.8, w: 39,   h: 3.8  },
  qr:    { x: 35.6, y: 53.6, w: 26,   h: 18.5 },
  regId: { x: 31.8, y: 72.9, w: 33.7, h: 3.8  },
} as const;

// Original template dimensions (used for JPG export resolution)
const TEMPLATE_W = 1086;
const TEMPLATE_H = 1448;

// Short ID helper — converts MongoDB's 24-char _id into a short human-readable ID.
// Uses the last 6 hex chars uppercased (e.g. "507f1f77bcf86cd799439011" → "994301").
// Last 6 hex chars give 16^6 ≈ 16 million unique values — more than enough for a yatra.
function shortId(fullId: string): string {
  if (!fullId) return "------";
  const cleaned = String(fullId).trim();
  // Already short? return as-is uppercased
  if (cleaned.length <= 6) return cleaned.toUpperCase();
  return cleaned.slice(-6).toUpperCase();
}

// Hindi-friendly font stack — html2canvas will use whichever is installed locally.
// "Noto Sans Devanagari" / "Mangal" / "Lohit Devanagari" cover Windows + Linux + macOS.
const DEV_FONT = '"Noto Sans Devanagari", "Mangal", "Lohit Devanagari", "Kohinoor Devanagari", sans-serif';

// Dark navy blue colour seen in the template subtitle text — blends with design.
const TEXT_COLOR = "#1F3A93";

// --------------------------------------------------------------------------
// TYPES
// --------------------------------------------------------------------------

interface CoTraveller { name: string; age: string; gender: string }
interface Yatri {
  _id: string;
  name: string;
  mobile: string;
  coTravellers?: CoTraveller[];
  verificationStatus?: string;
  paymentStatus?: string;
  totalPaid?: number;
}

interface PassData {
  passId: string;       // unique per pass (main + each co-traveller)
  name: string;
  mobile: string;
  regId: string;        // shown on pass
  qrData: string;       // encoded into the QR
  isMain: boolean;
  verified: boolean;
}

// --------------------------------------------------------------------------
// AutoFitText — shrinks font size until text fits inside its container.
// Guarantees NO clipping of Devanagari matras/ascenders/descenders.
// --------------------------------------------------------------------------

function AutoFitText({
  text,
  maxPx,
  minPx,
  color,
  fontWeight,
  fontFamily = DEV_FONT,
}: {
  text: string;
  maxPx: number;
  minPx: number;
  color: string;
  fontWeight: number;
  fontFamily?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxPx);
  const [fontReady, setFontReady] = useState(false);

  // ---- Step 1: Wait for fonts to fully load before measuring ----
  // Without this, measurements use fallback font and the real (often taller)
  // Devanagari font loads later → text gets clipped in the downloaded image.
  useEffect(() => {
    let cancelled = false;
    const waitForFonts = async () => {
      try {
        if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
      } catch (e) {
        // ignore — measurement will still run, just may be less accurate
      }
      // small extra delay to ensure layout is fully stable after font swap
      await new Promise<void>((r) => setTimeout(r, 60));
      if (!cancelled) setFontReady(true);
    };
    waitForFonts();
    return () => { cancelled = true; };
  }, []);

  // ---- Step 2: Auto-fit font size once fonts are ready ----
  useEffect(() => {
    if (!fontReady) return;
    const container = containerRef.current;
    const span = spanRef.current;
    if (!container || !span) return;

    // Binary-search-style: try from max down to min, pick the largest that fits.
    // We measure BOTH scrollWidth (horizontal) and scrollHeight (vertical).
    let fitted = minPx;
    for (let size = maxPx; size >= minPx; size -= 1) {
      span.style.fontSize = `${size}px`;
      const fitsWidth = span.scrollWidth <= container.clientWidth;
      const fitsHeight = span.scrollHeight <= container.clientHeight;
      if (fitsWidth && fitsHeight) {
        fitted = size;
        break;
      }
    }
    setFontSize(fitted);
  }, [text, maxPx, minPx, fontReady]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",       // vertical center
        justifyContent: "center",   // horizontal center
        textAlign: "center",
        padding: "0 4%",
        boxSizing: "border-box",
        // ⚠️ NO overflow: hidden — would clip Devanagari matras (ी, ि, ऊ, ई etc.)
      }}
    >
      <span
        ref={spanRef}
        style={{
          fontFamily,
          fontWeight,
          color,
          fontSize: `${fontSize}px`,
          // 1.35 line-height gives comfortable space for Devanagari ascenders
          // (shirorekha + matras) and descenders (halant etc.) without clipping.
          lineHeight: 1.35,
          wordBreak: "break-word",
          overflowWrap: "break-word",
          maxWidth: "100%",
          display: "inline-block",
          // tiny vertical breathing room so glyph extents don't touch box edges
          padding: "2px 0",
        }}
      >
        {text}
      </span>
    </div>
  );
}

// --------------------------------------------------------------------------
// PassCard — renders a single pass with template background + 4 fields
// --------------------------------------------------------------------------

function PassCard({ data }: { data: PassData }) {
  // Field style factory — percentage-positioned, scales with container
  const fieldStyle = (f: { x: number; y: number; w: number; h: number }): CSSProperties => ({
    position: "absolute",
    left: `${f.x}%`,
    top: `${f.y}%`,
    width: `${f.w}%`,
    height: `${f.h}%`,
    boxSizing: "border-box",
  });

  return (
    <div
      id={`pass-${data.passId}`}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 540,
        aspectRatio: `${TEMPLATE_W} / ${TEMPLATE_H}`,
        margin: "0 auto",
        background: "#f5e6d3", // cream fallback while image loads
      }}
    >
      {/* Background template image — non-distorting, preserves aspect */}
      <img
        src={PASS_TEMPLATE}
        alt="श्री जगन्नाथ धाम यात्रा पास"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
        }}
        crossOrigin="anonymous"
        draggable={false}
      />

      {/* 1. Yatri Name — auto-fit bold */}
      <div style={fieldStyle(FIELDS.name)}>
        <AutoFitText
          text={data.name}
          maxPx={28}
          minPx={12}
          color={TEXT_COLOR}
          fontWeight={700}
        />
      </div>

      {/* 2. Mobile Number — fixed readable size */}
      <div
        style={{
          ...fieldStyle(FIELDS.mobile),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: DEV_FONT,
            fontWeight: 600,
            color: TEXT_COLOR,
            fontSize: "clamp(13px, 3vw, 19px)",
            letterSpacing: "0.5px",
          }}
        >
          {data.mobile}
        </span>
      </div>

      {/* 3. QR Code — high-resolution, scannable, square aspect */}
      <div
        style={{
          ...fieldStyle(FIELDS.qr),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3%",
        }}
      >
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(data.qrData)}`}
          alt="QR Code"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          crossOrigin="anonymous"
          draggable={false}
        />
      </div>

      {/* 4. Registration ID — bold readable */}
      <div
        style={{
          ...fieldStyle(FIELDS.regId),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: DEV_FONT,
            fontWeight: 700,
            color: TEXT_COLOR,
            fontSize: "clamp(13px, 3vw, 19px)",
            letterSpacing: "0.5px",
          }}
        >
          {data.regId}
        </span>
      </div>

      {/* Lock overlay — only when verification pending */}
      {!data.verified && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(245, 230, 211, 0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: 20,
            textAlign: "center",
            borderRadius: 8,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: "#8B0000" }}>
            lock
          </span>
          <span style={{ fontFamily: DEV_FONT, color: "#8B0000", fontWeight: 700, fontSize: 18 }}>
            पास लॉक्ड है
          </span>
          <span style={{ fontFamily: DEV_FONT, color: "#666", fontSize: 13 }}>
            सत्यापन एवं भुगतान प्राप्त होने पर पास सक्रिय होगा
          </span>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// PassPage — search by mobile, list all passes, download PDF
// --------------------------------------------------------------------------

export function PassPage() {
  const [mobile, setMobile] = useState("");
  const [yatris, setYatris] = useState<Yatri[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^\d{10}$/.test(mobile.trim())) {
      setError("कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।");
      return;
    }

    setLoading(true);
    setSearched(true);
    setYatris([]);

    try {
      const res = await fetch(`${BACKEND_URL}/registrations/mobile/${mobile.trim()}`);
      if (res.ok) {
        const data = await res.json();
        // Backend may return single object or array
        const list: Yatri[] = Array.isArray(data) ? data : [data];
        setYatris(list);
      } else if (res.status === 404) {
        setYatris([]);
      } else {
        setError("खोज विफल रही। कृपया पुनः प्रयास करें।");
      }
    } catch (err) {
      console.error("Pass search error:", err);
      setError("सर्वर से कनेक्ट नहीं हो सका। कृपया कुछ क्षण बाद प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  // Build the list of passes to render: main yatri + each co-traveller
  const buildPasses = (y: Yatri): PassData[] => {
const verified = ["verified", "partially paid", "fully paid"]
  .includes((y.paymentStatus || "").toLowerCase());
    const baseId = y._id || "TEMP";
    // Short display ID (last 6 chars of Mongo _id, uppercased) — easy to read aloud / type
    const short = shortId(baseId);
    const passes: PassData[] = [
      {
        passId: `${baseId}-main`,
        name: y.name,
        mobile: y.mobile,
        regId: short,                              // displayed short ID
        qrData: `JAGANNATH|${short}|${y.mobile}`, // QR also uses short ID → smaller, easier to scan
        isMain: true,
        verified,
      },
    ];

    (y.coTravellers || []).forEach((ct, i) => {
      const suffix = `C${i + 2}`; // C2, C3, C4...
      const ctShort = `${short}-${suffix}`;       // e.g. "994301-C2"
      passes.push({
        passId: `${baseId}-${suffix}`,
        name: ct.name || "सह-यात्री",
        mobile: y.mobile,
        regId: ctShort,
        qrData: `JAGANNATH|${ctShort}|${y.mobile}`,
        isMain: false,
        verified,
      });
    });

    return passes;
  };

  const handleDownloadJPG = async (data: PassData) => {
    setDownloadingId(data.passId);
    try {
      // Dynamically load html2canvas only when needed (jsPDF not required for JPG)
      const html2canvas = (await import("html2canvas")).default;

      const element = document.getElementById(`pass-${data.passId}`);
      if (!element) throw new Error("Pass element not found");

      // ---- Step 1: Wait for ALL fonts to fully load ----
      // html2canvas captures the DOM as-is. If fonts aren't loaded yet, it
      // uses fallback font in the canvas → text looks different from preview,
      // and AutoFitText measurements (done with real font) won't match the
      // captured output. Waiting for document.fonts.ready fixes both.
      try {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
        // Also explicitly trigger a layout reflow by reading offsetWidth
        // — forces the browser to apply final font metrics before capture.
        void element.offsetWidth;
        // tiny delay to let any pending font swap finish rendering
        await new Promise<void>((r) => setTimeout(r, 80));
      } catch (e) {
        // proceed even if FontLoadingAPI is unavailable
      }

      // ---- Step 2: Wait for all images (template + QR) to be loaded ----
      const imgs = Array.from(element.querySelectorAll("img"));
      await Promise.all(
        imgs.map((img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
        )
      );

      // ---- Step 3: Render at full original template resolution ----
      // Same DOM, same positioning as preview — just scaled up to 1086px wide
      // so the downloaded JPG matches the on-screen preview exactly.
      const displayWidth = element.offsetWidth;
      const scale = TEMPLATE_W / displayWidth;

      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        width: displayWidth,
        height: element.offsetHeight,
        imageTimeout: 15000,
      });

      // ---- Step 4: Convert canvas to high-quality JPG and trigger download ----
      const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.href = jpgDataUrl;
      link.download = `Jagannath-Pass-${data.name.replace(/\s+/g, "_")}-${data.regId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("JPG generation failed:", err);
      alert("JPG बनाने में समस्या हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setDownloadingId(null);
    }
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased overflow-x-hidden">
      <Header />

      <main className="pt-32 sm:pt-36 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] sm:text-label-sm font-bold mb-3">
            <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
            <span>॥ यात्री पास ॥</span>
          </div>
          <h1 className="text-[22px] sm:text-headline-lg text-primary font-bold">श्री जगन्नाथ धाम यात्री डिजिटल पास</h1>
          <p className="text-[13px] sm:text-body-md text-on-surface-variant mt-2">
            अपना मोबाइल नंबर दर्ज करें और अपना पास डाउनलोड करें
          </p>
        </div>

        {/* Search box */}
        <form
          onSubmit={handleSearch}
          className="max-w-xl mx-auto bg-surface-container-lowest rounded-2xl shadow-md p-4 sm:p-6 mb-8"
        >
          <label className="block font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold mb-2">
            पंजीकरण मोबाइल नंबर <span className="text-error">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="tel"
              pattern="[0-9]{10}"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="10 अंकों का मोबाइल नंबर"
              className="flex-1 h-12 px-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-[15px] sm:text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  खोज रहा है...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  पास देखें
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-error text-[13px] sm:text-label-md font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}
        </form>

        {/* Results */}
        {searched && !loading && yatris.length === 0 && !error && (
          <div className="text-center py-12 max-w-md mx-auto">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant">search_off</span>
            <p className="font-headline-sm text-headline-sm text-on-surface font-bold mt-2">कोई पंजीकरण नहीं मिला</p>
            <p className="text-on-surface-variant mt-1 text-[13px] sm:text-body-md">
              इस मोबाइल नंबर पर कोई यात्री पंजीकृत नहीं है।
            </p>
            <A
              href="/registration"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-md hover:bg-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              अभी पंजीकरण करें
            </A>
          </div>
        )}

        {/* Pass cards */}
        {yatris.length > 0 && (
          <div className="space-y-10 sm:space-y-12">
            {yatris.map((y) => {
            const verified = ["verified", "partially paid", "fully paid"]
               .includes((y.paymentStatus || "").toLowerCase());
              return (
                <div key={y._id} className="space-y-6">
                  {/* Yatri header strip */}
                  <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-headline-sm text-headline-sm text-primary font-bold truncate">{y.name}</p>
                        <p className="text-[12px] sm:text-label-sm text-on-surface-variant">
                          मोबाइल: {y.mobile} · कुल यात्री: {passes.length}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] sm:text-label-sm font-bold ${
                        verified
                          ? "bg-secondary-fixed text-on-secondary-fixed"
                          : "bg-error-container/40 text-error"
                      }`}
                    >
                      {verified ? "✓ सत्यापित" : "सत्यापन लंबित"}
                    </span>
                  </div>

                  {/* Pass grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {passes.map((p) => (
                      <div key={p.passId} className="flex flex-col items-center gap-4">
                        {/* Pass card with template background */}
                        <PassCard data={p} />

                        {/* Download button */}
                        <button
                          onClick={() => handleDownloadJPG(p)}
                          disabled={!verified || downloadingId === p.passId}
                          className={`w-full max-w-[540px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-label-md text-label-md font-bold shadow-md transition-all ${
                            verified
                              ? "bg-primary hover:bg-primary-container text-on-primary"
                              : "bg-surface-container-low text-on-surface-variant cursor-not-allowed"
                          } disabled:opacity-60`}
                        >
                          {downloadingId === p.passId ? (
                            <>
                              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                              JPG बन रहा है...
                            </>
                          ) : verified ? (
                            <>
                              <span className="material-symbols-outlined text-[18px]">download</span>
                              JPG डाउनलोड करें
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[18px]">lock</span>
                              सत्यापन के बाद उपलब्ध
                            </>
                          )}
                        </button>

                        {/* Co-traveller tag */}
                        <span className="text-[11px] sm:text-label-sm text-secondary font-semibold">
                          {p.isMain ? "मुख्य यात्री" : `सह-यात्री · ${p.regId.split("-").pop()}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// Default export — allows route files to do:  import PassPage from "@/components/pages/PassPage"
export default PassPage;
