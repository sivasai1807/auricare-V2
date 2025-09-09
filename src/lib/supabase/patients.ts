import {supabase} from "@/integrations/supabase/client";

export type Patient = {
  id: string;
  user_id: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
};

export async function upsertPatient(profile: {
  name: string;
  email?: string;
  phone?: string;
}) {
  const auth = await supabase.auth.getUser();
  if (!auth.data.user) throw new Error("Supabase Auth session not found");
  const user_id = auth.data.user.id;
  const {data, error} = await supabase
    .from("patients")
    .upsert(
      {
        user_id,
        name: profile.name,
        email: profile.email ?? null,
        phone: profile.phone ?? null,
      },
      {onConflict: "user_id"}
    )
    .select("*")
    .single();
  if (error) throw error;
  return data as Patient;
}

export async function getCurrentPatient(): Promise<Patient | null> {
  const auth = await supabase.auth.getUser();
  if (!auth.data.user) return null;
  const {data, error} = await supabase
    .from("patients")
    .select("*")
    .eq("user_id", auth.data.user.id)
    .single();
  if (error) return null;
  return data as Patient;
}

export async function getPatientById(
  patientId: string
): Promise<Patient | null> {
  const {data, error} = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .single();
  if (error) return null;
  return data as Patient;
}
