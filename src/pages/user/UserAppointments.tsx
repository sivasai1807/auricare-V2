import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { listUserAppointments, createAppointment, type Appointment } from '@/lib/supabase/appointments';
import { upsertPatient } from '@/lib/supabase/patients';

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
  const [doctors, setDoctors] = useState<{id: string; name: string; specialization: string; is_available?: boolean}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Load from localStorage first for quick display
      const savedAppointments = localStorage.getItem(`user_appointments_${user.id}`);
      if (savedAppointments) {
        try {
          setAppointments(JSON.parse(savedAppointments));
        } catch (e) {
          console.error("Error parsing saved appointments:", e);
        }
      }
      
      fetchAppointments();
      fetchDoctors();
    }
  }, [user]);

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select('id, name, specialization, is_available');

    if (!error && data) {
      // Filter available doctors (if is_available column exists, otherwise show all)
      const availableDoctors = data.filter(d => d.is_available !== false);
      setDoctors(availableDoctors);
    }
  };

  const fetchAppointments = async () => {
    if (!user) return;
    try {
      const userAppointments = await listUserAppointments(user.id);
      setAppointments(userAppointments);
      
      // Save to localStorage for persistence
      localStorage.setItem(`user_appointments_${user.id}`, JSON.stringify(userAppointments));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // Fallback to localStorage on error
      const savedAppointments = localStorage.getItem(`user_appointments_${user.id}`);
      if (savedAppointments) {
        try {
          setAppointments(JSON.parse(savedAppointments));
        } catch (e) {
          console.error("Error parsing saved appointments:", e);
        }
      }
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      if (!formData.doctorId) throw new Error('Select a doctor');

      // Upsert patient record
      const patientData = await upsertPatient({
        name: formData.patientName,
        email: undefined,
        phone: undefined,
      });

      if (!patientData) throw new Error('Failed to create patient record');

      // Create appointment using the appointments module
      await createAppointment({
        patient_id: patientData.id,
        doctor_id: formData.doctorId,
        date: formData.appointmentDate,
        time: formData.appointmentTime,
      });

      toast({ title: 'Appointment Booked!', description: 'Your appointment has been scheduled.' });

      setFormData({ patientName: '', username: '', appointmentDate: '', appointmentTime: '', details: '', doctorId: '' });
      fetchAppointments();

    } catch (err: any) {
      console.error("Error booking appointment:", err);
      toast({ title: 'Error', description: err.message || 'Failed to book appointment', variant: 'destructive' });
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

  // Subscribe to real-time appointment updates
  useEffect(() => {
    if (!user) return;

    // Get patient IDs for this user to filter appointments
    const setupSubscription = async () => {
      try {
        const {data: patientData} = await supabase
          .from("patients")
          .select("id")
          .eq("user_id", user.id);

        if (!patientData || patientData.length === 0) return;

        const patientIds = patientData.map(p => p.id);

        // Subscribe to appointments for all patients
        const channel = supabase
          .channel(`appointments-user-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "appointments",
            },
            (payload) => {
              // Check if this appointment belongs to one of our patients
              if (payload.new && patientIds.includes(payload.new.patient_id)) {
                console.log("Appointment update received:", payload);
                // Refetch appointments to get latest status
                fetchAppointments();
              }
            }
          )
          .subscribe();

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error("Error setting up subscription:", error);
      }
    };

    const cleanup = setupSubscription();
    return () => {
      cleanup.then(unsub => unsub && unsub());
    };
  }, [user]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    // Handle both date format (YYYY-MM-DD) and datetime format
    const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    // Handle both time format (HH:MM:SS) and datetime format
    if (dateString.includes('T')) {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Assume it's a time string (HH:MM:SS)
      const [hours, minutes] = dateString.split(':');
      return `${hours}:${minutes}`;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          My Appointments
        </h1>
        <p className="text-gray-600 mt-2">
          Book new appointments and view your scheduled appointments
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>New Appointment</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Patient Name" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} required />
            <Input placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />

            <Select value={formData.doctorId} onValueChange={v => setFormData({...formData, doctorId: v})}>
              <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
              <SelectContent>
                {doctors.length === 0 ? (
                  <SelectItem value="" disabled>No available doctors</SelectItem>
                ) : (
                  doctors.map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} - {d.specialization} {d.is_available === false ? "(Unavailable)" : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Input type="date" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} required />
            <Input type="time" value={formData.appointmentTime} onChange={e => setFormData({...formData, appointmentTime: e.target.value})} required />
            <Textarea placeholder="Details" value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} required />
            <Button type="submit" disabled={loading}>{loading ? 'Booking...' : 'Book Appointment'}</Button>
          </form>
        </CardContent>
      </Card>

      {/* Booked Appointments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Booked Appointments
          </CardTitle>
          <CardDescription>
            View the status of appointments you've booked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="size-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Appointments Booked
              </h3>
              <p className="text-gray-500">
                Book an appointment using the form above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="size-5 text-blue-600" />
                          {appointment.patient_name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {appointment.username && (
                            <span className="block">Username: {appointment.username}</span>
                          )}
                          {appointment.doctor_name && (
                            <span className="block">
                              Doctor: {appointment.doctor_name}
                              {appointment.specialization && ` - ${appointment.specialization}`}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status === "confirmed" ? "Accepted" : 
                         appointment.status === "scheduled" ? "Scheduled" :
                         appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="size-4" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="size-4" />
                          <span>{formatTime(appointment.time)}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Appointment Details
                        </h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {appointment.reason || "No details provided"}
                        </p>
                        {/* Status feedback */}
                        <div className="flex items-center gap-2 mt-2">
                          {appointment.status === "confirmed" && (
                            <div className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle className="size-4" />
                              <span>Doctor has accepted this appointment</span>
                            </div>
                          )}
                          {appointment.status === "completed" && (
                            <div className="flex items-center gap-1 text-blue-600 text-sm">
                              <CheckCircle className="size-4" />
                              <span>Appointment completed</span>
                            </div>
                          )}
                          {appointment.status === "cancelled" && (
                            <div className="flex items-center gap-1 text-red-600 text-sm">
                              <XCircle className="size-4" />
                              <span>Appointment cancelled</span>
                            </div>
                          )}
                          {(appointment.status === "pending" || appointment.status === "scheduled") && (
                            <div className="flex items-center gap-1 text-yellow-600 text-sm">
                              <AlertCircle className="size-4" />
                              <span>Waiting for doctor's response</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserAppointments;
