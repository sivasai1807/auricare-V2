// ============================================================================
// DOCTOR PROFILE MANAGEMENT
// ============================================================================
// This module handles doctor profile retrieval and management
//
// AUTHENTICATION STRATEGY:
// 1. First tries to get doctor using external ID from localStorage
// 2. Falls back to email-based lookup if localStorage fails
// 3. Returns null if no doctor profile found
//
// DATABASE TABLE:
// - doctors: Stores doctor profile information
//
// IMPORTANT NOTES:
// - doctor_id field stores external ID like "DOC001" (different from UUID id)
// - localStorage key "doctor" is used for demo/testing purposes
// - Production apps should use proper auth tokens
// ============================================================================

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

// ============================================================================
// GET CURRENT DOCTOR
// ============================================================================
// Retrieves the currently authenticated doctor's profile
//
// LOOKUP STRATEGY:
// 1. Check localStorage for demo doctor credentials
// 2. If found, query database by external doctor_id
// 3. If not found or fails, query by authenticated user's email
// 4. Return null if no match found
//
// RETURNS: Doctor object or null
//
// CUSTOMIZATION:
// - For production, remove localStorage logic and use auth tokens only
// - Update to match your authentication flow
// ============================================================================
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
