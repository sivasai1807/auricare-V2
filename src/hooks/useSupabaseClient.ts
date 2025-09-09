import {useMemo} from "react";
import {supabase} from "@/integrations/supabase/client";

/**
 * Returns a memoized Supabase client instance.
 * Central place to extend cross-cutting concerns later (tracing, default schema, etc.).
 */
export function useSupabaseClient() {
  const client = useMemo(() => {
    if (!supabase) {
      // This should never happen, but guard to help diagnose env misconfigurations
      throw new Error("Supabase client not initialized");
    }
    return supabase;
  }, []);

  return client;
}

export default useSupabaseClient;
