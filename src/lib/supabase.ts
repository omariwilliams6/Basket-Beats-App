import { createClient } from "@supabase/supabase-js";

// Connected to existing BasketBeats Supabase project.
// These keys are publishable (safe in client code).
const SUPABASE_URL = "https://ngufsfhraaldkelzszgr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gkRkVNwOnk7SkMmanVUpyQ_pOFlBiTt";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  },
});

export const PHOTO_BUCKET = "player-photos";
