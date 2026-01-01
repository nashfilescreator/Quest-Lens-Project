
import React, { useMemo, memo, useState } from 'react';
import { UserStats, Quest, Team, WorldEvent, QuestType } from '../types';
import { RefreshCw, Loader, Award, MapPin, ChevronRight, Zap, Star, Crown, GraduationCap, Globe, Compass } from 'lucide-react';
import QuestCard from './QuestCard';
import WorldEventCard from './WorldEventCard';
import { playSound } from '../services/audioService';
import OptimizedImage from './OptimizedImage';
import { useUIStore } from '../store/uiStore';

interface DashboardProps {
  stats: UserStats;
  quests: Quest[];
  team?: Team; 
  worldEvents?: WorldEvent[];
  filter: string;
  setFilter: (f: string) => void;
  onJoinQuest: (q: Quest) => void;
  onEditQuest?: (q: Quest) => void;
  onRefreshAIQuests?: () => void;
  isRefreshing?: boolean;
  currentUserId?: string;
  onContributeEvent?: (eventId: string, amount: number) => void;
}

const StatItem = ({ icon: Icon, value, label, color, onClick }: { icon: any, value: string | number, label: string, color: string, onClick?: () => void }) => (
    <div onClick={onClick} className={`flex flex-col items-center gap-1 ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}>
        <Icon size={20} className={`${color} opacity-90`} strokeWidth={2.5} />
        <div className="flex flex-col items-center">
            <span className="font-black text-sm text-white leading-none shadow-black/50 drop-shadow-sm">{value}</span>
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-0.5">{label}</span>
        </div>
    </div>
);

const DashboardHeader = memo(({ stats, activeCount, greeting }: { 
    stats: UserStats, activeCount: number, greeting: string
}) => {
    const { changeView, openModal } = useUIStore(state => state);
    const dashboardBg = "https://images.unsplash.com/photo-1516216628859-9bccecab13ca?auto=format&fit=crop&q=80&w=1200";

    if (!stats) return <div className="w-full h-[220px] bg-surface animate-pulse rounded-b-4xl" />;

    return (
        <div className="relative w-full h-[220px] rounded-b-[2.5rem] overflow-hidden shadow-soft mesh-gradient border-b border-ln-base">
            <div className="absolute inset-0">
                <OptimizedImage 
                    src={stats.dashboardCover || dashboardBg}
                    alt="Nature Cover" className="w-full h-full object-cover scale-105 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
            </div>
            
            {/* Top Row: Greeting & Skills */}
            <div className="absolute top-8 left-6 right-6 z-10 flex justify-between items-start">
                <div>
                    <p className="text-white/70 text-[10px] font-black mb-0.5 uppercase tracking-[0.2em]">{greeting}</p>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none drop-shadow-md">{stats.username || 'Explorer'}</h1>
                </div>

                <button 
                    onClick={() => openModal('skills')} 
                    className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 active:scale-95 transition-all hover:bg-white/20"
                >
                    <Zap size={14} className="text-amber-300 fill-amber-300" />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">Skills</span>
                </button>
            </div>

            {/* Bottom Row: Stats Matrix - Distributed & Frameless */}
            <div className="absolute bottom-0 left-0 right-0 pb-6 pt-12 px-8 flex justify-between items-end bg-gradient-to-t from-background/90 to-transparent">
                <StatItem 
                    icon={Crown} 
                    value={stats.level} 
                    label="Level" 
                    color="text-amber-400" 
                />
                <StatItem 
                    icon={Zap} 
                    value={stats.xp > 999 ? `${(stats.xp/1000).toFixed(1)}k` : stats.xp} 
                    label="XP" 
                    color="text-primary" 
                />
                <StatItem 
                    icon={GraduationCap} 
                    value={stats.studyXp > 999 ? `${(stats.studyXp/1000).toFixed(1)}k` : stats.studyXp} 
                    label="SXP" 
                    color="text-emerald-400" 
                />
                <StatItem 
                    icon={Globe} 
                    value={stats.influence} 
                    label="Influence" 
                    color="text-cyan-400" 
                />
                <StatItem 
                    icon={Compass} 
                    value={activeCount} 
                    label="Active" 
                    color="text-white" 
                    onClick={() => changeView('my-quests')}
                />
            </div>
        </div>
    );
});

const Dashboard: React.FC<DashboardProps> = ({ stats, quests, worldEvents = [], onJoinQuest, onEditQuest, onRefreshAIQuests, isRefreshing, currentUserId, onContributeEvent }) => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  
  const filters = [
      { id: 'ALL', label: 'All', color: 'bg-primary' },
      { id: QuestType.DAILY, label: 'Daily', color: 'bg-discovery-500' },
      { id: QuestType.STORY, label: 'Story', color: 'bg-creation-500' },
      { id: QuestType.COMMUNITY, label: 'Community', color: 'bg-learning-500' },
      { id: QuestType.BOUNTY, label: 'Rare', color: 'bg-challenge-500' }
  ];

  const filteredQuests = useMemo(() => {
    if (!stats || !quests) return [];
    let list = quests.filter(q => !(stats.completedQuestIds || []).includes(q.id));
    if (activeFilter !== 'ALL') {
        list = list.filter(q => q.type === activeFilter);
    }
    return list;
  }, [quests, stats?.completedQuestIds, activeFilter]);

  if (!stats) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="min-h-screen bg-background pb-32 font-sans overflow-x-hidden text-txt-main">
      <DashboardHeader 
        stats={stats} 
        activeCount={(stats.activeQuestIds || []).length} 
        greeting={new Date().getHours() < 12 ? 'Good morning,' : 'Good evening,'}
      />
      
      <div className="px-6 space-y-10 pt-8">
         {worldEvents && worldEvents.length > 0 && (
            <section className="space-y-4">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-black text-challenge-500 flex items-center gap-2 uppercase tracking-[0.2em]">
                     <Star size={14} fill="currentColor" /> Live Events
                  </h3>
               </div>
               <div className="space-y-3">
                  {worldEvents.map(event => (
                     <WorldEventCard key={event.id} event={event} onJoin={() => onContributeEvent?.(event.id, 50)} />
                  ))}
               </div>
            </section>
         )}

         <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
               <div>
                  <h3 className="text-[10px] font-black text-txt-dim uppercase tracking-[0.3em]">Recommended Quests</h3>
               </div>
               <button 
                 onClick={onRefreshAIQuests} 
                 disabled={isRefreshing} 
                 className="p-2.5 bg-surface text-primary hover:bg-white/5 rounded-xl transition-all active:scale-90 border border-ln-base shadow-sm"
               >
                   {isRefreshing ? <Loader className="animate-spin" size={18} /> : <RefreshCw size={18} />}
               </button>
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-2">
                {filters.map(f => (
                    <button
                        key={f.id}
                        onClick={() => { setActiveFilter(f.id); playSound('click'); }}
                        className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shadow-sm ${
                            activeFilter === f.id 
                            ? `${f.color} text-background border-transparent` 
                            : 'bg-surface text-txt-dim border-ln-base hover:text-txt-main'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
            
            <div className="grid gap-6 pb-12">
               {filteredQuests.length > 0 ? (
                   filteredQuests.map((quest) => (
                       <QuestCard 
                           key={quest.id}
                           quest={quest} 
                           onJoin={onJoinQuest} 
                           onEdit={onEditQuest}
                           isCompleted={false}
                           activeRoles={stats.activeRoles}
                           currentUserId={currentUserId}
                       />
                   ))
               ) : (
                   <div className="text-center py-20 flex flex-col items-center gap-4 opacity-30">
                       <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center text-txt-dim border border-ln-base">
                           <MapPin size={32} />
                       </div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-txt-dim">No findings in this category</p>
                   </div>
               )}
            </div>
         </section>
      </div>
    </div>
  );
};

export default Dashboard;
