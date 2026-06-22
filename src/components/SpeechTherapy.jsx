import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, CheckCircle, XCircle, RefreshCw, Star, Info, HelpCircle } from 'lucide-react';
import { speakText } from '../utils/tts-stt';
import { generateGeminiJSON } from '../services/gemini';
import { SPEECH_THERAPY_INSTRUCTION } from '../services/agents';

const PRACTICE_PHRASES = [
  { id: '1', level: 'Beginner', text: 'Sunny skies', targetSound: 'S and Sh sounds' },
  { id: '2', level: 'Beginner', text: 'Three free throws', targetSound: 'Th and F sounds' },
  { id: '3', level: 'Intermediate', text: 'Green grass grows quickly', targetSound: 'G and R blend' },
  { id: '4', level: 'Intermediate', text: 'Splish splash rain drops', targetSound: 'Spl and Dr blends' },
  { id: '5', level: 'Advanced', text: 'Deep breathing calms my busy mind', targetSound: 'Flow and multi-word rhythm' },
];

export default function SpeechTherapy({ settings, onClose }) {
  const [selectedPhrase, setSelectedPhrase] = useState(PRACTICE_PHRASES[0]);
  const [customPhrase, setCustomPhrase] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const targetText = customPhrase.trim() !== '' ? customPhrase : selectedPhrase.text;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const rec = new SpeechRecognition();
          rec.continuous = false;
          rec.interimResults = false;
          rec.lang = 'en-US';
          setRecognitionInstance(rec);
        } else {
          setErrorMsg('Microphone recognition is not supported in this browser. Please use Chrome or Edge.');
        }
      } catch (e) {
        console.warn("Speech recognition instantiation failed in SpeechTherapy:", e);
        setErrorMsg('Microphone recognition is blocked or unsupported in this browser.');
      }
    }
  }, []);

  const handleHearTarget = () => {
    speakText(targetText, { rate: settings.ttsRate, voice: settings.ttsVoice });
  };

  const handleStartListening = () => {
    if (!recognitionInstance) return;
    
    setErrorMsg('');
    setTranscription('');
    setEvaluationResult(null);
    setIsListening(true);

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscription(transcript);
      evaluateSpeech(targetText, transcript);
    };

    recognitionInstance.onerror = (e) => {
      console.error(e);
      setErrorMsg(`Voice input error: ${e.error || 'Could not understand voice'}`);
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.start();
  };

  const handleStopListening = () => {
    if (recognitionInstance) {
      recognitionInstance.stop();
      setIsListening(false);
    }
  };

  const evaluateSpeech = async (target, spoken) => {
    setIsEvaluating(true);
    setErrorMsg('');
    
    if (!settings.apiKey) {
      // Mock evaluation fallback for offline/no-key usage
      setTimeout(() => {
        const clean = (str) => str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/).filter(Boolean);
        const targetWords = clean(target);
        const spokenWords = clean(spoken);
        let matches = 0;
        targetWords.forEach(word => {
          if (spokenWords.includes(word)) matches++;
        });
        const accuracyPercent = targetWords.length > 0 ? Math.round((matches / targetWords.length) * 100) : 0;
        const isMatch = accuracyPercent >= 75;
        
        let feedback = "";
        let tips = [];
        
        if (accuracyPercent === 100) {
          feedback = `Perfect! You spoke the exact words matching the target phrase. Excellent pronunciation.`;
          tips = ["Excellent pacing and sound clarity. Keep practicing with advanced phrases!"];
        } else if (accuracyPercent >= 75) {
          feedback = `Great job! Your spoken phrase is very clear and matched most of the target words.`;
          tips = [
            "Listen to Deeta's audio to hear the exact blend of sounds.",
            "Make sure to fully enunciate every word."
          ];
        } else if (accuracyPercent > 0) {
          feedback = `Good try! You spoke: "${spoken}". Let's focus on matching more of the target sounds.`;
          tips = [
            "Break the phrase down into single words first.",
            "Press 'Hear Deeta Say It' to practice the speed and flow."
          ];
        } else {
          feedback = `We couldn't match the words in "${spoken}". Try speaking a bit slower and closer to the microphone.`;
          tips = [
            "Ensure you are in a quiet room.",
            "Speak clearly and pronounce the beginning sounds."
          ];
        }
        
        setEvaluationResult({
          isMatch,
          accuracyPercent,
          feedback,
          tips
        });
        setIsEvaluating(false);
      }, 1200);
      return;
    }
    
    try {
      const prompt = `Target Phrase: "${target}"\nSpoken Text: "${spoken}"`;
      const result = await generateGeminiJSON(prompt, SPEECH_THERAPY_INSTRUCTION, settings.apiKey);
      setEvaluationResult(result);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to evaluate speech. The AI may be busy.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-darkCard border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-md max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2 ${settings.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
            <Star className="h-5 w-5 text-purple-500 fill-purple-500/20" />
            Speech & Pronunciation Practice
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Practice speaking sounds and get friendly feedback on clarity.
          </p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
          >
            Close
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 text-rose-800 dark:text-rose-300 rounded-2xl p-4 mb-6 flex gap-3 text-sm">
          <Info className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Practice Phrases List */}
        <div className="space-y-4 md:col-span-1 border-r border-zinc-200 dark:border-zinc-800 md:pr-6">
          <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Choose a Practice Phrase
          </h3>
          <div className="space-y-2">
            {PRACTICE_PHRASES.map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => {
                  setSelectedPhrase(phrase);
                  setCustomPhrase('');
                  setTranscription('');
                  setEvaluationResult(null);
                }}
                className={`w-full p-3 text-left border rounded-xl transition-all ${
                  selectedPhrase.id === phrase.id && customPhrase === ''
                    ? 'border-purple-500 bg-purple-50/20 dark:bg-purple-900/10 text-purple-700 dark:text-purple-400' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">
                    {phrase.level}
                  </span>
                  {phrase.targetSound && (
                    <span className="text-2xs text-zinc-400">{phrase.targetSound}</span>
                  )}
                </div>
                <span className="block text-sm font-semibold mt-1">{phrase.text}</span>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-2xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
              Or Type Custom Phrase
            </label>
            <input
              type="text"
              value={customPhrase}
              onChange={(e) => {
                setCustomPhrase(e.target.value);
                setTranscription('');
                setEvaluationResult(null);
              }}
              placeholder="e.g. Simple plants grow..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Practice Station */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Target Card */}
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl text-center space-y-4">
            <span className="text-2xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Read This Phrase Out Loud
            </span>
            <h3 className={`text-2xl font-black text-zinc-800 dark:text-zinc-100 ${settings.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
              "{targetText}"
            </h3>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={handleHearTarget}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Volume2 className="h-4 w-4" />
                Hear Deeta Say It
              </button>
            </div>
          </div>

          {/* Micro Recording Area */}
          <div className="flex flex-col items-center justify-center p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`h-16 w-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                isListening 
                  ? 'bg-rose-500 hover:bg-rose-600 animate-pulse scale-105' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
            </button>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
              {isListening ? 'Listening... Speak now!' : 'Click Microphone to Practice'}
            </span>

            {transcription && (
              <div className="w-full text-center space-y-1">
                <span className="text-2xs text-zinc-400 block uppercase font-semibold">You said:</span>
                <p className="text-sm font-semibold italic text-zinc-800 dark:text-zinc-300">
                  "{transcription}"
                </p>
              </div>
            )}
          </div>

          {/* AI Feedback Section */}
          {(isEvaluating || evaluationResult) && (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/30">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Pronunciation Analysis
              </h4>

              {isEvaluating ? (
                <div className="flex items-center gap-3 py-2">
                  <RefreshCw className="h-5 w-5 text-purple-500 animate-spin" />
                  <span className="text-xs text-zinc-500">Deeta is listening and evaluating...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Score */}
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      {evaluationResult.accuracyPercent >= 80 ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <HelpCircle className="h-5 w-5 text-amber-500" />
                      )}
                      <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
                        {evaluationResult.accuracyPercent}% Accuracy
                      </span>
                    </div>
                    <span className="text-2xs text-zinc-400 uppercase font-semibold">
                      {evaluationResult.isMatch ? 'Match Found' : 'Practice Again'}
                    </span>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-1">
                    <span className="text-2xs text-zinc-400 font-bold block uppercase">Deeta's Feedback:</span>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                      {evaluationResult.feedback}
                    </p>
                  </div>

                  {/* Tips list */}
                  {evaluationResult.tips && evaluationResult.tips.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-2xs text-zinc-400 font-bold block uppercase">Voice Tips:</span>
                      <ul className="list-disc pl-4 space-y-1">
                        {evaluationResult.tips.map((tip, idx) => (
                          <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
