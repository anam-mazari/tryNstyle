"use client";

import { useCallback, useState } from "react";

/**
 * useTryOnCapture
 *
 * Shared hook used by both TryOn.tsx (glasses) and LensTryOn.tsx (lenses).
 * Captures the current canvas frame as a PNG and either downloads it
 * or opens the native Web Share sheet (mobile) / clipboard fallback (desktop).
 *
 * Usage:
 *   const { capture, isCapturing } = useTryOnCapture(canvasRef, "TryNStyle");
 *   <button onClick={() => capture("download")}>Save</button>
 *   <button onClick={() => capture("share")}>Share</button>
 */

export type CaptureMode = "download" | "share";

interface UseTryOnCaptureReturn {
  capture: (mode: CaptureMode) => Promise<void>;
  isCapturing: boolean;
  captureError: string | null;
}

export function useTryOnCapture(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  watermarkText: string = "TryNStyle.com"
): UseTryOnCaptureReturn {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const capture = useCallback(
    async (mode: CaptureMode) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setCaptureError("Canvas not ready.");
        return;
      }

      setIsCapturing(true);
      setCaptureError(null);

      try {
        // ── Step 1: draw watermark onto a temporary canvas so we don't mutate the live canvas
        const tmp = document.createElement("canvas");
        tmp.width  = canvas.width;
        tmp.height = canvas.height;
        const ctx = tmp.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");

        // Copy current live frame
        ctx.drawImage(canvas, 0, 0);

        // Draw watermark — bottom-right corner
        const fontSize = Math.max(14, Math.round(canvas.width * 0.025));
        ctx.font      = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";

        // Shadow for readability on any background
        ctx.shadowColor   = "rgba(0,0,0,0.6)";
        ctx.shadowBlur    = 4;
        ctx.fillStyle     = "rgba(255,255,255,0.85)";
        ctx.fillText(watermarkText, canvas.width - 12, canvas.height - 12);

        // ── Step 2: export as PNG blob
        const blob: Blob = await new Promise((resolve, reject) => {
          tmp.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
            "image/png"
          );
        });

        const filename = `trynstyle-tryon-${Date.now()}.png`;

        if (mode === "download") {
          // Create a temporary anchor and click it
          const url = URL.createObjectURL(blob);
          const a   = document.createElement("a");
          a.href     = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          // Revoke after short delay so browser can read it
          setTimeout(() => URL.revokeObjectURL(url), 2000);

        } else if (mode === "share") {
          // Web Share API — works natively on mobile (Android/iOS)
          // Falls back to clipboard copy on desktop browsers that don't support it
          const file = new File([blob], filename, { type: "image/png" });

          if (
            typeof navigator.share === "function" &&
            navigator.canShare?.({ files: [file] })
          ) {
            await navigator.share({
              title: "Check out my look on TryNStyle!",
              text:  "I tried on glasses/lenses virtually. Try it yourself at TryNStyle!",
              files: [file],
            });
          } else {
            // Desktop fallback — copy image to clipboard
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob }),
              ]);
              alert("📋 Image copied to clipboard! Paste it anywhere to share.");
            } catch {
              // Last resort — just download if clipboard also fails
              const url = URL.createObjectURL(blob);
              const a   = document.createElement("a");
              a.href     = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => URL.revokeObjectURL(url), 2000);
            }
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Capture failed.";
        setCaptureError(msg);
      } finally {
        setIsCapturing(false);
      }
    },
    [canvasRef, watermarkText]
  );

  return { capture, isCapturing, captureError };
}
