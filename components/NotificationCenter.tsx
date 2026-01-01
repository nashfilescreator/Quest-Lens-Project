
import React from 'react';
import { Notification } from '../types';
import { X, Bell, Info, CheckCircle, AlertTriangle, UserPlus, Check, XCircle, Trash2 } from 'lucide-react';
import { playSound } from '../services/audioService';

interface NotificationCenterProps {
  notifications: Notification[];
  onClose: () => void;
  onClear: () => void;
  onMarkRead?: (id: string) => void;
  onAcceptInvite?: (teamId: string) => void;
  onDeclineInvite?: (teamId: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onClose, onClear, onMarkRead, onAcceptInvite, onDeclineInvite }) => {
  const handleItemClick = (id: string, read: boolean) => {
      if (!read && onMarkRead) {
          onMarkRead(id);
      }
  };

  const handleClear = () => {
      playSound('click');
      onClear();
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end font-sans">
       <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
       
       <div className="relative z-10 w-full max-w-sm bg-background h-full border-l border-ln-base shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
          <div className="p-6 pt-safe border-b border-ln-base bg-background/95 backdrop-blur-xl flex items-center justify-between">
             <div>
                <h2 className="font-extrabold text-xl text-txt-main tracking-tight flex items-center gap-3">
                    Alerts
                </h2>
                <p className="text-[10px] text-txt-dim font-black uppercase tracking-[0.2em] mt-1">Recent Updates</p>
             </div>
             <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full text-txt-sub hover:text-txt-main transition-all">
                <X size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-slate-50/50">
             {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 opacity-40">
                   <div className="w-20 h-20 rounded-[2.5rem] bg-white border border-ln-base flex items-center justify-center text-txt-dim shadow-sm">
                        <Bell size={32} strokeWidth={1} />
                   </div>
                   <p className="text-xs font-bold uppercase tracking-widest text-txt-dim">No recent alerts</p>
                </div>
             ) : (
                 notifications.map(n => (
                    <div 
                        key={n.id} 
                        onClick={() => handleItemClick(n.id, n.read)}
                        className={`group p-5 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden ${
                            n.read 
                                ? 'bg-white/50 border-transparent opacity-60' 
                                : 'bg-white border-ln-base shadow-sm hover:shadow-md'
                        }`}
                    >
                       {!n.read && <div className="absolute top-6 right-6 w-2 h-2 bg-primary rounded-full"></div>}
                       
                       <div className="flex items-start gap-4">
                          <div className={`mt-1 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                             n.type === 'success' ? 'bg-green-50 border-green-100 text-green-500' :
                             n.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                             n.type === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 
                             n.type === 'invite' ? 'bg-purple-50 border-purple-100 text-purple-500' : 
                             'bg-blue-50 border-blue-100 text-blue-500'
                          }`}>
                             {n.type === 'success' ? <CheckCircle size={18} /> : 
                              n.type === 'warning' ? <AlertTriangle size={18} /> :
                              n.type === 'invite' ? <UserPlus size={18} /> :
                              <Info size={18} />}
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                             <div className="flex justify-between items-center mb-1">
                                <h4 className={`text-sm font-bold truncate ${n.read ? 'text-txt-sub' : 'text-txt-main'}`}>{n.title}</h4>
                             </div>
                             <p className={`text-xs leading-relaxed mb-1 ${n.read ? 'text-txt-dim' : 'text-txt-sub font-medium'}`}>{n.message}</p>
                             <span className="text-[9px] text-txt-dim font-bold uppercase tracking-wide">{n.timestamp}</span>
                             
                             {n.actionPayload?.type === 'team_invite' && !n.read && (
                                 <div className="flex gap-2 mt-4">
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); playSound('success'); onAcceptInvite?.(n.actionPayload!.teamId); }}
                                        className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:brightness-110 shadow-lg active:scale-95 transition-all"
                                     >
                                         <Check size={14} strokeWidth={3} /> Accept
                                     </button>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); playSound('click'); onDeclineInvite?.(n.actionPayload!.teamId); }}
                                        className="flex-1 py-3 bg-white text-txt-dim text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 border border-ln-base active:scale-95 transition-all"
                                     >
                                         <XCircle size={14} /> Ignore
                                     </button>
                                 </div>
                             )}
                          </div>
                       </div>
                    </div>
                 ))
             )}
          </div>
          
          <div className="p-6 bg-background border-t border-ln-base">
             <button 
               onClick={handleClear}
               className="w-full h-14 bg-white hover:bg-red-50 border border-ln-base hover:border-red-100 text-xs font-black text-txt-dim hover:text-red-500 uppercase tracking-[0.2em] rounded-[1.5rem] transition-all flex items-center justify-center gap-2"
             >
                <Trash2 size={16} /> Clear All
             </button>
          </div>
       </div>
    </div>
  );
};

export default NotificationCenter;
