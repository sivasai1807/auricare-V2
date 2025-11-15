import {supabase} from "@/integrations/supabase/client";

export type Video = {
  id: string;
  title: string;
  video_url: string;
  description?: string | null;
  category?: string | null;
  thumbnail_url?: string | null;
  duration?: string | null;
  views?: number | null;
  uploaded_by?: string | null; // doctor.id (UUID)
  created_at: string;
  updated_at: string;
};

/**
 * uploadDoctorVideo
 * - Assumes doctor's auth.user.id === doctors.id
 * - Stores uploaded_by = auth.user.id (doctor.id)
 */
export async function uploadDoctorVideo(
  doctorId: string,
  file: File,
  title: string,
  description?: string,
  category: string = "General"
) {
  const auth = await supabase.auth.getUser();
  if (!auth.data.user) throw new Error("Supabase Auth session not found");

  const userId = auth.data.user.id;

  const path = `${userId}/${Date.now()}_${file.name}`;

  const {error: uploadError} = await supabase.storage
    .from("doctor-videos")
    .upload(path, file);

  if (uploadError) throw uploadError;

  const {data: url} = supabase.storage.from("doctor-videos").getPublicUrl(path);

  const videoUrl = url.publicUrl;

  const {data, error} = await supabase
    .from("learning_videos")
    .insert([
      {
        title,
        description,
        category,
        video_url: videoUrl,
        uploaded_by: userId, // IMPORTANT
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * listDoctorVideosByUploader
 * - Returns videos uploaded by the logged-in doctor.
 */
export async function listDoctorVideosByUploader() {
  const auth = await supabase.auth.getUser();
  if (!auth.data.user) throw new Error("Supabase Auth session not found");

  const doctorId = auth.data.user.id;

  const {data, error} = await supabase
    .from("learning_videos")
    .select("*")
    .eq("uploaded_by", doctorId)
    .order("created_at", {ascending: false});

  if (error) throw error;
  return (data ?? []) as Video[];
}

/**
 * listVideosByDoctorId
 * - Helper: get videos by doctor.profile id
 */
export async function listVideosByDoctorId(doctorId: string) {
  const {data, error} = await supabase
    .from("learning_videos")
    .select("*")
    .eq("uploaded_by", doctorId)
    .order("created_at", {ascending: false});

  if (error) throw error;
  return (data ?? []) as Video[];
}

/**
 * listPatientDoctorVideos
 * - Gets the patient's latest appointment doctor_id and returns videos uploaded by that doctor.
 */
export async function listPatientDoctorVideos(patientId: string) {
  const {data: appointment, error: appointmentErr} = await supabase
    .from("appointments")
    .select("doctor_id")
    .eq("patient_id", patientId)
    .order("created_at", {ascending: false})
    .limit(1)
    .maybeSingle();

  if (appointmentErr || !appointment) return [];

  const doctorId = appointment.doctor_id;
  return listVideosByDoctorId(doctorId);
}

/**
 * listUserDoctorVideos
 * - For a logged-in user: find all patients linked to the user,
 *   get their appointments' doctor_ids, and return videos from those doctors.
 */
export async function listUserDoctorVideos(userId: string) {
  // get patient's ids for this user
  const {data: patients, error: patientsErr} = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", userId);

  if (patientsErr || !patients || patients.length === 0) return [];

  const patientIds = patients.map((p) => p.id);

  // get appointments for those patientIds
  const {data: appointments, error: appointmentsErr} = await supabase
    .from("appointments")
    .select("doctor_id")
    .in("patient_id", patientIds);

  if (appointmentsErr || !appointments || appointments.length === 0) return [];

  const doctorIds = [...new Set(appointments.map((a) => a.doctor_id))];

  let collected: Video[] = [];
  for (const docId of doctorIds) {
    const videos = await listVideosByDoctorId(docId);
    collected.push(...videos);
  }

  // dedupe by id and sort newest-first
  const unique = collected.filter(
    (v, idx, self) => idx === self.findIndex((t) => t.id === v.id)
  );

  return unique.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * updateVideo
 */
export async function updateVideo(
  id: string,
  changes: Partial<Pick<Video, "title" | "description" | "category">>
) {
  const {error} = await supabase
    .from("learning_videos")
    .update(changes)
    .eq("id", id);

  if (error) throw error;
}

/**
 * deleteVideo
 */
export async function deleteVideo(id: string, video_url: string) {
  const {error} = await supabase.from("learning_videos").delete().eq("id", id);
  if (error) throw error;

  // best-effort delete from storage
  try {
    const path = new URL(video_url).pathname.split(
      "/object/public/doctor-videos/"
    )[1];
    if (path) {
      await supabase.storage.from("doctor-videos").remove([path]);
    }
  } catch (e) {
    // ignore
  }
}
