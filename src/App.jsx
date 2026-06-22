import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import ChatContainer from './components/ChatContainer';
import VisualStudio from './components/VisualStudio';
import AACBoard from './components/AACBoard';
import CalmingStudio from './components/CalmingStudio';
import SpeechTherapy from './components/SpeechTherapy';
import FlashcardDeck from './components/FlashcardDeck';
import QuizContainer from './components/QuizContainer';

import { streamGemini, generateGeminiJSON } from './services/gemini';
import { 
  TUTOR_INSTRUCTION, 
  VISUALIZER_INSTRUCTION, 
  GLOSSARY_INSTRUCTION, 
  ACTIVITY_INSTRUCTION 
} from './services/agents';
import { MOCK_RESPONSES } from './services/mockData';

export default function App() {
  const [settings, setSettings] = useState(() => {
    let storedKey = '';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        storedKey = localStorage.getItem('learn_deeta_key') || '';
      }
    } catch (e) {
      console.warn("localStorage access blocked:", e);
    }
    return {
      apiKey: storedKey,
      dyslexiaMode: false,
      focusMode: false,
      tintOverlay: '',
      tintOverlayName: 'None',
      ttsRate: 0.95,
      ttsVoiceURI: '',
      ttsVoice: null
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('chat'); // 'chat', 'aac', 'calming', 'therapy'
  
  const [messages, setMessages] = useState([]);
  const [diagram, setDiagram] = useState('');
  const [glossary, setGlossary] = useState([]);
  const [activities, setActivities] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTopicName, setCurrentTopicName] = useState('Study Desk');
  const [activeGlossaryIdx, setActiveGlossaryIdx] = useState(null);

  // Sync API Key to localStorage safely
  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('learn_deeta_key', newSettings.apiKey);
      }
    } catch (e) {
      console.warn("localStorage write blocked:", e);
    }
  };

  // Sync theme
  useEffect(() => {
    // We check systems settings or default to dark mode for zinc style
    document.documentElement.classList.add('dark');
  }, []);

  // Map user queries to preloaded keys for offline mock mode
  const getPreloadedKey = (query) => {
    const q = query.toLowerCase();
    if (q.includes('photosynthesis') || q.includes('leaves make')) return 'photosynthesis';
    if (q.includes('sky is blue') || q.includes('sky blue')) return 'sky_blue';
    if (q.includes('gravity')) return 'gravity';
    if (q.includes('caterpillar') || q.includes('butterfly') || q.includes('metamorphosis')) return 'butterfly';
    return null;
  };

  const handleSendMessage = async (text) => {
    const messageId = Date.now().toString();
    const userMessage = { id: messageId, sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const preloadedKey = getPreloadedKey(text);
    
    // Intercept if offline or no API Key for preloaded items
    if (!settings.apiKey && preloadedKey) {
      setTimeout(() => {
        const mock = MOCK_RESPONSES[preloadedKey];
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'deeta',
          text: mock.text
        }]);
        setDiagram(mock.diagram);
        setGlossary(mock.glossary);
        setActivities(mock.activities);
        setIsLoading(false);
      }, 1500);
      return;
    }

    if (!settings.apiKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'deeta',
          text: `⚠️ **API Key Missing!**\n\nI need a **Gemini API Key** to search and explain custom topics.\n\nPlease click the **Settings Cog (⚙️)** in the top-right to enter a key, or choose one of our **preloaded topics** on the home screen to test all features instantly!`
        }]);
        setIsLoading(false);
      }, 1000);
      return;
    }

    // Call real Gemini API
    try {
      // 1. Prepare streaming response bubble
      const tutorMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: tutorMsgId, sender: 'deeta', text: '' }]);

      let fullTutorText = '';

      // 2. Stream tutor response
      await streamGemini(
        text,
        TUTOR_INSTRUCTION,
        settings.apiKey,
        (chunk) => {
          fullTutorText += chunk;
          setMessages(prev => 
            prev.map(m => m.id === tutorMsgId ? { ...m, text: fullTutorText } : m)
          );
        },
        async (finalText) => {
          // Stream complete! Now run specialized agents in parallel
          try {
            const [diagRes, glossRes, activRes] = await Promise.allSettled([
              generateGeminiJSON(finalText, VISUALIZER_INSTRUCTION, settings.apiKey),
              generateGeminiJSON(finalText, GLOSSARY_INSTRUCTION, settings.apiKey),
              generateGeminiJSON(finalText, ACTIVITY_INSTRUCTION, settings.apiKey)
            ]);

            if (diagRes.status === 'fulfilled') {
              setDiagram(diagRes.value.diagram);
            }
            if (glossRes.status === 'fulfilled') {
              setGlossary(glossRes.value);
            }
            if (activRes.status === 'fulfilled') {
              setActivities(activRes.value);
            }
          } catch (e) {
            console.error("Error in parallel agent execution:", e);
          } finally {
            setIsLoading(false);
          }
        },
        (err) => {
          setMessages(prev => 
            prev.map(m => m.id === tutorMsgId ? { ...m, text: `❌ **Error:** ${err.message}` } : m)
          );
          setIsLoading(false);
        }
      );
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const handleSelectPreloaded = (query, topicName) => {
    setCurrentTopicName(topicName);
    handleSendMessage(query);
  };

  const handleTogglePanel = (panelName) => {
    setActivePanel(prev => prev === panelName ? 'chat' : panelName);
  };

  const handleResetChat = () => {
    setMessages([]);
    setDiagram('');
    setGlossary([]);
    setActivities(null);
    setCurrentTopicName('Study Desk');
    setActiveGlossaryIdx(null);
  };

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-darkBg text-zinc-900 dark:text-zinc-50 flex flex-col ${
      settings.dyslexiaMode ? 'dyslexia-font' : ''
    }`}>
      
      {/* Visual Screen Tint Filter */}
      {settings.tintOverlay && (
        <div className={`fixed inset-0 z-40 ${settings.tintOverlay}`} />
      )}

      {/* Header */}
      <Header
        hasApiKey={!!settings.apiKey}
        onToggleSettings={() => setIsSettingsOpen(true)}
        onToggleAAC={() => handleTogglePanel('aac')}
        onToggleCalming={() => handleTogglePanel('calming')}
        onToggleTherapy={() => handleTogglePanel('therapy')}
        activePanel={activePanel}
        dyslexiaMode={settings.dyslexiaMode}
      />

      {/* Settings Modal */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Main workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Toggleable Full-Screen/Panel Views */}
        {activePanel === 'aac' && (
          <AACBoard
            onSendToChat={handleSendMessage}
            settings={settings}
            onClose={() => setActivePanel('chat')}
          />
        )}

        {activePanel === 'calming' && (
          <CalmingStudio
            settings={settings}
            onClose={() => setActivePanel('chat')}
          />
        )}

        {activePanel === 'therapy' && (
          <SpeechTherapy
            settings={settings}
            onClose={() => setActivePanel('chat')}
          />
        )}

        {/* Core Study desk (Default Chat view) */}
        {activePanel === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left: Chat Container */}
            <div className={`h-full ${settings.focusMode ? 'lg:col-span-12' : 'lg:col-span-6'}`}>
              <ChatContainer
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                settings={settings}
                onSelectPreloaded={handleSelectPreloaded}
                onResetChat={handleResetChat}
              />
            </div>

            {/* Right: Visual Studio & Interactive activities (Hidden in focus mode) */}
            {!settings.focusMode && (
              <div className="lg:col-span-6 space-y-6">
                
                {/* 1. VisualMindmap */}
                {diagram && (
                  <VisualStudio 
                    diagram={diagram}
                    settings={settings}
                  />
                )}

                {/* 2. Interactive Glossary (Hover Dictionary) */}
                {glossary.length > 0 && (
                  <div className="bg-white dark:bg-darkCard border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                      Glossary Key Words (Hover or Click to Read)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {glossary.map((g, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setActiveGlossaryIdx(prev => prev === idx ? null : idx)}
                          className="group relative cursor-help bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-900/50"
                        >
                          <span>{g.word}</span>
                          {/* Floating tooltip hover box */}
                          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg transition-all duration-200 z-50 text-left pointer-events-none ${
                            activeGlossaryIdx === idx 
                              ? 'opacity-100 visible' 
                              : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
                          }`}>
                            <span className="block text-2xs font-extrabold text-blue-500 uppercase">Meaning:</span>
                            <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{g.simplified}</span>
                            {g.synonyms && g.synonyms.length > 0 && (
                              <div className="mt-1.5">
                                <span className="block text-3xs text-zinc-400 uppercase font-semibold">Synonyms:</span>
                                <span className="block text-3xs text-zinc-500 dark:text-zinc-400 font-medium italic">{g.synonyms.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Flashcards, checklist, & YouTube recommendation */}
                {activities && (
                  <FlashcardDeck
                    flashcards={activities.flashcards}
                    checklist={activities.checklist}
                    videoSearchQuery={activities.videoSearchQuery}
                    settings={settings}
                  />
                )}

                {/* 4. Gamified Quiz */}
                {activities && activities.quiz && (
                  <QuizContainer
                    quiz={activities.quiz}
                    settings={settings}
                  />
                )}

              </div>
            )}

          </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500 font-medium bg-white dark:bg-darkCard">
        <p>© 2026 LearnDeeta Project Team. Built for Kaggle Agents for Good Capstone.</p>
      </footer>

    </div>
  );
}
