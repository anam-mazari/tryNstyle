/**
 * Request a front-facing camera stream with fallbacks for strict device constraints.
 */

function isBrowserMediaSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

function assertSecureCameraContext(): void {
  if (typeof window === "undefined") return;
  const host = window.location.hostname;
  const local = host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  if (!window.isSecureContext && !local) {
    throw new DOMException(
      "Camera requires HTTPS (or localhost).",
      "SecurityError",
    );
  }
}

/** Prefer the widest compatibility first (`video: true`), then prefer selfie camera. */
const CONSTRAINT_ATTEMPTS: MediaStreamConstraints[] = [
  { video: true },
  { video: { facingMode: "user" } },
  {
    video: {
      facingMode: { ideal: "user" },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  },
  {
    video: {
      facingMode: { ideal: "user" },
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
  },
];

export async function getCameraVideoStream(): Promise<MediaStream> {
  if (!isBrowserMediaSupported()) {
    throw new DOMException("getUserMedia is not supported", "NotSupportedError");
  }
  assertSecureCameraContext();

  let lastError: unknown;
  for (const constraints of CONSTRAINT_ATTEMPTS) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      lastError = error;
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError" || error.name === "NotFoundError") {
          throw error;
        }
      }
    }
  }
  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new DOMException("Could not open camera", "NotReadableError");
}

export function formatCameraError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "Camera access was blocked. Click the camera icon in the address bar, allow permission for this site, then try again.";
    }
    if (error.name === "NotFoundError") {
      return "No camera was found. Connect a camera or use a device with a built-in webcam.";
    }
    if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      return "The camera could not be started. It may be in use by another application.";
    }
    if (error.name === "OverconstrainedError") {
      return "This camera does not support the requested settings. Try another browser or device.";
    }
    if (error.name === "SecurityError") {
      return "Camera requires a secure page (HTTPS) or localhost. Do not use a raw IP over HTTP.";
    }
    if (error.name === "NotSupportedError") {
      return "This browser does not support camera access from this page.";
    }
  }
  return "Could not access the camera. Please try again.";
}
