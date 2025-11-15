// pages/UserAppointments.tsx
import {useState, useEffect} from "react";
import {motion} from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Calendar, Clock, Stethoscope} from "lucide-react";
import {toast} from "@/hooks/use-toast";
import {useRoleAuth} from "@/hooks/useRoleAuth";
import {supabase} from "@/integrations/supabase/client";
import {
  createAppointment,
  listUserAppointments,
  Appointment,
} from "@/lib/supabase/appointments";
import {upsertPatient} from "@/lib/supabase/patients";

const UserAppointments = () => {
  const {user} = useRoleAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patientName: "",
    doctorId: "",
    date: "",
    time: "",
    details: "",
  });

  useEffect(() => {
    if (user) {
      fetchDoctors();
      fetchAppointments();
    }
  }, [user]);

  const fetchDoctors = async () => {
    const {data, error} = await supabase
      .from("doctors")
      .select("id, name, specialization");
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load doctors.",
        variant: "destructive",
      });
      return;
    }
    setDoctors(data || []);
  };

  const fetchAppointments = async () => {
    if (!user) return;
    try {
      const data = await listUserAppointments(user.id);
      setAppointments(data);
    } catch (err: any) {
      toast({title: "Error", description: err.message, variant: "destructive"});
    }
  };

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`appointments-user-${user.id}`)
      .on(
        "postgres_changes",
        {event: "*", schema: "public", table: "appointments"},
        () => fetchAppointments()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      });
      return;
    }
    if (
      !form.patientName.trim() ||
      !form.doctorId ||
      !form.date ||
      !form.time
    ) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // upsert patient (one-per-user)
      const patient = await upsertPatient({
        user_id: user.id,
        patient_name: form.patientName.trim(),
        username: form.patientName.toLowerCase().trim(),
      });

      // build ISO timestamp from date + time
      const iso = new Date(`${form.date}T${form.time}`).toISOString();

      // create appointment - save patient snapshot fields
      await createAppointment({
        patient_id: patient.id,
        therapist_id: form.doctorId,
        appointment_date: iso,
        patient_name: patient.patient_name,
        patient_username: patient.username ?? null,
        reason: form.details.trim() || null,
      });

      toast({title: "Success", description: "Appointment booked!"});

      setForm({patientName: "", doctorId: "", date: "", time: "", details: ""});
      fetchAppointments();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("en-US", {dateStyle: "medium", timeStyle: "short"});
  };

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className="max-w-5xl mx-auto space-y-8 p-4"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <p className="text-gray-500">Book and view your appointments</p>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope /> Book Appointment
          </CardTitle>
          <CardDescription>Fill out the form below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Patient Name"
              value={form.patientName}
              onChange={(e) => setForm({...form, patientName: e.target.value})}
              required
            />
            <Select
              value={form.doctorId}
              onValueChange={(v) => setForm({...form, doctorId: v})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} - {d.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({...form, date: e.target.value})}
              required
            />
            <Input
              type="time"
              value={form.time}
              onChange={(e) => setForm({...form, time: e.target.value})}
              required
            />
            <Textarea
              className="md:col-span-2"
              placeholder="Reason for visit"
              value={form.details}
              onChange={(e) => setForm({...form, details: e.target.value})}
            />
            <Button type="submit" disabled={loading} className="md:col-span-2">
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
          <CardDescription>Track your appointment status below</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No appointments yet
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((a) => (
                <Card
                  key={a.id}
                  className="shadow-md border-0 bg-gradient-to-r from-gray-50 to-white"
                >
                  <CardHeader className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        {a.doctor_name}
                        {a.specialization ? ` (${a.specialization})` : ""}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(a.appointment_date)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(a.status)}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </Badge>
                  </CardHeader>

                  <CardContent>
                    <div className="bg-gray-50 p-3 rounded-lg mb-3 text-sm text-gray-700">
                      <p>
                        <strong>Patient:</strong> {a.patient_name ?? "Unknown"}
                      </p>
                      <p className="mt-2">
                        <strong>Doctor:</strong> {a.doctor_name}
                        {a.specialization ? ` (${a.specialization})` : ""}
                      </p>
                      <p className="mt-3">
                        {a.reason || "No details provided"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(
                          a.appointment_date || ""
                        ).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(a.appointment_date || "").toLocaleTimeString(
                          [],
                          {hour: "2-digit", minute: "2-digit"}
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserAppointments;
