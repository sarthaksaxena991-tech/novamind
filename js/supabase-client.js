// js/supabase-client.js
// Replace the two placeholders below WITHIN the quotes only
window.SUPABASE_URL = 'https://vdbjltfyoxmiijuwjlur.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmpsdGZ5b3htaWlqdXdqbHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTA5MDcsImV4cCI6MjA2ODQ4NjkwN30.rSHfuHf2VcpEua__z2GXipSHVs_3gWSayfswIOyNL9E';

// create global client
window.supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// quick debug
console.info('supabaseClient initialized:', !!window.supabaseClient);
