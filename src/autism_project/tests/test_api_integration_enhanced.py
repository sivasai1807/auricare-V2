"""
Comprehensive integration tests for Flask API endpoints
"""
import pytest
import sys
import os
import json
from unittest.mock import patch, MagicMock

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.mark.integration
class TestFlaskAPIIntegration:
    """Test suite for Flask API integration tests"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        from chatbot_api import app
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client

    @pytest.fixture
    def mock_chatbot_response(self):
        """Mock chatbot response"""
        return {
            "response": "This is a test response from the chatbot",
            "success": True,
            "timestamp": "2025-01-15T10:00:00Z"
        }

    def test_health_check_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get('/health')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert 'timestamp' in data

    def test_doctor_chat_success(self, client, mock_chatbot_response):
        """Test successful doctor chat request"""
        with patch('chatbot_api.doctor_chatbot.DoctorAutismChatbot') as mock_chatbot_class:
            mock_chatbot = MagicMock()
            mock_chatbot.chat.return_value = mock_chatbot_response['response']
            mock_chatbot_class.return_value = mock_chatbot

            payload = {
                'message': 'What are autism symptoms?',
                'history': []
            }

            response = client.post('/api/doctor/chat', 
                                 json=payload,
                                 content_type='application/json')

            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] == True
            assert 'response' in data
            assert data['response'] == mock_chatbot_response['response']

    def test_doctor_chat_with_history(self, client, mock_chatbot_response):
        """Test doctor chat with conversation history"""
        with patch('chatbot_api.doctor_chatbot.DoctorAutismChatbot') as mock_chatbot_class:
            mock_chatbot = MagicMock()
            mock_chatbot.chat.return_value = mock_chatbot_response['response']
            mock_chatbot_class.return_value = mock_chatbot

            payload = {
                'message': 'Tell me more about patient 992',
                'history': [
                    {'user': 'What is autism?', 'assistant': 'Autism is a developmental disorder...'}
                ]
            }

            response = client.post('/api/doctor/chat', 
                                 json=payload,
                                 content_type='application/json')

            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] == True
            mock_chatbot.chat.assert_called_once()

    def test_doctor_chat_empty_message(self, client):
        """Test doctor chat with empty message"""
        payload = {
            'message': '',
            'history': []
        }

        response = client.post('/api/doctor/chat', 
                             json=payload,
                             content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] == False
        assert 'error' in data

    def test_doctor_chat_missing_message(self, client):
        """Test doctor chat with missing message field"""
        payload = {
            'history': []
        }

        response = client.post('/api/doctor/chat', 
                             json=payload,
                             content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] == False

    def test_doctor_chat_invalid_json(self, client):
        """Test doctor chat with invalid JSON"""
        response = client.post('/api/doctor/chat', 
                             data='invalid json',
                             content_type='application/json')

        assert response.status_code == 400

    def test_patient_chat_success(self, client, mock_chatbot_response):
        """Test successful patient chat request"""
        with patch('chatbot_api.patient_chatbot.PatientAutismChatbot') as mock_chatbot_class:
            mock_chatbot = MagicMock()
            mock_chatbot.chat.return_value = mock_chatbot_response['response']
            mock_chatbot_class.return_value = mock_chatbot

            payload = {
                'message': 'I need help with my child',
                'history': []
            }

            response = client.post('/api/patient/chat', 
                                 json=payload,
                                 content_type='application/json')

            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] == True
            assert 'response' in data

    def test_patient_chat_with_history(self, client, mock_chatbot_response):
        """Test patient chat with conversation history"""
        with patch('chatbot_api.patient_chatbot.PatientAutismChatbot') as mock_chatbot_class:
            mock_chatbot = MagicMock()
            mock_chatbot.chat.return_value = mock_chatbot_response['response']
            mock_chatbot_class.return_value = mock_chatbot

            payload = {
                'message': 'What should I do next?',
                'history': [
                    {'user': 'My child has autism', 'assistant': 'I understand your concern...'}
                ]
            }

            response = client.post('/api/patient/chat', 
                                 json=payload,
                                 content_type='application/json')

            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] == True

    def test_patient_chat_empty_message(self, client):
        """Test patient chat with empty message"""
        payload = {
            'message': '',
            'history': []
        }

        response = client.post('/api/patient/chat', 
                             json=payload,
                             content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] == False

    def test_chatbot_error_handling(self, client):
        """Test chatbot error handling"""
        with patch('chatbot_api.doctor_chatbot.DoctorAutismChatbot') as mock_chatbot_class:
            mock_chatbot = MagicMock()
            mock_chatbot.chat.side_effect = Exception("Chatbot error")
            mock_chatbot_class.return_value = mock_chatbot

            payload = {
                'message': 'Test message',
                'history': []
            }

            response = client.post('/api/doctor/chat', 
                                 json=payload,
                                 content_type='application/json')

            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] == False
            assert 'error' in data

    def test_cors_headers(self, client):
        """Test CORS headers are present"""
        response = client.get('/health')
        
        assert response.status_code == 200
        assert 'Access-Control-Allow-Origin' in response.headers
        assert 'Access-Control-Allow-Methods' in response.headers

    def test_content_type_validation(self, client):
        """Test content type validation"""
        payload = {
            'message': 'Test message',
            'history': []
        }

        # Test without content-type header
        response = client.post('/api/doctor/chat', json=payload)
        assert response.status_code == 200

        # Test with wrong content-type
        response = client.post('/api/doctor/chat', 
                             data=json.dumps(payload),
                             content_type='text/plain')
        assert response.status_code == 200


@pytest.mark.integration
class TestDatabaseIntegration:
    """Test suite for database integration tests"""

    @pytest.fixture
    def mock_csv_data(self):
        """Create mock CSV data for testing"""
        import pandas as pd
        return pd.DataFrame({
            'patient_id': ['992', '993', '994'],
            'patient_name': ['John Doe', 'Jane Smith', 'Bob Johnson'],
            'gender': ['Male', 'Female', 'Male'],
            'patient_data': [
                'Autism spectrum disorder, speech delay',
                'ADHD, anxiety',
                'Autism, sensory issues'
            ],
            'suggestion': [
                'Speech therapy recommended',
                'Behavioral therapy recommended',
                'Occupational therapy recommended'
            ]
        })

    def test_csv_data_loading(self, mock_csv_data):
        """Test CSV data loading functionality"""
        with patch('doctor_chatbot.pd.read_csv') as mock_read_csv:
            mock_read_csv.return_value = mock_csv_data
            
            from doctor_chatbot import load_patient_data
            
            result = load_patient_data()
            
            assert result is not None
            assert len(result) == 3
            assert 'patient_id' in result.columns

    def test_patient_data_search_integration(self, mock_csv_data):
        """Test patient data search integration"""
        with patch('doctor_chatbot.csv_data', mock_csv_data):
            from doctor_chatbot import search_by_id, search_by_name
            
            # Test ID search
            result = search_by_id('992')
            assert result is not None
            assert result['patient_name'] == 'John Doe'
            
            # Test name search
            result = search_by_name('Jane Smith')
            assert result is not None
            assert result['patient_id'] == '993'

    def test_vector_database_integration(self, mock_csv_data):
        """Test vector database integration"""
        with patch('doctor_chatbot.pd.read_csv') as mock_read_csv:
            with patch('doctor_chatbot.HuggingFaceEmbeddings') as mock_embeddings:
                with patch('doctor_chatbot.FAISS.from_documents') as mock_faiss:
                    mock_read_csv.return_value = mock_csv_data
                    mock_embeddings.return_value = MagicMock()
                    mock_faiss.return_value = MagicMock()
                    
                    from doctor_chatbot import setup_vector_db
                    
                    result = setup_vector_db()
                    
                    assert result is not None
                    mock_read_csv.assert_called_once()

    def test_chatbot_memory_integration(self):
        """Test chatbot memory integration"""
        from doctor_chatbot import DoctorAutismChatbot
        
        chatbot = DoctorAutismChatbot()
        
        # Test memory operations
        chatbot.conversation_history = [
            {"user": "Hello", "assistant": "Hi there!", "timestamp": "2025-01-15"}
        ]
        
        summary = chatbot.get_memory_summary()
        assert "Hello" in summary
        
        chatbot.clear_history()
        assert len(chatbot.conversation_history) == 0


@pytest.mark.integration
class TestAPIPerformance:
    """Test suite for API performance tests"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        from chatbot_api import app
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client

    def test_response_time_doctor_chat(self, client):
        """Test doctor chat response time"""
        import time
        
        with patch('chatbot_api.doctor_chatbot.DoctorAutismChatbot') as mock_chatbot_class:
            mock_chatbot = MagicMock()
            mock_chatbot.chat.return_value = "Test response"
            mock_chatbot_class.return_value = mock_chatbot

            payload = {
                'message': 'What is autism?',
                'history': []
            }

            start_time = time.time()
            response = client.post('/api/doctor/chat', 
                                 json=payload,
                                 content_type='application/json')
            end_time = time.time()

            assert response.status_code == 200
            assert (end_time - start_time) < 5.0  # Should respond within 5 seconds

    def test_concurrent_requests(self, client):
        """Test handling of concurrent requests"""
        import threading
        import time

        results = []
        
        def make_request():
            with patch('chatbot_api.doctor_chatbot.DoctorAutismChatbot') as mock_chatbot_class:
                mock_chatbot = MagicMock()
                mock_chatbot.chat.return_value = "Test response"
                mock_chatbot_class.return_value = mock_chatbot

                payload = {
                    'message': 'Test message',
                    'history': []
                }

                response = client.post('/api/doctor/chat', 
                                     json=payload,
                                     content_type='application/json')
                results.append(response.status_code)

        # Create multiple threads
        threads = []
        for i in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()

        # Wait for all threads to complete
        for thread in threads:
            thread.join()

        # All requests should succeed
        assert all(status == 200 for status in results)
        assert len(results) == 5


@pytest.mark.integration
class TestErrorHandling:
    """Test suite for error handling integration tests"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        from chatbot_api import app
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client

    def test_large_message_handling(self, client):
        """Test handling of large messages"""
        large_message = "x" * 10000  # 10KB message
        
        with patch('chatbot_api.doctor_chatbot.DoctorAutismChatbot') as mock_chatbot_class:
            mock_chatbot = MagicMock()
            mock_chatbot.chat.return_value = "Response to large message"
            mock_chatbot_class.return_value = mock_chatbot

            payload = {
                'message': large_message,
                'history': []
            }

            response = client.post('/api/doctor/chat', 
                                 json=payload,
                                 content_type='application/json')

            assert response.status_code == 200

    def test_special_characters_handling(self, client):
        """Test handling of special characters"""
        special_message = "Hello! @#$%^&*()_+{}|:<>?[]\\;'\",./"
        
        with patch('chatbot_api.doctor_chatbot.DoctorAutismChatbot') as mock_chatbot_class:
            mock_chatbot = MagicMock()
            mock_chatbot.chat.return_value = "Response to special chars"
            mock_chatbot_class.return_value = mock_chatbot

            payload = {
                'message': special_message,
                'history': []
            }

            response = client.post('/api/doctor/chat', 
                                 json=payload,
                                 content_type='application/json')

            assert response.status_code == 200

    def test_unicode_handling(self, client):
        """Test handling of Unicode characters"""
        unicode_message = "Hello 世界! 🌍 مرحبا بالعالم"
        
        with patch('chatbot_api.doctor_chatbot.DoctorAutismChatbot') as mock_chatbot_class:
            mock_chatbot = MagicMock()
            mock_chatbot.chat.return_value = "Response to unicode"
            mock_chatbot_class.return_value = mock_chatbot

            payload = {
                'message': unicode_message,
                'history': []
            }

            response = client.post('/api/doctor/chat', 
                                 json=payload,
                                 content_type='application/json')

            assert response.status_code == 200

    def test_malformed_json_handling(self, client):
        """Test handling of malformed JSON"""
        malformed_json = '{"message": "test", "history": [}'  # Missing closing bracket
        
        response = client.post('/api/doctor/chat', 
                             data=malformed_json,
                             content_type='application/json')

        assert response.status_code == 400
