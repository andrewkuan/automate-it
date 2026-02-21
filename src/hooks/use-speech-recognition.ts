import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startListening = useCallback(
    (currentText: string, onUpdate: (text: string) => void) => {
      if (isListening) return;

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: "audio/webm;codecs=opus",
          });

          chunksRef.current = [];

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunksRef.current.push(e.data);
            }
          };

          mediaRecorder.onstop = async () => {
            // Stop all tracks to release mic
            stream.getTracks().forEach((t) => t.stop());

            const audioBlob = new Blob(chunksRef.current, {
              type: "audio/webm",
            });

            if (audioBlob.size < 100) {
              toast.error("No audio captured. Please try again.");
              return;
            }

            setIsProcessing(true);

            try {
              const { data, error } = await supabase.functions.invoke(
                "transcribe-audio",
                {
                  body: audioBlob,
                  headers: { "Content-Type": "audio/webm" },
                }
              );

              if (error) throw error;

              const transcript = data?.transcript;
              if (transcript) {
                const combined = currentText
                  ? `${currentText} ${transcript}`.trim()
                  : transcript;
                onUpdate(combined);
              } else {
                toast.error("No speech detected. Please try again.");
              }
            } catch (err) {
              console.error("Transcription error:", err);
              toast.error("Failed to transcribe audio.");
            } finally {
              setIsProcessing(false);
            }
          };

          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start();
          setIsListening(true);
        })
        .catch((err) => {
          console.error("Microphone access error:", err);
          toast.error(
            "Microphone access denied. Please allow microphone access."
          );
        });
    },
    [isListening]
  );

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    isProcessing,
    isSupported: typeof navigator !== "undefined" && !!navigator.mediaDevices,
    startListening,
    stopListening,
  };
};
