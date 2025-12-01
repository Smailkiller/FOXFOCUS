export interface Task {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  comments: string[];
}

export enum TimerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
}

export interface AudioRecording {
  blob: Blob;
  url: string;
}
