"use client";

import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000";

interface FaceLandmarks {
  center_x: number;
  center_y: number;
  width: number;
  angle_deg: number;
  yaw_deg: number;
  pitch_deg: number;
  image_width: number;
  image_height: number;
}

export interface TryOn3DHandle {
  /** Capture current frame as PNG blob for save/share */
  captureFrame: () => Promise<Blob>;
}

interface TryOn3DProps {
  glbPath: string;
  isActive: boolean;
}

const TryOn3D = forwardRef<TryOn3DHandle, TryOn3DProps>(function TryOn3D(
  { glbPath, isActive },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // composite canvas for capture
  const streamRef = useRef<MediaStream | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animRef = useRef<number | null>(null);
  const trackingRef = useRef<boolean>(false);
  const landmarksRef = useRef<FaceLandmarks | null>(null);
  const smoothRef = useRef<FaceLandmarks | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [tracking, setTracking] = useState(false);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const lerpAngle = (a: number, b: number, t: number) => {
    let diff = b - a;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return a + diff * t;
  };

  // Expose captureFrame to parent for Save/Share
  useImperativeHandle(ref, () => ({
    captureFrame: async (): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const video = videoRef.current;
        const renderer = rendererRef.current;
        if (!video || !renderer) return reject("Not ready");

        // Create composite canvas: mirrored video + 3D overlay
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        const composite = document.createElement("canvas");
        composite.width = w;
        composite.height = h;
        const ctx = composite.getContext("2d");
        if (!ctx) return reject("No context");

        // Draw mirrored video
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        ctx.restore();

        // Draw Three.js canvas on top
        ctx.drawImage(renderer.domElement, 0, 0, w, h);

        // Watermark
        const fontSize = Math.max(14, Math.round(w * 0.025));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 4;
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText("TryNStyle.com", w - 12, h - 12);

        composite.toBlob(
          (blob) => blob ? resolve(blob) : reject("toBlob failed"),
          "image/png"
        );
      });
    },
  }));

  // ── TRACKING LOOP ──────────────────────────────────────────────────────────
  const startTracking = useCallback(() => {
    if (trackingRef.current) return;
    trackingRef.current = true;
    setTracking(true);

    const track = async () => {
      if (!trackingRef.current) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) { setTimeout(track, 300); return; }

      // Use full resolution — half-res causes 422 detection failures
      const tmp = document.createElement("canvas");
      tmp.width = video.videoWidth;
      tmp.height = video.videoHeight;
      const ctx = tmp.getContext("2d");
      if (!ctx) { setTimeout(track, 300); return; }

      // Draw UN-mirrored frame for AI (AI expects normal orientation)
      ctx.drawImage(video, 0, 0);

      tmp.toBlob(async (blob) => {
        if (!blob || !trackingRef.current) return;
        const fd = new FormData();
        fd.append("file", blob, "frame.jpg");
        try {
          const res = await fetch(`${AI_URL}/get-face-landmarks`, {
            method: "POST",
            body: fd,
          });
          if (res.ok) {
            const data = await res.json();
            const ov = data.glasses_overlay;
            landmarksRef.current = {
              // Don't multiply by 2 — using full res now
              center_x: ov.center_x,
              center_y: ov.center_y,
              width: ov.width,
              angle_deg: ov.angle_deg,
              yaw_deg: ov.yaw_deg,
              pitch_deg: ov.pitch_deg ?? 0,
              image_width: video.videoWidth,
              image_height: video.videoHeight,
            };
          }
        } catch { /* keep last */ }
        if (trackingRef.current) setTimeout(track, 120);
      }, "image/jpeg", 0.6);
    };

    track();
  }, []);

  // ── RENDER LOOP ────────────────────────────────────────────────────────────
  const renderLoop = useCallback(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const model = modelRef.current;
    const video = videoRef.current;

    if (!renderer || !scene || !camera) {
      animRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const raw = landmarksRef.current;
    if (raw && model && video && video.readyState >= 2) {
      const prev = smoothRef.current;
      const SMOOTH = 0.45;

      smoothRef.current = prev ? {
        center_x: lerp(prev.center_x, raw.center_x, SMOOTH),
        center_y: lerp(prev.center_y, raw.center_y, SMOOTH),
        width: lerp(prev.width, raw.width, SMOOTH),
        angle_deg: lerpAngle(prev.angle_deg, raw.angle_deg, SMOOTH),
        yaw_deg: lerpAngle(prev.yaw_deg, raw.yaw_deg, SMOOTH),
        pitch_deg: lerpAngle(prev.pitch_deg, raw.pitch_deg, SMOOTH),
        image_width: raw.image_width,
        image_height: raw.image_height,
      } : { ...raw };

      const ov = smoothRef.current;

      // ── Coordinate conversion ──────────────────────────────────────────
      // Video is CSS-mirrored (scaleX(-1)) but the AI receives the raw
      // (unmirrored) frame. So center_x from AI is in raw space.
      // To match the mirrored display we flip X: mirroredX = W - center_x
      const mirroredX = ov.image_width - ov.center_x;

      // NDC: map pixel → [-1, +1]
      const ndcX = (mirroredX / ov.image_width) * 2 - 1;
      const ndcY = -((ov.center_y / ov.image_height) * 2 - 1);

      // Unproject from NDC to world at Z=0 plane
      // Camera FOV=50, at Z=1 looking at Z=0
      const vFovRad = THREE.MathUtils.degToRad(50);
      const halfH = Math.tan(vFovRad / 2); // world height at Z=0 from Z=1 camera
      const halfW = halfH * camera.aspect;
      const worldX = ndcX * halfW;
      const worldY = ndcY * halfH;

      // When turning, nose bridge shifts horizontally relative to eye center
      // Add yaw-based X correction to keep glasses on nose bridge
      const yawRad = THREE.MathUtils.degToRad(ov.yaw_deg);
      //const xCorrection = Math.sin(yawRad) * 0.08;
      const zOffset = -0.3 + Math.abs(Math.sin(yawRad)) * 0.25;
      model.position.set(worldX, worldY + 0.00, zOffset);

      // Scale based on eye span
      const eyeSpanNorm = ov.width / ov.image_width;
      // Tune this multiplier until glasses fit well
      const scale = eyeSpanNorm * 0.40;  // increased from 2.2
      model.scale.setScalar(Math.max(0.1, Math.min(scale, 4.0)));

      // Rotations — roll mirrored on Z, yaw mirrored on Y
      model.rotation.set(
        THREE.MathUtils.degToRad(ov.pitch_deg * 2.0 - 50),
        THREE.MathUtils.degToRad(-ov.yaw_deg * 0.8),  // negated — fixes left/right mirror
        THREE.MathUtils.degToRad(ov.angle_deg),
      );
    }

    renderer.render(scene, camera);
    animRef.current = requestAnimationFrame(renderLoop);
  }, []);

  // ── SETUP THREE.JS ─────────────────────────────────────────────────────────
  const setupThree = useCallback(async () => {
    const mount = mountRef.current;
    const video = videoRef.current;
    if (!mount || !video) return;

    const w = mount.clientWidth || 640;
    const h = mount.clientHeight || 480;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.01, 100);
    camera.position.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const d1 = new THREE.DirectionalLight(0xffffff, 1.5);
    d1.position.set(1, 2, 3);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xffffff, 0.8);
    d2.position.set(-1, -1, 2);
    scene.add(d2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // Position canvas over video
    renderer.domElement.style.cssText = `
      position:absolute; top:0; left:0;
      width:100%; height:100%;
      pointer-events:none;
    `;
    mount.appendChild(renderer.domElement);

    // Load GLB
    const loader = new GLTFLoader();
    try {
      const gltf = await loader.loadAsync(glbPath);
      const model = gltf.scene;

      // Measure model bounding box and normalize width to 1 unit
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      if (size.x > 0) {
        const normScale = 1 / size.x;
        model.scale.setScalar(normScale);
      }

      // Center origin at nose bridge (bounding box center)
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center.multiplyScalar(1 / size.x));

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => { m.side = THREE.DoubleSide; });
        }
      });

      scene.add(model);
      model.rotation.y = Math.PI;
      modelRef.current = model;
      setStatus("ready");
      // DEBUG
      const debugBox = new THREE.Box3().setFromObject(model);
      const debugSize = debugBox.getSize(new THREE.Vector3());
      const debugCenter = debugBox.getCenter(new THREE.Vector3());
      console.log("Model size:", debugSize.x, debugSize.y, debugSize.z);
      console.log("Model center:", debugCenter.x, debugCenter.y, debugCenter.z);
      model.position.set(0, 0, 0);
      model.scale.setScalar(0.3);
      model.scale.setScalar(0.3);
    } catch (err) {
      console.error("GLB load error:", err);
      setErrorMsg(`Could not load 3D model from ${glbPath}`);
      setStatus("error");
      return;
    }

    animRef.current = requestAnimationFrame(renderLoop);

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [glbPath, renderLoop]);

  // ── START CAMERA ───────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      await setupThree();
      setTimeout(() => startTracking(), 600);
    } catch {
      setErrorMsg("Could not access camera.");
      setStatus("error");
    }
  }, [setupThree, startTracking]);

  const stopAll = useCallback(() => {
    trackingRef.current = false;
    setTracking(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current.domElement.remove();
      rendererRef.current = null;
    }
    sceneRef.current = cameraRef.current = modelRef.current = null;
    landmarksRef.current = smoothRef.current = null;
  }, []);

  useEffect(() => {
    if (isActive) { setStatus("loading"); startCamera(); }
    return () => stopAll();
  }, [isActive, startCamera, stopAll]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-gray-900" style={{ minHeight: "300px" }}>
      <video
        ref={videoRef}
        autoPlay playsInline muted
        className="w-full h-full object-cover rounded-xl"
        style={{ transform: "scaleX(-1)" }}
      />
      <div ref={mountRef} className="absolute inset-0 rounded-xl overflow-hidden" style={{ pointerEvents: "none" }} />
      <canvas ref={canvasRef} className="hidden" />

      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading 3D model...</p>
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl p-4">
          <p className="text-white text-sm">⚠️ {errorMsg}</p>
        </div>
      )}
      {status === "ready" && (
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${tracking ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
          <span className="text-white text-xs">{tracking ? "3D Tracking" : "Detecting..."}</span>
        </div>
      )}
    </div>
  );
});

export default TryOn3D;
