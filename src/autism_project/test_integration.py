#!/usr/bin/env python3
"""
Test script to verify the chatbot integration
This script tests both doctor and patient chatbots
"""

import os
import sys
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_doctor_chatbot():
    """Test the doctor chatbot"""
    print("🧪 Testing Doctor Chatbot...")
    print("-" * 40)
    
    try:
        from doctor_chatbot import DoctorAutismChatbot
        
        # Create chatbot instance
        doctor_chatbot = DoctorAutismChatbot()
        
        # Test queries
        test_queries = [
            "Hello Doctor!",
            "Can I get patient with id 992?",
            "What are his symptoms?",
            "What treatment do you recommend?"
        ]
        
        for i, query in enumerate(test_queries, 1):
            print(f"\n🔸 Test {i}: {query}")
            try:
                response = doctor_chatbot.chat(query, [])
                print(f"✅ Response: {response[:100]}{'...' if len(response) > 100 else ''}")
            except Exception as e:
                print(f"❌ Error: {e}")
        
        print("\n✅ Doctor chatbot test completed!")
        return True
        
    except Exception as e:
        print(f"❌ Doctor chatbot test failed: {e}")
        return False

def test_patient_chatbot():
    """Test the patient chatbot"""
    print("\n🧪 Testing Patient Chatbot...")
    print("-" * 40)
    
    try:
        from patient_chatbot import AutismAwarenessBot
        
        # Create chatbot instance
        patient_chatbot = AutismAwarenessBot()
        
        # Test queries
        test_queries = [
            "Hello!",
            "What are the early signs of autism?",
            "What therapies are available?",
            "How can I support someone with autism?"
        ]
        
        for i, query in enumerate(test_queries, 1):
            print(f"\n🔸 Test {i}: {query}")
            try:
                response = patient_chatbot.chat(query, [])
                print(f"✅ Response: {response[:100]}{'...' if len(response) > 100 else ''}")
            except Exception as e:
                print(f"❌ Error: {e}")
        
        print("\n✅ Patient chatbot test completed!")
        return True
        
    except Exception as e:
        print(f"❌ Patient chatbot test failed: {e}")
        return False

def test_api_server():
    """Test the Flask API server"""
    print("\n🧪 Testing API Server...")
    print("-" * 40)
    
    try:
        import requests
        import time
        
        # Start the server in a subprocess
        import subprocess
        import threading
        
        def start_server():
            from chatbot_api import app
            app.run(debug=False, host='0.0.0.0', port=5000, use_reloader=False)
        
        # Start server in background
        server_thread = threading.Thread(target=start_server, daemon=True)
        server_thread.start()
        
        # Wait for server to start
        print("⏳ Starting API server...")
        time.sleep(5)
        
        # Test health endpoint
        try:
            response = requests.get('http://localhost:5000/api/health', timeout=10)
            if response.status_code == 200:
                print("✅ API server is running")
                data = response.json()
                print(f"   Status: {data.get('status')}")
                print(f"   Message: {data.get('message')}")
            else:
                print(f"❌ API server returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to connect to API server: {e}")
            return False
        
        # Test doctor chat endpoint
        try:
            response = requests.post('http://localhost:5000/api/doctor/chat', 
                                   json={'message': 'Hello Doctor!', 'history': []}, 
                                   timeout=30)
            if response.status_code == 200:
                print("✅ Doctor chat endpoint working")
            else:
                print(f"❌ Doctor chat endpoint returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Doctor chat endpoint failed: {e}")
            return False
        
        # Test patient chat endpoint
        try:
            response = requests.post('http://localhost:5000/api/patient/chat', 
                                   json={'message': 'Hello!', 'history': []}, 
                                   timeout=30)
            if response.status_code == 200:
                print("✅ Patient chat endpoint working")
            else:
                print(f"❌ Patient chat endpoint returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Patient chat endpoint failed: {e}")
            return False
        
        print("\n✅ API server test completed!")
        return True
        
    except Exception as e:
        print(f"❌ API server test failed: {e}")
        return False

def main():
    """Main test function"""
    print("=" * 60)
    print("🧠 AURICARE CHATBOT INTEGRATION TEST")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists('doctor_chatbot.py'):
        print("❌ Please run this script from the autism_project directory")
        print("   cd src/autism_project")
        print("   python test_integration.py")
        return
    
    # Check environment variables
    required_keys = ['GROQ_API_KEY', 'SERPER_API_KEY']
    missing_keys = []
    
    for key in required_keys:
        if not os.getenv(key) or os.getenv(key).startswith('your_'):
            missing_keys.append(key)
    
    if missing_keys:
        print("❌ Missing or invalid environment variables:")
        for key in missing_keys:
            print(f"   - {key}")
        print("Please update your .env file with actual API keys")
        return
    
    print("✅ Environment variables look good")
    
    # Run tests
    tests = [
        ("Doctor Chatbot", test_doctor_chatbot),
        ("Patient Chatbot", test_patient_chatbot),
        ("API Server", test_api_server)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*60}")
        print(f"Running {test_name} Test...")
        print('='*60)
        
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! The chatbot integration is working correctly.")
        print("\nNext steps:")
        print("1. Start the API server: python start_api.py")
        print("2. Start the React app: npm run dev")
        print("3. Test the chatbots in the browser")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please check the errors above.")
        print("\nTroubleshooting:")
        print("1. Make sure all API keys are set correctly")
        print("2. Install all requirements: pip install -r requirements.txt")
        print("3. Check that all required files are present")

if __name__ == "__main__":
    main()
