import React, { useState, useMemo } from "react";

// ───────────────────────────────────────────────────────────────
// "Meridian" hub + DETAIL PAGE.
//
// Each hero slot's CTA now routes to a second page. There is ONE
// article template; its content comes from FEATURED[mode].page, so
// the same shell renders an onboarding guide, a featured article,
// or an announcement. The page:
//   • mirrors the hero's photo treatment (continuity),
//   • offers a short "In this guide" jump list,
//   • ends with related questions that link BACK into the hub,
//   • has an auth-aware primary action.
// ───────────────────────────────────────────────────────────────

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Mulish:wght@400;500;600;700&display=swap');
`;

const C = { bg: "#FAFAF6", surface: "#FFFFFF", ink: "#16221F", muted: "#5E6B65", line: "#E6E4DB", brand: "#143A36", brandSoft: "#E4EEEA" };
const disp = { fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" };
const body = { fontFamily: "'Mulish', system-ui, sans-serif" };
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const DOMAINS = [
  { id: "benefits", label: "Benefits", icon: "❖", fg: "#B4502E", soft: "#F8EAE2", line: "#EAC9B8", kind: "plan", plural: "plans",
    providers: [{ id: "summit", name: "Summit Health Plan" }, { id: "blueridge", name: "BlueRidge PPO" }] },
  { id: "pharmacy", label: "Pharmacy", icon: "℞", fg: "#2F6E4E", soft: "#E3F0E6", line: "#BEDCC6", kind: "pharmacy", plural: "pharmacies",
    providers: [{ id: "meridianrx", name: "Meridian Rx" }, { id: "cornerstone", name: "Cornerstone Pharmacy" }] },
];
const ACCOUNT = { id: "account", label: "Account & access", icon: "✦", fg: "#143A36", soft: "#E4EEEA", line: "#CADAD4", providers: [] };
const ALL_GROUPS = [ACCOUNT, ...DOMAINS];
const groupById = (id) => ALL_GROUPS.find((g) => g.id === id);

const FAQS = [
  { id: 10, domain: "account", audience: "guest", provider: null, q: "How do I create a Meridian account?", a: "Tap Get started, enter the email and date of birth your plan has on file, and verify with the code we send. Your benefits and pharmacy connect automatically." },
  { id: 11, domain: "account", audience: "guest", provider: null, q: "How do I find which plan and pharmacy I have?", a: "Once you sign in, your plan and pharmacy show at the top of the Benefits and Pharmacy tabs. If something looks off, contact your benefits administrator." },
  { id: 12, domain: "account", audience: "guest", provider: null, q: "Do I need an account to refill or check a claim?", a: "Yes — anything tied to your coverage (refills, claims, costs) requires signing in so we can show your information securely. General questions are answered here without an account." },
  { id: 1, domain: "benefits", provider: null, q: "What's covered under my plan?", a: "Your plan summary lists every covered service, your deductible, and what you pay for visits. Open Benefits → Plan summary, or search a specific service." },
  { id: 2, domain: "benefits", provider: null, q: "How do I find an in-network provider?", a: "Go to Benefits → Find care and search by specialty or name. In-network providers are marked, with estimated costs shown before you book." },
  { id: 3, domain: "benefits", provider: null, q: "How do I check the status of a claim?", a: "Open Benefits → Claims. Each claim shows where it is — submitted, processing, or paid — and what you owe, if anything." },
  { id: 4, domain: "benefits", provider: "blueridge", q: "How do I use my BlueRidge PPO out-of-network coverage?", a: "BlueRidge PPO includes out-of-network benefits. When you book outside the network, the app shows your higher cost-share before you confirm." },
  { id: 5, domain: "pharmacy", provider: null, q: "How do I refill a prescription?", a: "Open Pharmacy → My medications, tap the prescription, and choose Refill. If refills remain it's sent right away; if not, we request a renewal from your prescriber." },
  { id: 6, domain: "pharmacy", provider: "meridianrx", q: "Can I get same-day delivery with Meridian Rx?", a: "Meridian Rx offers same-day delivery in most areas at no added cost. Choose Same-day at checkout, or set it as your default in Pharmacy → Preferences." },
  { id: 7, domain: "pharmacy", provider: null, q: "How much will my medication cost?", a: "Because your benefits and pharmacy are connected, the price already reflects your plan's coverage. Open any medication to see your cost and alternatives." },
  { id: 8, domain: "pharmacy", provider: "cornerstone", q: "Does Cornerstone Pharmacy support 90-day fills?", a: "Yes — Cornerstone supports 90-day supplies on eligible maintenance medications, usually lowering your per-month cost." },
];

// ── CONFIG: hero + its destination `page` ───────────────────────
const FEATURED = {
  onboarding: {
    kind: "onboarding", eyebrow: "New to Meridian", image: null, tone: "warm",
    title: "Your benefits and pharmacy, finally in one place.",
    sub: "See how the combined experience works — then search anything below.",
    steps: [{ t: "One account, both sides", p: "No separate logins." }, { t: "Costs that know your plan", p: "Prices reflect your coverage." }, { t: "One place for help", p: "Claims and refills, together." }],
    cta: "Get started",
    page: {
      readMin: 4,
      intro: "Meridian connects your health benefits and your pharmacy in a single account. This short guide explains what that means in practice and walks you through getting set up.",
      contents: ["What Meridian brings together", "Set up in three steps", "What you can do right away"],
      sections: [
        { type: "prose", h: "What Meridian brings together", p: "Most people juggle one login for insurance and another for the pharmacy. Meridian puts both behind one account, so your coverage and your medications share the same view — and the same costs. When the two talk to each other, the price you see on a prescription already reflects your plan." },
        { type: "steps", h: "Set up in three steps", steps: ["Create your account with the email and date of birth your plan has on file.", "Confirm the plan and pharmacy linked to you — we'll show what we found so you can check it.", "Choose your delivery and notification preferences so refills and claims reach you the way you want."] },
        { type: "prose", h: "What you can do right away", p: "Once you're in, you can refill and transfer prescriptions, check claims and costs, find in-network care, and message your team — all from one home screen. You don't have to learn two systems." },
      ],
      note: "This guide explains how the app works. It isn't medical advice — for questions about your health or medications, message your care team.",
      relatedFaqs: [10, 11, 12],
      cta: { guest: "Create your account", member: "Go to your dashboard" },
    },
  },
  article: {
    kind: "article", eyebrow: "Featured this month", image: null, tone: "cool",
    title: "Open enrollment is here — what's changing",
    sub: "A 5-minute read on the new plan options and how to compare them before the deadline.",
    cta: "Read the guide",
    page: {
      readMin: 5,
      intro: "Open enrollment is your once-a-year window to change plans. Here's what's new and how to compare your options without the guesswork.",
      contents: ["What's new this year", "How to compare plans", "Key dates"],
      sections: [
        { type: "prose", h: "What's new this year", p: "Two new plan tiers are available, and several services moved to a lower cost-share. The plan comparison tool now shows your estimated yearly cost based on last year's usage, so you can compare on real numbers rather than premiums alone." },
        { type: "steps", h: "How to compare plans", steps: ["Open Benefits → Compare plans.", "Review the estimated yearly cost for each option, not just the monthly premium.", "Check that your current providers and medications are covered before you switch."] },
        { type: "prose", h: "Key dates", p: "Enrollment closes at the end of the month. Changes take effect the first of the following month. If you do nothing, your current plan rolls over." },
      ],
      note: "Costs shown are estimates to help you compare. Your actual costs depend on the care you use.",
      relatedFaqs: [1, 2],
      cta: { guest: "Compare plans", member: "Compare plans" },
    },
  },
  announcement: {
    kind: "announcement", eyebrow: "What's new", image: null, tone: "green",
    title: "Same-day delivery is now available in more areas",
    sub: "Check whether your zip code is covered and set delivery as your default.",
    cta: "See if you're covered",
    page: {
      readMin: 2,
      intro: "We've expanded same-day prescription delivery to more regions. Here's where it's available and how to turn it on.",
      contents: ["Where it's available", "How to turn it on", "What it costs"],
      sections: [
        { type: "prose", h: "Where it's available", p: "Same-day delivery now covers most metro areas and many surrounding zip codes. Enter your zip in the pharmacy section to confirm coverage at your address." },
        { type: "steps", h: "How to turn it on", steps: ["Open Pharmacy → Preferences.", "Set Same-day as your default delivery method.", "Choose a delivery window at checkout when it's offered."] },
        { type: "prose", h: "What it costs", p: "Same-day delivery is included at no added cost on eligible prescriptions through your pharmacy. Any standard copay still applies." },
      ],
      note: "Delivery availability depends on your address and the medication. The app confirms eligibility at checkout.",
      relatedFaqs: [5, 6],
      cta: { guest: "Check your zip code", member: "Check your zip code" },
    },
  },
};
const TONES = { warm: ["#3A2A1E", "#8A5A36", "#C98F5A", "#E8C79A"], cool: ["#16313A", "#2C5A66", "#4E8C95", "#9FC9CC"], green: ["#15302A", "#2C5E4A", "#4E8C6E", "#A6CDB2"] };

function isVisible(f, authed, active) {
  const aud = f.audience || "all";
  if (aud === "guest" && authed) return false;
  if (aud === "member" && !authed) return false;
  if (f.provider) { if (!authed) return false; return active[f.domain] === f.provider; }
  return true;
}

export default function App() {
  const [route, setRoute] = useState({ name: "hub" });
  const [authed, setAuthed] = useState(false);
  const [active, setActive] = useState({ benefits: "summit", pharmacy: "meridianrx" });
  const [featuredMode, setFeaturedMode] = useState("onboarding");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(null);

  const go = (r) => { setRoute(r); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const groups = useMemo(() => (authed ? DOMAINS : [ACCOUNT, ...DOMAINS]), [authed]);
  const visibleFaqs = useMemo(() => FAQS.filter((f) => isVisible(f, authed, active)), [authed, active]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleFaqs.filter((f) => {
      const inGroup = filter === "all" || f.domain === filter;
      const inText = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q) || groupById(f.domain).label.toLowerCase().includes(q);
      return inGroup && inText;
    });
  }, [query, filter, visibleFaqs]);

  const withheld = useMemo(() => {
    if (authed) return 0;
    const q = query.trim().toLowerCase();
    if (!q) return 0;
    return FAQS.filter((f) => f.provider && (f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))).length;
  }, [authed, query]);

  const searching = query.trim().length > 0;
  const featured = featuredMode === "none" ? null : FEATURED[featuredMode];

  // open a hub FAQ coming from a detail page
  const openInHub = (id) => { const f = FAQS.find((x) => x.id === id); setFilter("all"); setQuery(""); setOpen(id); go({ name: "hub" }); void f; };

  return (
    <div style={{ ...body, background: C.bg, color: C.ink, minHeight: "100vh", fontSize: 17, lineHeight: 1.6 }}>
      <style>{FONTS}</style>
      <style>{`
        * { box-sizing: border-box; } button { font-family: inherit; cursor: pointer; }
        :focus-visible { outline: 2.5px solid ${C.brand}; outline-offset: 3px; border-radius: 6px; }
        ::selection { background: ${C.brandSoft}; }
        .faq:hover { background: ${C.bg}; }
        .chip, .stepcard, .rel { transition: all .16s ease; }
        .stepcard:hover { transform: translateY(-2px); background: rgba(255,255,255,.2); }
        .cta:hover, .link:hover { transform: translateY(-1px); }
        .rel:hover { background: ${C.bg}; }
        .fade { animation: f .5s ease both; }
        @keyframes f { from {opacity:0; transform:translateY(8px);} to {opacity:1; transform:none;} }
        @keyframes kb { from {transform:scale(1.08);} to {transform:scale(1);} }
        select { font-family: inherit; } select:disabled { opacity: .45; }
      `}</style>

      {/* PREVIEW CONTROLS */}
      <div style={{ background: "#11201D", color: "#CFE0DA", fontSize: 13.5 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "10px 24px", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ ...disp, fontWeight: 700, letterSpacing: ".04em", color: "#8FB7AC" }}>PREVIEW CONFIG</span>
          <label style={{ display: "flex", gap: 7, alignItems: "center" }}>Account:
            <select value={authed ? "in" : "out"} onChange={(e) => setAuthed(e.target.value === "in")} style={selStyle}>
              <option value="out">Signed out (guest)</option><option value="in">Signed in (member)</option>
            </select>
          </label>
          <label style={{ display: "flex", gap: 7, alignItems: "center" }}>Hero slot:
            <select value={featuredMode} onChange={(e) => { setFeaturedMode(e.target.value); }} style={selStyle}>
              <option value="onboarding">Onboarding</option><option value="article">Featured article</option>
              <option value="announcement">Announcement</option><option value="none">Empty (brand fallback)</option>
            </select>
          </label>
          {DOMAINS.map((d) => (
            <label key={d.id} style={{ display: "flex", gap: 7, alignItems: "center", opacity: authed ? 1 : .55 }}>{d.label} {d.kind}:
              <select disabled={!authed} value={authed ? active[d.id] : "unknown"} onChange={(e) => setActive((s) => ({ ...s, [d.id]: e.target.value }))} style={selStyle}>
                {!authed && <option value="unknown">Unknown</option>}
                {d.providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>

      {/* Header */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => go({ name: "hub" })} style={{ border: "none", background: "none", padding: 0, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ display: "inline-grid", placeItems: "center", width: 32, height: 32, borderRadius: 9, background: C.brand, color: "#fff", ...disp, fontWeight: 700, fontSize: 17 }}>M</span>
            <span style={{ ...disp, fontWeight: 700, fontSize: 20, color: C.brand }}>Meridian</span>
          </button>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 13.5, color: C.muted }}>{authed ? "Signed in" : "Browsing as guest"}</span>
            {!authed && <button onClick={() => setAuthed(true)} style={{ ...body, fontWeight: 700, fontSize: 14, color: "#fff", background: C.brand, border: "none", borderRadius: 10, padding: "8px 16px" }}>Sign in</button>}
          </span>
        </div>
      </header>

      {route.name === "article" ? (
        <ArticlePage mode={route.mode} authed={authed} onBack={() => go({ name: "hub" })} onOpenFaq={openInHub}
          onPrimary={() => { if (FEATURED[route.mode].kind === "onboarding" && !authed) setAuthed(true); go({ name: "hub" }); }} />
      ) : (
        <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
          <PhotoHero featured={featured} onCta={() => go({ name: "article", mode: featuredMode })} />

          <section className="fade" style={{ margin: "0 auto 8px", maxWidth: 720 }}>
            <div style={{ position: "relative" }}>
              <span aria-hidden style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 19 }}>⌕</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Benefits & Pharmacy — “refill”, “claim”, “sign in”…" aria-label="Search all topics"
                style={{ ...body, width: "100%", fontSize: 17, padding: "17px 18px 17px 48px", borderRadius: 14, border: `1.5px solid ${C.line}`, background: C.surface, color: C.ink, boxShadow: "0 8px 26px -16px rgba(20,58,54,.5)" }} />
            </div>
            <div role="group" aria-label="Filter by topic" style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
              <Chip label="All topics" active={filter === "all"} onClick={() => setFilter("all")} />
              {groups.map((g) => <Chip key={g.id} label={g.label} icon={g.icon} dom={g} active={filter === g.id} onClick={() => setFilter(g.id)} />)}
            </div>
          </section>

          {!authed && !searching && <SignInBanner onSignIn={() => setAuthed(true)} />}

          {searching ? (
            <section className="fade" style={{ maxWidth: 720, margin: "22px auto 40px" }}>
              <p style={{ color: C.muted, fontSize: 15, margin: "0 0 14px" }}>{results.length} result{results.length !== 1 ? "s" : ""} {filter === "all" ? "across all topics" : `in ${groupById(filter).label}`}</p>
              <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden" }}>
                {results.length === 0 && <div style={{ padding: "28px 22px", color: C.muted }}>No matches yet. Try a simpler word, or <button onClick={() => { setQuery(""); setFilter("all"); }} style={{ border: "none", background: "none", color: C.brand, fontWeight: 700, padding: 0 }}>browse all topics</button>.</div>}
                {results.map((f, i) => <FaqRow key={f.id} f={f} i={i} open={open} setOpen={setOpen} showTag />)}
              </div>
              {withheld > 0 && (
                <div style={{ marginTop: 14, background: C.brandSoft, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15.5, color: C.brand }}>{withheld} more answer{withheld !== 1 ? "s are" : " is"} specific to your plan or pharmacy.</span>
                  <button onClick={() => setAuthed(true)} style={{ ...body, fontWeight: 700, fontSize: 14.5, color: "#fff", background: C.brand, border: "none", borderRadius: 10, padding: "9px 16px", marginLeft: "auto" }}>Sign in to see them</button>
                </div>
              )}
            </section>
          ) : (
            <section className="fade" style={{ margin: "28px 0 24px" }}>
              <h2 style={{ ...disp, fontWeight: 600, fontSize: 24, margin: "0 0 4px" }}>Common questions</h2>
              <p style={{ color: C.muted, margin: "0 0 22px" }}>{authed ? "Tailored to the plan and pharmacy on your account." : "General answers for everyone. Sign in for answers specific to your coverage."}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 20, alignItems: "start" }}>
                {groups.map((g) => <DomainPanel key={g.id} g={g} authed={authed} activeProviderId={active[g.id]} faqs={visibleFaqs.filter((f) => f.domain === g.id)} open={open} setOpen={setOpen} />)}
              </div>
            </section>
          )}
        </main>
      )}

      <footer style={{ borderTop: `1px solid ${C.line}`, marginTop: 56 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "26px 24px", fontSize: 14, color: C.muted, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span>Meridian — modular help & onboarding hub</span><span>Still stuck? Message your care team — this hub explains the app, not medical advice.</span>
        </div>
      </footer>
    </div>
  );
}

const selStyle = { background: "#1C2F2B", color: "#fff", border: "1px solid #33524B", borderRadius: 7, padding: "4px 8px" };

// ── DETAIL / ARTICLE PAGE ───────────────────────────────────────
function ArticlePage({ mode, authed, onBack, onPrimary, onOpenFaq }) {
  const f = FEATURED[mode];
  const p = f.page;
  const [helpful, setHelpful] = useState(null);
  const [a, b, c, d] = TONES[f.tone];
  const scrim = `linear-gradient(180deg, rgba(8,22,19,.25) 0%, rgba(8,22,19,.15) 40%, rgba(8,22,19,.7) 100%), linear-gradient(90deg, rgba(8,22,19,.5) 0%, rgba(8,22,19,.05) 60%)`;
  const photoFallback = `radial-gradient(120% 90% at 78% 18%, ${d}99 0%, transparent 55%), radial-gradient(90% 80% at 12% 90%, ${b}cc 0%, transparent 60%), linear-gradient(135deg, ${a} 0%, ${b} 45%, ${c} 100%)`;
  const jump = (i) => { const el = document.getElementById(`sec-${i}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const related = (p.relatedFaqs || []).map((id) => FAQS.find((x) => x.id === id)).filter(Boolean);

  return (
    <main className="fade">
      {/* breadcrumb */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "18px 24px 0" }}>
        <button onClick={onBack} className="link" style={{ ...body, border: "none", background: "none", color: C.brand, fontWeight: 700, fontSize: 14.5, padding: 0, display: "inline-flex", gap: 7, alignItems: "center", transition: "transform .15s ease" }}>
          ← Help Center
        </button>
      </div>

      {/* compact photo header — mirrors the hero */}
      <div style={{ maxWidth: 760, margin: "14px auto 0", padding: "0 24px" }}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 22, minHeight: "clamp(200px, 30vw, 280px)", display: "flex", alignItems: "flex-end", color: "#fff" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, background: f.image ? `${scrim}, url("${f.image}") center/cover no-repeat` : `${scrim}, ${photoFallback}`, animation: "kb 14s ease-out both" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, backgroundSize: "180px", opacity: .1, mixBlendMode: "overlay" }} />
          <div style={{ position: "relative", padding: "clamp(22px,4vw,34px)" }}>
            <span style={{ ...body, fontWeight: 700, fontSize: 12, letterSpacing: ".11em", textTransform: "uppercase", opacity: .9, textShadow: "0 1px 10px rgba(0,0,0,.4)" }}>{f.eyebrow}</span>
            <h1 style={{ ...disp, fontWeight: 600, fontSize: "clamp(26px,3.8vw,38px)", lineHeight: 1.1, letterSpacing: "-.02em", margin: "10px 0 8px", textShadow: "0 2px 20px rgba(0,0,0,.4)" }}>{f.title}</h1>
            <span style={{ fontSize: 14.5, opacity: .9 }}>{p.readMin} min read</span>
          </div>
        </div>
      </div>

      {/* body */}
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "26px 24px 0" }}>
        <p style={{ fontSize: 20, lineHeight: 1.6, margin: "0 0 22px" }}>{p.intro}</p>

        {p.contents && (
          <nav aria-label="In this guide" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: "16px 20px", marginBottom: 28 }}>
            <p style={{ ...body, fontWeight: 700, fontSize: 12.5, letterSpacing: ".05em", textTransform: "uppercase", color: C.muted, margin: "0 0 10px" }}>In this guide</p>
            {p.contents.map((t, i) => (
              <button key={i} onClick={() => jump(i)} className="link" style={{ display: "block", border: "none", background: "none", color: C.brand, fontWeight: 600, fontSize: 16, padding: "5px 0", textAlign: "left", transition: "transform .15s ease" }}>
                {i + 1}. {t}
              </button>
            ))}
          </nav>
        )}

        {p.sections.map((s, i) => (
          <section key={i} id={`sec-${i}`} style={{ marginBottom: 24, scrollMarginTop: 80 }}>
            <h2 style={{ ...disp, fontWeight: 600, fontSize: 23, margin: "0 0 8px" }}>{s.h}</h2>
            {s.type === "steps" ? (
              <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {s.steps.map((t, j) => (
                  <li key={j} style={{ display: "flex", gap: 14, padding: "11px 0", borderTop: j ? `1px solid ${C.line}` : "none" }}>
                    <span style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: "50%", background: C.brandSoft, color: C.brand, fontWeight: 700, fontSize: 14 }}>{j + 1}</span>
                    <span style={{ paddingTop: 2 }}>{t}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p style={{ margin: 0 }}>{s.p}</p>
            )}
          </section>
        ))}

        {p.note && (
          <aside role="note" style={{ display: "flex", gap: 13, background: C.surface, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.brand}`, borderRadius: 12, padding: "15px 18px", marginTop: 26 }}>
            <span aria-hidden style={{ color: C.brand, fontSize: 19 }}>✚</span>
            <p style={{ margin: 0, color: C.muted, fontSize: 15.5, lineHeight: 1.55 }}>{p.note}</p>
          </aside>
        )}

        {/* primary action — auth aware */}
        <div style={{ marginTop: 30 }}>
          <button onClick={onPrimary} className="cta" style={{ ...body, fontWeight: 700, fontSize: 16, color: "#fff", background: C.brand, border: "none", borderRadius: 12, padding: "15px 28px", transition: "transform .15s ease" }}>
            {authed ? p.cta.member : p.cta.guest} →
          </button>
        </div>

        {/* related questions — links BACK into the hub */}
        {related.length > 0 && (
          <section style={{ marginTop: 36, paddingTop: 26, borderTop: `1px solid ${C.line}` }}>
            <p style={{ ...body, fontWeight: 700, fontSize: 13, letterSpacing: ".05em", textTransform: "uppercase", color: C.muted, margin: "0 0 12px" }}>Related questions</p>
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
              {related.map((r, i) => {
                const g = groupById(r.domain);
                return (
                  <button key={r.id} onClick={() => onOpenFaq(r.id)} className="rel" style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", padding: "13px 18px", border: "none", borderTop: i ? `1px solid ${C.line}` : "none", background: "none", color: C.ink, fontSize: 16 }}>
                    <span style={{ ...body, fontWeight: 700, fontSize: 11, letterSpacing: ".04em", textTransform: "uppercase", color: g.fg, background: g.soft, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>{g.label}</span>
                    <span style={{ fontWeight: 600 }}>{r.q}</span>
                    <span aria-hidden style={{ marginLeft: "auto", color: g.fg }}>→</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* was this helpful */}
        <section style={{ margin: "34px 0 8px", paddingTop: 24, borderTop: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {helpful ? <p style={{ margin: 0, color: C.brand, fontWeight: 600 }}>Thanks — that helps us improve this guide.</p> : (
            <>
              <span style={{ fontWeight: 600 }}>Was this helpful?</span>
              {["Yes", "Not quite"].map((l) => <button key={l} onClick={() => setHelpful(l)} style={{ ...body, fontWeight: 600, fontSize: 15, color: C.brand, background: C.surface, border: `1.5px solid ${C.line}`, borderRadius: 10, padding: "9px 18px" }}>{l}</button>)}
            </>
          )}
        </section>
      </article>
    </main>
  );
}

// ── HERO ────────────────────────────────────────────────────────
function PhotoHero({ featured, onCta }) {
  const tone = featured?.tone || "green";
  const [a, b, c, d] = TONES[tone];
  const image = featured?.image || null;
  const photoFallback = `radial-gradient(120% 90% at 78% 18%, ${d}99 0%, transparent 55%), radial-gradient(90% 80% at 12% 90%, ${b}cc 0%, transparent 60%), linear-gradient(135deg, ${a} 0%, ${b} 45%, ${c} 100%)`;
  const scrim = `linear-gradient(180deg, rgba(8,22,19,.20) 0%, rgba(8,22,19,.10) 38%, rgba(8,22,19,.72) 100%), linear-gradient(90deg, rgba(8,22,19,.55) 0%, rgba(8,22,19,.05) 60%)`;
  return (
    <section className="fade" style={{ margin: "32px 0 26px" }}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 26, minHeight: "clamp(360px, 46vw, 480px)", display: "flex", alignItems: "flex-end", color: "#fff", boxShadow: "0 24px 60px -34px rgba(20,58,54,.7)" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: image ? `${scrim}, url("${image}") center/cover no-repeat` : `${scrim}, ${photoFallback}`, animation: "kb 14s ease-out both" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, backgroundSize: "180px", opacity: .1, mixBlendMode: "overlay", pointerEvents: "none" }} />
        <div style={{ position: "relative", padding: "clamp(28px, 5vw, 52px)", maxWidth: 760, width: "100%" }}>
          {featured ? (
            <>
              <span style={eyebrowStyle}>{featured.eyebrow}</span>
              <h1 style={heroTitleStyle}>{featured.title}</h1>
              <p style={heroSubStyle}>{featured.sub}</p>
              {featured.kind === "onboarding" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(168px,1fr))", gap: 12, margin: "24px 0 4px" }}>
                  {featured.steps.map((s, i) => (
                    <div key={i} className="stepcard" style={{ background: "rgba(255,255,255,.13)", border: "1px solid rgba(255,255,255,.3)", borderRadius: 14, padding: "14px 15px 12px", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
                      <span style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 8, background: "#fff", color: C.brand, ...disp, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{i + 1}</span>
                      <h3 style={{ ...disp, fontWeight: 600, fontSize: 15.5, margin: "0 0 3px", textShadow: "0 1px 8px rgba(0,0,0,.3)" }}>{s.t}</h3>
                      <p style={{ margin: 0, fontSize: 13.5, opacity: .92, lineHeight: 1.45 }}>{s.p}</p>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={onCta} className="cta" style={{ ...body, fontWeight: 700, fontSize: 16, color: C.brand, background: "#fff", border: "none", borderRadius: 12, padding: "14px 26px", marginTop: featured.kind === "onboarding" ? 18 : 24, transition: "transform .15s ease", boxShadow: "0 10px 24px -12px rgba(0,0,0,.5)" }}>{featured.cta} →</button>
            </>
          ) : (
            <>
              <span style={eyebrowStyle}>Help & Getting Started</span>
              <h1 style={heroTitleStyle}>Your benefits and pharmacy, in one place.</h1>
              <p style={heroSubStyle}>Search anything below — claims, refills, coverage, delivery.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
const eyebrowStyle = { ...body, fontWeight: 700, fontSize: 12.5, letterSpacing: ".11em", textTransform: "uppercase", opacity: .92, textShadow: "0 1px 10px rgba(0,0,0,.4)" };
const heroTitleStyle = { ...disp, fontWeight: 600, fontSize: "clamp(30px, 4.6vw, 48px)", lineHeight: 1.07, letterSpacing: "-.02em", margin: "12px 0 12px", textShadow: "0 2px 20px rgba(0,0,0,.4)", maxWidth: 660 };
const heroSubStyle = { margin: 0, opacity: .95, fontSize: 19, maxWidth: 580, textShadow: "0 1px 14px rgba(0,0,0,.45)" };

function SignInBanner({ onSignIn }) {
  return (
    <section className="fade" style={{ maxWidth: 720, margin: "20px auto 0" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.brand}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px" }}>
          <p style={{ ...disp, fontWeight: 600, fontSize: 17, margin: "0 0 2px", color: C.brand }}>Sign in for answers specific to your coverage</p>
          <p style={{ margin: 0, color: C.muted, fontSize: 15 }}>We'll tailor refills, claims, and costs to your plan and pharmacy. Until then, you'll see general answers.</p>
        </div>
        <button onClick={onSignIn} style={{ ...body, fontWeight: 700, fontSize: 15, color: "#fff", background: C.brand, border: "none", borderRadius: 11, padding: "11px 20px" }}>Sign in</button>
      </div>
    </section>
  );
}

function DomainPanel({ g, authed, activeProviderId, faqs, open, setOpen }) {
  const hasProviders = g.providers.length > 0;
  const provider = hasProviders ? g.providers.find((p) => p.id === activeProviderId) : null;
  const subtitle = !hasProviders ? "Before you sign in" : authed ? (provider ? provider.name : "All providers") : `All ${g.plural} · sign in to personalize`;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "14px 20px", background: g.soft, borderBottom: `1px solid ${g.line}` }}>
        <span aria-hidden style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 9, background: g.fg, color: "#fff", fontSize: 15 }}>{g.icon}</span>
        <div><h3 style={{ ...disp, fontWeight: 700, fontSize: 18, color: g.fg, margin: 0, lineHeight: 1.1 }}>{g.label}</h3><span style={{ fontSize: 13, color: C.muted }}>{subtitle}</span></div>
      </div>
      {faqs.map((f, i) => <FaqRow key={f.id} f={f} i={i} open={open} setOpen={setOpen} />)}
      {faqs.length === 0 && <div style={{ padding: "18px 20px", color: C.muted, fontSize: 15 }}>No questions here yet.</div>}
    </div>
  );
}

function Chip({ label, icon, dom, active, onClick }) {
  return (
    <button className="chip" onClick={onClick} aria-pressed={active} style={{ ...body, fontWeight: 600, fontSize: 14.5, padding: "8px 16px", borderRadius: 999, border: `1.5px solid ${active ? (dom ? dom.fg : C.brand) : C.line}`, background: active ? (dom ? dom.soft : C.brandSoft) : C.surface, color: active ? (dom ? dom.fg : C.brand) : C.muted, display: "inline-flex", alignItems: "center", gap: 7 }}>
      {icon && <span aria-hidden>{icon}</span>}{label}
    </button>
  );
}

function FaqRow({ f, i, open, setOpen, showTag }) {
  const isOpen = open === f.id;
  const g = groupById(f.domain);
  const provider = f.provider ? g.providers.find((p) => p.id === f.provider) : null;
  return (
    <div style={{ borderTop: i ? `1px solid ${C.line}` : "none" }}>
      <button className="faq" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : f.id)} style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", padding: "15px 20px", border: "none", background: "none", color: C.ink, fontSize: 16.5 }}>
        {showTag && <span style={{ ...body, fontWeight: 700, fontSize: 11, letterSpacing: ".04em", textTransform: "uppercase", color: g.fg, background: g.soft, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>{g.label}</span>}
        <span style={{ fontWeight: 600 }}>{f.q}</span>
        <span aria-hidden style={{ marginLeft: "auto", color: g.fg, fontSize: 20, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .2s ease" }}>＋</span>
      </button>
      {isOpen && (
        <div className="fade" style={{ padding: "0 20px 18px", color: C.muted, fontSize: 16, lineHeight: 1.6, borderLeft: `3px solid ${g.line}`, marginLeft: 20 }}>
          {provider && <span style={{ display: "inline-block", fontSize: 12.5, fontWeight: 700, color: g.fg, marginBottom: 6 }}>Specific to {provider.name}</span>}
          <div>{f.a}</div>
        </div>
      )}
    </div>
  );
}
