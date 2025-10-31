"""
Enhanced unit tests for chatbot helper functions
"""
import pytest
import sys
import os
from unittest.mock import Mock, patch, MagicMock
import pandas as pd
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.mark.unit
class TestPatientDataRetrieval:
    """Test suite for patient data retrieval functions"""

    @pytest.fixture
    def mock_csv_data(self):
        """Create mock CSV data for testing"""
        return pd.DataFrame({
            'patient_id': ['992', '993', '994', '995'],
            'patient_name': ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown'],
            'gender': ['Male', 'Female', 'Male', 'Female'],
            'age': [25, 30, 35, 28],
            'patient_data': [
                'Autism spectrum disorder, speech delay, sensory issues',
                'ADHD, anxiety, attention problems',
                'Autism, sensory issues, communication difficulties',
                'Developmental delay, motor skills issues'
            ],
            'suggestion': [
                'Speech therapy, occupational therapy recommended',
                'Behavioral therapy, medication management',
                'Occupational therapy, communication training',
                'Physical therapy, early intervention'
            ],
            'appointment_date': ['2025-01-15', '2025-01-20', '2025-01-25', '2025-01-30'],
            'status': ['active', 'active', 'completed', 'active']
        })

    def test_search_by_id_exact_match(self, mock_csv_data):
        """Test searching patient by exact ID match"""
        from doctor_chatbot import search_by_id

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = search_by_id('992')

            assert result is not None
            assert result['patient_id'] == '992'
            assert result['patient_name'] == 'John Doe'
            assert result['gender'] == 'Male'

    def test_search_by_id_not_found(self, mock_csv_data):
        """Test searching for non-existent patient ID"""
        from doctor_chatbot import search_by_id

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = search_by_id('999')

            assert result is None

    def test_search_by_id_case_sensitivity(self, mock_csv_data):
        """Test ID search is case sensitive"""
        from doctor_chatbot import search_by_id

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = search_by_id('992')
            assert result is not None
            
            result_upper = search_by_id('992')
            assert result_upper is not None

    def test_search_by_name_exact_match(self, mock_csv_data):
        """Test searching patient by exact name"""
        from doctor_chatbot import search_by_name

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = search_by_name('John Doe')

            assert result is not None
            assert result['patient_name'] == 'John Doe'

    def test_search_by_name_partial_match(self, mock_csv_data):
        """Test searching patient by partial name"""
        from doctor_chatbot import search_by_name

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = search_by_name('Jane')

            assert result is not None
            assert 'Jane' in result['patient_name']

    def test_search_by_name_case_insensitive(self, mock_csv_data):
        """Test case-insensitive name search"""
        from doctor_chatbot import search_by_name

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = search_by_name('JOHN DOE')

            assert result is not None
            assert result['patient_name'] == 'John Doe'

    def test_search_by_name_not_found(self, mock_csv_data):
        """Test searching for non-existent patient name"""
        from doctor_chatbot import search_by_name

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = search_by_name('NonExistent Patient')

            assert result is None

    def test_get_patient_data_with_id(self, mock_csv_data):
        """Test get_patient_data with ID in query"""
        from doctor_chatbot import get_patient_data

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = get_patient_data('patient id 992')

            assert result is not None
            assert result['patient_id'] == '992'

    def test_get_patient_data_with_name(self, mock_csv_data):
        """Test get_patient_data with name in query"""
        from doctor_chatbot import get_patient_data

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = get_patient_data('tell me about John')

            assert result is not None
            assert 'John' in result['patient_name']

    def test_get_patient_data_with_condition(self, mock_csv_data):
        """Test get_patient_data searching by condition"""
        from doctor_chatbot import get_patient_data

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = get_patient_data('patients with autism')

            assert result is not None
            # Should return multiple patients with autism
            if isinstance(result, list):
                assert len(result) > 0

    def test_get_patient_data_no_match(self, mock_csv_data):
        """Test get_patient_data with no matches"""
        from doctor_chatbot import get_patient_data

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = get_patient_data('random unrelated query')

            assert result is None

    def test_get_patient_data_empty_query(self, mock_csv_data):
        """Test get_patient_data with empty query"""
        from doctor_chatbot import get_patient_data

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = get_patient_data('')

            assert result is None

    def test_get_patient_data_none_query(self, mock_csv_data):
        """Test get_patient_data with None query"""
        from doctor_chatbot import get_patient_data

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = get_patient_data(None)

            assert result is None


@pytest.mark.unit
class TestVectorDatabase:
    """Test suite for vector database operations"""

    @patch('doctor_chatbot.pd.read_csv')
    @patch('doctor_chatbot.HuggingFaceEmbeddings')
    @patch('doctor_chatbot.FAISS.from_documents')
    def test_setup_vector_db_success(self, mock_faiss, mock_embeddings, mock_read_csv):
        """Test successful vector database setup"""
        from doctor_chatbot import setup_vector_db

        mock_read_csv.return_value = pd.DataFrame({
            'patient_id': ['992'],
            'patient_name': ['John Doe'],
            'gender': ['Male'],
            'patient_data': ['Autism spectrum disorder'],
            'suggestion': ['Speech therapy']
        })

        mock_embeddings.return_value = MagicMock()
        mock_faiss.return_value = MagicMock()

        result = setup_vector_db()

        assert result is not None
        mock_read_csv.assert_called_once()

    @patch('doctor_chatbot.os.path.exists')
    def test_setup_vector_db_file_not_found(self, mock_exists):
        """Test vector database setup with missing CSV file"""
        from doctor_chatbot import setup_vector_db

        mock_exists.return_value = False

        result = setup_vector_db()

        assert result is None

    @patch('doctor_chatbot.pd.read_csv')
    def test_setup_vector_db_csv_error(self, mock_read_csv):
        """Test vector database setup with CSV read error"""
        from doctor_chatbot import setup_vector_db

        mock_read_csv.side_effect = Exception("CSV read error")

        result = setup_vector_db()

        assert result is None


@pytest.mark.unit
class TestQueryClassification:
    """Test suite for query classification"""

    def test_classify_greeting(self):
        """Test classification of greeting messages"""
        from doctor_chatbot import classify_query_type, ChatbotState

        state = ChatbotState(
            query="Hello",
            query_type="",
            patient_data="",
            medical_knowledge="",
            final_response="",
            chat_history=[]
        )

        result = classify_query_type(state)

        assert result["query_type"] == "greeting"

    def test_classify_greeting_variations(self):
        """Test classification of various greeting messages"""
        from doctor_chatbot import classify_query_type, ChatbotState

        greetings = ["Hi", "Good morning", "Good afternoon", "Good evening", "Hey there"]
        
        for greeting in greetings:
            state = ChatbotState(
                query=greeting,
                query_type="",
                patient_data="",
                medical_knowledge="",
                final_response="",
                chat_history=[]
            )

            result = classify_query_type(state)
            assert result["query_type"] == "greeting"

    def test_classify_patient_query_with_id(self):
        """Test classification of patient-related query with ID"""
        from doctor_chatbot import classify_query_type, ChatbotState

        state = ChatbotState(
            query="patient id 992",
            query_type="",
            patient_data="",
            medical_knowledge="",
            final_response="",
            chat_history=[]
        )

        result = classify_query_type(state)

        assert result["query_type"] == "patient_related"

    def test_classify_patient_query_with_name(self):
        """Test classification of patient-related query with name"""
        from doctor_chatbot import classify_query_type, ChatbotState

        state = ChatbotState(
            query="tell me about patient John",
            query_type="",
            patient_data="",
            medical_knowledge="",
            final_response="",
            chat_history=[]
        )

        result = classify_query_type(state)

        assert result["query_type"] == "patient_related"

    def test_classify_general_autism_query(self):
        """Test classification of general autism query"""
        from doctor_chatbot import classify_query_type, ChatbotState

        state = ChatbotState(
            query="what are autism symptoms?",
            query_type="",
            patient_data="",
            medical_knowledge="",
            final_response="",
            chat_history=[]
        )

        result = classify_query_type(state)

        assert result["query_type"] == "general_autism"

    def test_classify_medical_query(self):
        """Test classification of general medical query"""
        from doctor_chatbot import classify_query_type, ChatbotState

        state = ChatbotState(
            query="what is ADHD?",
            query_type="",
            patient_data="",
            medical_knowledge="",
            final_response="",
            chat_history=[]
        )

        result = classify_query_type(state)

        assert result["query_type"] == "general_medical"

    def test_classify_empty_query(self):
        """Test classification of empty query"""
        from doctor_chatbot import classify_query_type, ChatbotState

        state = ChatbotState(
            query="",
            query_type="",
            patient_data="",
            medical_knowledge="",
            final_response="",
            chat_history=[]
        )

        result = classify_query_type(state)

        assert result["query_type"] == "unclear"


@pytest.mark.unit
class TestChatbotClass:
    """Test suite for DoctorAutismChatbot class"""

    @pytest.fixture
    def chatbot(self):
        """Create chatbot instance for testing"""
        from doctor_chatbot import DoctorAutismChatbot
        return DoctorAutismChatbot()

    def test_chatbot_initialization(self, chatbot):
        """Test chatbot initialization"""
        assert chatbot.name == "Doctor Autism Specialist Assistant"
        assert chatbot.conversation_history == []

    def test_system_prompt(self, chatbot):
        """Test system prompt generation"""
        prompt = chatbot.system_prompt()

        assert "autism" in prompt.lower()
        assert "medical" in prompt.lower()
        assert "doctor" in prompt.lower()

    def test_clear_history(self, chatbot):
        """Test clearing conversation history"""
        chatbot.conversation_history = [
            {"user": "test", "assistant": "response", "timestamp": "2025-10-27"}
        ]

        result = chatbot.clear_history()

        assert chatbot.conversation_history == []
        assert "cleared" in result.lower()

    def test_get_memory_summary_empty(self, chatbot):
        """Test memory summary with empty history"""
        result = chatbot.get_memory_summary()

        assert "don't have any" in result.lower()

    def test_get_memory_summary_with_history(self, chatbot):
        """Test memory summary with conversation history"""
        chatbot.conversation_history = [
            {
                "user": "What is autism?",
                "assistant": "Autism is a developmental disorder...",
                "timestamp": "2025-10-27"
            }
        ]

        result = chatbot.get_memory_summary()

        assert "What is autism" in result

    @patch('doctor_chatbot.ask_chatbot')
    def test_chat_with_message(self, mock_ask, chatbot):
        """Test chat with valid message"""
        mock_ask.return_value = "This is a test response"

        result = chatbot.chat("Hello", [])

        assert result == "This is a test response"
        assert len(chatbot.conversation_history) == 1

    def test_chat_with_empty_message(self, chatbot):
        """Test chat with empty message"""
        result = chatbot.chat("", [])

        assert "ask me something" in result.lower()

    def test_chat_with_whitespace_message(self, chatbot):
        """Test chat with whitespace-only message"""
        result = chatbot.chat("   ", [])

        assert "ask me something" in result.lower()

    def test_chat_history_limit(self, chatbot):
        """Test that chat history is limited to 5 conversations"""
        with patch('doctor_chatbot.ask_chatbot') as mock_ask:
            mock_ask.return_value = "Response"

            for i in range(7):
                chatbot.chat(f"Message {i}", [])

            assert len(chatbot.conversation_history) == 5

    @patch('doctor_chatbot.ask_chatbot')
    def test_chat_with_history(self, mock_ask, chatbot):
        """Test chat with conversation history"""
        mock_ask.return_value = "Response with context"
        
        history = [
            {"user": "Previous message", "assistant": "Previous response"}
        ]

        result = chatbot.chat("New message", history)

        assert result == "Response with context"
        assert len(chatbot.conversation_history) == 1

    def test_chat_with_none_message(self, chatbot):
        """Test chat with None message"""
        result = chatbot.chat(None, [])

        assert "ask me something" in result.lower()


@pytest.mark.unit
class TestPatientChatbot:
    """Test suite for PatientAutismChatbot class"""

    @pytest.fixture
    def patient_chatbot(self):
        """Create patient chatbot instance for testing"""
        from patient_chatbot import PatientAutismChatbot
        return PatientAutismChatbot()

    def test_patient_chatbot_initialization(self, patient_chatbot):
        """Test patient chatbot initialization"""
        assert patient_chatbot.name == "Patient Autism Support Assistant"
        assert patient_chatbot.conversation_history == []

    def test_patient_system_prompt(self, patient_chatbot):
        """Test patient system prompt generation"""
        prompt = patient_chatbot.system_prompt()

        assert "autism" in prompt.lower()
        assert "patient" in prompt.lower()
        assert "support" in prompt.lower()

    @patch('patient_chatbot.ask_chatbot')
    def test_patient_chat_with_message(self, mock_ask, patient_chatbot):
        """Test patient chat with valid message"""
        mock_ask.return_value = "Patient support response"

        result = patient_chatbot.chat("I need help", [])

        assert result == "Patient support response"
        assert len(patient_chatbot.conversation_history) == 1

    def test_patient_chat_with_empty_message(self, patient_chatbot):
        """Test patient chat with empty message"""
        result = patient_chatbot.chat("", [])

        assert "ask me something" in result.lower()


@pytest.mark.unit
class TestUtilityFunctions:
    """Test suite for utility functions"""

    def test_format_patient_data(self):
        """Test patient data formatting"""
        from doctor_chatbot import format_patient_data

        patient_data = {
            'patient_id': '992',
            'patient_name': 'John Doe',
            'gender': 'Male',
            'patient_data': 'Autism spectrum disorder',
            'suggestion': 'Speech therapy'
        }

        result = format_patient_data(patient_data)

        assert 'John Doe' in result
        assert '992' in result
        assert 'Autism' in result

    def test_format_patient_data_none(self):
        """Test patient data formatting with None input"""
        from doctor_chatbot import format_patient_data

        result = format_patient_data(None)

        assert result == "No patient data available"

    def test_validate_patient_id(self):
        """Test patient ID validation"""
        from doctor_chatbot import validate_patient_id

        assert validate_patient_id('992') == True
        assert validate_patient_id('abc') == False
        assert validate_patient_id('') == False
        assert validate_patient_id(None) == False

    def test_sanitize_query(self):
        """Test query sanitization"""
        from doctor_chatbot import sanitize_query

        assert sanitize_query('  Hello World  ') == 'Hello World'
        assert sanitize_query('') == ''
        assert sanitize_query(None) == ''
        assert sanitize_query('Test\nQuery') == 'Test Query'
