// js/auth.js
// Lightweight shared helpers and supabase wrappers used by pages.
// Must be loaded AFTER supabase-client.js

// UI helpers
window.showAlert = function(msg, type='error') {
  const a = document.getElementById('alert');
  if (!a) return console.warn('alert element not found');
  a.textContent = msg;
  a.className = 'alert ' + (type === 'success' ? 'success' : 'error');
  a.style.display = 'block';
};
window.clearAlert = function() {
  const a = document.getElementById('alert');
  if (!a) return;
  a.style.display = 'none';
  a.textContent = '';
};

// Defensive check
if (!window.supabaseClient) {
  console.error('supabaseClient missing. Ensure js/supabase-client.js loads before js/auth.js');
}

// Supabase wrappers
window.supaSignUp = async function(email, password) {
  try { return await window.supabaseClient.auth.signUp({ email, password }); }
  catch (e) { return { error: e }; }
};
window.supaSignIn = async function(email, password) {
  try { return await window.supabaseClient.auth.signInWithPassword({ email, password }); }
  catch (e) { return { error: e }; }
};
window.supaSignOut = async function() {
  try { return await window.supabaseClient.auth.signOut(); }
  catch (e) { return { error: e }; }
};
window.supaResetPassword = async function(email) {
  try {
    return await window.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-success.html'
    });
  } catch (e) { return { error: e }; }
};

// Auto-attach listeners for login/forgot if those forms exist (optional)
document.addEventListener('DOMContentLoaded', () => {
  // login form quick attach (if page uses these IDs)
  const loginForm = document.getElementById('loginForm') || document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); clearAlert();
      const email = (document.getElementById('li-email') || document.getElementById('login-email') || {}).value?.trim() || '';
      const pwd = (document.getElementById('li-password') || document.getElementById('login-password') || {}).value || '';
      if (!email || !pwd) return showAlert('Email and password required');
      const res = await supaSignIn(email, pwd);
      if (res?.error) showAlert(res.error?.message || res.error, 'error'); else { showAlert('Login OK','success'); setTimeout(()=>location.href='dashboard.html',900); }
    });
  }

  // forgot page attach
  const sendBtn = document.getElementById('sendReset') || document.getElementById('send-reset');
  if (sendBtn) {
    sendBtn.addEventListener('click', async () => {
      clearAlert();
      const email = (document.getElementById('fp-email') || {}).value?.trim() || '';
      if (!email) return showAlert('Enter your email');
      const res = await supaResetPassword(email);
      if (res?.error) showAlert(res.error?.message || res.error, 'error'); else showAlert('Reset email sent. Check inbox', 'success');
    });
  }
});
