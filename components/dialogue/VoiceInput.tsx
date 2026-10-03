'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recog = new (SpeechRecognition as any)();
        recog.continuous = true;
        recog.interimResults = false;
        recog.lang = 'zh-CN';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recog.onresult = (event: any) => {
          const results = event.results;
          if (results && results.length > 0) {
            const transcript = results[results.length - 1][0].transcript;
            if (transcript) {
              onTranscript(transcript);
            }
          }
        };

        recog.onerror = () => {
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('您的浏览器暂未开放语音输入接口，请直接使用键盘输入。');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recog = recognitionRef.current as any;
    if (!recog) return;

    if (isListening) {
      recog.stop();
      setIsListening(false);
    } else {
      try {
        recog.start();
        setIsListening(true);
      } catch (err) {
        console.warn('语音录音启动异常:', err);
      }
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
        isListening
          ? 'bg-[#C84630] text-white border-[#8C2919] animate-pulse'
          : 'bg-[#FAF7EE] hover:bg-[#F3ECE0] text-[#7A583E] border-[#D9CDB8]'
      } ${className}`}
      title={isListening ? '点击停止语音输入' : '点击开启语音倾诉'}
    >
      {isListening ? (
        <>
          <MicOff className="w-4 h-4" />
          <span className="text-[11px] font-bold">正在聆听...</span>
        </>
      ) : (
        <>
          <Mic className="w-4 h-4" />
          <span className="text-[11px]">语音输入</span>
        </>
      )}
    </button>
  );
};
