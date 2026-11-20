import React, { useState, useEffect } from 'react';
import { ModuleItem } from '../types';
import { X, Plus, Trash2, RotateCcw, Layers, DollarSign, Check, Save, Sliders, Cpu } from 'lucide-react';

interface CreatorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: ModuleItem[];
  onAddModule: (module: ModuleItem) => void;
  onUpdateModule: (module: ModuleItem) => void;
  onDeleteModule: (moduleId: string) => void;
  onResetDefaults: () => void;
}

export const CreatorStudioModal: React.FC<CreatorStudioModalProps> = ({
  isOpen,
  onClose,
  modules,
  onAddModule,
  onUpdateModule,
  onDeleteModule,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [selectedEditModuleId, setSelectedEditModuleId] = useState<string>(
    modules[0]?.id || ''
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // New module form state
  const [name, setName] = useState('');
  const [game, setGame] = useState('Escape from Tarkov');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('v2.0 - SECURE MEMORY');
  const [coverUrl, setCoverUrl] = useState(
    '/src/assets/images/eft_armory_workbench_1795141445483.jpg'
  );

  // Pricing & slots for new module (Defaults: 14.99 / 34.99 / 114.99 and 10 slots each)
  const [weekPrice, setWeekPrice] = useState(14.99);
  const [weekSlots, setWeekSlots] = useState(10);

  const [monthPrice, setMonthPrice] = useState(34.99);
  const [monthSlots, setMonthSlots] = useState(10);

  const [yearPrice, setYearPrice] = useState(114.99);
  const [yearSlots, setYearSlots] = useState(10);

  const [featureInputs, setFeatureInputs] = useState<string[]>([
    'Dual Engine PvE & PvP Architecture',
    'Zero-Disk Streaming Memory Pipeline',
    'Sub-millisecond ballistic trajectory zeroing',
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Manage Existing Module Edit Form State (100% parity with Create Module)
  const editingModule = modules.find((m) => m.id === selectedEditModuleId) || modules[0];

  const [editName, setEditName] = useState('');
  const [editGame, setEditGame] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVersion, setEditVersion] = useState('v2.0 - SECURE MEMORY');
  const [editStatus, setEditStatus] = useState<'Operational' | 'Testing' | 'Updating' | 'Detected'>('Operational');
  const [editCoverUrl, setEditCoverUrl] = useState('');

  const [editWeekPrice, setEditWeekPrice] = useState(14.99);
  const [editWeekSlots, setEditWeekSlots] = useState(10);
  const [editWeekClaimed, setEditWeekClaimed] = useState(0);

  const [editMonthPrice, setEditMonthPrice] = useState(34.99);
  const [editMonthSlots, setEditMonthSlots] = useState(10);
  const [editMonthClaimed, setEditMonthClaimed] = useState(0);

  const [editYearPrice, setEditYearPrice] = useState(114.99);
  const [editYearSlots, setEditYearSlots] = useState(10);
  const [editYearClaimed, setEditYearClaimed] = useState(0);

  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [editNewFeatureText, setEditNewFeatureText] = useState('');

  const [editTargetExe, setEditTargetExe] = useState('');
  const [editOS, setEditOS] = useState('');
  const [editSecurity, setEditSecurity] = useState('');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Synchronize edit state when selected module changes
  useEffect(() => {
    if (editingModule) {
      setEditName(editingModule.name);
      setEditGame(editingModule.game);
      setEditTagline(editingModule.tagline);
      setEditDescription(editingModule.description);
      setEditVersion(editingModule.version || 'v2.0 - SECURE MEMORY');
      setEditStatus(editingModule.status || 'Operational');
      setEditCoverUrl(editingModule.coverImage);

      setEditWeekPrice(editingModule.tiers['1_week']?.price ?? 14.99);
      setEditWeekSlots(editingModule.tiers['1_week']?.maxSlots ?? 10);
      setEditWeekClaimed(editingModule.tiers['1_week']?.claimedSlots ?? 0);

      setEditMonthPrice(editingModule.tiers['1_month']?.price ?? 34.99);
      setEditMonthSlots(editingModule.tiers['1_month']?.maxSlots ?? 10);
      setEditMonthClaimed(editingModule.tiers['1_month']?.claimedSlots ?? 0);

      setEditYearPrice(editingModule.tiers['1_year']?.price ?? 114.99);
      setEditYearSlots(editingModule.tiers['1_year']?.maxSlots ?? 10);
      setEditYearClaimed(editingModule.tiers['1_year']?.claimedSlots ?? 0);

      setEditFeatures(editingModule.features ? editingModule.features.map((f) => f.title) : []);

      const reqTarget =
        editingModule.requirements?.find((r) => r.label.toLowerCase().includes('target'))?.value ||
        `${editingModule.game}.exe`;
      const reqOS =
        editingModule.requirements?.find(
          (r) => r.label.toLowerCase().includes('operating') || r.label.toLowerCase().includes('os')
        )?.value || 'Windows 10 / 11 64-bit';
      const reqSec =
        editingModule.requirements?.find((r) => r.label.toLowerCase().includes('security'))?.value ||
        'Ring-0 isolated with zero-disk stream';

      setEditTargetExe(reqTarget);
      setEditOS(reqOS);
      setEditSecurity(reqSec);
      setSaveSuccessMsg(null);
    }
  }, [selectedEditModuleId, editingModule?.id]);

  const handleAddEditFeature = () => {
    if (!editNewFeatureText.trim()) return;
    setEditFeatures([...editFeatures, editNewFeatureText.trim()]);
    setEditNewFeatureText('');
  };

  const handleRemoveEditFeature = (index: number) => {
    setEditFeatures(editFeatures.filter((_, idx) => idx !== index));
  };

  const handleSaveExistingModule = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingModule) return;

    const updatedModule: ModuleItem = {
      ...editingModule,
      name: editName.trim().toUpperCase(),
      game: editGame.trim() || 'Custom Game',
      tagline: editTagline.trim(),
      description: editDescription.trim(),
      version: editVersion.trim() || 'v2.0 - SECURE MEMORY',
      status: editStatus,
      coverImage: editCoverUrl.trim() || editingModule.coverImage,
      tiers: {
        '1_week': {
          ...editingModule.tiers['1_week'],
          id: '1_week',
          name: editingModule.tiers['1_week']?.name || 'Weekly Operational Pass',
          durationLabel: '7 Days Access',
          price: Number(editWeekPrice) || 14.99,
          maxSlots: Number(editWeekSlots) || 10,
          claimedSlots: Math.min(Number(editWeekClaimed) || 0, Number(editWeekSlots) || 10),
          perks: editingModule.tiers['1_week']?.perks || [
            `${editName} full capability active`,
            'Zero-Disk memory injection pipeline',
            'Hourly community offset sync',
            'HWID reset included',
          ],
        },
        '1_month': {
          ...editingModule.tiers['1_month'],
          id: '1_month',
          name: editingModule.tiers['1_month']?.name || 'Monthly Tactical Access',
          durationLabel: '30 Days Access',
          price: Number(editMonthPrice) || 34.99,
          maxSlots: Number(editMonthSlots) || 10,
          claimedSlots: Math.min(Number(editMonthClaimed) || 0, Number(editMonthSlots) || 10),
          recommended: true,
          perks: editingModule.tiers['1_month']?.perks || [
            `${editName} full capability active`,
            'High priority private cluster allocation',
            'Zero-Disk stream memory verification',
            'Dedicated ticket support',
          ],
        },
        '1_year': {
          ...editingModule.tiers['1_year'],
          id: '1_year',
          name: editingModule.tiers['1_year']?.name || 'Annual Master License',
          durationLabel: '365 Days Access',
          price: Number(editYearPrice) || 114.99,
          maxSlots: Number(editYearSlots) || 10,
          claimedSlots: Math.min(Number(editYearClaimed) || 0, Number(editYearSlots) || 10),
          perks: editingModule.tiers['1_year']?.perks || [
            `${editName} full suite with zero interruptions`,
            'Permanent slot retention guarantee',
            'VIP developer direct channel',
            'All future updates included',
          ],
        },
      },
      features: editFeatures.map((title) => ({
        title,
        desc:
          editingModule.features?.find((f) => f.title === title)?.desc ||
          `Isolated zero-disk implementation for ${title}.`,
      })),
      requirements: [
        { label: 'Target Module', value: editTargetExe.trim() || `${editGame}.exe` },
        { label: 'Operating System', value: editOS.trim() || 'Windows 10 / 11 64-bit' },
        { label: 'Security Layer', value: editSecurity.trim() || 'Ring-0 isolated with zero-disk stream' },
      ],
    };

    onUpdateModule(updatedModule);
    setSaveSuccessMsg(`Configuration saved for ${updatedModule.name}`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatureInputs([...featureInputs, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatureInputs(featureInputs.filter((_, idx) => idx !== index));
  };

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = `d9-${Date.now()}`;
    const newModule: ModuleItem = {
      id,
      name: name.trim().toUpperCase(),
      game: game.trim() || 'Custom Game',
      tagline: tagline.trim() || `Dual Engine PvE & PvP | Zero-Disk Stream`,
      description: description.trim() || `Target Module: ${game}.exe. Engineered for D9Assist v2.0 secure memory pipeline with strict 10-slot quota.`,
      version: version.trim() || 'v2.0 - SECURE MEMORY',
      status: 'Operational',
      coverImage: coverUrl.trim() || '/src/assets/images/eft_tactical_operator_1795141443957.jpg',
      tiers: {
        '1_week': {
          id: '1_week',
          name: 'Weekly Operational Pass',
          durationLabel: '7 Days Access',
          price: Number(weekPrice) || 14.99,
          maxSlots: Number(weekSlots) || 10,
          claimedSlots: 0,
          perks: [
            `${name} full capability active`,
            'Zero-Disk memory injection pipeline',
            'Hourly community offset sync',
            'HWID reset included',
          ],
        },
        '1_month': {
          id: '1_month',
          name: 'Monthly Tactical Access',
          durationLabel: '30 Days Access',
          price: Number(monthPrice) || 34.99,
          maxSlots: Number(monthSlots) || 10,
          claimedSlots: 0,
          recommended: true,
          perks: [
            `${name} full capability active`,
            'High priority private cluster allocation',
            'Zero-Disk stream memory verification',
            'Dedicated ticket support',
          ],
        },
        '1_year': {
          id: '1_year',
          name: 'Annual Master License',
          durationLabel: '365 Days Access',
          price: Number(yearPrice) || 114.99,
          maxSlots: Number(yearSlots) || 10,
          claimedSlots: 0,
          perks: [
            `${name} full suite with zero interruptions`,
            'Permanent slot retention guarantee',
            'VIP developer direct channel',
            'All future updates included',
          ],
        },
      },
      media: [
        {
          id: `media-${id}-1`,
          type: 'image',
          url: coverUrl.trim() || '/src/assets/images/eft_tactical_operator_1795141443957.jpg',
          title: `${name} Target Interface`,
          caption: `Primary runtime overlay and in-game visualization for ${name}.`,
          aspectRatio: '16:9',
          tag: 'Field Deployment',
        },
      ],
      features: featureInputs.map((text) => ({
        title: text,
        desc: `High-fidelity implementation of ${text.toLowerCase()} with isolated runtime verification.`,
      })),
      requirements: [
        { label: 'Target Module', value: `${game}.exe` },
        { label: 'Operating System', value: 'Windows 10 / 11 64-bit' },
        { label: 'Security Layer', value: 'Ring-0 isolated with zero-disk stream' },
      ],
      changelog: [
        {
          version: version.trim() || 'v2.0',
          date: 'November 2026',
          items: ['Initial production deployment', 'Configured 10 1-yr, 10 1-mo, 10 1-wk slot quotas'],
        },
      ],
      createdAt: Date.now(),
    };

    onAddModule(newModule);
    setName('');
    setTagline('');
    setDescription('');
    setActiveTab('manage');
    setSelectedEditModuleId(newModule.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-3xl bg-[#141518] border border-[#232529] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#232529] flex items-center justify-between bg-[#0e0f11]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-lime-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase">
                D9ASSIST // CREATOR STUDIO & MODULE MANAGEMENT
              </h2>
              <p className="text-[11px] text-zinc-400">
                Deploy new modules, configure weekly/monthly/yearly pricing, and set slot allocations.
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

        {/* Tab Controls */}
        <div className="flex border-b border-[#232529] bg-[#0c0d0e] px-5 text-xs">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-colors cursor-pointer uppercase ${
              activeTab === 'create'
                ? 'border-lime-400 text-lime-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            + Add New Module
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-colors cursor-pointer uppercase ${
              activeTab === 'manage'
                ? 'border-lime-400 text-lime-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Manage Existing Modules ({modules.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateModule} className="space-y-5">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Module Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ESCAPE FROM TARKOV: ARENA"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Target Game / Platform
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Escape from Tarkov"
                    value={game}
                    onChange={(e) => setGame(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tagline & Description */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dual Engine PvE & PvP | Item Database | Zero-Disk Stream"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Full Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe module capabilities, target executable, and runtime behavior..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>

              {/* Cover Image Preset Picker */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Cover Image
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {[
                    { label: 'Tactical Operator', url: '/src/assets/images/eft_tactical_operator_1795141443957.jpg' },
                    { label: 'Ballistics HUD', url: '/src/assets/images/eft_ballistics_telemetry_1795141445918.jpg' },
                    { label: 'Armory Workbench', url: '/src/assets/images/eft_armory_workbench_1795141445483.jpg' },
                    { label: 'Exfil Route Map', url: '/src/assets/images/eft_extraction_intel_1795141445248.jpg' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverUrl(preset.url)}
                      className={`relative aspect-video rounded overflow-hidden border p-1 text-left transition-all ${
                        coverUrl === preset.url
                          ? 'border-lime-400 ring-2 ring-lime-400/30'
                          : 'border-[#232529] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded"
                      />
                      <span className="absolute bottom-1 left-1.5 right-1.5 text-[9px] text-white bg-black/85 px-1 py-0.5 rounded truncate block font-bold">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or enter custom image URL"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-white placeholder-zinc-600"
                />
              </div>

              {/* Slot Quota & Subscription Pricing */}
              <div className="p-4 rounded bg-[#0c0d0e] border border-[#232529] space-y-3">
                <div className="flex items-center gap-2 text-xs text-lime-400 uppercase tracking-wider font-bold">
                  <DollarSign className="w-4 h-4" />
                  <span>Subscription Tiers & Slot Limits</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Pre-configured to your specified slot distribution: 10 Annual, 10 Monthly, 10 Weekly.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1 Week */}
                  <div className="p-3 bg-[#141518] rounded border border-[#232529] space-y-2">
                    <span className="text-xs font-bold text-white block uppercase">1 Week Pass</span>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase block">Price ($/wk)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={weekPrice}
                        onChange={(e) => setWeekPrice(parseFloat(e.target.value))}
                        className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase block">Slots Available</label>
                      <input
                        type="number"
                        min="1"
                        value={weekSlots}
                        onChange={(e) => setWeekSlots(parseInt(e.target.value))}
                        className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-lime-400 font-bold"
                      />
                    </div>
                  </div>

                  {/* 1 Month */}
                  <div className="p-3 bg-[#141518] rounded border border-[#232529] space-y-2">
                    <span className="text-xs font-bold text-white block uppercase">1 Month Access</span>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase block">Price ($/mo)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={monthPrice}
                        onChange={(e) => setMonthPrice(parseFloat(e.target.value))}
                        className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase block">Slots Available</label>
                      <input
                        type="number"
                        min="1"
                        value={monthSlots}
                        onChange={(e) => setMonthSlots(parseInt(e.target.value))}
                        className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-lime-400 font-bold"
                      />
                    </div>
                  </div>

                  {/* 1 Year */}
                  <div className="p-3 bg-[#141518] rounded border border-[#232529] space-y-2">
                    <span className="text-xs font-bold text-white block uppercase">1 Year License</span>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase block">Price ($/yr)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={yearPrice}
                        onChange={(e) => setYearPrice(parseFloat(e.target.value))}
                        className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase block">Slots Available</label>
                      <input
                        type="number"
                        min="1"
                        value={yearSlots}
                        onChange={(e) => setYearSlots(parseInt(e.target.value))}
                        className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-lime-400 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Bullets */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Module Capability Highlights
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a feature (e.g. Sub-millisecond ballistics calculation)"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-white placeholder-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-[#1e2025] hover:bg-[#282a31] text-xs font-bold text-white rounded uppercase"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5">
                  {featureInputs.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-zinc-300"
                    >
                      <span>• {feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-zinc-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-[#232529] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded text-xs font-black text-black bg-lime-400 hover:bg-lime-300 shadow cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Publish New Module</span>
                </button>
              </div>
            </form>
          ) : (
            /* Manage Existing Modules (Full parity with Add New Module) */
            <div className="space-y-6">
              {/* Module selector dropdown & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 p-4 bg-[#0c0d0e] border border-[#232529] rounded">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Select Module to Configure
                  </label>
                  <select
                    value={editingModule?.id}
                    onChange={(e) => setSelectedEditModuleId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141518] border border-[#232529] focus:border-lime-400 rounded text-xs text-white font-bold"
                  >
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.game}) · {m.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {modules.length > 1 && (
                    confirmDeleteId === editingModule?.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (editingModule) {
                              onDeleteModule(editingModule.id);
                              setConfirmDeleteId(null);
                            }
                          }}
                          className="px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded transition-colors uppercase"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-2 text-xs font-medium text-zinc-400 hover:text-white uppercase"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => editingModule && setConfirmDeleteId(editingModule.id)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/80 rounded cursor-pointer uppercase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Module</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {editingModule && (
                <form onSubmit={handleSaveExistingModule} className="space-y-5">
                  {/* Basic Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Module Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Target Game / Platform
                      </label>
                      <input
                        type="text"
                        value={editGame}
                        onChange={(e) => setEditGame(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Tagline & Full Description */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={editTagline}
                      onChange={(e) => setEditTagline(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      Full Description
                    </label>
                    <textarea
                      rows={2}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                    />
                  </div>

                  {/* Version & Operational Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Architecture Version Label
                      </label>
                      <input
                        type="text"
                        value={editVersion}
                        onChange={(e) => setEditVersion(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Operational Status
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['Operational', 'Testing', 'Updating', 'Detected'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setEditStatus(st)}
                            className={`py-2 px-1 text-center rounded text-[11px] font-bold border transition-all uppercase cursor-pointer ${
                              editStatus === st
                                ? st === 'Detected'
                                  ? 'bg-rose-500/10 border-rose-400 text-rose-400'
                                  : st === 'Updating'
                                  ? 'bg-amber-400/10 border-amber-400 text-amber-400'
                                  : st === 'Testing'
                                  ? 'bg-cyan-400/10 border-cyan-400 text-cyan-400'
                                  : 'bg-lime-400/10 border-lime-400 text-lime-400'
                                : 'bg-[#0c0d0e] border-[#232529] text-zinc-400 hover:text-white'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cover Image Preset Picker & URL */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-2">
                      Cover Image
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                      {[
                        { label: 'Tactical Operator', url: '/src/assets/images/eft_tactical_operator_1795141443957.jpg' },
                        { label: 'Ballistics HUD', url: '/src/assets/images/eft_ballistics_telemetry_1795141445918.jpg' },
                        { label: 'Armory Workbench', url: '/src/assets/images/eft_armory_workbench_1795141445483.jpg' },
                        { label: 'Exfil Route Map', url: '/src/assets/images/eft_extraction_intel_1795141445248.jpg' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditCoverUrl(preset.url)}
                          className={`relative aspect-video rounded overflow-hidden border p-1 text-left transition-all cursor-pointer ${
                            editCoverUrl === preset.url
                              ? 'border-lime-400 ring-2 ring-lime-400/30'
                              : 'border-[#232529] opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded"
                          />
                          <span className="absolute bottom-1 left-1.5 right-1.5 text-[9px] text-white bg-black/85 px-1 py-0.5 rounded truncate block font-bold">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Or enter custom image URL"
                      value={editCoverUrl}
                      onChange={(e) => setEditCoverUrl(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                    />
                  </div>

                  {/* Slot Quota & Subscription Pricing (All 3 Tiers with Claimed Slots & Restock) */}
                  <div className="p-4 rounded bg-[#0c0d0e] border border-[#232529] space-y-3">
                    <div className="flex items-center gap-2 text-xs text-lime-400 uppercase tracking-wider font-bold">
                      <DollarSign className="w-4 h-4" />
                      <span>Subscription Tiers & Slot Limits</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Configure weekly ($14.99 default), monthly ($34.99 default), and yearly ($114.99 default) pricing, slot capacity (10 each), and claimed counters.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1 Week */}
                      <div className="p-3 bg-[#141518] rounded border border-[#232529] space-y-2">
                        <span className="text-xs font-bold text-white block uppercase">1 Week Pass</span>
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase block">Price ($/wk)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editWeekPrice}
                            onChange={(e) => setEditWeekPrice(parseFloat(e.target.value))}
                            className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase block">Max Slots</label>
                          <input
                            type="number"
                            min="1"
                            value={editWeekSlots}
                            onChange={(e) => setEditWeekSlots(parseInt(e.target.value))}
                            className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-lime-400 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase block">Claimed Slots</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max={editWeekSlots}
                              value={editWeekClaimed}
                              onChange={(e) => setEditWeekClaimed(parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-zinc-300"
                            />
                            <button
                              type="button"
                              onClick={() => setEditWeekClaimed(0)}
                              title="Restock slots to 0 claimed"
                              className="px-2 py-1 bg-[#1e2025] hover:bg-[#282a31] text-[10px] rounded text-lime-400 font-bold uppercase whitespace-nowrap cursor-pointer"
                            >
                              Restock
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 1 Month */}
                      <div className="p-3 bg-[#141518] rounded border border-[#232529] space-y-2">
                        <span className="text-xs font-bold text-white block uppercase">1 Month Access</span>
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase block">Price ($/mo)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editMonthPrice}
                            onChange={(e) => setEditMonthPrice(parseFloat(e.target.value))}
                            className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase block">Max Slots</label>
                          <input
                            type="number"
                            min="1"
                            value={editMonthSlots}
                            onChange={(e) => setEditMonthSlots(parseInt(e.target.value))}
                            className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-lime-400 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase block">Claimed Slots</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max={editMonthSlots}
                              value={editMonthClaimed}
                              onChange={(e) => setEditMonthClaimed(parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-zinc-300"
                            />
                            <button
                              type="button"
                              onClick={() => setEditMonthClaimed(0)}
                              title="Restock slots to 0 claimed"
                              className="px-2 py-1 bg-[#1e2025] hover:bg-[#282a31] text-[10px] rounded text-lime-400 font-bold uppercase whitespace-nowrap cursor-pointer"
                            >
                              Restock
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 1 Year */}
                      <div className="p-3 bg-[#141518] rounded border border-[#232529] space-y-2">
                        <span className="text-xs font-bold text-white block uppercase">1 Year License</span>
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase block">Price ($/yr)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editYearPrice}
                            onChange={(e) => setEditYearPrice(parseFloat(e.target.value))}
                            className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase block">Max Slots</label>
                          <input
                            type="number"
                            min="1"
                            value={editYearSlots}
                            onChange={(e) => setEditYearSlots(parseInt(e.target.value))}
                            className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-lime-400 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase block">Claimed Slots</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max={editYearSlots}
                              value={editYearClaimed}
                              onChange={(e) => setEditYearClaimed(parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-zinc-300"
                            />
                            <button
                              type="button"
                              onClick={() => setEditYearClaimed(0)}
                              title="Restock slots to 0 claimed"
                              className="px-2 py-1 bg-[#1e2025] hover:bg-[#282a31] text-[10px] rounded text-lime-400 font-bold uppercase whitespace-nowrap cursor-pointer"
                            >
                              Restock
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Module Capability Highlights */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Module Capability Highlights
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Add capability highlight (e.g. Sub-millisecond ballistics zeroing)"
                        value={editNewFeatureText}
                        onChange={(e) => setEditNewFeatureText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddEditFeature();
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddEditFeature}
                        className="px-4 py-2 bg-[#1e2025] hover:bg-[#282a31] text-xs font-bold text-white rounded uppercase cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {editFeatures.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-1.5 bg-[#0c0d0e] border border-[#232529] rounded text-xs text-zinc-300"
                        >
                          <span>• {feat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEditFeature(idx)}
                            className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Prerequisites & Host Machine Requirements */}
                  <div className="p-4 rounded bg-[#0c0d0e] border border-[#232529] space-y-3">
                    <div className="flex items-center gap-2 text-xs text-lime-400 uppercase tracking-wider font-bold">
                      <Cpu className="w-4 h-4" />
                      <span>System Prerequisites & Host Machine Invariants</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase block mb-1">Target Executable</label>
                        <input
                          type="text"
                          value={editTargetExe}
                          onChange={(e) => setEditTargetExe(e.target.value)}
                          placeholder="e.g. EscapeFromTarkov.exe"
                          className="w-full px-2 py-1.5 bg-[#141518] border border-[#232529] rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase block mb-1">Operating System</label>
                        <input
                          type="text"
                          value={editOS}
                          onChange={(e) => setEditOS(e.target.value)}
                          placeholder="e.g. Windows 10 / 11 64-bit"
                          className="w-full px-2 py-1.5 bg-[#141518] border border-[#232529] rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase block mb-1">Security Layer</label>
                        <input
                          type="text"
                          value={editSecurity}
                          onChange={(e) => setEditSecurity(e.target.value)}
                          placeholder="e.g. Ring-0 isolated zero-disk stream"
                          className="w-full px-2 py-1.5 bg-[#141518] border border-[#232529] rounded text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Module Configuration Bar */}
                  <div className="pt-4 border-t border-[#232529] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      {saveSuccessMsg ? (
                        <div className="flex items-center gap-2 text-xs text-lime-400 font-bold uppercase animate-fade-in">
                          <Check className="w-4 h-4" />
                          <span>{saveSuccessMsg}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500">
                          Changes take effect instantly and sync across active sessions.
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-white uppercase cursor-pointer"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded text-xs font-black text-black bg-lime-400 hover:bg-lime-300 shadow cursor-pointer uppercase tracking-wider"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Module Configuration</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Reset to defaults */}
              <div className="pt-4 border-t border-[#232529] flex items-center justify-between text-xs">
                <span className="text-zinc-500">
                  Reset D9 Tarkov seed modules and restore initial configuration.
                </span>
                {confirmReset ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onResetDefaults();
                        setConfirmReset(false);
                      }}
                      className="px-3 py-1.5 rounded text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors uppercase cursor-pointer"
                    >
                      Confirm Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-2 py-1 text-xs text-zinc-400 hover:text-white uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-zinc-400 hover:text-white bg-[#1e2025] hover:bg-[#282a31] transition-colors cursor-pointer uppercase"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
