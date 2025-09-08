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
