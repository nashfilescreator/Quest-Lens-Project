
import React from 'react';
import { X, Trophy, Frown, Zap, Coins, ArrowRight } from 'lucide-react';
import { playSound } from '../services/audioService';

interface DuelResultModalProps {
  didWin: boolean;
  opponentName: string;
  opponentAvatar: string;
  onClose: () => void;
}

const DuelResultModal: React.FC<DuelResultModalProps> = ({ didWin, opponentName, opponentAvatar, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-500">
      
      <div className={`relative w-full max-w-sm p-1 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 ${didWin ? 'bg-white border-2 border-green-500' : 'bg-white border-2 border-slate-200'}`}>
        
        <div className="relative bg-white rounded-[2.3rem] p-8 flex flex-col items-center text-center">
            
            <div className="mb-8 relative">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg relative z-10 border-4 border-white ${didWin ? 'bg-green-500 text-white' : 'bg-slate-400 text-white'}`}>
                    {didWin ? <Trophy size={48} fill="currentColor" /> : <Frown size={48} />}
                </div>
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse ${didWin ? 'bg-green-500' : 'bg-slate-500'}`}></div>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Challenge Outcome</h2>
            <h1 className={`text-4xl font-display font-bold uppercase mb-2 ${didWin ? 'text-green-600' : 'text-slate-700'}`}>
                {didWin ? 'Well Done!' : 'Nice Try'}
            </h1>
            <p className="text-sm text-slate-500 mb-8 font-medium">
                {didWin ? `You found the target before ${opponentName}.` : `${opponentName} was a bit faster this time.`}
            </p>

            <div className="w-full grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-primary mb-1">
                        <Zap size={14} fill="currentColor" />
                        <span className="text-[10px] font-bold uppercase">XP</span>
                    </div>
                    <span className="text-xl font-bold text-slate-900">{didWin ? '+200' : '+20'}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                        <Coins size={14} fill="currentColor" />
                        <span className="text-[10px] font-bold uppercase">Coins</span>
                    </div>
                    <span className="text-xl font-bold text-slate-900">{didWin ? '+90' : '-20'}</span>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="w-full py-4 bg-primary text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                Back to Dashboard <ArrowRight size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default DuelResultModal;
