
import React, { useState, useEffect } from 'react';
import { UserStats, AppRole } from '../types';
import { MARKET_ITEMS, LEVEL_THRESHOLDS } from '../constants';
import { Settings, Award, ChevronRight, Edit2, Box, Crown, TrendingUp, GraduationCap, Compass, Target, PenTool, History, Zap } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { useUIStore } from '../store/uiStore';

interface UserProfileProps {
    stats: UserStats;
}

const useCounter = (end: number, duration: number = 1000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [end, duration]);

    return count;
};

const UserProfile: React.FC<UserProfileProps> = ({ stats }) => {
    const { changeView, openModal } = useUIStore(state => state);
    const isStudent = stats.activeRoles.includes('Student');

    const animatedXP = useCounter(stats.xp || 0);
    const animatedLevel = useCounter(stats.level || 1, 500);

    const levelIndex = Math.max(0, (stats.level || 1) - 1);
    const currentLevelBaseXP = LEVEL_THRESHOLDS[levelIndex] || 0;
    const nextLevelXP = LEVEL_THRESHOLDS[stats.level || 1] || (currentLevelBaseXP + 5000);
    const levelProgress = Math.min(100, Math.max(0, (((stats.xp || 0) - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) * 100));

    const getRoleIcon = (role: AppRole) => {
        switch (role) {
            case 'Explorer': return <Compass size={20} className="text-discovery-500" />;
            case 'Competitor': return <Target size={20} className="text-challenge-500" />;
            case 'Creator': return <PenTool size={20} className="text-creation-500" />;
            case 'Student': return <GraduationCap size={20} className="text-learning-500" />;
        }
    };

    const getRoleColor = (role: AppRole) => {
        switch (role) {
            case 'Explorer': return 'bg-discovery-500';
            case 'Competitor': return 'bg-challenge-500';
            case 'Creator': return 'bg-creation-500';
            case 'Student': return 'bg-learning-500';
        }
    };

    const frameItem = stats.equippedFrame ? MARKET_ITEMS.find(i => i.id === stats.equippedFrame) : null;
    const profileHeaderBg = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200";

    return (
        <div className="min-h-screen bg-background relative pb-32 overflow-x-hidden animate-in fade-in slide-in-from-top-4 duration-500 text-txt-main font-sans">

            {/* Editorial Header */}
            <div className="relative h-[35vh] w-full overflow-hidden">
                <OptimizedImage
                    src={stats.dashboardCover || profileHeaderBg}
                    className="w-full h-full object-cover"
                    alt="Profile Header"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>

                <div className="absolute top-0 left-0 right-0 z-20 flex justify-end items-center p-4 pt-safe">
                    <button
                        aria-label="Settings"
                        onClick={() => changeView('settings')}
                        className="p-2.5 bg-background/20 backdrop-blur-md rounded-full text-white hover:bg-white/10 border border-white/10 transition-all active:scale-90"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <div className="relative z-10 px-6 -mt-20 flex flex-col items-center">
                {/* Avatar Section */}
                <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-discovery-500 via-primary to-challenge-500 relative z-10">
                        <div className="w-full h-full rounded-full bg-background border-4 border-background overflow-hidden relative">
                            <OptimizedImage
                                src={stats.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stats.avatarSeed}`}
                                className="w-full h-full"
                                imgClassName="object-cover"
                                alt="Profile"
                            />
                        </div>
                        <button
                            onClick={() => changeView('edit-profile')}
                            className="absolute -bottom-1 -right-1 w-10 h-10 bg-surface border border-ln-base rounded-full flex items-center justify-center text-txt-main hover:text-primary transition-all z-20 active:scale-90 shadow-lg"
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>
                    {frameItem && (
                        <div className="absolute inset-0 -m-4 z-20 pointer-events-none scale-110">
                            <OptimizedImage src={frameItem.image} alt="frame" className="w-full h-full" imgClassName="object-contain" />
                        </div>
                    )}
                </div>

                {/* Name & Title */}
                <div className="space-y-1 mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">{stats.username}</h1>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{stats.rank}</span>
                        <div className="w-1 h-1 rounded-full bg-txt-dim"></div>
                        <span className="text-[10px] font-black uppercase text-txt-dim tracking-[0.2em]">Lvl {animatedLevel}</span>
                    </div>
                </div>

                {/* Frameless Stats */}
                <div className="flex justify-around w-full mb-12">
                    <div className="text-center">
                        <span className="text-2xl font-black text-white block">{(stats.journal || []).length}</span>
                        <span className="text-[9px] text-txt-dim uppercase font-bold tracking-widest block mt-1">Quests</span>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-black text-white block">{(stats.artifacts || []).length}</span>
                        <span className="text-[9px] text-txt-dim uppercase font-bold tracking-widest block mt-1">Discoveries</span>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-black text-primary block">{stats.influence || 0}</span>
                        <span className="text-[9px] text-txt-dim uppercase font-bold tracking-widest block mt-1">Influence</span>
                    </div>
                </div>

                {/* Expertise List (Frameless) */}
                <div className="space-y-8 w-full mb-12">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h3 className="text-[10px] font-black text-txt-dim uppercase tracking-[0.2em]">Paths</h3>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{(stats.activeRoles || []).length} Active</span>
                    </div>

                    <div className="space-y-6">
                        {(Object.keys(stats.roleAffinity || {}) as AppRole[]).map(role => {
                            if (role === 'Student' && !isStudent) return null;
                            const score = stats.roleAffinity[role] || 0;
                            const percent = Math.min(100, (score / 250) * 100);
                            return (
                                <div key={role} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getRoleIcon(role)}
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">{role}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-txt-dim">{score} XP</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${getRoleColor(role)} rounded-full shadow-[0_0_10px_currentColor] opacity-80`} style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Global Progress */}
                <div className="w-full mb-12">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-txt-dim uppercase tracking-widest">Level Progress</span>
                        <span className="text-[10px] font-mono text-primary">{Math.floor(animatedXP)} / {nextLevelXP}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primaryDark to-primary rounded-full" style={{ width: `${levelProgress}%` }}></div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    <button
                        onClick={() => changeView('team')}
                        className="group relative h-24 bg-white/5 hover:bg-white/10 rounded-3xl flex flex-col items-center justify-center transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 text-primary group-hover:scale-110 transition-transform">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white relative z-10">Community</span>
                    </button>

                    <button
                        onClick={() => openModal('inventory')}
                        className="group relative h-24 bg-white/5 hover:bg-white/10 rounded-3xl flex flex-col items-center justify-center transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-creation-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 text-creation-500 group-hover:scale-110 transition-transform">
                            <Box size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white relative z-10">Inventory</span>
                    </button>

                    <button
                        onClick={() => changeView('journal')}
                        className="group relative h-24 bg-white/5 hover:bg-white/10 rounded-3xl flex flex-col items-center justify-center transition-all overflow-hidden col-span-2"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-learning-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-learning-500 group-hover:scale-110 transition-transform">
                                <History size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-white">Journal History</span>
                                <span className="block text-[9px] text-txt-dim font-medium">Review your past discoveries</span>
                            </div>
                        </div>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default UserProfile;
