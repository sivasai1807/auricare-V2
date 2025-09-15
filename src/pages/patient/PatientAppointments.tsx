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
import {Calendar, Clock, User, MapPin, Stethoscope} from "lucide-react";
import {useRoleAuth} from "@/hooks/useRoleAuth";
import {getCurrentPatient} from "@/lib/supabase/patients";
import {
  listPatientAppointments,
  type Appointment,
} from "@/lib/supabase/appointments";

interface UIAppointment extends Appointment {
  doctor_name?: string;
  specialization?: string;
}

const PatientAppointments = () => {
  const {user} = useRoleAuth();
  const [appointments, setAppointments] = useState<UIAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const patient = await getCurrentPatient();
        if (!patient) throw new Error("Patient profile not found");
        const data = await listPatientAppointments(patient.id);
        setAppointments(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error fetching appointments:", e);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // removed legacy fetchAppointments

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

  const formatDate = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => time.substring(0, 5);

  const containerVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {y: 20, opacity: 0},
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">
          Loading appointments...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          My Appointments
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage your scheduled appointments
        </p>
      </motion.div>

      {appointments.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="text-center py-12">
              <Calendar className="size-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Appointments Scheduled
              </h3>
              <p className="text-gray-500">
                Your upcoming appointments will appear here
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-4">
          {appointments.map((appointment) => (
            <motion.div key={appointment.id} variants={itemVariants}>
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="size-5 text-blue-600" />
                        {"Healthcare Appointment"}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Status:{" "}
                        {appointment.status === "confirmed"
                          ? "scheduled"
                          : appointment.status}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status === "confirmed"
                        ? "Scheduled"
                        : appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="size-4" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="size-4" />
                        <span>{formatTime(appointment.time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="size-4" />
                        <span>Healthcare Center</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Appointment Details
                      </h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        Booked
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PatientAppointments;
