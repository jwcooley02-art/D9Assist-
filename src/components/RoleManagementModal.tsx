import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types';
import { X, Shield, Users, UserPlus, Trash2, CheckCircle2, ShieldCheck, Crown, UserCheck, AlertTriangle } from 'lucide-react';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  currentUserRole: UserRole;
  currentUsername: string;
  currentUserEmail: string;
  onSwitchSessionRole: (role: UserRole) => void;
  onAssignRole: (targetIdentifier: string, newRole: UserRole) => void;
  onAddUser: (username: string, email: string, role: UserRole) => void;
  onDeleteUser: (userId: string) => void;
}

export const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUserRole,
  currentUsername,
  currentUserEmail,
  onSwitchSessionRole,
  onAssignRole,
  onAddUser,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'add' | 'roles'>('users');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Member');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdmin = currentUserRole === 'Admin';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setFeedbackMsg('Access Denied: Only Admins can add operators and assign roles.');
      return;
    }
    if (!newUsername.trim() || !newEmail.trim()) return;

    onAddUser(newUsername.trim(), newEmail.trim(), newRole);
    setFeedbackMsg(`Operator ${newUsername.trim()} assigned role: ${newRole}`);
    setNewUsername('');
    setNewEmail('');
    setActiveTab('users');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="px-2 py-0.5 rounded bg-lime-400/10 border border-lime-400/40 text-lime-400 font-bold text-[10px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>ADMIN</span>
          </span>
        );
      case 'VIP':
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/40 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
            <Crown className="w-3 h-3 text-emerald-400" />
            <span>VIP</span>
          </span>
        );
      case 'Member':
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-[10px] flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-zinc-400" />
            <span>MEMBER</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl bg-[#141518] border border-[#232529] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#232529] flex items-center justify-between bg-[#0e0f11]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-lime-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase">
                D9ASSIST // ROLE-BASED ACCESS CONTROL (RBAC)
              </h2>
              <p className="text-[11px] text-zinc-400">
                Manage roles: Admin (edit & delete media), VIP, and Member.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#1e2025] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Session Bar with Instant Role Testing Switcher */}
        <div className="px-5 py-2.5 bg-[#0c0d0e] border-b border-[#232529] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px]">ACTIVE IDENTITY:</span>
            <span className="text-white font-black">{currentUsername}</span>
            <span className="text-zinc-600">({currentUserEmail})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px] uppercase">Test Role:</span>
            <div className="flex items-center gap-1 p-0.5 bg-[#141518] border border-[#232529] rounded">
              {(['Admin', 'VIP', 'Member'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => onSwitchSessionRole(role)}
                  className={`px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all cursor-pointer ${
                    currentUserRole === role
                      ? role === 'Admin'
                        ? 'bg-lime-400 text-black shadow-sm'
                        : role === 'VIP'
                        ? 'bg-emerald-500 text-black shadow-sm'
                        : 'bg-zinc-200 text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#232529] bg-[#0c0d0e] px-5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-colors cursor-pointer uppercase ${
              activeTab === 'users'
                ? 'border-lime-400 text-lime-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Operators Directory ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-colors cursor-pointer uppercase ${
              activeTab === 'add'
                ? 'border-lime-400 text-lime-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            + Assign New Operator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-colors cursor-pointer uppercase ${
              activeTab === 'roles'
                ? 'border-lime-400 text-lime-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Permissions Matrix
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {feedbackMsg && (
            <div className="p-2.5 rounded bg-lime-950/40 border border-lime-400/40 text-xs text-lime-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* TAB 1: OPERATOR DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="uppercase font-bold">Registered Operators</span>
                <span className="text-[11px] text-zinc-500">
                  {isAdmin ? 'Admins can assign or reassign any role' : 'View only (Admin required to assign)'}
                </span>
              </div>

              <div className="space-y-2">
                {users.map((usr) => (
                  <div
                    key={usr.id}
                    className="p-3.5 rounded bg-[#0c0d0e] border border-[#232529] hover:border-[#2f3238] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {usr.username}
                        </span>
                        {usr.isOwner && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-lime-400 text-black font-black uppercase">
                            OWNER
                          </span>
                        )}
                        {getRoleBadge(usr.role)}
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-0.5">
                        {usr.email}
                      </p>
                      <p className="text-zinc-600 text-[10px] mt-0.5">
                        Assigned by {usr.assignedBy || 'Admin'} · {new Date(usr.assignedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isAdmin ? (
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] text-zinc-500 uppercase">Role:</label>
                          <select
                            value={usr.role}
                            disabled={usr.isOwner}
                            onChange={(e) => {
                              onAssignRole(usr.id, e.target.value as UserRole);
                              setFeedbackMsg(`Updated ${usr.username} to ${e.target.value}`);
                              setTimeout(() => setFeedbackMsg(null), 3000);
                            }}
                            className={`px-2.5 py-1 bg-[#141518] border border-[#232529] focus:border-lime-400 rounded text-xs font-bold ${
                              usr.isOwner ? 'opacity-60 cursor-not-allowed text-lime-400' : 'cursor-pointer text-white'
                            }`}
                          >
                            <option value="Admin">Admin</option>
                            <option value="VIP">VIP</option>
                            <option value="Member">Member</option>
                          </select>

                          {!usr.isOwner && users.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteUser(usr.id)}
                              className="p-1.5 text-zinc-500 hover:text-rose-400 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500">
                          {usr.role} Assigned
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGN NEW OPERATOR */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddSubmit} className="space-y-4">
              {!isAdmin && (
                <div className="p-3 rounded bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Only Admins can add operators and assign roles. Switch your test role above to Admin to proceed.</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Operator Handle / Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TacticalGhost"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Operator Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. operator@d9assist.net"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Assigned Role *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Admin', 'VIP', 'Member'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setNewRole(role)}
                      className={`p-3 rounded border text-left transition-all cursor-pointer ${
                        newRole === role
                          ? 'bg-lime-400/10 border-lime-400 text-lime-400'
                          : 'bg-[#0c0d0e] border-[#232529] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block uppercase">{role}</span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        {role === 'Admin'
                          ? 'Can edit media & assign roles'
                          : role === 'VIP'
                          ? 'Priority slot & early access'
                          : 'Standard subscriber access'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!isAdmin}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isAdmin
                      ? 'bg-lime-400 hover:bg-lime-300 text-black shadow-md'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Assign Role & Save Operator</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ROLE PERMISSION MATRIX */}
          {activeTab === 'roles' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-[#0c0d0e] border border-[#232529] space-y-2">
                <h4 className="text-lime-400 font-bold uppercase text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Role Permissions Matrix</span>
                </h4>
                <p className="text-zinc-400 text-[11px] font-sans">
                  Privileges enforced throughout storefront, media showcase, and thin launcher streaming.
                </p>
              </div>

              <div className="border border-[#232529] rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e0f11] text-zinc-400 border-b border-[#232529]">
                    <tr>
                      <th className="p-2.5 font-bold uppercase">Capability</th>
                      <th className="p-2.5 font-bold uppercase text-lime-400">Admin</th>
                      <th className="p-2.5 font-bold uppercase text-emerald-300">VIP</th>
                      <th className="p-2.5 font-bold uppercase text-zinc-400">Member</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232529] bg-[#0c0d0e]">
                    <tr>
                      <td className="p-2.5 text-zinc-300">Edit Media Title & Description</td>
                      <td className="p-2.5 text-lime-400 font-bold">YES (Exclusive)</td>
                      <td className="p-2.5 text-zinc-600">NO</td>
                      <td className="p-2.5 text-zinc-600">NO</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-zinc-300">Delete Media Items</td>
                      <td className="p-2.5 text-lime-400 font-bold">YES</td>
                      <td className="p-2.5 text-zinc-600">NO</td>
                      <td className="p-2.5 text-zinc-600">NO</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-zinc-300">Assign & Manage User Roles</td>
                      <td className="p-2.5 text-lime-400 font-bold">YES</td>
                      <td className="p-2.5 text-zinc-600">NO</td>
                      <td className="p-2.5 text-zinc-600">NO</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-zinc-300">Add New Modules & Set Slot Prices</td>
                      <td className="p-2.5 text-lime-400 font-bold">YES</td>
                      <td className="p-2.5 text-zinc-600">NO</td>
                      <td className="p-2.5 text-zinc-600">NO</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-zinc-300">Mint License Codes & Access Vault</td>
                      <td className="p-2.5 text-lime-400 font-bold">YES</td>
                      <td className="p-2.5 text-zinc-600">NO</td>
                      <td className="p-2.5 text-zinc-600">NO</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-zinc-300">Purchase Weekly / Monthly / Annual Slots</td>
                      <td className="p-2.5 text-lime-400 font-bold">YES</td>
                      <td className="p-2.5 text-emerald-400 font-bold">YES</td>
                      <td className="p-2.5 text-zinc-300 font-bold">YES</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-zinc-300">Zero-Disk Module Memory Stream</td>
                      <td className="p-2.5 text-lime-400 font-bold">YES</td>
                      <td className="p-2.5 text-emerald-400 font-bold">YES</td>
                      <td className="p-2.5 text-zinc-300 font-bold">YES</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
