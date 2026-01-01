
import React, { useState } from 'react';
import { Material, Recipe, UserStats, MarketItem } from '../types';
import { X, Cpu, ArrowRight, Check, Sparkles, ChevronRight, Hammer, AlertCircle, Loader } from 'lucide-react';
import { playSound } from '../services/audioService';
import OptimizedImage from './OptimizedImage';

interface CraftingStationProps {
  stats: UserStats;
  recipes: Recipe[];
  items: MarketItem[];
  onCraft: (recipe: Recipe) => void;
  onClose: () => void;
}

const CraftingStation: React.FC<CraftingStationProps> = ({ stats, recipes, items, onCraft, onClose }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);
  const [craftSuccess, setCraftSuccess] = useState(false);

  const handleCraft = () => {
    if (!selectedRecipe || !canCraft(selectedRecipe)) return;
    
    playSound('click');
    setIsCrafting(true);
    
    setTimeout(() => {
       setIsCrafting(false);
       setCraftSuccess(true);
       playSound('hero');
       onCraft(selectedRecipe);
       
       setTimeout(() => {
          setCraftSuccess(false);
          setSelectedRecipe(null);
       }, 2000);
    }, selectedRecipe.duration);
  };

  const getMaterialCount = (matId: string) => {
    return stats.materials.find(m => m.id === matId)?.count || 0;
  };

  const canCraft = (recipe: Recipe) => {
    return recipe.ingredients.every(ing => getMaterialCount(ing.materialId) >= ing.count);
  };

  return (
    <div className="fixed top-[56px] bottom-[64px] left-0 right-0 z-40 bg-background flex flex-col animate-in slide-in-from-bottom duration-300 font-sans shadow-2xl">
       
       <div className="flex-none bg-background/95 backdrop-blur-xl px-6 py-4 border-b border-ln-base flex items-center justify-between z-20">
         <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-glass rounded-full transition-colors text-txt-sub">
               <X size={24} />
            </button>
            <div>
               <h2 className="text-xl font-bold text-txt-main tracking-tight">Crafting Station</h2>
               <p className="text-[10px] text-txt-dim font-bold uppercase tracking-widest">Create Items</p>
            </div>
         </div>
         <Sparkles size={20} className="text-primary opacity-80" />
       </div>

       <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-hide relative w-full">
          
          <section>
             <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[10px] font-bold text-txt-dim uppercase tracking-widest">My Supplies</h3>
                <span className="text-[10px] font-mono text-txt-dim">{stats.materials.length} ITEMS</span>
             </div>
             
             <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {stats.materials.map(mat => (
                   <div key={mat.id} className="flex-shrink-0 flex flex-col items-center gap-2 group min-w-[60px] snap-center">
                      <div className={`w-14 h-14 rounded-2xl bg-surface border flex items-center justify-center p-2.5 transition-all group-hover:scale-105 ${mat.count > 0 ? 'border-ln-base' : 'border-red-200 grayscale opacity-40'}`}>
                         <OptimizedImage 
                            src={mat.image} 
                            alt={mat.name} 
                            className="w-full h-full"
                            imgClassName="object-contain" 
                         />
                      </div>
                      <div className="text-center">
                        <span className={`text-xs font-bold block ${mat.count > 0 ? 'text-txt-main' : 'text-red-400'}`}>x{mat.count}</span>
                        <span className="text-[8px] text-txt-dim font-bold uppercase tracking-tight block max-w-[60px] truncate">{mat.name}</span>
                      </div>
                   </div>
                ))}
             </div>
          </section>

          <section className="pb-4">
             <div className="flex items-center gap-2 mb-3 px-1">
                <h3 className="text-[10px] font-bold text-txt-dim uppercase tracking-widest">Item Recipes</h3>
             </div>
             
             <div className="space-y-3">
                {recipes.map(recipe => {
                   const resultItem = items.find(i => i.id === recipe.resultItemId);
                   const available = canCraft(recipe);
                   const isSelected = selectedRecipe?.id === recipe.id;
                   
                   if (!resultItem) return null;

                   return (
                      <button 
                        key={recipe.id}
                        onClick={() => { playSound('click'); setSelectedRecipe(recipe); }}
                        className={`w-full relative overflow-hidden rounded-3xl transition-all duration-300 text-left group px-5 py-4 border ${
                           isSelected 
                              ? 'bg-primary/5 border-primary shadow-sm' 
                              : 'bg-surface border-ln-base hover:bg-glass'
                        }`}
                      >
                         <div className="flex gap-4 items-center relative z-10">
                            <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                               <OptimizedImage 
                                    src={resultItem.image} 
                                    alt={resultItem.name} 
                                    className="w-full h-full relative z-10"
                                    imgClassName="object-contain" 
                               />
                            </div>

                            <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-center mb-1">
                                  <h4 className={`font-bold text-base transition-colors ${isSelected ? 'text-primary' : 'text-txt-main'}`}>{recipe.name}</h4>
                                  {available && !isSelected && <Sparkles size={14} className="text-amber-400 animate-pulse" />}
                                </div>
                               
                               <div className="flex flex-wrap items-center gap-3">
                                  {recipe.ingredients.map(ing => {
                                     const mat = stats.materials.find(m => m.id === ing.materialId);
                                     const hasEnough = (mat?.count || 0) >= ing.count;
                                     return (
                                        <span key={ing.materialId} className={`text-[10px] font-bold flex items-center gap-1 ${hasEnough ? 'text-txt-dim' : 'text-rose-500'}`}>
                                           {mat?.count || 0}/{ing.count} {mat?.name.split(' ')[0]}
                                        </span>
                                     );
                                  })}
                               </div>
                            </div>
                            
                            <ChevronRight size={18} className={`transition-all ${isSelected ? 'text-primary rotate-90' : 'text-txt-dim group-hover:text-txt-main'}`} />
                         </div>
                         
                         {isSelected && isCrafting && (
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/10">
                               <div className="h-full bg-primary transition-all duration-100 ease-linear" style={{ width: '100%' }}></div>
                            </div>
                         )}

                         {isSelected && craftSuccess && (
                            <div className="absolute inset-0 bg-green-500/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300 z-20">
                               <div className="flex items-center gap-2 text-white">
                                  <Check size={20} strokeWidth={3} />
                                  <span className="font-bold uppercase tracking-widest text-xs">Ready!</span>
                               </div>
                            </div>
                         )}
                      </button>
                   );
                })}
             </div>
          </section>
       </div>

       <div className="flex-none p-6 bg-background/95 backdrop-blur-xl border-t border-ln-base z-30">
          <button
            onClick={handleCraft}
            disabled={!selectedRecipe || !canCraft(selectedRecipe) || isCrafting || craftSuccess}
            className={`w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                !selectedRecipe
                    ? 'bg-surface text-txt-dim border border-ln-base'
                    : canCraft(selectedRecipe) 
                        ? 'bg-primary text-white hover:brightness-110 active:scale-95' 
                        : 'bg-red-50 text-red-400 border border-red-100'
            }`}
          >
            {isCrafting ? (
                <><Loader className="animate-spin" size={18} /> Making Item...</>
            ) : craftSuccess ? (
                <><Check size={18} strokeWidth={3} /> Success</>
            ) : !selectedRecipe ? (
                <>Select a Recipe</>
            ) : canCraft(selectedRecipe) ? (
                <>Create Now <ArrowRight size={18} /></>
            ) : (
                <><AlertCircle size={18} /> Need more supplies</>
            )}
          </button>
       </div>

    </div>
  );
};

export default CraftingStation;
