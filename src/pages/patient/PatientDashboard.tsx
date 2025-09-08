import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Calendar, MessageSquare, TrendingUp, Heart, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';

const PatientDashboard = () => {
  const { user } = useRoleAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
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
        <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Welcome, {user?.user_metadata?.first_name || 'Patient'}!
        </h1>
        <p className="text-gray-600 mt-2">Track your health progress and manage your care</p>
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
                My Appointments
              </CardTitle>
              <CardDescription>
                View your scheduled appointments and history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/patient/appointments">
                <Button variant="outline" className="w-full border-blue-200 hover:bg-blue-50">
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
                AI Health Assistant
              </CardTitle>
              <CardDescription>
                Get personalized health guidance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/patient/chatbot">
                <Button variant="glow" className="w-full">
                  Chat Now
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
                Health Metrics
              </CardTitle>
              <CardDescription>
                Monitor your vital signs and health data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-orange-200 hover:bg-orange-50">
                View Metrics
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Reports & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <FileText className="size-12 mx-auto mb-4 opacity-50" />
              <p>No recent reports</p>
              <p className="text-sm mt-2">Your health reports and progress updates will appear here</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PatientDashboard;