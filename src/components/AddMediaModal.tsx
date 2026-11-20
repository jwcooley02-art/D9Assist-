import React, { useState } from 'react';
import { MediaItem } from '../types';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Video, CheckCircle } from 'lucide-react';

interface AddMediaModalProps {
  moduleName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mediaItem: MediaItem) => void;
}

export const AddMediaModal: React.FC<AddMediaModalProps> = ({
  moduleName,
  isOpen,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<'image' | 'video'>('image');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState('In-Raid Demo');
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url');
  const [url, setUrl] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError('File size exceeds 20MB limit. Consider using an external direct URL.');
      return;
    }

    setError(null);
    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFilePreview(result);
      setUrl(result);
      setIsProcessingFile(false);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try another file or URL.');
      setIsProcessingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = url.trim() || filePreview;
    if (!finalUrl) {
      setError('Please provide a media URL or upload a file.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title for this media item.');
      return;
    }

    const newItem: MediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      url: finalUrl,
      title: title.trim(),
      caption: caption.trim() || `${type === 'video' ? 'Video recording' : 'Field screenshot'} for ${moduleName}`,
      tag: tag.trim() || (type === 'video' ? 'Video Demo' : 'Screenshot'),
      aspectRatio: '16:9',
      isCustom: true,
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-xl bg-[#141518] border border-[#232529] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[#232529] flex items-center justify-between bg-[#0e0f11]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase">
              D9ASSIST // ADD MEDIA: {moduleName}
            </h3>
            <p className="text-[11px] text-zinc-400">
              Attach screenshots or gameplay video clips to showcase this module.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#1e2025] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Media Type Selector */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Media Type
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setType('image')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded border transition-all uppercase font-bold ${
                  type === 'image'
                    ? 'bg-lime-400/10 border-lime-400 text-lime-400'
                    : 'bg-[#0c0d0e] border-[#232529] text-zinc-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Picture / Screenshot</span>
              </button>
              <button
                type="button"
                onClick={() => setType('video')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded border transition-all uppercase font-bold ${
                  type === 'video'
                    ? 'bg-lime-400/10 border-lime-400 text-lime-400'
                    : 'bg-[#0c0d0e] border-[#232529] text-zinc-400 hover:text-white'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video Clip</span>
              </button>
            </div>
          </div>

          {/* Input Source: URL vs File Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                Source
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setInputMode('url')}
                  className={`px-2 py-0.5 rounded transition-colors uppercase font-bold ${
                    inputMode === 'url' ? 'bg-lime-400 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Direct URL
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-2 py-0.5 rounded transition-colors uppercase font-bold ${
                    inputMode === 'upload' ? 'bg-lime-400 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {inputMode === 'url' ? (
              <div className="relative">
                <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="url"
                  placeholder={
                    type === 'video'
                      ? 'https://example.com/demo.mp4'
                      : 'https://example.com/screenshot.jpg'
                  }
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setFilePreview(e.target.value);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>
            ) : (
              <div className="border border-dashed border-[#232529] rounded p-4 text-center hover:border-lime-400/50 transition-colors bg-[#0c0d0e]">
                <input
                  type="file"
                  id="media-file-input"
                  accept={type === 'video' ? 'video/mp4,video/webm' : 'image/*'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="media-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-1"
                >
                  <Upload className="w-5 h-5 text-lime-400 mb-1" />
                  <span className="text-xs font-bold text-lime-400 uppercase">
                    Select a {type === 'video' ? 'video clip' : 'picture'}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {type === 'video' ? 'MP4 or WebM (up to 20MB)' : 'PNG, JPG, or WebP'}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Media Preview Box */}
          {(filePreview || url) && (
            <div className="relative rounded overflow-hidden border border-[#232529] aspect-video bg-black flex items-center justify-center">
              {type === 'video' ? (
                <video
                  src={url || filePreview || ''}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={url || filePreview || ''}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Factory Night Raid Telemetry"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
            />
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
              Description / Caption
            </label>
            <textarea
              rows={2}
              placeholder="Brief details about what this clip or screenshot proves..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
            />
          </div>

          {/* Tag Selector */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
              Category Tag
            </label>
            <input
              type="text"
              placeholder="e.g. Ballistics HUD, In-Raid Demo, Loot Filter"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#232529]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessingFile}
              className="flex items-center gap-1.5 px-5 py-2 rounded text-xs font-black text-black bg-lime-400 hover:bg-lime-300 transition-all cursor-pointer shadow uppercase tracking-wider"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Media</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
