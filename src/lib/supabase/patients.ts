// /lib/supabase/patients.ts
import {supabase} from "@/integrations/supabase/client";

export type Patient = {
  id: string;
  user_id: string;
  patient_name: string;
  username?: string | null;
  created_at?: string;
  updated_at?: string;
};

/**
 * Return the single patient row for the given user_id (or null).
 */
export async function getCurrentPatient(user_id: string) {
  const {data, error} = await supabase
    .from("patients")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data as Patient | null;
}

/**
 * Upsert a single patient row keyed by user_id (one patient per user).
 * Returns the inserted/updated patient record.
 */
export async function upsertPatient(payload: {
  user_id: string;
  patient_name: string;
  username?: string;
}) {
  const {data, error} = await supabase
    .from("patients")
    .upsert(
      {
        user_id: payload.user_id,
        patient_name: payload.patient_name,
        username: payload.username ?? payload.patient_name.toLowerCase(),
      },
      {onConflict: "user_id", returning: "representation"}
    )
    .select()
    .single();

  if (error) throw error;
  return data as Patient;
}
