/**
 * Speech Utilities: Text-to-Speech (TTS) with word-highlighting support 
 * and Speech-to-Text (STT) using the browser's Web Speech API.
 */

// Check browser compatibility for Speech Recognition
export const isSpeechRecognitionSupported = () => {
  try {
    return typeof window !== 'undefined' && 
      !!(window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition);
  } catch (e) {
    console.warn("Speech recognition support check failed:", e);
    return false;
  }
};

let currentUtterance = null;

/**
 * Speaks text using the browser SpeechSynthesis.
 * Supports word boundary events for word highlighting.
 */
export function speakText(text, options = {}, onWordBoundary = null, onEnd = null, onError = null) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onError) onError(new Error("Text-to-Speech not supported in this browser."));
    return;
  }

  // Cancel any active speech
  window.speechSynthesis.cancel();

  // Strip markdown tags before speaking to make it sound natural
  const cleanText = text
    .replace(/[\#\*\_`~]/g, '') // remove markdown symbols
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // replace links with their text
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance = utterance;

  // Configure options
  utterance.rate = options.rate || 0.95; // slightly slower for better comprehension
  utterance.pitch = options.pitch || 1.0;
  
  if (options.voice) {
    utterance.voice = options.voice;
  } else {
    // Attempt to pick a high-quality local English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
  }

  // Set callbacks
  if (onWordBoundary) {
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        // Find the word bounds in the cleanText
        const remainingText = cleanText.slice(charIndex);
        const wordMatch = remainingText.match(/^[\w']+/);
        const wordLength = wordMatch ? wordMatch[0].length : 0;
        
        onWordBoundary({
          charIndex,
          charLength: wordLength,
          word: cleanText.slice(charIndex, charIndex + wordLength)
        });
      }
    };
  }

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    currentUtterance = null;
    if (onError) onError(e);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Cancels any ongoing text speech.
 */
export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/**
 * Speech Recognition Wrapper (STT)
 */
export class SpeechRecognizer {
  constructor() {
    this.recognition = null;
    this.isListening = false;

    if (typeof window !== 'undefined') {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = false;
          this.recognition.lang = 'en-US';
        }
      } catch (e) {
        console.warn("Web Speech API recognition construct failed:", e);
      }
    }
  }

  start(onResult, onEnd, onError) {
    if (!this.recognition) {
      if (onError) onError(new Error("Speech Recognition not supported."));
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    }

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      if (onResult) onResult(result);
    };

    this.recognition.onerror = (event) => {
      console.error("STT error:", event.error);
      if (onError) onError(event);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    this.recognition.start();
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
