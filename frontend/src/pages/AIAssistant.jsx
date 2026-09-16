import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const formatMarkdown = (text) => {
  if (!text) return { __html: '' };
  // Convert **text** to <strong>text</strong>
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Convert *text* to <em>text</em>
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Convert - item to <li>item</li>
  formatted = formatted.replace(/^- (.*)$/gm, '<li class="ml-4 list-disc">$1</li>');
  // Convert \n to <br/>
  formatted = formatted.replace(/\n/g, '<br/>');
  return { __html: formatted };
};

const TypewriterMarkdown = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 3)); // Type in chunks of 3 for speed
        i += 3;
      } else {
        setDisplayedText(text);
        setIsTyping(false);
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 15); // Very fast typing

    return () => clearInterval(interval);
  }, [text, onComplete]);

  return (
    <div className="relative">
      <div dangerouslySetInnerHTML={formatMarkdown(displayedText)} />
      {isTyping && <span className="inline-block w-2 h-4 bg-primary-500 animate-pulse ml-1 align-middle"></span>}
    </div>
  );
};

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState('Analyzing data...');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      const hist = res.data.data;
      const formatted = [];
      hist.forEach(chat => {
        formatted.push({ text: chat.message, sender: 'user' });
        formatted.push({ text: chat.response, sender: 'ai', provider: chat.provider, isHistory: true });
      });
      setMessages(formatted);
    } catch (error) {
      toast.error('Failed to load chat history');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingState]);

  const loadingStates = ['Accessing database...', 'Analyzing inventory metrics...', 'Running prediction models...', 'Formulating response...'];

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setLoading(true);
    setLoadingState(loadingStates[0]);

    let stateIndex = 0;
    const stateInterval = setInterval(() => {
      stateIndex = (stateIndex + 1) % loadingStates.length;
      setLoadingState(loadingStates[stateIndex]);
    }, 800);

    try {
      const res = await api.post('/ai/chat', { message: userMessage });
      const { response, provider } = res.data.data;
      clearInterval(stateInterval);
      setMessages(prev => [...prev, { text: response, sender: 'ai', provider, isHistory: false }]);
    } catch (error) {
      clearInterval(stateInterval);
      toast.error('AI Failed to respond');
      setMessages(prev => [...prev, { text: 'Sorry, I encountered an error checking the database.', sender: 'ai', provider: 'error', isHistory: false }]);
    } finally {
      setLoading(false);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full gap-6 relative">
      
      {/* Side Navigation Panel */}
      <div className="hidden lg:flex w-64 flex-col gap-4">
        <div className="glass dark:bg-gray-800/80 p-5 rounded-2xl shadow-lg shadow-blue-900/5 border border-white/20 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="font-bold flex items-center gap-2 mb-4 relative z-10"><Sparkles size={18} className="text-primary-500"/> Copilot Actions</h3>
          <div className="space-y-2 relative z-10">
            <button onClick={() => setInput("Generate a comprehensive summary of our low stock items and suggest purchase orders.")} className="w-full text-left p-3 text-sm font-medium bg-white/50 dark:bg-gray-900/50 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
              ⚡ Comprehensive Report
            </button>
            <button onClick={() => setInput("Identify the most profitable product category.")} className="w-full text-left p-3 text-sm font-medium bg-white/50 dark:bg-gray-900/50 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
              💰 Profitability Analysis
            </button>
            <button onClick={() => setInput("What was our top selling product last week?")} className="w-full text-left p-3 text-sm font-medium bg-white/50 dark:bg-gray-900/50 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
              📈 Sales Trends
            </button>
          </div>
        </div>

        <div className="glass dark:bg-gray-800/80 p-5 rounded-2xl shadow-lg border border-white/20 dark:border-white/5 flex-1 flex flex-col justify-end">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            <p className="mb-2 uppercase font-bold tracking-wider">System Status</p>
            <div className="flex items-center justify-between mb-1">
              <span>ML Engine</span> <span className="text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Gemini Vision</span> <span className="text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass dark:bg-gray-800/80 rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden border border-white/20 dark:border-white/5 relative">
        
        {/* Background Decorative Blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <div className="p-5 border-b border-white/20 dark:border-white/5 flex items-center justify-between z-10 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-900 to-black dark:from-white dark:to-gray-200 flex items-center justify-center text-white dark:text-black shadow-lg">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                StockFlow Intelligence
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Powered by Gemini AI Enterprise</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            Online
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 z-10 custom-scrollbar">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center mt-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mb-6 shadow-2xl border border-white/50 dark:border-gray-700">
                <Bot size={48} className="text-gray-900 dark:text-white" />
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">How can I help you manage?</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10 text-lg">Ask me to analyze your inventory, predict shortages, or generate financial reports.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                <button onClick={() => setInput("Show me all products that are currently critically low in stock.")} className="p-4 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 rounded-2xl border border-gray-200/50 dark:border-gray-700 text-sm font-medium transition-all shadow-sm hover:shadow-md text-left flex gap-3 group">
                  <span className="text-xl group-hover:scale-110 transition-transform">⚠️</span>
                  <span>Show me all products that are currently critically low in stock.</span>
                </button>
                <button onClick={() => setInput("Calculate the total financial value of all active inventory.")} className="p-4 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 rounded-2xl border border-gray-200/50 dark:border-gray-700 text-sm font-medium transition-all shadow-sm hover:shadow-md text-left flex gap-3 group">
                  <span className="text-xl group-hover:scale-110 transition-transform">💰</span>
                  <span>Calculate the total financial value of all active inventory.</span>
                </button>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={i} 
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white' 
                    : 'bg-gradient-to-br from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-black border border-gray-700 dark:border-gray-300'
                }`}>
                  {msg.sender === 'user' ? <User size={20} /> : <Bot size={24} />}
                </div>
                
                <div className={`max-w-[85%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-5 rounded-3xl shadow-sm text-[15px] leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                  }`}>
                    {msg.sender === 'ai' && !msg.isHistory ? (
                      <TypewriterMarkdown text={msg.text} />
                    ) : msg.sender === 'ai' ? (
                      <div dangerouslySetInnerHTML={formatMarkdown(msg.text)} />
                    ) : (
                      msg.text
                    )}
                  </div>
                  {msg.provider && (
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-2 px-2 flex items-center gap-1">
                      <Sparkles size={10}/> {msg.provider}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
            
            {loading && (
              <motion.div variants={messageVariants} initial="hidden" animate="visible" className="flex gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-gray-900 to-black dark:from-white dark:to-gray-200 flex items-center justify-center flex-shrink-0 text-white dark:text-black shadow-md border border-gray-700 dark:border-gray-300">
                  <Bot size={24} />
                </div>
                <div className="p-5 rounded-3xl rounded-tl-none bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-gray-900 dark:text-white" size={18} />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{loadingState}</span>
                  </div>
                  <div className="flex gap-1 ml-7">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-t border-white/20 dark:border-white/5 z-20">
          <form onSubmit={sendMessage} className="relative group max-w-4xl mx-auto">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message StockFlow Intelligence..."
              className="w-full pl-6 pr-16 py-4 sm:py-5 rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-gray-900 dark:focus:border-white outline-none bg-white dark:bg-gray-800 transition-all shadow-lg text-sm sm:text-base font-medium"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-black dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:scale-95 flex items-center justify-center shadow-md transform hover:scale-105"
            >
              <Send size={20} className="ml-1" />
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-400 font-medium mt-3 uppercase tracking-wider">
            AI can make mistakes. Verify important financial data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
