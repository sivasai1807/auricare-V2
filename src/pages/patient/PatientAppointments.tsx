import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin, Stethoscope } from 'lucide-react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { supabase } from '@/integrations/supabase/client';

interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  username: string;
  details: string;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'scheduled';
  created_at: string;
  doctor_name?: string;
  specialization?: string;
}

const PatientAppointments = () => {
  const { user } = useRoleAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('family_id', user.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      
      // Transform data to match interface
      const transformedData = (data || []).map(apt => {
        const notes = apt.notes || '';
        const patientName = notes.includes('Patient: ') 
          ? notes.split('Patient: ')[1]?.split('\n')[0] || user?.user_metadata?.first_name + ' ' + user?.user_metadata?.last_name
          : user?.user_metadata?.first_name + ' ' + user?.user_metadata?.last_name || 'Patient';
        const username = notes.includes('Username: ')
          ? notes.split('Username: ')[1]?.split('\n')[0] || user?.user_metadata?.username
          : user?.user_metadata?.username || 'user';
        const details = notes.includes('Details: ')
          ? notes.split('Details: ')[1]?.split('\n')[0] || 'No details provided'
          : notes || 'No details provided';
        const doctorName = notes.includes('Doctor: ') 
          ? notes.split('Doctor: ')[1]?.split('\n')[0] || 'Healthcare Provider'
          : 'Healthcare Provider';
        const specialization = doctorName.includes('(') 
          ? doctorName.split('(')[1]?.replace(')', '') || 'General Medicine'
          : 'General Medicine';

        return {
          id: apt.id,
          patient_id: apt.family_id,
          patient_name: patientName,
          username: username,
          details: details,
          appointment_date: apt.appointment_date,
          status: apt.status || 'scheduled',
          created_at: apt.created_at,
          doctor_name: doctorName.split('(')[0]?.trim() || 'Healthcare Provider',
          specialization: specialization
        };
      });
      
      setAppointments(transformedData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">Loading appointments...</div>
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
        <p className="text-gray-600 mt-2">View and manage your scheduled appointments</p>
      </motion.div>

      {appointments.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="text-center py-12">
              <Calendar className="size-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Appointments Scheduled</h3>
              <p className="text-gray-500">Your upcoming appointments will appear here</p>
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
                        {appointment.doctor_name ? `Appointment with ${appointment.doctor_name}` : 'Healthcare Appointment'}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Patient: {appointment.patient_name}
                        {appointment.specialization && (
                          <span className="block">Specialization: {appointment.specialization}</span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="size-4" />
                        <span>{formatDate(appointment.appointment_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="size-4" />
                        <span>{formatTime(appointment.appointment_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="size-4" />
                        <span>Healthcare Center</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Appointment Details</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {appointment.details}
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