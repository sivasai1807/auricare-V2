# Auricare Chatbot Integration

This folder contains the integrated chatbot system for both doctor and patient sides of the Auricare application.

## Files Overview

### Core Files

- `doctor_chatbot.py` - Complete doctor-side chatbot implementation
- `patient_chatbot.py` - Complete patient-side chatbot implementation
- `testing2.ipynb` - Jupyter notebook with integrated code for both chatbots
- `requirements.txt` - Python dependencies

### Data Files

- `Auticare_chatbot_comprehensivepdf.pdf` - Medical knowledge base (keep as is)
- `autism_data.csv` - Patient database (keep as is)

## Features

### Doctor Chatbot

- **Patient Database Access**: Search patients by ID, name, or condition
- **PDF Knowledge Base**: Medical knowledge from comprehensive PDF
- **Conversation Memory**: Remembers last 5 conversations
- **LangGraph Integration**: Advanced query routing and processing
- **Medical Insights**: Provides treatment recommendations and medical guidance

### Patient Chatbot

- **PDF Knowledge Base**: Autism awareness and support information
- **Serper Search**: Current research and news integration
- **Compassionate Responses**: Empathetic and supportive communication
- **Resource Guidance**: Information about therapies, support, and resources

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root with:

```
GROQ_API_KEY=your_groq_api_key_here
SERPER_API_KEY=your_serper_api_key_here
GOOGLE_API_KEY=your_google_api_key_here  # Optional
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Chatbots

#### Doctor Chatbot

```python
from doctor_chatbot import DoctorAutismChatbot

# Create instance
doctor_chatbot = DoctorAutismChatbot()

# Chat with the bot
response = doctor_chatbot.chat("Can I get patient with id 992?", [])
print(response)
```

#### Patient Chatbot

```python
from patient_chatbot import AutismAwarenessBot

# Create instance
patient_chatbot = AutismAwarenessBot()

# Chat with the bot
response = patient_chatbot.chat("What are the early signs of autism?", [])
print(response)
```

#### Jupyter Notebook

Run the `testing2.ipynb` notebook to test both chatbots interactively.

## API Keys Required

1. **Groq API**: Get from https://console.groq.com/
2. **Serper API**: Get from https://serper.dev/
3. **Google API** (Optional): For Gemini fallback

## Integration with React App

The chatbot classes can be integrated with the React frontend by:

1. Creating API endpoints that call the Python chatbot functions
2. Using the chatbot classes in the existing `DoctorChatbot.tsx` and `PatientChatbot.tsx` components
3. The chatbots return string responses that can be displayed in the UI

## Usage Examples

### Doctor Chatbot

```python
# Get patient information
response = doctor_chatbot.chat("Show me patient John", [])

# Ask about symptoms
response = doctor_chatbot.chat("What are his symptoms?", [])

# Get treatment recommendations
response = doctor_chatbot.chat("What treatment do you recommend?", [])
```

### Patient Chatbot

```python
# Get information about autism
response = patient_chatbot.chat("What are the early signs of autism?", [])

# Ask about therapies
response = patient_chatbot.chat("What therapies are available?", [])

# Get support information
response = patient_chatbot.chat("How can I support someone with autism?", [])
```

## Notes

- Both chatbots use the same PDF knowledge base
- Doctor chatbot has access to patient database (CSV)
- Patient chatbot has access to current information via Serper search
- Both maintain conversation history for context
- The system is designed to be integrated with the existing React frontend
