import * as signalR from '@microsoft/signalr';

const HUB_TRANSCRIBE_AUDIO_CHUNK = 'TranscribeAudioChunk';
const HUB_RECEIVE_TRANSCRIPT = 'ReceiveTranscript';
const HUB_COMPLETE_TRANSCRIBE = 'FinalizeTranscription';
const SILENCE_TIMEOUT_MS = 3000;
const SILENCE_GRACE_PERIOD = 1000;

export class SttClient {
  private hubConnection?: signalR.HubConnection;
  private mediaRecorder?: MediaRecorder;
  private isRecording = false;
  private isStopInProgress = false;
  private isStopCompleted = false;
  private stopHubTimeout: any;
  private silenceTimeout: any;
  private silenceGraceTimeout: any;
  private isAutoFinished = false;
  private isCountdownRunning = false;

  constructor(
    private hubUrl: string,
    private token: string,
    private onPulseSignal: () => void,
    private onStartCountdown: (ms: number | null) => void,
    private onTranscript: (text: string) => void,
    private onStopInProgress: () => void,
    private onFinishedTranscribing: (finish: string) => void
  ) {}

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
      await this.hubConnection.invoke(
        HUB_TRANSCRIBE_AUDIO_CHUNK,
        base64Audio,
        language
      );
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
      .withUrl(this.hubUrl, { accessTokenFactory: () => this.token })
      .configureLogging(signalR.LogLevel.Information)
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

  private restartGracePeriod() {
    if (this.silenceGraceTimeout) {
      clearTimeout(this.silenceGraceTimeout);
    }

    this.silenceGraceTimeout = setTimeout(() => {
      this.isCountdownRunning = true;
      this.onStartCountdown(SILENCE_TIMEOUT_MS - SILENCE_GRACE_PERIOD);
    }, SILENCE_GRACE_PERIOD);
  }

  private resetSilenceTimer() {
    this.clearSilenceTimer();
    this.silenceTimeout = setTimeout(() => {
      this.isAutoFinished = true;
      this.stop();
    }, SILENCE_TIMEOUT_MS);
  }

  private clearSilenceTimer() {
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
  }
}
