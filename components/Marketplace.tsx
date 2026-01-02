
import React, { useState } from 'react';
import { MarketItem, UserStats } from '../types';
import { MarketItem as MarketItemType } from '../types'; // Fix for type name conflict if needed
import { ShoppingBag, Zap, Sparkles, Coins, ArrowLeft, Check, Ticket, ChevronRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface MarketplaceProps {
    userStats: UserStats;
    items: MarketItem[];
    onBuy: (item: MarketItem) => void;
    onBack: () => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ userStats, items, onBuy, onBack }) => {
    const [filter, setFilter] = useState<'all' | 'powerup' | 'cosmetic' | 'ticket'>('all');

    const filteredItems = items.filter(item => filter === 'all' || item.category === filter);

    return (
        <div className="animate-in slide-in-from-right duration-300 min-h-screen bg-background pb-20 relative overflow-x-hidden font-sans text-txt-main">

            <div className="sticky top-0 z-20 bg-surface/90 backdrop-blur-xl border-b border-ln-base p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Shop
                    </h2>
                </div>
                <div className="bg-white/10 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
                    <Coins size={16} className="text-amber-400 fill-amber-400" />
                    <span className="font-extrabold text-sm text-white">{userStats.coins.toLocaleString()}</span>
                </div>
            </div>

            <div className="px-6 py-6">
                <div className="h-56 rounded-[2.5rem] relative overflow-hidden group shadow-soft mb-8 border border-white/10">
                    <OptimizedImage
                        src="https://image.pollinations.ai/prompt/vibrant%20colorful%20gift%20box%20abstract%20lifestyle?width=800&height=400&nologo=true"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        alt="Featured"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 max-w-xs text-left">
                        <span className="px-3 py-1 bg-white text-purple-900 text-[9px] font-black uppercase rounded-lg mb-3 inline-block shadow-lg tracking-widest">New Arrivals</span>
                        <h3 className="text-3xl font-extrabold text-white leading-tight mb-2 drop-shadow-md">Explorer Packs</h3>
                        <p className="text-xs text-white/90 font-medium mb-6">Limited edition gear for your next journey.</p>
                        <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all shadow-xl active:scale-95">
                            Check Collection <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${filter === 'all' ? 'bg-white text-slate-900 border-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('powerup')}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${filter === 'powerup' ? 'bg-blue-500 text-white border-blue-500 shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                    >
                        <Zap size={14} fill="currentColor" /> Boosts
                    </button>
                    <button
                        onClick={() => setFilter('cosmetic')}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${filter === 'cosmetic' ? 'bg-purple-500 text-white border-purple-500 shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                    >
                        <Sparkles size={14} fill="currentColor" /> Style
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    {filteredItems.map(item => {
                        const isOwned = userStats.inventory.includes(item.id);
                        const canAfford = userStats.coins >= item.price;
                        const isPowerup = item.category === 'powerup';

                        return (
                            <div key={item.id} className={`flex flex-col rounded-[2.5rem] p-3 shadow-lg hover:shadow-xl transition-all duration-300 group border overflow-hidden relative ${isPowerup ? 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30' : 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30'
                                }`}>

                                <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 bg-black/20">
                                    <OptimizedImage
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full transition-all duration-700 group-hover:scale-110"
                                        imgClassName="object-contain p-4"
                                    />
                                    <div className={`absolute inset-0 opacity-5 ${isPowerup ? 'bg-blue-500' : 'bg-purple-500'}`}></div>

                                    <div className="absolute top-3 right-3">
                                        {isOwned && (
                                            <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-md">
                                                <Check size={14} strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="px-2 mb-4 text-center">
                                    <span className={`text-[9px] font-black uppercase tracking-widest mb-1 block ${isPowerup ? 'text-blue-400' : 'text-purple-400'
                                        }`}>
                                        {item.category}
                                    </span>
                                    <h4 className="font-extrabold text-sm text-white leading-tight mb-1">{item.name}</h4>
                                </div>

                                <div className="mt-auto relative z-10">
                                    {isOwned ? (
                                        <button disabled className="w-full py-3 bg-white/5 text-white/50 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-white/10">
                                            Owned
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => canAfford && onBuy(item)}
                                            disabled={!canAfford}
                                            className={`w-full py-3 font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md ${canAfford
                                                    ? 'bg-white text-slate-900 hover:bg-slate-100 active:scale-95'
                                                    : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                                                }`}
                                        >
                                            <Coins size={12} className={canAfford ? "text-amber-500 fill-amber-500" : "text-white/30"} />
                                            {item.price}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
