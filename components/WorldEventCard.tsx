
import React from 'react';
import { WorldEvent } from '../types';
import { ShieldAlert, Users } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface WorldEventCardProps {
  event: WorldEvent;
  onJoin: (event: WorldEvent) => void;
}

const WorldEventCard: React.FC<WorldEventCardProps> = ({ event, onJoin }) => {
  const healthPercent = (event.currentHealth / event.targetHealth) * 100;

  return (
    <div
      onClick={() => onJoin(event)}
      className="relative w-full h-40 rounded-[2rem] overflow-hidden group cursor-pointer border border-white/10 will-change-transform transition-transform duration-300 active:scale-95"
    >
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          src="/assets/quests/story_adventure.png"
          alt="Event"
          className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
      </div>

      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
            Special Event
          </div>
          <div className="bg-black/60 px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
            <Users size={10} className="text-white/60" />
            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Live</span>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-tight">{event.title}</h3>

          <div className="space-y-1.5">
            <div className="flex justify-between items-end text-[9px] font-bold text-gray-500 uppercase tracking-widest">
              <span>Goal Progress</span>
              <span>{Math.round(healthPercent)}%</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-1000"
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldEventCard;
