// Lightweight helpers used by pages
function showAlert(msg, type='error'){ const a = document.getElementById('alert'); if(!a) return; a.textContent = msg; a.className = 'alert ' + (type==='success'?'success':'error'); a.style.display = 'block'; }
function clearAlert(){ const a=document.getElementById('alert'); if(!a) return; a.style.display='none'; a.textContent=''; }

/** Supabase wrappers returning {data, error} */
async function supaSignUp(email, password){
  try{ return await supabaseClient.auth.signUp({ email, password }); }catch(e){ return { error: e } }
}
async function supaSignIn(email, password){
  try{ return await supabaseClient.auth.signInWithPassword({ email, password }); }catch(e){ return { error: e } }
}
async function supaSignOut(){ try{ return await supabaseClient.auth.signOut(); }catch(e){ return { error: e } }
}
async function supaResetPassword(email){
  try{ return await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-success.html' }); }catch(e){ return { error: e } }
}
id="alert";

