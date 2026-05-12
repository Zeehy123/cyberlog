"""detector.py

Heuristic detection rules for common web attacks.

The functions in this module perform simple, explainable checks
over the parsed log DataFrame and return alert dictionaries that
can be shown on the dashboard. These are intentionally simple
signatures (thresholds, string matches) rather than ML models.
"""

def detect_attacks(df):
    """Scan parsed logs and produce alert records.

    Args:
        df (pandas.DataFrame): logs with `ip`, `endpoint`, and `status`.

    Returns:
        list[dict]: alert objects with `ip`, `type`, and `severity`.
    """

    alerts = []

    # --- Brute force detection ---
    # Count 401 (unauthorized) responses per IP and flag those
    # with repeated failures. Threshold is a simple heuristic.
    brute_force = (
        df[df["status"] == 401]
        .groupby("ip")
        .size()
    )

    for ip, count in brute_force.items():
        if count >= 4:
            alerts.append({
                "ip": ip,
                "type": "Brute Force Attack",
                "severity": "HIGH"
            })

    # --- Sensitive endpoint access ---
    # Flag requests to common admin/login paths which often indicate
    # probing or targeted access attempts.
    admin_paths = [
        "/admin",
        "/wp-admin",
        "/login"
    ]

    for _, row in df.iterrows():
        if row["endpoint"] in admin_paths:
            alerts.append({
                "ip": row["ip"],
                "type": "Sensitive Endpoint Access",
                "severity": "MEDIUM"
            })

    # --- SQL injection heuristics ---
    # Very basic keyword matching in the requested endpoint string.
    # This is noisy but helpful for demo/alerts; production systems
    # would use more robust parsers and escaping checks.
    sql_keywords = [
        "'",
        "OR",
        "SELECT",
        "DROP"
    ]

    for _, row in df.iterrows():
        endpoint = str(row["endpoint"])
        if any(keyword.lower() in endpoint.lower() for keyword in sql_keywords):
            alerts.append({
                "ip": row["ip"],
                "type": "Possible SQL Injection",
                "severity": "CRITICAL"
            })

    # --- DDoS-like spike detection ---
    # Flag IPs that produce a high number of requests overall.
    request_counts = df.groupby("ip").size()
    for ip, count in request_counts.items():
        if count >= 8:
            alerts.append({
                "ip": ip,
                "type": "DDoS-like Traffic Spike",
                "severity": "HIGH"
            })

    return alerts