
import React, { useState, useLayoutEffect, useRef } from 'react';
import { UserStats, JournalEntry, Artifact } from '../types';
import { ArrowLeft, BookOpen, MapPin, Calendar, Share2, ZoomIn, X, Sparkles, Database, Zap, Clock } from 'lucide-react';
import { playSound } from '../services/audioService';
import OptimizedImage from './OptimizedImage';

interface QuestJournalProps {
  stats: UserStats;
  onBack: () => void;
  onBroadcast?: (entry: JournalEntry | Artifact) => void;
}

const QuestJournal: React.FC<QuestJournalProps> = ({ stats, onBack, onBroadcast }) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'artifacts'>('missions');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
        containerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const handleSelectEntry = (entry: JournalEntry) => {
    playSound('click');
    setSelectedEntry(entry);
  };

  const handleSelectArtifact = (art: Artifact) => {
      playSound('click');
      setSelectedArtifact(art);
  };

  const handleBroadcast = () => {
      const entry = selectedEntry || selectedArtifact;
      if (entry && onBroadcast) {
          onBroadcast(entry);
          setSelectedEntry(null);
          setSelectedArtifact(null);
      }
  };

  const getRarityColor = (rarity: string) => {
      switch(rarity) {
          case 'Legendary': return 'text-yellow-500';
          case 'Epic': return 'text-purple-500';
          case 'Rare': return 'text-blue-500';
          case 'Uncommon': return 'text-green-500';
          default: return 'text-txt-dim';
      }
  };

  return (
    <div ref={containerRef} className="animate-in slide-in-from-right duration-300 min-h-screen bg-background pb-20 relative overflow-y-auto font-sans">
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-ln-base p-4">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-glass rounded-full transition-colors text-txt-main">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-txt-main flex items-center gap-2">
                History
            </h2>
            </div>
            <div className="bg-glass border border-ln-base px-3 py-1 rounded-full text-[10px] font-bold text-txt-dim uppercase tracking-widest">
            {activeTab === 'missions' ? stats.journal.length : stats.artifacts.length} Items
            </div>
        </div>
        <div className="flex gap-2 p-1 bg-surface rounded-xl border border-ln-base">
            <button 
                onClick={() => { setActiveTab('missions'); playSound('click'); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'missions' ? 'bg-txt-main text-background shadow-sm' : 'text-txt-dim hover:text-txt-main'}`}
            >
                Quests
            </button>
            <button 
                onClick={() => { setActiveTab('artifacts'); playSound('click'); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'artifacts' ? 'bg-txt-main text-background shadow-sm' : 'text-txt-dim hover:text-txt-main'}`}
            >
                Discoveries
            </button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 animate-in fade-in duration-500" key={activeTab}>
         {activeTab === 'missions' ? (
             stats.journal.map(entry => (
                <button 
                  key={entry.id} 
                  onClick={() => handleSelectEntry(entry)}
                  className="group relative aspect-[4/5] overflow-hidden bg-surface rounded-2xl transition-all border border-ln-base shadow-sm"
                >
                   <OptimizedImage 
                      src={entry.image} 
                      alt={entry.questTitle} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                   <div className="absolute bottom-3 left-4 right-4 text-left">
                      <h3 className="text-xs font-bold text-white leading-tight mb-1 truncate">{entry.questTitle}</h3>
                      <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">{entry.date}</p>
                   </div>
                </button>
             ))
         ) : (
            stats.artifacts.map(art => (
                <button 
                  key={art.id} 
                  onClick={() => handleSelectArtifact(art)}
                  className="group relative aspect-[4/5] overflow-hidden bg-surface rounded-2xl transition-all border border-ln-base shadow-sm"
                >
                   <OptimizedImage 
                      src={art.image} 
                      alt={art.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                   <div className="absolute bottom-3 left-4 right-4 text-left">
                      <span className={`text-[8px] font-black uppercase tracking-[0.2em] block mb-1 ${getRarityColor(art.rarity)}`}>{art.rarity} Item</span>
                      <h3 className="text-xs font-bold text-white leading-tight truncate">{art.name}</h3>
                   </div>
                </button>
            ))
         )}
      </div>

      {((activeTab === 'missions' && stats.journal.length === 0) || (activeTab === 'artifacts' && stats.artifacts.length === 0)) && (
         <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6 opacity-30">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-ln-base flex items-center justify-center mb-6">
               {activeTab === 'missions' ? <Clock size={32} className="text-txt-dim" /> : <Database size={32} className="text-txt-dim" />}
            </div>
            <p className="text-sm font-bold text-txt-dim uppercase tracking-widest">{activeTab === 'missions' ? 'No quests yet' : 'No items yet'}</p>
         </div>
      )}

      {(selectedEntry || selectedArtifact) && (
         <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
            <div className="w-full max-w-sm bg-surface rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-ln-base">
               <button 
                  onClick={() => { setSelectedEntry(null); setSelectedArtifact(null); }} 
                  className="absolute top-5 right-5 z-20 p-2 bg-glass rounded-full text-txt-main hover:bg-glass-heavy"
               >
                  <X size={20} />
               </button>
               <div className="relative h-80">
                  <OptimizedImage 
                    src={selectedEntry?.image || selectedArtifact?.image || ''} 
                    alt="Detail" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
               </div>
               <div className="p-8 relative -mt-16">
                  <h2 className="text-2xl font-bold text-txt-main mb-2 leading-tight">{selectedEntry?.questTitle || selectedArtifact?.name}</h2>
                  <div className="flex items-center gap-4 mb-6">
                     <div className="flex items-center gap-1.5 text-xs text-txt-sub font-bold uppercase tracking-widest">
                        <Calendar size={14} className="text-primary" />
                        {selectedEntry?.date || selectedArtifact?.discoveredAt}
                     </div>
                     {selectedArtifact && (
                         <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                             <Sparkles size={14} className={getRarityColor(selectedArtifact.rarity)} />
                             <span className={getRarityColor(selectedArtifact.rarity)}>{selectedArtifact.rarity}</span>
                         </div>
                     )}
                  </div>
                  
                  {selectedArtifact && (
                      <p className="text-txt-sub text-sm leading-relaxed mb-8 font-medium">"{selectedArtifact.description}"</p>
                  )}

                  <div className="bg-glass border border-ln-base rounded-2xl p-6 mb-8 flex justify-around shadow-inner">
                     <div className="text-center">
                        <span className="block text-[9px] text-txt-dim uppercase font-bold tracking-widest mb-1">XP Gained</span>
                        <span className="text-xl font-bold text-primary">+{selectedEntry?.rewards.xp || selectedArtifact?.xpValue}</span>
                     </div>
                     <div className="w-px bg-ln-base h-10 self-center"></div>
                     <div className="text-center">
                        <span className="block text-[9px] text-txt-dim uppercase font-bold tracking-widest mb-1">Coins Earned</span>
                        <span className="text-xl font-bold text-orange-400">+{selectedEntry?.rewards.coins || 0}</span>
                     </div>
                  </div>
                  
                  <button onClick={handleBroadcast} className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 shadow-lg active:scale-[0.98] transition-all">
                     <Share2 size={18} /> Share Discovery
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default QuestJournal;
