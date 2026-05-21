'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Skip button appears after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Multi-phase poetry timing
  useEffect(() => {
    if (phase === 0) {
      // First phrase
      const timer = setTimeout(() => setPhase(1), 4000);
      return () => clearTimeout(timer);
    } else if (phase === 1) {
      // Second phrase
      const timer = setTimeout(() => setPhase(2), 4000);
      return () => clearTimeout(timer);
    } else if (phase === 2) {
      // Main brand name reveal
      const timer = setTimeout(() => setPhase(3), 5000);
      return () => clearTimeout(timer);
    } else if (phase === 3) {
      // Final transition out
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  // Floating Golden Particles Canvas Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle class
    class Particle {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      speedX: number = 0;
      speedY: number = 0;
      alpha: number = 0;
      decay: number = 0;

      constructor() {
        this.reset();
        // Distribute randomly across screen initially
        this.y = Math.random() * height;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = height + 10;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = -(Math.random() * 0.4 + 0.1);
        this.alpha = Math.random() * 0.5 + 0.1;
        this.decay = Math.random() * 0.002 + 0.001;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Add subtle wave movement
        this.x += Math.sin(this.y / 30) * 0.15;

        // Fade out as they rise
        if (this.y < 0 || this.alpha <= 0) {
          this.reset();
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Gold glowing gradient for particles
        const gradient = c.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, `rgba(245, 226, 179, ${this.alpha})`);
        gradient.addColorStop(0.5, `rgba(197, 168, 128, ${this.alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(18, 16, 14, 0)');
        
        c.fillStyle = gradient;
        c.shadowBlur = 8;
        c.shadowColor = 'rgba(197, 168, 128, 0.4)';
        c.fill();
        c.restore();
      }
    }

    const particles: Particle[] = Array.from({ length: 65 }, () => new Particle());

    const animate = () => {
      ctx.fillStyle = 'rgba(18, 16, 14, 0.2)'; // trail effect
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const phrases = [
    { text: "Every moment is a canvas...", type: "poem" },
    { text: "...painted on the silent pages of time.", type: "poem" },
    { text: "PAN MEMORIES", type: "title" }
  ];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        filter: 'blur(30px)', 
        scale: 1.05,
        transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#12100E] overflow-hidden select-none"
    >
      {/* Drifting Gold Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Subtle Golden Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(197,168,128,0.06)_0%,rgba(18,16,14,0)_70%)] pointer-events-none blur-3xl" />

      {/* Poetry & Title Screen */}
      <div className="relative z-10 w-full max-w-4xl text-center px-6">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div
              key="phrase-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 1.2 } }}
              className="flex flex-col items-center justify-center"
            >
              <div className="relative inline-block py-4">
                <span className="font-cursive text-xl sm:text-5xl md:text-6xl text-[#E8E2D5] italic font-light tracking-wide leading-relaxed block overflow-hidden">
                  {/* Cursive text container with clip reveal */}
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.8, ease: "easeInOut" }}
                    className="block whitespace-nowrap overflow-hidden border-r-2 border-[#C5A880] pr-1"
                    style={{
                      textShadow: '0 0 10px rgba(197, 168, 128, 0.15)'
                    }}
                  >
                    Every moment is a canvas...
                  </motion.span>
                </span>
                {/* Glowing fountain pen tip moving along the text reveal */}
                <motion.div
                  initial={{ left: 0 }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 2.8, ease: "easeInOut" }}
                  className="absolute bottom-2 h-4 w-4 -translate-x-1/2 bg-[radial-gradient(circle,#ffffff_0%,#C5A880_40%,rgba(197,168,128,0)_100%)] rounded-full blur-[2px] pointer-events-none"
                  style={{
                    boxShadow: '0 0 15px #C5A880, 0 0 30px #C5A880'
                  }}
                />
              </div>
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div
              key="phrase-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 1.2 } }}
              className="flex flex-col items-center justify-center"
            >
              <div className="relative inline-block py-4">
                <span className="font-cursive text-xl sm:text-5xl md:text-6xl text-[#E8E2D5] italic font-light tracking-wide leading-relaxed block overflow-hidden">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="block whitespace-nowrap overflow-hidden border-r-2 border-[#C5A880] pr-1"
                    style={{
                      textShadow: '0 0 10px rgba(197, 168, 128, 0.15)'
                    }}
                  >
                    ...painted on the silent pages of time.
                  </motion.span>
                </span>
                <motion.div
                  initial={{ left: 0 }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  className="absolute bottom-2 h-4 w-4 -translate-x-1/2 bg-[radial-gradient(circle,#ffffff_0%,#C5A880_40%,rgba(197,168,128,0)_100%)] rounded-full blur-[2px] pointer-events-none"
                  style={{
                    boxShadow: '0 0 15px #C5A880, 0 0 30px #C5A880'
                  }}
                />
              </div>
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div
              key="phrase-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(15px)', transition: { duration: 1.5 } }}
              className="flex flex-col items-center justify-center"
            >
              {/* Subtle serif subtitle */}
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 0.5, y: 0 }}
                transition={{ delay: 0.5, duration: 1.5 }}
                className="font-sans text-[10px] tracking-[0.4em] uppercase text-[#C5A880] mb-6"
              >
                An Archive of Life
              </motion.span>
              
              {/* Grand Brand Title */}
              <div className="relative inline-block py-6">
                <span className="font-serif text-3xl sm:text-7xl md:text-8xl text-[#F5F2EB] font-light tracking-[0.2em] uppercase block overflow-hidden">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3.2, ease: [0.25, 1, 0.5, 1] }}
                    className="block whitespace-nowrap overflow-hidden border-r-2 border-[#C5A880] pr-4"
                    style={{
                      textShadow: '0 0 20px rgba(197, 168, 128, 0.25)'
                    }}
                  >
                    PAN MEMORIES
                  </motion.span>
                </span>
                <motion.div
                  initial={{ left: 0 }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 3.2, ease: [0.25, 1, 0.5, 1] }}
                  className="absolute bottom-4 h-6 w-6 -translate-x-1/2 bg-[radial-gradient(circle,#ffffff_0%,#C5A880_45%,rgba(197,168,128,0)_100%)] rounded-full blur-[3px] pointer-events-none"
                  style={{
                    boxShadow: '0 0 20px #C5A880, 0 0 40px #C5A880'
                  }}
                />
              </div>

              {/* Serif Quote footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 2.2, duration: 1.5 }}
                className="font-serif italic text-sm text-[#E8E2D5] tracking-wider mt-4"
              >
                “Memories are the architecture of our souls.”
              </motion.p>
            </motion.div>
          )}

          {phase === 3 && (
            <motion.div
              key="phase-3"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center"
            >
              {/* Clean elegant loader for transition */}
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent origin-center"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip Button */}
      <AnimatePresence>
        {showSkip && phase < 3 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.6, y: 0 }}
            exit={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1.02 }}
            onClick={onComplete}
            className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-20 glass-panel border border-[#C5A880]/30 hover:border-[#C5A880] text-[#E8E2D5] hover:text-[#F5F2EB] text-[9px] uppercase tracking-[0.3em] py-2 px-6 rounded-full cursor-pointer transition-all duration-300"
          >
            Skip Intro
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cinematic Film Texture Overlay (inside intro too) */}
      <div className="film-grain" />
    </motion.div>
  );
}
