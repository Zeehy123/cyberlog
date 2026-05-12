"""anomaly.py
Simple anomaly detection helpers.

This module provides a thin wrapper around a scikit-learn
IsolationForest model to flag IPs whose request counts appear
anomalous compared with the population.

Functions:
  - detect_anomalies(df): expects a pandas.DataFrame with an
    `ip` column and returns a list of suspicious IP records.
"""

from sklearn.ensemble import IsolationForest
import pandas as pd


def detect_anomalies(df):
    """Detect IPs with anomalous request counts.

    Args:
        df (pandas.DataFrame): parsed logs with an `ip` column.

    Returns:
        list[dict]: records for IPs classified as anomalies.

    Implementation notes:
    - Aggregates logs by `ip` to count requests per source.
    - Uses `IsolationForest` with a fixed contamination value
      to flag the top fraction of outliers.
    - Returns a list of dictionaries (suitable for JSON responses).
    """

    # Count requests per IP
    ip_counts = (
        df.groupby("ip")
        .size()
        .reset_index(name="request_count")
    )

    # Simple unsupervised model to find outliers in the counts
    model = IsolationForest(
        contamination=0.2,
        random_state=42
    )

    # fit_predict returns 1 for inliers and -1 for outliers
    ip_counts["anomaly"] = model.fit_predict(
        ip_counts[["request_count"]]
    )

    # Keep only the flagged records
    suspicious = ip_counts[
        ip_counts["anomaly"] == -1
    ]

    return suspicious.to_dict(orient="records")