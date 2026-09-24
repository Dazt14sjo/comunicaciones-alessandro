import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://cxmvrbrfbfjnsczlggpd.supabase.co";
const SUPABASE_KEY = "sb_publishable_kgs6AgVe8y4AdT9srlcnVA_xO8PeWFu";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);