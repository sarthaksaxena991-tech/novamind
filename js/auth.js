// ---------- Supabase client ----------
(() => {
  // Reuse global if snippet already created it; else create here.
  const URL  = window.SUPABASE_URL  || "https://vdbjltfyoxmiijuwjlur.supabase.co";
  const KEY  = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmpsdGZ5b3htaWlqdXdqbHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTA5MDcsImV4cCI6MjA2ODQ4NjkwN30.rSHfuHf2VcpEua__z2GXipSHVs_3gWSayfswIOyNL9E";
  window.supabaseClient = window.supabaseClient || window.supabase.createClient(URL, KEY);
})();
const sb = window.supabaseClient;

// ---------- helpers ----------
// ---------- helpers ----------
const q  = s => document.querySelector(s);
const gv = (...ids) => {
  for (const id of ids) { const el = document.getElementById(id); if (el) return el.value.trim(); }
  return "";
};
// ✅ Fixed redirect to your GitHub Pages hosted Dashboard
const redirectTo = "https://sarthaksaxena991-tech.github.io/novamind/Dashboard.html";


// ---------- session helpers ----------
async function getSession() {
  const { data: { session } } = await sb.auth.getSession();
  return session || null;
}
async function requireAuth() {
  const s = await getSession();
  if (!s) { location.href = "login.html"; return null; }
  return s.user;
}

// ---------- login wiring ----------
function wireLogin() {
  const form = q("#login-form");
  const btn  = q("#login-btn");
  const go = async (e) => {
    e && e.preventDefault();
    const email = gv("login-email","email");
    const pass  = gv("login-password","password");
    const { error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) return alert(error.message);
    location.href = "Dashboard.html";
  };
  if (form) form.addEventListener("submit", go);
  if (btn)  btn.addEventListener("click", go);
}

// ---------- signup wiring ----------
function wireSignup() {
  const form = q("#signup-form");
  const btn  = q("#signup-btn");
  const go = async (e) => {
    e && e.preventDefault();
    const email = gv("signup-email","email");
    const pass  = gv("signup-password","password");
    const { error } = await sb.auth.signUp({ email, password: pass });
    if (error) return alert(error.message);
    alert("Check your email to confirm.");
    location.href = "login.html";
  };
  if (form) form.addEventListener("submit", go);
  if (btn)  btn.addEventListener("click", go);
}

// ---------- OAuth (Google) optional ----------
function wireGoogle() {
  const btn = q("#google-signup");
  if (!btn) return;
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }   // works on GitHub Pages too
    });
    if (error) alert(error.message);
  });
}

// ---------- logout ----------
function wireLogout() {
  const btn = q("#logout-btn");
  if (!btn) return;
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    await sb.auth.signOut();
    location.href = "login.html";
  });
}

// ---------- page guards + UI fill ----------
async function onReady() {
  wireLogin();
  wireSignup();
  wireGoogle();
  wireLogout();

  const path = location.pathname.toLowerCase();
  if (path.endsWith("/dashboard.html") || path.endsWith("/settings.html")) {
    const user = await requireAuth();
    if (user && q("#user-email")) q("#user-email").textContent = user.email;
  }

  // Optional: auto-forward from index if already logged in
  if (path.endsWith("/index.html") || /\/novamind\/?$/.test(location.pathname)) {
    const s = await getSession();
    // comment next line if you DON'T want auto-redirect
    // if (s) location.href = "Dashboard.html";
  }
}
document.addEventListener("DOMContentLoaded", onReady);

