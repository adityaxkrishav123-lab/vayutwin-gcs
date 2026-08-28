"""
VayuTwin Telemetry Simulator Backend & SURAKSHA Standard Data Gateway
Streams 200ms standardized ECU telemetry JSON packets to connected GCS clients,
handles 8 preset emergency scenarios + compound mode, and serves the standalone ECU simulator.
Ready for 1-click deployment on Render / Railway.
"""

import asyncio
import os
import random
import time
from typing import List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel

app = FastAPI(title="VayuTwin Telemetry Simulator API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TelemetryState(BaseModel):
    engine_on: bool = True
    mission_active: bool = True
    rpm: int = 4800
    airspeed: float = 95.0
    cht_cyl1: float = 178.0
    cht_cyl2: float = 180.0
    cht_cyl3: float = 184.0
    cht_cyl4: float = 176.0
    oil_pressure: float = 42.5
    fuel_level: float = 100.0
    vibration: float = 1.4
    altitude: int = 18000
    oat: float = 24.0
    wind_speed: float = 18.0
    wind_direction: int = 240
    terrain: str = "farmland"
    active_scenario: Optional[str] = None
    active_faults: List[str] = []

class UpdateStateRequest(BaseModel):
    engine_on: Optional[bool] = None
    mission_active: Optional[bool] = None
    rpm: Optional[int] = None
    airspeed: Optional[float] = None
    cht_cyl1: Optional[float] = None
    cht_cyl2: Optional[float] = None
    cht_cyl3: Optional[float] = None
    cht_cyl4: Optional[float] = None
    oil_pressure: Optional[float] = None
    fuel_level: Optional[float] = None
    vibration: Optional[float] = None
    altitude: Optional[int] = None
    oat: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[int] = None
    terrain: Optional[str] = None

class ScenarioRequest(BaseModel):
    scenario_id: str

state = TelemetryState()

@app.get("/")
def read_root():
    return {"status": "VayuTwin Telemetry Server Online", "timestamp": time.time(), "simulator_url": "/simulator"}

@app.get("/simulator", response_class=HTMLResponse)
def get_simulator_page():
    sim_path = os.path.join(os.path.dirname(__file__), "static", "simulator.html")
    if os.path.exists(sim_path):
        return FileResponse(sim_path)
    return HTMLResponse("<h1>Standalone Simulator HTML File Missing</h1>")

@app.get("/api/telemetry")
def get_telemetry():
    return state.dict()

@app.post("/api/simulator/update")
def update_telemetry(req: UpdateStateRequest):
    global state
    for field, val in req.dict(exclude_unset=True).items():
        setattr(state, field, val)
    return {"status": "success", "state": state.dict()}

@app.post("/api/simulator/scenario")
def trigger_scenario(req: ScenarioRequest):
    global state
    scen = req.scenario_id
    state.active_scenario = scen

    if scen == "overheat":
        state.cht_cyl3 = 242.0
    elif scen == "fuel_leak":
        state.fuel_level = 48.0
    elif scen == "stuck_throttle":
        state.rpm = 5800
    elif scen == "power_loss":
        state.rpm = 2200
        state.airspeed = 52.0
    elif scen == "oil_loss":
        state.oil_pressure = 11.2
    elif scen == "high_vibration":
        state.vibration = 6.4
    elif scen == "cooling_failure":
        state.active_faults = ["cooling"]
    elif scen == "sensor_drift":
        state.active_faults = ["sensor"]
    elif scen == "compound":
        state.fuel_level = 28.0
        state.wind_speed = 38.0
        state.terrain = "mountain"
        state.altitude = 26000
        state.cht_cyl3 = 245.0

    return {"status": "scenario_triggered", "active_scenario": scen, "state": state.dict()}

@app.post("/api/simulator/reset")
def reset_mission():
    global state
    state = TelemetryState()
    return {"status": "reset_success", "state": state.dict()}

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            if state.mission_active and state.engine_on:
                leak_rate = 0.08 if state.active_scenario in ["fuel_leak", "compound"] else 0.005
                state.fuel_level = max(0.0, state.fuel_level - (state.rpm / 5000) * leak_rate)

            jitter_rpm = random.randint(-15, 15) if state.engine_on else 0
            packet = {
                "timestamp": time.strftime("%H:%M:%S"),
                "engine_on": state.engine_on,
                "mission_active": state.mission_active,
                "rpm": state.rpm + jitter_rpm if state.engine_on else 0,
                "airspeed": state.airspeed,
                "cht": [
                    round(state.cht_cyl1 + (random.uniform(-0.4, 0.4) if state.engine_on else 0), 1),
                    round(state.cht_cyl2 + (random.uniform(-0.4, 0.4) if state.engine_on else 0), 1),
                    round(state.cht_cyl3 + (random.uniform(-0.4, 0.4) if state.engine_on else 0), 1),
                    round(state.cht_cyl4 + (random.uniform(-0.4, 0.4) if state.engine_on else 0), 1),
                ],
                "oil_pressure": round(state.oil_pressure + (random.uniform(-0.1, 0.1) if state.engine_on else 0), 1),
                "fuel_level": round(state.fuel_level, 1),
                "vibration": round(state.vibration + (random.uniform(-0.04, 0.04) if state.engine_on else 0), 2),
                "altitude": state.altitude,
                "oat": state.oat,
                "wind_speed": state.wind_speed,
                "wind_direction": state.wind_direction,
                "terrain": state.terrain,
                "active_scenario": state.active_scenario,
                "active_faults": state.active_faults,
            }
            await websocket.send_json(packet)
            await asyncio.sleep(0.2) # 200ms telemetry rate
    except WebSocketDisconnect:
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
