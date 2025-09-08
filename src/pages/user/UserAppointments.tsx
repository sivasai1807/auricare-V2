import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus, User, Badge } from 'lucide-react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Appointment {
  id: string;
  patient_name: string;
  username: string;
  appointment_date: string;
  notes: string;
  status: string;
  created_at: string;
  doctor_name?: string;
}

const UserAppointments = () => {
  const { user } = useRoleAuth();
  const [formData, setFormData] = useState({
    patientName: '',
    username: '',
    appointmentDate: '',
    appointmentTime: '',
    details: '',
    doctorId: ''
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors] = useState([
    { id: 'doc1', doctor_id: 'DOC001', name: 'Dr. Sarah Johnson', specialization: 'Cardiology' },
    { id: 'doc2', doctor_id: 'DOC002', name: 'Dr. Michael Chen', specialization: 'Neurology' },
    { id: 'doc3', doctor_id: 'DOC003', name: 'Dr. Emily Rodriguez', specialization: 'Pediatrics' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
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
      
      const transformedData = (data || []).map(apt => ({
        id: apt.id,
        patient_name: apt.notes?.includes('Patient: ') 
          ? apt.notes.split('Patient: ')[1]?.split('\n')[0] || 'Unknown Patient'
          : 'Unknown Patient',
        username: apt.notes?.includes('Username: ')
          ? apt.notes.split('Username: ')[1]?.split('\n')[0] || 'unknown'
          : 'unknown',
        appointment_date: apt.appointment_date,
        notes: apt.notes || 'No details provided',
        status: apt.status || 'pending',
        created_at: apt.created_at,
        doctor_name: apt.notes?.includes('Doctor: ') 
          ? apt.notes.split('Doctor: ')[1]?.split('\n')[0] 
          : 'Healthcare Provider'
      }));
      
      setAppointments(transformedData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const combined = new Date(`${date}T${time}:00`);
      return combined.toISOString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return new Date().toISOString();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      if (!selectedDoctor) {
        throw new Error('Please select a doctor');
      }

      const appointmentDateTime = formatDateTime(formData.appointmentDate, formData.appointmentTime);
      
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert([{
          family_id: user.id,
          therapist_id: formData.doctorId,
          appointment_date: appointmentDateTime,
          duration_minutes: "01:00:00",
          status: 'scheduled',
          notes: `Patient: ${formData.patientName}
Username: ${formData.username}
Details: ${formData.details}
Doctor: ${selectedDoctor.name} (${selectedDoctor.specialization})`
        }])
        .select()
        .single();

      if (appointmentError) {
        throw new Error(`Failed to create appointment: ${appointmentError.message}`);
      }

      // Create or update patient record
      await supabase
        .from('patients')
        .upsert({
          user_id: user.id,
          patient_name: formData.patientName,
          username: formData.username,
          medical_history: formData.details
        });

      toast({
        title: 'Appointment Booked!',
        description: `Your appointment with ${selectedDoctor.name} has been scheduled successfully.`,
      });

      setFormData({
        patientName: '',
        username: '',
        appointmentDate: '',
        appointmentTime: '',
        details: '',
        doctorId: ''
      });
      
      fetchAppointments();

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to book appointment',
        variant: 'destructive',
      });
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Book Appointment
        </h1>
        <p className="text-gray-600 mt-2">Schedule your healthcare appointment</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-5 text-blue-600" />
              New Appointment
            </CardTitle>
            <CardDescription>
              Fill in your details to book an appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="bg-white/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="bg-white/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor">Select Doctor</Label>
                <Select value={formData.doctorId} onValueChange={(value) => setFormData({ ...formData, doctorId: value })}>
                  <SelectTrigger className="bg-white/50">
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center gap-2">
                          <User className="size-4" />
                          {doctor.name} - {doctor.specialization}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate">Appointment Date</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="bg-white/50"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Appointment Time</Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="bg-white/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Details / Reason for Visit</Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Please describe your symptoms or reason for the appointment..."
                  className="bg-white/50 min-h-[100px]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-green-600" />
              Your Appointments
            </CardTitle>
            <CardDescription>
              View your scheduled appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="size-12 mx-auto mb-4 opacity-50" />
                <p>No appointments scheduled</p>
                <p className="text-sm mt-2">Your booked appointments will appear here</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {appointments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-blue-800">{appointment.doctor_name}</h4>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">Patient: {appointment.patient_name}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(appointment.appointment_date).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default UserAppointments;