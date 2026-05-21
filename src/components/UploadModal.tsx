'use client';

import React, { useState, useRef, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Film, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMemory: any) => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setErrorMessage('Please upload a valid image or video file.');
      return;
    }

    setErrorMessage(null);
    setFile(selectedFile);

    // Create a local preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const triggerConfetti = () => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 1000, colors: ['#C5A880', '#D4AF37', '#F5E2B3', '#E8E2D5'] };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      // Confetti shooting from bottom corners
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setIsUploading(true);
    setProgress(15);

    try {
      // Simulate progressive upload steps for smooth UI feel
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 300);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('date', date);

      const response = await fetch('/api/memories', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save memory.');
      }

      setProgress(100);
      const data = await response.json();

      setTimeout(() => {
        setIsSuccess(true);
        triggerConfetti();
        
        // Wait a bit, then notify parent & close
        setTimeout(() => {
          onSuccess(data.memory);
          resetState();
          onClose();
        }, 2200);
      }, 400);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      setIsUploading(false);
      setProgress(0);
    }
  };

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsDragging(false);
    setIsUploading(false);
    setProgress(0);
    setIsSuccess(false);
    setErrorMessage(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isUploading ? onClose : undefined}
            className="absolute inset-0 bg-[#12100E]/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="glass-panel w-full max-w-2xl rounded-2xl border border-[#C5A880]/15 overflow-hidden shadow-2xl relative z-10 text-[#F5F2EB]"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-[#C5A880]/10">
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-[#C5A880]" />
                <h2 className="font-serif text-lg tracking-widest uppercase text-[#E8E2D5]">Preserve a Memory</h2>
              </div>
              {!isUploading && (
                <button
                  onClick={onClose}
                  className="text-[#E8E2D5]/60 hover:text-[#F5F2EB] hover:rotate-90 transition-all duration-300 cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Inner Content */}
            <div className="p-6">
              {isSuccess ? (
                /* Success Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                  >
                    <CheckCircle2 size={60} className="text-[#C5A880]" />
                  </motion.div>
                  <h3 className="font-serif text-2xl tracking-wider text-[#E8E2D5]">Memory Archived</h3>
                  <p className="font-sans text-xs tracking-wider text-[#E8E2D5]/60 max-w-xs">
                    Your moment has been preserved with care in the digital vault.
                  </p>
                </motion.div>
              ) : isUploading ? (
                /* Uploading / Progress Screen */
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border border-[#C5A880]/10 flex items-center justify-center">
                      <UploadCloud size={32} className="text-[#C5A880] animate-bounce" />
                    </div>
                    {/* Ring glow */}
                    <div className="absolute inset-0 rounded-full border-t border-r border-[#C5A880] animate-spin" />
                  </div>
                  
                  <div className="w-full max-w-sm space-y-2">
                    <div className="flex justify-between items-center text-[10px] tracking-widest uppercase text-[#E8E2D5]/70">
                      <span>Archiving Moment...</span>
                      <span>{progress}%</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full h-[2px] bg-[#2A2420] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#C5A880] to-[#D4AF37]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Input Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs py-3 px-4 rounded-lg tracking-wide">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Drag and Drop */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center border border-dashed rounded-xl p-6 cursor-pointer text-center group transition-all duration-300 h-[260px] ${
                        isDragging
                          ? 'border-[#C5A880] bg-[rgba(197,168,128,0.06)]'
                          : 'border-[#C5A880]/20 hover:border-[#C5A880]/50 hover:bg-[rgba(197,168,128,0.02)]'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                        className="hidden"
                      />

                      {preview ? (
                        /* Preview mode */
                        <div className="absolute inset-0 p-2">
                          <div className="w-full h-full relative rounded-lg overflow-hidden border border-[#C5A880]/15">
                            {file?.type.startsWith('video/') ? (
                              <div className="relative w-full h-full flex items-center justify-center bg-black">
                                <video src={preview} className="w-full h-full object-cover" muted playsInline />
                                <div className="absolute bottom-2 left-2 bg-[#12100E]/70 border border-[#C5A880]/25 rounded p-1 text-[8px] uppercase tracking-widest text-[#C5A880] flex items-center space-x-1">
                                  <Film size={10} />
                                  <span>Film Preview</span>
                                </div>
                              </div>
                            ) : (
                              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            )}
                            {/* Overlay hover change state */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                              <span className="text-[10px] uppercase tracking-[0.2em] border border-[#E8E2D5]/40 py-1.5 px-4 rounded text-[#E8E2D5]">
                                Change File
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Empty state upload indicator */
                        <div className="space-y-4">
                          <div className="w-12 h-12 rounded-full bg-[#1A1613] border border-[#C5A880]/10 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-300">
                            <UploadCloud size={20} className="text-[#C5A880]/60 group-hover:text-[#C5A880] transition-colors" />
                          </div>
                          <div>
                            <p className="text-xs font-serif text-[#E8E2D5] tracking-widest uppercase">
                              Drop your memory
                            </p>
                            <p className="text-[10px] text-[#E8E2D5]/50 mt-1 tracking-wider">
                              Supports Photographs or Films (Max 25MB)
                            </p>
                          </div>
                          <span className="inline-block text-[9px] uppercase tracking-widest border border-[#C5A880]/20 group-hover:border-[#C5A880] py-1 px-4 rounded-full text-[#C5A880]/70 group-hover:text-[#C5A880] transition-all duration-300">
                            Select File
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Metadata Inputs */}
                    <div className="flex flex-col justify-between space-y-4">
                      {/* Title */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-[0.2em] text-[#C5A880] font-semibold">
                          Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Name this quiet moment..."
                          className="w-full bg-[#1A1613]/50 border-b border-[#C5A880]/20 focus:border-[#C5A880] text-xs py-2 px-1 focus:outline-none transition-colors duration-300 text-[#F5F2EB] placeholder-[#E8E2D5]/35"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-[0.2em] text-[#C5A880] font-semibold">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="How did it feel? (Optional)"
                          rows={4}
                          className="w-full bg-[#1A1613]/50 border border-[#C5A880]/10 focus:border-[#C5A880]/40 rounded-lg text-xs p-3 focus:outline-none transition-colors duration-300 text-[#F5F2EB] placeholder-[#E8E2D5]/35 resize-none"
                        />
                      </div>

                      {/* Date */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-[0.2em] text-[#C5A880] font-semibold">
                          Date of Occurrence
                        </label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full bg-[#1A1613]/50 border-b border-[#C5A880]/20 focus:border-[#C5A880] text-xs py-2 px-1 focus:outline-none transition-colors duration-300 text-[#F5F2EB] [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-[#C5A880]/10">
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-xs uppercase tracking-widest text-[#E8E2D5]/50 hover:text-[#E8E2D5] py-2 px-4 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!file || !title.trim()}
                      className={`text-xs uppercase tracking-[0.2em] font-medium py-2 px-6 rounded-full flex items-center space-x-2 transition-all duration-500 cursor-pointer ${
                        file && title.trim()
                          ? 'bg-[#C5A880] hover:bg-[#D4AF37] text-[#12100E] shadow-lg shadow-[#C5A880]/10 hover:shadow-[#D4AF37]/20 hover:scale-[1.02]'
                          : 'bg-[#2A2420] text-[#E8E2D5]/20 cursor-not-allowed border border-[#C5A880]/5'
                      }`}
                    >
                      <span>Preserve Moment</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
