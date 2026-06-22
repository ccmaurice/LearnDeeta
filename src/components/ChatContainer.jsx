import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Sparkles, RefreshCw, 
  HelpCircle, ArrowUpRight, CheckCircle2, ChevronRight, Keyboard
} from 'lucide-react';
import { speakText, stopSpeaking, SpeechRecognizer, isSpeechRecognitionSupported } from '../utils/tts-stt';

const PRELOADED_TOPICS = [
  { topic: 'How leaves make food (Photosynthesis)', query: 'Explain how photosynthesis works in plants.' },
  { topic: 'Why the sky is blue', query: 'Why is the sky blue?' },
  { topic: 'How gravity holds us', query: 'Explain gravity to a kid.' },
  { topic: 'The life cycle of a butterfly', query: 'How does a caterpillar turn into a butterfly?' },
];

export default function ChatContainer({ 
  messages = [], 
  onSendMessage, 
  isLoading, 
  settings, 
  onSelectPreloaded,
  onResetChat
}) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);
  const [highlightWord, setHighlightWord] = useState(null);
  const [sttSupported, setSttSupported] = useState(false);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognizerRef = useRef(null);

  useEffect(() => {
    try {
      setSttSupported(isSpeechRecognitionSupported());
      if (isSpeechRecognitionSupported()) {
        recognizerRef.current = new SpeechRecognizer();
      }
    } catch (e) {
      console.warn("Failed to initialize speech recognition:", e);
      setSttSupported(false);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    try {
      if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (e) {
      console.warn("Auto-scroll failed:", e);
    }
  }, [messages, isLoading]);

  // Adjust height of textarea dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Speak message aloud with word highlighting
  const handleSpeakMessage = (msg) => {
    if (activeSpeakingId === msg.id) {
      stopSpeaking();
      setActiveSpeakingId(null);
      setHighlightWord(null);
      return;
    }

    setActiveSpeakingId(msg.id);
    
    speakText(
      msg.text,
      { rate: settings?.ttsRate || 0.95, voice: settings?.ttsVoice || null },
      (boundary) => {
        setHighlightWord(boundary);
      },
      () => {
        setActiveSpeakingId(null);
        setHighlightWord(null);
      },
      (err) => {
        console.error("Speech playback error:", err);
        setActiveSpeakingId(null);
        setHighlightWord(null);
      }
    );
  };

  // Voice dictation (Speech to Text)
  const handleToggleListening = () => {
    if (!recognizerRef.current) return;

    if (isListening) {
      recognizerRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognizerRef.current.start(
        (result) => {
          setInput(prev => prev + (prev ? ' ' : '') + result);
        },
        () => {
          setIsListening(false);
        },
        (err) => {
          console.error(err);
          setIsListening(false);
        }
      );
    }
  };

  // Cleans markdown symbols for highlight comparison
  const cleanSpeechText = (text) => {
    return text
      .replace(/[\#\*\_`~]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .trim();
  };

  // Render message bubble content (clean plain text with highlighting if speaking, otherwise standard formatting)
  const renderBubbleContent = (msg) => {
    if (activeSpeakingId === msg.id && highlightWord) {
      const cleanText = cleanSpeechText(msg.text);
      const { charIndex, charLength } = highlightWord;
      
      const before = cleanText.slice(0, charIndex);
      const word = cleanText.slice(charIndex, charIndex + charLength);
      const after = cleanText.slice(charIndex + charLength);

      return (
        <div className={`whitespace-pre-wrap leading-relaxed text-sm font-semibold tracking-wide ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
          {before}
          <mark className="bg-yellow-200 dark:bg-yellow-800 text-zinc-950 dark:text-zinc-50 rounded px-1 font-extrabold shadow-sm">
            {word}
          </mark>
          {after}
        </div>
      );
    }

    // Default formatted output
    return (
      <div 
        className={`whitespace-pre-wrap leading-relaxed text-sm font-semibold ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}
        dangerouslySetInnerHTML={{
          __html: msg.text
            // Very simple markdown-to-html conversion for display clarity
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n- (.*?)/g, '<br/>• $1')
            .replace(/\n\d+\. (.*?)/g, '<br/>$1')
        }}
      />
    );
  };

  return (
    <div className="bg-white dark:bg-darkCard border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-full flex flex-col justify-between">
      
      {/* Preloaded Topics (If no messages yet) */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col justify-center items-center py-8 space-y-6">
          <div className="text-center space-y-2 max-w-sm">
            <h3 className={`text-base font-extrabold text-zinc-900 dark:text-zinc-100 ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
              Hello! I am Deeta.
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Choose a starter topic below to begin learning through visuals, flashcards, and checks!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
            {PRELOADED_TOPICS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPreloaded(item.query, item.topic)}
                className="p-4 text-left border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 transition-all hover:scale-[1.02] flex justify-between items-center gap-2 shadow-2xs"
              >
                <span className="text-xs font-bold">{item.topic}</span>
                <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Header and Reset */}
      {messages.length > 0 && (
        <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h3 className={`text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
            Study Desk Chat
          </h3>
          <button
            onClick={onResetChat}
            className="text-xs font-extrabold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 px-2.5 py-1 rounded-lg"
          >
            Start New Topic
          </button>
        </div>
      )}

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 max-h-[460px]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                  isUser ? 'bg-zinc-200 text-zinc-700' : 'bg-blue-500 text-white shadow-sm'
                }`}>
                  {isUser ? 'U' : 'D'}
                </div>

                {/* Bubble Container */}
                <div className={`space-y-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  
                  {/* Bubble */}
                  <div className={`p-4 rounded-3xl border shadow-2xs transition-all ${
                    isUser 
                      ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tr-none' 
                      : 'bg-blue-50/40 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
                  }`}>
                    {renderBubbleContent(msg)}
                  </div>

                  {/* Speech Trigger (Only for Deeta replies) */}
                  {!isUser && (
                    <div className="flex justify-start px-2">
                      <button
                        onClick={() => handleSpeakMessage(msg)}
                        className={`p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors ${
                          activeSpeakingId === msg.id ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                        title={activeSpeakingId === msg.id ? "Stop Speaking" : "Read Aloud"}
                      >
                        {activeSpeakingId === msg.id ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}

                </div>

              </div>
            );
          })}

          {/* Thinking / Loading Animation */}
          {isLoading && (
            <div className="flex gap-3 mr-auto items-center">
              <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                D
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl rounded-tl-none flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                <span className="text-xs text-zinc-500">Deeta is structuring the lesson...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex gap-2 items-end">
        {sttSupported && (
          <button
            onClick={handleToggleListening}
            className={`p-3 border rounded-2xl transition-colors shadow-2xs ${
              isListening
                ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                : 'bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
            }`}
            title={isListening ? 'Stop listening' : 'Start speaking (Voice Dictation)'}
          >
            {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
          </button>
        )}

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your educational question or query..."
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none max-h-32 shadow-2xs font-semibold"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl transition-all shadow-md"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </div>

    </div>
  );
}
