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
import {Badge} from "@/components/ui/badge";
import {Calendar, Clock, User, CheckCircle, XCircle, Users} from "lucide-react";
import {supabase} from "@/integrations/supabase/client";
import {toast} from "@/hooks/use-toast";
import {getCurrentDoctor} from "@/lib/supabase/doctors";
import {listDoctorAppointments} from "@/lib/supabase/appointments";
import {useRoleAuth} from "@/hooks/useRoleAuth";

interface Appointment {
  id: string;
  patient_name: string;
  patient_username?: string;
  appointment_date: string;
  reason?: string;
  status: string;
  patient_id: string;
  therapist_id: string;
  doctor_name?: string;
  specialization?: string;
}

const DoctorAppointments = () => {
  const {user} = useRoleAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      setLoading(true);
      try {
        const doctor = await getCurrentDoctor();
        if (!doctor) throw new Error("Doctor profile not found");

        const data = await listDoctorAppointments(doctor.id);
        setAppointments(data);

        const channel = supabase
          .channel(`appointments-doctor-${doctor.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "appointments",
              filter: `therapist_id=eq.${doctor.id}`,
            },
            async () => {
              const updatedData = await listDoctorAppointments(doctor.id);
              setAppointments(updatedData);
            }
          )
          .subscribe();

        unsubscribe = () => supabase.removeChannel(channel);
      } catch (err: any) {
        toast({
          title: "Error loading appointments",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const onUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const {error} = await supabase
        .from("appointments")
        .update({status: newStatus})
        .eq("id", id);
      if (error) throw error;

      toast({
        title: "Appointment Updated",
        description: `Status changed to ${newStatus}`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
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

  const formatDate = (d: string) => {
    if (!d) return "Invalid Date";
    const date = new Date(d);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (d: string) => {
    if (!d) return "Invalid Time";
    const date = new Date(d);
    return date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[400px] text-gray-500 animate-pulse">
        Loading appointments...
      </div>
    );

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      className="max-w-6xl mx-auto space-y-8 p-4"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Doctor Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your appointments in real-time
        </p>
      </div>

      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="size-5 text-purple-600" /> All Appointments
            </span>
            <Badge className="bg-purple-100 text-purple-800">
              {appointments.length} total
            </Badge>
          </CardTitle>
          <CardDescription>
            Accept, complete, or cancel appointments below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <Calendar className="mx-auto mb-3 text-gray-400 size-12" />
              No appointments yet
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((a) => (
                <Card
                  key={a.id}
                  className="shadow-lg border-0 bg-gradient-to-r from-gray-50 to-white hover:shadow-xl transition-all"
                >
                  <CardHeader className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {a.patient_name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        {formatDate(a.appointment_date)} •{" "}
                        {formatTime(a.appointment_date)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(a.status)}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </Badge>
                  </CardHeader>

                  <CardContent className="space-y-3 text-gray-700">
                    <p>
                      <strong>Patient:</strong> {a.patient_name}{" "}
                      <span className="text-gray-500">
                        ({a.patient_username || "No username"})
                      </span>
                    </p>
                    <p>
                      <strong>Reason:</strong> {a.reason || "Not provided"}
                    </p>
                    <div className="flex gap-2 flex-wrap pt-2">
                      {a.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(a.id, "confirmed")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="size-4 mr-2" /> Accept
                        </Button>
                      )}
                      {a.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(a.id, "completed")}
                          className="border-blue-200 hover:bg-blue-50"
                        >
                          <CheckCircle className="size-4 mr-2" /> Mark Complete
                        </Button>
                      )}
                      {a.status !== "cancelled" && a.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onUpdateStatus(a.id, "cancelled")}
                        >
                          <XCircle className="size-4 mr-2" /> Cancel
                        </Button>
                      )}
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

export default DoctorAppointments;
