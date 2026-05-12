"""parser.py

Tiny log parser used by the demo backend. The parser expects a
whitespace-separated log format where the first token is the source
IP and the last token is the HTTP status code. Everything between
is treated as the endpoint (and a fixed position is used for the
HTTP method for simplicity).

This is intentionally simple for demonstration; production log
parsers should use structured formats (JSON, Common Log Format,
or similar) and robust error handling.
"""

import pandas as pd


def parse_logs(file_path):
    """Read a log file and return a pandas DataFrame.

    Args:
        file_path (str): path to a plain-text log file.

    Returns:
        pandas.DataFrame: columns `ip`, `method`, `endpoint`, `status`.
    """

    logs = []

    with open(file_path, "r") as file:
        for line in file:
            # Split on whitespace and map tokens to fields.
            parts = line.strip().split()
            # Defensive checks could be added here in case of malformed lines.
            ip = parts[0]
            method = parts[2]
            status = int(parts[-1])
            endpoint = " ".join(parts[3:-1])

            logs.append({
                "ip": ip,
                "method": method,
                "endpoint": endpoint,
                "status": status,
            })

    return pd.DataFrame(logs)