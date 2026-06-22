import React, { useState } from 'react';
import { 
  Volume2, Trash2, Send, HelpCircle, AlertCircle, CheckCircle, 
  XCircle, ArrowRight, BookOpen, BarChart2, Star, Smile, Frown, Sparkles, Brain, Lightbulb
} from 'lucide-react';
import { speakText } from '../utils/tts-stt';

const AAC_ITEMS = [
  // Actions
  { id: 'i_want', label: 'I want', spoken: 'I want', color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50', icon: ArrowRight },
  { id: 'explain', label: 'Explain', spoken: 'Please explain this', color: 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/50', icon: Lightbulb },
  { id: 'help', label: 'Help', spoken: 'I need help', color: 'bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50', icon: AlertCircle },
  { id: 'more', label: 'More', spoken: 'More please', color: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-700/50 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/50', icon: PlusIcon },
  { id: 'stop', label: 'Stop', spoken: 'Stop', color: 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-900/50', icon: XCircle },
  
  // Learning Prompts
  { id: 'draw_diagram', label: 'Show Diagram', spoken: 'Please show me a diagram of this', color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50', icon: BarChart2 },
  { id: 'visual_flashcards', label: 'Flashcards', spoken: 'Show visual flashcards', color: 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50', icon: BookOpen },
  { id: 'take_quiz', label: 'Take Quiz', spoken: 'Let us take a quiz', color: 'bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 dark:text-purple-400 border-purple-200 dark:border-purple-900/50', icon: Star },
  { id: 'easy_words', label: 'Easy Words', spoken: 'Use simpler words please', color: 'bg-teal-100 hover:bg-teal-200 text-teal-800 dark:bg-teal-950/30 dark:hover:bg-teal-900/40 dark:text-teal-400 border-teal-200 dark:border-teal-900/50', icon: Brain },

  // Feelings
  { id: 'happy', label: 'Happy', spoken: 'I feel happy', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-950/30 dark:hover:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50', icon: Smile },
  { id: 'confused', label: 'Confused', spoken: 'I am confused', color: 'bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-950/30 dark:hover:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-900/50', icon: HelpCircle },
  { id: 'tired', label: 'Tired', spoken: 'I am tired and need a break', color: 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/50', icon: Frown },
];

function PlusIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={props.className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export default function AACBoard({ 
  onSendToChat, 
  settings,
  onClose 
}) {
  const [buffer, setBuffer] = useState([]);

  const handleItemClick = (item) => {
    // Speak the single item out loud instantly
    speakText(item.spoken, { rate: settings?.ttsRate, voice: settings?.ttsVoice });
    
    // Add to text buffer
    setBuffer(prev => [...prev, item]);
  };

  const handleSpeakBuffer = () => {
    if (buffer.length === 0) return;
    const fullSpeech = buffer.map(item => item.spoken).join(', ');
    speakText(fullSpeech, { rate: settings?.ttsRate, voice: settings?.ttsVoice });
  };

  const handleClearBuffer = () => {
    setBuffer([]);
  };

  const handleSendToDeeta = () => {
    if (buffer.length === 0) return;
    const fullMessage = buffer.map(item => item.spoken).join(' ');
    onSendToChat(fullMessage);
    setBuffer([]); // clear buffer after sending
    if (onClose) onClose();
  };

  return (
    <div className="bg-white dark:bg-darkCard border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-md max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2 ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
            <Brain className="h-5 w-5 text-blue-500" />
            AAC Communication Board
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Click visuals to vocalize or communicate with your tutor</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
          >
            Close Board
          </button>
        )}
      </div>

      {/* Speech Construction Buffer */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-wrap gap-2 min-h-[44px] items-center">
          {buffer.length === 0 ? (
            <span className="text-sm text-zinc-400 dark:text-zinc-500 italic">
              Click cards below to construct your message...
            </span>
          ) : (
            buffer.map((item, idx) => (
              <span 
                key={idx} 
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1 rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm"
              >
                {React.createElement(item.icon, { className: "h-3.5 w-3.5 text-zinc-500" })}
                {item.label}
              </span>
            ))
          )}
        </div>

        {/* Action Controls for Buffer */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSpeakBuffer}
            disabled={buffer.length === 0}
            className="p-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Read constructed message out loud"
          >
            <Volume2 className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleClearBuffer}
            disabled={buffer.length === 0}
            className="p-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Clear message"
          >
            <Trash2 className="h-5 w-5" />
          </button>

          <button
            onClick={handleSendToDeeta}
            disabled={buffer.length === 0}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 text-white rounded-xl font-semibold shadow-md flex items-center gap-2 transition-all"
          >
            <Send className="h-4 w-4" />
            <span>Send to Deeta</span>
          </button>
        </div>
      </div>

      {/* Grid of Symbol Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {AAC_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`border border-solid p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all transform hover:scale-[1.03] active:scale-[0.98] shadow-sm ${item.color}`}
          >
            <div className="p-3 bg-white/70 dark:bg-black/20 rounded-full flex items-center justify-center">
              {React.createElement(item.icon, { className: "h-6 w-6" })}
            </div>
            <span className={`text-sm font-bold text-center ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

    </div>
  );
}
