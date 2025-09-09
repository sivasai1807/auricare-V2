import {useState, useEffect} from "react";
import {motion} from "framer-motion";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {MessageSquare, Bot, User, Send, Heart, AlertCircle} from "lucide-react";
import {chatbotApi, ChatMessage} from "@/lib/chatbotApi";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const PatientChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! Welcome to our autism awareness and support center. I'm here to provide information, resources, and support about autism spectrum disorders. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");
  const [error, setError] = useState<string | null>(null);

  const suggestions = [
    "What are the early signs of autism?",
    "What therapies are available for autism?",
    "How can I support someone with autism?",
    "What resources are available for families?",
    "Tell me about autism awareness",
    "Latest autism research",
  ];

  // Check API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        await chatbotApi.healthCheck();
        setApiStatus("connected");
        setError(null);
      } catch (err) {
        setApiStatus("error");
        setError(
          "Unable to connect to AI service. Please make sure the Python API server is running on port 5000."
        );
        console.error("API connection failed:", err);
      }
    };

    checkApiConnection();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Convert messages to the format expected by the API
      const chatHistory: ChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      const response = await chatbotApi.patientChat(input.trim(), chatHistory);

      if (response.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || "Failed to get response from AI");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to get AI response"
      );

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I'm having trouble connecting to the AI service. Please make sure the Python API server is running and try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.5}}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Autism Awareness & Support Assistant
        </h1>
        <p className="text-gray-600 mt-2">
          Get information, resources, and support about autism spectrum
          disorders
        </p>

        {/* API Status Indicator */}
        <div className="mt-4 flex justify-center">
          {apiStatus === "checking" && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Connecting to AI service...</span>
            </div>
          )}
          {apiStatus === "connected" && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm">AI service connected</span>
            </div>
          )}
          {apiStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">AI service unavailable</span>
            </div>
          )}
        </div>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5 text-green-600" />
            Your Health Companion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gradient-to-b from-green-50/50 to-blue-50/50 rounded-lg">
              {error && (
                <motion.div
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  className="flex gap-3 justify-start"
                >
                  <div className="p-2 rounded-full bg-red-100">
                    <AlertCircle className="size-4 text-red-600" />
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        message.role === "user" ? "bg-blue-100" : "bg-green-100"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="size-4 text-blue-600" />
                      ) : (
                        <Heart className="size-4 text-green-600" />
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white border shadow-sm"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  className="flex gap-3"
                >
                  <div className="p-2 rounded-full bg-green-100">
                    <Heart className="size-4 text-green-600" />
                  </div>
                  <div className="p-3 rounded-lg bg-white border shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        style={{animationDelay: "0.1s"}}
                      ></div>
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        style={{animationDelay: "0.2s"}}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your health, symptoms, or treatment..."
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="bg-white/50"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="size-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestion(suggestion)}
                  className="text-xs bg-white/50 hover:bg-white/80 border-green-200 hover:border-green-300"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <MessageSquare className="size-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">
                Personalized Care
              </h3>
              <p className="text-sm text-green-700 mt-1">
                This AI assistant has access to your health progress and can
                provide personalized guidance. However, always consult with your
                healthcare provider for medical decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PatientChatbot;
