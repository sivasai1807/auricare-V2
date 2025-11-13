import {supabase} from "@/integrations/supabase/client";

/**
 * 🔹 Create or update a patient record
 */
export const upsertPatient = async ({
  patient_name,
  username,
  user_id,
}: {
  patient_name: string;
  username?: string;
  user_id?: string;
}) => {
  const {data, error} = await supabase
    .from("patients")
    .upsert(
      {
        patient_name,
        username: username || patient_name.toLowerCase(),
        user_id,
      },
      {onConflict: "user_id"}
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 🔹 Fetch the currently logged-in patient's record
 */
export const getCurrentPatient = async () => {
  const {
    data: {user},
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("User not authenticated");

  const {data, error} = await supabase
    .from("patients")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data;
};
