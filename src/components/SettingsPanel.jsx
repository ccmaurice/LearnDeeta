import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Check, RefreshCw } from 'lucide-react';

export default function SettingsPanel({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdateSettings 
}) {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en')));
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    onUpdateSettings({ ...settings, apiKey });
  };

  const tints = [
    { name: 'None', class: '', color: 'bg-zinc-100 dark:bg-zinc-800' },
    { name: 'Warm Amber', class: 'bg-amber-100/10 mix-blend-multiply pointer-events-none', color: 'bg-amber-100 border-amber-300 text-amber-900' },
    { name: 'Cool Blue', class: 'bg-blue-100/10 mix-blend-multiply pointer-events-none', color: 'bg-blue-100 border-blue-300 text-blue-900' },
    { name: 'Soft Mint', class: 'bg-emerald-100/10 mix-blend-multiply pointer-events-none', color: 'bg-emerald-100 border-emerald-300 text-emerald-900' },
    { name: 'Muted Rose', class: 'bg-rose-100/10 mix-blend-multiply pointer-events-none', color: 'bg-rose-100 border-rose-300 text-rose-900' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-darkCard border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden focus-transition">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className={`text-xl font-bold text-zinc-950 dark:text-zinc-50 ${settings.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
              Preferences & Accessibility
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Customize your sensory learning workspace</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 dark:text-zinc-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Gemini API Key */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Gemini API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter AI Gemini Key (e.g. AIzaSy...)"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={handleSaveKey}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition-all"
              >
                Save
              </button>
            </div>
            <p className="text-2xs text-zinc-400 dark:text-zinc-500">
              Your key is saved locally in your browser's secure cache (localStorage).
            </p>
          </div>

          {/* Dyslexia Mode */}
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="block text-sm font-bold text-zinc-950 dark:text-zinc-50">Dyslexia Reader Mode</span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">Uses Lexend font and spacious line layouts to ease reading.</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, dyslexiaMode: !settings.dyslexiaMode })}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                settings.dyslexiaMode ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                settings.dyslexiaMode ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* ADHD Focus Mode */}
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="block text-sm font-bold text-zinc-950 dark:text-zinc-50">ADHD Focus Card Mode</span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">Hides peripheral screens, showing only one learning step at a time.</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, focusMode: !settings.focusMode })}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                settings.focusMode ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                settings.focusMode ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Color Tint Overlays */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Visual Tint Overlays (Reduces Screen Strain)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {tints.map((tint) => (
                <button
                  key={tint.name}
                  onClick={() => onUpdateSettings({ ...settings, tintOverlay: tint.class, tintOverlayName: tint.name })}
                  className={`p-3 text-xs font-medium border rounded-xl flex items-center justify-between transition-all ${
                    settings.tintOverlayName === tint.name 
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400' 
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-darkCard hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span>{tint.name}</span>
                  {settings.tintOverlayName === tint.name && <Check className="h-4 w-4 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Text-To-Speech Settings */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Audio Reading (Text-To-Speech) Settings
            </h3>
            
            {/* Speed slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Reading Speed</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{settings.ttsRate}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.1"
                value={settings.ttsRate}
                onChange={(e) => onUpdateSettings({ ...settings, ttsRate: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Voice Select */}
            {voices.length > 0 && (
              <div className="space-y-1">
                <label className="block text-xs text-zinc-500 dark:text-zinc-400">Select English Voice</label>
                <select
                  value={settings.ttsVoiceURI || ''}
                  onChange={(e) => {
                    const selectedVoice = voices.find(v => v.voiceURI === e.target.value);
                    onUpdateSettings({ 
                      ...settings, 
                      ttsVoiceURI: e.target.value,
                      ttsVoice: selectedVoice 
                    });
                  }}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-zinc-800 dark:text-zinc-200"
                >
                  <option value="">Default Browser Voice</option>
                  {voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
