from fastapi import FastAPI
from fastapi import WebSocket
import asyncio
from fastapi import UploadFile, File
import shutil
from app.detector import detect_attacks
from app.parser import parse_logs
from fastapi.middleware.cors import CORSMiddleware
import random
from app.anomaly import detect_anomalies
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "CyberLog AI Backend Running"}

@app.get("/analytics")
def analytics():
    df = parse_logs("sample.log")
    anomalies=detect_anomalies(df)
    attacks = detect_attacks(df)
    total_logs = len(df)

    failed_requests = len(df[df["status"] >= 400])

    suspicious_ips = (
        df[df["status"] >= 400]
        .groupby("ip")
        .size()
        .to_dict()
    )

    traffic_data = []

    for hour in range(24):

        normal = random.randint(40, 80)

        anomaly_count = (
          random.randint(20, 60)
          if hour in [3, 7]
          else random.randint(0, 10)
      )

        traffic_data.append({
            "time": f"{hour:02d}:00",
            "normal": normal,
            "anomaly": anomaly_count 
        })

    
    alerts = detect_attacks(df)

    return {
        "total_logs": total_logs,
        "failed_requests": failed_requests,
        "suspicious_ips": suspicious_ips,
        "traffic_data": traffic_data,
        "alerts": alerts,
        "anomalies": anomalies,
    }
# Endpoint to handle log file uploads
@app.post("/upload")
async def upload_log(file: UploadFile = File(...)):

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    df = parse_logs(file_path)

    anomalies = detect_anomalies(df)

    total_logs = len(df)

    failed_requests = len(df[df["status"] >= 400])

    suspicious_ips = (
        df[df["status"] >= 400]
        .groupby("ip")
        .size()
        .to_dict()
    )

    
    alerts = detect_attacks(df)

    return {
        "total_logs": total_logs,
        "failed_requests": failed_requests,
        "suspicious_ips": suspicious_ips,
        "alerts": alerts,
        "anomalies": anomalies
    }
@app.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):

    await websocket.accept()

    while True:

        fake_log = {
            "ip": f"192.168.1.{random.randint(1,20)}",
            "requests": random.randint(20, 150),
            "status": random.choice([200, 401, 500]),
        }

        await websocket.send_json(fake_log)

        await asyncio.sleep(2)