import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Auth} from "@/pages/Auth";
import {PatientDashboard} from "@/pages/patient/PatientDashboard";
import {DoctorDashboard} from "@/pages/doctor/DoctorDashboard";

// Mock Supabase
const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: {subscription: {unsubscribe: vi.fn()}},
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
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

// Mock components with complex dependencies
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

describe("Authentication Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("User Registration Flow", () => {
    it("should handle successful user registration", async () => {
      const user = userEvent.setup();
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {user: {id: "123", email: "test@example.com"}},
        error: null,
      });

      renderWithProviders(<Auth />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("should handle registration errors", async () => {
      const user = userEvent.setup();
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {user: null},
        error: {message: "Email already registered"},
      });

      renderWithProviders(<Auth />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalled();
      });
    });
  });

  describe("User Login Flow", () => {
    it("should handle successful user login", async () => {
      const user = userEvent.setup();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {user: {id: "123", email: "test@example.com"}},
        error: null,
      });

      renderWithProviders(<Auth />);

      // Switch to sign in mode
      const toggleLink = screen.getByText(/already have an account/i);
      await user.click(toggleLink);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole("button", {name: /sign in/i});

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("should handle login errors", async () => {
      const user = userEvent.setup();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {user: null},
        error: {message: "Invalid credentials"},
      });

      renderWithProviders(<Auth />);

      const toggleLink = screen.getByText(/already have an account/i);
      await user.click(toggleLink);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole("button", {name: /sign in/i});

      await user.type(emailInput, "wrong@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
      });
    });
  });
});

describe("Dashboard Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {user: {id: "123", email: "test@example.com"}},
      error: null,
    });
  });

  describe("Patient Dashboard", () => {
    it("should load patient dashboard with user data", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {role: "patient", name: "John Doe"},
              error: null,
            }),
          }),
        }),
      });

      renderWithProviders(<PatientDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId("header")).toBeInTheDocument();
      });
    });
  });

  describe("Doctor Dashboard", () => {
    it("should load doctor dashboard with user data", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {role: "doctor", name: "Dr. Smith"},
              error: null,
            }),
          }),
        }),
      });

      renderWithProviders(<DoctorDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId("header")).toBeInTheDocument();
      });
    });
  });
});
