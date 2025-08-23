// ================== Supabase client ==================
(() => {
  const URL = window.SUPABASE_URL || "https://vdbjltfyoxmiijuwjlur.supabase.co";
  const KEY = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmpsdGZ5b3htaWlqdXdqbHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTA5MDcsImV4cCI6MjA2ODQ4NjkwN30.rSHfuHf2VcpEua__z2GXipSHVs_3gWSayfswIOyNL9E";
  window.supabaseClient = window.supabaseClient || window.supabase.createClient(URL, KEY);
})();
const sb = window.supabaseClient;

// ================== config ==================
const API_BASE = window.NOVAMIND_API || "https://YOUR-RENDER-APP.onrender.com"; // <-- put your Render base URL
const REDIRECT_DASH = "Dashboard.html"; // match your actual file name exactly

// ================== helpers ==================
const $  = (sel) => document.querySelector(sel);
const val = (id) => (document.getElementById(id) || {}).value?.trim() || "";

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
  const btn  = $("#login-btn") || $("#login-button");

  const go = async (e) => {
    e && e.preventDefault();
    const email = val("login-email") || val("email");
    const pass  = val("login-password") || val("password");
    if (!email || !pass) return alert("Please enter email and password");
    const { error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) return alert("Login failed: " + error.message);
    location.href = REDIRECT_DASH;
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
      options: { redirectTo: location.origin + "/" + REDIRECT_DASH }
    });
    if (error) alert("Google login error: " + error.message);
  });
}

// ================== logout ==================
function wireLogout() {
  const btn = $("#logout-btn") || $("#logoutBtn");
  if (!btn || btn._wired) return;
  btn._wired = true;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    await sb.auth.signOut();
    location.href = "login.html";
  });
}

// ================== Upscaler wiring (Render backend) ==================
function wireUpscaler(){
  const f = $("#up-file");
  const b = $("#up-enhance");
  const s = $("#up-status");
  const img = $("#up-result");
  const dl = $("#up-download");

  if (!f || !b) return;

  b.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!f.files[0]) { alert("Choose a file"); return; }
    s && (s.textContent = "Uploading...");

    const fd = new FormData();
    fd.append("file", f.files[0]);

    // Try /api/upscale then fallback to /enhance
    let res;
    try { res = await fetch(`${API_BASE}/api/upscale`, { method:"POST", body: fd }); } catch {}
    if (!res || !res.ok) {
      try { res = await fetch(`${API_BASE}/enhance`, { method:"POST", body: fd }); } catch {}
      if (!res || !res.ok) { s && (s.textContent = "Failed to start"); return; }
    }
    const data = await res.json();

    // Async job with polling
    if (data.job_id){
      s && (s.textContent = "Processing...");
      let tries = 0;
      while (tries < 120){
        await new Promise(r => setTimeout(r, 1000));
        let st;
        try { st = await fetch(`${API_BASE}/api/status?job_id=${encodeURIComponent(data.job_id)}`).then(x=>x.json()); } catch {}
        if (!st) { tries++; continue; }
        if (st.status === "done"){
          if (img) img.src = st.output_url;
          if (dl){ dl.href = st.output_url; dl.download = "result"; dl.style.display = "inline-block"; }
          s && (s.textContent = "Done");
          return;
        }
        if (st.status === "error"){ s && (s.textContent = st.message || "Error"); return; }
        s && (s.textContent = `Processing... ${st.progress || ""}`);
        tries++;
      }
      s && (s.textContent = "Timed out");
      return;
    }

    // Synchronous response
    if (data.output_url){
      if (img) img.src = data.output_url;
      if (dl){ dl.href = data.output_url; dl.download = "result"; dl.style.display = "inline-block"; }
      s && (s.textContent = "Done");
      return;
    }

    s && (s.textContent = "Unexpected response");
  });
}

// ================== page guards + init ==================
async function onReady() {
  wireLogin();
  wireSignup();
  wireGoogle();
  wireLogout();
  wireUpscaler();

  const path = location.pathname.toLowerCase();
  if (path.endsWith("/dashboard.html") || path.endsWith("/settings.html")) {
    const user = await requireAuth();
    if (user && $("#user-email")) $("#user-email").textContent = user.email;
  }
}
document.addEventListener("DOMContentLoaded", onReady);
