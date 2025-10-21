import { BaseSttClient } from './stt-client-base.js';

export class WebSpeechSttClient extends BaseSttClient {
  private recognition?: SpeechRecognition;

  async start(language = 'en-US') {
    if (this.isRecording) {
      return;
    }

    this.onTranscript('');

    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Web Speech API not supported in this browser.');
    }
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = language;

    this.recognition.onresult = (event: any) => {
      this.handleTranscriptEvent(event);
    };

    this.recognition.onerror = () => {
      //console.error("Speech recognition error", e);
    };

    this.recognition?.start();

    this.isRecording = true;
    this.resetSilenceTimer();
    this.restartGracePeriod();
  }

  stop() {
    if (!this.isRecording) {
      return;
    }
    this.recognition?.stop();
    this.isRecording = false;
    this.onFinishedTranscribing(this.isAutoFinished ? 'auto' : 'manual');
    this.isAutoFinished = false;
  }

  private handleTranscriptEvent(event: any) {
    let transcript = '';
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    this.onTranscript(transcript);
    this.resetSilenceTimer();
    this.onPulseSignal();
    if (this.isCountdownRunning) {
      this.onStartCountdown(null);
      this.isCountdownRunning = false;
    }
    this.restartGracePeriod();
  }
}

//Fix. Add own interface declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  // The browser’s Web Speech API type (simplified)
  var SpeechRecognition: {
    new (): SpeechRecognition;
  };

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onaudioend?: (this: SpeechRecognition, ev: Event) => any;
    onaudiostart?: (this: SpeechRecognition, ev: Event) => any;
    onend?: (this: SpeechRecognition, ev: Event) => any;
    onerror?: (this: SpeechRecognition, ev: Event) => any;
    onnomatch?: (this: SpeechRecognition, ev: Event) => any;
    onresult?: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any;
    onsoundend?: (this: SpeechRecognition, ev: Event) => any;
    onsoundstart?: (this: SpeechRecognition, ev: Event) => any;
    onspeechend?: (this: SpeechRecognition, ev: Event) => any;
    onspeechstart?: (this: SpeechRecognition, ev: Event) => any;
    onstart?: (this: SpeechRecognition, ev: Event) => any;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
}
