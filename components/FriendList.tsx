
import React, { useState, useMemo, useEffect } from 'react';
import { Friend } from '../types';
import { UserPlus, MessageSquare, MoreVertical, Search, Swords, UserCheck, X, ChevronRight, UserMinus, Users, Clock, User, Check } from 'lucide-react';
import { playSound } from '../services/audioService';
import OptimizedImage from './OptimizedImage';

interface FriendListProps {
  friends: Friend[];
  onAddFriend: () => void;
  onChat: (friend: Friend) => void;
  onDuel?: (friend: Friend) => void;
  onInspectAgent?: (agent: Friend) => void;
  onSocialAction?: (action: 'accept_request' | 'decline_request' | 'send_request' | 'cancel_request', targetId: string) => void;
  outgoingRequests?: string[];
  incomingRequests?: { id: string, userId: string, username: string, avatarSeed: string, level: number }[];
}

const DISCOVER_PEOPLE = [
  { id: 'd1', username: 'ExplorerOne', avatarSeed: 'Null', rank: 'Legend', status: 'online' },
  { id: 'd2', username: 'MapMaster', avatarSeed: 'Bit', rank: 'Master', status: 'offline' },
  { id: 'd3', username: 'Hiker_Echo', avatarSeed: 'Echo', rank: 'Seeker', status: 'online' },
];

const FriendList: React.FC<FriendListProps> = ({ 
  friends, 
  onAddFriend, 
  onChat, 
  onDuel, 
  onInspectAgent,
  onSocialAction,
  outgoingRequests = [],
  incomingRequests = []
}) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue]);
  
  const filteredFriends = useMemo(() => {
    return friends.filter(f => (f.username || '').toLowerCase().includes(debouncedQuery.toLowerCase()));
  }, [friends, debouncedQuery]);

  const filteredDiscover = useMemo(() => {
    if (!debouncedQuery) return [];
    return DISCOVER_PEOPLE.filter(a => a.username.toLowerCase().includes(debouncedQuery.toLowerCase()));
  }, [debouncedQuery]);

  const handleAccept = (userId: string) => {
    playSound('success');
    onSocialAction?.('accept_request', userId);
  };

  const handleDecline = (userId: string) => {
    playSound('click');
    onSocialAction?.('decline_request', userId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
      case 'in-quest': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-24 font-sans text-txt-main px-1">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-surface border border-ln-base rounded-2xl transition-all focus-within:ring-2 focus-within:ring-primary/20 shadow-sm">
          <div className="pl-4 text-slate-400"><Search size={18} /></div>
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            placeholder="Search friends or community..." 
            className="w-full bg-transparent py-4 px-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none" 
          />
          {inputValue && (
            <button aria-label="Clear search" onClick={() => setInputValue('')} className="pr-4 text-slate-400 hover:text-slate-900">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Discover Section */}
      {inputValue && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-400">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Community Results</h3>
                <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">{filteredDiscover.length} Found</span>
             </div>
             <div className="space-y-3">
                {filteredDiscover.length > 0 ? filteredDiscover.map(person => {
                    const isPending = outgoingRequests.includes(person.id);
                    return (
                        <div 
                          key={person.id} 
                          className="flex items-center justify-between p-4 bg-surface border border-ln-base rounded-[1.5rem] hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => onInspectAgent?.(person as any)}
                        >
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 border border-ln-base shadow-sm group-hover:scale-105 transition-transform">
                                   <OptimizedImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.avatarSeed}`} className="w-full h-full" alt={person.username} />
                               </div>
                               <div>
                                 <h4 className="font-extrabold text-slate-900 text-sm mb-0.5">{person.username}</h4>
                                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{person.rank} • Lvl {Math.floor(Math.random()*20)+1}</p>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {isPending ? (
                                    <button 
                                        aria-label="Cancel friend request"
                                        onClick={(e) => { e.stopPropagation(); onSocialAction?.('cancel_request', person.id); }}
                                        className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase border border-ln-base flex items-center gap-1.5 hover:bg-slate-100"
                                    >
                                        <Clock size={12} /> Pending
                                    </button>
                                ) : (
                                    <button 
                                        aria-label="Add friend"
                                        onClick={(e) => { e.stopPropagation(); onSocialAction?.('send_request', person.id); }}
                                        className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                    >
                                        <UserPlus size={18} strokeWidth={2.5} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="py-12 text-center opacity-40">
                        <UserMinus size={32} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching agents found</p>
                    </div>
                )}
             </div>
          </div>
      )}

      {/* Friend Requests */}
      {incomingRequests.length > 0 && !inputValue && (
          <section className="animate-in slide-in-from-left-2 duration-400">
              <div className="flex items-center justify-between mb-4 px-1">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incoming Requests</h3>
                 <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/30">{incomingRequests.length}</span>
              </div>
              <div className="space-y-3">
                 {incomingRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-surface border border-ln-base rounded-[1.5rem] shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 border border-ln-base">
                               <OptimizedImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${req.avatarSeed}`} alt={req.username} className="w-full h-full" />
                           </div>
                           <div>
                             <div className="text-sm font-extrabold text-slate-900">{req.username}</div>
                             <div className="text-[10px] text-slate-500 font-bold uppercase">Level {req.level}</div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                              aria-label="Accept friend request"
                              onClick={() => handleAccept(req.userId)} 
                              className="w-10 h-10 bg-emerald-500 text-white rounded-xl hover:brightness-110 transition-all active:scale-90 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                              title="Accept"
                           >
                              <Check size={18} strokeWidth={3} />
                           </button>
                           <button 
                              aria-label="Decline friend request"
                              onClick={() => handleDecline(req.userId)} 
                              className="w-10 h-10 bg-surface border border-ln-base text-slate-300 rounded-xl hover:text-rose-500 hover:border-rose-100 transition-colors active:scale-90 flex items-center justify-center"
                              title="Decline"
                           >
                              <X size={18} strokeWidth={3} />
                           </button>
                        </div>
                    </div>
                 ))}
              </div>
          </section>
      )}

      {/* Friends List */}
      <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connections</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{filteredFriends.length}</span>
          </div>
          
          <div className="space-y-2">
            {filteredFriends.length > 0 ? filteredFriends.map(friend => (
              <div 
                key={friend.id} 
                className="flex items-center justify-between p-4 bg-surface border border-ln-base rounded-[1.5rem] hover:shadow-md transition-all cursor-pointer group"
                onClick={() => onInspectAgent?.(friend)}
              >
                 <div className="flex items-center gap-4">
                    <div className="relative">
                       <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 border border-ln-base group-hover:scale-105 transition-transform">
                           <OptimizedImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.avatarSeed}`} alt={friend.username} className="w-full h-full object-cover" />
                       </div>
                       <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-[3px] border-surface rounded-full ${getStatusColor(friend.status)}`}></div>
                    </div>
                    <div>
                       <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2 mb-0.5">
                          {friend.username}
                          {friend.status === 'in-quest' && (
                             <span className="text-[8px] font-black text-blue-500 uppercase bg-blue-50 px-1.5 py-0.5 rounded-md">Exploring</span>
                          )}
                       </div>
                       <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide flex items-center gap-1.5">
                          {friend.rank}
                          <span className="w-0.5 h-2 bg-slate-200"></span>
                          <span className={friend.status === 'online' ? 'text-emerald-500' : 'text-slate-400'}>
                            {friend.status === 'online' ? 'Online' : friend.status === 'in-quest' ? 'On Mission' : 'Offline'}
                          </span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      aria-label={`Message ${friend.username}`}
                      onClick={(e) => { e.stopPropagation(); playSound('click'); onChat(friend); }} 
                      className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <MessageSquare size={18} />
                    </button>
                    <button 
                      aria-label={`Duel ${friend.username}`}
                      onClick={(e) => { e.stopPropagation(); playSound('click'); onDuel?.(friend); }} 
                      className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Swords size={18} />
                    </button>
                 </div>
              </div>
            )) : !inputValue ? (
              <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                 <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <User size={24} className="text-slate-400" />
                 </div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your friends list is empty</p>
                 <button onClick={onAddFriend} className="mt-4 text-xs font-bold text-primary hover:underline">Find People</button>
              </div>
            ) : null}
          </div>
      </section>
    </div>
  );
};

export default FriendList;
