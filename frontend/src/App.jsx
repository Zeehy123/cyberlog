import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MONO = "'JetBrains Mono', 'Fira Mono', monospace";

const SEVERITY_STYLES = {
  CRITICAL: { bg: "rgba(226,75,74,0.18)", color: "#ff6b6b", label: "CRIT" },
  HIGH: { bg: "rgba(226,75,74,0.12)", color: "#ff6b6b", label: "HIGH" },
  MEDIUM: { bg: "rgba(186,117,23,0.18)", color: "#fac775", label: "WARN" },
  LOW: { bg: "rgba(55,138,221,0.15)", color: "#85b7eb", label: "INFO" },
};

const PIE_COLORS = ["#e24b4a", "#ba7517", "#378add", "#639922", "#7f77dd"];

const cardStyle = {
  background: "#111",
  border: "1px solid #222",
  borderRadius: 16,
  padding: "20px 24px",
};

const labelStyle = {
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#666",
  marginBottom: 10,
};

function Badge({ sev }) {
  const s = SEVERITY_STYLES[sev] || SEVERITY_STYLES.MEDIUM;
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.05em",
        padding: "2px 7px",
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        flexShrink: 0,
      }}
    >
      {s.label}
    </span>
  );
}

function StatCard({ label, value, sub, subColor = "#666" }) {
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{label}</div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 42,
          fontWeight: 700,
          lineHeight: 1,
          color: "#fff",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: subColor,
            marginTop: 8,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#111",
    border: "1px solid #222",
    color: "#fff",
    fontFamily: MONO,
    fontSize: 11,
  },
  cursor: { fill: "rgba(255,255,255,0.04)" },
};

const TICK = { fill: "#555", fontFamily: MONO, fontSize: 10 };

export default function App() {
  const [data, setData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [liveLogs, setLiveLogs] = useState([]);
  const [now, setNow] = useState(
    new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC",
  );

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/analytics")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/logs");
    socket.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      setLiveLogs((prev) => [newLog, ...prev.slice(0, 9)]);
    };
    return () => socket.close();
  }, []);

  const uploadFile = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const res = await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const chartData = Object.entries(res.data.suspicious_ips).map(
        ([ip, count]) => ({ ip, count }),
      );
      setData({ ...res.data, chartData });
    } catch (error) {
      console.error(error);
    }
  };

  if (!data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            color: "#555",
            fontSize: 13,
            letterSpacing: "0.1em",
          }}
        >
          LOADING DASHBOARD...
        </span>
      </div>
    );
  }

  const pieData = [
    { name: "Auth failures", value: 34 },
    { name: "SQL injection", value: 22 },
    { name: "Port scans", value: 18 },
    { name: "Brute force", value: 15 },
    { name: "Data exfil", value: 11 },
  ];

  const weekData = [
    { day: "Mon", alerts: 12 },
    { day: "Tue", alerts: 9 },
    { day: "Wed", alerts: 15 },
    { day: "Thu", alerts: 8 },
    { day: "Fri", alerts: 21 },
    { day: "Sat", alerts: 6 },
    { day: "Sun", alerts: data.alerts?.length ?? 47 },
  ];

  const topIPs = data.anomalies?.length
    ? data.anomalies.map((a) => ({
        ip: a.ip,
        count: a.request_count,
        tag: a.request_count > 500 ? "THREAT" : "WATCH",
        color: a.request_count > 500 ? "#e24b4a" : "#ba7517",
        tagBg:
          a.request_count > 500
            ? "rgba(226,75,74,0.18)"
            : "rgba(186,117,23,0.18)",
      }))
    : [
        {
          ip: "185.220.101.42",
          count: 847,
          tag: "THREAT",
          color: "#e24b4a",
          tagBg: "rgba(226,75,74,0.18)",
        },
        {
          ip: "192.168.1.104",
          count: 612,
          tag: "WATCH",
          color: "#ba7517",
          tagBg: "rgba(186,117,23,0.18)",
        },
        {
          ip: "10.0.0.23",
          count: 467,
          tag: "INTERNAL",
          color: "#378add",
          tagBg: "rgba(55,138,221,0.15)",
        },
        {
          ip: "45.33.32.156",
          count: 349,
          tag: "WATCH",
          color: "#ba7517",
          tagBg: "rgba(186,117,23,0.18)",
        },
        {
          ip: "172.16.0.5",
          count: 254,
          tag: "INTERNAL",
          color: "#639922",
          tagBg: "rgba(99,153,34,0.15)",
        },
        {
          ip: "103.21.244.0",
          count: 163,
          tag: "THREAT",
          color: "#e24b4a",
          tagBg: "rgba(226,75,74,0.18)",
        },
      ];

  const maxCount = Math.max(...topIPs.map((r) => r.count));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "28px 32px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            Log Analysis &amp; Anomaly Detection
          </h1>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 11,
              color: "#555",
              marginTop: 6,
            }}
          >
            system: prod-cluster-01 &nbsp;|&nbsp; last updated: {now}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid rgba(226,75,74,0.4)",
              borderRadius: 8,
              padding: "7px 14px",
              background: "rgba(226,75,74,0.08)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#e24b4a",
                animation: "pulse 1.5s ease-in-out infinite",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                color: "#e24b4a",
                letterSpacing: "0.08em",
              }}
            >
              THREAT LEVEL: ELEVATED
            </span>
          </div>
          {/* Upload */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                background: "#1a3a5c",
                border: "1px solid #185fa5",
                color: "#85b7eb",
                borderRadius: 8,
                padding: "6px 6px",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            />
            <button
              onClick={uploadFile}
              style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                background: "#1a3a5c",
                border: "1px solid #185fa5",
                color: "#85b7eb",
                borderRadius: 8,
                padding: "6px 14px",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              ANALYZE LOGS
            </button>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <StatCard
          label="Total Events"
          value={data.total_logs?.toLocaleString() ?? "14,892"}
          sub="↑ +2,341 vs yesterday"
          subColor="#639922"
        />
        <StatCard
          label="Anomalies"
          value={
            <span style={{ color: "#e24b4a" }}>
              {data.failed_requests ?? "47"}
            </span>
          }
          sub="↑ +19 vs yesterday"
          subColor="#e24b4a"
        />
        <StatCard
          label="Critical Alerts"
          value={
            <span style={{ color: "#ba7517" }}>
              {data.alerts?.filter((a) => a.severity === "CRITICAL").length ??
                "8"}
            </span>
          }
          sub="3 require action"
          subColor="#ba7517"
        />
        <StatCard
          label="Uptime"
          value="99.7%"
          sub="18m downtime today"
          subColor="#639922"
        />
      </div>

      {/* EVENT VOLUME CHART */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={labelStyle}>Event Volume (24h) — anomalies highlighted</div>
        <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
          {[
            ["#378add", "Normal events"],
            ["#e24b4a", "Anomaly spikes"],
          ].map(([color, label]) => (
            <span
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: MONO,
                fontSize: 11,
                color: "#666",
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 3,
                  background: color,
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              {label}
            </span>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.traffic_data} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis
              dataKey="time"
              tick={TICK}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={TICK} axisLine={false} tickLine={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar
              dataKey="normal"
              stackId="a"
              fill="#378add"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="anomaly"
              stackId="a"
              fill="#e24b4a"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* EVENT TYPES + ALERTS OVER TIME */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Donut */}
        <div style={cardStyle}>
          <div style={labelStyle}>Event Types</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 16px",
              marginBottom: 12,
            }}
          >
            {pieData.map((p, i) => (
              <span
                key={p.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: MONO,
                  fontSize: 10,
                  color: "#888",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: PIE_COLORS[i],
                    display: "inline-block",
                  }}
                />
                {p.name} {p.value}%
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts over time */}
        <div style={cardStyle}>
          <div style={labelStyle}>Alerts Over Time (7d)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis
                dataKey="day"
                tick={TICK}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={TICK} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => `${v} alerts`} />
              <Bar
                dataKey="alerts"
                radius={[4, 4, 0, 0]}
                fill="#378add"
                label={false}
                isAnimationActive={true}
              >
                {weekData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.alerts > 30
                        ? "#e24b4a"
                        : entry.alerts > 15
                          ? "#ba7517"
                          : "#378add"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TOP IPS + LIVE LOG STREAM */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Top IPs */}
        <div style={cardStyle}>
          <div style={labelStyle}>Top Source IPs</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topIPs.map((row) => (
              <div
                key={row.ip}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: "#555",
                    width: 118,
                    flexShrink: 0,
                  }}
                >
                  {row.ip}
                </span>
                <div
                  style={{
                    flex: 1,
                    background: "#1a1a1a",
                    borderRadius: 3,
                    height: 5,
                  }}
                >
                  <div
                    style={{
                      width: `${Math.round((row.count / maxCount) * 100)}%`,
                      height: 5,
                      borderRadius: 3,
                      background: row.color,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: row.color,
                    width: 32,
                    textAlign: "right",
                  }}
                >
                  {row.count}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 4,
                    background: row.tagBg,
                    color: row.color,
                    letterSpacing: "0.05em",
                    flexShrink: 0,
                  }}
                >
                  {row.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Log Stream */}
        <div style={{ ...cardStyle, maxHeight: 300, overflowY: "auto" }}>
          <div style={labelStyle}>Live Log Stream</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {(liveLogs.length > 0
              ? liveLogs
              : (data.alerts?.slice(0, 8) ?? [])
            ).map((log, i) => {
              const sev = log.severity ?? (log.status >= 400 ? "HIGH" : "LOW");
              const msg = log.type
                ? `${log.type} — Source IP: ${log.ip}`
                : `${log.ip} — Status: ${log.status} (${log.requests} reqs)`;
              const ts = new Date().toLocaleTimeString("en-GB");
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    padding: "6px 0",
                    borderBottom: "1px solid #1a1a1a",
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      color: "#444",
                      flexShrink: 0,
                      paddingTop: 1,
                    }}
                  >
                    {ts}
                  </span>
                  <Badge sev={sev} />
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      lineHeight: 1.5,
                      color:
                        sev === "CRITICAL" || sev === "HIGH"
                          ? "#ff6b6b"
                          : sev === "MEDIUM"
                            ? "#fac775"
                            : "#888",
                      flex: 1,
                    }}
                  >
                    {msg}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #000; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
