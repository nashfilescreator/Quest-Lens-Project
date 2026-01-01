
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, MessageSquare, Info, Mic } from 'lucide-react';
import { playSound } from '../services/audioService';
import { ChatMessage, Team } from '../types';
import OptimizedImage from './OptimizedImage';
import { useChat } from '../hooks/useChat';

interface TeamChatProps {
  team: Team;
  messages?: ChatMessage[]; 
  onSendMessage?: (text: string) => void;
  onBack: () => void;
  currentUserId: string;
  currentUsername: string;
  currentUserAvatar: string;
}

const TeamChat: React.FC<TeamChatProps> = ({ team, onBack, currentUserId, currentUsername, currentUserAvatar }) => {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage } = useChat(team.id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    sendMessage(inputText, {
        id: currentUserId,
        name: currentUsername,
        avatar: currentUserAvatar
    });
    
    setInputText("");
    playSound('click');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background font-sans flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-safe border-b border-white/5 bg-background/95 backdrop-blur-md sticky top-0 z-20">
         <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors rounded-full">
            <ChevronLeft size={24} />
         </button>
         <div className="flex-1">
            <h2 className="text-base font-bold text-white">{team.name}</h2>
            <p className="text-xs text-gray-500">{team.members.length} members</p>
         </div>
         <div className="w-8 h-8 rounded-full overflow-hidden bg-surface">
             <OptimizedImage src={team.avatar} alt="Team" className="w-full h-full object-cover" />
         </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6" ref={scrollRef}>
         <div className="min-h-full flex flex-col justify-end">
            {messages.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center opacity-50">
                    <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 text-gray-500">
                        <MessageSquare size={24} />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Send the first message</p>
                </div>
            ) : (
                messages.map((msg, index) => {
                    const isMe = msg.senderId === currentUserId;
                    const showHeader = index === 0 || messages[index - 1].senderId !== msg.senderId;

                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            {showHeader && !isMe && (
                                <span className="text-[10px] text-gray-500 ml-10 mb-1">{msg.senderName}</span>
                            )}
                            <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!isMe && (
                                    <div className={`w-8 h-8 rounded-full bg-surface overflow-hidden shrink-0 ${!showHeader ? 'opacity-0' : ''}`}>
                                        <OptimizedImage 
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.avatarSeed}`} 
                                            className="w-full h-full object-cover" 
                                            alt="" 
                                        />
                                    </div>
                                )}
                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    isMe 
                                        ? 'bg-primary text-white rounded-tr-none' 
                                        : 'bg-surface text-gray-100 rounded-tl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                            {showHeader && (
                                <span className={`text-[9px] text-gray-600 mt-1 ${isMe ? 'mr-1' : 'ml-12'}`}>
                                    {msg.timestamp}
                                </span>
                            )}
                        </div>
                    );
                })
            )}
         </div>
      </div>

      {/* Message Input */}
      <div className="p-4 pb-safe bg-background border-t border-white/5">
         <form onSubmit={handleSend} className="flex items-center gap-3">
            <div className="flex-1 bg-surface rounded-full px-4 py-3 flex items-center gap-2">
               <input 
                  type="text" 
                  value={inputText} 
                  onChange={(e) => setInputText(e.target.value)} 
                  placeholder="Message..." 
                  className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none text-sm"
               />
            </div>
            <button 
               type="submit" 
               disabled={!inputText.trim()}
               className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                   inputText.trim() 
                    ? 'bg-white text-black active:scale-95' 
                    : 'bg-surface text-gray-500 cursor-not-allowed'
               }`}
            >
               <Send size={18} fill={inputText.trim() ? "currentColor" : "none"} />
            </button>
         </form>
      </div>
    </div>
  );
};

export default TeamChat;
