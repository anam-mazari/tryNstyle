"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  formatCameraError,
  getCameraVideoStream,
} from "@/utils/get-camera-stream";
import type { Product } from "@/types/entities";
import { getProductBrandName } from "@/utils/product-labels";
import { useTryOnCapture } from "@/hooks/useTryOnCapture";
import TryOn3D, { type TryOn3DHandle } from "@/components/TryOn3D";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";

const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const FRAME_SUITABILITY: Record<string, string[]> = {
  Oval:    ["Aviator", "Wayfarer", "Rectangle", "Square", "Round", "Cat-eye", "Browline"],
  Round:   ["Rectangle", "Square", "Browline", "Geometric"],
  Square:  ["Round", "Oval", "Cat-eye", "Rimless"],
  Heart:   ["Round", "Oval", "Rimless"],
  Oblong:  ["Oversized", "Square", "Round", "Tall"],
};

interface GlassesOverlay {
  center_x: number; center_y: number; width: number;
  angle_deg: number; yaw_deg: number; nose_offset: number;
  image_width?: number; image_height?: number;
}
interface FaceShapeResult { face_shape: string; confidence: number; recommendation: string; }
interface SkinToneResult  { skin_tone: "Warm"|"Cool"|"Neutral"; best_colors: string[]; avoid_colors: string[]; tip: string; }

export interface GlassesColorVariant {
  color:    string;
  imageUrl: string | null;
  stockQuantity?: number;
  isPrimary?: boolean;
}

interface TryOnProps {
  product: Pick<Product, "id"|"imageUrl"|"frameStyle"|"brand"|"category"|"price"|"stockQuantity">;
  glassesImageSource?: string | null;
  glbPath?: string | null;
  colorVariants?: GlassesColorVariant[];
  activeVariantIndex?: number;
  onColorChange?: (index: number) => void;
}

export default function TryOn({
  product,
  glassesImageSource,
  glbPath,
  colorVariants = [],
  activeVariantIndex = 0,
  onColorChange,
}: TryOnProps) {
  const dispatch = useDispatch();

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const glassesRef  = useRef<HTMLImageElement | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const animRef     = useRef<number | null>(null);
  const overlayRef  = useRef<GlassesOverlay | null>(null);
  const trackingRef = useRef<boolean>(false);
  const smoothRef   = useRef<GlassesOverlay | null>(null);
  const tryOn3DRef  = useRef<TryOn3DHandle>(null);

  const [isOpen,        setIsOpen]        = useState(false);
  const [cameraReady,   setCameraReady]   = useState(false);
  const [glassesReady,  setGlassesReady]  = useState(false);
  const [isAnalyzing,   setIsAnalyzing]   = useState(false);
  const [isSkinLoading, setIsSkinLoading] = useState(false);
  const [isTracking,    setIsTracking]    = useState(false);
  const [faceResult,    setFaceResult]    = useState<FaceShapeResult | null>(null);
  const [skinResult,    setSkinResult]    = useState<SkinToneResult  | null>(null);
  const [suitability,   setSuitability]   = useState<"good"|"bad"|null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const [mode,          setMode]          = useState<"2d"|"3d">("2d");
  const [is3DCapturing, setIs3DCapturing] = useState(false);

  const { capture, isCapturing, captureError } = useTryOnCapture(canvasRef);
  const has3D      = Boolean(glbPath);
  const brandLabel = getProductBrandName(product.brand);
  const price      = Number(product.price);

  const glassesUrl = (() => {
    const src = glassesImageSource ?? product.imageUrl;
    if (!src) return null;
    return src.startsWith("http") ? src : `${API_URL}${src}`;
  })();

  useEffect(() => {
    if (!glassesUrl) { glassesRef.current = null; setGlassesReady(false); return; }
    setGlassesReady(false);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => { glassesRef.current = img; setGlassesReady(true); };
    img.onerror = () => { glassesRef.current = null; setGlassesReady(false); };
    img.src = glassesUrl;
  }, [glassesUrl]);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const drawFrame = useCallback(() => {
    const canvas  = canvasRef.current;
    const video   = videoRef.current;
    const glasses = glassesRef.current;
    if (!canvas || !video || video.readyState < 2) { animRef.current = requestAnimationFrame(drawFrame); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640; canvas.height = video.videoHeight || 480;
    }
    ctx.save(); ctx.translate(canvas.width, 0); ctx.scale(-1, 1); ctx.drawImage(video, 0, 0); ctx.restore();
    const raw = overlayRef.current;
    if (raw) {
      const prev = smoothRef.current;
      if (!prev) { smoothRef.current = { ...raw }; }
      else {
        const S = 0.45;
        smoothRef.current = { ...raw,
          center_x:  lerp(prev.center_x,  raw.center_x,  S),
          center_y:  lerp(prev.center_y,  raw.center_y,  S),
          width:     lerp(prev.width,      raw.width,     S),
          angle_deg: lerp(prev.angle_deg,  raw.angle_deg, S),
          yaw_deg:   lerp(prev.yaw_deg,    raw.yaw_deg,   S),
        };
      }
    }
    const ov = smoothRef.current;
    if (ov && glasses && glassesReady) {
      const scaleX = canvas.width  / (ov.image_width  || canvas.width);
      const scaleY = canvas.height / (ov.image_height || canvas.height);
      const cx           = ov.center_x * scaleX;
      const rawCy        = ov.center_y * scaleY;
      const scaledWidth  = ov.width * scaleX * 1.6;
      const scaledHeight = scaledWidth * (glasses.naturalHeight / glasses.naturalWidth);
      const bridgeOffset = scaledHeight * 0.05; // small downward nudge
      const cy           = rawCy + bridgeOffset;
      const mirroredX    = canvas.width - cx;
      const skewAmount   = Math.sin((ov.yaw_deg * Math.PI) / 180) * 0.25;
      ctx.save();
      ctx.translate(mirroredX, cy);
      ctx.rotate((-ov.angle_deg * Math.PI) / 180);
      ctx.transform(1, 0, skewAmount, 1, 0, 0);
      ctx.drawImage(glasses, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
      ctx.restore();
    }
    animRef.current = requestAnimationFrame(drawFrame);
  }, [glassesReady]);

  const startTracking = useCallback(() => {
    if (trackingRef.current) return;
    trackingRef.current = true; setIsTracking(true);
    const track = async () => {
      if (!trackingRef.current) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) { setTimeout(track, 300); return; }
      const tmp = document.createElement("canvas");
      tmp.width = video.videoWidth / 2; tmp.height = video.videoHeight / 2;
      const ctx = tmp.getContext("2d");
      if (!ctx) { setTimeout(track, 300); return; }
      ctx.drawImage(video, 0, 0, tmp.width, tmp.height);
      tmp.toBlob(async (blob) => {
        if (!blob || !trackingRef.current) return;
        const fd = new FormData(); fd.append("file", blob, "frame.jpg");
        try {
          const res = await fetch(`${AI_URL}/get-face-landmarks`, { method: "POST", body: fd });
          if (res.ok) {
            const data = await res.json();
            overlayRef.current = {
              ...data.glasses_overlay,
              center_x: data.glasses_overlay.center_x * 2,
              center_y: data.glasses_overlay.center_y * 2,
              width:    data.glasses_overlay.width    * 2,
              image_width:  video.videoWidth,
              image_height: video.videoHeight,
            };
          }
        } catch { /**/ }
        if (trackingRef.current) setTimeout(track, 150);
      }, "image/jpeg", 0.35);
    };
    track();
  }, []);

  const drawFrameRef     = useRef(drawFrame);     drawFrameRef.current     = drawFrame;
  const startTrackingRef = useRef(startTracking); startTrackingRef.current = startTracking;

  const stopTracking = useCallback(() => {
    trackingRef.current = false; setIsTracking(false);
    overlayRef.current = null; smoothRef.current = null;
  }, []);

  const captureFrame = useCallback((): Promise<Blob> => new Promise((resolve, reject) => {
    const video = videoRef.current; if (!video) return reject("No video");
    const tmp = document.createElement("canvas");
    tmp.width = video.videoWidth; tmp.height = video.videoHeight;
    const ctx = tmp.getContext("2d"); if (!ctx) return reject("No context");
    ctx.drawImage(video, 0, 0);
    tmp.toBlob((blob) => blob ? resolve(blob) : reject("Failed"), "image/jpeg");
  }), []);

  const startCamera = useCallback(async () => {
    setFaceResult(null); setSkinResult(null); setError(null); setSuitability(null); setCameraReady(false);
    try {
      const stream = await getCameraVideoStream();
      const video  = videoRef.current;
      if (!video) { stream.getTracks().forEach((t) => t.stop()); setError("Camera failed."); return; }
      streamRef.current = stream; video.srcObject = stream;
      const runPreview = async () => {
        try {
          await video.play(); setCameraReady(true); setIsOpen(true);
          if (mode === "2d") {
            animRef.current = requestAnimationFrame(drawFrameRef.current);
            setTimeout(() => startTrackingRef.current(), 500);
          }
        } catch { stream.getTracks().forEach((t) => t.stop()); streamRef.current = null; video.srcObject = null; setError("Could not start camera."); }
      };
      video.readyState >= 2 ? await runPreview() : (video.onloadedmetadata = () => { video.onloadedmetadata = null; void runPreview(); });
    } catch (e) { setError(formatCameraError(e)); }
  }, [mode]);

  const stopCamera = useCallback(() => {
    stopTracking();
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (videoRef.current) { videoRef.current.srcObject = null; videoRef.current.onloadedmetadata = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    setIsOpen(false); setCameraReady(false); setFaceResult(null); setSkinResult(null); setError(null); setSuitability(null);
  }, [stopTracking]);

  const handleModeSwitch = useCallback((newMode: "2d"|"3d") => {
    setMode(newMode);
    if (newMode === "2d" && cameraReady) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(drawFrameRef.current);
      startTrackingRef.current();
    } else if (newMode === "3d") {
      stopTracking();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
  }, [cameraReady, stopTracking]);

  const capture3D = useCallback(async (shareMode: "download"|"share") => {
    if (!tryOn3DRef.current) return;
    setIs3DCapturing(true);
    try {
      const blob = await tryOn3DRef.current.captureFrame();
      const filename = `trynstyle-3d-${Date.now()}.png`;
      if (shareMode === "download") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      } else {
        const file = new File([blob], filename, { type: "image/png" });
        if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: "My 3D Try-On — TryNStyle", files: [file] });
        } else {
          try { await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]); alert("📋 Image copied to clipboard!"); }
          catch { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 2000); }
        }
      }
    } catch (e) { console.error(e); }
    finally { setIs3DCapturing(false); }
  }, []);

  const analyzeFaceShape = useCallback(async () => {
    setIsAnalyzing(true); setError(null); setFaceResult(null); setSuitability(null);
    try {
      const blob = await captureFrame(); const fd = new FormData(); fd.append("file", blob, "frame.jpg");
      const res = await fetch(`${AI_URL}/detect-face-shape`, { method: "POST", body: fd });
      if (res.status === 422) { setError("No face detected."); return; }
      if (!res.ok) { setError(`Face shape error (${res.status})`); return; }
      const data: FaceShapeResult = await res.json(); setFaceResult(data);
      const suited = FRAME_SUITABILITY[data.face_shape] || [];
      setSuitability(suited.some((f) => (product.frameStyle||"").toLowerCase().includes(f.toLowerCase())) ? "good" : "bad");
    } catch { setError(`Could not reach AI at ${AI_URL}.`); }
    finally { setIsAnalyzing(false); }
  }, [captureFrame, product.frameStyle]);

  const analyzeSkinTone = useCallback(async () => {
    setIsSkinLoading(true); setError(null); setSkinResult(null);
    try {
      const blob = await captureFrame(); const fd = new FormData(); fd.append("file", blob, "frame.jpg");
      const res = await fetch(`${AI_URL}/analyze-skin-tone`, { method: "POST", body: fd });
      if (res.status === 422) { setError("No face detected."); return; }
      if (!res.ok) { setError(`Skin tone error (${res.status})`); return; }
      setSkinResult(await res.json());
    } catch { setError(`Could not reach AI at ${AI_URL}.`); }
    finally { setIsSkinLoading(false); }
  }, [captureFrame]);

  const handleAddToCart = useCallback(() => {
    const active = colorVariants[activeVariantIndex];
    const maxQty =
      typeof active?.stockQuantity === "number"
        ? Math.max(0, active.stockQuantity)
        : (product as any).stockQuantity;
    if (maxQty === 0) { toast.error("Out of stock."); return; }
    const variantColor =
      active && active.isPrimary ? undefined : active?.color;
    dispatch(addToCart({ product: product as any, quantity: 1, variantColor }));
    toast.success("Added to cart!");
  }, [activeVariantIndex, colorVariants, dispatch, product]);

  useEffect(() => { return () => { stopTracking(); if (animRef.current) cancelAnimationFrame(animRef.current); }; }, [stopTracking]);

  const toneConfig = {
    Warm:    { emoji:"🌅", bg:"bg-amber-50",  border:"border-amber-200", badge:"bg-amber-100 text-amber-800" },
    Cool:    { emoji:"❄️",  bg:"bg-blue-50",   border:"border-blue-200",  badge:"bg-blue-100 text-blue-800"  },
    Neutral: { emoji:"⚖️",  bg:"bg-gray-50",   border:"border-gray-200",  badge:"bg-gray-100 text-gray-700"  },
  };

  const activeVariant = colorVariants[activeVariantIndex];

  return (
    <div>
      {!isOpen && error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3"><p className="text-red-600 text-sm">⚠️ {error}</p></div>}
      {!isOpen && (
        <button type="button" onClick={startCamera} className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium">
          👓 Try On & Detect Face Shape
        </button>
      )}

      <div className={isOpen ? "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" : "fixed -left-[9999px] top-0 z-0 pointer-events-none opacity-0"} aria-hidden={!isOpen}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-screen overflow-y-auto">

          {isOpen && (
            <div className="flex justify-between items-center mb-3">
              <div><h2 className="text-xl font-bold">Virtual Try-On</h2><p className="text-xs text-gray-400">{brandLabel ?? "—"} · {product.frameStyle ?? "—"}</p></div>
              <button type="button" onClick={stopCamera} className="text-gray-500 hover:text-black text-2xl">✕</button>
            </div>
          )}

          {/* 2D / 3D toggle */}
          {isOpen && has3D && (
            <div className="flex gap-2 mb-3 p-1 bg-gray-100 rounded-xl">
              <button type="button" onClick={() => handleModeSwitch("2d")}
                className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition ${mode==="2d" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
                2D Try-On
              </button>
              <button type="button" onClick={() => handleModeSwitch("3d")}
                className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition ${mode==="3d" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
                ✨ 3D Try-On
              </button>
            </div>
          )}

          {isOpen && <p className="text-xs text-gray-400 mb-3 text-center">{mode==="3d" ? "✨ 3D mode — glasses track your face in real 3D space!" : "💡 Turn your head left or right — glasses will follow!"}</p>}

          {/* Camera area */}
          <div className="relative rounded-xl overflow-hidden bg-gray-900 mb-4" style={{ minHeight: "300px" }}>
            <video ref={videoRef} autoPlay playsInline muted
              className="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />
            {mode === "2d" && <canvas ref={canvasRef} className="w-full rounded-xl" />}
            {mode === "3d" && isOpen && glbPath && (
              <TryOn3D ref={tryOn3DRef} glbPath={glbPath} isActive={mode==="3d" && isOpen} />
            )}
            {isOpen && !cameraReady && mode === "2d" && (
              <div className="absolute inset-0 flex items-center justify-center text-white">Starting camera...</div>
            )}
            {isOpen && cameraReady && mode === "2d" && (
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isTracking ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
                <span className="text-white text-xs">{isTracking ? "Tracking" : "Stopped"}</span>
              </div>
            )}
          </div>

          {/* ── COLOR SWITCHER — 2D mode only ──────────────────────────────── */}
          {isOpen && mode === "2d" && colorVariants.length > 1 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">Switch frame color:</p>
              <div className="flex flex-wrap gap-2">
                {colorVariants.map((variant, index) => {
                  const isActive = index === activeVariantIndex;
                  return (
                    <button
                      key={`${variant.color}-${index}`}
                      type="button"
                      onClick={() => onColorChange?.(index)}
                      title={variant.color}
                      className={`relative w-10 h-10 rounded-full border-2 overflow-hidden transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        isActive ? "border-black ring-2 ring-black scale-110" : "border-gray-400"
                      }`}
                      aria-label={`Switch to ${variant.color}`}
                      aria-pressed={isActive}
                    >
                      {variant.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={variant.imageUrl.startsWith("http") ? variant.imageUrl : `${API_URL}${variant.imageUrl}`}
                          alt={variant.color}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {variant.color.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analysis buttons */}
          {isOpen && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button type="button" onClick={analyzeFaceShape} disabled={!cameraReady || isAnalyzing}
                className="bg-black text-white py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition">
                {isAnalyzing ? "Analyzing..." : "📸 Analyze Face Shape"}
              </button>
              <button type="button" onClick={analyzeSkinTone} disabled={!cameraReady || isSkinLoading}
                className="bg-gray-700 text-white py-2 rounded-xl text-sm font-semibold hover:bg-gray-600 disabled:opacity-50 transition">
                {isSkinLoading ? "Analyzing..." : "🎨 Analyze Skin Tone"}
              </button>
            </div>
          )}

          {/* Save & Share */}
          {isOpen && cameraReady && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button type="button"
                onClick={() => mode === "3d" ? capture3D("download") : capture("download")}
                disabled={isCapturing || is3DCapturing}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition">
                💾 Save Photo
              </button>
              <button type="button"
                onClick={() => mode === "3d" ? capture3D("share") : capture("share")}
                disabled={isCapturing || is3DCapturing}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition">
                🔗 Share Look
              </button>
            </div>
          )}

          {/* ── ADD TO CART — inside modal, below save/share ──────────────── */}
          {isOpen && (
            <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 mb-4">
              {activeVariant?.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeVariant.imageUrl.startsWith("http") ? activeVariant.imageUrl : `${API_URL}${activeVariant.imageUrl}`}
                  alt={activeVariant.color}
                  className="w-6 h-6 rounded-full object-cover shrink-0 border border-neutral-300"
                />
              )}
              <span className="text-xs font-semibold text-neutral-700 flex-1">
                {activeVariant?.color ?? product.frameStyle ?? "—"}
                {Number.isFinite(price) && (
                  <span className="text-neutral-400 ml-1">${price.toFixed(0)}</span>
                )}
              </span>
              <button
                type="button"
                onClick={handleAddToCart}
                className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-700 transition shrink-0"
              >
                Add to cart
              </button>
            </div>
          )}

          {isOpen && (captureError || error) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-red-600 text-sm">⚠️ {captureError || error}</p>
            </div>
          )}

          {isOpen && faceResult && suitability && (
            <div className={`rounded-xl p-4 mb-3 ${suitability==="good" ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
              <div className="flex justify-between items-start mb-2">
                <div><p className="text-xs text-gray-500">Face Shape</p><p className="text-2xl font-bold text-black">{faceResult.face_shape}</p><p className="text-xs text-gray-400">{faceResult.confidence}% confidence</p></div>
                <span className="text-3xl">{suitability==="good" ? "✅" : "⚠️"}</span>
              </div>
              {suitability==="good"
                ? <p className="text-green-800 text-sm font-semibold bg-green-100 rounded-lg p-2">Great choice! {product.frameStyle} frames suit {faceResult.face_shape} faces perfectly.</p>
                : <div className="bg-orange-100 rounded-lg p-2"><p className="text-orange-800 text-sm font-semibold">These frames may not be the best match.</p><p className="text-orange-700 text-xs mt-1">{faceResult.recommendation}</p></div>
              }
            </div>
          )}

          {isOpen && skinResult && (() => {
            const cfg = toneConfig[skinResult.skin_tone];
            return (
              <div className={`rounded-xl p-4 border ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-center gap-2 mb-3"><span className="text-2xl">{cfg.emoji}</span><div><p className="text-xs text-gray-500">Skin Tone</p><p className="text-xl font-bold text-black">{skinResult.skin_tone}</p></div></div>
                <p className="text-sm text-gray-600 mb-3">{skinResult.tip}</p>
                <div className="mb-2"><p className="text-xs font-semibold text-gray-700 mb-1">✅ Best frame colors:</p><div className="flex flex-wrap gap-1">{skinResult.best_colors.map((c) => <span key={c} className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.badge}`}>{c}</span>)}</div></div>
                {skinResult.avoid_colors.length > 0 && <div><p className="text-xs font-semibold text-gray-700 mb-1">❌ Avoid:</p><div className="flex flex-wrap gap-1">{skinResult.avoid_colors.map((c) => <span key={c} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">{c}</span>)}</div></div>}
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
