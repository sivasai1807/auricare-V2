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
import {Progress} from "@/components/ui/progress";
import {
  Activity,
  Calendar,
  MessageSquare,
  TrendingUp,
  Heart,
  FileText,
} from "lucide-react";
import {Link} from "react-router-dom";
import {useRoleAuth} from "@/hooks/useRoleAuth";
import {supabase} from "@/integrations/supabase/client";
import {useTranslation} from "react-i18next";

interface PatientProgress {
  id: string;
  week_number: number;
  health_score: number;
  symptom_count: number;
  notes: string;
  recorded_date: string;
}

const PatientDashboard = () => {
  const {user} = useRoleAuth();
  const [progress, setProgress] = useState<PatientProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const {t} = useTranslation();

  useEffect(() => {
    if (user) {
      fetchPatientProgress();
    }
  }, [user]);

  const fetchPatientProgress = async () => {
    if (!user) return;

    try {
      const {data: patientData, error: patientError} = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle(); // ✅ will return null instead of throwing error

      if (patientError || !patientData) {
        const sampleProgress: PatientProgress[] = [
          {
            id: "1",
            week_number: 1,
            health_score: 75,
            symptom_count: 3,
            notes: "Initial assessment completed",
            recorded_date: new Date().toISOString().split("T")[0],
          },
          {
            id: "2",
            week_number: 2,
            health_score: 82,
            symptom_count: 2,
            notes: "Improvement in overall health",
            recorded_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
          },
        ];
        setProgress(sampleProgress);
        setLoading(false);
        return;
      }

      const {data: progressData, error: progressError} = await supabase
        .from("patient_progress")
        .select("*")
        .eq("patient_id", patientData.id)
        .order("week_number", {ascending: false})
        .limit(5);

      if (progressError) throw progressError;

      setProgress(progressData || []);
    } catch (error) {
      console.error("Error fetching patient progress:", error);
      setProgress([]);
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

  const latestProgress = progress[0];
  const averageHealthScore =
    progress.length > 0
      ? Math.round(
          progress.reduce((sum, p) => sum + p.health_score, 0) / progress.length
        )
      : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          {t("headings.patientWelcome", {
            name: user?.user_metadata?.first_name || "Patient",
          })}
        </h1>
        <p className="text-gray-600 mt-2">{t("headings.patientSubtitle")}</p>
      </motion.div>

      {/* Health Progress Overview */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-green-600" />
              {t("patient.healthOverview")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                {t("common.loadingProgress")}
              </div>
            ) : progress.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">
                    {t("patient.currentHealthScore")}
                  </h4>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={latestProgress?.health_score || 0}
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold text-green-600">
                      {latestProgress?.health_score || 0}%
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    {t("patient.averageHealthScore")}
                  </h4>
                  <div className="flex items-center gap-3">
                    <Progress value={averageHealthScore} className="flex-1" />
                    <span className="text-2xl font-bold text-blue-600">
                      {averageHealthScore}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="size-12 mx-auto mb-4 opacity-50" />
                <p>{t("patient.noProgress")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Cards */}
      <motion.div
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <MessageSquare className="size-5" />
                {t("nav.aiAssistant")}
              </CardTitle>
              <CardDescription>
                {t("patient.personalizedGuidance")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/patient/chatbot">
                <Button variant="glow" className="w-full">
                  {t("common.chatNow")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Calendar className="size-5" />
                {t("nav.appointments")}
              </CardTitle>
              <CardDescription>
                {t("patient.viewAppointmentsDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/patient/appointments">
                <Button
                  variant="outline"
                  className="w-full border-blue-200 hover:bg-blue-50"
                >
                  {t("patient.viewAppointments")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Activity className="size-5" />
                {t("patient.healthMetrics")}
              </CardTitle>
              <CardDescription>{t("patient.monitorVitals")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-orange-200 hover:bg-orange-50"
              >
                {t("patient.viewMetrics")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Progress */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-green-600" />
              {t("patient.recentProgress")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                {t("common.loadingRecent")}
              </div>
            ) : progress.length > 0 ? (
              <div className="space-y-4">
                {progress.slice(0, 3).map((progressItem) => (
                  <div
                    key={progressItem.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {t("patient.weekX", {week: progressItem.week_number})}
                      </p>
                      <p className="text-sm text-gray-600">
                        {progressItem.notes}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          progressItem.recorded_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {progressItem.health_score}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("patient.symptomCount", {
                          count: progressItem.symptom_count,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="size-12 mx-auto mb-4 opacity-50" />
                <p>{t("patient.noRecentProgress")}</p>
                <p className="text-sm mt-2">
                  {t("patient.recentProgressHint")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Reports & Notifications */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-gray-600" />
              {t("patient.reportsNotifications")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <FileText className="size-12 mx-auto mb-4 opacity-50" />
              <p>{t("patient.noRecentReports")}</p>
              <p className="text-sm mt-2">{t("patient.reportsHint")}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PatientDashboard;
