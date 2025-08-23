const SUPABASE_URL = "https://vdbjltfyoxmiijuwjlur.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmpsdGZ5b3htaWlqdXdqbHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTA5MDcsImV4cCI6MjA2ODQ4NjkwN30.rSHfuHf2VcpEua__z2GXipSHVs_3gWSayfswIOyNL9E";
const { createClient } = supabase;
const sbCharts = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// logout
const lo = document.getElementById("logout-btn") || document.getElementById("logoutBtn");
if (lo) lo.addEventListener("click", async (e) => {
  e.preventDefault();
  await sbCharts.auth.signOut();
  window.location.href = "login.html";
});

// charts
const ug = document.getElementById("userGrowthChart");
const rv = document.getElementById("revenueChart");
const tu = document.getElementById("toolUsageChart");

if (ug) new Chart(ug.getContext("2d"), {
  type: "line",
  data: { labels: ["Jan","Feb","Mar","Apr","May"],
    datasets: [{ label:"Users", data:[10,20,40,80,120], borderColor:"#28a745", fill:false }] }
});
if (rv) new Chart(rv.getContext("2d"), {
  type: "bar",
  data: { labels: ["Jan","Feb","Mar","Apr","May"],
    datasets: [{ label:"Revenue", data:[200,500,800,1500,2500], backgroundColor:"#9333EA" }] }
});
if (tu) new Chart(tu.getContext("2d"), {
  type: "pie",
  data: { labels:["TTS","Voice Clone","Image Gen","Video Enhancer"],
    datasets: [{ data:[30,20,25,25], backgroundColor:["#28a745","#9333EA","#3b82f6","#f59e0b"] }] }
});
