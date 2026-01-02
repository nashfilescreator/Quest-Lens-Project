
import React from 'react';
import { X, UserPlus, Shield, MessageSquare, Swords, Check, UserMinus, Clock, UserX } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface AgentProfileModalProps {
   agent: {
      id: string;
      username: string;
      avatarSeed: string;
      rank: string;
      xp: number;
      isFriend: boolean;
      isPending?: boolean;
   };
   onClose: () => void;
   onAddFriend: () => void;
   onSendRequest?: () => void;
   onCancelRequest?: () => void;
   onDuel: () => void;
   onChat: () => void;
   onRemoveFriend?: () => void;
}

const AgentProfileModal: React.FC<AgentProfileModalProps> = ({ agent, onClose, onAddFriend, onSendRequest, onCancelRequest, onDuel, onChat, onRemoveFriend }) => {
   const level = Math.floor(agent.xp / 1000) + 1;

   return (
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-300">

         <div className="relative w-full max-w-sm bg-surface/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">

            <button onClick={onClose} aria-label="Close profile" className="absolute top-4 right-4 z-20 p-2 bg-black/30 rounded-full text-white/70 hover:text-white transition-colors">
               <X size={20} />
            </button>

            <div className="h-32 bg-gradient-to-b from-indigo-900/50 to-surface relative">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="px-6 pb-8 relative -mt-16 flex flex-col items-center">
               <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl mb-4">
                  <div className="w-full h-full rounded-full bg-black border-4 border-surface overflow-hidden">
                     <OptimizedImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.avatarSeed}`} className="w-full h-full object-cover" alt="Avatar" />
                  </div>
               </div>

               <h2 className="text-2xl font-display font-bold text-white mb-1">{agent.username}</h2>
               <div className="flex items-center gap-2 mb-6">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold uppercase text-gray-400">
                     {agent.rank}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold uppercase text-indigo-400">
                     Lvl {level}
                  </span>
               </div>

               <div className="w-full grid grid-cols-3 gap-2 mb-8">
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                     <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">XP</span>
                     <span className="font-mono text-sm font-bold text-white">{agent.xp.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                     <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Win Rate</span>
                     <span className="font-mono text-sm font-bold text-green-400">58%</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                     <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Badges</span>
                     <span className="font-mono text-sm font-bold text-yellow-500">12</span>
                  </div>
               </div>

               <div className="w-full flex flex-col gap-3">
                  {agent.isFriend ? (
                     <div className="flex flex-col gap-2">
                        <div className="w-full py-3 bg-green-500/10 border border-green-500/20 text-green-500 font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase">
                           <Check size={16} /> Friends
                        </div>
                        <button
                           aria-label="Remove friend"
                           onClick={onRemoveFriend}
                           className="w-full py-2 text-red-500/50 hover:text-red-500 text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-colors"
                        >
                           <UserX size={12} /> Remove Friend
                        </button>
                     </div>
                  ) : agent.isPending ? (
                     <button
                        aria-label="Cancel friend request"
                        onClick={onCancelRequest}
                        className="w-full group py-3.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase transition-all"
                     >
                        <Clock size={16} className="group-hover:hidden" />
                        <UserMinus size={16} className="hidden group-hover:block" />
                        <span className="group-hover:hidden">Request Sent</span>
                        <span className="hidden group-hover:inline">Cancel Request</span>
                     </button>
                  ) : (
                     <button
                        aria-label="Add friend"
                        onClick={onSendRequest || onAddFriend}
                        className="w-full py-3.5 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg active:scale-[0.98]"
                     >
                        <UserPlus size={18} /> Add Friend
                     </button>
                  )}

                  <div className="flex gap-3">
                     <button
                        aria-label="Send message"
                        onClick={onChat}
                        className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors active:scale-[0.98]"
                     >
                        <MessageSquare size={18} /> Message
                     </button>
                     <button
                        aria-label="Challenge to a duel"
                        onClick={onDuel}
                        className="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors active:scale-[0.98]"
                     >
                        <Swords size={18} /> Duel
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default AgentProfileModal;
