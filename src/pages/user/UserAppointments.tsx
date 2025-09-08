import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, User, Badge, Calendar, Clock } from 'lucide-react';
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
  const [doctors, setDoctors] = useState<{id: string; name: string; specialization: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchDoctors();
    }
  }, [user]);

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select('id, name, specialization');

    if (!error && data) setDoctors(data);
  };

  const fetchAppointments = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('family_id', user.id)
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setAppointments((data || []).map(a => ({
      id: a.id,
      patient_name: a.notes?.match(/Patient: (.+)/)?.[1] || 'Unknown',
      username: a.notes?.match(/Username: (.+)/)?.[1] || 'unknown',
      appointment_date: a.appointment_date,
      notes: a.notes,
      status: a.status,
      created_at: a.created_at,
      doctor_name: a.notes?.match(/Doctor: (.+)/)?.[1] || 'Healthcare Provider',
    })));
  };

  const formatDateTime = (date: string, time: string) => new Date(`${date}T${time}:00`).toISOString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      if (!formData.doctorId) throw new Error('Select a doctor');

      const appointmentDateTime = formatDateTime(formData.appointmentDate, formData.appointmentTime);

      // Upsert patient record
      const { data: patientData } = await supabase
        .from('patients')
        .upsert({
          user_id: user.id,
          patient_name: formData.patientName,
          username: formData.username,
          medical_history: formData.details
        }, { onConflict: 'user_id' })
        .select()
        .single();

      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert([{
          family_id: user.id,
          therapist_id: formData.doctorId, // ✅ Use real UUID from doctors table
          appointment_date: appointmentDateTime,
          duration_minutes: 60,
          status: 'scheduled',
          patient_id: patientData?.id,
          notes: `Patient: ${formData.patientName}
Username: ${formData.username}
Details: ${formData.details}
Doctor: ${doctors.find(d => d.id === formData.doctorId)?.name} (${doctors.find(d => d.id === formData.doctorId)?.specialization})`
        }])
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      toast({ title: 'Appointment Booked!', description: 'Your appointment has been scheduled.' });

      setFormData({ patientName: '', username: '', appointmentDate: '', appointmentTime: '', details: '', doctorId: '' });
      fetchAppointments();

    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': case 'scheduled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader><CardTitle>New Appointment</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Patient Name" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} required />
            <Input placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />

            <Select value={formData.doctorId} onValueChange={v => setFormData({...formData, doctorId: v})}>
              <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
              <SelectContent>
                {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} - {d.specialization}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input type="date" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} required />
            <Input type="time" value={formData.appointmentTime} onChange={e => setFormData({...formData, appointmentTime: e.target.value})} required />
            <Textarea placeholder="Details" value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} required />
            <Button type="submit" disabled={loading}>{loading ? 'Booking...' : 'Book Appointment'}</Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserAppointments;
