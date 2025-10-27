import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentDoctor } from '@/lib/supabase/doctors';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('Integration Test: Doctor Profile Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should retrieve doctor profile by external doctor_id from localStorage', async () => {
    const mockDoctor = {
      id: 'uuid-doctor-456',
      doctor_id: 'DOC001',
      name: 'Dr. Smith',
      email: 'dr.smith@hospital.com',
      specialization: 'Autism Specialist',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(
      'doctor',
      JSON.stringify({
        user_metadata: { doctor_id: 'DOC001' },
      })
    );

    const mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: mockDoctor, error: null }),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    const doctor = await getCurrentDoctor();

    expect(doctor).toBeDefined();
    expect(doctor?.doctor_id).toBe('DOC001');
    expect(doctor?.name).toBe('Dr. Smith');
    expect(mockSupabaseChain.eq).toHaveBeenCalledWith('doctor_id', 'DOC001');
  });

  it('should retrieve doctor profile by email when localStorage fails', async () => {
    const mockUser = {
      user: {
        id: 'auth-user-123',
        email: 'dr.jones@hospital.com',
      },
    };

    const mockDoctor = {
      id: 'uuid-doctor-789',
      doctor_id: 'DOC002',
      name: 'Dr. Jones',
      email: 'dr.jones@hospital.com',
      specialization: 'Child Psychology',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (supabase.auth.getUser as any).mockResolvedValue({
      data: mockUser,
      error: null,
    });

    const mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: mockDoctor, error: null }),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    const doctor = await getCurrentDoctor();

    expect(doctor).toBeDefined();
    expect(doctor?.email).toBe('dr.jones@hospital.com');
    expect(doctor?.name).toBe('Dr. Jones');
    expect(mockSupabaseChain.eq).toHaveBeenCalledWith(
      'email',
      'dr.jones@hospital.com'
    );
  });

  it('should return null when no doctor profile found', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    const doctor = await getCurrentDoctor();

    expect(doctor).toBeNull();
  });

  it('should handle database errors gracefully', async () => {
    const mockUser = {
      user: {
        id: 'auth-user-123',
        email: 'dr.test@hospital.com',
      },
    };

    (supabase.auth.getUser as any).mockResolvedValue({
      data: mockUser,
      error: null,
    });

    const mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      }),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    const doctor = await getCurrentDoctor();

    expect(doctor).toBeNull();
  });

  it('should integrate with appointment listing for doctor workflow', async () => {
    const mockDoctor = {
      id: 'uuid-doctor-456',
      doctor_id: 'DOC001',
      name: 'Dr. Smith',
      email: 'dr.smith@hospital.com',
      specialization: 'Autism Specialist',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(
      'doctor',
      JSON.stringify({
        user_metadata: { doctor_id: 'DOC001' },
      })
    );

    const mockDoctorChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: mockDoctor, error: null }),
    };

    const mockAppointments = [
      {
        id: 'appt-001',
        patient_id: 'patient-123',
        therapist_id: 'uuid-doctor-456',
        appointment_date: '2025-10-30T10:00:00',
        status: 'pending',
      },
    ];

    const mockAppointmentChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockAppointments, error: null }),
    };

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'doctors') return mockDoctorChain;
      if (table === 'v_doctor_appointments') return mockAppointmentChain;
      return mockDoctorChain;
    });

    const doctor = await getCurrentDoctor();
    expect(doctor).toBeDefined();

    const appointments = await supabase
      .from('v_doctor_appointments')
      .select('*')
      .eq('therapist_id', doctor!.id)
      .order('appointment_date', { ascending: true });

    expect(appointments.data).toBeDefined();
    expect(appointments.data?.length).toBeGreaterThan(0);
  });
});
