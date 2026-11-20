import React, { useState, useEffect } from 'react';
import { MediaItem, UserRole } from '../types';
import { X, Edit3, ShieldAlert, Check, Image as ImageIcon, Video, Tag } from 'lucide-react';

interface EditMediaModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mediaId: string, updated: { title: string; caption: string; tag?: string }) => void;
  currentUserRole: UserRole;
}

export const EditMediaModal: React.FC<EditMediaModalProps> = ({
  media,
  isOpen,
  onClose,
  onSave,
  currentUserRole,
}) => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (media) {
      setTitle(media.title);
      setCaption(media.caption);
      setTag(media.tag || 'FIELD DEPLOYMENT');
      setErrorMsg(null);
    }
  }, [media, isOpen]);

  if (!isOpen || !media) return null;

  const isAdmin = currentUserRole === 'Admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMsg('Access Denied: Only Admins can modify media titles and descriptions.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Title cannot be empty.');
      return;
    }

    onSave(media.id, {
      title: title.trim(),
      caption: caption.trim(),
      tag: tag.trim().toUpperCase(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-xl bg-[#141518] border border-[#232529] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#232529] flex items-center justify-between bg-[#0e0f11]">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-lime-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase">
                D9ASSIST // EDIT MEDIA ASSET
              </h3>
              <p className="text-[11px] text-zinc-400">
                Update title, description, and telemetry tags. Protected: Admin role only.
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

        {/* Access Check Notification */}
        {!isAdmin ? (
          <div className="p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-rose-400 uppercase">
                Admin Role Required
              </h4>
              <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto">
                Only operators with the <span className="text-lime-400 font-bold font-mono">Admin</span> role are permitted to edit media titles and descriptions. Your current session role is <span className="text-white font-bold font-mono">[{currentUserRole}]</span>.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded bg-[#1e2025] hover:bg-[#282a31] text-xs font-bold text-white uppercase cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {errorMsg && (
              <div className="p-2.5 rounded bg-rose-950/50 border border-rose-800 text-xs text-rose-300 font-sans">
                {errorMsg}
              </div>
            )}

            {/* Media Preview Strip */}
            <div className="p-3 rounded bg-[#0c0d0e] border border-[#232529] flex items-center gap-3">
              <div className="w-16 h-12 rounded bg-black overflow-hidden shrink-0 border border-[#232529] flex items-center justify-center">
                {media.type === 'video' ? (
                  <video src={media.url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={media.url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <span className="text-zinc-500 uppercase text-[10px] block">
                  Editing Asset ({media.type.toUpperCase()})
                </span>
                <span className="text-white font-bold truncate block">{media.title}</span>
              </div>
              <div className="shrink-0 text-right">
                <span className="px-2 py-0.5 rounded bg-lime-400/10 border border-lime-400/30 text-lime-400 text-[10px] font-bold">
                  ADMIN GRANTED
                </span>
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Asset Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sub-Millimeter Ballistics HUD"
                className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white font-bold placeholder-zinc-600 focus:outline-none"
              />
            </div>

            {/* Category Tag */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Telemetry Tag / Category
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g. FIELD DEPLOYMENT, IN-GAME HUD, BALLISTICS"
                  className="w-full pl-9 pr-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-lime-400 font-bold placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Description / Caption */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Description & Technical Details *
              </label>
              <textarea
                required
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter comprehensive breakdown of visual capabilities, target offsets, or telemetry overlay shown..."
                className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none leading-relaxed font-sans"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#232529] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-[#1e2025] hover:bg-[#282a31] text-xs font-bold text-zinc-400 hover:text-white uppercase transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded text-xs font-black text-black bg-lime-400 hover:bg-lime-300 shadow cursor-pointer uppercase tracking-wider transition-all"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
