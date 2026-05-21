'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<AudioNode[]>([]);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientMusic();
    };
  }, []);

  const startAmbientMusic = () => {
    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Master Gain Node for volume control
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      // Fade in master volume
      masterGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 3);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Lowpass Filter for warm, late-night sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);
      filter.Q.setValueAtTime(1, ctx.currentTime);
      filter.connect(masterGain);

      // Delay effect for ambient space
      const delay = ctx.createDelay(2.0);
      delay.delayTime.setValueAtTime(0.6, ctx.currentTime);
      const delayGain = ctx.createGain();
      delayGain.gain.setValueAtTime(0.25, ctx.currentTime);

      // Feedback loop for delay
      delay.connect(delayGain);
      delayGain.connect(delay); // Feedback
      delayGain.connect(filter); // Output of delay to filter

      // Chords definitions (frequencies of notes)
      // Chords: Fmaj7 (F2, A2, C3, E3, A3) -> Cmaj7 (C2, G2, C3, E3, B3) -> Am9 (A2, E2, C3, G3, B3) -> Dm7 (D2, A2, F3, C4, F4)
      const chords = [
        [87.31, 110.00, 130.81, 164.81, 220.00], // Fmaj7
        [65.41, 98.00, 130.81, 164.81, 246.94],  // Cmaj7
        [55.00, 82.41, 130.81, 196.00, 246.94],  // Am9
        [73.42, 110.00, 174.61, 261.63, 349.23], // Dm7
      ];

      let chordIndex = 0;

      const playNextChord = () => {
        if (!ctx || ctx.state === 'closed') return;

        const currentNotes = chords[chordIndex];
        const now = ctx.currentTime;
        const chordDuration = 8; // 8 seconds per chord
        const fadeTime = 2.5;    // Smooth fade-in/out overlap

        const chordNodes: AudioNode[] = [];

        currentNotes.forEach((freq, idx) => {
          // Oscillator
          const osc = ctx.createOscillator();
          // Use triangle wave for a warm, soft flute-like synth tone
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          // Subtle pitch modulation (vibrato) for organic feeling
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.value = 0.2 + Math.random() * 0.1; // slow modulation
          lfoGain.gain.value = 0.5 + Math.random() * 0.5; // subtle frequency change
          
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start(now);

          // Individual Note Gain (Envelope)
          const noteGain = ctx.createGain();
          noteGain.gain.setValueAtTime(0, now);
          
          // Randomize note onset slightly for a more human/arpeggiated feel
          const noteDelay = idx * 0.15 * Math.random();
          noteGain.gain.linearRampToValueAtTime(0, now + noteDelay);
          noteGain.gain.linearRampToValueAtTime(0.12, now + noteDelay + fadeTime);
          
          // Hold
          noteGain.gain.setValueAtTime(0.12, now + chordDuration - fadeTime);
          
          // Fade out
          noteGain.gain.linearRampToValueAtTime(0, now + chordDuration);

          // Connections
          osc.connect(noteGain);
          
          // Connect some directly to filter, some to delay
          if (idx % 2 === 0) {
            noteGain.connect(filter);
          } else {
            noteGain.connect(delay);
          }

          // Start & Stop
          osc.start(now);
          osc.stop(now + chordDuration);

          chordNodes.push(osc, lfo, noteGain, lfoGain);
        });

        // Store active nodes so we can cancel them if needed
        activeNodesRef.current = [...activeNodesRef.current, ...chordNodes];

        // Clean up completed nodes from memory after they finish
        setTimeout(() => {
          activeNodesRef.current = activeNodesRef.current.filter(n => !chordNodes.includes(n));
        }, chordDuration * 1000);

        // Schedule next chord with overlap
        chordIndex = (chordIndex + 1) % chords.length;
        timeoutIdRef.current = setTimeout(playNextChord, (chordDuration - fadeTime) * 1000);
      };

      playNextChord();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to initialize ambient audio:', error);
    }
  };

  const stopAmbientMusic = () => {
    // Fade out first
    if (gainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      gainNodeRef.current.gain.cancelScheduledValues(ctx.currentTime);
      gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    }

    // Fully terminate context after fade out
    setTimeout(() => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }

      // Stop all active synthesizers
      activeNodesRef.current.forEach((node: any) => {
        try {
          node.stop();
        } catch (e) {}
      });
      activeNodesRef.current = [];

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsPlaying(false);
    }, 1500);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopAmbientMusic();
    } else {
      startAmbientMusic();
    }
  };

  return (
    <button
      onClick={togglePlayback}
      className="glass-panel relative flex items-center justify-center p-3 rounded-full hover:bg-[rgba(197,168,128,0.15)] transition-all duration-500 cursor-pointer z-50 text-[#C5A880] group hover:border-[#C5A880]"
      aria-label="Toggle ambient music"
      title="Toggle late-night ambient music"
    >
      <div className="absolute inset-0 rounded-full bg-[#C5A880] opacity-0 group-hover:opacity-5 blur-md transition-opacity duration-500"></div>
      
      {isPlaying ? (
        <>
          <Volume2 size={18} className="animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-700 ease-in-out text-[10px] uppercase tracking-widest font-sans ml-0 group-hover:ml-2 opacity-0 group-hover:opacity-100 select-none whitespace-nowrap">
            Ambient On
          </span>
        </>
      ) : (
        <>
          <VolumeX size={18} className="opacity-70 group-hover:opacity-100" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-700 ease-in-out text-[10px] uppercase tracking-widest font-sans ml-0 group-hover:ml-2 opacity-0 group-hover:opacity-100 select-none whitespace-nowrap">
            Play Atmosphere
          </span>
        </>
      )}
    </button>
  );
}
