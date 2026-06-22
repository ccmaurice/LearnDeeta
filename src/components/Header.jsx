import React, { useState } from 'react';
import { Settings, Sparkles, Volume2, HelpCircle, Heart, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header({ 
  hasApiKey, 
  onToggleSettings, 
  onToggleAAC, 
  onToggleCalming, 
  onToggleTherapy,
  activePanel, // 'chat', 'aac', 'calming', 'therapy'
  dyslexiaMode 
}) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-darkCard px-6 py-4 shadow-sm">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="LearnDeeta Logo" 
            className="h-11 w-11 rounded-2xl shadow-md shadow-blue-500/10 object-cover" 
          />
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 ${dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
              LearnDeeta
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Multi-Sensory AI Learning Companion
            </p>
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => onToggleAAC()}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
              activePanel === 'aac'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>AAC Board (Non-Verbal)</span>
          </button>
          
          <button
            onClick={() => onToggleCalming()}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
              activePanel === 'calming'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>Calming Studio</span>
          </button>

          <button
            onClick={() => onToggleTherapy()}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
              activePanel === 'therapy'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Volume2 className="h-4 w-4" />
            <span>Speech Practice</span>
          </button>
        </div>

        {/* Settings & Key indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            {hasApiKey ? (
              <span className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Gemini Ready
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-2.5 py-1 rounded-full font-medium animate-pulse">
                <AlertCircle className="h-3.5 w-3.5" />
                API Key Needed
              </span>
            )}
          </div>

          <button
            onClick={onToggleSettings}
            className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            title="Open Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

      </div>
    </header>
  );
}
