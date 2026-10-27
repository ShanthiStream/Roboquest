// Web Speech API Voice Commander and Robot Speech Synthesizer

export interface SpeechCallbacks {
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onStateChange?: (isListening: boolean) => void;
}

class SpeechSystem {
  private recognition: any = null;
  private isListening: boolean = false;
  private callbacks: SpeechCallbacks = {};
  private speechVolume: number = 0.8;
  private isSupported: boolean = false;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.isSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks.onStateChange?.(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.callbacks.onStateChange?.(false);
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript;
          } else {
            interim += res[0].transcript;
          }
        }

        if (interim && this.callbacks.onInterimResult) {
          this.callbacks.onInterimResult(interim);
        }
        if (final && this.callbacks.onFinalResult) {
          this.callbacks.onFinalResult(final);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        this.callbacks.onStateChange?.(false);
        let errorMsg = `Speech recognition error: ${event.error}`;
        if (event.error === 'not-allowed') {
          errorMsg = 'Microphone permission was denied. Please allow microphone access in your browser.';
        } else if (event.error === 'no-speech') {
          errorMsg = 'No speech detected. Please speak clearly into the microphone.';
        }
        this.callbacks.onError?.(errorMsg);
      };
    }
  }

  isVoiceSupported(): boolean {
    return this.isSupported;
  }

  setCallbacks(cbs: SpeechCallbacks) {
    this.callbacks = cbs;
  }

  startListening(): boolean {
    if (!this.isSupported || !this.recognition) {
      this.callbacks.onError?.('Web Speech API is not supported in this browser. Please use text commands.');
      return false;
    }
    try {
      this.recognition.start();
      return true;
    } catch (err: any) {
      // Already running or failed
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  speak(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.25; // cute robotic higher pitch
      utterance.volume = this.speechVolume;

      // Pick high-tech English voice if available
      const voices = window.speechSynthesis.getVoices();
      const robotVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural')));
      if (robotVoice) {
        utterance.voice = robotVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  setVolume(vol: number) {
    this.speechVolume = Math.max(0, Math.min(1, vol));
  }
}

export const speech = new SpeechSystem();
