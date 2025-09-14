// js/resetRoutes.js
// Backend API base URL
const API_BASE = "https://otp-backend-umvx.onrender.com/api";

const emailEl = document.getElementById("email");
const otpEl = document.getElementById("otp");
const pwEl = document.getElementById("pw");
const pw2El = document.getElementById("pw2");
const sendOtpBtn = document.getElementById("sendOtp");
const resetBtn = document.getElementById("resetBtn");
const msg = document.getElementById("msg");
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");

function showMsg(t, type = "info") {
  if (!msg) return alert(t);
  msg.textContent = t;
  msg.className = "msg " + type;
  msg.style.display = "block";
}

// STEP 1: Send OTP
if (sendOtpBtn) {
  sendOtpBtn.addEventListener("click", async () => {
    const email = (emailEl?.value || "").trim();
    if (!email) return showMsg("Enter email", "error");

    showMsg("Sending OTP...", "info");
    try {
      const res = await fetch(`${API_BASE}/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        showMsg("OTP sent (check email).", "info");
        if (step1) step1.style.display = "none";
        if (step2) step2.style.display = "block";
      } else {
        showMsg(body.error || body.message || "Failed to send OTP", "error");
      }
    } catch (err) {
      console.error("sendOtp error", err);
      showMsg("Network error", "error");
    }
  });
}

// STEP 2: Reset password
if (resetBtn) {
  resetBtn.addEventListener("click", async () => {
    const email = (emailEl?.value || "").trim();
    const otp = (otpEl?.value || "").trim();
    const pw = (pwEl?.value || "").trim();
    const pw2 = (pw2El?.value || "").trim();

    if (!email || !otp || !pw) return showMsg("Email, OTP, password required", "error");
    if (pw.length < 8) return showMsg("Password must be 8+ chars", "error");
    if (pw !== pw2) return showMsg("Passwords do not match", "error");

    showMsg("Resetting...", "info");
    try {
      const res = await fetch(`${API_BASE}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password: pw })
      });

      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        showMsg("Password reset successful. Redirecting...", "info");
        setTimeout(() => (window.location.href = "login.html"), 1500);
      } else {
        showMsg(body.error || body.message || `Failed (${res.status})`, "error");
      }
    } catch (err) {
      console.error("reset error", err);
      showMsg("Network error", "error");
    }
  });
}
