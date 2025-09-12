from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our chatbot classes
from doctor_chatbot import DoctorAutismChatbot
from patient_chatbot import AutismAwarenessBot

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize chatbots
doctor_chatbot = DoctorAutismChatbot()
patient_chatbot = AutismAwarenessBot()
user_chatbot = patient_chatbot  # Reuse the same assistant for user portal for now

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Chatbot API is running",
        "doctor_chatbot": "ready",
        "patient_chatbot": "ready"
    })

@app.route('/api/doctor/chat', methods=['POST'])
def doctor_chat():
    """Doctor chatbot endpoint"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('history', [])
        
        if not message.strip():
            return jsonify({
                "success": False,
                "error": "Message cannot be empty"
            }), 400
        
        # Get response from doctor chatbot
        response = doctor_chatbot.chat(message, history)
        
        return jsonify({
            "success": True,
            "response": response,
            "timestamp": doctor_chatbot.conversation_history[-1]["timestamp"] if doctor_chatbot.conversation_history else None
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error processing doctor chat: {str(e)}"
        }), 500

@app.route('/api/patient/chat', methods=['POST'])
def patient_chat():
    """Patient chatbot endpoint"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('history', [])
        
        if not message.strip():
            return jsonify({
                "success": False,
                "error": "Message cannot be empty"
            }), 400
        
        # Get response from patient chatbot
        response = patient_chatbot.chat(message, history)
        
        return jsonify({
            "success": True,
            "response": response
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error processing patient chat: {str(e)}"
        }), 500

@app.route('/api/user/chat', methods=['POST'])
def user_chat():
    """General user chatbot endpoint (uses the same assistant as patient for now)"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('history', [])

        if not message.strip():
            return jsonify({
                "success": False,
                "error": "Message cannot be empty"
            }), 400

        response = user_chatbot.chat(message, history)

        return jsonify({
            "success": True,
            "response": response
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error processing user chat: {str(e)}"
        }), 500

@app.route('/api/doctor/memory', methods=['GET'])
def doctor_memory():
    """Get doctor chatbot memory"""
    try:
        memory_summary = doctor_chatbot.get_memory_summary()
        return jsonify({
            "success": True,
            "memory": memory_summary
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error getting doctor memory: {str(e)}"
        }), 500

@app.route('/api/doctor/clear-memory', methods=['POST'])
def clear_doctor_memory():
    """Clear doctor chatbot memory"""
    try:
        result = doctor_chatbot.clear_history()
        return jsonify({
            "success": True,
            "message": result
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error clearing doctor memory: {str(e)}"
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Chatbot API Server...")
    print("✅ Doctor Chatbot: Ready")
    print("✅ Patient Chatbot: Ready")
    print("🌐 API Endpoints:")
    print("   - GET  /api/health")
    print("   - POST /api/doctor/chat")
    print("   - POST /api/patient/chat")
    print("   - POST /api/user/chat")
    print("   - GET  /api/doctor/memory")
    print("   - POST /api/doctor/clear-memory")
    print("\n🔧 Make sure to set your API keys in .env file:")
    print("   - GROQ_API_KEY")
    print("   - SERPER_API_KEY")
    print("   - GOOGLE_API_KEY (optional)")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
