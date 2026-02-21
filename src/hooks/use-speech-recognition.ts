import { useState, useEffect, useRef, useCallback } from "react";

interface UseSpeechRecognitionOptions {
  onTranscript: (text: string) => void;
  initialText?: string;
}

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const accumulatedRef = useRef("");
  const supported = useRef(
    typeof window !== "undefined" &&
      !!(
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      )
  );

  const createRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    return recognition;
  }, []);

  const startListening = useCallback(
    (
      currentText: string,
      onUpdate: (text: string) => void
    ) => {
      if (!supported.current) return false;

      // Stop existing
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }

      accumulatedRef.current = currentText;

      const recognition = createRecognition();
      let lastFinalIndex = 0;

      recognition.onresult = (event: any) => {
        let interim = "";

        // Process only new final results
        for (let i = lastFinalIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            accumulatedRef.current = (accumulatedRef.current + " " + result[0].transcript).trim();
            lastFinalIndex = i + 1;
          } else {
            interim += result[0].transcript;
          }
        }

        const display = (accumulatedRef.current + (interim ? " " + interim : "")).trim();
        onUpdate(display);
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          lastFinalIndex = 0; // reset — event.results resets on new start()
          setTimeout(() => {
            if (isListeningRef.current) {
              try {
                recognition.start();
              } catch {}
            }
          }, 200);
        } else {
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("SpeechRecognition error:", event.error, event.message || "");
        if (event.error === "not-allowed" || event.error === "denied") {
          isListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      isListeningRef.current = true;
      setIsListening(true);

      try {
        recognition.start();
        console.log("SpeechRecognition started successfully");
        return true;
      } catch (e) {
        console.error("Failed to start recognition:", e);
        isListeningRef.current = false;
        setIsListening(false);
        return false;
      }
    },
    [createRecognition]
  );

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, []);

  return {
    isListening,
    isSupported: supported.current,
    startListening,
    stopListening,
  };
};
