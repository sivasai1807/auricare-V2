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
} from "@/lib/supabase/appointments";
import {upsertPatient} from "@/lib/supabase/patients";

const UserAppointments = () => {
  const {user} = useRoleAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patientName: "",
    doctorId: "",
    date: "",
    time: "",
    details: "",
  });

  // 🩺 Fetch doctors & appointments
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
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch appointments.",
        variant: "destructive",
      });
    }
  };

  // 🔁 Real-time sync
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

  // ✅ FIXED handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.date || !form.time) {
      toast({
        title: "Error",
        description: "Please select both date and time before booking.",
        variant: "destructive",
      });
      return;
    }

    if (!form.doctorId || !form.patientName.trim()) {
      toast({
        title: "Error",
        description: "Please fill in patient name and select a doctor.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // ✅ Step 1: Parse DD-MM-YYYY safely
      let formattedDate = form.date;
      if (form.date.includes("-")) {
        const parts = form.date.split("-");
        // If format looks like DD-MM-YYYY, reverse it
        if (parts[0].length === 2) {
          formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      // ✅ Step 2: Normalize time to 24-hour
      let timeValue = form.time.trim();
      if (
        timeValue.toLowerCase().includes("am") ||
        timeValue.toLowerCase().includes("pm")
      ) {
        const [time, modifier] = timeValue.split(" ");
        let [hours, minutes] = time.split(":");
        let h = parseInt(hours, 10);
        if (modifier.toLowerCase() === "pm" && h < 12) h += 12;
        if (modifier.toLowerCase() === "am" && h === 12) h = 0;
        timeValue = `${String(h).padStart(2, "0")}:${minutes}`;
      }

      // ✅ Step 3: Combine and validate
      const localDateTime = `${formattedDate}T${timeValue}`;
      const appointmentDate = new Date(localDateTime);

      if (isNaN(appointmentDate.getTime())) {
        toast({
          title: "Error",
          description: "Invalid date or time format. Please re-enter.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const isoTimestamp = appointmentDate.toISOString();

      // ✅ Step 4: Upsert patient
      const patient = await upsertPatient({
        patient_name: form.patientName.trim(),
        username: form.patientName.toLowerCase().trim(),
        user_id: user?.id,
      });

      // ✅ Step 5: Create appointment
      const {error} = await createAppointment({
        patient_id: patient.id,
        therapist_id: form.doctorId,
        appointment_date: isoTimestamp,
        reason: form.details.trim(),
      });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      });

      setForm({
        patientName: "",
        doctorId: "",
        date: "",
        time: "",
        details: "",
      });
      fetchAppointments();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
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

  const formatDateTime = (ts: string) => {
    if (!ts) return "N/A";
    const d = new Date(ts);
    return d.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className="max-w-5xl mx-auto space-y-8 p-4"
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          My Appointments
        </h1>
        <p className="text-gray-500 mt-2">Book and view your appointments</p>
      </div>

      {/* Booking Form */}
      <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="size-5 text-blue-600" />
            Book Appointment
          </CardTitle>
          <CardDescription>
            Fill out the form below to schedule an appointment
          </CardDescription>
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
              step="60"
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
            <Button
              type="submit"
              disabled={loading}
              className="md:col-span-2 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Appointment List */}
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
                        {a.doctor_name || "Doctor"}
                      </CardTitle>
                      <CardDescription>
                        {formatDateTime(a.appointment_date)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(a.status)}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 bg-gray-50 p-2 rounded-lg mb-2">
                      {a.reason || "No details provided"}
                    </p>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(a.appointment_date).toLocaleDateString()}
                      <Clock className="w-4 h-4" />
                      {new Date(a.appointment_date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
