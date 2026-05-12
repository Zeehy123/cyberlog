def detect_attacks(df):

    alerts = []

    # Brute force detection
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

    # Admin access attempts
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

    # SQL injection detection
    sql_keywords = [
        "'",
        "OR",
        "SELECT",
        "DROP"
    ]

    for _, row in df.iterrows():

        endpoint = str(row["endpoint"])

        if any(
            keyword.lower() in endpoint.lower()
            for keyword in sql_keywords
        ):

            alerts.append({
                "ip": row["ip"],
                "type": "Possible SQL Injection",
                "severity": "CRITICAL"
            })

    # DDoS-style spike detection
    request_counts = (
        df.groupby("ip")
        .size()
    )

    for ip, count in request_counts.items():

        if count >= 8:

            alerts.append({
                "ip": ip,
                "type": "DDoS-like Traffic Spike",
                "severity": "HIGH"
            })

    return alerts