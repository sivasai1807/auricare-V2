import {supabase} from "@/integrations/supabase/client";

export type Doctor = {
  id: string;
  doctor_id?: string; // external text id like DOC001
  name: string;
  email: string;
  specialization?: string | null;
  created_at: string;
  updated_at: string;
};

// Fetch doctor profile based on demo localStorage doctor_id or auth email fallback
export async function getCurrentDoctor(): Promise<Doctor | null> {
  try {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("doctor") : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      const externalId = parsed?.user_metadata?.doctor_id || parsed?.doctor_id;
      if (externalId) {
        const {data} = await supabase
          .from("doctors")
          .select("*")
          .eq("doctor_id", externalId)
          .maybeSingle();
        if (data) return data as Doctor;
      }
    }
  } catch {}

  const {data: auth} = await supabase.auth.getUser();
  if (auth?.user?.email) {
    const {data} = await supabase
      .from("doctors")
      .select("*")
      .eq("email", auth.user.email)
      .maybeSingle();
    if (data) return data as Doctor;
  }
  return null;
}
