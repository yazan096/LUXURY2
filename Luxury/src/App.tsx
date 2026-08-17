import { useState, useEffect, useRef } from "react";
import { LANGUAGES, T, type Lang, type Translations } from "./translations";

const SERVICES_KEYS = [
  ["svc1Title", "svc1Desc"],
  ["svc2Title", "svc2Desc"],
  ["svc3Title", "svc3Desc"],
  ["svc4Title", "svc4Desc"],
  ["svc5Title", "svc5Desc"],
  ["svc6Title", "svc6Desc"],
] as const;

const SVC_ICONS = ["○", "◈", "◻", "⬡", "◎", "▣"];
const ADMIN_PASSWORD = "luxury2024";

type Appointment = {
  id: string;
  name: string;
  email: string;
  service: string;
  date: string;
};

function loadAppointments(): Appointment[] {
  try {
    return JSON.parse(localStorage.getItem("lux_appts") ?? "[]");
  } catch {
    return [];
  }
}

function saveAppointments(appts: Appointment[]) {
  localStorage.setItem("lux_appts", JSON.stringify(appts));
}

// ─── ADMIN PANEL ───────────────────────────────────────────────
function AdminPanel({ onClose }: { onClose: () => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>(loadAppointments);
  const [pwInput, setPwInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [pwError, setPwError] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function login() {
    if (pwInput === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  }

  function deleteAppt(id: string) {
    const updated = appointments.filter((a) => a.id !== id);
    setAppointments(updated);
    saveAppointments(updated);
    setDeleteId(null);
  }

  const overlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  };

  const panel: React.CSSProperties = {
    backgroundColor: "#131315",
    border: "1px solid #2a2a2e",
    width: "100%",
    maxWidth: 860,
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
  };

  if (!authed) {
    return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={{ ...panel, maxWidth: 400, padding: 48 }}>
          <button
            onClick={onClose}
            style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#6b6b75", fontSize: 20, cursor: "pointer" }}
          >✕</button>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: "#c8a45a", marginBottom: 16 }}>
            Admin Access
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 28, color: "#f0ede8", margin: "0 0 32px" }}>
            Sign In
          </h2>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={pwInput}
            onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Enter admin password"
            style={{ ...inputStyle, marginBottom: pwError ? 8 : 20, borderColor: pwError ? "#c0392b" : "#2a2a2e" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a45a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = pwError ? "#c0392b" : "#2a2a2e")}
            autoFocus
          />
          {pwError && (
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#c0392b", margin: "0 0 16px" }}>
              Incorrect password. Try again.
            </p>
          )}
          <button
            onClick={login}
            style={{
              width: "100%",
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#0a0a0b",
              backgroundColor: "#c8a45a",
              border: "none",
              padding: "14px",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0c07a")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c8a45a")}
          >
            Access Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={panel}>
        {/* Header */}
        <div style={{ padding: "28px 32px", borderBottom: "1px solid #2a2a2e", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, backgroundColor: "#131315", zIndex: 10 }}>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: "#c8a45a", marginBottom: 4 }}>
              Admin Dashboard
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22, color: "#f0ede8", margin: 0 }}>
              Appointments
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 14, color: "#6b6b75", marginLeft: 12 }}>
                {appointments.length} total
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "1px solid #2a2a2e", color: "#b8b8c2", fontSize: 14, cursor: "pointer", padding: "8px 16px", fontFamily: "'Outfit', sans-serif", transition: "border-color 0.2s, color 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c8a45a"; e.currentTarget.style.color = "#c8a45a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2e"; e.currentTarget.style.color = "#b8b8c2"; }}
          >
            Close ✕
          </button>
        </div>

        {/* Table */}
        <div style={{ padding: "0 32px 32px" }}>
          {appointments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", fontFamily: "'Outfit', sans-serif", color: "#6b6b75", fontSize: 15 }}>
              No appointments yet. Submissions will appear here.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
              <thead>
                <tr>
                  {["#", "Name", "Email", "Vehicle & Service", "Submitted"].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "#6b6b75",
                        textAlign: "left",
                        padding: "20px 12px 12px",
                        borderBottom: "1px solid #2a2a2e",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                  <th style={{ padding: "20px 12px 12px", borderBottom: "1px solid #2a2a2e" }} />
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt, i) => (
                  <tr
                    key={appt.id}
                    style={{ borderBottom: "1px solid #1c1c1f" }}
                  >
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={{ ...tdStyle, color: "#f0ede8", fontWeight: 500 }}>{appt.name}</td>
                    <td style={{ ...tdStyle, color: "#b8b8c2" }}>{appt.email}</td>
                    <td style={{ ...tdStyle, color: "#b8b8c2", maxWidth: 260 }}>{appt.service}</td>
                    <td style={{ ...tdStyle, color: "#6b6b75", whiteSpace: "nowrap" }}>{appt.date}</td>
                    <td style={{ padding: "14px 12px", textAlign: "right" }}>
                      {deleteId === appt.id ? (
                        <span style={{ display: "inline-flex", gap: 8 }}>
                          <button
                            onClick={() => deleteAppt(appt.id)}
                            style={{ background: "none", border: "1px solid #c0392b", color: "#c0392b", fontSize: 11, cursor: "pointer", padding: "4px 10px", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.1em" }}
                          >Confirm</button>
                          <button
                            onClick={() => setDeleteId(null)}
                            style={{ background: "none", border: "1px solid #2a2a2e", color: "#6b6b75", fontSize: 11, cursor: "pointer", padding: "4px 10px", fontFamily: "'Outfit', sans-serif" }}
                          >Cancel</button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteId(appt.id)}
                          style={{ background: "none", border: "none", color: "#6b6b75", fontSize: 13, cursor: "pointer", transition: "color 0.2s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#c0392b")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b75")}
                          title="Delete"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", service: "" });
  const [submitted, setSubmitted] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const t: Translations = T[lang];
  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.service) return;
    const appt: Appointment = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      service: formData.service,
      date: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    const prev = loadAppointments();
    saveAppointments([...prev, appt]);
    setFormData({ name: "", email: "", service: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  const currentLang = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <div style={{ backgroundColor: "#0a0a0b", minHeight: "100vh" }} dir={dir}>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      {/* ─── NAV ─── */}
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          transition: "background 0.3s, border-color 0.3s",
          backgroundColor: scrolled ? "rgba(10,10,11,0.96)" : "transparent",
          borderBottom: scrolled ? "1px solid #2a2a2e" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <a href="#" style={{ textDecoration: "none", lineHeight: 1.1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 22, color: "#c8a45a", letterSpacing: "0.08em", textTransform: "uppercase" }}>LUXURY</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 10, color: "#6b6b75", letterSpacing: "0.22em", textTransform: "uppercase" }}>auto service GmbH</div>
          </a>

          {/* Desktop nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="desk-nav">
            {[
              { label: t.navServices, href: "#services" },
              { label: t.navAbout, href: "#about" },
              { label: t.navContact, href: "#contact" },
            ].map((link) => (
              <a key={link.href} href={link.href}
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#b8b8c2", textDecoration: "none", transition: "color 0.2s", whiteSpace: "nowrap" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c8a45a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#b8b8c2")}
              >{link.label}</a>
            ))}

            {/* Language switcher */}
            <div ref={langRef} style={{ position: "relative" }}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "1px solid #2a2a2e", cursor: "pointer", color: "#b8b8c2", fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", padding: "7px 12px", transition: "border-color 0.2s, color 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#c8a45a"; (e.currentTarget as HTMLButtonElement).style.color = "#c8a45a"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2e"; (e.currentTarget as HTMLButtonElement).style.color = "#b8b8c2"; }}
                aria-label="Switch language"
              >
                <span style={{ fontSize: 16 }}>{currentLang.flag}</span>
                <span>{currentLang.label}</span>
                <span style={{ fontSize: 10, opacity: 0.6 }}>{langOpen ? "▲" : "▼"}</span>
              </button>

              {langOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", [dir === "rtl" ? "left" : "right"]: 0, backgroundColor: "#131315", border: "1px solid #2a2a2e", minWidth: 160, zIndex: 100, overflow: "hidden" }}>
                  {LANGUAGES.map((l) => (
                    <button key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: l.code === lang ? "#1c1c1f" : "none", border: "none", cursor: "pointer", color: l.code === lang ? "#c8a45a" : "#b8b8c2", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: l.code === lang ? 600 : 400, padding: "11px 16px", textAlign: dir === "rtl" ? "right" : "left", transition: "background 0.15s, color 0.15s" }}
                      onMouseEnter={(e) => { if (l.code !== lang) (e.currentTarget as HTMLButtonElement).style.background = "#1c1c1f"; }}
                      onMouseLeave={(e) => { if (l.code !== lang) (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                    >
                      <span style={{ fontSize: 18 }}>{l.flag}</span>
                      <span>{l.label}</span>
                      {l.code === lang && <span style={{ marginInlineStart: "auto", fontSize: 10 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a href="#contact"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0a0a0b", backgroundColor: "#c8a45a", padding: "10px 22px", textDecoration: "none", transition: "background 0.2s", whiteSpace: "nowrap" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0c07a")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c8a45a")}
            >{t.navBook}</a>
          </div>

          {/* Mobile hamburger */}
          <button className="mob-btn" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#c8a45a", fontSize: 24, lineHeight: 1 }}
            aria-label="Toggle menu"
          >{mobileOpen ? "✕" : "☰"}</button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div style={{ backgroundColor: "#0a0a0b", borderTop: "1px solid #2a2a2e", padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            {[{ label: t.navServices, href: "#services" }, { label: t.navAbout, href: "#about" }, { label: t.navContact, href: "#contact" }].map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#b8b8c2", textDecoration: "none" }}
              >{link.label}</a>
            ))}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {LANGUAGES.map((l) => (
                <button key={l.code} onClick={() => setLang(l.code)}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: l.code === lang ? "#1c1c1f" : "none", border: `1px solid ${l.code === lang ? "#c8a45a" : "#2a2a2e"}`, cursor: "pointer", color: l.code === lang ? "#c8a45a" : "#b8b8c2", fontFamily: "'Outfit', sans-serif", fontSize: 12, padding: "6px 12px" }}
                ><span>{l.flag}</span><span>{l.label}</span></button>
              ))}
            </div>
            <a href="#contact" onClick={() => setMobileOpen(false)}
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0a0a0b", backgroundColor: "#c8a45a", padding: "12px 22px", textDecoration: "none", textAlign: "center" }}
            >{t.navBook}</a>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1800&h=1000&fit=crop&auto=format')", backgroundSize: "cover", backgroundPosition: "center 40%", filter: "brightness(0.28)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(200,164,90,0.08) 0%, transparent 60%), linear-gradient(to top, #0a0a0b 0%, transparent 50%)" }} />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "120px 24px 80px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <div style={{ width: 40, height: 1, backgroundColor: "#c8a45a" }} />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c8a45a" }}>{t.heroEyebrow}</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(52px, 9vw, 110px)", lineHeight: 0.92, color: "#f0ede8", margin: "0 0 32px", maxWidth: 820 }}>
            {t.heroHeadline1}<br />
            <span style={{ color: "#c8a45a", fontStyle: "italic" }}>{t.heroHeadline2}</span><br />
            {t.heroHeadline3}
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 18, lineHeight: 1.7, color: "#b8b8c2", maxWidth: 480, margin: "0 0 52px" }}>{t.heroSub}</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a href="#contact"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0a0a0b", backgroundColor: "#c8a45a", padding: "16px 36px", textDecoration: "none", transition: "background 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0c07a")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c8a45a")}
            >{t.heroCta1}</a>
            <a href="#services"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f0ede8", border: "1px solid #2a2a2e", padding: "16px 36px", textDecoration: "none", transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c8a45a"; e.currentTarget.style.color = "#c8a45a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2e"; e.currentTarget.style.color = "#f0ede8"; }}
            >{t.heroCta2}</a>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section style={{ backgroundColor: "#131315", borderTop: "1px solid #2a2a2e", borderBottom: "1px solid #2a2a2e" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          {([
            [t.stat1Val, t.stat1Label], [t.stat2Val, t.stat2Label], [t.stat3Val, t.stat3Label], [t.stat4Val, t.stat4Label],
          ] as [string, string][]).map(([val, label], i) => (
            <div key={i} style={{ padding: "36px 24px", borderInlineEnd: i < 3 ? "1px solid #2a2a2e" : "none", textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 38, color: "#c8a45a", lineHeight: 1, marginBottom: 8 }}>{val}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6b6b75" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 30, height: 1, backgroundColor: "#c8a45a" }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c8a45a" }}>{t.svcEyebrow}</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(36px, 5vw, 60px)", color: "#f0ede8", margin: 0, lineHeight: 1.05, maxWidth: 520 }}>{t.svcHeadline}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 1, backgroundColor: "#2a2a2e", border: "1px solid #2a2a2e" }}>
            {SERVICES_KEYS.map(([titleKey, descKey], i) => (
              <ServiceCard key={i} icon={SVC_ICONS[i]} title={t[titleKey]} desc={t[descKey]} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" style={{ backgroundColor: "#131315", borderTop: "1px solid #2a2a2e" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="about-grid">
          <div style={{ position: "relative" }}>
            <img src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&h=640&fit=crop&auto=format" alt="Technician working on a luxury vehicle engine"
              style={{ width: "100%", aspectRatio: "5/4", objectFit: "cover", display: "block", backgroundColor: "#1c1c1f" }} />
            <div style={{ position: "absolute", bottom: -16, [dir === "rtl" ? "right" : "left"]: -16, width: "60%", height: 3, backgroundColor: "#c8a45a" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 30, height: 1, backgroundColor: "#c8a45a" }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c8a45a" }}>{t.aboutEyebrow}</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(32px, 4vw, 52px)", color: "#f0ede8", lineHeight: 1.08, margin: "0 0 24px" }}>
              {t.aboutHeadline1}<br />
              <span style={{ color: "#c8a45a", fontStyle: "italic" }}>{t.aboutHeadline2}</span>{t.aboutHeadline3}
            </h2>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 16, lineHeight: 1.8, color: "#b8b8c2", margin: "0 0 20px" }}>{t.aboutP1}</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 16, lineHeight: 1.8, color: "#b8b8c2", margin: "0 0 36px" }}>{t.aboutP2}</p>
            <a href="#contact"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#c8a45a", textDecoration: "none", borderBottom: "1px solid #c8a45a", paddingBottom: 4, transition: "color 0.2s, border-color 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#e0c07a"; e.currentTarget.style.borderColor = "#e0c07a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#c8a45a"; e.currentTarget.style.borderColor = "#c8a45a"; }}
            >{t.aboutLink}</a>
          </div>
        </div>
      </section>

      {/* ─── BOOKING FORM ─── */}
      <section id="contact" style={{ padding: "100px 24px", borderTop: "1px solid #2a2a2e" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ marginBottom: 52 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 30, height: 1, backgroundColor: "#c8a45a" }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c8a45a" }}>{t.contactEyebrow}</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(36px, 5vw, 60px)", color: "#f0ede8", margin: 0, lineHeight: 1.05 }}>{t.contactHeadline}</h2>
          </div>

          {submitted ? (
            <div style={{ backgroundColor: "#131315", border: "1px solid #c8a45a", padding: "40px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 28, color: "#c8a45a", marginBottom: 12 }}>✓</div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: "#f0ede8", margin: "0 0 8px", fontWeight: 500 }}>Request received!</p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#6b6b75", margin: 0 }}>We'll be in touch shortly to confirm your appointment.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ backgroundColor: "#131315", border: "1px solid #2a2a2e", padding: "40px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="form-row">
                <div>
                  <label style={labelStyle}>{t.formName}</label>
                  <input type="text" placeholder={t.formNamePlaceholder} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a45a")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2e")} />
                </div>
                <div>
                  <label style={labelStyle}>{t.formEmail}</label>
                  <input type="email" placeholder={t.formEmailPlaceholder} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a45a")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2e")} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>{t.formService}</label>
                <textarea placeholder={t.formServicePlaceholder} rows={4} value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} required
                  style={{ ...inputStyle, resize: "vertical" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a45a")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2e")} />
              </div>
              <button type="submit"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#0a0a0b", backgroundColor: "#c8a45a", border: "none", padding: "16px 32px", cursor: "pointer", transition: "background 0.2s", marginTop: 4, alignSelf: "flex-start" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0c07a")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c8a45a")}
              >{t.formSubmit}</button>
            </form>
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ backgroundColor: "#0a0a0b", borderTop: "1px solid #2a2a2e" }}>
        {/* Contact columns */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 48px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48 }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 20, color: "#c8a45a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>LUXURY</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 9, color: "#6b6b75", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 20 }}>auto service GmbH</div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 13, lineHeight: 1.75, color: "#6b6b75", margin: "0 0 24px", maxWidth: 240 }}>
              Premium automotive repair in the heart of Munich. Every car treated with the same precision and care.
            </p>
            <button
              onClick={() => setShowAdmin(true)}
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2a2a2e", background: "none", border: "1px solid #1c1c1f", padding: "6px 14px", cursor: "pointer", transition: "color 0.2s, border-color 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#6b6b75"; e.currentTarget.style.borderColor = "#2a2a2e"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#2a2a2e"; e.currentTarget.style.borderColor = "#1c1c1f"; }}
            >Admin</button>
          </div>

          {/* Address */}
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c8a45a", marginBottom: 16 }}>{t.labelAddress}</div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 13, lineHeight: 1.9, color: "#6b6b75", margin: 0 }}>
              Münchener Straße 47<br />80469 München<br />Germany
            </p>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c8a45a", marginBottom: 16 }}>{t.labelPhone}</div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 13, lineHeight: 1.9, color: "#6b6b75", margin: "0 0 24px" }}>+49 89 1234 5678</p>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c8a45a", marginBottom: 10 }}>{t.labelEmail}</div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 13, lineHeight: 1.9, color: "#6b6b75", margin: 0, wordBreak: "break-all" }}>info@luxury-autoservice.de</p>
          </div>

          {/* Hours */}
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c8a45a", marginBottom: 16 }}>{t.labelHours}</div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 13, lineHeight: 1.9, color: "#6b6b75", margin: 0 }}>
              {t.hours.split("\n").map((line, i) => <span key={i}>{line}{i < 2 && <br />}</span>)}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid #1c1c1f", padding: "20px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#2a2a2e", margin: 0 }}>
              © {new Date().getFullYear()} LUXURY auto service GmbH
            </p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#2a2a2e", margin: 0 }}>
              München, Germany
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 760px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          .form-row { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 800px) {
          .desk-nav { display: none !important; }
          .mob-btn { display: block !important; }
        }
        @media (min-width: 801px) {
          .desk-nav { display: flex !important; }
          .mob-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function ServiceCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: hovered ? "#1c1c1f" : "#0a0a0b", padding: "40px 36px", transition: "background 0.2s", cursor: "default" }}>
      <div style={{ fontFamily: "monospace", fontSize: 22, color: hovered ? "#c8a45a" : "#2a2a2e", marginBottom: 20, transition: "color 0.2s" }}>{icon}</div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: "#f0ede8", margin: "0 0 12px", lineHeight: 1.2 }}>{title}</h3>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 14, lineHeight: 1.75, color: "#6b6b75", margin: 0 }}>{desc}</p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Outfit', sans-serif",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "#6b6b75",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#0a0a0b",
  border: "1px solid #2a2a2e",
  color: "#f0ede8",
  fontFamily: "'Outfit', sans-serif",
  fontSize: 14,
  fontWeight: 300,
  padding: "12px 16px",
  outline: "none",
  transition: "border-color 0.2s",
};

const tdStyle: React.CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: 13,
  color: "#6b6b75",
  padding: "14px 12px",
  verticalAlign: "top",
};
