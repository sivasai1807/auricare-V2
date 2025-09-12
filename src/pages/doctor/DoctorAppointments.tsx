import {useState, useEffect} from "react";
import {motion} from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Calendar, Clock, User, CheckCircle, XCircle, Users} from "lucide-react";
import {useRoleAuth} from "@/hooks/useRoleAuth";
import {toast} from "@/hooks/use-toast";
import {getCurrentDoctor} from "@/lib/supabase/doctors";
import {
  listDoctorAppointments,
  updateAppointmentStatus,
  subscribeToDoctorAppointments,
  type Appointment,
} from "@/lib/supabase/appointments";

interface UIAppointment extends Appointment {
  patient_name?: string;
  username?: string;
  details?: string;
  doctor_name?: string;
  specialization?: string;
}

const DoctorAppointments = () => {
  const {user} = useRoleAuth();
  const [appointments, setAppointments] = useState<UIAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // Helper: Validate UUID
  const isValidUUID = (value: string) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      value
    );

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const doctor = await getCurrentDoctor();
        if (!doctor) throw new Error("Doctor profile not found");
        setDoctorId(doctor.id);
        const data = await listDoctorAppointments(doctor.id);
        setAppointments(data);

        // Subscribe to new appointments
        const channel = subscribeToDoctorAppointments(doctor.id, (row) => {
          setAppointments((prev) => [row, ...prev]);
        });
        return () => {
          try {
            channel.unsubscribe();
          } catch {}
        };
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.error("Error loading doctor appointments:", e?.message || e);
        toast({
          title: "Error",
          description: "Failed to load appointments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // removed legacy fetchAppointments

  const onUpdateStatus = async (
    appointmentId: string,
    newStatus: UIAppointment["status"]
  ) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId ? {...a, status: newStatus} : a
        )
      );
      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${newStatus}`,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "scheduled":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const formatTime = (t: string) => t.substring(0, 5);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">
          Loading appointments...
        </div>
      </div>
    );

  const uniquePatients = new Set(appointments.map((a) => a.patient_id));

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      className="space-y-8"
    >
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Patient Appointments
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and view all patient appointments
        </p>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-purple-600" /> Appointment Overview
            <Badge className="bg-purple-100 text-purple-800 ml-auto">
              {uniquePatients.size} Patients • {appointments.length}{" "}
              Appointments
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage patient appointments and update status
          </CardDescription>
        </CardHeader>
      </Card>

      {appointments.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="text-center py-12">
            <Calendar className="size-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Appointments Yet
            </h3>
            <p className="text-gray-500">
              Patient appointments will appear here once they book
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((a) => (
            <motion.div
              key={a.id}
              initial={{opacity: 0, x: -20}}
              animate={{opacity: 1, x: 0}}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="size-5 text-blue-600" />
                        {a.patient_name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Username: {a.username}
                        <span className="block">
                          Doctor: {a.doctor_name} ({a.specialization})
                        </span>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(a.status)}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="size-4" />
                        <span>{formatDate(a.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="size-4" />
                        <span>{formatTime(a.time)}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Reason for Visit
                      </h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {a.details}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {a.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => onUpdateStatus(a.id, "confirmed")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="size-4 mr-2" />
                        Confirm
                      </Button>
                    )}
                    {(a.status === "pending" || a.status === "confirmed") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(a.id, "completed")}
                        className="border-blue-200 hover:bg-blue-50"
                      >
                        Mark Complete
                      </Button>
                    )}
                    {a.status !== "cancelled" && a.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onUpdateStatus(a.id, "cancelled")}
                      >
                        <XCircle className="size-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DoctorAppointments;
