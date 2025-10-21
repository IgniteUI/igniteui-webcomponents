export interface ISttClient {
  /** Start recording and transcribing */
  start(language?: string): Promise<void>;

  /** Stop recording/transcribing */
  stop(): void;

  /** Whether recording is currently active */
  readonly isRecording: boolean;

  /** Signal emitted when audio activity is detected */
  readonly onPulseSignal: () => void;

  /** Called when the countdown should start or stop (pass null to stop) */
  readonly onStartCountdown: (ms: number | null) => void;

  /** Called when a partial or final transcript is produced */
  readonly onTranscript: (text: string) => void;

  /** Called when stop is in progress (manual or automatic) */
  readonly onStopInProgress: () => void;

  /** Called when transcription fully finishes */
  readonly onFinishedTranscribing: (finish: 'auto' | 'manual') => void;
}

export abstract class BaseSttClient implements ISttClient {
  protected static readonly SILENCE_TIMEOUT_MS = 4000;
  protected static readonly SILENCE_GRACE_PERIOD = 1000;

  protected silenceTimeout: any = null;
  protected silenceGraceTimeout: any = null;
  protected isCountdownRunning = false;
  protected isAutoFinished = false;

  isRecording = false;

  constructor(
    public onPulseSignal: () => void,
    public onStartCountdown: (ms: number | null) => void,
    public onTranscript: (text: string) => void,
    public onStopInProgress: () => void,
    public onFinishedTranscribing: (finish: 'auto' | 'manual') => void
  ) {}

  abstract start(language?: string): Promise<void>;
  abstract stop(): void;

  /** Clears the silence timeout */
  protected clearSilenceTimer() {
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
  }

  /** Resets silence timer and auto-stop trigger */
  protected resetSilenceTimer() {
    this.clearSilenceTimer();
    this.silenceTimeout = setTimeout(() => {
      this.isAutoFinished = true;
      this.stop();
    }, BaseSttClient.SILENCE_TIMEOUT_MS);
  }

  /** Restarts grace period before countdown starts */
  protected restartGracePeriod() {
    if (this.silenceGraceTimeout) {
      clearTimeout(this.silenceGraceTimeout);
    }

    this.silenceGraceTimeout = setTimeout(() => {
      this.isCountdownRunning = true;
      this.onStartCountdown(
        BaseSttClient.SILENCE_TIMEOUT_MS - BaseSttClient.SILENCE_GRACE_PERIOD
      );
    }, BaseSttClient.SILENCE_GRACE_PERIOD);
  }
}
