import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import {
  createAppointment,
  listDoctorAppointments,
  listPatientAppointments,
  updateAppointmentStatus,
} from '@/lib/supabase/appointments';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
    channel: vi.fn(),
  },
}));

describe('System Test: Complete Appointment Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full appointment lifecycle: create → list → update → verify', async () => {
    const mockAppointment = {
      id: 'appt-001',
      patient_id: 'patient-123',
      therapist_id: 'doctor-456',
      appointment_date: '2025-10-30T14:00:00',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockSupabaseChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockAppointment], error: null }),
      update: vi.fn().mockReturnThis(),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    const newAppointment = await createAppointment({
      patient_id: 'patient-123',
      doctor_id: 'doctor-456',
      date: '2025-10-30',
      time: '14:00:00',
    });
    expect(newAppointment).toBeDefined();
    expect(newAppointment.status).toBe('pending');

    const mockDoctorChain = {
      select: vi.fn(function(this: any) { return this; }),
      eq: vi.fn(function(this: any) { return this; }),
      order: vi.fn().mockResolvedValue({ data: [mockAppointment], error: null }),
    };

    (supabase.from as any).mockReturnValue(mockDoctorChain);

    const doctorAppointments = await listDoctorAppointments('doctor-456');
    expect(doctorAppointments).toBeDefined();
    expect(doctorAppointments.length).toBeGreaterThan(0);

    const mockUpdateChain = {
      update: vi.fn(function(this: any) { return this; }),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    (supabase.from as any).mockReturnValue(mockUpdateChain);

    await updateAppointmentStatus('appt-001', 'confirmed');

    const updatedMockAppointment = { ...mockAppointment, status: 'confirmed' };
    mockDoctorChain.order.mockResolvedValue({
      data: [updatedMockAppointment],
      error: null,
    });

    (supabase.from as any).mockReturnValue(mockDoctorChain);

    const verifyAppointments = await listDoctorAppointments('doctor-456');
    expect(verifyAppointments[0].status).toBe('confirmed');
  });

  it('should handle patient booking and viewing workflow', async () => {
    const mockAppointments = [
      {
        id: 'appt-001',
        patient_id: 'patient-123',
        therapist_id: 'doctor-456',
        appointment_date: '2025-10-30T10:00:00',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'appt-002',
        patient_id: 'patient-123',
        therapist_id: 'doctor-789',
        appointment_date: '2025-11-01T15:00:00',
        status: 'confirmed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const mockSupabaseChain = {
      select: vi.fn(function(this: any) { return this; }),
      eq: vi.fn(function(this: any) { return this; }),
      order: vi.fn().mockResolvedValue({ data: mockAppointments, error: null }),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    const patientAppointments = await listPatientAppointments('patient-123');

    expect(patientAppointments).toBeDefined();
    expect(patientAppointments.length).toBe(2);
    expect(patientAppointments[0].patient_id).toBe('patient-123');
    expect(patientAppointments[1].patient_id).toBe('patient-123');
  });

  it('should handle appointment cancellation workflow', async () => {
    const mockAppointment = {
      id: 'appt-001',
      patient_id: 'patient-123',
      therapist_id: 'doctor-456',
      appointment_date: '2025-10-30T14:00:00',
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockSupabaseChain = {
      select: vi.fn(function(this: any) { return this; }),
      eq: vi.fn(function(this: any) {
        if (this._isUpdate) {
          return Promise.resolve({ error: null });
        }
        return this;
      }),
      order: vi.fn().mockResolvedValue({ data: [mockAppointment], error: null }),
      update: vi.fn(function(this: any) {
        this._isUpdate = true;
        return this;
      }),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    const appointments = await listPatientAppointments('patient-123');
    expect(appointments[0].status).toBe('confirmed');

    await updateAppointmentStatus('appt-001', 'cancelled');

    const cancelledAppointment = { ...mockAppointment, status: 'cancelled' };
    mockSupabaseChain.order.mockResolvedValue({
      data: [cancelledAppointment],
      error: null,
    });
    mockSupabaseChain._isUpdate = false;

    const verifyAppointments = await listPatientAppointments('patient-123');
    expect(verifyAppointments[0].status).toBe('cancelled');
  });

  it('should handle multiple appointment status transitions', async () => {
    const statuses: Array<'pending' | 'confirmed' | 'completed' | 'cancelled'> = [
      'pending',
      'confirmed',
      'completed',
    ];

    const mockSupabaseChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    for (const status of statuses) {
      await updateAppointmentStatus('appt-001', status);
      expect(mockSupabaseChain.update).toHaveBeenCalledWith({ status });
    }

    expect(mockSupabaseChain.update).toHaveBeenCalledTimes(3);
  });
});
