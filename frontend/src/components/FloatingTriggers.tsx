import React, { useState } from 'react';
import { Phone, MessageCircle, Bot, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export const FloatingTriggers: React.FC = () => {
  // Chat Assistant Modal State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; message: string }>>([
    { role: 'model', message: "Hello! I'm your Policy Advisor AI Assistant. I can help explain tax deductions, compare term vs health insurance, or estimate your required coverage. How can I guide you today?" }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [convoId] = useState(() => `session_${Math.random().toString(36).substr(2, 9)}`);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isSending) return;

    const userMsg = inputMsg;
    setInputMsg('');
    setMessages(prev => [...prev, { role: 'user', message: userMsg }]);
    setIsSending(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userMsg,
        conversationId: convoId
      });
      setMessages(prev => [...prev, { role: 'model', message: response.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', message: "I'm having trouble connecting right now. Please call us at 9825429228 for instant guidance." }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
        {/* AI Assistant Button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-purple-500/30 hover:scale-110 transition-all duration-300 relative group"
          aria-label="Talk to AI Assistant"
          id="btn-ai-float"
        >
          <Bot className="w-7 h-7" />
          <span className="absolute right-16 scale-0 group-hover:scale-100 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md shadow-md whitespace-nowrap transition-all duration-200">
            Talk to AI Assistant
          </span>
        </button>

        {/* WhatsApp Button */}
        <a
          href="https://wa.me/919825429228?text=Hello%20Policy%20Advisor%20Advisors,%20I%20would%20like%20to%20know%20more%20about%20insurance%20options."
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/30 hover:scale-110 transition-all duration-300 relative group"
          aria-label="Chat on WhatsApp"
          id="btn-whatsapp-float"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute right-16 scale-0 group-hover:scale-100 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md shadow-md whitespace-nowrap transition-all duration-200">
            Chat on WhatsApp
          </span>
        </a>

        {/* Call Button */}
        <a
          href="tel:9825429228"
          className="w-14 h-14 bg-primary hover:bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-primary-500/30 hover:scale-110 transition-all duration-300 relative group"
          aria-label="Call Advisor"
          id="btn-call-float"
        >
          <Phone className="w-6 h-6 animate-pulse" />
          <span className="absolute right-16 scale-0 group-hover:scale-100 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md shadow-md whitespace-nowrap transition-all duration-200">
            Call +91 9825429228
          </span>
        </a>
      </div>

      {/* AI CHAT ASSISTANT SLIDE-OVER SIDEBAR */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-slate-950 text-slate-800 dark:text-white">
                <div className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-bold font-outfit text-sm">Policy Advisor AI</h3>
                    <span className="text-[10px] text-green-500 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> Online
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-white/5 border border-white/10 text-slate-800 dark:text-slate-100 rounded-tl-none'
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 text-slate-400 dark:text-slate-300 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about 80C, claims, or coverage..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                  required
                />
                <button
                  type="submit"
                  className="p-3 bg-primary hover:bg-primary-600 rounded-xl text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
