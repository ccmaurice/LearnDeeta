import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, Award, Trophy } from 'lucide-react';
import { speakText } from '../utils/tts-stt';

export default function QuizContainer({ quiz = [], settings }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!quiz || quiz.length === 0) return null;

  const currentQuestion = quiz[currentIdx];

  const handleSelect = (idx) => {
    if (isSubmitted) return;
    setSelectedOpt(idx);
  };

  const handleSubmit = () => {
    if (selectedOpt === null) return;
    setIsSubmitted(true);
    if (selectedOpt === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
      // Play a short positive chime sound using speech synthesis or Web Audio API
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        speakText("Correct!", { rate: 1.2, voice: settings?.ttsVoice });
      }
    } else {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        speakText("Nice try!", { rate: 1.2, voice: settings?.ttsVoice });
      }
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setIsSubmitted(false);
    if (currentIdx + 1 < quiz.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="bg-white dark:bg-darkCard border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
      
      {/* Quiz Header */}
      <div className="flex justify-between items-center mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <h3 className={`text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
          Active Checkpoints
        </h3>
        {!isFinished && (
          <span className="text-xs font-semibold text-zinc-500">
            Question {currentIdx + 1} of {quiz.length}
          </span>
        )}
      </div>

      {/* Quiz Body */}
      {!isFinished ? (
        <div className="space-y-6">
          
          {/* Question Text */}
          <div className="space-y-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-500 uppercase">
              <HelpCircle className="h-4 w-4" />
              Practice Checkpoint
            </span>
            <p className={`text-lg font-extrabold text-zinc-800 dark:text-zinc-100 ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
              {currentQuestion.question}
            </p>
          </div>

          {/* Options list */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((option, idx) => {
              let btnClass = 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200';
              
              if (selectedOpt === idx) {
                btnClass = 'border-blue-500 bg-blue-50/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20';
              }
              
              if (isSubmitted) {
                if (idx === currentQuestion.correctIndex) {
                  btnClass = 'border-emerald-500 bg-emerald-50/20 text-emerald-700 dark:text-emerald-400 font-bold';
                } else if (selectedOpt === idx) {
                  btnClass = 'border-rose-500 bg-rose-50/20 text-rose-700 dark:text-rose-400';
                } else {
                  btnClass = 'opacity-40 border-zinc-200 dark:border-zinc-800';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isSubmitted}
                  className={`w-full p-4 border rounded-2xl text-left text-sm font-semibold flex items-center justify-between transition-all ${btnClass}`}
                >
                  <span className={settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}>
                    {option}
                  </span>
                  
                  {isSubmitted && idx === currentQuestion.correctIndex && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}
                  {isSubmitted && selectedOpt === idx && idx !== currentQuestion.correctIndex && (
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* AI Explanation / Feedback */}
          {isSubmitted && (
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1">
              <span className="text-2xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Explanation:
              </span>
              <p className={`text-xs font-semibold text-zinc-600 dark:text-zinc-400 leading-relaxed ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end pt-2">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOpt === null}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <span>{currentIdx + 1 < quiz.length ? 'Next Question' : 'Finish Quiz'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

        </div>
      ) : (
        /* Results screen */
        <div className="text-center py-6 space-y-6">
          <div className="inline-flex p-4 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-500 rounded-full border border-yellow-200 dark:border-yellow-900/50">
            <Trophy className="h-10 w-10 animate-bounce" />
          </div>
          
          <div className="space-y-1">
            <h4 className={`text-xl font-black text-zinc-800 dark:text-zinc-100 ${settings?.dyslexiaMode ? 'dyslexia-font' : 'font-sans'}`}>
              Quiz Completed!
            </h4>
            <p className="text-xs text-zinc-500">
              Great learning effort, champion!
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 max-w-sm mx-auto flex items-center justify-around">
            <div>
              <span className="block text-2xs text-zinc-400 uppercase font-semibold">Your Score</span>
              <span className="block text-2xl font-black text-zinc-800 dark:text-zinc-100">
                {score} / {quiz.length}
              </span>
            </div>
            <div className="border-l border-zinc-200 dark:border-zinc-800 h-8" />
            <div>
              <span className="block text-2xs text-zinc-400 uppercase font-semibold">XP Earned</span>
              <span className="block text-2xl font-black text-blue-500">
                +{score * 10} XP
              </span>
            </div>
          </div>

          <div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
