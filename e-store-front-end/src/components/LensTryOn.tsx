"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  formatCameraError,
  getCameraVideoStream,
} from "@/utils/get-camera-stream";
import { useTryOnCapture } from "@/hooks/useTryOnCapture";

const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000";

interface IrisOverlay {
  left_iris:  { center_x: number; center_y: number; radius: number; upper_lid_y: number; lower_lid_y: number };
  right_iris: { center_x: number; center_y: number; radius: number; upper_lid_y: number; lower_lid_y: number };
  image_width:  number;
  image_height: number;
}

interface LensTryOnProps {
  lensColor:      string;         // hex fallback color
  lensColorName:  string;
  productName:    string;
  lensImageUrl?:  string | null;  // PNG overlay URL — if set, used instead of solid color
  autoOpen?:      boolean;
  onColorChange?: (hex: string, name: string) => void;
  colorSwatches?: Array<{ hex: string; name: string; imageUrl?: string | null }>;
  onClose?:       () => void;
}

export default function LensTryOn({
  lensColor,
  lensColorName,
  productName,
  lensImageUrl,
  autoOpen = false,
  onColorChange,
  colorSwatches = [],
  onClose,
}: LensTryOnProps) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const animRef     = useRef<number | null>(null);
  const overlayRef  = useRef<IrisOverlay | null>(null);
  const trackingRef = useRef<boolean>(false);
  // Preloaded lens PNG image element
  const lensPngRef  = useRef<HTMLImageElement | null>(null);
  const lensPngReadyRef = useRef<boolean>(false);

  const smoothLeftRef  = useRef<{ x: number; y: number; r: number; upperLidY: number; lowerLidY: number } | null>(null);
  const smoothRightRef = useRef<{ x: number; y: number; r: number; upperLidY: number; lowerLidY: number } | null>(null);

  const [isOpen,      setIsOpen]      = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isTracking,  setIsTracking]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const { capture, isCapturing, captureError } = useTryOnCapture(canvasRef);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // ── Preload lens PNG when URL changes ─────────────────────────────────────
  useEffect(() => {
    if (!lensImageUrl) {
      lensPngRef.current      = null;
      lensPngReadyRef.current = false;
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      lensPngRef.current      = img;
      lensPngReadyRef.current = true;
    };
    img.onerror = () => {
      lensPngRef.current      = null;
      lensPngReadyRef.current = false;
    };
    img.src = lensImageUrl;
  }, [lensImageUrl]);

  // ── FULLY STOP CAMERA ─────────────────────────────────────────────────────
  const fullStop = useCallback(() => {
    trackingRef.current    = false;
    setIsTracking(false);
    overlayRef.current     = null;
    smoothLeftRef.current  = null;
    smoothRightRef.current = null;

    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (videoRef.current) { videoRef.current.srcObject = null; videoRef.current.onloadedmetadata = null; }

    setIsOpen(false);
    setCameraReady(false);
    setError(null);
  }, []);

  // ── Draw lens PNG on one eye ───────────────────────────────────────────────
  const drawLensPng = useCallback((
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number, radius: number,
    upperLidY: number, lowerLidY: number,
  ) => {
    const img = lensPngRef.current;
    if (!img || !lensPngReadyRef.current) return;

    ctx.save();

    const lidTop    = isFinite(upperLidY) ? upperLidY : cy - radius;
    const lidBottom = isFinite(lowerLidY) ? lowerLidY : cy + radius;

    // Clip to eyelid opening
    ctx.beginPath();
    ctx.rect(cx - radius - 2, lidTop, (radius + 2) * 2, Math.max(1, lidBottom - lidTop));
    ctx.clip();

    // Clip to iris circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Draw the PNG centered and scaled to fit the iris circle
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.45;
    const d = radius * 2;
    ctx.drawImage(img, cx - radius, cy - radius, d, d);

    ctx.restore();
  }, []);

  // ── Draw solid color gradient fallback on one eye ─────────────────────────
  const drawLensCircle = useCallback((
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number, radius: number,
    upperLidY: number, lowerLidY: number,
    hexColor: string,
  ) => {
    if (radius <= 0 || !isFinite(radius) || !isFinite(cx) || !isFinite(cy)) return;

    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    ctx.save();

    const lidTop    = isFinite(upperLidY) ? upperLidY : cy - radius;
    const lidBottom = isFinite(lowerLidY) ? lowerLidY : cy + radius;

    ctx.beginPath();
    ctx.rect(cx - radius - 2, lidTop, (radius + 2) * 2, Math.max(1, lidBottom - lidTop));
    ctx.clip();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0,    `rgba(${r},${g},${b},0)`);
    gradient.addColorStop(0.08, `rgba(${r},${g},${b},0)`);
    gradient.addColorStop(0.15, `rgba(${r},${g},${b},0.75)`);
    gradient.addColorStop(0.55, `rgba(${r},${g},${b},0.85)`);
    gradient.addColorStop(0.88, `rgba(${r},${g},${b},0.65)`);
    gradient.addColorStop(1,    `rgba(0,0,0,0.35)`);

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.97, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,0,0,0.5)`;
    ctx.lineWidth = Math.max(1, radius * 0.05);
    ctx.stroke();

    ctx.restore();
  }, []);

  // ── DRAW LOOP ─────────────────────────────────────────────────────────────
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;

    if (!canvas || !video || video.readyState < 2) {
      animRef.current = requestAnimationFrame(drawFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width  = video.videoWidth  || 640;
      canvas.height = video.videoHeight || 480;
    }

    // Draw mirrored video
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.restore();

    const ov = overlayRef.current;
    if (ov) {
      const scaleX = canvas.width  / ov.image_width;
      const scaleY = canvas.height / ov.image_height;

      const rawL = {
        x:         (ov.image_width - ov.left_iris.center_x)  * scaleX,
        y:         ov.left_iris.center_y    * scaleY,
        r:         ov.left_iris.radius      * ((scaleX + scaleY) / 2),
        upperLidY: ov.left_iris.upper_lid_y * scaleY,
        lowerLidY: ov.left_iris.lower_lid_y * scaleY,
      };
      const rawR = {
        x:         (ov.image_width - ov.right_iris.center_x) * scaleX,
        y:         ov.right_iris.center_y    * scaleY,
        r:         ov.right_iris.radius      * ((scaleX + scaleY) / 2),
        upperLidY: ov.right_iris.upper_lid_y * scaleY,
        lowerLidY: ov.right_iris.lower_lid_y * scaleY,
      };

      const SMOOTH = 0.6;

      smoothLeftRef.current = !smoothLeftRef.current ? { ...rawL } : {
        x:         lerp(smoothLeftRef.current.x,         rawL.x,         SMOOTH),
        y:         lerp(smoothLeftRef.current.y,         rawL.y,         SMOOTH),
        r:         lerp(smoothLeftRef.current.r,         rawL.r,         SMOOTH),
        upperLidY: lerp(smoothLeftRef.current.upperLidY, rawL.upperLidY, SMOOTH),
        lowerLidY: lerp(smoothLeftRef.current.lowerLidY, rawL.lowerLidY, SMOOTH),
      };
      smoothRightRef.current = !smoothRightRef.current ? { ...rawR } : {
        x:         lerp(smoothRightRef.current.x,         rawR.x,         SMOOTH),
        y:         lerp(smoothRightRef.current.y,         rawR.y,         SMOOTH),
        r:         lerp(smoothRightRef.current.r,         rawR.r,         SMOOTH),
        upperLidY: lerp(smoothRightRef.current.upperLidY, rawR.upperLidY, SMOOTH),
        lowerLidY: lerp(smoothRightRef.current.lowerLidY, rawR.lowerLidY, SMOOTH),
      };

      const sl = smoothLeftRef.current;
      const sr = smoothRightRef.current;
      const irisScale = 0.70;

      if (sl.r > 2) {
        if (lensPngReadyRef.current) {
          drawLensPng(ctx, sl.x, sl.y, sl.r * irisScale, sl.upperLidY, sl.lowerLidY);
        } else {
          drawLensCircle(ctx, sl.x, sl.y, sl.r * irisScale, sl.upperLidY, sl.lowerLidY, lensColor);
        }
      }
      if (sr.r > 2) {
        if (lensPngReadyRef.current) {
          drawLensPng(ctx, sr.x, sr.y, sr.r * irisScale, sr.upperLidY, sr.lowerLidY);
        } else {
          drawLensCircle(ctx, sr.x, sr.y, sr.r * irisScale, sr.upperLidY, sr.lowerLidY, lensColor);
        }
      }
    }

    animRef.current = requestAnimationFrame(drawFrame);
  }, [lensColor, drawLensPng, drawLensCircle]);

  // ── TRACKING LOOP ─────────────────────────────────────────────────────────
  const startTracking = useCallback(() => {
    if (trackingRef.current) return;
    trackingRef.current = true;
    setIsTracking(true);

    const track = async () => {
      if (!trackingRef.current) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) { setTimeout(track, 300); return; }

      const tmp = document.createElement("canvas");
      tmp.width  = video.videoWidth;
      tmp.height = video.videoHeight;
      const ctx  = tmp.getContext("2d");
      if (!ctx) { setTimeout(track, 300); return; }
      ctx.drawImage(video, 0, 0, tmp.width, tmp.height);

      tmp.toBlob(async (blob) => {
        if (!blob || !trackingRef.current) return;
        const fd = new FormData();
        fd.append("file", blob, "frame.jpg");
        try {
          const res = await fetch(`${AI_URL}/detect-iris`, { method: "POST", body: fd });
          if (res.ok) {
            const data = await res.json();
            overlayRef.current = {
              left_iris:  {
                center_x:    data.left_iris.center_x,
                center_y:    data.left_iris.center_y,
                radius:      data.left_iris.radius,
                upper_lid_y: data.left_iris.upper_lid_y,
                lower_lid_y: data.left_iris.lower_lid_y,
              },
              right_iris: {
                center_x:    data.right_iris.center_x,
                center_y:    data.right_iris.center_y,
                radius:      data.right_iris.radius,
                upper_lid_y: data.right_iris.upper_lid_y,
                lower_lid_y: data.right_iris.lower_lid_y,
              },
              image_width:  video.videoWidth,
              image_height: video.videoHeight,
            };
          }
        } catch { /**/ }
        if (trackingRef.current) setTimeout(track, 80);
      }, "image/jpeg", 0.7);
    };

    track();
  }, []);

  const drawFrameRef      = useRef(drawFrame);     drawFrameRef.current      = drawFrame;
  const startTrackingRef  = useRef(startTracking); startTrackingRef.current  = startTracking;

  const startCamera = useCallback(async () => {
    setError(null);
    setCameraReady(false);
    try {
      const stream = await getCameraVideoStream();
      const video  = videoRef.current;
      if (!video) { stream.getTracks().forEach((t) => t.stop()); setError("Camera preview failed."); return; }
      streamRef.current = stream;
      video.srcObject   = stream;

      const runPreview = async (): Promise<void> => {
        try {
          await video.play();
          setCameraReady(true);
          setIsOpen(true);
          animRef.current = requestAnimationFrame(drawFrameRef.current);
          setTimeout(() => startTrackingRef.current(), 300);
        } catch {
          stream.getTracks().forEach((t) => t.stop());
          streamRef.current = null; video.srcObject = null;
          setError("Could not start the camera.");
        }
      };

      video.readyState >= 2 ? await runPreview() : (video.onloadedmetadata = () => { video.onloadedmetadata = null; void runPreview(); });
    } catch (e: unknown) { setError(formatCameraError(e)); }
  }, []);

  const handleClose = useCallback(() => { fullStop(); onClose?.(); }, [fullStop, onClose]);

  useEffect(() => { if (autoOpen && !isOpen) { startCamera(); } }, [autoOpen]); // eslint-disable-line
  useEffect(() => { return () => { fullStop(); }; }, [fullStop]);

  return (
    <div>
      {!isOpen && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
        </div>
      )}

      {!isOpen && !autoOpen && (
        <button type="button" onClick={startCamera}
          className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium">
          👁️ Try On Lenses
        </button>
      )}

      <div className={isOpen
        ? "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        : "fixed -left-[9999px] top-0 z-0 pointer-events-none opacity-0"}
        aria-hidden={!isOpen}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-screen overflow-y-auto">

          {isOpen && (
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-xl font-bold">Lens Try-On</h2>
                <p className="text-xs text-gray-400">{productName} · {lensColorName}</p>
              </div>
              <button type="button" onClick={handleClose} className="text-gray-500 hover:text-black text-2xl">✕</button>
            </div>
          )}

          {isOpen && (
            <p className="text-xs text-gray-400 mb-3 text-center">
              💡 Look directly at the camera for best results
            </p>
          )}

          <div className="relative rounded-xl overflow-hidden bg-gray-900 mb-4" style={{ minHeight: "300px" }}>
            <video ref={videoRef} autoPlay playsInline muted
              className="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />
            <canvas ref={canvasRef} className="w-full rounded-xl" />
            {isOpen && !cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center text-white">Starting camera...</div>
            )}
            {isOpen && cameraReady && (
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isTracking ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
                <span className="text-white text-xs">{isTracking ? "Tracking" : "Stopped"}</span>
              </div>
            )}
            {isOpen && cameraReady && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 rounded-full px-2 py-1">
                {/* Show PNG thumbnail or color dot */}
                {lensImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lensImageUrl} alt={lensColorName}
                    className="w-4 h-4 rounded-full object-cover border border-white/50" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-white/50" style={{ backgroundColor: lensColor }} />
                )}
                <span className="text-white text-xs">{lensColorName}</span>
              </div>
            )}
          </div>

          {/* Color/lens switcher */}
          {isOpen && colorSwatches.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">Switch lens:</p>
              <div className="flex flex-wrap gap-2">
                {colorSwatches.map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => onColorChange?.(swatch.hex, swatch.name)}
                    title={swatch.name}
                    className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      swatch.hex === lensColor
                        ? "border-black ring-1 ring-black scale-110"
                        : "border-gray-200"
                    }`}
                    aria-label={`Switch to ${swatch.name}`}
                    aria-pressed={swatch.hex === lensColor}
                  >
                    {swatch.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={swatch.imageUrl} alt={swatch.name}
                        className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: swatch.hex }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isOpen && cameraReady && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button type="button" onClick={() => capture("download")} disabled={isCapturing}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition">
                💾 Save Photo
              </button>
              <button type="button" onClick={() => capture("share")} disabled={isCapturing}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition">
                🔗 Share Look
              </button>
            </div>
          )}

          {isOpen && (captureError || error) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
              <p className="text-red-600 text-sm">⚠️ {captureError || error}</p>
            </div>
          )}

          {isOpen && cameraReady && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500">
                👁️ <strong>Tip:</strong> Keep your face well-lit and look directly at the camera.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
