# TryNStyle — AI-Powered Virtual Try-On Eyewear Store

An eyewear e-commerce platform with AI-powered virtual try-on, face shape detection, and skin tone analysis.

## Features
- 👓 **Virtual Try-On** — overlay glasses on live webcam feed in real time
- 🤖 **Face Shape Detection** — MobileNetV2 model classifies face as Oval, Round, Square, Heart, or Oblong and recommends suitable frames
- 🎨 **Skin Tone Analysis** — detects warm/cool/neutral undertones and suggests matching frame colors
- 🛒 **Full E-Commerce** — product management, orders, payments, and admin dashboard

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Redux Toolkit, Tailwind CSS |
| Backend | NestJS, TypeORM, PostgreSQL 16, Redis |
| AI Service | Python FastAPI, TensorFlow 2.16, MediaPipe, OpenCV |
| Infrastructure | Docker, Docker Compose |

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Node.js 20+](https://nodejs.org/) installed
- [Git](https://git-scm.com/) installed

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/laiba-maqsood/tryNstyle.git
cd tryNstyle
```

### 2. Set up environment variables

Create `e-store-back-end/.env`:
```env
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=estore
DB_PASSWORD=estore123
DB_NAME=estore
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
```

Create `e-store-front-end/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_AI_URL=http://localhost:8000
```

### 3. Add the AI model
Place your trained `best_model.keras` file inside `e-store-ai/` folder.
> The model file is not included in this repository due to its size.

### 4. Start backend services (Docker)
```bash
cd e-store-back-end
docker compose up --build
```
This starts the NestJS backend, PostgreSQL, Redis, and the AI service.

### 5. Set up the database
```bash
docker exec -it estore-backend sh -c "npx typeorm -d dist/core/config/datasource.js schema:sync"
docker exec -it estore-backend sh -c "node dist/core/db/seed/admin.seed.js"
docker exec -it estore-backend sh -c "node dist/core/db/seed/category.seed.js"
```

### 6. Start the frontend
```bash
cd e-store-front-end
npm install
npm run dev
```

## Access the App

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| AI Service | http://localhost:8000 |
| Admin Panel | http://localhost:3000/login |

## Admin Credentials
```
Email:    admin@example.com
Password: admin123
```

## AI Endpoints
| Endpoint | Description |
|---|---|
| `POST /detect-face-shape` | Classifies face shape from image |
| `POST /get-face-landmarks` | Returns eye landmark coordinates for glasses overlay |
| `POST /analyze-skin-tone` | Detects warm/cool/neutral skin undertone |

