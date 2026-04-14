"use client";

import { useRef, useState, useCallback } from "react";
import {
  formatCameraError,
  getCameraVideoStream,
} from "@/utils/get-camera-stream";

const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000";

interface DetectionResult {
  face_shape: string;
  confidence: number;
  recommendation: string;
  all_predictions: Record<string, number>;
}

interface FaceDetectorProps {
  onDetected?: (result: DetectionResult) => void;
}

export default function FaceDetector({ onDetected }: FaceDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    setResult(null);
    setError(null);
    setCameraReady(false);
    try {
      const stream = await getCameraVideoStream();
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        setError("Camera preview failed. Please reload and try again.");
        return;
      }
      streamRef.current = stream;
      video.srcObject = stream;

      const runPreview = async (): Promise<void> => {
        try {
          await video.play();
          setCameraReady(true);
          setIsOpen(true);
        } catch {
          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          video.srcObject = null;
          setError(
            "Could not play the camera. Allow permission when prompted, or try another browser.",
          );
        }
      };

      if (video.readyState >= 2) {
        await runPreview();
      } else {
        video.onloadedmetadata = () => {
          video.onloadedmetadata = null;
          void runPreview();
        };
      }
    } catch (unknownError: unknown) {
      setError(formatCameraError(unknownError));
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsOpen(false);
    setCameraReady(false);
    setResult(null);
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      try {
        const response = await fetch(`${AI_URL}/detect-face-shape`, {
          method: "POST",
          body: formData,
        });

        if (response.status === 422) {
          const errData = await response.json();
          setError(errData.detail || "No face detected. Please position your face clearly in the camera.");
        } else if (!response.ok) {
          setError(`AI service error (${response.status}). Is it running at ${AI_URL}?`);
        } else {
          const data: DetectionResult = await response.json();
          setResult(data);
          onDetected?.(data);
        }
      } catch {
        setError(
          `Could not reach the AI at ${AI_URL}. Start docker compose ai-service or set NEXT_PUBLIC_AI_URL.`,
        );
      } finally {
        setIsLoading(false);
      }
    }, "image/jpeg");
  }, [onDetected]);

  return (
    <div>
      {!isOpen && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 max-w-lg">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
        </div>
      )}
      {!isOpen && (
        <button
          type="button"
          onClick={startCamera}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
        >
          🔍 Detect My Face Shape
        </button>
      )}

      <div
        className={
          isOpen
            ? "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            : "fixed -left-[9999px] top-0 z-0 w-[min(100vw,800px)] h-[min(100vh,720px)] max-w-full overflow-hidden pointer-events-none opacity-0"
        }
        aria-hidden={!isOpen}
      >
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-screen overflow-y-auto">
          {isOpen && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Face Shape Detection</h2>
              <button
                type="button"
                onClick={stopCamera}
                className="text-gray-500 hover:text-black text-2xl leading-none"
              >
                ✕
              </button>
            </div>
          )}

          {isOpen && (
            <p className="text-xs text-gray-400 mb-3 text-center">
              💡 Face the camera directly with good lighting for best results
            </p>
          )}

          <div className="relative rounded-xl overflow-hidden bg-gray-900 mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-xl"
              style={{ transform: "scaleX(-1)" }}
            />
            {isOpen && !cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                Starting camera...
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {isOpen && (
            <button
              type="button"
              onClick={captureAndDetect}
              disabled={!cameraReady || isLoading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition mb-4"
            >
              {isLoading ? "Analyzing..." : "📸 Capture & Detect"}
            </button>
          )}

          {isOpen && error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-600 font-semibold text-sm mb-1">⚠️ Detection Failed</p>
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
                <button type="button" onClick={clearResult} className="text-red-300 hover:text-red-600 text-lg ml-2">✕</button>
              </div>
            </div>
          )}

          {isOpen && result && (
            <div className="bg-gray-50 rounded-xl p-4 relative">
              <button
                type="button"
                onClick={clearResult}
                className="absolute top-3 right-3 text-gray-400 hover:text-black text-lg leading-none"
              >
                ✕
              </button>
              <p className="text-sm text-gray-500 mb-1">Detected Face Shape</p>
              <p className="text-3xl font-bold text-black mb-1">
                {result.face_shape}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                {result.confidence}% confidence
              </p>
              <p className="text-sm text-gray-600">
                {result.recommendation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
