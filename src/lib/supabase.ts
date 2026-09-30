import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnqnacwcgorpwrvdgdat.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucW5hY3djZ29ycHdydmRnZGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDMyODYsImV4cCI6MjEwNjMxOTI4Nn0.AT_jGVGp9zOQd_Rt1BA_mcJ6_lZFOuXaqktDlQ8ySc0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
