import { useState, useEffect, useRef, useCallback } from "react";

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const accumulatedRef = useRef("");
  const supported = useRef(
    typeof window !== "undefined" &&
      !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  );

  const startListening = useCallback(
    (currentText: string, onUpdate: (text: string) => void) => {
      if (!supported.current) return false;

      // Stop any existing instance
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognition();
      recognition.continuous = false; // single utterance — avoids network errors on restart
      recognition.interimResults = true;
      recognition.lang = "en-US";

      accumulatedRef.current = currentText;

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            accumulatedRef.current = (accumulatedRef.current + " " + result[0].transcript).trim();
          } else {
            interim += result[0].transcript;
          }
        }
        onUpdate((accumulatedRef.current + (interim ? " " + interim : "")).trim());
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
        // Ensure final accumulated text is set
        onUpdate(accumulatedRef.current);
      };

      recognition.onerror = (event: any) => {
        console.error("SpeechRecognition error:", event.error);
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
        setIsListening(true);
        return true;
      } catch (e) {
        console.error("Failed to start recognition:", e);
        setIsListening(false);
        return false;
      }
    },
    []
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.abort(); } catch {}
    };
  }, []);

  return { isListening, isSupported: supported.current, startListening, stopListening };
};
