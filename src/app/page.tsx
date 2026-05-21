'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Calendar, SlidersHorizontal, Sparkles, Database, Cloud } from 'lucide-react';

import IntroAnimation from '@/components/IntroAnimation';
import AudioToggle from '@/components/AudioToggle';
import MemoryCardStack from '@/components/MemoryCard';
import MasonryGallery, { GalleryItem } from '@/components/MasonryGallery';
import UploadModal from '@/components/UploadModal';

// Default cards in case the database is loading/empty
const DEFAULT_STACK_CARDS = [
  {
    id: 'stack-1',
    title: 'Vintage Keys',
    date: '1974-06-12',
    imageUrl: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=600&auto=format&fit=crop',
    isVideo: false,
  },
  {
    id: 'stack-2',
    title: 'Morning Sonata',
    date: '2012-10-09',
    imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=600&auto=format&fit=crop',
    isVideo: false,
  },
  {
    id: 'stack-3',
    title: 'Quiet Drift',
    date: '2023-08-04',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop',
    isVideo: false,
  },
  {
    id: 'stack-4',
    title: 'Focus Shift',
    date: '1998-04-20',
    imageUrl: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d84a?q=80&w=600&auto=format&fit=crop',
    isVideo: true,
  },
];

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [memories, setMemories] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [storageStatus, setStorageStatus] = useState<{ db: string; storage: string } | null>(null);

  // Fetch memories on mount
  useEffect(() => {
    async function loadMemories() {
      try {
        const response = await fetch('/api/memories');
        if (response.ok) {
          const data = await response.json();
          setMemories(data.memories || []);
          setStorageStatus(data.status || null);
        }
      } catch (error) {
        console.error('Failed to load memories:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMemories();
  }, []);

  const handleUploadSuccess = (newMemory: GalleryItem) => {
    setMemories((prev) => [newMemory, ...prev]);
  };

  const handleDeleteSuccess = (deletedId: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== deletedId));
  };

  // Filter memories based on search query and media type
  const filteredMemories = memories.filter((memory) => {
    const matchesSearch =
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (memory.description && memory.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType =
      mediaTypeFilter === 'all' || memory.mediaType === mediaTypeFilter;

    return matchesSearch && matchesType;
  });

  // Prepare cards for the stack display (merge uploaded memories with defaults to always have exactly 4 cards)
  const uploadedStackCards = memories.slice(0, 4).map(m => ({
    id: m.id,
    title: m.title,
    date: m.date,
    imageUrl: m.mediaUrl,
    isVideo: m.mediaType === 'video'
  }));

  const stackCards = [
    ...uploadedStackCards,
    ...DEFAULT_STACK_CARDS.slice(0, 4 - uploadedStackCards.length)
  ];

  return (
    <>
      {/* 1. Fullscreen Cinematic Intro */}
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {/* Main Page Layout */}
      {!showIntro && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="flex-1 flex flex-col relative"
        >
          {/* Subtle Ambient Grain Overlay */}
          <div className="film-grain" />

          {/* Navigation/Header Bar */}
          <header className="sticky top-0 z-40 bg-[#12100E]/80 backdrop-blur-md border-b border-[#C5A880]/10 px-6 py-4 md:px-12 flex justify-between items-center transition-all">
            <div className="flex flex-col">
              <span className="font-serif text-lg tracking-[0.3em] text-[#F5F2EB] uppercase font-light">
                PAN MEMORIES
              </span>
              <span className="text-[7px] tracking-[0.4em] text-[#C5A880] uppercase font-sans font-light mt-0.5">
                The Personal Archive
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Storage Mode Status Tooltip */}
              {storageStatus && (
                <div 
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full border border-[#C5A880]/10 bg-[#1A1613] text-[9px] uppercase tracking-wider text-[#C5A880]/70"
                  title={`Database: ${storageStatus.db === 'cloud' ? 'Cloud (MongoDB)' : 'Local File'}. Storage: ${storageStatus.storage === 'cloud' ? 'Cloud (Cloudinary)' : 'Local Disk'}`}
                >
                  <Database size={10} />
                  <span>{storageStatus.storage === 'cloud' ? 'Cloud Archive' : 'Local Archive'}</span>
                </div>
              )}
              
              {/* Ambient Music Controller */}
              <AudioToggle />
            </div>
          </header>

          {/* Main Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-20 space-y-16 md:space-y-24">
            
            {/* Hero Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Hero Left: Title & Descriptions */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 text-[9px] tracking-[0.3em] text-[#C5A880] uppercase">
                    <Sparkles size={10} />
                    <span>Welcome to the quiet room</span>
                  </div>
                  <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#F5F2EB] font-light tracking-wide leading-tight uppercase">
                    Preserve the <br />
                    <span className="font-cursive text-3xl sm:text-4xl md:text-5xl text-[#C5A880] lowercase italic font-normal tracking-normal normal-case block mt-2">
                      fleeting moments
                    </span>
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.65 }}
                  transition={{ delay: 0.6, duration: 1.2 }}
                  className="font-sans text-xs sm:text-sm text-[#E8E2D5] font-light tracking-wide leading-relaxed max-w-xl"
                >
                  Time drifts like autumn leaves. We capture these plates and films not to halt the changing seasons, but to remember the golden lighting exactly as it fell. A personal, cinematic sanctuary for your memories.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="pt-4"
                >
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="glass-panel border border-[#C5A880]/30 hover:border-[#C5A880] hover:bg-[#C5A880] hover:text-[#12100E] text-[#E8E2D5] text-[11px] uppercase tracking-[0.2em] font-medium py-3.5 px-8 rounded-full shadow-lg shadow-black/30 cursor-pointer flex items-center space-x-2.5 transition-all duration-500 hover:scale-[1.02]"
                  >
                    <Plus size={14} />
                    <span>Preserve a Memory</span>
                  </button>
                </motion.div>
              </div>

              {/* Hero Right: Layered Cards */}
              <div className="lg:col-span-5 w-full flex items-center justify-center">
                <MemoryCardStack cards={stackCards} />
              </div>
            </section>

            {/* Separator Line */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C5A880]/15 to-transparent w-full" />

            {/* Gallery Section */}
            <section className="space-y-10">
              
              {/* Section Header with Search & Filter */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 pb-4 border-b border-[#C5A880]/10">
                <div className="space-y-2">
                  <h2 className="font-serif text-2xl text-[#F5F2EB] tracking-widest uppercase font-light">
                    The Archive
                  </h2>
                  <p className="font-sans text-[10px] text-[#E8E2D5]/50 tracking-wider">
                    Browse and reflect upon your quiet captures
                  </p>
                </div>

                {/* Filter and Search Container */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C5A880]/40" size={14} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search files..."
                      className="w-full bg-[#1A1613]/55 border border-[#C5A880]/15 hover:border-[#C5A880]/30 focus:border-[#C5A880] rounded-full text-xs py-2 pl-9 pr-4 focus:outline-none transition-colors duration-300 text-[#F5F2EB] placeholder-[#E8E2D5]/30"
                    />
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex rounded-full border border-[#C5A880]/15 p-1 bg-[#1A1613]/50">
                    <button
                      onClick={() => setMediaTypeFilter('all')}
                      className={`text-[9px] uppercase tracking-wider py-1.5 px-4 rounded-full transition-all duration-300 cursor-pointer ${
                        mediaTypeFilter === 'all'
                          ? 'bg-[#C5A880] text-[#12100E]'
                          : 'text-[#E8E2D5]/50 hover:text-[#E8E2D5]'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setMediaTypeFilter('image')}
                      className={`text-[9px] uppercase tracking-wider py-1.5 px-4 rounded-full transition-all duration-300 cursor-pointer ${
                        mediaTypeFilter === 'image'
                          ? 'bg-[#C5A880] text-[#12100E]'
                          : 'text-[#E8E2D5]/50 hover:text-[#E8E2D5]'
                      }`}
                    >
                      Plates
                    </button>
                    <button
                      onClick={() => setMediaTypeFilter('video')}
                      className={`text-[9px] uppercase tracking-wider py-1.5 px-4 rounded-full transition-all duration-300 cursor-pointer ${
                        mediaTypeFilter === 'video'
                          ? 'bg-[#C5A880] text-[#12100E]'
                          : 'text-[#E8E2D5]/50 hover:text-[#E8E2D5]'
                      }`}
                    >
                      Films
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Masonry Gallery */}
              {isLoading ? (
                /* loading grid skeletons */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="glass-panel rounded-xl h-[350px] animate-pulse p-4 flex flex-col justify-between">
                      <div className="w-full h-3/4 bg-[#2A2420]/30 rounded-lg" />
                      <div className="space-y-2 mt-4">
                        <div className="w-1/3 h-2 bg-[#2A2420]/30 rounded" />
                        <div className="w-2/3 h-4 bg-[#2A2420]/30 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <MasonryGallery items={filteredMemories} onDeleteSuccess={handleDeleteSuccess} />
              )}
            </section>
          </main>

          {/* Footer Section */}
          <footer className="border-t border-[#C5A880]/10 bg-[#12100E] px-6 py-12 md:px-12 mt-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col items-center md:items-start space-y-1">
                <span className="font-serif text-sm tracking-[0.2em] text-[#F5F2EB] uppercase">
                  PAN MEMORIES
                </span>
                <span className="font-cursive text-xs text-[#C5A880]/70 italic">
                  Cherish the passing light.
                </span>
              </div>
              
              <div className="text-center md:text-right font-sans text-[9px] tracking-widest text-[#E8E2D5]/35 uppercase">
                &copy; {new Date().getFullYear()} PAN MEMORIES Archive. All rights preserved.
              </div>
            </div>
          </footer>

          {/* Upload Modal Drawer */}
          <UploadModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onSuccess={handleUploadSuccess}
          />
        </motion.div>
      )}
    </>
  );
}
