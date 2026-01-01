
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Quest, QuestType, UserStats } from '../types';
import { MapPin, Loader2, Navigation, Scan, Compass, Filter, LocateFixed, Target, List, ChevronLeft } from 'lucide-react'; // Added ChevronLeft
import { playSound } from '../services/audioService';
import OptimizedImage from './OptimizedImage';
import { useUIStore } from '../store/uiStore'; // Import useUIStore

interface QuestRadarProps {
  quests: Quest[];
  onQuestSelect: (quest: Quest) => void;
  openARLens?: () => void; // Renamed onEnterAR
  userStats: UserStats;
}

export const QuestRadar: React.FC<QuestRadarProps> = ({ quests, onQuestSelect, openARLens, userStats }) => {
  const { changeView } = useUIStore(); // Use UI store for navigation
  const [initialScanComplete, setInitialScanComplete] = useState(false);
  // Removed selectedBlip state
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [filterType, setFilterType] = useState<QuestType | 'ALL'>('ALL');
  // Removed viewMode state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Map<string, HTMLButtonElement>>(new Map()); // Keep markerRefs for position updates

  useEffect(() => {
      playSound('open');
      const timer = setTimeout(() => setInitialScanComplete(true), 1500);
      
      const watchId = navigator.geolocation.watchPosition(
          (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => console.warn("GPS Access Denied"),
          { enableHighAccuracy: true }
      );

      return () => {
          clearTimeout(timer);
          navigator.geolocation.clearWatch(watchId);
      };
  }, []);

  const calculateBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
    const startLatRad = startLat * (Math.PI / 180);
    const startLngRad = startLng * (Math.PI / 180);
    const destLatRad = destLat * (Math.PI / 180);
    const destLngRad = destLng * (Math.PI / 180);

    const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
    const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
              Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
    const brng = Math.atan2(y, x);
    return ((brng * 180) / Math.PI + 360) % 360;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const blipData = useMemo(() => {
    const filtered = quests.filter(q => {
        if (userStats.completedQuestIds.includes(q.id)) return false;
        if (filterType !== 'ALL' && q.type !== filterType) return false;
        return true;
    });

    return filtered.slice(0, 20).map((quest, i) => {
        let bearing = 0;
        let distance = 0;

        if (userLoc && quest.location) {
            bearing = calculateBearing(userLoc.lat, userLoc.lng, quest.location.lat, quest.location.lng);
            distance = calculateDistance(userLoc.lat, userLoc.lng, quest.location.lat, quest.location.lng);
        } else {
            // Fallback: distribute evenly if no GPS
            bearing = (i * (360 / filtered.length)) % 360; 
            distance = 50 + (i * 20); // Arbitrary distance for visual separation
        }
        
        // Normalize distance for radar display (max 1000m radius visually)
        const displayDistance = Math.min(100, (distance / 1000) * 100);

        return { quest, bearing, distance, displayDistance };
    }).sort((a, b) => a.distance - b.distance);
  }, [quests, userStats.completedQuestIds, userLoc, filterType]);

  const getPinColor = (type: QuestType) => {
      switch(type) {
          case QuestType.STORY: return 'bg-creation-500 shadow-[0_0_15px_rgba(216,180,254,0.6)]'; // Purple
          case QuestType.COMPETITIVE: return 'bg-challenge-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]'; // Red
          case QuestType.TEAM: return 'bg-discovery-500 shadow-[0_0_15px_rgba(52,211,153,0.6)]'; // Green/Teal
          case QuestType.BOUNTY: return 'bg-learning-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]'; // Amber/Orange
          case QuestType.DAILY: return 'bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.6)]'; // A distinct blue for daily
          case QuestType.COMMUNITY: return 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]'; // Cyan for community
          default: return 'bg-primary shadow-[0_0_15px_rgba(129,140,248,0.6)]'; // Default primary color
      }
  };

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col bg-background text-txt-main relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-background pointer-events-none"></div>

      {/* Header HUD */}
      <div className="sticky top-0 left-0 right-0 z-20 p-4 pt-safe flex flex-col gap-4 bg-background/90 backdrop-blur-xl border-b border-white/5 shadow-lg">
        <div className="flex justify-between items-center">
            <button 
                onClick={() => changeView('feed')} 
                className="p-2 -ml-2 text-txt-main hover:bg-white/10 rounded-full transition-all active:scale-90"
            >
                <ChevronLeft size={24} />
            </button>
            <div className="flex-1 text-center">
                <h2 className="text-xl font-black font-display tracking-tighter text-white leading-none">
                    Neighborhood Map
                </h2>
                {!initialScanComplete ? (
                    <div className="flex items-center justify-center gap-2 text-primary text-[10px] font-mono font-bold uppercase tracking-widest mt-1">
                        <Loader2 size={10} className="animate-spin" /> Loading Map Data...
                    </div>
                ) : (
                    <div className="text-emerald-500 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        {blipData.length} Discoveries Nearby
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                {openARLens && (
                    <button 
                        onClick={openARLens}
                        className="w-10 h-10 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl flex items-center justify-center hover:bg-primary hover:border-primary transition-all active:scale-95 shadow-lg"
                    >
                        <Scan size={20} />
                    </button>
                )}
            </div>
        </div>
        
        {/* Filter Bar below header */}
        <div className="overflow-x-auto scrollbar-hide pb-6"> {/* Changed pb-2 to pb-6 */}
            <div className="flex gap-2"> {/* Removed flex-wrap */}
                {[
                    { id: 'ALL', label: 'All Targets' },
                    { id: QuestType.STORY, label: 'Story' },
                    { id: QuestType.DAILY, label: 'Daily' },
                    { id: QuestType.COMPETITIVE, label: 'Competitive' }, // Changed from PvP
                    { id: QuestType.TEAM, label: 'Team' }, // Changed from Squad
                    { id: QuestType.BOUNTY, label: 'Special' }, // Changed from Bounty
                    { id: QuestType.COMMUNITY, label: 'Community' } 
                ].map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => { setFilterType(filter.id as any); playSound('click'); }}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                            filterType === filter.id 
                            ? 'bg-primary border-primary text-white shadow-glow' 
                            : 'bg-background/60 border-white/10 text-txt-dim hover:border-white/30 backdrop-blur-md'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Radar Visualization Area - Expanded to fill remaining space */}
      <div className="flex-1 flex items-center justify-center relative w-full h-full overflow-hidden">
            
            {/* Radar Container */}
            <div ref={mapContainerRef} className="relative w-[80vw] h-[80vw] max-w-[450px] max-h-[450px] rounded-full flex items-center justify-center border-2 border-primary/20 bg-black/10">
                
                {/* Rings & Decorations */}
                <div className="absolute inset-[10%] rounded-full border border-primary/20 opacity-70"></div>
                <div className="absolute inset-[30%] rounded-full border border-primary/15"></div>
                <div className="absolute inset-[50%] rounded-full border border-primary/10"></div>
                <div className="absolute inset-[70%] rounded-full border border-primary/5"></div>
                
                {/* Scanner Sweep Animation */}
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 w-[50%] h-[50%] bg-gradient-to-br from-primary/30 to-transparent origin-top-left animate-[spin_4s_linear_infinite]"></div>
                </div>

                {/* Crosshairs */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10"></div>
                <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10"></div>

                {/* User Marker */}
                <div className="relative z-20 w-6 h-6 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] border-4 border-primary/50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                </div>

                {/* Quest Blips */}
                {initialScanComplete && blipData.map(({ quest, bearing, displayDistance }) => {
                    const rad = (bearing - 90) * (Math.PI / 180); 
                    const radiusPercent = 50 * (displayDistance / 100); 
                    const x = 50 + radiusPercent * Math.cos(rad);
                    const y = 50 + radiusPercent * Math.sin(rad);
                    
                    return (
                        <button
                            key={quest.id}
                            ref={(el) => { if (el) markerRefs.current.set(quest.id, el); else markerRefs.current.delete(quest.id); }}
                            onClick={(e) => { e.stopPropagation(); playSound('click'); onQuestSelect(quest); }} // Direct navigation
                            className={`absolute w-12 h-12 -ml-6 -mt-6 flex flex-col items-center justify-center transition-all duration-300 z-30 group will-change-transform scale-100 hover:scale-125`}
                            style={{ top: `${y}%`, left: `${x}%` }}
                        >
                            <div className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${getPinColor(quest.type)}`}></div>
                            <div className="mt-2 bg-white/90 backdrop-blur-md text-slate-900 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                {quest.title}
                            </div>
                        </button>
                    );
                })}
                {blipData.length === 0 && initialScanComplete && (
                    <div className="text-center opacity-40">
                        <Compass size={32} className="mx-auto mb-2 text-txt-dim" />
                        <p className="text-xs font-bold text-txt-dim uppercase tracking-widest">No discoveries in range</p> {/* Changed from No signals in range */}
                    </div>
                )}
            </div>
        </div>

        {/* Dynamic Styles for Filter Pill Colors based on Palette */}
        <style>{`
          .bg-creation-500 { background-color: #d8b4fe; }
          .text-creation-500 { color: #d8b4fe; }
          .shadow-\[0_0_15px_rgba\(216,180,254,0.6\)\] { box-shadow: 0 0 15px rgba(216,180,254,0.6); }

          .bg-challenge-500 { background-color: #fca5a5; }
          .text-challenge-500 { color: #fca5a5; }
          .shadow-\[0_0_15px_rgba\(239,68,68,0.6\)\] { box-shadow: 0 0 15px rgba(239,68,68,0.6); }

          .bg-discovery-500 { background-color: #34d399; }
          .text-discovery-500 { color: #34d399; }
          .shadow-\[0_0_15px_rgba\(52,211,153,0.6\)\] { box-shadow: 0 0 15px rgba(52,211,153,0.6); }

          .bg-learning-500 { background-color: #fcd34d; }
          .text-learning-500 { color: #fcd34d; }
          .shadow-\[0_0_15px_rgba\(245,158,11,0.6\)\] { box-shadow: 0 0 15px rgba(245,158,11,0.6); }

          .bg-blue-400 { background-color: #60a5fa; } /* Tailwind blue-400 */
          .text-blue-400 { color: #60a5fa; }
          .shadow-\[0_0_15px_rgba\(96,165,250,0.6\)\] { box-shadow: 0 0 15px rgba(96,165,250,0.6); }

          .bg-cyan-400 { background-color: #22d3ee; } /* Tailwind cyan-400 */
          .text-cyan-400 { color: #22d3ee; }
          .shadow-\[0_0_15px_rgba\(34,211,238,0.6\)\] { box-shadow: 0 0 15px rgba(34,211,238,0.6); }
        `}</style>
    </div>
  );
};
