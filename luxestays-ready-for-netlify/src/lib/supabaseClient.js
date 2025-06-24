import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iroaiwjwllftmqeyrvau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb2Fpd2p3bGxmdG1xZXlydmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MDEyMDUsImV4cCI6MjA2NDQ3NzIwNX0.3Fx17uLiCmjgk6nSPO0r4n7KkCmsV8iFvsIgNlJOu1U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);