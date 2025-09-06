// Replace these two values with your project details (keep quotes)
const SUPABASE_URL = 'https://vdbjltfyoxmiijuwjlur.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmpsdGZ5b3htaWlqdXdqbHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTA5MDcsImV4cCI6MjA2ODQ4NjkwN30.rSHfuHf2VcpEua__z2GXipSHVs_3gWSayfswIOyNL9E';

// global client used by other scripts
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

