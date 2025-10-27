import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createAppointment,
  listDoctorAppointments,
  listPatientAppointments,
  updateAppointmentStatus
} from './appointments';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
  },
}));

describe('Appointment Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAppointment', () => {
    it('should create an appointment successfully', async () => {
      const mockAppointment = {
        id: '1',
        patient_id: 'patient-123',
        therapist_id: 'doctor-456',
        appointment_date: '2025-10-28T10:00:00',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockSupabaseChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockSupabaseChain);

      const result = await createAppointment({
        patient_id: 'patient-123',
        doctor_id: 'doctor-456',
        date: '2025-10-28',
        time: '10:00:00',
      });

      expect(result).toBeDefined();
      expect(result.patient_id).toBe('patient-123');
      expect(result.doctor_id).toBe('doctor-456');
    });

    it('should handle creation errors', async () => {
      const mockSupabaseChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Creation failed')
        }),
      };

      (supabase.from as any).mockReturnValue(mockSupabaseChain);

      await expect(
        createAppointment({
          patient_id: 'patient-123',
          doctor_id: 'doctor-456',
          date: '2025-10-28',
          time: '10:00:00',
        })
      ).rejects.toThrow();
    });
  });

  describe('listDoctorAppointments', () => {
    it('should list doctor appointments successfully', async () => {
      const mockAppointments = [
        {
          id: '1',
          patient_id: 'patient-123',
          therapist_id: 'doctor-456',
          status: 'pending',
          appointment_date: '2025-10-28T10:00:00',
          appointment_day: '2025-10-28',
          appointment_time: '10:00:00',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockSupabaseChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockAppointments, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockSupabaseChain);

      const result = await listDoctorAppointments('doctor-456');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('therapist_id', 'doctor-456');
    });

    it('should return empty array when no appointments found', async () => {
      const mockSupabaseChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      (supabase.from as any).mockReturnValue(mockSupabaseChain);

      const result = await listDoctorAppointments('doctor-456');

      expect(result).toEqual([]);
    });
  });

  describe('listPatientAppointments', () => {
    it('should list patient appointments successfully', async () => {
      const mockAppointments = [
        {
          id: '1',
          patient_id: 'patient-123',
          therapist_id: 'doctor-456',
          status: 'confirmed',
          appointment_date: '2025-10-28T10:00:00',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockSupabaseChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockAppointments, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockSupabaseChain);

      const result = await listPatientAppointments('patient-123');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('patient_id', 'patient-123');
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should update appointment status successfully', async () => {
      const mockSupabaseChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      (supabase.from as any).mockReturnValue(mockSupabaseChain);

      await updateAppointmentStatus('1', 'confirmed');

      expect(mockSupabaseChain.update).toHaveBeenCalledWith({ status: 'confirmed' });
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should handle update errors', async () => {
      const mockSupabaseChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: new Error('Update failed') }),
      };

      (supabase.from as any).mockReturnValue(mockSupabaseChain);

      await expect(updateAppointmentStatus('1', 'confirmed')).rejects.toThrow();
    });
  });
});
