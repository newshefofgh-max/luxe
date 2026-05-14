'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onChange, maxImages = 6 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('فقط JPG, PNG, WebP مسموح بها');
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5MB');
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'products');

    const token = localStorage.getItem('admin_token');
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error ?? 'Upload failed');
    }

    const { data } = await response.json();
    return data.url;
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        toast.error(`الحد الأقصى ${maxImages} صور`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remaining);
      setUploading(true);

      const newUrls: string[] = [];
      for (const file of filesToUpload) {
        try {
          const url = await uploadFile(file);
          if (url) newUrls.push(url);
        } catch (err) {
          toast.error(`فشل رفع ${file.name}`);
        }
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
        toast.success(`تم رفع ${newUrls.length} صورة`);
      }
      setUploading(false);
    },
    [images, maxImages, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const moveImage = (from: number, to: number) => {
    const updated = [...images];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onChange(updated);
  };

  return (
    <div>
      {/* Dropzone */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-sm p-8 text-center transition-colors cursor-pointer mb-4 ${
            dragOver
              ? 'border-[#C9A84C] bg-[#C9A84C]/5'
              : 'border-[#2a2a4a] hover:border-[#C9A84C]/50'
          }`}
          onClick={() => document.getElementById('image-upload-input')?.click()}
        >
          <input
            id="image-upload-input"
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="text-[#C9A84C] animate-spin" size={32} />
              <p className="text-gray-400 text-sm">جاري الرفع...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="text-gray-400" size={32} />
              <p className="text-white text-sm">اسحب الصور هنا أو اضغط للاختيار</p>
              <p className="text-gray-500 text-xs">
                JPG, PNG, WebP · حتى 5MB · {maxImages - images.length} صورة متبقية
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative group aspect-square">
              <div className="relative w-full h-full bg-page rounded-sm overflow-hidden border border-[#2a2a4a]">
                <Image src={url} alt={`Product image ${i + 1}`} fill className="object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-[#C9A84C] text-[#1a1a2e] text-xs text-center py-0.5 font-bold">
                    رئيسية
                  </span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex items-center justify-center gap-1">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    className="text-white bg-[#C9A84C] rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    title="Move left"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="text-white bg-red-500 rounded-full w-6 h-6 flex items-center justify-center"
                >
                  <X size={12} />
                </button>
                {i < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i + 1)}
                    className="text-white bg-[#C9A84C] rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    title="Move right"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          ))}

          {images.length < maxImages && (
            <label className="aspect-square border-2 border-dashed border-[#2a2a4a] rounded-sm flex items-center justify-center cursor-pointer hover:border-[#C9A84C]/50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <ImageIcon className="text-gray-500" size={20} />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
