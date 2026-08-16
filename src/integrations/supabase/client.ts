import { createClient } from '@supabase/supabase-js';

// .env se values lein (with fallbacks if environment variables are not set)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://uqblaljkglodmkdizroh.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxYmxhbGprZ2xvZG1rZGl6cm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTY1NzIsImV4cCI6MjA3NDQ3MjU3Mn0.PvUIVNCR9sYuFJezPVFrFo0cEkzSrKWFvc3qaIATEHo";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // 👇 YAHAN CHANGE KIYA: localStorage hata kar sessionStorage laga diya
    storage: sessionStorage, 
    persistSession: true,
    autoRefreshToken: true,
  }
});