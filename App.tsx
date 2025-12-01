import React, { useState, useEffect, useRef } from 'react';
import { TimerStatus, Task } from './types';
import { PixelCard, PixelButton, PixelInput } from './components/PixelComponents';
import { FoxMascot, MiniFoxIcon } from './components/FoxMascot';
import { AudioRecorder } from './services/audioService';
import { LocalSpeechRecognizer } from './services/localSpeechService';
import { transcribeAudio } from './services/geminiService';
import { Mic, Pause, Play, Square, Save, Clock, ChevronDown, ChevronUp, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  // Timer State
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.IDLE);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTaskName, setCurrentTaskName] = useState("");
  const timerIntervalRef = useRef<number | null>(null);

  // Data State
  const [history, setHistory] = useState<Task[]>([]);
  const [currentComments, setCurrentComments] = useState<string[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'cloud' | 'local'>('cloud');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const audioRecorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const localSpeechRef = useRef<LocalSpeechRecognizer>(new LocalSpeechRecognizer());

  // Connection Listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Timer Logic
  useEffect(() => {
    if (status === TimerStatus.RUNNING) {
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!currentTaskName.trim()) {
      alert("Назовите задачу!");
      return;
    }
    setStatus(TimerStatus.RUNNING);
  };

  const handlePause = () => setStatus(TimerStatus.PAUSED);
  const handleResume = () => setStatus(TimerStatus.RUNNING);

  const handleStop = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: currentTaskName,
      startTime: Date.now() - (elapsedTime * 1000),
      endTime: Date.now(),
      duration: elapsedTime,
      comments: currentComments
    };

    setHistory(prev => [newTask, ...prev]);
    
    // Reset
    setStatus(TimerStatus.IDLE);
    setElapsedTime(0);
    setCurrentTaskName("");
    setCurrentComments([]);
    setCommentInput("");
  };

  // Comment Logic
  const addTextComment = (text: string) => {
    if (text.trim()) {
      setCurrentComments(prev => [...prev, text.trim()]);
    }
  };

  const handleManualComment = () => {
    addTextComment(commentInput);
    setCommentInput("");
  };

  const startRecording = async () => {
    // Decide mode based on connectivity and support
    const mode = isOnline ? 'cloud' : 'local';
    
    // Fallback if local speech isn't supported in browser, force cloud (or warn)
    if (mode === 'local' && !localSpeechRef.current.isSupported()) {
        alert("Оффлайн режим не поддерживается вашим браузером. Подключитесь к интернету.");
        return;
    }

    setRecordingMode(mode);
    setIsRecording(true);

    try {
      if (mode === 'cloud') {
        await audioRecorderRef.current.start();
      } else {
        // Local mode
        localSpeechRef.current.start((text) => {
            // Optional: Live preview logic could go here
        });
      }
    } catch (e) {
      alert("Ошибка доступа к микрофону.");
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsTranscribing(true);

      if (recordingMode === 'cloud') {
          const audioBlob = await audioRecorderRef.current.stop();
          const text = await transcribeAudio(audioBlob);
          if (text) addTextComment(`☁️ ${text}`);
      } else {
          const text = await localSpeechRef.current.stop();
          if (text) addTextComment(`🏠 ${text}`);
          else alert("Речь не распознана (Тишина?)");
      }

    } catch (error) {
      console.error(error);
      // If cloud fails, suggestion to use local next time?
      if (recordingMode === 'cloud') {
          alert("Ошибка сервера. Попробуйте оффлайн режим (отключите интернет или используйте другой браузер).");
      } else {
          alert("Ошибка распознавания.");
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="h-screen bg-yellow-50 p-2 flex flex-col items-center gap-4 max-w-[380px] mx-auto overflow-hidden">
      
      {/* Compact Header */}
      <header className="flex items-center gap-3 mt-2 shrink-0">
        <div className="scale-75 origin-left">
             <FoxMascot mood={status === TimerStatus.RUNNING ? 'focused' : 'happy'} />
        </div>
        <div>
          <h1 className="text-xl font-pixel text-fox-700 tracking-tighter leading-none">
            FOX<span className="text-black">FOCUS</span>
          </h1>
          <div className="flex items-center gap-2">
            <p className="font-pixel text-[8px] text-gray-500">Pixel Tracker</p>
            {isOnline ? 
                <div title="Online: Gemini AI Ready"><Wifi size={10} className="text-green-500" /></div> : 
                <div title="Offline: Using Local Speech API"><WifiOff size={10} className="text-red-500" /></div>
            }
          </div>
        </div>
      </header>

      {/* Main Timer Card */}
      <PixelCard className="w-full text-center py-4 shrink-0" title="Task" compact>
        {status === TimerStatus.IDLE ? (
           <div className="flex flex-col gap-3">
             <PixelInput 
                placeholder="Название задачи..." 
                value={currentTaskName}
                onChange={(e) => setCurrentTaskName(e.target.value)}
                autoFocus
             />
             <PixelButton onClick={handleStart} className="w-full flex items-center justify-center">
                  <MiniFoxIcon /> НАЧАТЬ
             </PixelButton>
           </div>
        ) : (
          <div className="flex flex-col items-center">
            <h2 className="font-pixel text-sm mb-2 text-fox-900 break-words w-full truncate">
              {currentTaskName}
            </h2>
            
            {/* Digital Clock */}
            <div className="bg-black text-green-500 font-digit text-6xl p-2 rounded-sm border-4 border-gray-600 shadow-inner mb-4 w-full tracking-widest">
              {formatTime(elapsedTime)}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {status === TimerStatus.RUNNING ? (
                <PixelButton onClick={handlePause} variant="secondary">
                  <Pause size={14} className="inline mr-1" /> ПАУЗА
                </PixelButton>
              ) : (
                <PixelButton onClick={handleResume} variant="success">
                  <Play size={14} className="inline mr-1" /> ПУСК
                </PixelButton>
              )}
              
              <PixelButton onClick={handleStop} variant="danger">
                <Square size={14} className="inline mr-1" /> СТОП
              </PixelButton>
            </div>
          </div>
        )}
      </PixelCard>

      {/* Comments Section */}
      {status !== TimerStatus.IDLE && (
        <PixelCard className="w-full flex-1 min-h-0 flex flex-col" title="Logs" compact>
          <div className="flex flex-col gap-2 h-full">
             <div className="flex gap-1 shrink-0">
               <PixelInput 
                  placeholder="Заметка..." 
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualComment()}
                  className="py-1"
               />
               <PixelButton onClick={handleManualComment} variant="secondary" className="px-2">
                 <Save size={14} />
               </PixelButton>
             </div>
             
             <div className="shrink-0">
                {!isRecording ? (
                  <PixelButton 
                    onClick={startRecording} 
                    variant="primary" 
                    className="w-full flex items-center justify-center gap-2"
                    disabled={isTranscribing}
                  >
                    <Mic size={14} /> 
                    {isTranscribing ? "..." : (isOnline ? "ГОЛОС (ОНЛАЙН)" : "ГОЛОС (ЛОКАЛЬНО)")}
                  </PixelButton>
                ) : (
                  <PixelButton 
                    onClick={stopRecording} 
                    variant="danger" 
                    className="w-full animate-pulse flex items-center justify-center gap-2"
                  >
                    <Square size={14} /> СТОП ({recordingMode === 'cloud' ? 'AI' : 'LOCAL'})
                  </PixelButton>
                )}
             </div>

             {/* Comments List (Scrollable) */}
             <div className="bg-yellow-100 border-2 border-black p-2 mt-1 overflow-y-auto font-pixel text-[10px] leading-relaxed shadow-inner flex-1 min-h-0">
               {currentComments.length === 0 && <span className="text-gray-400 italic">Нет заметок...</span>}
               {currentComments.map((c, i) => (
                 <div key={i} className="bg-white p-1 mb-1 border border-dashed border-gray-400 break-words flex items-start">
                   <span className="mr-1 mt-0.5"><MiniFoxIcon /></span>
                   <span>{c}</span>
                 </div>
               ))}
             </div>
          </div>
        </PixelCard>
      )}

      {/* Collapsible History */}
      <div className="w-full shrink-0 mt-auto bg-white border-2 border-black shadow-pixel">
        <button 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="w-full flex items-center justify-between p-2 bg-gray-100 hover:bg-gray-200 font-pixel text-xs"
        >
          <div className="flex items-center">
            <Clock size={14} className="mr-2"/> History ({history.length})
          </div>
          {isHistoryOpen ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
        </button>
        
        {isHistoryOpen && (
           <div className="max-h-48 overflow-y-auto p-2 bg-gray-50 border-t-2 border-black space-y-2">
             {history.length === 0 && <p className="text-center font-pixel text-[10px] text-gray-400 py-2">Пусто</p>}
             {history.map(task => (
               <div key={task.id} className="bg-white border border-gray-300 p-2 shadow-sm">
                 <div className="flex justify-between items-start mb-1">
                    <div className="overflow-hidden">
                      <h4 className="font-pixel text-[10px] font-bold text-fox-900 truncate">{task.name}</h4>
                      <span className="font-digit text-gray-500 text-xs">{new Date(task.endTime).toLocaleTimeString()}</span>
                    </div>
                    <div className="bg-black text-green-500 font-digit px-1 text-sm whitespace-nowrap ml-2">
                      {formatTime(task.duration)}
                    </div>
                 </div>
                 {task.comments.length > 0 && (
                   <div className="mt-1 space-y-1 pl-1 border-l-2 border-fox-200">
                     {task.comments.map((c, idx) => (
                       <p key={idx} className="text-[9px] font-mono text-gray-600 leading-tight">
                         - {c}
                       </p>
                     ))}
                   </div>
                 )}
               </div>
             ))}
           </div>
        )}
      </div>

    </div>
  );
}