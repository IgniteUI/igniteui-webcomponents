import * as signalR from '@microsoft/signalr';
import { BaseSttClient } from './stt-client-base.js';

const HUB_TRANSCRIBE_AUDIO_CHUNK = 'TranscribeAudioChunk';
const HUB_RECEIVE_TRANSCRIPT = 'ReceiveTranscript';
const HUB_COMPLETE_TRANSCRIBE = 'FinalizeTranscription';

export class BackendSttClient extends BaseSttClient {
  private hubConnection?: signalR.HubConnection;
  private mediaRecorder?: MediaRecorder;
  private isStopInProgress = false;
  private isStopCompleted = false;
  private stopHubTimeout: any;

  constructor(
    hubUrl: string,
    onPulseSignal: () => void,
    onStartCountdown: (ms: number | null) => void,
    onTranscript: (text: string) => void,
    onStopInProgress: () => void,
    onFinishedTranscribing: (finish: 'auto' | 'manual') => void
  ) {
    super(
      onPulseSignal,
      onStartCountdown,
      onTranscript,
      onStopInProgress,
      onFinishedTranscribing
    );
    this.hubUrl = hubUrl;
  }

  private hubUrl: string;

  async start(language = 'en-US') {
    if (this.isRecording) {
      return;
    }

    this.onTranscript('');
    const transcript = {
      confirmed: '',
      tentative: '',
    };

    this.hubConnection = this.createHubConnection();

    this.hubConnection.on(
      HUB_RECEIVE_TRANSCRIPT,
      (data: {
        transcription: string;
        isFinal: boolean;
        isCompleted: boolean;
      }) => {
        this.handleTranscriptEvent(transcript, data);
      }
    );

    await this.hubConnection.start();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 48000,
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
      },
    });
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus',
    });

    this.mediaRecorder.ondataavailable = async (event) => {
      this.sendForTranscription(event.data, language);
      if (this.isStopInProgress) {
        await this.hubConnection?.invoke(HUB_COMPLETE_TRANSCRIBE);
      }
    };

    this.mediaRecorder.start(100);
    this.isRecording = true;
    this.isStopInProgress = false;
    this.isStopCompleted = false;
    this.resetSilenceTimer();
    this.restartGracePeriod();
  }

  stop() {
    this.isStopInProgress = true;
    this.onStopInProgress();
    this.mediaRecorder?.stop();
    this.clearSilenceTimer();
    if (this.stopHubTimeout) {
      clearTimeout(this.stopHubTimeout);
    }
    this.stopHubTimeout = setTimeout(() => {
      this.stopHubConnection();
      this.stopHubTimeout = null;
    }, 1500);
  }

  private async sendForTranscription(data: Blob, language: string) {
    if (
      data.size > 0 &&
      this.hubConnection?.state === signalR.HubConnectionState.Connected
    ) {
      const buffer = await data.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      try {
        await this.hubConnection.invoke(
          HUB_TRANSCRIBE_AUDIO_CHUNK,
          base64Audio,
          language
        );
      } catch {
        //console.error("STT invoke failed:", err); //TODO
        this.stop();
      }
    }
  }

  private handleTranscriptEvent(
    currentTranscript: any,
    newTranscriptData: any
  ) {
    currentTranscript.tentative = newTranscriptData.transcription;
    this.onTranscript(
      currentTranscript.confirmed + currentTranscript.tentative
    );
    this.resetSilenceTimer();
    if (newTranscriptData.isFinal) {
      currentTranscript.confirmed += currentTranscript.tentative;
    }

    this.onPulseSignal();

    if (this.isCountdownRunning) {
      this.onStartCountdown(null);
      this.isCountdownRunning = false;
    }

    this.restartGracePeriod();

    if (newTranscriptData.isCompleted) {
      this.stopHubConnection();
    }
  }

  private createHubConnection() {
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    return hubConnection;
  }

  private stopHubConnection() {
    if (this.isStopInProgress && !this.isStopCompleted) {
      this.isRecording = false;
      this.hubConnection?.off(HUB_RECEIVE_TRANSCRIPT);
      this.hubConnection?.stop();
      this.isStopCompleted = true;
      this.isStopInProgress = false;
      if (this.stopHubTimeout) {
        clearTimeout(this.stopHubTimeout);
      }

      this.onFinishedTranscribing(this.isAutoFinished ? 'auto' : 'manual');
      this.isAutoFinished = false;
    }
  }
}
