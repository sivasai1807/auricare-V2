
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";

// Random weekly data (mock progress)
const weeklyProgress = [
  { week: "Week 1", healthScore: 65, symptoms: 6 },
  { week: "Week 2", healthScore: 72, symptoms: 4 },
  { week: "Week 3", healthScore: 78, symptoms: 3 },
  { week: "Week 4", healthScore: 81, symptoms: 2 },
  { week: "Week 5", healthScore: 85, symptoms: 1 },
  { week: "Week 6", healthScore: 90, symptoms: 1 },
];

// Vital signs data
const vitalSigns = [
  { date: "Day 1", heartRate: 72, bloodPressure: 120 },
  { date: "Day 2", heartRate: 76, bloodPressure: 118 },
  { date: "Day 3", heartRate: 74, bloodPressure: 122 },
  { date: "Day 4", heartRate: 78, bloodPressure: 119 },
  { date: "Day 5", heartRate: 73, bloodPressure: 117 },
  { date: "Day 6", heartRate: 75, bloodPressure: 121 },
];

// Activity breakdown (for pie chart)
const activityData = [
  { name: "Exercise", value: 30 },
  { name: "Sleep", value: 40 },
  { name: "Work", value: 20 },
  { name: "Leisure", value: 10 },
];

const COLORS = ["#3b82f6", "#10b981", "#f43f5e", "#f59e0b"];

export default function PatientProgress() {
  return (
    <div className="p-6 grid gap-6 md:grid-cols-2">
      
      {/* Weekly Health Progress */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Weekly Health Progress</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your health score and symptom count over time
          </p>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="healthScore" stroke="#10b981" name="Health Score" />
              <Line type="monotone" dataKey="symptoms" stroke="#f43f5e" name="Symptoms" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vital Signs (Bar Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>❤️ Vital Signs</CardTitle>
          <p className="text-sm text-muted-foreground">
            Heart rate & blood pressure trends
          </p>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vitalSigns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="heartRate" fill="#f43f5e" name="Heart Rate" />
              <Bar dataKey="bloodPressure" fill="#3b82f6" name="Blood Pressure" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sleep & Energy (Area Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>🌙 Sleep & Energy Levels</CardTitle>
          <p className="text-sm text-muted-foreground">
            Quality of rest and energy across the week
          </p>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="healthScore" stroke="#3b82f6" fill="#3b82f6" name="Sleep Quality" />
              <Area type="monotone" dataKey="symptoms" stroke="#f59e0b" fill="#f59e0b" name="Energy Level" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity Breakdown (Pie Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Activity Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribution of daily activities
          </p>
        </CardHeader>
        <CardContent className="h-64 flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, Heart, Calendar } from 'lucide-react';

import { useState, useEffect } from 'react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { supabase } from '@/integrations/supabase/client';

const PatientProgress = () => {
  const { user } = useRoleAuth();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [user]);

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      // Fetch patient progress
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patient) {
        const { data: progress, error: progressError } = await supabase
          .from('patient_progress')
          .select('*')
          .eq('patient_id', patient.id)
          .order('week_number', { ascending: true });

        if (progressError) throw progressError;

        const { data: metrics, error: metricsError } = await supabase
          .from('health_metrics')
          .select('*')
          .eq('patient_id', patient.id)
          .order('recorded_date', { ascending: true });

        if (metricsError) throw metricsError;

        setProgressData(progress || weeklyData);
        setHealthMetrics(metrics || vitalSigns);
      } else {
        setProgressData(weeklyData);
        setHealthMetrics(vitalSigns);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setProgressData(weeklyData);
      setHealthMetrics(vitalSigns);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const weeklyData = [
    { week: 'Week 1', healthScore: 75, symptoms: 3 },
    { week: 'Week 2', healthScore: 78, symptoms: 2 },
    { week: 'Week 3', healthScore: 82, symptoms: 2 },
    { week: 'Week 4', healthScore: 85, symptoms: 1 },
    { week: 'Week 5', healthScore: 88, symptoms: 1 },
    { week: 'Week 6', healthScore: 90, symptoms: 0 },
  ];

  const vitalSigns = [
    { date: '2024-01-01', heartRate: 72, bloodPressure: 120 },
    { date: '2024-01-08', heartRate: 75, bloodPressure: 118 },
    { date: '2024-01-15', heartRate: 70, bloodPressure: 115 },
    { date: '2024-01-22', heartRate: 68, bloodPressure: 112 },
    { date: '2024-01-29', heartRate: 70, bloodPressure: 110 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Progress Tracker
        </h1>
        <p className="text-gray-600 mt-2">Monitor your health journey with detailed reports</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="size-5" />
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">90%</div>
              <p className="text-sm text-gray-600">+5% from last week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Activity className="size-5" />
                Active Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">6/7</div>
              <p className="text-sm text-gray-600">This week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Heart className="size-5" />
                Avg Heart Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">70 BPM</div>
              <p className="text-sm text-gray-600">Normal range</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-green-600" />
              Weekly Health Progress
            </CardTitle>
            <CardDescription>
              Track your health score and symptom count over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData.length > 0 ? progressData : weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="health_score" 
                    stroke="#16a34a" 
                    strokeWidth={3}
                    name="Health Score"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="symptom_count" 
                    stroke="#dc2626" 
                    strokeWidth={3}
                    name="Symptom Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="size-5 text-red-600" />
              Vital Signs Tracking
            </CardTitle>
            <CardDescription>
              Monitor your heart rate and blood pressure trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthMetrics.length > 0 ? healthMetrics : vitalSigns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="recorded_date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" name="Health Metric" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-orange-600" />
              Recent Health Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-green-800">Excellent Progress</h4>
                    <p className="text-sm text-green-700">Health score improved significantly this week</p>
                  </div>
                  <span className="text-xs text-green-600">2 days ago</span>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-blue-800">Medication Reminder</h4>
                    <p className="text-sm text-blue-700">Continue current medication as prescribed</p>
                  </div>
                  <span className="text-xs text-blue-600">5 days ago</span>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-yellow-800">Follow-up Scheduled</h4>
                    <p className="text-sm text-yellow-700">Next appointment scheduled for next week</p>
                  </div>
                  <span className="text-xs text-yellow-600">1 week ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PatientProgress;
