
import React, { Component, useState, useEffect, Suspense, ReactNode, useCallback, memo, useMemo, useTransition } from 'react';
import { LayoutDashboard, Users, MapPin, Scan, Sparkles, X, Trophy, Zap, Clock, Loader, AlertTriangle, Compass, BookOpen, User as UserIcon } from 'lucide-react';
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Quest, ValidationResult, QuestType, ViewState, AppSettings, Friend, StoryStep, Notification, DiscoveryResult, TeamMission, UserStats, FeedPost, AppRole, Skill } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import { useDuel } from './hooks/useDuel';
import { playSound } from './services/audioService';
import { INITIAL_SETTINGS, RECIPES, INITIAL_STATS } from './constants';
import { identifyDiscovery } from './services/geminiService';

// Components
import { CameraCapture } from './components/CameraCapture';
import UserProfile from './components/UserProfile';
import CreateQuest from './components/CreateQuest';
import { QuestRadar } from './components/QuestRadar';
import LevelUpModal from './components/LevelUpModal';
import SocialFeed from './components/SocialFeed';
import Wallet from './components/Wallet';
import Onboarding from './components/Onboarding';
import Auth from './components/Auth';
import RoleSelection from './components/RoleSelection';
import StoryPath from './components/StoryPath';
import NotificationCenter from './components/NotificationCenter';
import Settings from './components/Settings';
import QuestDetail from './components/QuestDetail';
import DailyBonusModal from './components/DailyBonusModal';
import Marketplace from './components/Marketplace';
import EditProfileModal from './components/EditProfileModal';
import InventoryModal from './components/InventoryModal';
import Dashboard from './components/Dashboard';
import TopBar from './components/TopBar';
import QuestCompletion from './components/QuestCompletion';
import ActiveQuests from './components/ActiveQuests';
import QuestJournal from './components/QuestJournal';
import TeamHub from './components/TeamHub';
import Toast from './components/Toast';
import SkillDock from './components/SkillDock';
import RegionSelection from './components/RegionSelection';
import { useUIStore } from './store/uiStore';

// Lazy Loaded Components
const Oracle = React.lazy(() => import('./components/Oracle'));
const Scanner = React.lazy(() => import('./components/Scanner'));
const CraftingStation = React.lazy(() => import('./components/CraftingStation'));
const ARLens = React.lazy(() => import('./components/ARLens'));
const AgentProfileModal = React.lazy(() => import('./components/AgentProfileModal'));
const TeamChat = React.lazy(() => import('./components/TeamChat'));
const DuelLobby = React.lazy(() => import('./components/DuelLobby'));

interface ErrorBoundaryProps { children?: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(_error: any): ErrorBoundaryState { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("App Error:", error, errorInfo); }
  render() {
    const { children } = (this as any).props;
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6 text-txt-main">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-txt-sub text-sm mb-6">The application encountered an unexpected error.</p>
          <button onClick={() => { window.location.reload(); }} className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg">Restart App</button>
        </div>
      );
    }
    return children;
  }
}

const MemoizedTopBar = memo(TopBar);
const MemoizedDashboard = memo(Dashboard);

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

function GameContent() {
  const {
    view, changeView, activeQuest, setActiveQuest, activeStoryStep, setActiveStoryStep,
    completionData, setCompletionData, discoveryContext, setDiscoveryContext,
    editingQuest, setEditingQuest, scannerMode, setScannerMode,
    activeModals, openModal, closeModal, activeToast, setToast, inspectedAgent,
    isCameraOpen, setIsCameraOpen, isTeamContribution, setIsTeamContribution
  } = useUIStore();

  const {
    stats, setStats, quests, worldEvents, isRefreshing, refreshAIQuests,
    team, posts, setPosts, notifications, processQuestCompletion, handleDiscovery, handleCrafting,
    handleSocialAction, handleUseSkill, handleCancelSkill,
    leaderboard, friends, friendRequests, userRank, globalTeams,
    addNotification, likePost, commentPost, updateTeamMission, cancelTeamMission, contributeToTeamMission,
    claimDailyBonus, handlePurchase, handleUseItem, handleEquipItem, respondToTeamInvite, joinTeam, cancelJoinTeam,
    kickMember, handleUpdateProfile, handleUpdateSettings, createTeam, markNotificationRead, clearAllNotifications,
    contributeToWorldEvent, manageTeamRequest
  } = useGameLogic(INITIAL_SETTINGS);

  // Derived settings from stats, or fallback to default
  const settings = stats.settings || INITIAL_SETTINGS;

  // Determine localUid from stats or auth? useGameLogic uses useConvexAuth now.
  // We can get the ID from stats if available.
  const localUid = stats?.uid || 'user';

  const { matchState, opponent, joinQueue, reportVictory } = useDuel(localUid);

  const createUser = useMutation(api.users.create);

  // Ensure user exists in DB
  useEffect(() => {
    // If stats are initial (fallback), we might need to create the user in DB
    // But useGameLogic only falls back if userQuery returns null.
    // So if we are here (Authenticated), and stats.username is 'Explorer' (default), 
    // it probably means we need to create the user doc.
    // However, useGameLogic returns INITIAL_STATS when user is undefined.

    // Better check: query if user exists, if not create.
    // But we don't want to query inside useEffect if possible.
    // useGameLogic already queries currentUser.

    // Let's rely on useGameLogic's `stats` being the source of truth.
    // If we want to force creation:
    if (!stats._id) {
      createUser({
        username: "Explorer", // Default, could prompt user
        avatarSeed: "Felix",
        initialStats: INITIAL_STATS
      });
    }
  }, [createUser, stats._id]);

  const handleJoinQuest = useCallback((quest: Quest) => {
    const isCompleted = stats.completedQuestIds?.includes(quest.id);
    if (!isCompleted && !stats.activeQuestIds?.includes(quest.id)) {
      setStats((prev: any) => ({ ...prev, activeQuestIds: [...prev.activeQuestIds, quest.id] }));
    }
    setActiveQuest(quest);
    setActiveStoryStep(null);
    changeView('active-quest');
  }, [stats.completedQuestIds, stats.activeQuestIds, changeView, setStats, setActiveQuest, setActiveStoryStep]);

  const handleOpenNewQuest = useCallback(() => {
    setDiscoveryContext(null);
    setEditingQuest(null);
    changeView('create', true);
  }, [changeView, setDiscoveryContext, setEditingQuest]);

  const handleValidationSuccess = useCallback(async (result: ValidationResult, capturedImage: string) => {
    closeModal('scanner');
    setIsCameraOpen(false);

    if (view === 'duel') {
      await reportVictory();
      return;
    }

    if (isTeamContribution) {
      const res = await contributeToTeamMission(result.confidence);
      setIsTeamContribution(false);
      playSound('success');
      if (res.isComplete) {
        setCompletionData({ result: { success: true, message: "Team mission achieved!" }, image: capturedImage, rewards: { xp: 500, coins: 100 } });
      } else {
        setToast({ id: `team-${Date.now()}`, title: "Intel Uploaded", message: `+${res.amountAdded} mission progress.`, type: 'success', timestamp: 'Now', read: false });
      }
      return;
    }

    if (scannerMode === 'quest' && activeQuest) {
      const rewards = await processQuestCompletion(activeQuest, activeStoryStep, capturedImage);
      if (rewards?.levelUp) openModal('levelUp');
      playSound('success');
      setCompletionData({ result, image: capturedImage, rewards });
    } else if (scannerMode === 'free') {
      try {
        const discovery = await identifyDiscovery(capturedImage);
        handleDiscovery(discovery, capturedImage);
        setCompletionData({ discovery, result: { success: true, message: discovery.description }, image: capturedImage, rewards: { xp: discovery.xpValue, coins: 50 } });
      } catch (e) {
        setToast({ id: 'err', title: 'Error', message: 'Could not identify item.', type: 'error', timestamp: 'now', read: false });
      }
    }
  }, [view, isTeamContribution, contributeToTeamMission, reportVictory, scannerMode, activeQuest, activeStoryStep, processQuestCompletion, handleDiscovery, closeModal, setIsCameraOpen, setIsTeamContribution, setCompletionData, setToast, openModal]);

  const isFullScreenView = useMemo(() => ['oracle', 'ar-lens', 'duel', 'scanner', 'edit-profile', 'role-selection', 'region-selection', 'team-chat', 'create'].includes(view), [view]);
  const showBottomBar = useMemo(() => !isFullScreenView && !['active-quest', 'story-path', 'team', 'settings', 'create', 'market', 'journal', 'my-quests'].includes(view), [isFullScreenView, view]);

  return (
    <div className={`min-h-screen bg-background text-txt-main relative overflow-hidden flex flex-col ${isFullScreenView ? '' : 'pt-[52px]'} ${showBottomBar ? 'pb-[72px]' : ''}`}>
      {!isFullScreenView && <MemoizedTopBar stats={stats} notifications={notifications} />}
      <main className={`flex-1 relative z-10 overflow-hidden`}>
        <ErrorBoundary>
          <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-background"><Loader className="animate-spin text-primary" size={32} /></div>}>
            {/* Removed internal Auth/Onboarding routing, handled by wrappers now */}
            {view === 'onboarding' && <Onboarding onComplete={() => { localStorage.setItem('questLens_onboarded', 'true'); changeView('role-selection'); }} />}
            {/* view === 'auth' is no longer reachable ideally, but if it is, redirect */}
            {view === 'auth' && <RoleSelection username={stats.username} onComplete={(roles) => { setStats((p: any) => ({ ...p, activeRoles: roles })); changeView('feed'); }} />}

            {view === 'role-selection' && <RoleSelection username={stats.username} onComplete={(roles) => { setStats((p: any) => ({ ...p, activeRoles: roles })); changeView('feed'); }} />}
            {view === 'feed' && <MemoizedDashboard stats={stats} quests={quests} worldEvents={worldEvents} filter={'ALL'} setFilter={() => { }} onJoinQuest={handleJoinQuest} onEditQuest={(q) => { setEditingQuest(q); changeView('create'); }} onRefreshAIQuests={() => refreshAIQuests()} isRefreshing={isRefreshing} onContributeEvent={contributeToWorldEvent} />}
            {view === 'map' && <QuestRadar quests={quests} onQuestSelect={handleJoinQuest} openARLens={() => changeView('ar-lens')} userStats={stats} />}
            {view === 'ar-lens' && <ARLens onClose={() => changeView('map')} quests={quests} onQuestSelect={handleJoinQuest} activeBuffs={stats.activeBuffs} />}
            {view === 'active-quest' && activeQuest && <QuestDetail quest={activeQuest} isCompleted={stats.completedQuestIds?.includes(activeQuest.id)} />}
            {view === 'story-path' && activeQuest && <StoryPath quest={activeQuest} onBack={() => changeView('active-quest')} onStartStep={(step) => { setActiveStoryStep(step); setIsCameraOpen(true); }} />}
            {view === 'my-quests' && <ActiveQuests allQuests={quests} activeQuestIds={stats.activeQuestIds} activeTeamMission={team?.activeMission} onBack={() => changeView('feed')} onResume={handleJoinQuest} onAbandon={(id) => setStats((p: any) => ({ ...p, activeQuestIds: p.activeQuestIds.filter((qid: any) => qid !== id) }))} onAbandonTeamMission={cancelTeamMission} />}
            {view === 'profile' && <UserProfile stats={stats} />}
            {view === 'settings' && <Settings settings={settings} stats={stats} onUpdateSettings={handleUpdateSettings} onUpdateStats={setStats} onBack={() => changeView('profile')} onLogout={() => { /* Clerk logout handled in settings? */ window.location.reload(); }} onResetData={() => { localStorage.clear(); window.location.reload(); }} onEditProfile={() => changeView('edit-profile')} />}
            {view === 'edit-profile' && <EditProfileModal currentStats={stats} onSave={(updates) => { handleUpdateProfile(updates); changeView('profile'); }} onClose={() => changeView('settings')} currentCountry={settings.country} />}
            {view === 'region-selection' && <RegionSelection settings={settings} stats={stats} onUpdateSettings={handleUpdateSettings} onUpdateStats={setStats} onBack={() => changeView('settings')} />}
            {view === 'social' && <SocialFeed posts={posts} leaderboardEntries={leaderboard} currentUserRank={userRank} friends={friends} friendRequests={friendRequests} team={team} globalTeams={globalTeams} userMaterials={stats.materials} onOpenTeam={() => changeView('team')} onInspectAgent={(agent) => openModal('agentProfile', agent)} onLikePost={likePost} onCommentPost={commentPost} onSocialAction={handleSocialAction} onJoinTeamRequest={joinTeam} onCancelTeamRequest={cancelJoinTeam} onManageTeamRequest={manageTeamRequest} />}
            {view === 'team' && <TeamHub team={team} userMaterials={stats.materials} onBack={() => changeView('social')} onContribute={() => { setIsTeamContribution(true); setIsCameraOpen(true); }} onOpenChat={() => changeView('team-chat')} allQuests={quests} onUpdateMission={updateTeamMission} />}
            {view === 'team-chat' && <TeamChat team={team} currentUserId={localUid} currentUsername={stats.username} currentUserAvatar={stats.avatarSeed} onBack={() => changeView('team')} />}
            {view === 'create' && <CreateQuest userStats={stats} initialData={discoveryContext} editingQuest={editingQuest} onQuestCreated={() => changeView('feed')} onCancel={() => changeView('feed')} />}
            {view === 'journal' && <QuestJournal stats={stats} onBack={() => changeView('profile')} />}
            {view === 'oracle' && <Oracle userId={localUid} onClose={() => changeView('feed')} />}
            {view === 'wallet' && <Wallet stats={stats} transactions={stats.transactions} onClose={() => changeView('profile')} onGoToShop={() => changeView('market')} />}
            {view === 'market' && <Marketplace userStats={stats} items={quests.map(q => ({ id: q.id, name: q.title, description: q.description, price: 100, category: 'powerup', image: q.coverImage || '' }))} onBuy={handlePurchase} onBack={() => changeView('wallet')} />}
            {view === 'duel' && <DuelLobby onStartDuel={() => setIsCameraOpen(true)} onCancel={() => changeView('social')} currentUser={stats as any} />}
          </Suspense>
        </ErrorBoundary>
      </main>

      {showBottomBar && (
        <div className="fixed bottom-0 left-0 right-0 h-[68px] bg-background/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-between z-50 pb-safe px-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
          <button onClick={() => changeView('feed')} className={`flex flex-col items-center gap-1 transition-all duration-300 active:scale-95 ${view === 'feed' ? 'text-primary' : 'text-txt-dim hover:text-txt-sub'}`}>
            <LayoutDashboard size={22} strokeWidth={view === 'feed' ? 2.5 : 2} /><span className="text-[9px] font-bold uppercase tracking-widest">Quests</span>
          </button>
          <button onClick={() => changeView('map')} className={`flex flex-col items-center gap-1 transition-all duration-300 active:scale-95 ${view === 'map' ? 'text-primary' : 'text-txt-dim hover:text-txt-sub'}`}>
            <MapPin size={22} strokeWidth={view === 'map' ? 2.5 : 2} /><span className="text-[9px] font-bold uppercase tracking-widest">Map</span>
          </button>
          <button onClick={() => openModal('lensMenu')} className="relative -top-6 group">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-transform duration-300 group-active:scale-90 ${activeModals.has('lensMenu') ? 'bg-white text-primary' : 'bg-primary text-white'}`}><Scan size={24} strokeWidth={2.5} /></div>
            <span className="text-[9px] font-bold uppercase tracking-widest absolute -bottom-4 left-1/2 -translate-x-1/2 text-txt-dim group-hover:text-primary transition-colors whitespace-nowrap">Start Scan</span>
          </button>
          <button onClick={() => changeView('social')} className={`flex flex-col items-center gap-1 transition-all duration-300 active:scale-95 ${view === 'social' ? 'text-primary' : 'text-txt-dim hover:text-txt-sub'}`}>
            <Users size={22} strokeWidth={view === 'social' ? 2.5 : 2} /><span className="text-[9px] font-bold uppercase tracking-widest">Friends</span>
          </button>
          <button onClick={() => changeView('profile')} className={`flex flex-col items-center gap-1 transition-all duration-300 active:scale-95 ${view === 'profile' ? 'text-primary' : 'text-txt-dim hover:text-txt-sub'}`}>
            <UserIcon size={22} strokeWidth={view === 'profile' ? 2.5 : 2} /><span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
          </button>
        </div>
      )}

      {activeModals.has('lensMenu') && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => closeModal('lensMenu')}>
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col gap-3 w-full px-8 max-w-sm">
            <button onClick={(e) => { e.stopPropagation(); handleOpenNewQuest(); closeModal('lensMenu'); }} className="w-full h-16 bg-gradient-to-r from-primary to-indigo-600 rounded-3xl flex items-center justify-between px-6 text-white font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"><span>Create Quest</span><Sparkles size={20} /></button>
            <button onClick={(e) => { e.stopPropagation(); setScannerMode('free'); setIsCameraOpen(true); closeModal('lensMenu'); }} className="w-full h-16 bg-surface border border-white/10 rounded-3xl flex items-center justify-between px-6 text-txt-main font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:bg-white/5"><span>Start Scan</span><Scan size={20} /></button>
          </div>
        </div>
      )}

      {activeModals.has('dailyBonus') && <DailyBonusModal streak={stats.streak || 0} onClaim={claimDailyBonus} onClose={() => closeModal('dailyBonus')} />}
      {activeModals.has('levelUp') && <LevelUpModal newStats={stats} onClose={() => closeModal('levelUp')} />}
      {activeModals.has('inventory') && <InventoryModal userStats={stats} onUseItem={handleUseItem} onEquipItem={handleEquipItem} onOpenCrafting={() => { closeModal('inventory'); openModal('crafting'); }} onClose={() => closeModal('inventory')} />}
      {activeModals.has('notifications') && <NotificationCenter notifications={notifications} onClose={() => closeModal('notifications')} onClear={() => clearAllNotifications()} onMarkRead={(id) => markNotificationRead(id)} onAcceptInvite={(id) => respondToTeamInvite(id, true)} onDeclineInvite={(id) => respondToTeamInvite(id, false)} />}
      {activeModals.has('agentProfile') && inspectedAgent && <AgentProfileModal agent={inspectedAgent} onClose={() => closeModal('agentProfile')} onAddFriend={() => handleSocialAction('send_request', inspectedAgent.id)} onDuel={() => changeView('duel')} onChat={() => { }} onCancelRequest={() => handleSocialAction('cancel_request', inspectedAgent.id)} />}
      {activeModals.has('crafting') && <CraftingStation stats={stats} recipes={RECIPES} items={quests.map(q => ({ id: q.id, name: q.title, description: q.description, price: 100, category: 'powerup', image: q.coverImage || '' }))} onCraft={handleCrafting} onClose={() => closeModal('crafting')} />}


      {isCameraOpen && <CameraCapture objective={scannerMode === 'free' ? "Anything interesting" : (activeStoryStep?.imagePrompt || activeQuest?.imagePrompt || "Item")} onClose={() => setIsCameraOpen(false)} onSuccess={handleValidationSuccess} userStats={stats} />}

      {completionData && (
        <QuestCompletion
          quest={completionData.discovery ? null : activeQuest} discovery={completionData.discovery} validation={completionData.result} capturedImage={completionData.image} rewards={completionData.rewards}
          onShare={(caption) => {
            const newPost: any = {
              username: stats.username,
              avatarSeed: stats.avatarSeed,
              questTitle: completionData.discovery?.name || activeQuest?.title || "Discovery",
              caption,
              image: completionData.image,
              likes: 0,
              likedBy: [],
              timeAgo: 'Just now',
              userRank: stats.rank || 'Newcomer'
            };
            setPosts({ post: newPost });
            setCompletionData(null);
            setToast({ id: 'share', title: 'Shared', message: 'Discovery posted to community feed.', type: 'success', timestamp: 'now', read: false });
          }} onClose={() => setCompletionData(null)} activeRoles={stats.activeRoles}
        />
      )}
      <Toast notification={activeToast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <>
      <AuthLoading>
        <div className="fixed inset-0 flex items-center justify-center bg-[#020617] text-white">
          <div className="flex flex-col items-center gap-4">
            <Loader className="animate-spin text-primary" size={32} />
            <p className="text-xs uppercase tracking-widest text-white/50">Loading Quest Lens...</p>
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <Auth onAuthenticated={() => {
          localStorage.setItem('questlens_authenticated', 'true');
        }} />
      </Unauthenticated>
      <Authenticated>
        <GameContent />
      </Authenticated>
    </>
  );
}
