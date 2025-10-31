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
        # Use a supported model identifier compatible with current API versions
        # "gemini-1.5-flash-latest" resolves to a valid, supported variant
        gemini_client = genai.GenerativeModel("gemini-1.5-flash-latest")
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
                    # Normalize whitespace to prevent broken line-by-line output
                    normalized = " ".join(text.split())
                    self.autism_knowledge += (" " + normalized)
        except Exception as e:
            print("Error reading Autism PDF:", e)
            self.autism_knowledge = ""

    def _fallback_answer_from_pdf(self, query: str) -> str:
        """Return a simple answer by extracting relevant sentences from the PDF text
        when external LLMs are unavailable.
        """
        if not self.autism_knowledge:
            return "I'm currently unable to access my knowledge base. Please try again later."

        # Basic keyword matching with prioritization for symptom/early-sign queries
        query_terms = [t.strip().lower() for t in query.split() if len(t) > 3]
        sentences = [s.strip() for s in self.autism_knowledge.split(". ") if s.strip()]

        # Remove boilerplate/disclaimer sentences and overly long lines
        boilerplate_markers = [
            "Autism Spectrum Disorder: A Comprehensive Knowledge Base",
            "Important Disclaimer for Caregivers and Medical Practitioners",
        ]
        filtered_sentences: List[str] = []
        for s in sentences:
            if any(marker.lower() in s.lower() for marker in boilerplate_markers):
                continue
            if len(s) > 300:
                continue
            filtered_sentences.append(s)
        sentences = filtered_sentences or sentences

        # If the user asks about early signs or symptoms, prioritize such sentences
        symptom_focus_terms = [
            "early sign", "early signs", "signs of autism", "symptom", "symptoms",
            "behaviour", "behavior", "developmental", "milestones", "screening"
        ]
        prioritize_symptoms = any(term in (query or "").lower() for term in symptom_focus_terms)

        scored: List[tuple[int, str]] = []
        for sent in sentences:
            lower = sent.lower()
            score = sum(1 for t in query_terms if t in lower)
            if prioritize_symptoms and ("symptom" in lower or "sign" in lower):
                score += 2  # boost relevant sentences
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
        # Concise fallback without repeating boilerplate headers
        cleaned = answer
        long_header = "Autism Spectrum Disorder: A Comprehensive Knowledge Base"
        if cleaned.startswith(long_header):
            cleaned = cleaned[len(long_header):].lstrip(" :\n")
        # Remove any lingering boilerplate markers
        for marker in [long_header, "Important Disclaimer for Caregivers and Medical Practitioners"]:
            cleaned = cleaned.replace(marker, "").strip()
        return f"{cleaned}\n\nFor personalized support, please consult autism specialists or local support organizations."

    def _answer_from_pdf_scored(self, query: str):
        """Return (answer, score) where score is based on keyword hits; higher is better."""
        if not self.autism_knowledge:
            return None, 0
        query_terms = [t.strip().lower() for t in query.split() if len(t) > 3]
        sentences = [s.strip() for s in self.autism_knowledge.split(". ") if s.strip()]
        scored: List[tuple[int, str]] = []
        for sent in sentences:
            lower = sent.lower()
            score = sum(1 for t in query_terms if t in lower)
            if score:
                scored.append((score, sent))
        if not scored:
            return None, 0
        scored.sort(key=lambda x: x[0], reverse=True)
        top = [s for _, s in scored[:5]]
        answer = " ".join(top)
        # Trim
        max_chars = 800
        if len(answer) > max_chars:
            answer = answer[:max_chars].rsplit(" ", 1)[0] + "…"
        return answer, sum(score for score, _ in scored[:3])

    def system_prompt(self):
        # Keep system prompt concise to avoid token overuse; do not inline the entire PDF
        prompt = (
            f"You are {self.name}, an Autism Advisor: warm, concise, and evidence-informed.\n"
            f"Goals: explain autism clearly, suggest practical next steps, and point to resources.\n\n"
            f"Style:\n"
            f"- Friendly and encouraging.\n"
            f"- Keep answers short; use bullet points when helpful.\n"
            f"- If user greets you, reply briefly with 3 suggested follow-ups.\n\n"
            f"Scope:\n"
            f"- Early signs, diagnosis, therapies, school/home support, resources.\n\n"
            f"Use concise, evidence-informed guidance. If you lack specific details, say so briefly."
        )
        return prompt

    def chat(self, message, history):
        if history is None:
            history = []

        # Greeting / small-talk fast path
        msg_lower = (message or "").strip().lower()
        greetings = {"hi", "hello", "hey", "hai", "hola"}
        if msg_lower in greetings or msg_lower.startswith("hi ") or msg_lower.startswith("hello "):
            return (
                "Hi! I’m your Autism Advisor. How can I help today?\n"
                "- Early signs of autism\n- Evidence‑based therapies\n- Support at home and school"
            )

        # Identity/ability queries fast path
        identity_phrases = [
            "who are you", "what are you", "what is this", "what can you do",
            "your name", "who r u"
        ]
        if any(phrase in msg_lower for phrase in identity_phrases):
            return (
                "I’m your Autism Advisor — a supportive assistant that explains autism clearly and suggests practical next steps. "
                "Ask me about early signs, therapies, school support, or daily strategies."
            )

        # First try: PDF retrieval answer; if strong enough, use it directly
        pdf_answer, pdf_score = self._answer_from_pdf_scored(message)
        # Lower threshold so common questions like early signs/symptoms answer directly from PDF
        if pdf_answer and pdf_score >= 2:
            content = pdf_answer
        else:
            content = None

        # Build compact messages for LLM call (only if PDF was weak)
        messages = [{"role": "system", "content": self.system_prompt()}]
        # Keep only the last few turns to stay under token limits
        trimmed_history = history[-4:] if isinstance(history, list) else []
        for msg in trimmed_history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            # Hard truncate long history entries
            if len(content) > 1200:
                content = content[:1200] + "…"
            messages.append({"role": role, "content": content})
        # Add current user message (truncate if excessively long)
        user_msg = message if len(message) <= 2000 else (message[:2000] + "…")
        messages.append({"role": "user", "content": user_msg})

        # 1) Try Groq with fallbacks and conservative token usage
        if not content and groq_client:
            groq_models = [
                "llama-3.1-8b-instant",
                "llama-3.3-70b-versatile",
            ]
            for mdl in groq_models:
                try:
                    response = groq_client.chat.completions.create(
                        model=mdl,
                        messages=messages,
                        max_tokens=512,
                    )
                    content = response.choices[0].message.content.strip()
                    break
                except Exception as groq_err:
                    print(f"Groq model failed ({mdl}):", groq_err)
                    content = None

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
                    # Truncate to stay within input limits
                    if len(prompt_text) > 12000:
                        prompt_text = prompt_text[-12000:]

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
                # Append concise current info once
                content += f"\n\nCurrent info: {search_result}"

        # Normalize: remove obvious duplicated boilerplate chunks
        try:
            content = content.strip()
            # Collapse duplicate long titles if present
            long_header = "Autism Spectrum Disorder: A Comprehensive Knowledge Base"
            while content.count(long_header) > 1:
                first = content.find(long_header)
                second = content.find(long_header, first + 1)
                content = content[:second] + content[second + len(long_header):]
            # If the model echoed the long header at the beginning, drop it once
            if content.startswith(long_header):
                content = content[len(long_header):].lstrip(" :\n")
            # Strip disclaimers/boilerplate anywhere
            for marker in [long_header, "Important Disclaimer for Caregivers and Medical Practitioners"]:
                content = content.replace(marker, "")
            content = content.strip()
        except Exception:
            pass

        # Guard: if the model echoed the user query (or returned an empty/near-empty string),
        # replace with a concise PDF-based answer to avoid parroting in the UI.
        try:
            user_clean = (message or "").strip().lower()
            bot_clean = (content or "").strip().lower()
            if (
                not bot_clean
                or bot_clean == user_clean
                or bot_clean.endswith(": " + user_clean)
                or bot_clean.startswith("patientbot:")
                or bot_clean.startswith("assistant:")
            ):
                fallback = self._fallback_answer_from_pdf(message)
                if fallback:
                    content = fallback
                else:
                    content = (
                        "I didn't find details to answer that directly. Try asking about early signs, therapies, "
                        "or support at home and school."
                    )
        except Exception:
            pass

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
