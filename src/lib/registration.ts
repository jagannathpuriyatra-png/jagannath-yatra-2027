export const TOTAL_PER_PERSON = 12500;
export const TOKEN_PER_PERSON = 2500;
export const UPI_ID = "8954672057@ybl";
export const PHONEPE_NUMBER = "8954672057";

export type CoTraveller = { name: string; age: string; gender: string };
export type PaymentStatus = "unpaid" | "pending";
export type Registration = {
  id: string;
  name: string;
  mobile: string;
  whatsapp: string;
  aadhaar: string;
  city: string;
  station: string;
  roomType: string;
  coachType: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  count: number;
  coTravellers: CoTraveller[];
  createdAt: string;
  paymentStatus: PaymentStatus;
  utr?: string;
  paymentApp?: string;
  screenshotName?: string;
};

/** Sample data mirroring the Stitch design, shown until the user registers. */
export const DEMO_REGISTRATION: Registration = {
  id: "JGD-2027-00125", name: "राजेश शर्मा", mobile: "98260 41258", whatsapp: "", aadhaar: "",
  city: "इंदौर (मध्य प्रदेश)", station: "indore", roomType: "sharing", coachType: "sleeper",
  emergencyName: "", emergencyRelation: "", emergencyPhone: "", count: 2,
  coTravellers: [{ name: "श्रीमती सुनीता शर्मा", age: "44", gender: "female" }],
  createdAt: "2026-10-12", paymentStatus: "unpaid",
};

const KEY = "jgd_registrations";
const CURRENT = "jgd_current_registration";

export const inr = (n: number) => n.toLocaleString("en-IN");
export const totalsFor = (count: number) => ({
  total: count * TOTAL_PER_PERSON,
  token: count * TOKEN_PER_PERSON,
  remaining: count * (TOTAL_PER_PERSON - TOKEN_PER_PERSON),
});

function readAll(): Registration[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function writeAll(list: Registration[]) { localStorage.setItem(KEY, JSON.stringify(list)); }

export function generateRegistrationId() {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `JGD-2027-${n}`;
}

export function saveRegistration(data: Omit<Registration, "id" | "createdAt" | "paymentStatus">) {
  const reg: Registration = { ...data, id: generateRegistrationId(), createdAt: new Date().toISOString(), paymentStatus: "unpaid" };
  writeAll([...readAll(), reg]);
  localStorage.setItem(CURRENT, reg.id);
  return reg;
}

export function getCurrentRegistration(): Registration | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(CURRENT);
  return readAll().find((r) => r.id === id) ?? null;
}

export function findRegistration(id: string, mobile: string): Registration | null {
  const cleanMobile = mobile.replace(/\D/g, "");
  const cleanId = id.trim().toUpperCase();
  return readAll().find((r) => (cleanId && r.id === cleanId) || (!cleanId && cleanMobile && r.mobile === cleanMobile)) ?? null;
}

export function submitPayment(id: string, info: { utr: string; paymentApp: string; screenshotName: string }) {
  const list = readAll().map((r) => (r.id === id ? { ...r, ...info, paymentStatus: "pending" as const } : r));
  writeAll(list);
}

export function setCurrentRegistration(id: string) { localStorage.setItem(CURRENT, id); }
