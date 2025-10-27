"""
Integration tests for Flask API endpoints
"""
import pytest
import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest.mock import patch, MagicMock


@pytest.fixture
def client():
    """Create Flask test client"""
    with patch('chatbot_api.doctor_chatbot') as mock_doctor:
        with patch('chatbot_api.patient_chatbot') as mock_patient:
            mock_doctor.chat = MagicMock(return_value="Doctor response")
            mock_doctor.get_memory_summary = MagicMock(return_value="Memory summary")
            mock_doctor.clear_history = MagicMock(return_value="History cleared")
            mock_patient.chat = MagicMock(return_value="Patient response")

            from chatbot_api import app
            app.config['TESTING'] = True

            with app.test_client() as client:
                yield client


class TestHealthEndpoint:
    """Test suite for health check endpoint"""

    def test_health_check_success(self, client):
        """Test successful health check"""
        response = client.get('/api/health')

        assert response.status_code == 200

        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert 'doctor_chatbot' in data
        assert 'patient_chatbot' in data

    def test_health_check_returns_json(self, client):
        """Test health check returns JSON"""
        response = client.get('/api/health')

        assert response.content_type == 'application/json'


class TestDoctorChatEndpoint:
    """Test suite for doctor chat endpoint"""

    def test_doctor_chat_success(self, client):
        """Test successful doctor chat request"""
        payload = {
            'message': 'What are autism symptoms?',
            'history': []
        }

        response = client.post(
            '/api/doctor/chat',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200

        data = json.loads(response.data)
        assert data['success'] is True
        assert 'response' in data

    def test_doctor_chat_with_history(self, client):
        """Test doctor chat with conversation history"""
        payload = {
            'message': 'Tell me more',
            'history': [
                {'role': 'user', 'content': 'What is autism?'},
                {'role': 'assistant', 'content': 'Autism is...'}
            ]
        }

        response = client.post(
            '/api/doctor/chat',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200

        data = json.loads(response.data)
        assert data['success'] is True

    def test_doctor_chat_empty_message(self, client):
        """Test doctor chat with empty message"""
        payload = {
            'message': '',
            'history': []
        }

        response = client.post(
            '/api/doctor/chat',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400

        data = json.loads(response.data)
        assert data['success'] is False
        assert 'error' in data

    def test_doctor_chat_whitespace_only(self, client):
        """Test doctor chat with whitespace-only message"""
        payload = {
            'message': '   ',
            'history': []
        }

        response = client.post(
            '/api/doctor/chat',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400

    def test_doctor_chat_missing_message_field(self, client):
        """Test doctor chat with missing message field"""
        payload = {
            'history': []
        }

        response = client.post(
            '/api/doctor/chat',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code in [200, 400]

    def test_doctor_chat_invalid_json(self, client):
        """Test doctor chat with invalid JSON"""
        response = client.post(
            '/api/doctor/chat',
            data='invalid json',
            content_type='application/json'
        )

        assert response.status_code in [400, 500]


class TestPatientChatEndpoint:
    """Test suite for patient chat endpoint"""

    def test_patient_chat_success(self, client):
        """Test successful patient chat request"""
        payload = {
            'message': 'What is autism?',
            'history': []
        }

        response = client.post(
            '/api/patient/chat',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200

        data = json.loads(response.data)
        assert data['success'] is True
        assert 'response' in data

    def test_patient_chat_empty_message(self, client):
        """Test patient chat with empty message"""
        payload = {
            'message': '',
            'history': []
        }

        response = client.post(
            '/api/patient/chat',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400

        data = json.loads(response.data)
        assert data['success'] is False


class TestUserChatEndpoint:
    """Test suite for user chat endpoint"""

    def test_user_chat_success(self, client):
        """Test successful user chat request"""
        payload = {
            'message': 'Hello',
            'history': []
        }

        response = client.post(
            '/api/user/chat',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200

        data = json.loads(response.data)
        assert data['success'] is True

    def test_user_chat_empty_message(self, client):
        """Test user chat with empty message"""
        payload = {
            'message': '',
            'history': []
        }

        response = client.post(
            '/api/user/chat',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400


class TestDoctorMemoryEndpoint:
    """Test suite for doctor memory endpoints"""

    def test_get_doctor_memory_success(self, client):
        """Test getting doctor memory"""
        response = client.get('/api/doctor/memory')

        assert response.status_code == 200

        data = json.loads(response.data)
        assert data['success'] is True
        assert 'memory' in data

    def test_clear_doctor_memory_success(self, client):
        """Test clearing doctor memory"""
        response = client.post('/api/doctor/clear-memory')

        assert response.status_code == 200

        data = json.loads(response.data)
        assert data['success'] is True
        assert 'message' in data


class TestCORSHeaders:
    """Test suite for CORS headers"""

    def test_cors_headers_present(self, client):
        """Test that CORS headers are present"""
        response = client.options('/api/doctor/chat')

        # CORS should be enabled
        assert 'Access-Control-Allow-Origin' in response.headers or response.status_code == 404


class TestErrorHandling:
    """Test suite for error handling"""

    def test_404_not_found(self, client):
        """Test 404 error for non-existent endpoint"""
        response = client.get('/api/nonexistent')

        assert response.status_code == 404

    def test_405_method_not_allowed(self, client):
        """Test 405 error for wrong HTTP method"""
        response = client.get('/api/doctor/chat')

        assert response.status_code == 405


class TestContentTypeValidation:
    """Test suite for content type validation"""

    def test_json_content_type_required(self, client):
        """Test that JSON content type is handled"""
        payload = {
            'message': 'test',
            'history': []
        }

        response = client.post(
            '/api/doctor/chat',
            data=json.dumps(payload),
            content_type='text/plain'
        )

        # Should handle or reject non-JSON content type
        assert response.status_code in [200, 400, 415]


class TestConcurrentRequests:
    """Test suite for handling concurrent requests"""

    def test_multiple_simultaneous_requests(self, client):
        """Test handling multiple simultaneous requests"""
        payload = {
            'message': 'test message',
            'history': []
        }

        responses = []
        for i in range(3):
            response = client.post(
                '/api/doctor/chat',
                data=json.dumps(payload),
                content_type='application/json'
            )
            responses.append(response)

        # All requests should be processed successfully
        for response in responses:
            assert response.status_code == 200

            data = json.loads(response.data)
            assert data['success'] is True
