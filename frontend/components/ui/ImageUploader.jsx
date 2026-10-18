'use client';

import { useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadFile } from '@/lib/client';
import { useToast } from './Toast';
import { Button } from './primitives';

/**
 * Image uploader backed by the admin upload endpoint (Cloudinary with a local
 * disk fallback). Emits { url, publicId } through onChange.
 */
export function ImageUploader({ value, onChange, folder = 'academy', label = 'Image', aspect = 'aspect-video' }) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  const currentUrl = typeof value === 'string' ? value : value?.url || '';

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller');
      return;
    }

    setUploading(true);
    const result = await uploadFile(file, folder);
    setUploading(false);

    if (!result.ok) {
      toast.error(result.message || 'Upload failed');
      return;
    }
    toast.success('Image uploaded');
    onChange({ url: result.data.url, publicId: result.data.publicId });
  };

  return (
    <div>
      {label && <span className="label">{label}</span>}
      <div className={cnAspect(aspect)}>
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <ImagePlus className="h-7 w-7" />
            <span className="text-xs">No image selected</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label className="btn btn-secondary btn-sm cursor-pointer">
          <ImagePlus className="h-4 w-4" />
          {currentUrl ? 'Replace' : 'Upload'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        {currentUrl && (
          <Button variant="ghost" size="sm" onClick={() => onChange({ url: '', publicId: '' })}>
            <X className="h-4 w-4" /> Remove
          </Button>
        )}
      </div>
    </div>
  );
}

function cnAspect(aspect) {
  return `relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 ${aspect}`;
}
