import { describe, it, expect, beforeEach, vi } from 'vitest';
import { chatbotApi } from './chatbotApi';

global.fetch = vi.fn();

describe('ChatbotApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should successfully check health', async () => {
      const mockResponse = {
        status: 'healthy',
        message: 'Chatbot API is running'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await chatbotApi.healthCheck();
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/health',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle health check errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(chatbotApi.healthCheck()).rejects.toThrow();
    });
  });

  describe('doctorChat', () => {
    it('should send doctor chat message successfully', async () => {
      const mockResponse = {
        success: true,
        response: 'Hello Doctor!',
        timestamp: new Date().toISOString(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await chatbotApi.doctorChat('Hello', []);
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/doctor/chat',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ message: 'Hello', history: [] }),
        })
      );
    });

    it('should handle empty message', async () => {
      const mockResponse = {
        success: false,
        error: 'Message cannot be empty',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await chatbotApi.doctorChat('', []);
      expect(result.success).toBe(false);
    });
  });

  describe('patientChat', () => {
    it('should send patient chat message successfully', async () => {
      const mockResponse = {
        success: true,
        response: 'Hello Patient!',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await chatbotApi.patientChat('What is autism?', []);
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('userChat', () => {
    it('should send user chat message successfully', async () => {
      const mockResponse = {
        success: true,
        response: 'Hello User!',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await chatbotApi.userChat('Hi', []);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDoctorMemory', () => {
    it('should retrieve doctor memory successfully', async () => {
      const mockResponse = {
        success: true,
        memory: 'Previous conversation history',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await chatbotApi.getDoctorMemory();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('clearDoctorMemory', () => {
    it('should clear doctor memory successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Memory cleared',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await chatbotApi.clearDoctorMemory();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(chatbotApi.healthCheck()).rejects.toThrow('Network error');
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(chatbotApi.doctorChat('test', [])).rejects.toThrow();
    });
  });
});
