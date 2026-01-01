
import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronLeft, Volume2, VolumeX, Sparkles, Mic, Loader, Globe } from 'lucide-react';
import { playSound, ensureAudioContext } from '../services/audioService';
import { chatWithAssistant, speakResponse } from '../services/geminiService';

interface AssistantMessage {
  sender: 'user' | 'ai';
  text: string;
  sources?: { uri: string; title: string }[];
}

interface AssistantProps {
  initialHistory: AssistantMessage[];
  onUpdateHistory: (history: AssistantMessage[]) => void;
  onClose: () => void;
}

const Oracle: React.FC<AssistantProps> = ({ initialHistory, onUpdateHistory, onClose }) => {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [initialHistory, isTyping]);

  const playAudio = async (text: string) => {
      if (!voiceMode) return;
      try {
          setIsSpeaking(true);
          const audioBuffer = await speakResponse(text);
          if (audioBuffer) {
              const ctx = await ensureAudioContext();
              if (!ctx) return;
              
              const dataInt16 = new Int16Array(audioBuffer);
              const audioBufferObj = ctx.createBuffer(1, dataInt16.length, 24000);
              const channelData = audioBufferObj.getChannelData(0);
              for (let i = 0; i < dataInt16.length; i++) {
                  channelData[i] = dataInt16[i] / 32768.0;
              }

              const source = ctx.createBufferSource();
              source.buffer = audioBufferObj;
              source.connect(ctx.destination);
              source.onended = () => setIsSpeaking(false);
              source.start();
          } else {
              setIsSpeaking(false);
          }
      } catch (e) {
          setIsSpeaking(false);
      }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => { setIsListening(true); playSound('open'); };
    recognition.onend = () => { setIsListening(false); };
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) setInputText(prev => (prev ? prev + " " + transcript : transcript));
    };
    recognition.start();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const text = inputText;
    setInputText("");
    const optimisticHistory = [...initialHistory, { sender: 'user' as const, text }];
    onUpdateHistory(optimisticHistory); 
    setIsTyping(true);
    playSound('click');
    
    try {
        const result = await chatWithAssistant(text, initialHistory);
        onUpdateHistory([...optimisticHistory, { 
            sender: 'ai' as const, 
            text: result.text,
            sources: result.sources 
        }]);
        if (voiceMode) playAudio(result.text);
    } catch (e) {
        onUpdateHistory([...optimisticHistory, { sender: 'ai' as const, text: "I'm having a bit of trouble connecting right now. Try again?" }]);
    } finally { 
        setIsTyping(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background font-sans flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 pt-safe flex items-center gap-4 border-b border-white/50 bg-background/95 backdrop-blur-md sticky top-0 z-20">
         <button onClick={onClose} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors"><ChevronLeft size={28} /></button>
         <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Neighborhood Guide</h2>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Online</p>
         </div>
         <button 
            onClick={() => { setVoiceMode(!voiceMode); playSound('click'); }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${voiceMode ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400 border-slate-200'}`}
         >
             {voiceMode ? <Volume2 size={20} className={isSpeaking ? 'animate-pulse' : ''} /> : <VolumeX size={20} />}
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide" ref={scrollRef}>
         {initialHistory.length === 0 && !isTyping && (
             <div className="flex flex-col items-center justify-center h-full text-center p-10 space-y-4 opacity-50">
                <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center text-primary">
                    <Sparkles size={40} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Ready to help</h3>
                <p className="text-xs font-medium text-slate-500 max-w-[200px]">Ask me about local history, nature, or tips for your current mission.</p>
             </div>
         )}
         
         {initialHistory.map((msg, i) => {
            const isAI = msg.sender === 'ai';
            return (
                <div key={i} className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] px-5 py-3.5 rounded-3xl text-sm leading-relaxed ${
                        isAI 
                            ? 'bg-white text-slate-800 shadow-sm rounded-tl-none border border-slate-100' 
                            : 'bg-primary text-white rounded-tr-none shadow-md shadow-sky-200'
                    }`}>
                        {msg.text}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 max-w-[85%]">
                            {msg.sources.map((source, idx) => (
                                <a 
                                    key={idx} 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <Globe size={12} />
                                    <span className="truncate max-w-[120px]">{source.title}</span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            );
         })}
         
         {isTyping && (
             <div className="flex justify-start">
                <div className="bg-white border border-slate-100 px-5 py-3 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                    Thinking...
                </div>
             </div>
         )}
      </div>

      <div className="p-4 pb-safe bg-background border-t border-white/50 z-30">
         <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
            <div className="flex-1 relative">
                <input 
                   type="text" 
                   value={inputText} 
                   onChange={(e) => setInputText(e.target.value)} 
                   placeholder={isListening ? "Listening..." : "Ask anything..."}
                   className={`w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 pr-12 text-sm text-slate-900 outline-none focus:border-primary transition-all placeholder:text-slate-400 font-medium shadow-sm ${isListening ? 'border-rose-500 animate-pulse' : ''}`}
                />
                <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'text-rose-500' : 'text-slate-400 hover:text-primary'}`}
                >
                    {isListening ? <Loader size={18} className="animate-spin" /> : <Mic size={18} />}
                </button>
            </div>
            <button 
                type="submit" 
                disabled={!inputText.trim() || isTyping} 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                    !inputText.trim() || isTyping 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                        : 'bg-primary text-white hover:brightness-110 shadow-sky-200'
                }`}
            >
                <Send size={20} fill={!inputText.trim() || isTyping ? 'none' : 'currentColor'} />
            </button>
         </form>
      </div>
    </div>
  );
};

export default Oracle;
