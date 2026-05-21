'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface CardData {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  isVideo?: boolean;
}

interface MemoryCardStackProps {
  cards: CardData[];
  onCardClick?: (id: string) => void;
}

export default function MemoryCardStack({ cards, onCardClick }: MemoryCardStackProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pre-configured offsets and rotations for poker-style fan effect
  const cardLayouts = [
    { rotate: -10, x: isMobile ? -30 : -70, y: isMobile ? 8 : 15, zIndex: 40 },
    { rotate: -3, x: isMobile ? -10 : -20, y: isMobile ? -3 : -5, zIndex: 30 },
    { rotate: 5, x: isMobile ? 10 : 30, y: isMobile ? -5 : -10, zIndex: 20 },
    { rotate: 12, x: isMobile ? 30 : 75, y: isMobile ? 6 : 12, zIndex: 10 },
  ];

  return (
    <div className="relative w-full h-[300px] md:h-[480px] flex items-center justify-center select-none py-6 md:py-12">
      <div className="relative w-[190px] h-[250px] md:w-[280px] md:h-[380px]">
        {cards.slice(0, 4).map((card, index) => {
          const layout = cardLayouts[index] || { rotate: 0, x: 0, y: 0, zIndex: 1 };
          
          return (
            <motion.div
              key={card.id}
              style={{ zIndex: layout.zIndex }}
              initial={{ opacity: 0, scale: 0.8, rotate: 0, x: 0, y: 100 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotate: layout.rotate,
                x: layout.x,
                y: layout.y,
              }}
              transition={{
                delay: 0.8 + index * 0.15,
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{
                scale: 1.08,
                rotate: 0,
                x: layout.x * 0.5, // pull slightly inward to draw focus
                y: -40,
                zIndex: 100, // bring to front on hover
                transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
              }}
              onClick={() => onCardClick?.(card.id)}
              className="absolute inset-0 cursor-pointer"
            >
              {/* Card Container - Polaroid/Luxury Journal Frame */}
              <div className="w-full h-full p-3 pb-6 bg-[#E8E2D5] rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.45)] border border-[#C5A880]/30 flex flex-col justify-between transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(197,168,128,0.2)]">
                {/* Image/Video Wrapper */}
                <div className="relative w-full h-[82%] overflow-hidden rounded bg-[#12100E] border border-[#C5A880]/15">
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover grayscale-[30%] contrast-[105%] sepia-[15%] transition-all duration-700 hover:grayscale-0 hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Subtle golden corner highlights */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C5A880]/40" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#C5A880]/40" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#C5A880]/40" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#C5A880]/40" />

                  {/* Pause/Video indicator */}
                  {card.isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors duration-300">
                      <div className="w-12 h-12 rounded-full border border-[#E8E2D5]/70 flex items-center justify-center bg-[#12100E]/70 backdrop-blur-sm text-[#E8E2D5] shadow-lg">
                        <Play size={16} fill="#E8E2D5" className="ml-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Title and Metadata */}
                <div className="mt-2 flex flex-col px-1">
                  <h3 className="font-serif text-[#12100E] text-[11px] font-semibold tracking-wider truncate uppercase">
                    {card.title}
                  </h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-cursive text-[10px] text-[#8E7544] font-medium italic">
                      {card.date}
                    </span>
                    <span className="font-sans text-[8px] tracking-widest text-[#3C2F2F]/60 uppercase">
                      {card.isVideo ? 'Film' : 'Plate'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
