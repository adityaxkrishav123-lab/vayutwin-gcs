# PROJECT VAIJAYANTI — VayuTwin GCS & 3D Digital Twin

AI-Enabled Real-Time Ground Control Station (GCS) and 3D Digital Twin for MALE UAV Aero Piston Engines.

---

## 📂 Architecture & Directory Structure

```
.
├── frontend/                 # React + Vite + Three.js GCS Application (Vercel Ready)
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/           # Translucent Glassmorphic UAV & 4-Cylinder TEI-PD170 Engine Twin
│   │   │   ├── gcs/          # SANJIVANI AI Advisory, Mission Logs, Telemetry Waveforms, Diagnostic Drawer
│   │   │   └── simulator/    # ECU Telemetry Simulator Dock (Input Giver)
│   │   ├── types/            # Telemetry State & Subsystem Interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
│
└── backend/                  # Standalone Python Telemetry Simulator (Render Ready)
    ├── server.py             # FastAPI & WebSocket Telemetry Server
    ├── requirements.txt
    └── render.yaml
```

---

## 🚀 Deployment Instructions

### 1. Frontend (Vercel)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

### 2. Backend (Render)
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
