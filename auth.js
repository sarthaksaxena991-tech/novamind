// auth.js

// Supabase credentials
const SUPABASE_URL = "https://vdbjltfyoxmiijuwjlur.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmpsdGZ5b3htaWlqdXdqbHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTA5MDcsImV4cCI6MjA2ODQ4NjkwN30.rSHfuHf2VcpEua__z2GXipSHVs_3gWSayfswIOyNL9E";

// Initialize Supabase client (CDN style)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// LOGIN
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Login Failed: " + error.message);
    } else {
      alert("Login Successful!");
      window.location.href = "Dashboard.html";
    }
  });
}

// SIGN UP
const signupBtn = document.getElementById("signup-btn");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert("Signup Failed: " + error.message);
    } else {
      alert("Signup Successful. Please check your email to confirm.");
      window.location.href = "login.html";
    }
  });
}

// GOOGLE SIGNUP
const googleSignupBtn = document.getElementById("google-signup");
if (googleSignupBtn) {
  googleSignupBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://127.0.0.1:5500/Dashboard.html" // Update as needed
      }
    });

    if (error) {
      alert("Google Signup Failed: " + error.message);
    }
  });
}
