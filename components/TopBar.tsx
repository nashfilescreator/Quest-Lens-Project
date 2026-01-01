
import React, { useState, useEffect } from 'react';
import { UserStats, Notification } from '../types';
import { Bell, Sparkles, Coins } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { useUIStore } from '../store/uiStore';

interface TopBarProps {
  stats: UserStats;
  notifications: Notification[];
}

const TopBar: React.FC<TopBarProps> = ({ stats, notifications }) => {
  const { changeView, openModal } = useUIStore(state => state);
  const hasUnread = notifications.some(n => !n.read);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-ln-base px-4 h-[52px] flex items-center justify-between select-none font-sans transition-all duration-300">
      <button onClick={() => changeView('feed')} className="flex items-center gap-3 active:scale-95 transition-transform group">
        <div className="w-8 h-8 bg-gradient-to-tr from-primaryDark to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 font-black text-sm group-hover:scale-105 transition-transform">Q</div>
        <div className="flex flex-col items-start text-left">
            <span className="font-extrabold text-sm text-txt-main tracking-tight leading-none">Quest Lens</span>
            {!isOnline ? (
                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-0.5">Offline</span>
            ) : (
                <span className="text-[9px] font-bold text-txt-dim uppercase tracking-widest mt-0.5 group-hover:text-primary transition-colors">Explorer</span>
            )}
        </div>
      </button>

      <div className="flex items-center gap-2">
        <button 
          aria-label="Neighborhood Guide"
          onClick={() => changeView('oracle', true)} 
          className="w-9 h-9 flex items-center justify-center text-txt-sub hover:text-primary transition-all rounded-full hover:bg-white/5 active:scale-90"
        >
          <Sparkles size={18} strokeWidth={2} />
        </button>
        
        <button 
          aria-label="Coins"
          onClick={() => changeView('wallet')} 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-ln-base hover:border-amber-500/30 transition-all active:scale-95 shadow-sm"
        >
           <Coins size={14} className="text-amber-400 fill-amber-400" />
           <span className="text-[10px] font-bold text-txt-main tabular-nums">{stats.coins.toLocaleString()}</span>
        </button>

        <button 
          aria-label="Notifications"
          onClick={() => openModal('notifications')} 
          className="w-9 h-9 flex items-center justify-center text-txt-sub relative hover:bg-white/5 rounded-full transition-all active:scale-90"
        >
           <Bell size={18} strokeWidth={2} />
           {hasUnread && <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-background"></span>}
        </button>

        <button 
          aria-label="Profile"
          onClick={() => changeView('profile')} 
          className="w-8 h-8 rounded-full border border-ln-base overflow-hidden bg-surface shadow-sm active:scale-90 transition-all group hover:border-primary/50"
        >
           <OptimizedImage 
              src={stats.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stats.avatarSeed}`} 
              alt="User" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
           />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
