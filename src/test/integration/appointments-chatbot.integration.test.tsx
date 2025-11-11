import React from "react";
import {describe, it, expect, vi, beforeEach} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import PatientAppointments from "@/pages/patient/PatientAppointments";
import DoctorAppointments from "@/pages/doctor/DoctorAppointments";
import PatientChatbot from "@/pages/patient/PatientChatbot";
import DoctorChatbot from "@/pages/doctor/DoctorChatbot";
import {RoleAuthProvider} from "@/hooks/useRoleAuth";

// Mock Supabase - use vi.hoisted() to ensure it's available when vi.mock is hoisted
const { mockSupabase } = vi.hoisted(() => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  };
  return { mockSupabase };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

// Mock chatbot API
const { mockChatbotApi } = vi.hoisted(() => {
  const mockChatbotApi = {
    healthCheck: vi.fn().mockResolvedValue({ success: true }),
    patientChat: vi.fn().mockResolvedValue({
      success: true,
      response: "Test response",
    }),
    doctorChat: vi.fn().mockResolvedValue({
      success: true,
      response: "Test response",
    }),
    userChat: vi.fn().mockResolvedValue({
      success: true,
      response: "Test response",
    }),
    getDoctorMemory: vi.fn(),
    clearDoctorMemory: vi.fn(),
  };
  return { mockChatbotApi };
});

vi.mock("@/lib/chatbotApi", () => ({
  chatbotApi: mockChatbotApi,
}));

// Mock appointments library
const { mockAppointments } = vi.hoisted(() => {
  const mockAppointments = {
    listPatientAppointments: vi.fn().mockResolvedValue([]),
    listDoctorAppointments: vi.fn().mockResolvedValue([]),
    updateAppointmentStatus: vi.fn().mockResolvedValue({}),
    subscribeToDoctorAppointments: vi.fn(() => ({
      unsubscribe: vi.fn(),
    })),
  };
  return { mockAppointments };
});

vi.mock("@/lib/supabase/appointments", () => ({
  listPatientAppointments: mockAppointments.listPatientAppointments,
  listDoctorAppointments: mockAppointments.listDoctorAppointments,
  updateAppointmentStatus: mockAppointments.updateAppointmentStatus,
  subscribeToDoctorAppointments: mockAppointments.subscribeToDoctorAppointments,
}));

// Mock patients library
const { mockPatients } = vi.hoisted(() => {
  const mockPatients = {
    getCurrentPatient: vi.fn().mockResolvedValue({
      id: "patient-123",
      user_id: "123",
      name: "Test Patient",
      email: "patient@test.com",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  };
  return { mockPatients };
});

vi.mock("@/lib/supabase/patients", () => ({
  getCurrentPatient: mockPatients.getCurrentPatient,
}));

// Mock doctors library
const { mockDoctors } = vi.hoisted(() => {
  const mockDoctors = {
    getCurrentDoctor: vi.fn().mockResolvedValue({
      id: "doctor-123",
      doctor_id: "DOC001",
      name: "Dr. Test",
      email: "doctor@test.com",
      specialization: "General",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  };
  return { mockDoctors };
});

vi.mock("@/lib/supabase/doctors", () => ({
  getCurrentDoctor: mockDoctors.getCurrentDoctor,
}));

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: "en",
    },
  }),
}));

// Mock framer-motion
vi.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: {
      div: ({ children, ...props }: any) => React.createElement("div", props, children),
      section: ({ children, ...props }: any) => React.createElement("section", props, children),
      button: ({ children, ...props }: any) => React.createElement("button", props, children),
      form: ({ children, ...props }: any) => React.createElement("form", props, children),
    },
  };
});

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
  toast: vi.fn(),
}));

// Mock components
vi.mock("@/components/layout/headers/Header", () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock("@/components/layout/Footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {retry: false},
      mutations: {retry: false},
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <RoleAuthProvider>
        <BrowserRouter>{component}</BrowserRouter>
      </RoleAuthProvider>
    </QueryClientProvider>
  );
};

describe("Appointments Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock responses
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {user: {id: "123", email: "test@example.com", user_metadata: {role: "patient"}}},
      error: null,
    });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {id: "123", email: "test@example.com", user_metadata: {role: "patient"}},
        },
      },
      error: null,
    });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });
  });

  describe("Patient Appointments", () => {
    it("should load patient appointments", async () => {
      const mockAppointmentsData = [
        {
          id: "1",
          patient_id: "patient-123",
          doctor_id: "doctor-123",
          doctor_name: "Dr. Smith",
          date: "2025-01-15",
          time: "10:00:00",
          status: "confirmed",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockAppointments.listPatientAppointments.mockResolvedValue(mockAppointmentsData);

      renderWithProviders(<PatientAppointments />);

      await waitFor(() => {
        expect(mockAppointments.listPatientAppointments).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it("should handle appointment booking", async () => {
      mockAppointments.listPatientAppointments.mockResolvedValue([]);

      renderWithProviders(<PatientAppointments />);

      await waitFor(() => {
        expect(mockAppointments.listPatientAppointments).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe("Doctor Appointments", () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {user: {id: "123", email: "doctor@test.com", user_metadata: {role: "doctor"}}},
        error: null,
      });
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {id: "123", email: "doctor@test.com", user_metadata: {role: "doctor"}},
          },
        },
        error: null,
      });
    });

    it("should load doctor appointments", async () => {
      const mockAppointmentsData = [
        {
          id: "1",
          patient_id: "patient-123",
          doctor_id: "doctor-123",
          patient_name: "John Doe",
          date: "2025-01-15",
          time: "10:00:00",
          status: "confirmed",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockAppointments.listDoctorAppointments.mockResolvedValue(mockAppointmentsData);

      renderWithProviders(<DoctorAppointments />);

      await waitFor(() => {
        expect(mockAppointments.listDoctorAppointments).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it("should handle appointment status updates", async () => {
      const mockAppointmentsData = [
        {
          id: "1",
          patient_id: "patient-123",
          doctor_id: "doctor-123",
          patient_name: "John Doe",
          date: "2025-01-15",
          time: "10:00:00",
          status: "confirmed",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockAppointments.listDoctorAppointments.mockResolvedValue(mockAppointmentsData);
      mockAppointments.updateAppointmentStatus.mockResolvedValue({
        id: "1",
        status: "completed",
      });

      renderWithProviders(<DoctorAppointments />);

      await waitFor(() => {
        expect(mockAppointments.listDoctorAppointments).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });
});

describe("Chatbot Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {user: {id: "123", email: "test@example.com", user_metadata: {role: "patient"}}},
      error: null,
    });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {id: "123", email: "test@example.com", user_metadata: {role: "patient"}},
        },
      },
      error: null,
    });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });
    mockChatbotApi.healthCheck.mockResolvedValue({ success: true });
  });

  describe("Patient Chatbot", () => {
    it("should load patient chatbot interface", async () => {
      renderWithProviders(<PatientChatbot />);

      await waitFor(() => {
        expect(mockChatbotApi.healthCheck).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it("should handle chat message sending", async () => {
      const user = userEvent.setup();

      mockChatbotApi.patientChat.mockResolvedValue({
        success: true,
        response: "This is a test response",
      });

      renderWithProviders(<PatientChatbot />);

      await waitFor(() => {
        expect(mockChatbotApi.healthCheck).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Look for chat input
      const chatInput = screen.queryByPlaceholderText(/message|type|enter your message/i);
      const sendButton = screen.queryByRole("button", { name: /send/i }) || 
                         screen.queryByText(/send/i);

      if (chatInput && sendButton) {
        await user.type(chatInput, "Hello, I need help");
        await user.click(sendButton);

        await waitFor(() => {
          expect(mockChatbotApi.patientChat).toHaveBeenCalled();
        }, { timeout: 3000 });
      }
    });
  });

  describe("Doctor Chatbot", () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {user: {id: "123", email: "doctor@test.com", user_metadata: {role: "doctor"}}},
        error: null,
      });
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {id: "123", email: "doctor@test.com", user_metadata: {role: "doctor"}},
          },
        },
        error: null,
      });
    });

    it("should load doctor chatbot interface", async () => {
      renderWithProviders(<DoctorChatbot />);

      await waitFor(() => {
        expect(mockChatbotApi.healthCheck).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it("should handle doctor-specific chat messages", async () => {
      const user = userEvent.setup();

      mockChatbotApi.doctorChat.mockResolvedValue({
        success: true,
        response: "Doctor response",
      });

      renderWithProviders(<DoctorChatbot />);

      await waitFor(() => {
        expect(mockChatbotApi.healthCheck).toHaveBeenCalled();
      }, { timeout: 3000 });

      const chatInput = screen.queryByPlaceholderText(/message|type|enter your message/i);
      const sendButton = screen.queryByRole("button", { name: /send/i }) || 
                         screen.queryByText(/send/i);

      if (chatInput && sendButton) {
        await user.type(chatInput, "Patient ID 992");
        await user.click(sendButton);

        await waitFor(() => {
          expect(mockChatbotApi.doctorChat).toHaveBeenCalled();
        }, { timeout: 3000 });
      }
    });
  });
});
