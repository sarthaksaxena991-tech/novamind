const SUPABASE_URL = "https://vdbjltfyoxmiijuwjlur.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmpsdGZ5b3htaWlqdXdqbHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTA5MDcsImV4cCI6MjA2ODQ4NjkwN30.rSHfuHf2VcpEua__z2GXipSHVs_3gWSayfswIOyNL9E";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Logout button
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  alert("You have been logged out!");
  window.location.href = "index.html";
});

// Charts
const userGrowthCtx = document.getElementById("userGrowthChart").getContext("2d");
const revenueCtx = document.getElementById("revenueChart").getContext("2d");
const toolUsageCtx = document.getElementById("toolUsageChart").getContext("2d");

new Chart(userGrowthCtx, {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [{ label: "Users", data: [10, 20, 40, 80, 120], borderColor: "#28a745", fill: false }]
  }
});

new Chart(revenueCtx, {
  type: "bar",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [{ label: "Revenue", data: [200, 500, 800, 1500, 2500], backgroundColor: "#9333EA" }]
  }
});

new Chart(toolUsageCtx, {
  type: "pie",
  data: {
    labels: ["TTS", "Voice Clone", "Image Gen", "Video Enhancer"],
    datasets: [{ data: [30, 20, 25, 25], backgroundColor: ["#28a745", "#9333EA", "#3b82f6", "#f59e0b"] }]
  }
});