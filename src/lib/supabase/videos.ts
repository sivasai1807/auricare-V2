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
  uploaded_by?: string | null;
  created_at: string;
  updated_at: string;
};

export async function uploadDoctorVideo(
  ownerFolder: string,
  file: File,
  title: string,
  description?: string,
  category: string = "General"
) {
  const auth = await supabase.auth.getUser();
  if (!auth.data.user) throw new Error("Supabase Auth session not found");
  const path = `${ownerFolder}/${Date.now()}_${file.name}`;
  const {error: uploadError} = await supabase.storage
    .from("doctor-videos")
    .upload(path, file, {upsert: false});
  if (uploadError) throw uploadError;

  const {data: publicURL} = supabase.storage
    .from("doctor-videos")
    .getPublicUrl(path);
  const {data, error} = await supabase
    .from("learning_videos")
    .insert([
      {
        title,
        description: description ?? null,
        category,
        video_url: publicURL.publicUrl,
        duration: "--:--",
        views: 0,
        uploaded_by: auth.data.user.id,
      },
    ])
    .select("*")
    .single();
  if (error) throw error;
  return data as Video;
}

export async function listDoctorVideosByUploader() {
  const auth = await supabase.auth.getUser();
  if (!auth.data.user) throw new Error("Supabase Auth session not found");
  const {data, error} = await supabase
    .from("learning_videos")
    .select("*")
    .eq("uploaded_by", auth.data.user.id)
    .order("created_at", {ascending: false});
  if (error) throw error;
  return (data ?? []) as Video[];
}

// List videos uploaded by a specific doctor (for patients to view their doctor's videos)
export async function listVideosByDoctorUserId(doctorUserId: string) {
  const {data, error} = await supabase
    .from("learning_videos")
    .select("*")
    .eq("uploaded_by", doctorUserId)
    .order("created_at", {ascending: false});
  if (error) throw error;
  return (data ?? []) as Video[];
}

// List all videos for patients (videos uploaded by their assigned doctor)
export async function listPatientDoctorVideos(patientId: string) {
  // Get patient's doctor from appointments
  const {data: appointmentData, error: appointmentError} = await supabase
    .from("appointments")
    .select("doctor_id")
    .eq("patient_id", patientId)
    .order("created_at", {ascending: false})
    .limit(1)
    .maybeSingle();
  
  if (appointmentError || !appointmentData) {
    return [];
  }

  // Get doctor's user_id
  const {data: doctorData, error: doctorError} = await supabase
    .from("doctors")
    .select("user_id")
    .eq("id", appointmentData.doctor_id)
    .maybeSingle();

  if (doctorError || !doctorData?.user_id) {
    return [];
  }

  // Get videos uploaded by this doctor
  return listVideosByDoctorUserId(doctorData.user_id);
}

// List videos for users (videos uploaded by doctors they have appointments with)
export async function listUserDoctorVideos(userId: string) {
  // Get all appointments for this user's patients
  const {data: patientData, error: patientError} = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", userId);
  
  if (patientError || !patientData || patientData.length === 0) {
    return [];
  }

  const patientIds = patientData.map(p => p.id);

  // Get unique doctor IDs from appointments
  const {data: appointmentData, error: appointmentError} = await supabase
    .from("appointments")
    .select("doctor_id")
    .in("patient_id", patientIds);
  
  if (appointmentError || !appointmentData || appointmentData.length === 0) {
    return [];
  }

  const uniqueDoctorIds = [...new Set(appointmentData.map(a => a.doctor_id))];

  // Get all doctor user_ids
  const {data: doctorData, error: doctorError} = await supabase
    .from("doctors")
    .select("user_id")
    .in("id", uniqueDoctorIds);
  
  if (doctorError || !doctorData || doctorData.length === 0) {
    return [];
  }

  // Get all videos from these doctors
  const allVideos: Video[] = [];
  for (const doctor of doctorData) {
    if (doctor.user_id) {
      const videos = await listVideosByDoctorUserId(doctor.user_id);
      allVideos.push(...videos);
    }
  }

  // Remove duplicates and sort by created_at
  const uniqueVideos = allVideos.filter((v, index, self) => 
    index === self.findIndex(t => t.id === v.id)
  );
  
  return uniqueVideos.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

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

export async function deleteVideo(id: string, video_url: string) {
  // delete db row
  const {error} = await supabase.from("learning_videos").delete().eq("id", id);
  if (error) throw error;

  // best-effort delete file
  const path = new URL(video_url).pathname.split(
    "/object/public/doctor-videos/"
  )[1];
  if (path) {
    await supabase.storage.from("doctor-videos").remove([path]);
  }
}
