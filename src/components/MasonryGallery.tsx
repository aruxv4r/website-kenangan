'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Calendar, Film, Image as ImageIcon, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react';

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
}

interface MasonryGalleryProps {
  items: GalleryItem[];
  onDeleteSuccess?: (id: string) => void;
}

export default function MasonryGallery({ items, onDeleteSuccess }: MasonryGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Keyboard navigation for the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === 'Escape') setSelectedIdx(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, items]);

  const handlePrev = () => {
    if (selectedIdx === null) return;
    setSelectedIdx((prev) => (prev! === 0 ? items.length - 1 : prev! - 1));
  };

  const handleNext = () => {
    if (selectedIdx === null) return;
    setSelectedIdx((prev) => (prev! === items.length - 1 ? 0 : prev! + 1));
  };

  // Reset delete confirmation when dynamic selection changes
  useEffect(() => {
    setConfirmDelete(false);
    setIsDeleting(false);
  }, [selectedIdx]);

  const handleDelete = async () => {
    if (selectedIdx === null || !items[selectedIdx]) return;
    const selectedItem = items[selectedIdx];

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/memories/${selectedItem.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (onDeleteSuccess) {
          onDeleteSuccess(selectedItem.id);
        }
        setSelectedIdx(null);
      } else {
        const err = await response.json();
        alert(`Failed to erase: ${err.error || 'Unknown error'}`);
        setConfirmDelete(false);
      }
    } catch (error) {
      console.error('Error erasing memory:', error);
      alert('Failed to connect to the server to delete this memory.');
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to split items into masonry columns
  const getColumns = (colCount: number) => {
    const columns: GalleryItem[][] = Array.from({ length: colCount }, () => []);
    items.forEach((item, index) => {
      columns[index % colCount].push(item);
    });
    return columns;
  };

  const selectedItem = selectedIdx !== null ? items[selectedIdx] : null;

  return (
    <div className="w-full">
      {/* Gallery Grid */}
      {items.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center px-4"
        >
          <div className="w-16 h-16 rounded-full border border-[#C5A880]/10 flex items-center justify-center mb-6">
            <ImageIcon size={24} className="text-[#C5A880]/40" />
          </div>
          <h3 className="font-serif text-lg tracking-widest text-[#E8E2D5] uppercase">No Memories Archived</h3>
          <p className="font-sans text-xs tracking-wider text-[#E8E2D5]/40 mt-2 max-w-sm">
            The archive is empty. Click the button above to preserve your first quiet moment.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Desktop/Tablet Masonry (3 Columns) */}
          <div className="hidden md:grid grid-cols-3 gap-8">
            {getColumns(3).map((col, colIdx) => (
              <div key={`col-3-${colIdx}`} className="flex flex-col gap-8">
                {col.map((item) => {
                  const globalIdx = items.findIndex((i) => i.id === item.id);
                  return (
                    <GalleryCard
                      key={item.id}
                      item={item}
                      onClick={() => setSelectedIdx(globalIdx)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Tablet/Mobile Masonry (2 Columns) */}
          <div className="hidden sm:grid md:hidden grid-cols-2 gap-6">
            {getColumns(2).map((col, colIdx) => (
              <div key={`col-2-${colIdx}`} className="flex flex-col gap-6">
                {col.map((item) => {
                  const globalIdx = items.findIndex((i) => i.id === item.id);
                  return (
                    <GalleryCard
                      key={item.id}
                      item={item}
                      onClick={() => setSelectedIdx(globalIdx)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Mobile Single Column */}
          <div className="grid sm:hidden grid-cols-1 gap-6">
            {items.map((item, idx) => (
              <GalleryCard
                key={item.id}
                item={item}
                onClick={() => setSelectedIdx(idx)}
              />
            ))}
          </div>
        </>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIdx(null)}
              className="absolute inset-0 bg-[#12100E]/95 backdrop-blur-xl"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel w-full max-w-5xl h-[80vh] md:h-[75vh] rounded-2xl border border-[#C5A880]/15 overflow-hidden flex flex-col md:flex-row relative z-10 shadow-2xl"
            >
              {/* Media Section */}
              <div className="relative flex-1 bg-black/60 flex items-center justify-center overflow-hidden h-[50%] md:h-full group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedItem.id}
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full flex items-center justify-center p-4"
                  >
                    {selectedItem.mediaType === 'video' ? (
                      <video
                        src={selectedItem.mediaUrl}
                        controls
                        autoPlay
                        className="max-w-full max-h-full object-contain shadow-2xl rounded border border-[#C5A880]/10"
                      />
                    ) : (
                      <img
                        src={selectedItem.mediaUrl}
                        alt={selectedItem.title}
                        className="max-w-full max-h-full object-contain shadow-2xl rounded border border-[#C5A880]/10"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Left/Right Buttons */}
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#12100E]/60 border border-[#C5A880]/20 hover:border-[#C5A880] text-[#E8E2D5] cursor-pointer hover:bg-[#1A1613] transition-all"
                  aria-label="Previous Memory"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#12100E]/60 border border-[#C5A880]/20 hover:border-[#C5A880] text-[#E8E2D5] cursor-pointer hover:bg-[#1A1613] transition-all"
                  aria-label="Next Memory"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Sidebar Info Section */}
              <div className="w-full md:w-[350px] bg-[#1A1613] border-t md:border-t-0 md:border-l border-[#C5A880]/10 p-6 md:p-8 flex flex-col justify-between h-[50%] md:h-full overflow-y-auto">
                <div className="space-y-6">
                  {/* Close button inside sidebar for desktop, top right floating for mobile */}
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-[9px] tracking-[0.3em] text-[#C5A880] uppercase flex items-center space-x-1">
                      {selectedItem.mediaType === 'video' ? (
                        <>
                          <Film size={10} />
                          <span>Moving Archive</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={10} />
                          <span>Still Plate</span>
                        </>
                      )}
                    </span>
                    <button
                      onClick={() => setSelectedIdx(null)}
                      className="p-1 rounded-full border border-[#C5A880]/10 hover:border-[#C5A880] hover:rotate-90 text-[#E8E2D5] cursor-pointer transition-all duration-300"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-serif text-xl sm:text-2xl text-[#F5F2EB] tracking-wide uppercase leading-tight">
                      {selectedItem.title}
                    </h2>
                    <div className="flex items-center space-x-2 text-[10px] text-[#C5A880]/70 font-cursive italic">
                      <Calendar size={10} />
                      <span>{selectedItem.date}</span>
                    </div>
                  </div>

                  <div className="w-12 h-[1px] bg-[#C5A880]/30" />

                  <p className="font-sans text-[11px] leading-relaxed text-[#E8E2D5]/80 font-light tracking-wide whitespace-pre-line">
                    {selectedItem.description || "A silent capture, left to the beauty of the viewer's own thoughts."}
                  </p>
                </div>

                {/* Poetic Erase Button */}
                <div className="pt-4 border-t border-[#C5A880]/5 mt-4">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={`w-full py-2.5 px-4 rounded-lg border text-[10px] uppercase tracking-[0.15em] font-sans flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer ${
                      isDeleting
                        ? 'bg-[#1A1613] border-[#C5A880]/5 text-[#C5A880]/30 cursor-not-allowed'
                        : confirmDelete
                        ? 'bg-[#8F3A3A]/10 border-[#8F3A3A]/40 text-[#E89E9E] hover:bg-[#8F3A3A]/20 hover:border-[#8F3A3A] shadow-[0_0_15px_rgba(143,58,58,0.1)]'
                        : 'bg-transparent border-[#C5A880]/10 text-[#C5A880]/60 hover:border-[#C5A880]/30 hover:text-[#C5A880] hover:bg-[#C5A880]/5'
                    }`}
                  >
                    <Trash2 size={11} className={confirmDelete ? 'text-[#E89E9E]' : 'text-[#C5A880]/60'} />
                    <span>
                      {isDeleting
                        ? 'Erasing Memory...'
                        : confirmDelete
                        ? 'Erase Forever?'
                        : 'Forget Memory'}
                    </span>
                  </button>
                  {confirmDelete && !isDeleting && (
                    <p className="text-[8px] text-[#E89E9E]/65 text-center mt-2 font-sans tracking-wide uppercase">
                      This will permanently delete the file from the Cloud.
                    </p>
                  )}
                </div>

                <div className="pt-6 text-[8px] tracking-[0.2em] font-sans text-[#E8E2D5]/30 uppercase text-center border-t border-[#C5A880]/5 mt-4">
                  Souvenirs Memory Index
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Individual Grid Card Component with Scroll-trigger Anim */
function GalleryCard({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="glass-panel rounded-xl overflow-hidden border border-[#C5A880]/10 cursor-pointer group shadow-lg flex flex-col justify-between"
    >
      <div className="relative aspect-auto overflow-hidden bg-[#12100E] border-b border-[#C5A880]/5">
        {/* Film grain layer on each image for photographic filter */}
        <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none group-hover:bg-transparent transition-colors duration-500" />
        
        {/* Media */}
        {item.mediaType === 'video' ? (
          <div className="relative w-full overflow-hidden">
            {/* Displaying simple video thumbnail placeholder or loading video paused */}
            <video
              src={item.mediaUrl}
              className="w-full object-cover grayscale-[30%] sepia-[10%] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
              muted
              playsInline
              preload="metadata"
              style={{ maxHeight: '420px' }}
            />
            {/* Center Play Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/5 transition-colors duration-500 z-10">
              <div className="w-12 h-12 rounded-full border border-[#E8E2D5]/55 flex items-center justify-center bg-[#12100E]/75 backdrop-blur-sm text-[#E8E2D5] group-hover:scale-110 transition-all duration-500">
                <Play size={16} fill="#E8E2D5" className="ml-1" />
              </div>
            </div>
          </div>
        ) : (
          <img
            src={item.mediaUrl}
            alt={item.title}
            loading="lazy"
            className="w-full object-cover grayscale-[25%] sepia-[12%] contrast-[102%] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
            style={{ maxHeight: '450px' }}
          />
        )}

        {/* Hover action overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,16,14,0.9)_0%,rgba(18,16,14,0)_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex items-end p-4">
          <div className="flex items-center space-x-2 text-[10px] text-[#C5A880] tracking-widest uppercase font-medium">
            <Eye size={12} />
            <span>Reflect Details</span>
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="p-5 space-y-2 bg-[#1A1613]/80">
        <div className="flex justify-between items-center">
          <span className="font-cursive text-[10px] text-[#C5A880] italic">
            {item.date}
          </span>
          <span className="text-[8px] tracking-[0.2em] font-sans text-[#E8E2D5]/40 uppercase flex items-center space-x-1">
            {item.mediaType === 'video' ? <Film size={8} /> : <ImageIcon size={8} />}
            <span>{item.mediaType === 'video' ? 'Film' : 'Plate'}</span>
          </span>
        </div>
        <h3 className="font-serif text-[#F5F2EB] text-sm tracking-wider uppercase truncate">
          {item.title}
        </h3>
        {item.description && (
          <p className="font-sans text-[10px] text-[#E8E2D5]/60 font-light tracking-wide line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
