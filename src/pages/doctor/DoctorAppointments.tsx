import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, CheckCircle, XCircle, Users } from 'lucide-react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

const DoctorAppointments = () => {
  const { user } = useRoleAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      // use let instead of const so we can reassign if fallback is needed
      let appointmentsData;
      let appointmentsError;

      // ✅ Try to fetch with the correct relationship (patients instead of profiles)
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!appointments_patient_id_fkey(first_name, last_name)
        `)
        .order('appointment_date', { ascending: true });

      appointmentsData = data;
      appointmentsError = error;

      if (appointmentsError) {
        console.error('Error fetching appointments (with join):', appointmentsError);

        // fallback: fetch without join
        const { data: basicAppointments, error: basicError } = await supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: true });

        if (basicError) throw basicError;
        appointmentsData = basicAppointments;
      }

      if (appointmentsData && appointmentsData.length > 0) {
        const appointmentsWithPatients = appointmentsData.map((apt: any) => {
          const notes = apt.notes || '';

          const patientName = apt.patients
            ? `${apt.patients.first_name} ${apt.patients.last_name || ''}`.trim()
            : notes.includes('Patient: ')
            ? notes.split('Patient: ')[1]?.split('\n')[0] || 'Unknown Patient'
            : 'Unknown Patient';

          const username = notes.includes('Username: ')
            ? notes.split('Username: ')[1]?.split('\n')[0] || 'unknown'
            : 'unknown';

          const details = notes.includes('Details: ')
            ? notes.split('Details: ')[1]?.split('\n')[0] || 'No details provided'
            : notes;

          const doctorName = notes.includes('Doctor: ')
            ? notes.split('Doctor: ')[1]?.split('\n')[0]
            : 'Healthcare Provider';

          return {
            id: apt.id,
            patient_id: apt.patient_id ?? apt.family_id ?? 'unknown',
            patient_name: patientName,
            username: username,
            details: details,
            appointment_date: apt.appointment_date,
            status: apt.status || 'scheduled',
            created_at: apt.created_at,
            doctor_name: doctorName,
          };
        });

        setAppointments(appointmentsWithPatients);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
        )
      );

      toast({
        title: 'Status Updated',
        description: `Appointment status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update appointment status',
        variant: 'destructive',
      });
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
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">Loading appointments...</div>
      </div>
    );
  }

  const uniquePatients = new Set(appointments.map(apt => apt.patient_id));
  const patientCount = uniquePatients.size;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Patient Appointments
        </h1>
        <p className="text-gray-600 mt-2">Manage and view all patient appointments</p>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-purple-600" />
            Appointment Overview
            <Badge className="bg-purple-100 text-purple-800 ml-auto">
              {patientCount} Patients • {appointments.length} Appointments
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
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Appointments Yet</h3>
            <p className="text-gray-500">Patient appointments will appear here once they book</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map(appointment => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="size-5 text-blue-600" />
                        {appointment.patient_name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Username: {appointment.username}
                        <span className="block">Doctor: {appointment.doctor_name}</span>
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
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Reason for Visit</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {appointment.details}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {appointment.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="size-4 mr-2" />
                        Confirm
                      </Button>
                    )}
                    {(appointment.status === 'scheduled' ||
                      appointment.status === 'confirmed') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        className="border-blue-200 hover:bg-blue-50"
                      >
                        Mark Complete
                      </Button>
                    )}
                    {appointment.status !== 'cancelled' &&
                      appointment.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            updateAppointmentStatus(appointment.id, 'cancelled')
                          }
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
