// /lib/supabase/appointments.ts
import {supabase} from "@/integrations/supabase/client";

export type Appointment = {
  id: string;
  patient_id: string | null;
  doctor_id: string | null; // therapist_id mapped here
  status: "pending" | "confirmed" | "completed" | "cancelled";
  // convenience fields for UI
  date: string; // yyyy-mm-dd
  time: string; // HH:MM:SS
  appointment_date: string | null; // raw ISO timestamp
  created_at: string;
  updated_at: string;
  patient_name?: string | null; // from appointment row (per-appointment)
  username?: string | null;
  reason?: string | null;
  doctor_name?: string | null;
  specialization?: string | null;
};

/**
 * Create appointment:
 * - stores patient_id and also stores patient_name (snapshot) on appointment row
 * - uses therapist_id
 */
export async function createAppointment(payload: {
  patient_id: string;
  therapist_id: string;
  appointment_date: string; // ISO timestamp
  patient_name?: string | null; // snapshot
  patient_username?: string | null;
  reason?: string | null;
}) {
  const row: any = {
    patient_id: payload.patient_id,
    therapist_id: payload.therapist_id,
    appointment_date: payload.appointment_date,
    reason: payload.reason ?? null,
    status: "pending",
    // snapshot patient fields so each appointment carries its booked name
    patient_name: payload.patient_name ?? null,
    patient_username: payload.patient_username ?? null,
  };

  const {data, error} = await supabase
    .from("appointments")
    .insert([row])
    .select("*")
    .single();

  if (error) throw error;
  return normalizeAppointment(data);
}

/**
 * List appointments for a doctor (uses v_doctor_appointments view if present).
 */
export async function listDoctorAppointments(doctorId: string) {
  const {data, error} = await supabase
    .from("v_doctor_appointments")
    .select(
      "id, patient_id, therapist_id, status, appointment_date, appointment_day, appointment_time, created_at, updated_at, display_patient_name, display_username, reason, doctor_name, specialization"
    )
    .eq("therapist_id", doctorId)
    .order("appointment_date", {ascending: true});

  if (error) throw error;
  return (data ?? []).map(normalizeAppointment);
}

/**
 * List appointments for a patient_id (directly from appointments table).
 */
export async function listPatientAppointments(patient_id: string) {
  const {data, error} = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patient_id)
    .order("appointment_date", {ascending: true});

  if (error) throw error;
  return (data ?? []).map(normalizeAppointment);
}

/**
 * List appointments for the logged-in user (finds their patients then appointments).
 * IMPORTANT: For display we use the appointment row's patient_name (per-appointment snapshot).
 */
export async function listUserAppointments(userId: string) {
  // fetch patient rows for this user (usually 1 row per user in your setup)
  const {data: patients, error: patientError} = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", userId);

  if (patientError) throw patientError;
  if (!patients || patients.length === 0) return [];

  const patientIds = patients.map((p: any) => p.id);

  const {data: appointments, error: apptError} = await supabase
    .from("appointments")
    .select("*")
    .in("patient_id", patientIds)
    .order("appointment_date", {ascending: true});

  if (apptError) throw apptError;

  // fetch doctor enrichment
  const doctorIds = [
    ...new Set(
      (appointments ?? []).map((a: any) => a.therapist_id).filter(Boolean)
    ),
  ];
  let doctorMap = new Map();
  if (doctorIds.length > 0) {
    const {data: docs} = await supabase
      .from("doctors")
      .select("id, name, specialization")
      .in("id", doctorIds);
    if (docs) doctorMap = new Map(docs.map((d: any) => [d.id, d]));
  }

  return (appointments ?? []).map((row: any) => {
    const normalized = normalizeAppointment(row);
    const doc = doctorMap.get(row.therapist_id);
    return {
      ...normalized,
      doctor_name: doc?.name ?? normalized.doctor_name,
      specialization: doc?.specialization ?? normalized.specialization,
      // crucial: patient_name comes from the appointment row snapshot (normalized.patient_name)
      patient_name: normalized.patient_name,
    };
  });
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
  doctorId: string,
  onInsert: (row: Appointment) => void
) {
  return supabase
    .channel(`appointments-doctor-${doctorId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "appointments",
        filter: `therapist_id=eq.${doctorId}`,
      },
      (payload) => {
        onInsert(normalizeAppointment(payload.new));
      }
    )
    .subscribe();
}

/**
 * normalizeAppointment: builds the fields the UI expects
 * - prefers display_* columns from view but falls back to appointment row columns
 */
function normalizeAppointment(row: any): Appointment {
  const d = row.appointment_date ? new Date(row.appointment_date) : null;

  let date = row.appointment_day ?? "";
  let time = row.appointment_time ?? "";

  if ((!date || !time) && d) {
    date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    time = `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  }

  // patient_name priority: view.display_patient_name -> appointment.patient_name
  const patient_name = row.display_patient_name ?? row.patient_name ?? null;
  const username = row.display_username ?? row.patient_username ?? null;

  return {
    id: String(row.id),
    patient_id: row.patient_id ?? null,
    doctor_id: row.therapist_id ?? null,
    status: (row.status ?? "pending") as Appointment["status"],
    date,
    time,
    appointment_date: row.appointment_date ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    patient_name,
    username,
    reason: row.reason ?? row.notes ?? null,
    doctor_name: row.doctor_name ?? null,
    specialization: row.specialization ?? null,
  };
}
