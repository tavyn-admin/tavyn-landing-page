"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Section from "@/components/Section";
import { COLORS, DESIGN_H } from "@/components/tokens";

/* ---------------------------------------------------------------------------------------
 * Join Waitlist page (Figma 237:1545) + Thank-you view (Figma 245:1833).
 *
 * The form lives in a scaled 1440×780 stage (like the landing sections). On a valid submit
 * the Join button widens, and clicking it wipes the brand gradient across the whole screen;
 * the gradient then settles to a faint tint and the thank-you view fades in with a back
 * button (→ hero).
 * ------------------------------------------------------------------------------------- */

const INDUSTRIES = [
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
];

const PILL_BG = "#080809";
const PLACEHOLDER = "#8a8f98";
const PILL_RADIUS = 74.576;
const FIELD_H = 64.8;
const PILL_PL = 49.717;
const PILL_PR = 24.3;
const TEXT_SIZE = 12.96;
const TEXT_LS = "-0.2592px";

const FILL_GRADIENT = "linear-gradient(to right, #FFC100, #FF7400, #FF0000)";
const emailValid = (v: string) => /\S+@\S+\.\S+/.test(v);
const normalizeWebsite = (v: string) => v.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "");
const websiteValid = (v: string) => {
  const host = normalizeWebsite(v);
  if (!host || host.length > 253 || host.includes("..")) return false;
  const parts = host.split(".");
  if (parts.length < 2) return false;
  return parts.every((part) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(part)) && /^[a-z]{2,63}$/i.test(parts[parts.length - 1]);
};

type Mode = "form" | "fill" | "dim" | "thanks";
type WaitlistSubmission = {
  first: string;
  last: string;
  email: string;
  website: string;
  industry: string;
  agreed: boolean;
};

export default function WaitlistPage() {
  const router = useRouter();

  // Match the landing page's viewport-height scaling so the pills render at the Figma size.
  useEffect(() => {
    const setScale = () =>
      document.documentElement.style.setProperty(
        "--section-scale",
        String(window.innerHeight / DESIGN_H)
      );
    setScale();
    window.addEventListener("resize", setScale);
    return () => window.removeEventListener("resize", setScale);
  }, []);

  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [website, setWebsite] = useState("");
  const [websiteTouched, setWebsiteTouched] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [joinHover, setJoinHover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [company, setCompany] = useState("");
  const submissionRef = useRef<WaitlistSubmission | null>(null);

  const [mode, setMode] = useState<Mode>("form");
  const [expanded, setExpanded] = useState(false);
  const originRef = useRef({ x: 0, y: 0 });

  const valid =
    first.trim() !== "" &&
    last.trim() !== "" &&
    websiteValid(website) &&
    emailValid(email) &&
    !!industry &&
    agreed;
  const canJoin = valid && !submitting;
  const showWebsiteError = (websiteTouched || attemptedSubmit) && !websiteValid(website);

  // Choreography: header fades → gradient blasts to full-screen and holds → opacity drops
  // to 10% → the card + back button load in.
  useEffect(() => {
    if (mode === "fill") {
      const t1 = setTimeout(() => setExpanded(true), 380); // let the header fade first
      const t2 = setTimeout(() => setMode("dim"), 1450); // hold once filled, then dim
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    if (mode === "dim") {
      const t = setTimeout(() => setMode("thanks"), 620); // after the opacity settles
      return () => clearTimeout(t);
    }
  }, [mode]);

  const onJoin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setAttemptedSubmit(true);
    setWebsiteTouched(true);

    if (submitting || !valid || mode !== "form" || !industry) return;

    const signup: WaitlistSubmission = {
      first: first.trim(),
      last: last.trim(),
      email: email.trim(),
      website: website.trim(),
      industry,
      agreed,
    };

    const r = e.currentTarget.getBoundingClientRect();
    originRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...signup, company }),
      });
      const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !result?.ok) {
        setSubmitError(result?.error || "We couldn’t save your signup. Please try again.");
        setSubmitting(false);
        return;
      }

      submissionRef.current = {
        ...signup,
        email: signup.email.toLowerCase(),
        website: normalizeWebsite(signup.website),
      };
      setSubmitting(false);
      setMode("fill");
    } catch {
      setSubmitError("We couldn’t save your signup. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main style={{ position: "relative", minHeight: "100vh", background: COLORS.bg, overflow: "hidden" }}>
      {(mode === "form" || mode === "fill") && (
        <div style={{ opacity: mode === "form" ? 1 : 0, transition: "opacity 320ms ease" }}>
          <Nav />
        </div>
      )}

      {/* ---- Form (stays mounted under the wipe, then unmounts before the gradient dims) ---- */}
      {(mode === "form" || mode === "fill") && (
        <Section>
          <div className="wl-form-card">
            {/* Title */}
            <p
              style={{
                margin: 0,
                fontWeight: 500,
                fontSize: 32.4,
                lineHeight: 1.12,
                letterSpacing: "-0.648px",
                color: COLORS.text,
              }}
            >
              Join the <span className="brand-text-gradient">Waitlist</span>
            </p>

            {/* First / Last */}
            <div className="wl-field-row">
              <PillTextInput value={first} onChange={(value) => { setFirst(value); setSubmitError(""); }} placeholder="First Name" ariaLabel="First name" grow name="given-name" autoComplete="given-name" />
              <PillTextInput value={last} onChange={(value) => { setLast(value); setSubmitError(""); }} placeholder="Last Name" ariaLabel="Last name" grow name="family-name" autoComplete="family-name" />
            </div>

            {/* Website / Industry */}
            <div className="wl-field-row wl-field-row-compact">
              <div className="wl-field-wrap wl-website-col">
                <PillTextInput
                  value={website}
                  onChange={(value) => { setWebsite(value); setSubmitError(""); }}
                  onBlur={() => setWebsiteTouched(true)}
                  placeholder="Company website"
                  ariaLabel="Company website"
                  type="url"
                  name="company-website"
                  autoComplete="url"
                  invalid={showWebsiteError}
                  describedBy={showWebsiteError ? "company-website-error" : undefined}
                />
                {showWebsiteError && (
                  <p id="company-website-error" className="wl-field-error">
                    Enter a valid company website.
                  </p>
                )}
              </div>
              <div className="wl-field-wrap wl-industry-col">
                <IndustrySelect value={industry} onChange={(value) => { setIndustry(value); setSubmitError(""); }} />
              </div>
            </div>

            {/* Terms */}
            <TermsRow checked={agreed} onChange={(checked) => { setAgreed(checked); setSubmitError(""); }} />

            <input
              className="wl-honeypot"
              type="text"
              name="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
            />

            {/* Email + Join */}
            <div className="wl-email-row">
              <PillTextInput
                value={email}
                onChange={(value) => { setEmail(value); setSubmitError(""); }}
                placeholder="Enter email"
                ariaLabel="Email address"
                type="email"
                name="email"
                autoComplete="email"
                paddingRight={PILL_PR + 141.75}
              />
              <button
                type="button"
                aria-label="Join waitlist"
                onClick={onJoin}
                onMouseEnter={() => setJoinHover(true)}
                onMouseLeave={() => setJoinHover(false)}
                disabled={!canJoin}
                className="wl-join-button"
                aria-busy={submitting || undefined}
                style={{
                  position: "absolute",
                  top: 0,
                  // Widen leftward when valid, and further on hover.
                  left: canJoin ? (joinHover ? 711.65 : 751.65) : 781.65,
                  width: canJoin ? (joinHover ? 211.75 : 171.75) : 141.75,
                  height: FIELD_H,
                  border: "none",
                  borderTopRightRadius: PILL_RADIUS,
                  borderBottomRightRadius: PILL_RADIUS,
                  background: FILL_GRADIENT,
                  opacity: valid ? (submitting ? 0.78 : 1) : 0.5,
                  color: valid ? "#fff" : "rgba(255,255,255,0.75)",
                  fontWeight: 600,
                  fontSize: 14.58,
                  letterSpacing: "-0.2916px",
                  cursor: submitting ? "wait" : valid ? "pointer" : "not-allowed",
                  transition: "left 320ms cubic-bezier(0.4,0,0.2,1), width 320ms cubic-bezier(0.4,0,0.2,1), opacity 260ms ease",
                  overflow: "hidden",
                }}
              >
                {submitting ? "Joining..." : "Join"}
              </button>
              {submitError && (
                <p className="wl-submit-error" role="alert">
                  {submitError}
                </p>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ---- Gradient wipe (full while filling) → settled 10% tint (the thank-you bg) ---- */}
      {mode !== "form" && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            background: FILL_GRADIENT,
            opacity: mode === "fill" ? 1 : 0.1,
            // Circle wipe while filling; full-viewport (no clip) once it holds and dims.
            clipPath:
              mode === "fill"
                ? `circle(${expanded ? "150%" : "0%"} at ${originRef.current.x}px ${originRef.current.y}px)`
                : "none",
            transition: "clip-path 900ms cubic-bezier(0.4,0,0.2,1), opacity 550ms ease",
            pointerEvents: "none",
            zIndex: 30,
          }}
        />
      )}

      {/* ---- Thank you (card centered in the viewport; back button pinned top-left) ---- */}
      {mode === "thanks" && <ThankYouView onBack={() => router.push("/")} />}
    </main>
  );
}

/* ---------- Pill text input (First / Last / Email) ---------- */

function PillTextInput({
  value,
  onChange,
  onBlur,
  placeholder,
  ariaLabel,
  grow = false,
  type = "text",
  paddingRight = PILL_PR,
  autoComplete,
  name,
  invalid = false,
  describedBy,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder: string;
  ariaLabel: string;
  grow?: boolean;
  type?: string;
  paddingRight?: number;
  autoComplete?: string;
  name?: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [focused, setFocused] = useState(false);
  const showPlaceholder = !focused && value === "";

  return (
    <div
      className={`wl-input-shell wl-control${grow ? " wl-field-grow" : ""}`}
      style={{
        position: "relative",
        width: grow ? undefined : "100%",
        height: FIELD_H,
        background: PILL_BG,
        borderRadius: PILL_RADIUS,
        display: "flex",
        alignItems: "center",
        borderColor: invalid ? "rgba(255, 116, 0, 0.68)" : undefined,
      }}
    >
      <input
        className="wl-input"
        type={type}
        name={name}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          paddingLeft: PILL_PL,
          paddingRight,
          color: COLORS.text,
          caretColor: "#FF7400",
          fontSize: TEXT_SIZE,
          letterSpacing: TEXT_LS,
          fontWeight: 400,
          fontFamily: "inherit",
        }}
      />
      {showPlaceholder && (
        <span
          style={{
            position: "absolute",
            left: PILL_PL,
            fontSize: TEXT_SIZE,
            letterSpacing: TEXT_LS,
            lineHeight: 1.12,
            color: PLACEHOLDER,
            pointerEvents: "none",
          }}
        >
          {placeholder}
        </span>
      )}
      {/* The "line" that pops up to type on once the placeholder clears. */}
      <span
        style={{
          position: "absolute",
          left: PILL_PL,
          bottom: FIELD_H / 2 - TEXT_SIZE / 2 - 5,
          width: 16,
          height: 1.5,
          borderRadius: 1,
          background: "rgba(255,255,255,0.35)",
          opacity: focused && value === "" ? 1 : 0,
          transition: "opacity 180ms ease",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* ---------- Industry dropdown ---------- */

function IndustrySelect({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        aria-label="Industry"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="wl-control"
        data-open={open ? "true" : undefined}
        style={{
          width: "100%",
          height: FIELD_H,
          background: PILL_BG,
          borderRadius: PILL_RADIUS,
          paddingLeft: 49.41,
          paddingRight: PILL_PR,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24.3,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: TEXT_SIZE, letterSpacing: TEXT_LS, color: value ? COLORS.text : PLACEHOLDER, whiteSpace: "nowrap" }}>
          {value ?? "Industry"}
        </span>
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 180ms ease" }}>
          <path d="M4 6 L8 10 L12 6" stroke={PLACEHOLDER} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Industry options"
          style={{
            position: "absolute",
            top: FIELD_H + 8,
            left: 0,
            width: "100%",
            minWidth: 220,
            maxHeight: 240,
            overflowY: "auto",
            background: "#0b0b0b",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: 6,
            zIndex: 5,
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          }}
        >
          {INDUSTRIES.map((it) => (
            <div
              key={it}
              role="option"
              aria-selected={it === value}
              onClick={() => {
                onChange(it);
                setOpen(false);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: 12,
                fontSize: 11,
                letterSpacing: "-0.1px",
                color: it === value ? "#fff" : "#c9c9c9",
                background: it === value ? "rgba(255,255,255,0.05)" : "transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = it === value ? "rgba(255,255,255,0.05)" : "transparent")}
            >
              {it}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Terms checkbox (box or sentence toggles) ---------- */

function TermsRow({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label
      style={{ display: "flex", alignItems: "center", gap: 15.39, paddingLeft: 15.39, cursor: "pointer", userSelect: "none", alignSelf: "flex-start" }}
    >
      <input
        className="wl-checkbox-input"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label="Consent to receive waitlist and product updates"
        style={{
          position: "absolute",
          opacity: 0,
          width: 18,
          height: 18,
          margin: 0,
        }}
      />
      <span
        className="wl-checkbox-box"
        style={{
          width: 18,
          height: 18,
          borderRadius: 3.5,
          border: checked ? "none" : "1.5px solid #f7f8f8",
          background: checked ? "linear-gradient(to right, #FF7400, #FF0000)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span style={{ fontSize: TEXT_SIZE, letterSpacing: TEXT_LS, color: "#fff" }}>
        I agree to receive waitlist and product updates from Tavyn.
      </span>
    </label>
  );
}

/* ---------- Thank-you view (Figma 245:1833) ---------- */

function ThankYouView({ onBack }: { onBack: () => void }) {
  return (
    <>
      {/* Back button — pinned to the viewport's top-left corner (half the old padding). */}
      <button
        onClick={onBack}
        aria-label="Back to home"
        className="wl-fade-in"
        style={{
          position: "fixed",
          left: 30,
          top: 30,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          zIndex: 41,
        }}
      >
        {/* Symmetric left arrow, centred in the 24×24 box (x 6–18, y 6–18). */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
          <path d="M18 12 H6 M12 6 L6 12 L12 18" stroke="#d9d9d9" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Card — centered in the viewport, independent of the back button. */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 40,
          pointerEvents: "none",
        }}
      >
        <div
          className="wl-fade-in"
          style={{
            position: "relative",
            flexShrink: 0,
            width: 768,
            height: 499,
            transform: "scale(var(--section-scale))",
            pointerEvents: "auto",
            background: COLORS.bg,
            borderRadius: 20,
            overflow: "hidden",
            paddingLeft: 84,
            paddingRight: 84,
            paddingTop: 0,
            paddingBottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              className="wl-confirm-enter wl-confirm-check"
              aria-hidden
              style={{
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 30,
              }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ display: "block" }}>
                <path d="M8 18.8 L14.4 25.2 L28.5 10.8" stroke="url(#waitlist-check-gradient)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="waitlist-check-gradient" x1="8" y1="18" x2="28.5" y2="18" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFC100" />
                    <stop offset="0.5" stopColor="#FF7400" />
                    <stop offset="1" stopColor="#FF0000" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <p
              className="wl-confirm-enter wl-confirm-headline"
              style={{
                margin: 0,
                fontWeight: 500,
                fontSize: 42,
                lineHeight: 1.08,
                letterSpacing: "-0.84px",
                color: COLORS.text,
              }}
            >
              You&rsquo;re on the <span className="brand-text-gradient">waitlist</span>.
            </p>

            <p
              className="wl-confirm-enter wl-confirm-primary"
              style={{
                margin: 0,
                marginTop: 24,
                fontWeight: 400,
                fontSize: 18,
                lineHeight: 1.5,
                letterSpacing: "-0.18px",
                color: COLORS.text,
              }}
            >
              You&rsquo;ve taken the first step toward turning search into a growth channel.
            </p>

            <p
              className="wl-confirm-enter wl-confirm-secondary"
              style={{
                margin: 0,
                marginTop: 34,
                fontWeight: 400,
                fontSize: 13,
                lineHeight: 1.6,
                letterSpacing: "-0.13px",
                color: COLORS.textMuted,
              }}
            >
              We&rsquo;ll email you with early access details and updates from Tavyn.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
