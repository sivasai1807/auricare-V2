from dotenv import load_dotenv
import json
import os
import requests
from pypdf import PdfReader
from groq import Groq
import traceback
from typing import List, Dict

load_dotenv(override=True)

SERPER_API_KEY = os.getenv("SERPER_API_KEY")

def init_clients():
    groq_client = None
    gemini_client = None
    try:
        groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    except Exception as e:
        print("Error initializing Groq:", e)
    try:
        # Try import Gemini client, skip if not available
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        # Use a fast, widely available model
        gemini_client = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print("Error initializing Gemini:", e)
    return groq_client, gemini_client

groq_client, gemini_client = init_clients()

def serper_search(query):
    if not SERPER_API_KEY:
        return "Search API not available."
    url = "https://google.serper.dev/search"
    headers = {"X-API-KEY": SERPER_API_KEY}
    payload = {"q": query}
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            snippet = data.get("organic", [{}])[0].get("snippet", "")
            return snippet or "No relevant information found."
        else:
            return f"Search API error: {response.status_code}"
    except Exception as e:
        return f"Search API exception: {str(e)}"

class AutismAwarenessBot:
    def __init__(self):
        self.name = "Autism Awareness Assistant"
        self.history = []  # list of [user_msg, bot_msg]

        self.autism_knowledge = ""
        try:
            reader = PdfReader("Auticare_chatbot_comprehensivepdf.pdf")
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    self.autism_knowledge += text
        except Exception as e:
            print("Error reading Autism PDF:", e)
            self.autism_knowledge = ""

    def _fallback_answer_from_pdf(self, query: str) -> str:
        """Return a simple answer by extracting relevant sentences from the PDF text
        when external LLMs are unavailable.
        """
        if not self.autism_knowledge:
            return "I'm currently unable to access my knowledge base. Please try again later."

        # Basic keyword matching
        query_terms = [t.strip().lower() for t in query.split() if len(t) > 3]
        sentences = [s.strip() for s in self.autism_knowledge.split(". ") if s.strip()]

        scored: List[tuple[int, str]] = []
        for sent in sentences:
            lower = sent.lower()
            score = sum(1 for t in query_terms if t in lower)
            if score:
                scored.append((score, sent))

        if not scored:
            return (
                "I couldn't find specific details in my local knowledge. "
                "Please try rephrasing your question about autism, therapies, symptoms, or support."
            )

        # Sort by score descending and pick top few concise sentences
        scored.sort(key=lambda x: x[0], reverse=True)
        top_sentences = [s for _, s in scored[:5]]
        answer = " ".join(top_sentences)
        # Trim to keep response compact
        max_chars = 900
        if len(answer) > max_chars:
            answer = answer[:max_chars].rsplit(" ", 1)[0] + "…"
        return (
            f"Here is information from my autism knowledge base: {answer}\n\n"
            "For personalized support, please consult autism specialists or local support organizations."
        )

    def system_prompt(self):
        prompt = (
            f"You are {self.name}, a compassionate and knowledgeable assistant specializing in autism awareness and support.\n\n"
            f"Instructions:\n"
            f"- For the first message, say: \"Hello! Welcome to our autism awareness and support center. I'm here to provide information, resources, and support about autism spectrum disorders. How can I help you today?\"\n"
            f"- PRIMARILY focus on topics related to:\n"
            f"  * Autism spectrum disorders (ASD)\n"
            f"  * Early signs and symptoms of autism\n"
            f"  * Autism diagnosis and assessment\n"
            f"  * Therapies and interventions for autism\n"
            f"  * Supporting individuals with autism\n"
            f"  * Autism awareness and acceptance\n"
            f"  * Resources for families and caregivers\n"
            f"  * Educational strategies for autism\n"
            f"  * Daily living skills and independence\n"
            f"  * Sensory processing and autism\n"
            f"- Use the autism knowledge from the PDF document as your primary source of information\n"
            f"- Be empathetic, understanding, and non-judgmental in all responses\n"
            f"- For current research, statistics, or recent developments in autism, mention you can look up the latest information\n"
            f"- If asked about non-autism topics, gently redirect: \"While I focus on autism awareness and support, I'd be happy to help with any autism-related questions you might have.\"\n"
            f"- Always provide supportive and encouraging responses\n"
            f"- End autism-related advice with: \"For personalized support and resources, consider consulting with autism specialists or local support organizations.\"\n"
            f"- Be respectful of neurodiversity and avoid language that suggests autism needs to be 'cured' or 'fixed'\n\n"
            f"Autism Knowledge Base: {self.autism_knowledge}..."
        )
        return prompt

    def chat(self, message, history):
        if history is None:
            history = []

        # Build messages for LLM call
        messages = [{"role": "system", "content": self.system_prompt()}]
        
        # Add previous conversation history
        for msg in history:
            if msg["role"] == "user":
                messages.append({"role": "user", "content": msg["content"]})
            else:
                messages.append({"role": "assistant", "content": msg["content"]})
        
        # Add current user message
        messages.append({"role": "user", "content": message})

        content = None
        # 1) Try Groq with a list of candidate models (handles deprecations automatically)
        groq_model_candidates: List[str] = [
            "llama-3.2-11b-text",           # recent llama 3.2 text model
            "llama-3.1-8b-instant",         # smaller/faster
            "llama-3.1-70b-versatile",      # larger instruct
            "mixtral-8x7b-32768",           # Mixtral
            "gemma2-9b-it",                 # Gemma instruct
        ]

        if groq_client:
            for model_name in groq_model_candidates:
                try:
                    response = groq_client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                    )
                    content = response.choices[0].message.content.strip()
                    # Stop at first success
                    break
                except Exception as groq_err:
                    print(f"Groq model failed ({model_name}):", groq_err)
                    continue

        # 2) Fallback to Gemini if Groq unavailable or all candidates failed
        if not content:
            try:
                if gemini_client:
                    # Convert OpenAI-style messages to a single prompt
                    joined_messages = []
                    for msg in messages:
                        role = msg.get("role", "user")
                        text = msg.get("content", "")
                        prefix = "System:" if role == "system" else ("User:" if role == "user" else "Assistant:")
                        joined_messages.append(f"{prefix} {text}")
                    prompt_text = "\n\n".join(joined_messages)

                    gemini_response = gemini_client.generate_content(prompt_text)
                    # google-generativeai returns a text property for convenience
                    content = getattr(gemini_response, "text", None)
                    if not content and hasattr(gemini_response, "candidates"):
                        # Fallback extraction
                        try:
                            content = gemini_response.candidates[0].content.parts[0].text
                        except Exception:
                            content = None
                else:
                    print("Gemini client not initialized")
            except Exception as e2:
                print("Gemini error:", e2)
                print(traceback.format_exc())

        if not content:
            # Final local fallback using PDF content
            content = self._fallback_answer_from_pdf(message)

        # If the question seems autism-related and requires current information, try search
        autism_current_keywords = ['latest autism research', 'recent autism studies', 'current autism statistics', 
                                 'new autism therapies', 'autism news', 'recent developments']
        if any(keyword in message.lower() for keyword in autism_current_keywords):
            search_result = serper_search(f"autism {message}")
            if search_result and "No relevant information found" not in search_result and "Search API" not in search_result:
                content += f"\n\nHere's some current information I found about autism:\n{search_result}"

        return content

# -----------------------------
# Main Execution
# -----------------------------
if __name__ == "__main__":
    print("🚀 Patient Autism Chatbot is ready!")
    print("✅ Features: PDF Knowledge Base + Serper Search + Groq AI")
    
    # Create the autism awareness bot instance
    autism_bot = AutismAwarenessBot()
    
    # Interactive chat loop
    print("\n" + "="*50)
    print("Autism Awareness & Support Assistant")
    print("Type 'quit' to exit")
    print("="*50)
    
    while True:
        try:
            user_input = input("\n👤 You: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("👋 Take care! Remember, you're not alone in this journey.")
                break
            elif not user_input:
                continue
            
            response = autism_bot.chat(user_input, [])
            print(f"🤖 Assistant: {response}")
            
        except KeyboardInterrupt:
            print("\n👋 Take care! Remember, you're not alone in this journey.")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            continue
