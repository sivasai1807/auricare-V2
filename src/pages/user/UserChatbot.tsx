import {useEffect, useState} from "react";
import {motion} from "framer-motion";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {MessageSquare, Bot, User, Send} from "lucide-react";
import {chatbotApi} from "@/lib/chatbotApi";
import {useTranslation} from "react-i18next";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const UserChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI Health Assistant. How can I help you today? I can provide general health information, answer questions about symptoms, or help you prepare for your appointments.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiOk, setApiOk] = useState<"checking" | "ok" | "error">("checking");
  const {t} = useTranslation();

  useEffect(() => {
    chatbotApi
      .healthCheck()
      .then(() => setApiOk("ok"))
      .catch(() => setApiOk("error"));
  }, []);

  const suggestions = [
    "What should I do for a headache?",
    "How to prepare for a doctor visit?",
    "Common cold symptoms",
    "When to seek emergency care?",
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }));
      const resp = await chatbotApi.userChat(
        userMessage.content,
        history as any
      );
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: resp.success
          ? resp.response
          : (resp as any).error || "Sorry, I could not respond.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I am having trouble reaching the AI service right now. Please try again shortly.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
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
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t("nav.aiAssistant")}
        </h1>
        <p className="text-gray-600 mt-2">{t("headings.userSubtitle")}</p>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5 text-purple-600" />
            {t("nav.aiAssistant")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50/50 rounded-lg">
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
                        message.role === "user"
                          ? "bg-blue-100"
                          : "bg-purple-100"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="size-4 text-blue-600" />
                      ) : (
                        <Bot className="size-4 text-purple-600" />
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
                  <div className="p-2 rounded-full bg-purple-100">
                    <Bot className="size-4 text-purple-600" />
                  </div>
                  <div className="p-3 rounded-lg bg-white border shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{animationDelay: "0.1s"}}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
                placeholder="Ask about symptoms, treatments, or health advice..."
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="bg-white/50"
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()}>
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
                  className="text-xs bg-white/50 hover:bg-white/80"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <MessageSquare className="size-4 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800">
                Important Disclaimer
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                This AI assistant provides general health information only and
                is not a substitute for professional medical advice, diagnosis,
                or treatment. Always consult with qualified healthcare providers
                for medical concerns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserChatbot;
