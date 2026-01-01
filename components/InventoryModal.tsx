
import React, { useState, useMemo } from 'react';
import { UserStats, MarketItem } from '../types';
import { MARKET_ITEMS } from '../constants';
import { X, Box, Zap, Sparkles, CheckCircle, Hammer, ChevronLeft } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface InventoryModalProps {
  userStats: UserStats;
  onUseItem: (itemId: string) => void;
  onEquipItem: (itemId: string) => void;
  onOpenCrafting: () => void;
  onClose: () => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ userStats, onUseItem, onEquipItem, onOpenCrafting, onClose }) => {
  const [filter, setFilter] = useState<'all' | 'powerup' | 'cosmetic' | 'material'>('all');
  
  // Group items by ID to handle stacks and prevent duplicate keys
  const inventoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    userStats.inventory.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });

    return Object.entries(counts).map(([id, count]) => {
      const item = MARKET_ITEMS.find(i => i.id === id);
      return item ? { ...item, count } : null;
    }).filter((i): i is MarketItem & { count: number } => !!i);
  }, [userStats.inventory]);

  const filteredItems = inventoryData.filter(item => filter === 'all' || item.category === filter);

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col animate-in slide-in-from-bottom duration-300 font-sans text-txt-main">
        
        {/* Header - Clean */}
        <div className="flex justify-between items-center p-6 bg-background/90 backdrop-blur-xl sticky top-0 z-10">
           <div className="flex items-center gap-4">
             <button onClick={onClose} className="p-2 -ml-2 text-txt-sub hover:text-txt-main rounded-full transition-colors">
                <ChevronLeft size={24} />
             </button>
             <h2 className="text-xl font-bold text-txt-main flex items-center gap-2">
               Inventory
             </h2>
           </div>
        </div>

        <div className="px-6 pb-6 flex-1 overflow-y-auto scrollbar-hide">
            {/* Action Banner - Simplified */}
            <button 
                onClick={onOpenCrafting}
                className="w-full mb-8 py-5 bg-gradient-to-r from-indigo-900/30 to-blue-900/30 rounded-2xl flex items-center justify-between px-6 hover:brightness-110 transition-all group border border-ln-base"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Hammer size={22} />
                    </div>
                    <div className="text-left">
                        <span className="font-bold text-txt-main text-base block mb-0.5">Crafting</span>
                        <span className="text-[10px] text-indigo-300 uppercase tracking-wider">Create Items</span>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <ChevronLeft size={18} className="rotate-180 text-white" />
                </div>
            </button>

            {/* Filters - Minimal Pills */}
            <div className="flex gap-2 mb-8 sticky top-0 z-10 overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => setFilter('all')}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${filter === 'all' ? 'bg-txt-main text-background' : 'bg-glass text-txt-sub hover:text-txt-main'}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilter('powerup')}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${filter === 'powerup' ? 'bg-blue-500 text-white' : 'bg-glass text-txt-sub hover:text-txt-main'}`}
                >
                    <Zap size={14} /> Power
                </button>
                <button 
                    onClick={() => setFilter('cosmetic')}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${filter === 'cosmetic' ? 'bg-purple-500 text-white' : 'bg-glass text-txt-sub hover:text-txt-main'}`}
                >
                    <Sparkles size={14} /> Style
                </button>
            </div>

            {/* Grid - Clean & Frameless */}
            <div className="pb-8">
            {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-txt-dim gap-4 opacity-50 py-20">
                    <Box size={48} strokeWidth={1.5} />
                    <p className="text-sm font-medium">Your inventory is empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                {filteredItems.map(item => {
                    const isEquipped = userStats.equippedFrame === item.id;
                    
                    return (
                    <div 
                        key={item.id} 
                        className="flex flex-col group relative items-center text-center"
                        style={{ contentVisibility: 'auto', containIntrinsicSize: '200px' }}
                    >
                        
                        {isEquipped && (
                            <div className="absolute top-0 right-0 text-primary z-10 bg-background rounded-full border border-primary p-0.5">
                                <CheckCircle size={16} fill="currentColor" className="text-background" />
                            </div>
                        )}

                        {/* Quantity Badge */}
                        {item.count > 1 && (
                             <div className="absolute top-0 left-2 z-10 bg-glass backdrop-blur-md border border-ln-base text-txt-main text-[10px] font-bold px-2 py-0.5 rounded-full">
                                x{item.count}
                             </div>
                        )}

                        {/* Floating Image without background card */}
                        <div className="relative w-28 h-28 mb-3 transition-transform duration-300 group-hover:scale-110">
                            <div className="absolute inset-0 bg-surface rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <OptimizedImage 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full relative z-10 drop-shadow-2xl" 
                                imgClassName="object-contain"
                            />
                        </div>
                        
                        <div className="flex-1 mb-3 w-full px-2">
                            <h4 className="font-bold text-sm text-txt-main leading-tight mb-1 truncate">{item.name}</h4>
                            <p className="text-[10px] text-txt-sub leading-tight line-clamp-2 min-h-[2.5em]">{item.description}</p>
                        </div>

                        {item.category === 'cosmetic' ? (
                            <button 
                            onClick={() => onEquipItem(item.id)}
                            className={`w-full py-2.5 font-bold text-[10px] rounded-xl uppercase tracking-wider transition-all ${
                                isEquipped 
                                    ? 'bg-glass text-txt-dim' 
                                    : 'bg-glass text-txt-main hover:bg-txt-main hover:text-background'
                            }`}
                            >
                            {isEquipped ? 'Equipped' : 'Equip'}
                            </button>
                        ) : (
                            <button 
                            onClick={() => onUseItem(item.id)}
                            className="w-full py-2.5 bg-glass text-txt-main font-bold text-[10px] rounded-xl uppercase tracking-wider hover:bg-txt-main hover:text-background transition-all"
                            >
                            Use Item
                            </button>
                        )}
                    </div>
                    );
                })}
                </div>
            )}
            </div>
        </div>
    </div>
  );
};

export default InventoryModal;
