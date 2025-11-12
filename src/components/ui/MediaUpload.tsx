'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image, Video, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MediaUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  currentUrl?: string;
  label?: string;
  description?: string;
}

export function MediaUpload({
  onUpload,
  accept = "image/*,video/*",
  maxSize = 50,
  currentUrl,
  label = "Upload Media",
  description = "Click to upload or drag and drop"
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/');
      if (type === 'video/*') return file.type.startsWith('video/');
      return file.type === type;
    });

    if (!isValidType) {
      toast.error('Invalid file type');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', '');
      formData.append('description', '');
      formData.append('tags', '');

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setPreview(data.url);
      onUpload(data.url);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (url: string) => {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return <Image className="w-8 h-8 text-primary-gold" />;
    }
    if (url.match(/\.(mp4|webm|ogg|mov)$/i)) {
      return <Video className="w-8 h-8 text-primary-gold" />;
    }
    return <FileText className="w-8 h-8 text-primary-gold" />;
  };

  const isImage = (url: string) => {
    return url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
  };

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      
      {preview ? (
        <div className="relative">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300">Current file:</span>
              <button
                type="button"
                onClick={clearFile}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {isImage(preview) ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg"
              />
            ) : isVideo(preview) ? (
              <video
                src={preview}
                className="w-full h-32 object-cover rounded-lg"
                controls
              />
            ) : (
              <div className="flex items-center space-x-3 p-4 bg-gray-900/50 rounded-lg">
                {getFileIcon(preview)}
                <span className="text-sm text-gray-300 truncate">{preview}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-primary-gold bg-primary-gold/10'
              : 'border-gray-600 hover:border-gray-500'
          } ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
            disabled={isUploading}
          />
          
          <div className="space-y-4">
            {isUploading ? (
              <Loader2 className="w-12 h-12 text-primary-gold animate-spin mx-auto" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            )}
            
            <div>
              <p className="text-lg font-medium text-white">
                {isUploading ? 'Uploading...' : label}
              </p>
              <p className="text-sm text-gray-400">
                {isUploading ? 'Please wait while we upload your file' : description}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Max size: {maxSize}MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
