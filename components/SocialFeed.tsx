
import React, { useState, useEffect, useRef } from 'react';
import { FeedPost, LeaderboardEntry, Friend, Material, Team } from '../types';
import { Heart, MessageCircle, MoreHorizontal, Trophy, Users, Shield, Crown, PlusCircle, LogIn, Clock, Loader, Check, X, MessageSquare, CheckCircle } from 'lucide-react';
import Leaderboard from './Leaderboard';
import FriendList from './FriendList';
import OptimizedImage from './OptimizedImage';
import { playSound } from '../services/audioService';

interface SocialFeedProps {
  posts: FeedPost[];
  leaderboardEntries: LeaderboardEntry[];
  currentUserRank: number;
  friends: Friend[];
  team: Team;
  globalTeams?: { id: string, name: string, rank: number, activity: string, members: any[], avatar: string, isPending?: boolean }[];
  onChat?: (friend: Friend) => void;
  onDuel?: (friend: Friend) => void;
  userMaterials: Material[];
  onOpenTeam?: () => void;
  onInspectAgent?: (agent: any) => void;
  onCreateTeam?: () => void;
  onJoinTeamRequest?: (teamId: string) => void;
  onCancelTeamRequest?: (teamId: string) => void;
  onSocialAction: (action: any, targetId: string) => void;
  outgoingFriendRequests?: string[];
  friendRequests?: any[];
  onLikePost: (postId: string) => void;
  onCommentPost: (postId: string, text: string) => void;
  onManageTeamRequest?: (userId: string, action: 'accept' | 'decline') => void;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ 
  posts, 
  leaderboardEntries, 
  currentUserRank, 
  friends, 
  team,
  globalTeams = [],
  onChat,
  onDuel,
  onOpenTeam,
  onInspectAgent,
  onCreateTeam,
  onJoinTeamRequest,
  onCancelTeamRequest,
  onSocialAction,
  outgoingFriendRequests,
  friendRequests = [],
  onLikePost,
  onCommentPost,
  onManageTeamRequest
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'ranking' | 'team' | 'friends'>('feed');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [inviteCode, setInviteCode] = useState('');
  const [isProcessingCode, setIsProcessingCode] = useState(false);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab !== 'feed') return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            setVisibleCount(prev => Math.min(prev + 5, posts.length));
        }
    }, { rootMargin: '400px' });
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [activeTab, posts.length]);

  const handleJoinByCode = () => {
      if (!inviteCode.trim() || !onJoinTeamRequest) return;
      setIsProcessingCode(true);
      let cleanId = inviteCode.trim().replace('JOIN-', '');
      setTimeout(() => {
          onJoinTeamRequest(cleanId);
          setInviteCode('');
          setIsProcessingCode(false);
          playSound('success');
      }, 800);
  };

  const visiblePosts = posts.slice(0, visibleCount);
  const isInTeam = !!team && ((team.members?.length > 0) || team.id !== 't1'); 
  const isLeader = team?.members?.find(m => m.id === 'me')?.role === 'leader';

  return (
    <div className="animate-in fade-in duration-300 pb-32 pt-0 overflow-y-auto h-full scrollbar-hide text-txt-main bg-background font-sans">
      
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-white/5 py-4 px-4 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
            {[
                { id: 'feed', label: 'Feed', icon: MessageCircle },
                { id: 'ranking', label: 'Ranking', icon: Trophy },
                { id: 'team', label: 'Teams', icon: Shield },
                { id: 'friends', label: 'Friends', icon: Users },
            ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id as any); playSound('click'); }}
                        className={`
                            flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all border
                            ${isActive 
                                ? 'bg-primary text-white border-primary/50 shadow-glow' 
                                : 'bg-surface border-white/10 text-txt-dim hover:text-white hover:border-white/20'
                            }
                        `}
                    >
                        <Icon size={16} className={isActive ? 'text-white' : 'text-current'} />
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'ranking' && (
            <div className="px-6">
                <Leaderboard entries={leaderboardEntries} currentUserRank={currentUserRank} onInspect={onInspectAgent} />
            </div>
        )}

        {activeTab === 'friends' && (
            <div className="px-6">
                <FriendList 
                    friends={friends} 
                    onAddFriend={() => {}} 
                    onChat={(f) => onChat?.(f)} 
                    onDuel={(f) => onDuel?.(f)} 
                    onInspectAgent={onInspectAgent} 
                    onSocialAction={onSocialAction}
                    outgoingRequests={outgoingFriendRequests}
                    incomingRequests={friendRequests}
                />
            </div>
        )}

        {activeTab === 'team' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-300 px-6">
            {isInTeam && (
                <div className="space-y-6">
                    <div onClick={onOpenTeam} className="group cursor-pointer relative">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-500">
                                <OptimizedImage src={team.avatar} alt={team.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-txt-main text-2xl uppercase tracking-tight leading-none mb-2">{team.name}</h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-primary uppercase border border-primary/30 px-2 py-0.5 rounded-md">Rank #{team.rank}</span>
                                    <span className="text-[10px] text-txt-dim font-bold uppercase">{(team.members?.length || 0)} Members</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isLeader && team.joinRequests?.length > 0 && (
                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-3xl space-y-3">
                            <h5 className="text-[10px] font-black text-primary uppercase tracking-widest px-1">Join Requests ({team.joinRequests.length})</h5>
                            {team.joinRequests.map(req => (
                                <div key={req.userId} className="flex items-center justify-between bg-surface border border-white/5 p-3 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5"><OptimizedImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${req.avatar}`} alt="" /></div>
                                        <span className="text-xs font-bold text-white">{req.username}</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => onManageTeamRequest?.(req.userId, 'accept')} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><Check size={14} strokeWidth={3} /></button>
                                        <button onClick={() => onManageTeamRequest?.(req.userId, 'decline')} className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><X size={14} strokeWidth={3} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!isInTeam && (
                <div className="space-y-6">
                    <button 
                            onClick={onCreateTeam}
                            className="w-full py-10 border border-dashed border-white/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-txt-dim hover:text-primary hover:border-primary/50 transition-all group hover:bg-white/5"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all mb-1">
                                <PlusCircle size={24} />
                            </div>
                            Create Team
                        </button>

                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="TEAM CODE"
                                className="flex-1 bg-transparent border-b border-white/20 px-4 py-3 text-sm font-mono text-txt-main outline-none focus:border-primary transition-all font-bold uppercase placeholder:text-txt-dim"
                            />
                            <button 
                                onClick={handleJoinByCode}
                                disabled={!inviteCode.trim() || isProcessingCode}
                                className="text-primary font-black uppercase text-xs tracking-widest disabled:opacity-50"
                            >
                                {isProcessingCode ? <Loader size={16} className="animate-spin" /> : "Join"}
                            </button>
                        </div>
                </div>
            )}

            <div className="pt-4">
                <h3 className="text-[10px] font-black text-txt-dim uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    Community Groups
                </h3>
                <div className="space-y-6">
                    {globalTeams.map((teamItem) => (
                        <div key={teamItem.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <span className="font-mono font-bold text-txt-dim/50 text-sm">#{teamItem.rank}</span>
                            <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden border border-white/10 group-hover:scale-105 transition-transform">
                                <OptimizedImage src={teamItem.avatar} alt={teamItem.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-bold text-txt-main text-sm group-hover:text-primary transition-colors uppercase tracking-tight leading-none mb-1">{teamItem.name}</h4>
                                <p className="text-[9px] text-txt-dim uppercase tracking-wider">
                                    {(teamItem.members?.length || 0)} Members
                                </p>
                            </div>
                        </div>
                        {!isInTeam && (
                            <button 
                                onClick={() => teamItem.isPending ? onCancelTeamRequest?.(teamItem.id) : onJoinTeamRequest?.(teamItem.id)}
                                className={`p-2 rounded-full transition-all border ${teamItem.isPending ? 'border-primary text-primary' : 'border-white/10 text-txt-dim hover:text-white'}`}
                            >
                                {teamItem.isPending ? <Clock size={14} /> : <LogIn size={14} />}
                            </button>
                        )}
                        </div>
                    ))}
                </div>
            </div>
            </div>
        )}
        
        {activeTab === 'feed' && (
            <div className="space-y-12 pb-12">
            {visiblePosts.map(post => (
                <div key={post.id} className="group relative">
                <div className="px-6 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-white/5">
                            <OptimizedImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.avatarSeed}`} className="w-full h-full" alt="" />
                        </div>
                        <div>
                            <h4 className="font-bold text-txt-main text-sm leading-none mb-0.5">{post.username}</h4>
                            <span className="text-txt-dim text-[9px] font-medium block">{post.timeAgo}</span>
                        </div>
                    </div>
                    <button className="text-txt-dim p-2 hover:text-white transition-colors"><MoreHorizontal size={18} /></button>
                </div>
                
                <div className="w-full aspect-square bg-white/5 relative mb-4">
                    <OptimizedImage src={post.image} className="w-full h-full object-cover" alt="Discovery" />
                    <div className="absolute bottom-4 right-4 flex gap-3">
                        <button onClick={() => onLikePost(post.id)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-all active:scale-90">
                            <Heart size={18} fill={post.isLiked ? "#f43f5e" : "none"} className={post.isLiked ? "text-rose-500" : ""} />
                        </button>
                        <button onClick={() => setActiveCommentId(post.id)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-all active:scale-90">
                            <MessageSquare size={18} />
                        </button>
                    </div>
                </div>

                <div className="px-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary border border-primary/30 px-1.5 py-0.5 rounded">{post.questTitle}</span>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold uppercase tracking-widest">
                            <CheckCircle size={10} /> Verified
                        </div>
                    </div>
                    <p className="text-sm text-txt-sub font-medium leading-relaxed">
                        {post.caption}
                    </p>
                    {post.likes > 0 && <p className="text-[10px] font-bold text-txt-dim mt-2">{post.likes} Likes</p>}
                </div>
                
                <div className="mx-6 mt-6 h-px bg-white/5 group-last:hidden"></div>
                </div>
            ))}
            {visibleCount < posts.length && (
                <div ref={loadMoreRef} className="py-8 flex justify-center"><Loader size={20} className="animate-spin text-primary" /></div>
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
