
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Send, Image as ImageIcon, FileText, Copy, Download, RefreshCw, User, Bot, Sparkles, Trash2, Check, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { generateImage, getApiKey } from '../services/gemini';

// --- AI CHAT ASSISTANT ---
export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string, timestamp: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Initialize chat on mount
  useEffect(() => {
    startNewChat();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startNewChat = () => {
    try {
        const apiKey = getApiKey();
        const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy_key' }); // Prevent crash on init, check later
        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: 'You are a helpful, friendly, and intelligent AI assistant called ToolMaster AI. Provide clear, concise, and accurate answers. Use markdown formatting for code and lists where appropriate.',
          }
        });
        setMessages([]);
        setError('');
    } catch (e) {
        console.error("Chat init failed", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const apiKey = getApiKey();
    if (!apiKey) {
        setMessages(prev => [...prev, { 
            role: 'model', 
            text: 'Please set your API Key in Settings (Gear icon) to use this feature.', 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
        return;
    }

    if (!chatRef.current) startNewChat();
    
    const userMsg = input;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setInput('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp }]);
    setLoading(true);

    try {
      const response = await chatRef.current?.sendMessageStream({ message: userMsg });
      
      const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: aiTimestamp }]);
      
      let fullText = '';
      
      if (response) {
          for await (const chunk of response) {
              const c = chunk as GenerateContentResponse;
              if (c.text) {
                  fullText += c.text;
                  setMessages(prev => {
                      const newMsg = [...prev];
                      const lastIdx = newMsg.length - 1;
                      if (lastIdx >= 0) {
                          newMsg[lastIdx] = { ...newMsg[lastIdx], text: fullText };
                      }
                      return newMsg;
                  });
              }
          }
      }
    } catch (e) {
      console.error(e);
      setError('Failed to get response. Please check your connection or API key.');
      setMessages(prev => prev.filter(m => m.text !== ''));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMsg = (text: string, idx: number) => {
      navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-brand-500 to-purple-600 rounded-lg text-white shadow-md">
                  <Bot className="w-5 h-5" />
              </div>
              <div>
                  <h3 className="font-bold text-slate-800">ToolMaster Assistant</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online & Ready
                  </p>
              </div>
          </div>
          <button 
              onClick={startNewChat}
              className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
              title="Clear conversation"
          >
              <Trash2 className="w-3 h-3" /> Clear Chat
          </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-8 opacity-60">
             <MessageSquare className="w-16 h-16 mb-4 text-slate-300" />
             <h3 className="text-lg font-bold text-slate-600 mb-2">How can I help you today?</h3>
             <p className="max-w-xs text-sm">Ask me about code, math, writing, or any other task. I'm here to assist!</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
             {/* Avatar */}
             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-brand-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
             </div>

             {/* Bubble */}
             <div className={`max-w-[85%] sm:max-w-[75%]`}>
                <div className={`relative p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                }`}>
                    <div className="whitespace-pre-wrap font-normal">{msg.text}</div>
                    
                    {/* Message Actions (AI only) */}
                    {msg.role === 'model' && (
                        <div className="absolute -bottom-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button 
                                onClick={() => handleCopyMsg(msg.text, idx)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition text-xs flex items-center gap-1"
                            >
                                {copiedIndex === idx ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                                {copiedIndex === idx ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Timestamp */}
                <div className={`text-[10px] text-slate-400 mt-1 flex items-center gap-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.timestamp}
                </div>
             </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-brand-600 flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 animate-pulse" />
             </div>
             <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
        
        {error && (
            <div className="flex justify-center">
                <div className="bg-red-50 text-red-600 text-xs px-4 py-2 rounded-full flex items-center gap-2 border border-red-100">
                    <AlertCircle className="w-3 h-3" /> {error}
                </div>
            </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
         <div className="relative flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message here..."
              className="flex-1 pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition shadow-inner"
              disabled={loading}
              autoFocus
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-brand-600 text-white px-5 rounded-xl hover:bg-brand-700 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
         </div>
         <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400">AI can make mistakes. Please verify important information.</p>
         </div>
      </div>
    </div>
  );
};

// --- AI IMAGE GENERATOR ---
export const AIImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setImage(null);
    
    const result = await generateImage(prompt);
    if (result) {
        setImage(result);
    } else {
        setError('Failed to generate image. Please check your API Key.');
    }
    setLoading(false);
  };

  const handleDownload = () => {
      if (!image) return;
      const link = document.createElement('a');
      link.href = image;
      link.download = `generated-image-${Date.now()}.png`;
      link.click();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Describe Your Imagination</h2>
            </div>
            
            <div className="flex gap-3">
                <input 
                  type="text" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  className="flex-1 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-lg"
                  placeholder="e.g. A futuristic city on Mars with flying cars, cyberpunk style"
                />
                <button 
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="bg-purple-600 text-white px-8 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg hover:shadow-purple-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Generate
                </button>
            </div>
            {error && <div className="mt-4 text-red-600 text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> {error}</div>}
        </div>

        {image && (
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
                <img src={image} alt={prompt} className="w-full rounded-xl shadow-sm" />
                <div className="flex justify-between items-center mt-4 px-2">
                    <p className="text-slate-500 text-sm italic truncate max-w-md">"{prompt}"</p>
                    <button 
                      onClick={handleDownload}
                      className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition"
                    >
                        <Download className="w-4 h-4" /> Download
                    </button>
                </div>
            </div>
        )}
        {!image && !loading && (
            <div className="text-center py-12 text-slate-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Enter a prompt above to generate an AI image</p>
            </div>
        )}
        {loading && (
            <div className="text-center py-20">
                 <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                 <p className="text-purple-600 font-medium">Creating masterpiece...</p>
            </div>
        )}
    </div>
  );
};

// --- AI SUMMARIZER ---
export const AISummarizer: React.FC = () => {
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setSummary('');
    
    try {
        const apiKey = getApiKey();
        const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy' });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Please summarize the following text concisely, highlighting key points:\n\n"${input}"`,
        });
        setSummary(response.text || 'Could not generate summary.');
    } catch (e) {
        setSummary('Error generating summary. Please check API Key settings.');
    } finally {
        setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto h-[600px]">
        <div className="flex flex-col h-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" /> Input Text
             </h3>
             <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none text-slate-700 leading-relaxed"
                placeholder="Paste text or article here..."
             />
             <div className="mt-4 flex justify-end gap-3">
                 <button onClick={() => setInput('')} className="text-slate-500 hover:text-red-600 px-4 py-2 transition text-sm font-medium">Clear</button>
                 <button 
                    onClick={handleSummarize} 
                    disabled={!input.trim() || loading}
                    className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 transition shadow-md disabled:opacity-50 flex items-center gap-2"
                 >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Summarize
                 </button>
             </div>
        </div>

        <div className="flex flex-col h-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" /> AI Summary
             </h3>
             <textarea 
                readOnly
                value={summary}
                className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none text-slate-700 leading-relaxed"
                placeholder="Summary will appear here..."
             />
             <div className="mt-4 flex justify-end gap-3">
                 <button 
                    onClick={handleCopy}
                    disabled={!summary}
                    className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition flex items-center gap-2 disabled:opacity-50"
                 >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                 </button>
             </div>
        </div>
    </div>
  );
};
