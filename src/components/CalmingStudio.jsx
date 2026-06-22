import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Compass, Heart, Activity } from 'lucide-react';

export default function CalmingStudio({ settings, onClose }) {
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [soundType, setSoundType] = useState('space_drone'); // 'space_drone', 'brown_noise', 'sine_wave'
  const [soundVolume, setSoundVolume] = useState(0.2);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // 'Inhale', 'Hold', 'Exhale', 'Pause'
  const [breathSeconds, setBreathSeconds] = useState(4);

  const audioCtxRef = useRef(null);
  const synthNodesRef = useRef([]);

  // Breathing Box Timer (4s Inhale, 4s Hold, 4s Exhale, 4s Hold)
  useEffect(() => {
    let timer = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev <= 1) {
          // Switch phase
          setBreathPhase((currentPhase) => {
            switch (currentPhase) {
              case 'Inhale': return 'Hold';
              case 'Hold': return 'Exhale';
              case 'Exhale': return 'Pause';
              case 'Pause': return 'Inhale';
              default: return 'Inhale';
            }
          });
          return 4; // Reset to 4 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Web Audio Synth setup
  const startAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopAudio(); // Clear previous nodes

      const mainVolume = ctx.createGain();
      mainVolume.gain.setValueAtTime(soundVolume, ctx.currentTime);
      mainVolume.connect(ctx.destination);
      synthNodesRef.current.push(mainVolume);

      if (soundType === 'space_drone') {
        // Create 3 soft detuned oscillators playing a warm chord
        const freqs = [110, 165, 220, 275]; // A2, E3, A3, C#4
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          // Detune oscillator slightly for warm chorus effect
          osc.detune.setValueAtTime((Math.random() - 0.5) * 15, ctx.currentTime);

          // Soft LFO to modulate volume of each oscillator
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          
          // Modulate volume
          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.1, ctx.currentTime);
          const lfoGain = ctx.createGain();
          lfoGain.gain.setValueAtTime(0.03, ctx.currentTime);

          lfo.connect(lfoGain);
          lfoGain.connect(gain.gain);
          osc.connect(gain);
          gain.connect(mainVolume);

          lfo.start();
          osc.start();

          synthNodesRef.current.push(osc, gain, lfo, lfoGain);
        });
      } else if (soundType === 'brown_noise') {
        // Brown noise generator (highly calming for focus)
        const bufferSize = 10 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Brown filter accumulator
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // boost volume slightly
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Apply a lowpass filter to make it sound like gentle ocean waves
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);

        // Modulate filter frequency slowly (like waves)
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(150, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        whiteNoise.connect(filter);
        filter.connect(mainVolume);

        lfo.start();
        whiteNoise.start();

        synthNodesRef.current.push(whiteNoise, filter, lfo, lfoGain);
      } else if (soundType === 'sine_wave') {
        // Pure calming frequency (solfeggio tone 528Hz - Transformation and Miracles)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, ctx.currentTime);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        
        osc.connect(gain);
        gain.connect(mainVolume);
        osc.start();
        
        synthNodesRef.current.push(osc, gain);
      }

      setIsPlayingSound(true);
    } catch (e) {
      console.error("Failed to play synthesized soundscape:", e);
    }
  };

  const stopAudio = () => {
    synthNodesRef.current.forEach((node) => {
      try {
        node.stop();
      } catch (e) {}
      try {
        node.disconnect();
      } catch (e) {}
    });
    synthNodesRef.current = [];
    setIsPlayingSound(false);
  };

  const handleVolumeChange = (newVal) => {
    setSoundVolume(newVal);
    // Dynamically adjust gain if running
    if (synthNodesRef.current.length > 0) {
      const mainVolumeNode = synthNodesRef.current[0];
      if (mainVolumeNode && mainVolumeNode.gain) {
        mainVolumeNode.gain.setValueAtTime(newVal, audioCtxRef.current.currentTime);
      }
    }
  };

  // Keep synth playing / updating if type changes
  useEffect(() => {
    if (isPlayingSound) {
      startAudio();
    }
  }, [soundType]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="bg-white dark:bg-darkCard border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-md max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Soundscape Control */}
      <div className="flex flex-col justify-between space-y-6">
        <div>
          <h2 className={`text-xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2 ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
            <Compass className="h-5 w-5 text-teal-500 animate-spin-slow" />
            Calming Soundscape Studio
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Synthesized audio drones to calm your mind and help you focus.
          </p>
        </div>

        {/* Sound Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Choose Background Tone
          </label>
          <div className="space-y-2">
            {[
              { id: 'space_drone', name: 'Cosmic Space Drone', desc: 'Detuned synthesizer pad' },
              { id: 'brown_noise', name: 'Calming Sea Breeze', desc: 'Brown noise with wave modulation' },
              { id: 'sine_wave', name: 'Solfeggio Frequency (528 Hz)', desc: 'Pure meditative sound wave' },
            ].map((sound) => (
              <button
                key={sound.id}
                onClick={() => setSoundType(sound.id)}
                className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                  soundType === sound.id 
                    ? 'border-teal-500 bg-teal-50/20 dark:bg-teal-900/10 text-teal-700 dark:text-teal-400' 
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div>
                  <span className="block text-sm font-bold">{sound.name}</span>
                  <span className="block text-2xs text-zinc-500 dark:text-zinc-400 mt-0.5">{sound.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={isPlayingSound ? stopAudio : startAudio}
                className={`p-3 rounded-full text-white shadow-md flex items-center justify-center transition-all ${
                  isPlayingSound ? 'bg-rose-500 hover:bg-rose-600' : 'bg-teal-500 hover:bg-teal-600'
                }`}
              >
                {isPlayingSound ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <div>
                <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {isPlayingSound ? 'Streaming Tone' : 'Audio Suspended'}
                </span>
                <span className="block text-xs text-zinc-400">
                  {soundType === 'space_drone' ? 'Detuned Pad' : soundType === 'brown_noise' ? 'Ocean Waves' : '528Hz Sine'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {soundVolume === 0 ? <VolumeX className="h-4 w-4 text-zinc-400" /> : <Volume2 className="h-4 w-4 text-zinc-400" />}
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={soundVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Breathing Guide */}
      <div className="border-l border-zinc-200 dark:border-zinc-800 md:pl-8 flex flex-col justify-between items-center text-center space-y-6">
        <div>
          <h2 className={`text-xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2 justify-center ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
            <Heart className="h-5 w-5 text-teal-500 fill-teal-500/20" />
            Breathing Pacer
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Follow the expanding bubble to practice relaxing box breathing.
          </p>
        </div>

        {/* Expanding Bubble Container */}
        <div className="relative h-56 w-56 flex items-center justify-center">
          <div 
            className="absolute rounded-full border border-teal-300 dark:border-teal-900 transition-all duration-1000 ease-in-out flex flex-col items-center justify-center"
            style={{
              height: breathPhase === 'Inhale' ? '220px' : breathPhase === 'Exhale' ? '140px' : breathPhase === 'Hold' ? '220px' : '140px',
              width: breathPhase === 'Inhale' ? '220px' : breathPhase === 'Exhale' ? '140px' : breathPhase === 'Hold' ? '220px' : '140px',
              backgroundColor: 
                breathPhase === 'Inhale' ? 'rgba(20, 184, 166, 0.2)' : 
                breathPhase === 'Hold' ? 'rgba(59, 130, 246, 0.25)' : 
                breathPhase === 'Exhale' ? 'rgba(239, 68, 68, 0.15)' : 
                'rgba(113, 113, 122, 0.15)',
              boxShadow: 
                breathPhase === 'Inhale' ? '0 0 25px rgba(20, 184, 166, 0.4)' : 
                breathPhase === 'Hold' ? '0 0 25px rgba(59, 130, 246, 0.5)' : 
                breathPhase === 'Exhale' ? '0 0 15px rgba(239, 68, 68, 0.3)' : 
                '0 0 5px rgba(113, 113, 122, 0.2)',
            }}
          >
            <span className="text-lg font-extrabold text-teal-800 dark:text-teal-400 transition-colors uppercase tracking-widest">
              {breathPhase === 'Pause' ? 'REST' : breathPhase}
            </span>
            <span className="text-3xl font-black text-zinc-800 dark:text-zinc-200 mt-1">
              {breathSeconds}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {breathPhase === 'Inhale' && 'Slowly fill your lungs with air...'}
            {breathPhase === 'Hold' && 'Keep the air inside and hold still...'}
            {breathPhase === 'Exhale' && 'Slowly release the breath, letting go of tension...'}
            {breathPhase === 'Pause' && 'Rest quietly before the next breath...'}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="block mx-auto text-xs text-teal-600 hover:text-teal-800 font-semibold pt-4"
            >
              Back to Study Desk
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
