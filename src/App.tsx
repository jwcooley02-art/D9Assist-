import { useState, useEffect } from 'react';
import { ModuleItem, SubscriptionTier, SubscriptionDuration, OrderRecord, MediaItem, UserAccount, UserRole } from './types';
import {
  loadStoredModules,
  saveStoredModules,
  loadActiveModuleId,
  saveActiveModuleId,
  loadStoredOrders,
  saveStoredOrder,
} from './utils/storage';
import { INITIAL_MODULES } from './data/initialModules';
import { Header } from './components/Header';
import { ModuleSelector } from './components/ModuleSelector';
import { ModuleHero } from './components/ModuleHero';
import { BuyWindows } from './components/BuyWindows';
import { MediaTab } from './components/MediaTab';
import { DownloadSection } from './components/DownloadSection';
import { ModuleDetails } from './components/ModuleDetails';
import { CheckoutModal } from './components/CheckoutModal';
import { AddMediaModal } from './components/AddMediaModal';
import { EditMediaModal } from './components/EditMediaModal';
import { RoleManagementModal } from './components/RoleManagementModal';
import { AccountAuthModal } from './components/AccountAuthModal';
import { CreatorStudioModal } from './components/CreatorStudioModal';
import { LicensesModal } from './components/LicensesModal';
import { WaitlistModal } from './components/WaitlistModal';
import { InteractiveLauncher } from './components/InteractiveLauncher';
import { ServerVaultModal } from './components/ServerVaultModal';
import { Footer } from './components/Footer';

export default function App() {
  const [modules, setModules] = useState<ModuleItem[]>(() => loadStoredModules());
  const [activeModuleId, setActiveModuleId] = useState<string>(() => loadActiveModuleId());
  const [orders, setOrders] = useState<OrderRecord[]>(() => loadStoredOrders());

  // User & RBAC state
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const raw = localStorage.getItem('d9assist_current_user_v1');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      id: 'user-opd9',
      username: 'OPD9',
      email: 'jwcooley02@gmail.com',
      role: 'Admin',
      isOwner: true,
      assignedBy: 'System (Owner / Creator)',
      assignedAt: Date.now() - 30 * 86400000,
    };
  });

  const [users, setUsers] = useState<UserAccount[]>([
    {
      id: 'user-opd9',
      username: 'OPD9',
      email: 'jwcooley02@gmail.com',
      role: 'Admin',
      isOwner: true,
      assignedBy: 'System (Owner / Creator)',
      assignedAt: Date.now() - 30 * 86400000,
    },
    {
      id: 'user-vip1',
      username: 'GhostActual',
      email: 'ghost@d9assist.net',
      role: 'VIP',
      isOwner: false,
      assignedBy: 'OPD9',
      assignedAt: Date.now() - 7 * 86400000,
    },
    {
      id: 'user-mem1',
      username: 'BravoSix',
      email: 'bravo@d9assist.net',
      role: 'Member',
      isOwner: false,
      assignedBy: 'OPD9',
      assignedAt: Date.now() - 2 * 86400000,
    },
  ]);

  // Load server-side users on mount
  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      })
      .catch(() => {});
  }, []);

  // Save current user to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('d9assist_current_user_v1', JSON.stringify(currentUser));
    } catch {}
  }, [currentUser]);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'buy' | 'media' | 'specs' | 'download'>('overview');

  // Modals state
  const [selectedCheckoutTier, setSelectedCheckoutTier] = useState<SubscriptionTier | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [waitlistTierId, setWaitlistTierId] = useState<SubscriptionDuration | null>(null);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [isEditMediaOpen, setIsEditMediaOpen] = useState(false);
  const [mediaBeingEdited, setMediaBeingEdited] = useState<MediaItem | null>(null);

  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isLicensesOpen, setIsLicensesOpen] = useState(false);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRolesOpen, setIsRolesOpen] = useState(false);

  // Active key for launcher pass-through
  const [activeLauncherCode, setActiveLauncherCode] = useState<string>('D9A-LIFE-JEREMY-2026');
  const [launchingModuleId, setLaunchingModuleId] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Ensure active module exists
  const activeModule = modules.find((m) => m.id === activeModuleId) || modules[0] || INITIAL_MODULES[0];

  const handleSelectModule = (id: string) => {
    setActiveModuleId(id);
    saveActiveModuleId(id);
  };

  // Creator adds new module
  const handleAddModule = (newModule: ModuleItem) => {
    const updated = [newModule, ...modules];
    setModules(updated);
    saveStoredModules(updated);
    setActiveModuleId(newModule.id);
    saveActiveModuleId(newModule.id);
    showToast(`Published "${newModule.name}" with 10 slots per tier`);
  };

  // Creator updates existing module
  const handleUpdateModule = (updatedModule: ModuleItem) => {
    const updated = modules.map((m) => (m.id === updatedModule.id ? updatedModule : m));
    setModules(updated);
    saveStoredModules(updated);
    showToast(`Updated "${updatedModule.name}" settings`);
  };

  // Creator deletes module
  const handleDeleteModule = (moduleId: string) => {
    const updated = modules.filter((m) => m.id !== moduleId);
    if (updated.length === 0) {
      setModules(INITIAL_MODULES);
      saveStoredModules(INITIAL_MODULES);
      setActiveModuleId(INITIAL_MODULES[0].id);
      saveActiveModuleId(INITIAL_MODULES[0].id);
    } else {
      setModules(updated);
      saveStoredModules(updated);
      setActiveModuleId(updated[0].id);
      saveActiveModuleId(updated[0].id);
    }
    showToast('Module deleted');
  };

  // Reset to initial seed defaults
  const handleResetDefaults = () => {
    setModules(INITIAL_MODULES);
    saveStoredModules(INITIAL_MODULES);
    setActiveModuleId(INITIAL_MODULES[0].id);
    saveActiveModuleId(INITIAL_MODULES[0].id);
    showToast('Reset to initial D9 Tarkov configuration');
  };

  // Add media to active module
  const handleSaveMedia = (newItem: MediaItem) => {
    const updatedMedia = [newItem, ...activeModule.media];
    const updatedModule = { ...activeModule, media: updatedMedia };
    const updated = modules.map((m) => (m.id === updatedModule.id ? updatedModule : m));
    setModules(updated);
    saveStoredModules(updated);
    showToast(`Added ${newItem.type === 'video' ? 'video' : 'picture'} to media showcase`);
  };

  // Delete media item from active module
  const handleDeleteMedia = (mediaId: string) => {
    const updatedMedia = activeModule.media.filter((item) => item.id !== mediaId);
    const updatedModule = { ...activeModule, media: updatedMedia };
    const updated = modules.map((m) => (m.id === updatedModule.id ? updatedModule : m));
    setModules(updated);
    saveStoredModules(updated);
    showToast('Media removed from showcase');
  };

  // Open checkout for a tier
  const handleSelectTierForPurchase = (tier: SubscriptionTier) => {
    setSelectedCheckoutTier(tier);
    setIsCheckoutOpen(true);
  };

  // Complete order checkout
  const handleOrderSuccess = async (newOrder: OrderRecord) => {
    // 1. Decrement slot count for tier in active module
    const targetTier = activeModule.tiers[newOrder.tierId];
    if (targetTier) {
      const updatedModule: ModuleItem = {
        ...activeModule,
        tiers: {
          ...activeModule.tiers,
          [newOrder.tierId]: {
            ...targetTier,
            claimedSlots: Math.min(targetTier.maxSlots, targetTier.claimedSlots + 1),
          },
        },
      };
      const updated = modules.map((m) => (m.id === updatedModule.id ? updatedModule : m));
      setModules(updated);
      saveStoredModules(updated);
    }

    // 2. Mint code to server database if available
    try {
      await fetch('/api/admin/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: newOrder.moduleId,
          tier_id: newOrder.tierId,
        }),
      });
    } catch {
      // server sync
    }

    // 3. Save order to client vault
    const updatedOrders = saveStoredOrder(newOrder);
    setOrders(updatedOrders);
    setActiveLauncherCode(newOrder.licenseKey);
    showToast('Slot bound! Activation code registered in server vault.');
  };

  // Join waitlist when sold out
  const handleOpenWaitlist = (tierId: SubscriptionDuration) => {
    setWaitlistTierId(tierId);
    setIsWaitlistOpen(true);
  };

  // Scroll helper
  const scrollToBuyWindows = () => {
    setActiveTab('buy');
    const elem = document.getElementById('buy-windows');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Open Edit Media modal (Admin only check)
  const handleOpenEditMedia = (item: MediaItem) => {
    if (currentUser.role !== 'Admin') {
      showToast('Access Denied: Only Admins can modify media descriptions and titles.');
      return;
    }
    setMediaBeingEdited(item);
    setIsEditMediaOpen(true);
  };

  // Save edited media title & description
  const handleSaveEditedMedia = (
    mediaId: string,
    updatedFields: { title: string; caption: string; tag?: string }
  ) => {
    if (currentUser.role !== 'Admin') {
      showToast('Access Denied: Only Admins can edit media.');
      return;
    }

    const updatedMedia = activeModule.media.map((item) =>
      item.id === mediaId ? { ...item, ...updatedFields } : item
    );
    const updatedModule = { ...activeModule, media: updatedMedia };
    const updated = modules.map((m) => (m.id === updatedModule.id ? updatedModule : m));
    setModules(updated);
    saveStoredModules(updated);
    showToast(`Updated "${updatedFields.title}" details.`);
  };

  // Role management handlers
  const handleSwitchSessionRole = (newRole: UserRole) => {
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);
    showToast(`Session role switched to: ${newRole}`);
  };

  const handleAssignRole = async (targetId: string, newRole: UserRole) => {
    try {
      const res = await fetch('/api/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester: currentUser.username,
          targetIdentifier: targetId,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetId || u.username === targetId ? { ...u, role: newRole } : u))
        );
        showToast(data.message || `Role updated to ${newRole}`);
      } else {
        showToast(data.message || 'Failed to update role');
      }
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetId ? { ...u, role: newRole } : u))
      );
      showToast(`Role updated to ${newRole}`);
    }
  };

  const handleAddUser = async (username: string, email: string, role: UserRole) => {
    try {
      const res = await fetch('/api/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester: currentUser.username,
          username,
          email,
          role,
        }),
      });
      const data = await res.json();
      if (data.user) {
        setUsers((prev) => [data.user, ...prev]);
        showToast(`Registered operator ${username} (${role})`);
      }
    } catch {
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        username,
        email,
        role,
        assignedBy: currentUser.username,
        assignedAt: Date.now(),
      };
      setUsers((prev) => [newUser, ...prev]);
      showToast(`Registered operator ${username} (${role})`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requester: currentUser.username, userId }),
      });
    } catch {}
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('User removed');
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    showToast(`Authenticated as ${user.username} [${user.role}]`);
  };

  // Synchronize on load
  useEffect(() => {
    saveStoredModules(modules);
  }, [modules]);

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-zinc-100 flex flex-col font-mono selection:bg-lime-400/30 selection:text-lime-300">
      {/* Top Bar (D9Assist Top Bar Contract) */}
      <Header
        orderCount={orders.length}
        currentUser={currentUser}
        onOpenLicenses={() => setIsLicensesOpen(true)}
        onOpenCreator={() => setIsCreatorOpen(true)}
        onOpenLauncher={() => setIsLauncherOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenRoles={() => setIsRolesOpen(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Module Switcher Session Bar */}
      <ModuleSelector
        modules={modules}
        activeModuleId={activeModule.id}
        onSelectModule={handleSelectModule}
        onOpenCreator={() => setIsCreatorOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 bg-[#0c0d0e]">
        {activeTab === 'overview' && (
          <>
            <ModuleHero
              module={activeModule}
              onScrollToBuy={scrollToBuyWindows}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <BuyWindows
              module={activeModule}
              onSelectTier={handleSelectTierForPurchase}
              onJoinWaitlist={handleOpenWaitlist}
            />
            <MediaTab
              module={activeModule}
              currentUserRole={currentUser.role}
              onAddMediaClick={() => setIsAddMediaOpen(true)}
              onDeleteMedia={handleDeleteMedia}
              onEditMediaClick={handleOpenEditMedia}
            />
            <DownloadSection
              currentUser={currentUser}
              orders={orders}
              modules={modules}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenBuyWindows={() => {
                setActiveTab('buy');
                scrollToBuyWindows();
              }}
              onOpenLauncherModal={(modId) => {
                setLaunchingModuleId(modId || activeModule.id);
                setIsLauncherOpen(true);
              }}
            />
            <ModuleDetails module={activeModule} />
          </>
        )}

        {activeTab === 'buy' && (
          <div className="bg-[#0c0d0e]">
            <div className="border-b border-[#232529] bg-[#111215]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-2 text-xs text-lime-400 uppercase tracking-wider font-bold">
                  <span>D9ASSIST // {activeModule.game}</span>
                  <span className="text-zinc-600">[</span>
                  <span className="text-zinc-400">ACTIVE SESSION: VERIFIED</span>
                  <span className="text-zinc-600">]</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
                  {activeModule.name} [ BUY WINDOWS ]
                </h1>
              </div>
            </div>
            <BuyWindows
              module={activeModule}
              onSelectTier={handleSelectTierForPurchase}
              onJoinWaitlist={handleOpenWaitlist}
            />
          </div>
        )}

        {activeTab === 'media' && (
          <div className="bg-[#0c0d0e]">
            <div className="border-b border-[#232529] bg-[#111215]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-2 text-xs text-lime-400 uppercase tracking-wider font-bold">
                  <span>D9ASSIST // {activeModule.game}</span>
                  <span className="text-zinc-600">[</span>
                  <span className="text-zinc-400">ACTIVE SESSION: VERIFIED</span>
                  <span className="text-zinc-600">]</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
                  {activeModule.name} [ MEDIA SHOWCASE ]
                </h1>
              </div>
            </div>
            <MediaTab
              module={activeModule}
              currentUserRole={currentUser.role}
              onAddMediaClick={() => setIsAddMediaOpen(true)}
              onDeleteMedia={handleDeleteMedia}
              onEditMediaClick={handleOpenEditMedia}
            />
          </div>
        )}

        {activeTab === 'download' && (
          <div className="bg-[#0c0d0e]">
            <div className="border-b border-[#232529] bg-[#111215]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-2 text-xs text-lime-400 uppercase tracking-wider font-bold">
                  <span>D9ASSIST // ZERO-DISK STREAMING CONSOLE</span>
                  <span className="text-zinc-600">[</span>
                  <span className="text-zinc-400">VOLATILE IN-MEMORY WEB RUNTIME</span>
                  <span className="text-zinc-600">]</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
                  WEB LAUNCHER & ZERO-DISK STREAM
                </h1>
              </div>
            </div>
            <DownloadSection
              currentUser={currentUser}
              orders={orders}
              modules={modules}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenBuyWindows={() => {
                setActiveTab('buy');
                scrollToBuyWindows();
              }}
              onOpenLauncherModal={(modId) => {
                setLaunchingModuleId(modId || activeModule.id);
                setIsLauncherOpen(true);
              }}
            />
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="bg-[#0c0d0e]">
            <div className="border-b border-[#232529] bg-[#111215]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-2 text-xs text-lime-400 uppercase tracking-wider font-bold">
                  <span>D9ASSIST // {activeModule.game}</span>
                  <span className="text-zinc-600">[</span>
                  <span className="text-zinc-400">ACTIVE SESSION: VERIFIED</span>
                  <span className="text-zinc-600">]</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
                  {activeModule.name} [ SPECIFICATIONS ]
                </h1>
              </div>
            </div>
            <ModuleDetails module={activeModule} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenCreator={() => setIsCreatorOpen(true)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Checkout Window Modal */}
      <CheckoutModal
        module={activeModule}
        tier={selectedCheckoutTier}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
        onOpenLauncher={(code) => {
          setActiveLauncherCode(code);
          setIsLauncherOpen(true);
        }}
      />

      {/* Add Media Modal */}
      <AddMediaModal
        moduleName={activeModule.name}
        isOpen={isAddMediaOpen}
        onClose={() => setIsAddMediaOpen(false)}
        onSave={handleSaveMedia}
      />

      {/* Edit Media Modal (Admin Only) */}
      <EditMediaModal
        media={mediaBeingEdited}
        isOpen={isEditMediaOpen}
        onClose={() => {
          setIsEditMediaOpen(false);
          setMediaBeingEdited(null);
        }}
        onSave={handleSaveEditedMedia}
        currentUserRole={currentUser.role}
      />

      {/* Role Management Modal (RBAC: Admin, VIP, Member) */}
      <RoleManagementModal
        isOpen={isRolesOpen}
        onClose={() => setIsRolesOpen(false)}
        users={users}
        currentUserRole={currentUser.role}
        currentUsername={currentUser.username}
        currentUserEmail={currentUser.email}
        onSwitchSessionRole={handleSwitchSessionRole}
        onAssignRole={handleAssignRole}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* Account Authentication & Registration Gateway */}
      <AccountAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onNavigateToBuy={() => {
          setActiveTab('buy');
          scrollToBuyWindows();
        }}
      />

      {/* Creator Studio Modal */}
      <CreatorStudioModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        modules={modules}
        onAddModule={handleAddModule}
        onUpdateModule={handleUpdateModule}
        onDeleteModule={handleDeleteModule}
        onResetDefaults={handleResetDefaults}
      />

      {/* My Licenses & Passkeys Modal */}
      <LicensesModal
        isOpen={isLicensesOpen}
        onClose={() => setIsLicensesOpen(false)}
        orders={orders}
        onOpenBuyWindows={() => {
          setActiveTab('buy');
          scrollToBuyWindows();
        }}
        onLaunchModule={(code) => {
          setActiveLauncherCode(code);
          setIsLicensesOpen(false);
          setIsLauncherOpen(true);
        }}
      />

      {/* Interactive Thin Launcher Client (plan.md Section 1 & 2) */}
      <InteractiveLauncher
        isOpen={isLauncherOpen}
        onClose={() => {
          setIsLauncherOpen(false);
          setLaunchingModuleId(null);
        }}
        initialCode={activeLauncherCode}
        modules={modules}
        currentUser={currentUser}
        autoLaunchModuleId={launchingModuleId}
      />

      {/* Server Vault & Streaming Monitor (plan.md Section 3 & 4) */}
      <ServerVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />

      {/* Waitlist Modal */}
      <WaitlistModal
        module={activeModule}
        tierId={waitlistTierId}
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141518] border border-lime-400/50 text-lime-400 px-4 py-2.5 rounded shadow-2xl text-xs font-mono flex items-center gap-2 animate-fade-in font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-lime-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
