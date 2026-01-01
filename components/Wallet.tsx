
import React, { useState } from 'react';
import { UserStats, Transaction, AppSettings } from '../types';
import { ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, CreditCard, History, Lock, ShoppingBag, ChevronLeft, MoreHorizontal, Loader, Eye, EyeOff, Plus } from 'lucide-react';
import { playSound } from '../services/audioService';
import OptimizedImage from './OptimizedImage';

interface WalletProps {
  stats: UserStats;
  transactions: Transaction[];
  settings?: AppSettings;
  onClose: () => void;
  onGoToShop: () => void;
  onWithdraw?: (amount: number) => void;
}

const Wallet: React.FC<WalletProps> = ({ stats, transactions, settings, onClose, onGoToShop, onWithdraw }) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showBalance, setShowBalance] = useState(!settings?.streamerMode);

  const handleWithdraw = () => {
      if (stats.coins < 500) {
          return;
      }
      setIsWithdrawing(true);
      playSound('click');
      if (onWithdraw) {
          onWithdraw(500); // Fixed withdrawal amount for now
      }
      setTimeout(() => {
          setIsWithdrawing(false);
      }, 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right duration-500 min-h-screen pb-20 relative overflow-hidden bg-background font-sans text-txt-main">
        
        <div className="flex items-center justify-between p-6 pt-safe">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-bold tracking-tight text-white">Wallet</h2>
            <button className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                <MoreHorizontal size={24} />
            </button>
        </div>

        <div className="px-6 relative z-10">
            {/* Glass Card */}
            <div className="relative w-full aspect-[1.6/1] rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 group perspective-1000">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-sky-500"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-[80px] opacity-20"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-300 rounded-full blur-[80px] opacity-30"></div>
                
                <div className="relative h-full p-8 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-md border border-white/20">
                            <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
                        </div>
                        <div className="opacity-80">
                            <WalletIcon size={24} />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-baseline gap-2 mb-1">
                            <h1 className="text-4xl font-mono font-bold tracking-tight">
                                {showBalance ? stats.coins.toLocaleString() : '••••••'}
                            </h1>
                            <span className="text-sm font-medium opacity-80">QC</span>
                        </div>
                        <p className="text-xs opacity-60 font-medium">
                            {showBalance ? `≈ $${(stats.coins * 0.01).toFixed(2)} USD` : '≈ $••• USD'}
                        </p>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-1">Holder</span>
                            <span className="text-sm font-bold tracking-wide">{stats.username.toUpperCase()}</span>
                        </div>
                        <button onClick={() => setShowBalance(!showBalance)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <button 
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || stats.coins < 500}
                    className="h-16 bg-surface border border-white/10 rounded-[2rem] flex items-center justify-center gap-3 font-bold text-sm text-white hover:bg-white/5 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                >
                    {isWithdrawing ? <Loader className="animate-spin" size={18} /> : <ArrowUpRight size={18} />}
                    Withdraw
                </button>
                <button 
                    onClick={onGoToShop}
                    className="h-16 bg-white text-slate-900 rounded-[2rem] flex items-center justify-center gap-3 font-bold text-sm hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
                >
                    <ShoppingBag size={18} />
                    Shop
                </button>
            </div>

            {/* Transactions */}
            <div className="pb-10">
                <div className="flex items-center justify-between mb-6 px-1">
                    <h3 className="text-sm font-bold text-white">Recent Activity</h3>
                    <button className="text-xs font-bold text-primary hover:text-primary/80">View All</button>
                </div>
                
                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <div className="text-center py-10 opacity-40">
                            <History size={32} className="mx-auto mb-2 text-slate-400" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No transactions</p>
                        </div>
                    ) : (
                        transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 bg-surface border border-white/5 rounded-3xl hover:border-white/10 transition-all shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                        tx.type === 'earn' ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-slate-400'
                                    }`}>
                                        {tx.type === 'earn' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-white mb-0.5">{tx.source}</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{tx.date}</div>
                                    </div>
                                </div>
                                <span className={`font-mono font-bold text-sm ${tx.type === 'earn' ? 'text-green-500' : 'text-white'}`}>
                                    {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Wallet;
