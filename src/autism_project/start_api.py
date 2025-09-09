#!/usr/bin/env python3
"""
Startup script for Auricare Chatbot API Server
This script checks for required files and starts the Flask API server
"""

import os

def check_requirements():
    """Check if all required files exist"""
    required_files = [
        'doctor_chatbot.py',
        'patient_chatbot.py',
        'chatbot_api.py',
        'autism_data.csv',
        'Auticare_chatbot_comprehensivepdf.pdf'
    ]
    
    missing_files = [file for file in required_files if not os.path.exists(file)]
    
    if missing_files:
        print("❌ Missing required files:")
        for file in missing_files:
            print(f"   - {file}")
        return False
    
    print("✅ All required files found")
    return True

def check_env_file():
    """Check if .env file exists and has required keys"""
    if not os.path.exists('.env'):
        print("❌ .env file not found!")
        print("Please create a .env file with the following content:")
        print("GROQ_API_KEY=your_groq_api_key_here")
        print("SERPER_API_KEY=your_serper_api_key_here")
        print("GOOGLE_API_KEY=your_google_api_key_here  # Optional")
        return False
    
    with open('.env', 'r') as f:
        content = f.read()
    
    required_keys = ['GROQ_API_KEY', 'SERPER_API_KEY']
    missing_keys = []
    
    for key in required_keys:
        if f"{key}=" not in content or f"{key}=your_" in content:
            missing_keys.append(key)
    
    if missing_keys:
        print("⚠️  .env file has placeholder values for:")
        for key in missing_keys:
            print(f"   - {key}")
        print("⚠️  Server will start but some features may not work without real API keys")
        print("⚠️  Please update your .env file with actual API keys for full functionality")
        # Allow server to start even with placeholder values for testing
        return True
    
    print("✅ .env file looks good")
    return True

def start_server():
    """Start the Flask API server"""
    print("🚀 Starting Flask API server...")
    try:
        from chatbot_api import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return False

def main():
    """Main function"""
    print("=" * 60)
    print("🧠 AURICARE CHATBOT API SERVER")
    print("=" * 60)
    
    if not os.path.exists('chatbot_api.py'):
        print("❌ Please run this script from the autism_project directory")
        print("   cd src/autism_project")
        print("   python start_api.py")
        return
    
    if not check_requirements():
        return
    
    if not check_env_file():
        return
    
    print("\n" + "=" * 60)
    print("🎉 All checks passed! Starting the API server...")
    print("=" * 60)
    print("🌐 API will be available at: http://localhost:5000")
    print("📚 API Documentation:")
    print("   - GET  /api/health")
    print("   - POST /api/doctor/chat")
    print("   - POST /api/patient/chat")
    print("   - GET  /api/doctor/memory")
    print("   - POST /api/doctor/clear-memory")
    print("\n💡 Make sure your React app is running on port 3000")
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 60)
    
    start_server()

if __name__ == "__main__":
    main()
