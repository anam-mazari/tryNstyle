from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from PIL import Image
import tensorflow as tf
import cv2
import io
import mediapipe as mp

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model("/app/best_model.keras")

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

CLASS_NAMES = ["Heart", "Oblong", "Oval", "Round", "Square"]

RECOMMENDATIONS = {
    "Oval":    "Great news! Aviator and Wayfarer frames suit you best. Avoid overly large or tiny frames.",
    "Round":   "Rectangle and Square frames complement your face. Avoid round or circular frames.",
    "Square":  "Round and Cat-eye frames soften your features. Avoid square or rectangle frames.",
    "Heart":   "Round and Rimless frames balance your face. Avoid cat-eye or oversized frames.",
    "Oblong":  "Oversized and Square frames add width. Avoid narrow or small frames.",
}

LANDMARKS = {
    "left_eye_outer":  33,
    "left_eye_inner":  133,
    "right_eye_inner": 362,
    "right_eye_outer": 263,
    "nose_bridge":     168,
    "nose_tip":        4,
    "chin":            152,   # for pitch calculation
    "forehead":        10,    # for pitch calculation
}

IRIS_LANDMARKS = {
    "left_iris_center":  468,
    "left_iris_top":     469,
    "left_iris_right":   470,
    "left_iris_bottom":  471,
    "left_iris_left":    472,
    "right_iris_center": 473,
    "right_iris_top":    474,
    "right_iris_right":  475,
    "right_iris_bottom": 476,
    "right_iris_left":   477,
}

EYELID_LANDMARKS = {
    "left_upper":  159,
    "left_lower":  145,
    "right_upper": 386,
    "right_lower": 374,
}


def detect_and_crop_face(img_bgr, padding=0.3):
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    h, w = img_bgr.shape[:2]

    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=4,
        minSize=(60, 60), flags=cv2.CASCADE_SCALE_IMAGE
    )

    if len(faces) == 0:
        return None, False

    x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])
    pad_x = int(fw * padding)
    pad_y = int(fh * padding)
    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(w, x + fw + pad_x)
    y2 = min(h, y + fh + pad_y)

    cropped = img_bgr[y1:y2, x1:x2]
    return cropped, True


@app.get("/")
def health():
    return {"status": "AI service running"}


@app.post("/detect-face-shape")
async def detect_face_shape(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    img_rgb = np.array(image)
    img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)

    face_crop, face_found = detect_and_crop_face(img_bgr)
    if not face_found:
        raise HTTPException(
            status_code=422,
            detail="No human face detected. Please make sure your face is clearly visible in the camera."
        )

    face_rgb = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
    face_resized = cv2.resize(face_rgb, (224, 224))
    img_array = np.array(face_resized, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)


    predictions = model.predict(img_array)
    predicted_index = np.argmax(predictions[0])
    predicted_class = CLASS_NAMES[predicted_index]
    confidence = float(predictions[0][predicted_index]) * 100

    return {
        "face_shape": predicted_class,
        "confidence": round(confidence, 2),
        "recommendation": RECOMMENDATIONS[predicted_class],
        "all_predictions": {
            CLASS_NAMES[i]: round(float(predictions[0][i]) * 100, 2)
            for i in range(len(CLASS_NAMES))
        }
    }


@app.post("/get-face-landmarks")
async def get_face_landmarks(file: UploadFile = File(...)):
    """
    Returns face landmarks for glasses overlay positioning.
    Now includes pitch_deg (head tilt up/down) needed for 3D try-on.

    Roll  = head tilt left/right (Z rotation in 3D)
    Yaw   = head turn left/right (Y rotation in 3D)
    Pitch = head tilt up/down   (X rotation in 3D) — NEW for 3D
    """
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    img_rgb = np.array(image)
    h, w = img_rgb.shape[:2]

    results = face_mesh.process(img_rgb)

    if not results.multi_face_landmarks:
        raise HTTPException(
            status_code=422,
            detail="No face detected. Please make sure your face is clearly visible."
        )

    landmarks = results.multi_face_landmarks[0].landmark

    def get_point(idx):
        lm = landmarks[idx]
        return {"x": round(lm.x * w), "y": round(lm.y * h)}

    left_eye_outer  = get_point(LANDMARKS["left_eye_outer"])
    left_eye_inner  = get_point(LANDMARKS["left_eye_inner"])
    right_eye_inner = get_point(LANDMARKS["right_eye_inner"])
    right_eye_outer = get_point(LANDMARKS["right_eye_outer"])
    nose_bridge     = get_point(LANDMARKS["nose_bridge"])
    nose_tip        = get_point(LANDMARKS["nose_tip"])
    chin            = get_point(LANDMARKS["chin"])
    forehead        = get_point(LANDMARKS["forehead"])

    # Glasses center position
    glasses_center_x = (left_eye_outer["x"] + right_eye_outer["x"]) // 2
    glasses_center_y = nose_bridge["y"]
    glasses_width    = int(abs(right_eye_outer["x"] - left_eye_outer["x"]) * 1.3)

    # Roll angle — tilt of eye line
    dx = right_eye_outer["x"] - left_eye_outer["x"]
    dy = right_eye_outer["y"] - left_eye_outer["y"]
    angle = float(np.degrees(np.arctan2(dy, dx)))

    # Yaw angle — left/right head turn
    eye_center_x   = (left_eye_outer["x"] + right_eye_outer["x"]) / 2
    nose_deviation = nose_tip["x"] - eye_center_x
    eye_span       = abs(right_eye_outer["x"] - left_eye_outer["x"])
    yaw_deg        = float(np.degrees(np.arctan2(nose_deviation, eye_span * 0.8))) if eye_span > 0 else 0.0

    # Pitch angle — up/down head tilt
    # Uses the vertical position of nose tip relative to the eye-chin midpoint
    # When head tilts up: nose tip moves above eye midline → negative pitch
    # When head tilts down: nose tip moves below eye midline → positive pitch
    eye_center_y    = (left_eye_outer["y"] + right_eye_outer["y"]) / 2
    face_height     = abs(chin["y"] - forehead["y"])
    nose_vertical   = nose_tip["y"] - eye_center_y
    # Normalize by face height so distance from camera doesn't affect it
    pitch_normalized = nose_vertical / face_height if face_height > 0 else 0.0
    # Convert to degrees — empirically scaled, 0.3 face_height ≈ 20 degrees
    pitch_deg = float(np.degrees(np.arctan2(pitch_normalized, 0.5)))

    nose_offset = nose_tip["y"] - nose_bridge["y"]

    return {
        "face_detected": True,
        "image_width":  w,
        "image_height": h,
        "landmarks": {
            "left_eye_outer":  left_eye_outer,
            "left_eye_inner":  left_eye_inner,
            "right_eye_inner": right_eye_inner,
            "right_eye_outer": right_eye_outer,
            "nose_bridge":     nose_bridge,
        },
        "glasses_overlay": {
            "center_x":    glasses_center_x,
            "center_y":    glasses_center_y,
            "width":       glasses_width,
            "angle_deg":   round(angle,      2),
            "yaw_deg":     round(yaw_deg,    2),
            "pitch_deg":   round(pitch_deg,  2),   # NEW — for 3D try-on
            "nose_offset": nose_offset,
        }
    }


# ─── IRIS DETECTION — for Contact Lens Try-On ────────────────────────────────

@app.post("/detect-iris")
async def detect_iris(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    img_rgb = np.array(image)
    h, w = img_rgb.shape[:2]

    results = face_mesh.process(img_rgb)

    if not results.multi_face_landmarks:
        raise HTTPException(
            status_code=422,
            detail="No face detected. Please make sure your face is clearly visible."
        )

    landmarks = results.multi_face_landmarks[0].landmark

    def px(idx):
        lm = landmarks[idx]
        return (lm.x * w, lm.y * h)

    lc = px(IRIS_LANDMARKS["left_iris_center"])
    l_top    = px(IRIS_LANDMARKS["left_iris_top"])
    l_bottom = px(IRIS_LANDMARKS["left_iris_bottom"])
    l_left   = px(IRIS_LANDMARKS["left_iris_left"])
    l_right  = px(IRIS_LANDMARKS["left_iris_right"])

    left_radius_v = abs(l_bottom[1] - l_top[1]) / 2
    left_radius_h = abs(l_right[0] - l_left[0]) / 2
    left_radius   = (left_radius_v + left_radius_h) / 2
    if left_radius < 5:
        left_eye_span = abs(landmarks[33].x * w - landmarks[133].x * w)
        left_radius = left_eye_span * 0.35

    rc = px(IRIS_LANDMARKS["right_iris_center"])
    r_top    = px(IRIS_LANDMARKS["right_iris_top"])
    r_bottom = px(IRIS_LANDMARKS["right_iris_bottom"])
    r_left   = px(IRIS_LANDMARKS["right_iris_left"])
    r_right  = px(IRIS_LANDMARKS["right_iris_right"])

    right_radius_v = abs(r_bottom[1] - r_top[1]) / 2
    right_radius_h = abs(r_right[0] - r_left[0]) / 2
    right_radius   = (right_radius_v + right_radius_h) / 2
    if right_radius < 5:
        right_eye_span = abs(landmarks[362].x * w - landmarks[263].x * w)
        right_radius = right_eye_span * 0.35

    left_upper_lid  = landmarks[EYELID_LANDMARKS["left_upper"]]
    left_lower_lid  = landmarks[EYELID_LANDMARKS["left_lower"]]
    right_upper_lid = landmarks[EYELID_LANDMARKS["right_upper"]]
    right_lower_lid = landmarks[EYELID_LANDMARKS["right_lower"]]

    return {
        "face_detected": True,
        "image_width":  w,
        "image_height": h,
        "left_iris": {
            "center_x":    round(lc[0], 1),
            "center_y":    round(lc[1], 1),
            "radius":      round(left_radius, 1),
            "upper_lid_y": round(left_upper_lid.y  * h, 1),
            "lower_lid_y": round(left_lower_lid.y  * h, 1),
        },
        "right_iris": {
            "center_x":    round(rc[0], 1),
            "center_y":    round(rc[1], 1),
            "radius":      round(right_radius, 1),
            "upper_lid_y": round(right_upper_lid.y * h, 1),
            "lower_lid_y": round(right_lower_lid.y * h, 1),
        }
    }


# ─── SKIN TONE ANALYSIS ───────────────────────────────────────────────────────

SKIN_TONE_COLORS = {
    "Warm": {
        "best":   ["Tortoise", "Brown", "Gold", "Olive", "Caramel", "Warm Brown"],
        "avoid":  ["Silver", "Black", "Cool Grey", "Blue"],
        "tip":    "Your warm undertones glow with earth tones and gold metals."
    },
    "Cool": {
        "best":   ["Black", "Silver", "Blue", "Pink", "Purple", "Crystal"],
        "avoid":  ["Orange", "Yellow", "Gold", "Brown"],
        "tip":    "Your cool undertones shine with silver metals and jewel tones."
    },
    "Neutral": {
        "best":   ["Black", "Brown", "Tortoise", "Silver", "Gold", "Navy"],
        "avoid":  [],
        "tip":    "Lucky you! Neutral undertones suit almost any frame color."
    },
}

SKIN_SAMPLE_POINTS = [10, 234, 454, 195, 200]


@app.post("/analyze-skin-tone")
async def analyze_skin_tone(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    img_rgb = np.array(image)
    h, w = img_rgb.shape[:2]

    results = face_mesh.process(img_rgb)
    if not results.multi_face_landmarks:
        raise HTTPException(
            status_code=422,
            detail="No face detected. Please make sure your face is clearly visible."
        )

    landmarks = results.multi_face_landmarks[0].landmark

    sampled_pixels = []
    for idx in SKIN_SAMPLE_POINTS:
        lm = landmarks[idx]
        px_x = int(lm.x * w)
        px_y = int(lm.y * h)
        x1 = max(0, px_x - 5)
        y1 = max(0, px_y - 5)
        x2 = min(w, px_x + 5)
        y2 = min(h, px_y + 5)
        region = img_rgb[y1:y2, x1:x2]
        if region.size > 0:
            sampled_pixels.append(region.reshape(-1, 3))

    if not sampled_pixels:
        raise HTTPException(status_code=422, detail="Could not sample skin pixels.")

    all_pixels  = np.vstack(sampled_pixels).astype(np.float32)
    avg_rgb     = np.mean(all_pixels, axis=0)
    avg_rgb_img = np.uint8([[avg_rgb]])
    avg_lab     = cv2.cvtColor(avg_rgb_img, cv2.COLOR_RGB2LAB)[0][0]

    L = float(avg_lab[0])
    a = float(avg_lab[1])
    b = float(avg_lab[2])
    b_centered = b - 128

    if b_centered > 5:
        tone = "Warm"
    elif b_centered < -5:
        tone = "Cool"
    else:
        tone = "Neutral"

    colors = SKIN_TONE_COLORS[tone]

    return {
        "skin_tone":    tone,
        "best_colors":  colors["best"],
        "avoid_colors": colors["avoid"],
        "tip":          colors["tip"],
        "lab_values": {
            "L": round(L, 1),
            "a": round(a - 128, 1),
            "b": round(b_centered, 1),
        }
    }
