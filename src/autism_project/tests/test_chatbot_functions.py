"""
Unit tests for chatbot helper functions
"""
import pytest
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest.mock import Mock, patch, MagicMock
import pandas as pd


class TestPatientDataRetrieval:
    """Test suite for patient data retrieval functions"""

    @pytest.fixture
    def mock_csv_data(self):
        """Create mock CSV data for testing"""
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

    def test_search_by_id_exact_match(self, mock_csv_data):
        """Test searching patient by exact ID match"""
        from doctor_chatbot import search_by_id

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = search_by_id('992')

            assert result is not None
            assert result['patient_id'] == '992'
            assert result['patient_name'] == 'John Doe'

    def test_search_by_id_not_found(self, mock_csv_data):
        """Test searching for non-existent patient ID"""
        from doctor_chatbot import search_by_id

        with patch('doctor_chatbot.csv_data', mock_csv_data):
            result = search_by_id('999')

            assert result is None

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

    def test_chat_history_limit(self, chatbot):
        """Test that chat history is limited to 5 conversations"""
        with patch('doctor_chatbot.ask_chatbot') as mock_ask:
            mock_ask.return_value = "Response"

            for i in range(7):
                chatbot.chat(f"Message {i}", [])

            assert len(chatbot.conversation_history) == 5
