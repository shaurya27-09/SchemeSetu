import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2, 
  HelpCircle, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { ApplicantProfile, Scheme } from '../../types';
import { Language } from '../../utils/translations';
import { APP_CONFIG } from '../../config/appConfig';

interface Message {
  id: string;
  sender: 'user' | 'mitra';
  text: string;
  timestamp: string;
}

interface SchemeMitraModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  profile?: ApplicantProfile | null;
  activeScheme?: Scheme | null;
}

export const SchemeMitraModal: React.FC<SchemeMitraModalProps> = ({
  isOpen,
  onClose,
  language,
  profile,
  activeScheme
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'mitra',
      text: language === 'hi' 
        ? "नमस्ते! मैं 'स्कीम मित्र' हूँ, सामाजिक न्याय और अधिकारिता मंत्रालय का आधिकारिक AI सलाहकार। आप मुझसे NSFDC, NBCFDC, या NSKFDC की योजनाओं, पात्रता नियमों, या आवेदन प्रक्रिया के बारे में कोई भी प्रश्न पूछ सकते हैं।"
        : "Namaste! I am 'Scheme Mitra', your official MoSJE AI guidance assistant. How can I help you navigate concessional credit schemes for NSFDC, NBCFDC, or NSKFDC today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = language === 'hi' ? [
    "महिला समृद्धि योजना में ब्याज दर और लाभ क्या हैं?",
    "सफाई कर्मचारियों के लिए क्या कोई आय सीमा है?",
    "NSFDC और NBCFDC में क्या अंतर है?",
    "लोन के लिए क्या-क्या दस्तावेज़ अनिवार्य हैं?"
  ] : [
    "What is the interest rate for NSFDC Mahila Samriddhi Yojana?",
    "Is there an income limit for Safai Karamcharis under NSKFDC?",
    "How does the 1% women entrepreneur interest rebate work?",
    "What documents do I need to prepare for an SCA branch visit?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!questionText) setInput('');
    setIsLoading(true);

    try {
      // Call server-side API proxy to keep API keys secure
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          language,
          context: {
            applicantCategory: profile?.category,
            projectCost: profile?.projectCost,
            requestedLoanAmount: profile?.requestedLoanAmount,
            state: profile?.state,
            activeSchemeName: activeScheme?.name
          }
        })
      });

      const data = await response.json();
      const botReply = data.reply || (
        language === 'hi'
          ? "माफ़ कीजिए, सर्वर से संपर्क नहीं हो पाया। कृपया अपनी इंटरनेट कनेक्टिविटी जांचें।"
          : "I apologize, unable to complete response at this moment. Please verify your connection."
      );

      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'mitra',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'mitra',
          text: language === 'hi'
            ? "नेटवर्क त्रुटि। कृपया पुनः प्रयास करें अथवा हमारे टोल-फ्री नंबर 1800-180-1551 पर संपर्क करें।"
            : "Network error. Please try again or contact the MoSJE toll-free helpline at 1800-180-1551.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-4 flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm tracking-tight text-white">Scheme Mitra AI</h3>
                <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                MoSJE Virtual Entrepreneur Advisor • Gemini Powered
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security / Deterministic Notice Banner */}
        <div className="bg-slate-100 px-4 py-2 text-[11px] text-slate-600 flex items-center justify-between border-b border-slate-200">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Answers grounded in verified MoSJE notifications</span>
          </span>
          <span className="text-slate-400 font-mono text-[10px]">Server-Side Secure</span>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'mitra' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[82%] rounded-2xl p-3.5 space-y-1 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs leading-relaxed'
              }`}>
                <div className="whitespace-pre-line">{msg.text}</div>
                <div className={`text-[10px] text-right font-mono ${
                  msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                }`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-slate-400 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Scheme Mitra is formulating guidance...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="p-3 bg-white border-t border-slate-200 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Suggested Guidance Questions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition border border-slate-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Box */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder={language === 'hi' ? "अपनी योजना या नियम के बारे में पूछें..." : "Ask about schemes, eligibility, or documents..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
