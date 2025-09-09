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
