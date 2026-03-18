declare module "@/lib/supabase" {
  import type { SupabaseClient } from "@supabase/supabase-js";

  export const supabase: SupabaseClient;
}
