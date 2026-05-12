from fastapi import FastAPI  # import FastAPI to create the application instance
from fastapi import WebSocket  # import WebSocket type for websocket endpoints
import asyncio  # asyncio utilities (sleep, event loop)
from fastapi import UploadFile, File  # types used for file upload endpoints
import shutil  # used to copy uploaded file streams to disk
from app.detector import detect_attacks  # import attack-detection heuristics
from app.parser import parse_logs  # import the simple log parser
from fastapi.middleware.cors import CORSMiddleware  # CORS middleware for cross-origin access
import random  # used to synthesize demo traffic and websocket messages
from app.anomaly import detect_anomalies  # import anomaly detection helper
app = FastAPI()  # instantiate the FastAPI application
from fastapi.middleware.cors import CORSMiddleware  # duplicate import (harmless)

# Configure CORS middleware to allow the frontend and deployments
app.add_middleware(
    CORSMiddleware,  # middleware class
    allow_origins=[
        "http://localhost:5173",          # local dev server origin
        "https://cyberlog-swart.vercel.app/",    # deployed frontend origin (example)
    ],
    allow_credentials=True,  # allow cookies/credentials
    allow_methods=["*"],  # allow all HTTP methods
    allow_headers=["*"],  # allow all headers
)
app.add_middleware(
    CORSMiddleware,  # permissive fallback for development
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")  # root health endpoint
def home():
    return {"message": "CyberLog AI Backend Running"}  # simple JSON response


@app.get("/analytics")  # analytics endpoint used by the dashboard
def analytics():
    df = parse_logs("sample.log")  # parse a sample log file into a DataFrame
    anomalies=detect_anomalies(df)  # run anomaly detection on parsed logs
    attacks = detect_attacks(df)  # run heuristic attack detection
    total_logs = len(df)  # total number of parsed log entries

    failed_requests = len(df[df["status"] >= 400])  # count failed (>=400) responses

    suspicious_ips = (
        df[df["status"] >= 400]  # filter to failed requests
        .groupby("ip")  # group by source IP
        .size()  # count occurrences per IP
        .to_dict()  # convert to a plain dict for JSON serialization
    )

    traffic_data = []  # synthetic traffic series for charting

    for hour in range(24):  # build 24 hourly buckets

        normal = random.randint(40, 80)  # synthetic normal traffic value

        anomaly_count = (
          random.randint(20, 60)
          if hour in [3, 7]
          else random.randint(0, 10)
      )  # synthetic anomaly spikes at specific hours

        traffic_data.append({
            "time": f"{hour:02d}:00",  # formatted hour label
            "normal": normal,  # normal traffic value
            "anomaly": anomaly_count  # anomaly traffic value
        })

    
    alerts = detect_attacks(df)  # run detection again (used by the frontend)

    return {
        "total_logs": total_logs,  # total parsed events
        "failed_requests": failed_requests,  # number of failed responses
        "suspicious_ips": suspicious_ips,  # map of IP -> failed count
        "traffic_data": traffic_data,  # synthetic hourly series
        "alerts": alerts,  # detected alerts list
        "anomalies": anomalies,  # anomaly records
    }
# Endpoint to handle log file uploads
@app.post("/upload")  # POST endpoint to receive uploaded log files
async def upload_log(file: UploadFile = File(...)):

    file_path = f"uploads/{file.filename}"  # destination path for the upload

    with open(file_path, "wb") as buffer:  # write uploaded bytes to disk
        shutil.copyfileobj(file.file, buffer)

    df = parse_logs(file_path)  # parse the saved log file into a DataFrame

    anomalies = detect_anomalies(df)  # detect anomalies in the uploaded file

    total_logs = len(df)  # number of events parsed from upload

    failed_requests = len(df[df["status"] >= 400])  # failed request count

    suspicious_ips = (
        df[df["status"] >= 400]  # failed requests grouped by IP
        .groupby("ip")
        .size()
        .to_dict()
    )

    
    alerts = detect_attacks(df)  # detect attacks in uploaded logs

    return {
        "total_logs": total_logs,
        "failed_requests": failed_requests,
        "suspicious_ips": suspicious_ips,
        "alerts": alerts,
        "anomalies": anomalies
    }
@app.websocket("/ws/logs")  # websocket endpoint providing a live demo stream
async def websocket_logs(websocket: WebSocket):

    await websocket.accept()  # accept the websocket connection

    while True:  # continuously send synthetic log messages

        fake_log = {
            "ip": f"192.168.1.{random.randint(1,20)}",  # random source IP
            "requests": random.randint(20, 150),  # random request count metric
            "status": random.choice([200, 401, 500]),  # random status for demo
        }

        await websocket.send_json(fake_log)  # push the message to the client

        await asyncio.sleep(2)  # pause between messages