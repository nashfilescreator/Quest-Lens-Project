
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Users, Minimize2, Maximize2, Zap, Shield, Radio, Mic, MessageCircle } from 'lucide-react';
import { Friend, Quest, ChatMessage } from '../types';
import { playSound } from '../services/audioService';
import OptimizedImage from './OptimizedImage';

interface ChatOverlayProps {
  friend?: Friend;
  isTeamChat?: boolean;
  attachedQuest?: Quest | null;
  persistedMessages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  onClose: () => void;
  onExpandChange?: (expanded: boolean) => void;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ friend, isTeamChat, attachedQuest, persistedMessages, onSendMessage, onClose, onExpandChange }) => {
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [persistedMessages, isExpanded]);

  const toggleExpand = () => {
      const newState = !isExpanded;
      setIsExpanded(newState);
      onExpandChange?.(newState);
      playSound('click');
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedQuest) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: 'You',
      avatarSeed: 'Felix',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      questId: attachedQuest?.id
    };

    onSendMessage(newMsg);
    setInputText('');
    playSound('click');
  };

  return (
    <div className={`fixed z-[160] transition-all duration-300 shadow-2xl bg-white flex flex-col overflow-hidden font-sans ${isExpanded ? 'inset-0' : 'bottom-24 right-4 left-4 h-[500px] rounded-[2.5rem] border border-slate-100'}`}>
       
       {/* Header */}
       <div className="p-4 flex justify-between items-center border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 overflow-hidden ${isTeamChat ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-50'}`}>
                 {isTeamChat ? <Users size={20} /> : <OptimizedImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend?.avatarSeed}`} className="w-full h-full" alt="" />}
             </div>
             <div>
                 <h3 className="font-bold text-sm text-slate-900">{isTeamChat ? "Team Chat" : friend?.username}</h3>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{isTeamChat ? "Community" : "Private"}</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button aria-label={isExpanded ? "Minimize chat" : "Expand chat"} onClick={toggleExpand} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-full transition-colors">{isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
             <button aria-label="Close chat" onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-full transition-colors"><X size={18} /></button>
          </div>
       </div>

       {/* Messages */}
       <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide z-10 bg-slate-50">
          {persistedMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                  <MessageCircle size={40} className="text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No messages yet</p>
              </div>
          )}

          {persistedMessages.map((msg) => {
             const isMe = msg.senderId === 'me';
             return (
                 <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                     {!isMe && <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden shrink-0 mt-auto bg-white"><OptimizedImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.avatarSeed}`} alt="" className="w-full h-full" /></div>}
                     <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                         <div className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-sm ${isMe ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white text-slate-900 border border-slate-100 rounded-bl-none'}`}>
                             {msg.text}
                         </div>
                         <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 px-1">{msg.timestamp}</span>
                     </div>
                 </div>
             );
          })}
          <div ref={messagesEndRef} />
       </div>

       {/* Input Area */}
       <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-10 flex gap-3">
          <input 
            type="text" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            placeholder="Type a message..." 
            className="flex-1 bg-slate-50 border border-slate-100 rounded-full px-6 py-4 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400" 
          />
          <button 
            aria-label="Send message" 
            type="submit" 
            disabled={!inputText.trim()}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${inputText.trim() ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
          >
              <Send size={20} className={inputText.trim() ? 'translate-x-0.5' : ''} />
          </button>
       </form>
    </div>
  );
};

export default ChatOverlay;
