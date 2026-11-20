import React, { useState } from 'react';
import { ModuleItem, MediaItem, UserRole } from '../types';
import { Plus, Play, Image as ImageIcon, Video, Trash2, Maximize2, X, ExternalLink, AlertTriangle, Edit3, ShieldAlert } from 'lucide-react';

interface MediaTabProps {
  module: ModuleItem;
  currentUserRole: UserRole;
  onAddMediaClick: () => void;
  onDeleteMedia: (mediaId: string) => void;
  onEditMediaClick: (media: MediaItem) => void;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  module,
  currentUserRole,
  onAddMediaClick,
  onDeleteMedia,
  onEditMediaClick,
}) => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [activeLightboxItem, setActiveLightboxItem] = useState<MediaItem | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);

  const filteredMedia = module.media.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const handleConfirmDelete = () => {
    if (!mediaToDelete) return;
    onDeleteMedia(mediaToDelete.id);
    if (activeLightboxItem?.id === mediaToDelete.id) {
      setActiveLightboxItem(null);
    }
    setMediaToDelete(null);
  };

  const isAdmin = currentUserRole === 'Admin';

  return (
    <section id="media-showcase" className="py-14 bg-[#0c0d0e] border-b border-[#232529]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-lime-400 uppercase tracking-wider mb-2 font-bold">
              <span>D9ASSIST // FIELD INTELLIGENCE</span>
              <span aria-hidden="true">·</span>
              <span>{module.name}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-mono">
              Media Showcase & Video Demos
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-mono max-w-2xl">
              Inspect verified D9Assist client captures, real-time ballistics telemetry, and recorded target acquisition clips.
            </p>
          </div>

          {/* Action & Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 font-mono">
            {/* Filter segmented buttons */}
            <div className="flex items-center gap-1 p-1 bg-[#141518] border border-[#232529] rounded">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors whitespace-nowrap cursor-pointer uppercase ${
                  filter === 'all'
                    ? 'bg-lime-400 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All ({module.media.length})
              </button>
              <button
                onClick={() => setFilter('image')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors whitespace-nowrap cursor-pointer uppercase ${
                  filter === 'image'
                    ? 'bg-lime-400 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Pictures</span>
              </button>
              <button
                onClick={() => setFilter('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors whitespace-nowrap cursor-pointer uppercase ${
                  filter === 'video'
                    ? 'bg-lime-400 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Videos</span>
              </button>
            </div>

            {/* Add Media Button (Admin only) */}
            {isAdmin ? (
              <button
                onClick={onAddMediaClick}
                className="flex items-center gap-2 px-4 py-2 text-xs font-black text-black bg-lime-400 hover:bg-lime-300 rounded transition-all shadow-sm cursor-pointer whitespace-nowrap uppercase tracking-wider"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Picture or Video</span>
              </button>
            ) : (
              <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider px-3 py-1.5 rounded bg-[#141518] border border-[#232529]">
                [MEDIA MANAGEMENT: ADMIN ONLY]
              </span>
            )}
          </div>
        </div>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#232529] rounded-lg bg-[#121316]">
            <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-mono font-bold text-zinc-300 uppercase">No media in this filter</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto font-mono">
              Add screenshots or video captures to showcase this module.
            </p>
            {isAdmin && (
              <button
                onClick={onAddMediaClick}
                className="mt-4 px-4 py-2 text-xs font-mono font-bold text-lime-400 bg-lime-400/10 border border-lime-400/30 rounded hover:bg-lime-400/20 uppercase cursor-pointer"
              >
                Upload First Media
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between bg-[#141518] rounded-lg border border-[#232529] overflow-hidden hover:border-lime-400/50 transition-all shadow-sm"
              >
                {/* Media Container */}
                <div
                  onClick={() => setActiveLightboxItem(item)}
                  className="relative aspect-video bg-black cursor-pointer overflow-hidden flex items-center justify-center"
                >
                  {item.type === 'video' ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-lime-400 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 bg-black/85 backdrop-blur-sm rounded text-[10px] text-lime-400 border border-[#232529] font-bold">
                        <Video className="w-3 h-3" />
                        <span>VIDEO DEMO</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={item.url}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-xs text-white flex items-center gap-1 font-bold">
                          <Maximize2 className="w-3.5 h-3.5 text-lime-400" />
                          <span>Click to expand</span>
                        </span>
                      </div>
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 bg-black/85 backdrop-blur-sm rounded text-[10px] text-zinc-300 border border-[#232529] font-bold">
                        <ImageIcon className="w-3 h-3 text-lime-400" />
                        <span>{item.tag || 'SCREENSHOT'}</span>
                      </div>
                    </div>
                  )}

                  {/* Top-Right Quick Delete Button (Admin only) */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMediaToDelete(item);
                      }}
                      title="Delete media (Admin only)"
                      className="absolute top-2.5 right-2.5 p-1.5 rounded bg-black/90 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 border border-[#232529] hover:border-rose-700 transition-colors z-20 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Media Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight uppercase line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                      {item.caption}
                    </p>
                  </div>

                  {/* Footer actions: Inspect, Edit (Admin only), and Delete (Admin only) */}
                  <div className="mt-3 pt-3 border-t border-[#232529] flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => setActiveLightboxItem(item)}
                      className="text-lime-400 hover:text-lime-300 flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <span>INSPECT</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    {isAdmin ? (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onEditMediaClick(item)}
                          className="text-lime-400 hover:text-lime-300 flex items-center gap-1 font-bold cursor-pointer"
                          title="Edit description & title (Admin only)"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>EDIT</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setMediaToDelete(item);
                          }}
                          className="text-zinc-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete media (Admin only)"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>DELETE</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                        [VIEW ONLY]
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Video Modal */}
      {activeLightboxItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in font-mono">
          <div className="relative w-full max-w-4xl bg-[#141518] border border-[#232529] rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-[#232529] flex items-center justify-between bg-[#0e0f11]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase">
                  D9ASSIST // {activeLightboxItem.title}
                </h3>
                <span className="text-[11px] text-lime-400">
                  {activeLightboxItem.tag || 'FIELD VERIFICATION'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onEditMediaClick(activeLightboxItem);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/40 text-lime-400 text-xs font-bold cursor-pointer transition-colors"
                      title="Edit title and description"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaToDelete(activeLightboxItem)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setActiveLightboxItem(null)}
                  className="p-1.5 rounded bg-[#1e2025] hover:bg-[#282a31] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Content Area */}
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden max-h-[60vh] p-2">
              {activeLightboxItem.type === 'video' ? (
                <video
                  src={activeLightboxItem.url}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[60vh] object-contain"
                />
              ) : (
                <img
                  src={activeLightboxItem.url}
                  alt={activeLightboxItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full max-h-[60vh] object-contain"
                />
              )}
            </div>

            {/* Modal Caption */}
            <div className="p-4 bg-[#111215] border-t border-[#232529]">
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {activeLightboxItem.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal (No window.confirm!) */}
      {mediaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-mono">
          <div className="relative w-full max-w-md bg-[#141518] border border-rose-800/80 rounded-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase">
                  Delete Media Asset?
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Are you sure you want to remove <span className="text-white font-bold font-mono">"{mediaToDelete.title}"</span> from this module's showcase?
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#0c0d0e] border border-[#232529] flex items-center gap-3">
              <div className="w-12 h-10 rounded overflow-hidden bg-black shrink-0 border border-[#232529]">
                {mediaToDelete.type === 'video' ? (
                  <video src={mediaToDelete.url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={mediaToDelete.url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs text-white font-bold truncate block">{mediaToDelete.title}</span>
                <span className="text-[10px] text-zinc-500 uppercase">{mediaToDelete.type === 'video' ? 'Video Clip' : 'Picture'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#232529]">
              <button
                type="button"
                onClick={() => setMediaToDelete(null)}
                className="px-4 py-2 rounded bg-[#1e2025] hover:bg-[#282a31] text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
