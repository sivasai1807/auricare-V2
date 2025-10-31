import {describe, it, expect, vi} from "vitest";
import {renderHook, act} from "@testing-library/react";
import {useRoleAuth, RoleAuthProvider} from "@/hooks/useRoleAuth";
import {useSupabaseClient} from "@/hooks/useSupabaseClient";
import {useToast} from "@/hooks/use-toast";
import {ReactNode} from "react";
import {BrowserRouter} from "react-router-dom";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

describe("Custom Hooks Unit Tests", () => {
  describe("useRoleAuth Hook", () => {
    const wrapper = ({children}: {children: ReactNode}) => (
      <BrowserRouter>
        <RoleAuthProvider>{children}</RoleAuthProvider>
      </BrowserRouter>
    );

    it("should initialize with default values", () => {
      const {result} = renderHook(() => useRoleAuth(), {wrapper});

      expect(result.current.user).toBeNull();
      expect(result.current.userRole).toBeNull();
      expect(result.current.loading).toBe(true);
    });

    it("should handle user authentication state", async () => {
      const {result} = renderHook(() => useRoleAuth(), {wrapper});

      // Test that the hook provides the expected interface
      expect(result.current.signUp).toBeDefined();
      expect(result.current.signIn).toBeDefined();
      expect(result.current.signOut).toBeDefined();
    });

    it("should handle logout", async () => {
      const {result} = renderHook(() => useRoleAuth(), {wrapper});

      // Test that signOut function exists
      expect(typeof result.current.signOut).toBe("function");
    });
  });

  describe("useSupabaseClient Hook", () => {
    it("should return supabase client", () => {
      const {result} = renderHook(() => useSupabaseClient());

      expect(result.current).toBeDefined();
      expect(result.current.auth).toBeDefined();
    });
  });

  describe("useToast Hook", () => {
    it("should initialize with empty toasts", () => {
      const {result} = renderHook(() => useToast());

      expect(result.current.toasts).toEqual([]);
    });

    it("should add toast", () => {
      const {result} = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: "Test Toast",
          description: "This is a test toast",
        });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe("Test Toast");
    });

    it("should dismiss toast", () => {
      const {result} = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: "Test Toast",
          description: "This is a test toast",
        });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.dismiss(result.current.toasts[0].id);
      });

      // Toast should be marked as dismissed (open: false) but still in array
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].open).toBe(false);
    });
  });
});
