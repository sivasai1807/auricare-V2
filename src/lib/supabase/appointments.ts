import {supabase} from "@/integrations/supabase/client";

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string; // we will map from therapist_id
  status: "pending" | "confirmed" | "completed" | "cancelled";
  date: string; // yyyy-mm-dd
  time: string; // HH:MM:SS
  created_at: string;
  updated_at: string;
};

export async function createAppointment(payload: {
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
}) {
  // Map to existing columns: therapist_id, appointment_date (timestamp)
  const appointment_date = `${payload.date}T${payload.time}`;
  const {data, error} = await supabase
    .from("appointments")
    .insert([
      {
        patient_id: payload.patient_id,
        therapist_id: payload.doctor_id,
        appointment_date,
        status: "pending",
      },
    ])
    .select("*")
    .single();
  if (error) throw error;
  return normalizeAppointment(data);
}

export async function listDoctorAppointments(doctor_id: string) {
  const {data, error} = await supabase
    .from("appointments")
    .select("*")
    .eq("therapist_id", doctor_id)
    .order("appointment_date", {ascending: true});
  if (error) throw error;
  return (data ?? []).map(normalizeAppointment);
}

export async function listPatientAppointments(patient_id: string) {
  const {data, error} = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patient_id)
    .order("appointment_date", {ascending: true});
  if (error) throw error;
  return (data ?? []).map(normalizeAppointment);
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment["status"]
) {
  const {error} = await supabase
    .from("appointments")
    .update({status})
    .eq("id", id);
  if (error) throw error;
}

export function subscribeToDoctorAppointments(
  doctor_id: string,
  onInsert: (row: Appointment) => void
) {
  return supabase
    .channel(`appointments-doctor-${doctor_id}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "appointments",
        filter: `therapist_id=eq.${doctor_id}`,
      },
      (payload) => {
        onInsert(normalizeAppointment(payload.new));
      }
    )
    .subscribe();
}

function normalizeAppointment(row: any): Appointment {
  const ts = row.appointment_date as string | null;
  let date = "";
  let time = "";
  if (ts) {
    const d = new Date(ts);
    date = d.toISOString().slice(0, 10);
    time = d.toISOString().slice(11, 19);
  }
  return {
    id: String(row.id),
    patient_id: row.patient_id,
    doctor_id: row.therapist_id,
    status: (row.status || "pending") as Appointment["status"],
    date,
    time,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
