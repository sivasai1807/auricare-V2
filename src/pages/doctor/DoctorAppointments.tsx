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

  // Helper: Validate UUID
  const isValidUUID = (value: string) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1️⃣ Get doctor UUID if user.id is not the actual UUID
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id, name, specialization')
        .eq('doctor_id', user.username) // assuming user.username = 'doc1' or 'doc2'
        .single();

      if (doctorError) throw doctorError;
      const doctorUuid = doctorData?.id;
      if (!doctorUuid || !isValidUUID(doctorUuid)) throw new Error('Invalid doctor UUID');

      // 2️⃣ Fetch appointments for this doctor, including patient info
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!appointments_patient_id_fkey(id, patient_name, username)
        `)
        .eq('therapist_id', doctorUuid)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      const appointmentsWithPatients = (data || []).map((apt: any) => ({
        id: apt.id,
        patient_id: apt.patient_id,
        patient_name: apt.patients?.patient_name || 'Unknown',
        username: apt.patients?.username || 'unknown',
        details: apt.notes || '',
        appointment_date: apt.appointment_date,
        status: apt.status || 'scheduled',
        created_at: apt.created_at,
        doctor_name: doctorData?.name || 'Doctor',
        specialization: doctorData?.specialization || 'General Medicine'
      }));

      setAppointments(appointmentsWithPatients);

    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({ title: 'Error', description: 'Failed to fetch appointments', variant: 'destructive' });
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
        prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a)
      );

      toast({ title: 'Status Updated', description: `Appointment status changed to ${newStatus}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to update appointment status', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-gray-500">Loading appointments...</div>
    </div>
  );

  const uniquePatients = new Set(appointments.map(a => a.patient_id));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Patient Appointments</h1>
        <p className="text-gray-600 mt-2">Manage and view all patient appointments</p>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-purple-600" /> Appointment Overview
            <Badge className="bg-purple-100 text-purple-800 ml-auto">{uniquePatients.size} Patients • {appointments.length} Appointments</Badge>
          </CardTitle>
          <CardDescription>Manage patient appointments and update status</CardDescription>
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
          {appointments.map(a => (
            <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2"><User className="size-5 text-blue-600" />{a.patient_name}</CardTitle>
                      <CardDescription className="mt-1">
                        Username: {a.username}<span className="block">Doctor: {a.doctor_name} ({a.specialization})</span>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(a.status)}>{a.status.charAt(0).toUpperCase() + a.status.slice(1)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600"><Calendar className="size-4" /><span>{formatDate(a.appointment_date)}</span></div>
                      <div className="flex items-center gap-2 text-gray-600"><Clock className="size-4" /><span>{formatTime(a.appointment_date)}</span></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Reason for Visit</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{a.details}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {a.status === 'scheduled' && (
                      <Button size="sm" onClick={() => updateAppointmentStatus(a.id, 'confirmed')} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="size-4 mr-2" />Confirm
                      </Button>
                    )}
                    {(a.status === 'scheduled' || a.status === 'confirmed') && (
                      <Button size="sm" variant="outline" onClick={() => updateAppointmentStatus(a.id, 'completed')} className="border-blue-200 hover:bg-blue-50">
                        Mark Complete
                      </Button>
                    )}
                    {a.status !== 'cancelled' && a.status !== 'completed' && (
                      <Button size="sm" variant="destructive" onClick={() => updateAppointmentStatus(a.id, 'cancelled')}>
                        <XCircle className="size-4 mr-2" />Cancel
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
