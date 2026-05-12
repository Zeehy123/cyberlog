import pandas as pd

def parse_logs(file_path):

    logs = []

    with open(file_path, "r") as file:

        for line in file:

            parts = line.strip().split()

            ip = parts[0]

            method = parts[2]

            status = int(parts[-1])

            endpoint = " ".join(parts[3:-1])

            logs.append({
                "ip": ip,
                "method": method,
                "endpoint": endpoint,
                "status": status
            })

    return pd.DataFrame(logs)