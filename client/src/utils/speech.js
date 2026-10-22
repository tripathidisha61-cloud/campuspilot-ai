// Alexa+ Voice Assistant Simulation & Web Speech API Utilities

let currentUtterance = null;

export const speech = {
  isSynthesisSupported: () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  isRecognitionSupported: () =>
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window),

  speak: (text, onEnd) => {
    if (!speech.isSynthesisSupported() || !text) return;

    window.speechSynthesis.cancel();

    // Clean markdown formatting before speaking
    const cleanText = text
      .replace(/###|##|#/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/>/g, '')
      .replace(/- /g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  },

  stop: () => {
    if (speech.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  },

  createRecognizer: (onResult, onError, onEnd) => {
    if (!speech.isRecognitionSupported()) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognizer = new SpeechRecognition();
    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.lang = 'en-US';

    recognizer.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    recognizer.onerror = (err) => {
      console.warn('Speech recognition error:', err);
      if (onError) onError(err);
    };

    recognizer.onend = () => {
      if (onEnd) onEnd();
    };

    return recognizer;
  }
};
