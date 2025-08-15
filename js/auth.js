// ================== Supabase client ==================
(() => {
  const URL = window.SUPABASE_URL || "https://vdbjltfyoxmiijuwjlur.supabase.co";
  const KEY = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmpsdGZ5b3htaWlqdXdqbHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTA5MDcsImV4cCI6MjA2ODQ4NjkwN30.rSHfuHf2VcpEua__z2GXipSHVs_3gWSayfswIOyNL9E";
  // Use the global client created by the snippet if present; else create it here.
  window.supabaseClient = window.supabaseClient || window.supabase.createClient(URL, KEY);
})();
const sb = window.supabaseClient;

// ================== helpers ==================
const $ = (sel) => document.querySelector(sel);
const val = (id) => (document.getElementById(id) || {}).value?.trim() || "";

// ✅ ALWAYS redirect to your live GitHub Pages Dashboard (no localhost)
const REDIRECT_DASH = "https://sarthaksaxena991-tech.github.io/novamind/Dashboard.html";

// ================== session helpers ==================
async function getSession() {
  const { data: { session } } = await sb.auth.getSession();
  return session || null;
}
async function requireAuth() {
  const s = await getSession();
  if (!s) { location.href = "login.html"; return null; }
  return s.user;
}

// ================== login (email/pass) ==================
function wireLogin() {
  const form = $("#login-form");
  const btn  = $("#login-btn") || $("#login-button"); // supports either id

  const go = async (e) => {
    e && e.preventDefault();
    const email = val("login-email") || val("email");
    const pass  = val("login-password") || val("password");
    if (!email || !pass) return alert("Please enter email and password");
    const { error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) return alert("Login failed: " + error.message);
    location.href = "Dashboard.html"; // case matches your file
    <a href="#" id="logout-btn" class="btn">Logout</a>

  };

  if (form && !form._wired) { form._wired = true; form.addEventListener("submit", go); }
  if (btn  && !btn._wired)  { btn._wired  = true; btn.addEventListener("click", go); }
}

// ================== signup (email/pass) ==================
function wireSignup() {
  const form = $("#signup-form");
  const btn  = $("#signup-btn");

  const go = async (e) => {
    e && e.preventDefault();
    const email = val("signup-email") || val("email");
    const pass  = val("signup-password") || val("password");
    if (!email || !pass) return alert("Please enter email and password");
    const { error } = await sb.auth.signUp({ email, password: pass });
    if (error) return alert("Signup failed: " + error.message);
    alert("Signup successful. Check your email to confirm.");
    location.href = "login.html";
  };

  if (form && !form._wired) { form._wired = true; form.addEventListener("submit", go); }
  if (btn  && !btn._wired)  { btn._wired  = true; btn.addEventListener("click", go); }
}

// ================== Google OAuth (optional) ==================
function wireGoogle() {
  const btn = $("#google-login") || $("#google-signup");
  if (!btn || btn._wired) return;
  btn._wired = true;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: REDIRECT_DASH }   // <- LIVE URL
    });
    if (error) alert("Google login error: " + error.message);
  });
}

// ================== logout ==================
function wireLogout() {
  const btn = $("#logout-btn");
  if (!btn || btn._wired) return;
  btn._wired = true;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    await sb.auth.signOut();
    location.href = "login.html";
  });
}

// ================== page guards + UI fill ==================
async function onReady() {
  wireLogin();
  wireSignup();
  wireGoogle();
  wireLogout();

  const path = location.pathname.toLowerCase();

  // Protect private pages
  if (path.endsWith("/dashboard.html") || path.endsWith("/settings.html")) {
    const user = await requireAuth();
    if (user && $("#user-email")) $("#user-email").textContent = user.email;
  }

  // Optional: from index, auto-forward if already logged-in (leave commented if not desired)
  // if (path.endsWith("/index.html") || /\/novamind\/?$/.test(location.pathname)) {
  //   const s = await getSession();
  //   if (s) location.href = "Dashboard.html";
  // }
}
document.addEventListener("DOMContentLoaded", onReady);

