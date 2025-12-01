export class LocalSpeechRecognizer {
  private recognition: any;
  private finalTranscript: string = "";
  private isListening: boolean = false;
  private onResultCallback: ((text: string) => void) | null = null;

  constructor() {
    // Check for browser support (Chrome/Edge/Safari/Firefox)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'ru-RU'; // Russian language
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  start(onResult: (text: string) => void) {
    if (!this.recognition) return;
    
    this.finalTranscript = "";
    this.isListening = true;
    this.onResultCallback = onResult;
    
    this.recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (this.onResultCallback) {
        this.onResultCallback(this.finalTranscript + interim);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Local Speech Error", event.error);
      // Don't stop explicitly on no-speech, let user stop
    };

    try {
        this.recognition.start();
    } catch(e) {
        console.error("Failed to start recognition", e);
    }
  }

  stop(): Promise<string> {
    return new Promise((resolve) => {
        if (!this.recognition || !this.isListening) {
            resolve(this.finalTranscript.trim());
            return;
        }
        
        this.isListening = false;
        
        // Define onend handler to resolve promise once engine actually stops
        this.recognition.onend = () => {
            resolve(this.finalTranscript.trim());
        };
        
        this.recognition.stop();
    });
  }
}