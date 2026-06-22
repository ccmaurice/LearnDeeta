import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Volume2, CheckSquare, Square, Film, ArrowUpRight } from 'lucide-react';
import { speakText } from '../utils/tts-stt';

const CATEGORY_COLORS = {
  nature: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400',
  space: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-400',
  chemistry: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-400',
  technology: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-400',
  math: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-400',
  human: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50 text-purple-800 dark:text-purple-400',
  history: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50 text-orange-800 dark:text-orange-400',
  idea: 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/50 text-teal-800 dark:text-teal-400',
};

const SVG_ILLUSTRATIONS = {
  nature: (
    <svg className="h-24 w-24 mx-auto opacity-80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M50 15 C35 35, 35 65, 50 85 C65 65, 65 35, 50 15 Z" fill="rgba(16, 185, 129, 0.1)" stroke="rgb(16, 185, 129)" />
      <path d="M50 15 L50 85" stroke="rgb(16, 185, 129)" />
      <path d="M50 35 C58 35, 62 42, 60 48" stroke="rgb(16, 185, 129)" />
      <path d="M50 55 C42 55, 38 62, 40 68" stroke="rgb(16, 185, 129)" />
    </svg>
  ),
  space: (
    <svg className="h-24 w-24 mx-auto opacity-80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="50" cy="50" r="22" fill="rgba(99, 102, 241, 0.1)" stroke="rgb(99, 102, 241)" />
      <ellipse cx="50" cy="50" rx="35" ry="8" stroke="rgb(99, 102, 241)" transform="rotate(-15, 50, 50)" />
      <circle cx="25" cy="25" r="3" fill="currentColor" />
      <circle cx="75" cy="72" r="2" fill="currentColor" />
    </svg>
  ),
  chemistry: (
    <svg className="h-24 w-24 mx-auto opacity-80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M40 20 L40 38 L25 70 A10 10 0 0 0 35 82 L65 82 A10 10 0 0 0 75 70 L60 38 L60 20 Z" fill="rgba(245, 158, 11, 0.1)" stroke="rgb(245, 158, 11)" />
      <path d="M38 20 L62 20" stroke="rgb(245, 158, 11)" />
      <path d="M30 65 L70 65" stroke="rgb(245, 158, 11)" />
      <circle cx="45" cy="55" r="3" fill="rgb(245, 158, 11)" />
      <circle cx="55" cy="72" r="4" fill="rgb(245, 158, 11)" />
    </svg>
  ),
  default: (
    <svg className="h-24 w-24 mx-auto opacity-80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="50" cy="50" r="25" fill="rgba(14, 165, 233, 0.1)" stroke="rgb(14, 165, 233)" />
      <path d="M50 35 L50 65 M35 50 L65 50" stroke="rgb(14, 165, 233)" />
    </svg>
  ),
};

export default function FlashcardDeck({ 
  flashcards = [], 
  checklist = [], 
  videoSearchQuery = '', 
  settings 
}) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});

  if (!flashcards || flashcards.length === 0) return null;

  const currentCard = flashcards[activeCardIndex] || flashcards[0];
  const catColor = CATEGORY_COLORS[currentCard.category] || CATEGORY_COLORS.idea;
  const svgIllustration = SVG_ILLUSTRATIONS[currentCard.category] || SVG_ILLUSTRATIONS.default;

  const handleNext = () => {
    setActiveCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setActiveCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleHearCard = () => {
    const speechText = `${currentCard.title}. ${currentCard.description}`;
    speakText(speechText, { rate: settings?.ttsRate, voice: settings?.ttsVoice });
  };

  const toggleTask = (index) => {
    setCompletedTasks(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Flashcard Slider */}
      <div className="bg-white dark:bg-darkCard border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <h3 className={`text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
          Visual Study Cards ({activeCardIndex + 1} of {flashcards.length})
        </h3>

        {/* Card Surface */}
        <div className={`border border-solid rounded-2xl p-6 min-h-[260px] flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${catColor}`}>
          
          {/* Card Top */}
          <div className="flex justify-between items-start">
            <span className="text-2xs font-extrabold px-2.5 py-1 bg-white/60 dark:bg-black/20 rounded-full uppercase tracking-wider">
              {currentCard.category || 'Concept'}
            </span>
            <button
              onClick={handleHearCard}
              className="p-2 bg-white/70 dark:bg-black/10 hover:bg-white dark:hover:bg-black/20 rounded-full transition-colors"
              title="Read flashcard out loud"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>

          {/* Card Center: Illustration & Content */}
          <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div className="sm:col-span-1">
              {svgIllustration}
            </div>
            <div className="sm:col-span-2 text-left space-y-2">
              <h4 className={`text-xl font-extrabold tracking-tight ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
                {currentCard.title}
              </h4>
              <p className={`text-sm font-medium leading-relaxed opacity-90 ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
                {currentCard.description}
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center border-t border-black/5 dark:border-white/5 pt-4">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-white/60 dark:hover:bg-black/20 rounded-full transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-white/60 dark:hover:bg-black/20 rounded-full transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>

      {/* 2. Step-by-Step Task Checklist */}
      {checklist && checklist.length > 0 && (
        <div className="bg-white dark:bg-darkCard border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <h3 className={`text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
            Focus Checkpoints
          </h3>
          <div className="space-y-3">
            {checklist.map((task, idx) => (
              <button
                key={idx}
                onClick={() => toggleTask(idx)}
                className={`w-full p-3.5 border rounded-xl flex items-center gap-3.5 text-left transition-all ${
                  completedTasks[idx]
                    ? 'border-emerald-500 bg-emerald-50/10 text-emerald-800 dark:text-emerald-400 opacity-75'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {completedTasks[idx] ? (
                  <CheckSquare className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : (
                  <Square className="h-5 w-5 text-zinc-400 dark:text-zinc-600 shrink-0" />
                )}
                <span className={`text-sm font-semibold ${completedTasks[idx] ? 'line-through' : ''} ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
                  {task}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Calming Video Reference */}
      {videoSearchQuery && (
        <div className="bg-white dark:bg-darkCard border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Calming Explanatory Video
              </span>
              <span className="block text-2xs text-zinc-500">
                Find animations matching: "{videoSearchQuery}"
              </span>
            </div>
          </div>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(videoSearchQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all"
          >
            <span>Search YouTube</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

    </div>
  );
}
