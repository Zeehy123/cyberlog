from sklearn.ensemble import IsolationForest
import pandas as pd

def detect_anomalies(df):

    ip_counts = (
        df.groupby("ip")
        .size()
        .reset_index(name="request_count")
    )

    model = IsolationForest(
        contamination=0.2,
        random_state=42
    )

    ip_counts["anomaly"] = model.fit_predict(
        ip_counts[["request_count"]]
    )

    suspicious = ip_counts[
        ip_counts["anomaly"] == -1
    ]

    return suspicious.to_dict(orient="records")