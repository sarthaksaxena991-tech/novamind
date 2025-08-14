const SUPABASE_URL = "https://vdbjltfyoxmiijuwjlur.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmpsdGZ5b3htaWlqdXdqbHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTA5MDcsImV4cCI6MjA2ODQ4NjkwN30.rSHfuHf2VcpEua__z2GXipSHVs_3gWSayfswIOyNL9E";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Email/Password Login
document.getElementById("login-button").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Login successful!");
    window.location.href = "Dashboard.html";
  }
});

// Google OAuth
document.getElementById("google-login").addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:5500/Dashboard.html'
    }
  });
  if (error) console.error("Google login error:", error.message);
});
