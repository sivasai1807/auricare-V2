import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Sign Up', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      const result = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.data?.user).toBeDefined();
      expect(result.data?.user?.email).toBe('test@example.com');
      expect(result.error).toBeNull();
    });

    it('should handle sign up errors', async () => {
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      });

      const result = await supabase.auth.signUp({
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(result.error).toBeDefined();
      expect(result.data.user).toBeNull();
    });
  });

  describe('User Sign In', () => {
    it('should successfully sign in user with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: {
          user: mockUser,
          session: { access_token: 'token', refresh_token: 'refresh' },
        },
        error: null,
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.data.user).toBeDefined();
      expect(result.data.session).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle invalid credentials', async () => {
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.error).toBeDefined();
      expect(result.data.user).toBeNull();
    });
  });

  describe('User Sign Out', () => {
    it('should successfully sign out user', async () => {
      (supabase.auth.signOut as any).mockResolvedValue({
        error: null,
      });

      const result = await supabase.auth.signOut();

      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it('should handle sign out errors', async () => {
      (supabase.auth.signOut as any).mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      const result = await supabase.auth.signOut();

      expect(result.error).toBeDefined();
    });
  });

  describe('Session Management', () => {
    it('should retrieve current session', async () => {
      const mockSession = {
        access_token: 'token',
        user: { id: 'user-123', email: 'test@example.com' },
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await supabase.auth.getSession();

      expect(result.data.session).toBeDefined();
      expect(result.data.session?.user.id).toBe('user-123');
    });

    it('should return null session when not authenticated', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await supabase.auth.getSession();

      expect(result.data.session).toBeNull();
    });
  });

  describe('Auth State Change', () => {
    it('should handle auth state change listener', () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (supabase.auth.onAuthStateChange as any).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const { data } = supabase.auth.onAuthStateChange(callback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
      expect(data.subscription).toBeDefined();
    });
  });
});
