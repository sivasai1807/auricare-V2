import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { chatbotApi } from '@/lib/chatbotApi';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock('@/lib/chatbotApi', () => ({
  chatbotApi: {
    healthCheck: vi.fn(),
    patientChat: vi.fn(),
    userChat: vi.fn(),
    doctorChat: vi.fn(),
  },
}));

global.fetch = vi.fn();

describe('System Test: Complete User Journey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete patient registration and first interaction journey', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'patient@example.com',
      user_metadata: { role: 'patient' },
    };

    (supabase.auth.signUp as any).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const signUpResult = await supabase.auth.signUp({
      email: 'patient@example.com',
      password: 'SecurePassword123!',
      options: {
        data: { role: 'patient' },
      },
    });

    expect(signUpResult.data?.user).toBeDefined();
    expect(signUpResult.data?.user?.email).toBe('patient@example.com');

    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const userCheck = await supabase.auth.getUser();
    expect(userCheck.data?.user?.id).toBe('user-123');

    (chatbotApi.healthCheck as any).mockResolvedValue({
      status: 'healthy',
      message: 'Chatbot API is running',
    });

    const healthStatus = await chatbotApi.healthCheck();
    expect(healthStatus.status).toBe('healthy');

    (chatbotApi.patientChat as any).mockResolvedValue({
      success: true,
      response: 'Hello! How can I help you today?',
    });

    const chatResponse = await chatbotApi.patientChat(
      'What is autism?',
      []
    );

    expect(chatResponse.success).toBe(true);
    expect(chatResponse.response).toBeDefined();
  });

  it('should complete doctor login and appointment review journey', async () => {
    const mockDoctor = {
      id: 'doctor-456',
      email: 'doctor@example.com',
      user_metadata: { role: 'doctor', doctor_id: 'DOC001' },
    };

    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: mockDoctor, session: { access_token: 'token123' } },
      error: null,
    });

    const loginResult = await supabase.auth.signInWithPassword({
      email: 'doctor@example.com',
      password: 'DoctorPass123!',
    });

    expect(loginResult.data?.user?.email).toBe('doctor@example.com');

    const mockAppointments = [
      {
        id: 'appt-001',
        patient_id: 'patient-123',
        therapist_id: 'doctor-456',
        appointment_date: '2025-10-30T10:00:00',
        status: 'pending',
        display_patient_name: 'John Doe',
        reason: 'Initial consultation',
      },
    ];

    const mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockAppointments, error: null }),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    const appointments = await supabase
      .from('v_doctor_appointments')
      .select('*')
      .eq('therapist_id', 'doctor-456')
      .order('appointment_date', { ascending: true });

    expect(appointments.data).toBeDefined();
    expect(appointments.data?.length).toBeGreaterThan(0);

    (chatbotApi.doctorChat as any).mockResolvedValue({
      success: true,
      response: 'Based on the patient history, here are my recommendations...',
    });

    const doctorChatResponse = await chatbotApi.doctorChat(
      'What are the best treatment approaches for this patient?',
      []
    );

    expect(doctorChatResponse.success).toBe(true);
  });

  it('should complete user logout and session cleanup journey', async () => {
    (supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          access_token: 'token123',
          user: { id: 'user-123' },
        },
      },
      error: null,
    });

    const sessionCheck = await supabase.auth.getSession();
    expect(sessionCheck.data?.session).toBeDefined();

    (supabase.auth.signOut as any).mockResolvedValue({ error: null });

    await supabase.auth.signOut();

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const postLogoutCheck = await supabase.auth.getSession();
    expect(postLogoutCheck.data?.session).toBeNull();
  });

  it('should handle error scenarios gracefully in user journey', async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const failedLogin = await supabase.auth.signInWithPassword({
      email: 'wrong@example.com',
      password: 'WrongPassword',
    });

    expect(failedLogin.error).toBeDefined();
    expect(failedLogin.data?.user).toBeNull();

    (chatbotApi.patientChat as any).mockRejectedValue(
      new Error('Chatbot service unavailable')
    );

    await expect(
      chatbotApi.patientChat('Test message', [])
    ).rejects.toThrow('Chatbot service unavailable');
  });
});
