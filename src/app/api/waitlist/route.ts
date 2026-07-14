import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const INDUSTRIES = new Set([
  "Fintech",
  "Healthtech",
  "E-commerce & Retail",
  "Marketing & AdTech",
  "HR & Recruiting",
  "Developer Tools",
  "Cybersecurity",
  "Education (EdTech)",
  "Real Estate (PropTech)",
  "Data & Analytics",
  "Productivity & Collaboration",
  "Customer Support",
  "Sales & CRM",
  "Logistics & Supply Chain",
  "Legal (LegalTech)",
  "Other",
]);

const ERROR_SAVE = "We couldn’t save your signup. Please try again.";

type WaitlistRequest = {
  first?: unknown;
  last?: unknown;
  email?: unknown;
  website?: unknown;
  industry?: unknown;
  agreed?: unknown;
  company?: unknown;
};

const jsonError = (status: number, error: string) =>
  NextResponse.json({ ok: false, error }, { status });

const trimString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const validEmail = (value: string) =>
  value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validHostname = (hostname: string) => {
  if (!hostname || hostname.length > 253 || hostname.includes("..")) return false;
  const parts = hostname.split(".");
  if (parts.length < 2) return false;
  return (
    /^[a-z]{2,63}$/i.test(parts[parts.length - 1]) &&
    parts.every((part) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(part))
  );
};

const normalizeWebsite = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2048 || /\s/.test(trimmed)) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;

    const hostname = url.hostname.toLowerCase();
    if (!validHostname(hostname)) return null;

    return `https://${hostname}${url.port ? `:${url.port}` : ""}`;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  let body: WaitlistRequest;

  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid signup details.");
  }

  if (typeof body !== "object" || body === null) {
    return jsonError(400, "Invalid signup details.");
  }

  const allowedKeys = new Set(["first", "last", "email", "website", "industry", "agreed", "company"]);
  if (Object.keys(body).some((key) => !allowedKeys.has(key))) {
    return jsonError(400, "Invalid signup details.");
  }

  if (trimString(body.company) !== "") {
    return jsonError(400, "Invalid signup details.");
  }

  const first = trimString(body.first);
  const last = trimString(body.last);
  const email = trimString(body.email).toLowerCase();
  const industry = trimString(body.industry);
  const companyWebsite = normalizeWebsite(trimString(body.website));

  if (!first || first.length > 80) {
    return jsonError(400, "Enter your first name.");
  }
  if (!last || last.length > 80) {
    return jsonError(400, "Enter your last name.");
  }
  if (!validEmail(email)) {
    return jsonError(400, "Enter a valid email address.");
  }
  if (!companyWebsite) {
    return jsonError(400, "Enter a valid company website.");
  }
  if (!industry || industry.length > 80 || !INDUSTRIES.has(industry)) {
    return jsonError(400, "Select an industry.");
  }
  if (body.agreed !== true) {
    return jsonError(400, "Please agree to receive waitlist updates.");
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return jsonError(500, ERROR_SAVE);
  }

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await supabase.from("waitlist_signups").insert({
    first_name: first,
    last_name: last,
    email,
    company_website: companyWebsite,
    industry,
    consent_given: true,
    consent_at: new Date().toISOString(),
    status: "new",
    source: "landing_page",
  });

  if (error) {
    if (error.code === "23505") {
      return jsonError(409, "You’re already on the waitlist.");
    }

    return jsonError(500, ERROR_SAVE);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
