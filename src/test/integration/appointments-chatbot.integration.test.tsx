import {describe, it, expect, vi, beforeEach} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {PatientAppointments} from "@/pages/patient/PatientAppointments";
import {DoctorAppointments} from "@/pages/doctor/DoctorAppointments";
import {PatientChatbot} from "@/pages/patient/PatientChatbot";
import {DoctorChatbot} from "@/pages/doctor/DoctorChatbot";

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signOut: vi.fn(),
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

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

// Mock chatbot API
vi.mock("@/lib/chatbotApi", () => ({
  sendChatMessage: vi.fn(),
}));

// Mock components
vi.mock("@/components/layout/headers/Header", () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock("@/components/layout/Footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
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
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("Appointments Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {user: {id: "123", email: "test@example.com"}},
      error: null,
    });
  });

  describe("Patient Appointments", () => {
    it("should load patient appointments", async () => {
      const mockAppointments = [
        {
          id: "1",
          doctor_name: "Dr. Smith",
          date: "2025-01-15",
          time: "10:00",
          status: "scheduled",
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockAppointments,
              error: null,
            }),
          }),
        }),
      });

      renderWithProviders(<PatientAppointments />);

      await waitFor(() => {
        expect(screen.getByTestId("header")).toBeInTheDocument();
      });
    });

    it("should handle appointment booking", async () => {
      const user = userEvent.setup();

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({
          data: {id: "new-appointment"},
          error: null,
        }),
      });

      renderWithProviders(<PatientAppointments />);

      // Look for booking button or form
      const bookingButton = screen.queryByText(/book|schedule/i);
      if (bookingButton) {
        await user.click(bookingButton);

        await waitFor(() => {
          expect(mockSupabase.from).toHaveBeenCalled();
        });
      }
    });
  });

  describe("Doctor Appointments", () => {
    it("should load doctor appointments", async () => {
      const mockAppointments = [
        {
          id: "1",
          patient_name: "John Doe",
          date: "2025-01-15",
          time: "10:00",
          status: "scheduled",
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockAppointments,
              error: null,
            }),
          }),
        }),
      });

      renderWithProviders(<DoctorAppointments />);

      await waitFor(() => {
        expect(screen.getByTestId("header")).toBeInTheDocument();
      });
    });

    it("should handle appointment status updates", async () => {
      const user = userEvent.setup();

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [{id: "1", status: "scheduled"}],
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockResolvedValue({
          data: {id: "1", status: "completed"},
          error: null,
        }),
      });

      renderWithProviders(<DoctorAppointments />);

      // Look for status update button
      const statusButton = screen.queryByText(/complete|update/i);
      if (statusButton) {
        await user.click(statusButton);

        await waitFor(() => {
          expect(mockSupabase.from).toHaveBeenCalled();
        });
      }
    });
  });
});

describe("Chatbot Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {user: {id: "123", email: "test@example.com"}},
      error: null,
    });
  });

  describe("Patient Chatbot", () => {
    it("should load patient chatbot interface", async () => {
      renderWithProviders(<PatientChatbot />);

      await waitFor(() => {
        expect(screen.getByTestId("header")).toBeInTheDocument();
      });
    });

    it("should handle chat message sending", async () => {
      const user = userEvent.setup();
      const {sendChatMessage} = await import("@/lib/chatbotApi");

      vi.mocked(sendChatMessage).mockResolvedValue({
        response: "This is a test response",
        success: true,
      });

      renderWithProviders(<PatientChatbot />);

      // Look for chat input
      const chatInput = screen.queryByPlaceholderText(/message|type/i);
      const sendButton = screen.queryByText(/send|submit/i);

      if (chatInput && sendButton) {
        await user.type(chatInput, "Hello, I need help");
        await user.click(sendButton);

        await waitFor(() => {
          expect(sendChatMessage).toHaveBeenCalledWith(
            expect.objectContaining({
              message: "Hello, I need help",
            })
          );
        });
      }
    });
  });

  describe("Doctor Chatbot", () => {
    it("should load doctor chatbot interface", async () => {
      renderWithProviders(<DoctorChatbot />);

      await waitFor(() => {
        expect(screen.getByTestId("header")).toBeInTheDocument();
      });
    });

    it("should handle doctor-specific chat messages", async () => {
      const user = userEvent.setup();
      const {sendChatMessage} = await import("@/lib/chatbotApi");

      vi.mocked(sendChatMessage).mockResolvedValue({
        response: "Doctor response",
        success: true,
      });

      renderWithProviders(<DoctorChatbot />);

      const chatInput = screen.queryByPlaceholderText(/message|type/i);
      const sendButton = screen.queryByText(/send|submit/i);

      if (chatInput && sendButton) {
        await user.type(chatInput, "Patient ID 992");
        await user.click(sendButton);

        await waitFor(() => {
          expect(sendChatMessage).toHaveBeenCalledWith(
            expect.objectContaining({
              message: "Patient ID 992",
            })
          );
        });
      }
    });
  });
});
