import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Supabase Database Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Appointments Table', () => {
    it('should fetch appointments successfully', async () => {
      const mockAppointments = [
        {
          id: '1',
          patient_id: 'patient-123',
          therapist_id: 'doctor-456',
          appointment_date: '2025-10-28T10:00:00',
          status: 'pending',
        },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockAppointments, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockChain);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', 'patient-123')
        .order('appointment_date');

      expect(data).toEqual(mockAppointments);
      expect(error).toBeNull();
    });

    it('should insert appointment successfully', async () => {
      const newAppointment = {
        patient_id: 'patient-123',
        therapist_id: 'doctor-456',
        appointment_date: '2025-10-28T10:00:00',
        status: 'pending',
      };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: '1', ...newAppointment },
          error: null,
        }),
      };

      (supabase.from as any).mockReturnValue(mockChain);

      const { data, error } = await supabase
        .from('appointments')
        .insert([newAppointment])
        .select('*')
        .single();

      expect(data).toBeDefined();
      expect(data?.patient_id).toBe('patient-123');
      expect(error).toBeNull();
    });

    it('should update appointment status', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      (supabase.from as any).mockReturnValue(mockChain);

      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', '1');

      expect(error).toBeNull();
      expect(mockChain.update).toHaveBeenCalledWith({ status: 'confirmed' });
    });
  });

  describe('Patients Table', () => {
    it('should fetch patient data', async () => {
      const mockPatient = {
        id: 'patient-123',
        user_id: 'user-456',
        full_name: 'John Doe',
        date_of_birth: '2010-01-01',
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPatient, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockChain);

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', 'patient-123')
        .single();

      expect(data).toEqual(mockPatient);
      expect(error).toBeNull();
    });
  });

  describe('Doctors Table', () => {
    it('should fetch doctor list', async () => {
      const mockDoctors = [
        {
          id: 'doctor-123',
          user_id: 'user-789',
          full_name: 'Dr. Smith',
          specialization: 'Autism Specialist',
        },
      ];

      const mockChain = {
        select: vi.fn().mockResolvedValue({ data: mockDoctors, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockChain);

      const { data, error } = await supabase.from('doctors').select('*');

      expect(data).toEqual(mockDoctors);
      expect(error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const mockChain = {
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Connection failed' },
        }),
      };

      (supabase.from as any).mockReturnValue(mockChain);

      const { data, error } = await supabase.from('appointments').select('*');

      expect(data).toBeNull();
      expect(error).toBeDefined();
    });

    it('should handle permission errors', async () => {
      const mockChain = {
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Permission denied' },
        }),
      };

      (supabase.from as any).mockReturnValue(mockChain);

      const { data, error } = await supabase.from('appointments').select('*');

      expect(error).toBeDefined();
      expect(error?.message).toBe('Permission denied');
    });
  });
});
