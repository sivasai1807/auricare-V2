# Auricare Chatbot Setup Guide

This guide will help you set up and run the integrated chatbot system for both doctor and patient sides.

## Prerequisites

1. **Python 3.8+** installed on your system
2. **Node.js 16+** and npm/yarn for the React frontend
3. **API Keys** for Groq and Serper (see below)

## Step 1: Get API Keys

### Required API Keys

1. **Groq API Key** (Required)

   - Go to https://console.groq.com/
   - Sign up/Login
   - Create a new API key
   - Copy the key

2. **Serper API Key** (Required)

   - Go to https://serper.dev/
   - Sign up/Login
   - Get your API key
   - Copy the key

3. **Google API Key** (Optional - for Gemini fallback)
   - Go to https://console.cloud.google.com/
   - Enable Gemini API
   - Create credentials
   - Copy the key

## Step 2: Set Up Environment Variables

Create a `.env` file in the `src/autism_project` directory:

```bash
# Navigate to the autism_project directory
cd src/autism_project

# Create .env file
touch .env
```

Add your API keys to the `.env` file:

```env
GROQ_API_KEY=your_actual_groq_api_key_here
SERPER_API_KEY=your_actual_serper_api_key_here
GOOGLE_API_KEY=your_actual_google_api_key_here
```

## Step 3: Install Python Dependencies

```bash
# Make sure you're in the autism_project directory
cd src/autism_project

# Install Python dependencies
pip install -r requirements.txt
```

## Step 4: Start the Python API Server

### Option 1: Using the startup script (Recommended)

```bash
python start_api.py
```

This script will:

- Check for required files
- Verify your .env file
- Install dependencies
- Start the Flask API server

### Option 2: Manual start

```bash
python chatbot_api.py
```

The API server will start on `http://localhost:5000`

## Step 5: Start the React Frontend

Open a new terminal and navigate to the project root:

```bash
# Navigate to project root
cd ../../

# Install frontend dependencies (if not already done)
npm install

# Start the React development server
npm run dev
```

The React app will start on `http://localhost:3000`

## Step 6: Test the Integration

1. **Open your browser** and go to `http://localhost:3000`
2. **Login as a Doctor** and navigate to the chatbot page
3. **Login as a Patient** and navigate to the chatbot page
4. **Test the chatbots** with the suggested prompts

### Doctor Chatbot Test Queries:

- "Can I get patient with id 992?"
- "What are autism symptoms?"
- "Show me patients with ADHD"
- "What treatment do you recommend?"

### Patient Chatbot Test Queries:

- "What are the early signs of autism?"
- "What therapies are available for autism?"
- "How can I support someone with autism?"
- "What resources are available for families?"

## Troubleshooting

### Common Issues

1. **"AI service unavailable" error**

   - Make sure the Python API server is running on port 5000
   - Check that your API keys are correctly set in the .env file
   - Verify that the required files (CSV, PDF) are in the autism_project directory

2. **"Failed to get AI response" error**

   - Check your internet connection
   - Verify your API keys are valid and have sufficient credits
   - Check the Python server logs for detailed error messages

3. **Import errors in Python**

   - Make sure you're in the correct directory (src/autism_project)
   - Install all requirements: `pip install -r requirements.txt`
   - Check Python version (3.8+ required)

4. **CORS errors in browser**
   - Make sure the Flask server is running with CORS enabled
   - Check that the API URL in the React app matches the server URL

### Checking API Status

Visit `http://localhost:5000/api/health` in your browser to check if the API is running.

Expected response:

```json
{
  "status": "healthy",
  "message": "Chatbot API is running",
  "doctor_chatbot": "ready",
  "patient_chatbot": "ready"
}
```

## File Structure

```
src/autism_project/
├── doctor_chatbot.py          # Doctor chatbot implementation
├── patient_chatbot.py         # Patient chatbot implementation
├── chatbot_api.py             # Flask API server
├── start_api.py               # Startup script
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (create this)
├── autism_data.csv            # Patient database
├── Auticare_chatbot_comprehensivepdf.pdf  # Medical knowledge base
└── testing2.ipynb            # Jupyter notebook with integrated code
```

## Features

### Doctor Chatbot

- ✅ Patient database access (CSV)
- ✅ PDF knowledge base integration
- ✅ Conversation memory
- ✅ Medical insights and treatment recommendations
- ✅ LangGraph-powered query routing

### Patient Chatbot

- ✅ PDF knowledge base for autism awareness
- ✅ Serper search for current information
- ✅ Compassionate and supportive responses
- ✅ Resource guidance and support information

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/doctor/chat` - Doctor chatbot chat
- `POST /api/patient/chat` - Patient chatbot chat
- `GET /api/doctor/memory` - Get doctor chatbot memory
- `POST /api/doctor/clear-memory` - Clear doctor chatbot memory

## Support

If you encounter any issues:

1. Check the Python server logs for error messages
2. Verify all API keys are correctly set
3. Ensure all required files are present
4. Check that both servers (Python API and React) are running
5. Test the API endpoints directly using curl or Postman

## Next Steps

Once everything is working:

1. The chatbots will have access to the patient database and PDF knowledge base
2. Doctor chatbot can search patients by ID, name, or condition
3. Patient chatbot provides autism awareness and support information
4. Both chatbots maintain conversation context
5. The system is ready for production deployment
