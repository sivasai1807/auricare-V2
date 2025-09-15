import {useState, useEffect} from "react";
import {motion} from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
  Users,
  Calendar,
  TrendingUp,
  MessageSquare,
  Stethoscope,
  Clock,
  Activity,
} from "lucide-react";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useRoleAuth} from "@/hooks/useRoleAuth";
import {supabase} from "@/integrations/supabase/client";
import {getCurrentDoctor} from "@/lib/supabase/doctors";

const DoctorDashboard = () => {
  const {user} = useRoleAuth();
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const doctor = await getCurrentDoctor();
      if (!doctor) {
        setAppointmentCount(0);
        setPatientCount(0);
        return;
      }

      // Start/end of today in local time => ISO for timestampz comparison
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      // Fetch only this doctor's appointments
      const {data: apptsAll, error: apptsErr} = await supabase
        .from("appointments")
        .select("id, patient_id, therapist_id, appointment_date")
        .eq("therapist_id", doctor.id);
      if (apptsErr) throw apptsErr;

      // Today's appointments for this doctor
      const {data: apptsToday, error: todayErr} = await supabase
        .from("appointments")
        .select("id")
        .eq("therapist_id", doctor.id)
        .gte("appointment_date", start.toISOString())
        .lte("appointment_date", end.toISOString());
      if (todayErr) throw todayErr;

      // Count distinct patients the doctor has appointments with
      const uniquePatients = new Set(
        (apptsAll || []).map((a) => a.patient_id).filter(Boolean)
      );

      setAppointmentCount((apptsAll || []).length);
      setPatientCount(uniquePatients.size);

      // Update the card "Today's Schedule" number by state if needed later
      // (kept static UI but can use apptsToday.length)
      const todayCount = (apptsToday || []).length;
      // Optional: could store in state if you want to render dynamically
      (window as any).__doctor_today_appt_count = todayCount; // harmless no-op for now
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {staggerChildren: 0.1},
    },
  };

  const itemVariants = {
    hidden: {y: 20, opacity: 0},
    visible: {
      y: 0,
      opacity: 1,
      transition: {type: "spring", stiffness: 100},
    },
  };

  const {t} = useTranslation();
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {t("headings.doctorWelcome", {
            name: user?.user_metadata?.name?.split(" ")[1] || "Doctor",
          })}
        </h1>
        <p className="text-gray-600 mt-2">{t("headings.doctorSubtitle")}</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Users className="size-5" />
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {loading ? "..." : patientCount}
              </div>
              <p className="text-sm text-gray-600">Registered patients</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Calendar className="size-5" />
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {loading ? "..." : appointmentCount}
              </div>
              <p className="text-sm text-gray-600">Total bookings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Clock className="size-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">5</div>
              <p className="text-sm text-gray-600">Appointments today</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Activity className="size-5" />
                Active Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">12</div>
              <p className="text-sm text-gray-600">Under treatment</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Calendar className="size-5" />
                Manage Appointments
              </CardTitle>
              <CardDescription>
                View and manage patient appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/doctor/appointments">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  View Appointments
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <MessageSquare className="size-5" />
                AI Assistant
              </CardTitle>
              <CardDescription>
                Get AI-powered insights and support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/doctor/chatbot">
                <Button
                  variant="outline"
                  className="w-full border-indigo-200 hover:bg-indigo-50"
                >
                  Open Assistant
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="size-5 text-blue-600" />
                <div>
                  <p className="font-medium">New appointment booked</p>
                  <p className="text-sm text-gray-600">
                    Patient scheduled for tomorrow at 2:00 PM
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="size-5 text-green-600" />
                <div>
                  <p className="font-medium">Patient progress updated</p>
                  <p className="text-sm text-gray-600">
                    Health score improved for 3 patients this week
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DoctorDashboard;
