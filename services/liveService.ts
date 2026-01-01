
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export class LiveService {
  private client: GoogleGenAI | null = null;
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private audioStream: MediaStream | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  
  constructor() {
    // Initialized in connect to ensure latest API key
  }

  /* Fix: Updated signature to handle additional callbacks used by CameraCapture (satisfies the 'Expected 3-4 arguments, but got 6' error) */
  async connect(
    onOpen: () => void, 
    onClose: () => void, 
    onError: (e: any) => void,
    onVolume?: (level: number) => void,
    onTranscription?: (text: string) => void,
    onLabels?: (labels: string[]) => void
  ) {
    /* Guideline: Always create a new GoogleGenAI instance right before making an API call to use the latest API key */
    this.client = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    try {
        this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
        onError(e);
        return;
    }

    this.sessionPromise = this.client.live.connect({
      model: MODEL_NAME,
      callbacks: {
        onopen: () => {
          this.startAudioStreaming(onVolume);
          onOpen();
        },
        onmessage: async (message: LiveServerMessage) => {
          this.handleAudioOutput(message);
          /* Correctly handle transcriptions and optional labels callback */
          if (message.serverContent?.outputTranscription) {
            const text = message.serverContent.outputTranscription.text;
            if (text) {
              onTranscription?.(text);
              /* If UI expects labels, provide segments of text for visual feedback */
              if (onLabels) {
                const words = text.split(' ').filter(w => w.length > 3);
                if (words.length > 0) onLabels(words);
              }
            }
          }
        },
        onclose: () => onClose(),
        onerror: (e: any) => onError(e)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: "You are the Quest Lens Assistant. Help the user discover objects. Be friendly and helpful.",
      }
    });
  }

  private startAudioStreaming(onVolume?: (level: number) => void) {
    if (!this.inputAudioContext || !this.audioStream || !this.sessionPromise) return;

    const source = this.inputAudioContext.createMediaStreamSource(this.audioStream);
    const processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      if (onVolume) {
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
          onVolume(Math.sqrt(sum / inputData.length));
      }

      const pcmBlob = this.createPcmBlob(inputData);
      /* Guideline: Use the session promise (sessionPromise.then(...)) to ensure we are referencing the resolved session */
      this.sessionPromise?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    source.connect(processor);
    processor.connect(this.inputAudioContext.destination);
  }

  async sendVideoFrame(base64Image: string) {
    const data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    /* Guideline: Initiate sendRealtimeInput only after live.connect call resolves */
    this.sessionPromise?.then((session) => {
      session.sendRealtimeInput({ media: { mimeType: 'image/jpeg', data } });
    });
  }

  private async handleAudioOutput(message: LiveServerMessage) {
    const data = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (data && this.outputAudioContext) {
        const audioBuffer = await this.decodeAudioStream(data);
        /* Guideline: Track playback end time using nextStartTime to ensure smooth playback */
        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputAudioContext.destination);
        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        this.sources.add(source);
    }

    if (message.serverContent?.interrupted) {
      this.sources.forEach(s => { try { s.stop(); } catch(e) {} });
      this.sources.clear();
      this.nextStartTime = 0;
    }
  }

  private createPcmBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private async decodeAudioStream(base64: string): Promise<AudioBuffer> {
    if (!this.outputAudioContext) throw new Error("Context missing");
    const bytes = decode(base64);
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = this.outputAudioContext.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  }

  disconnect() {
    this.sessionPromise?.then(s => s.close());
    this.audioStream?.getTracks().forEach(t => t.stop());
    this.sessionPromise = null;
  }
}
