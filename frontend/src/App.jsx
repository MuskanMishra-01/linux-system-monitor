import { useEffect, useState } from "react";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./App.css";

function App() {
  const [system, setSystem] = useState(null);
  const [network, setNetwork] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [error, setError] = useState(null);

  const [cpuHistory, setCpuHistory] = useState([]);
  const [memoryHistory, setMemoryHistory] = useState([]);
  const [networkHistory, setNetworkHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [systemResponse, networkResponse, processesResponse] =
          await Promise.all([
            fetch("http://127.0.0.1:5000/api/system"),
            fetch("http://127.0.0.1:5000/api/network"),
            fetch("http://127.0.0.1:5000/api/processes"),
          ]);

        if (
          !systemResponse.ok ||
          !networkResponse.ok ||
          !processesResponse.ok
        ) {
          throw new Error("Monitoring API request failed");
        }

        const systemData = await systemResponse.json();
        const networkData = await networkResponse.json();
        const processesData = await processesResponse.json();

        setSystem(systemData);
        setNetwork(networkData);
        setProcesses(processesData);
        setError(null);

        const currentTime = new Date().toLocaleTimeString();

        /* =========================
           CPU HISTORY
        ========================= */

        setCpuHistory((previous) => {
          const point = {
            time: currentTime,
            cpu: Number(systemData.cpu),
          };

          return [...previous, point].slice(-30);
        });

        /* =========================
           MEMORY HISTORY
        ========================= */

        setMemoryHistory((previous) => {
          const point = {
            time: currentTime,
            memory: Number(systemData.memory),
          };

          return [...previous, point].slice(-30);
        });

        /* =========================
           NETWORK HISTORY
        ========================= */

        setNetworkHistory((previous) => {
          let uploadMbps = 0;
          let downloadMbps = 0;

          if (previous.length > 0) {
            const previousPoint = previous[previous.length - 1];

            const sentDifference =
              networkData.bytes_sent - previousPoint.rawSent;

            const receivedDifference =
              networkData.bytes_received - previousPoint.rawReceived;

            // Polling interval is approximately 2 seconds.
            uploadMbps = (Math.max(sentDifference, 0) * 8) / 2 / 1024 / 1024;

            downloadMbps =
              (Math.max(receivedDifference, 0) * 8) / 2 / 1024 / 1024;
          }

          const point = {
            time: currentTime,
            upload: Number(uploadMbps.toFixed(3)),
            download: Number(downloadMbps.toFixed(3)),
            rawSent: networkData.bytes_sent,
            rawReceived: networkData.bytes_received,
          };

          return [...previous, point].slice(-30);
        });
      } catch (error) {
        console.error("Monitoring error:", error);

        setError("Could not connect to the Linux monitoring server.");
      }
    };

    loadData();

    const interval = setInterval(loadData, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /*
   * Process chart data.
   *
   * We use memory usage here because Linux processes
   * can often show very small CPU values when the
   * machine is idle.
   */
  const processChartData = processes
    .slice()
    .sort((a, b) => (b.memory || 0) - (a.memory || 0))
    .slice(0, 8)
    .map((process) => ({
      name:
        process.name && process.name.length > 14
          ? process.name.substring(0, 14) + "..."
          : process.name || "Unknown",
      memory: Number((process.memory || 0).toFixed(2)),
    }));

  return (
    <div className="app">
      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">
        <div className="brand">
          <div className="penguin">🐧</div>

          <h2>Linux</h2>

          <span>System Monitor</span>
        </div>

        <nav className="navigation">
          <button className="nav-item active">
            <span>▣</span>
            Dashboard
          </button>

          <button className="nav-item">
            <span>☷</span>
            Processes
          </button>

          <button className="nav-item">
            <span>⌁</span>
            Network
          </button>

          <button className="nav-item">
            <span>▤</span>
            System Info
          </button>

          <button className="nav-item">
            <span>▥</span>
            Logs
          </button>

          <button className="nav-item">
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <div className="connection">
          <span className="connection-dot"></span>

          <div>
            <strong>Connected</strong>

            <small>127.0.0.1:5000</small>
          </div>
        </div>
      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Linux System Monitor</h1>

            <p>Real-time system information from your Linux machine</p>
          </div>

          <div className="top-status">
            <span className="connection-dot"></span>
            Connected
          </div>
        </header>

        {/* ERROR */}

        {error && <div className="error">{error}</div>}

        {/* LOADING */}

        {!system && !error && (
          <div className="loading">Loading system information...</div>
        )}

        {/* =========================
            SYSTEM METRICS
        ========================= */}

        {system && (
          <section className="metrics-grid">
            {/* CPU */}

            <div className="metric-card cpu-card">
              <div className="metric-top">
                <div className="metric-icon">◉</div>

                <span>CPU Usage</span>
              </div>

              <div className="metric-value">{system.cpu}%</div>

              <div className="progress">
                <div
                  className="progress-fill cpu-fill"
                  style={{
                    width: `${Math.min(system.cpu, 100)}%`,
                  }}
                />
              </div>

              <small>Processor utilization</small>
            </div>

            {/* MEMORY */}

            <div className="metric-card memory-card">
              <div className="metric-top">
                <div className="metric-icon">▣</div>

                <span>Memory Usage</span>
              </div>

              <div className="metric-value">{system.memory}%</div>

              <div className="progress">
                <div
                  className="progress-fill memory-fill"
                  style={{
                    width: `${Math.min(system.memory, 100)}%`,
                  }}
                />
              </div>

              <small>RAM utilization</small>
            </div>

            {/* DISK */}

            <div className="metric-card disk-card">
              <div className="metric-top">
                <div className="metric-icon">◆</div>

                <span>Disk Usage</span>
              </div>

              <div className="metric-value">{system.disk}%</div>

              <div className="progress">
                <div
                  className="progress-fill disk-fill"
                  style={{
                    width: `${Math.min(system.disk, 100)}%`,
                  }}
                />
              </div>

              <small>Root filesystem usage</small>
            </div>
          </section>
        )}

        {/* =========================
            CPU + MEMORY CHARTS
        ========================= */}

        <section className="charts-grid">
          {/* CPU */}

          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">CPU Performance</div>

                <div className="chart-subtitle">
                  Real-time processor utilization
                </div>
              </div>

              <div className="chart-badge">LIVE</div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={cpuHistory}>
                  <defs>
                    <linearGradient
                      id="cpuGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#d13d57"
                        stopOpacity={0.45}
                      />

                      <stop offset="100%" stopColor="#d13d57" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#28161d" strokeDasharray="4 4" />

                  <XAxis
                    dataKey="time"
                    stroke="#80767c"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    domain={[0, 100]}
                    stroke="#80767c"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#100c0f",
                      border: "1px solid #63202e",
                      borderRadius: "10px",
                      color: "#ffffff",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#d13d57"
                    strokeWidth={2.5}
                    fill="url(#cpuGradient)"
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MEMORY */}

          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Memory Performance</div>

                <div className="chart-subtitle">Real-time RAM utilization</div>
              </div>

              <div className="chart-badge">LIVE</div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={memoryHistory}>
                  <defs>
                    <linearGradient
                      id="memoryGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#b52d45" stopOpacity={0.4} />

                      <stop offset="100%" stopColor="#b52d45" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#28161d" strokeDasharray="4 4" />

                  <XAxis
                    dataKey="time"
                    stroke="#80767c"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    domain={[0, 100]}
                    stroke="#80767c"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#100c0f",
                      border: "1px solid #63202e",
                      borderRadius: "10px",
                      color: "#ffffff",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="#b52d45"
                    strokeWidth={2.5}
                    fill="url(#memoryGradient)"
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* =========================
            NETWORK TRAFFIC
        ========================= */}

        <section className="full-width-section">
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Network Traffic</div>

                <div className="chart-subtitle">
                  Live upload and download activity
                </div>
              </div>

              <div className="chart-badge">LIVE</div>
            </div>

            <div className="network-summary">
              <div className="network-stat">
                <span>↑ Upload</span>

                <strong>
                  {networkHistory.length > 0
                    ? networkHistory[networkHistory.length - 1].upload.toFixed(
                        3,
                      )
                    : "0.000"}
                  <small> Mbps</small>
                </strong>
              </div>

              <div className="network-stat">
                <span>↓ Download</span>

                <strong>
                  {networkHistory.length > 0
                    ? networkHistory[
                        networkHistory.length - 1
                      ].download.toFixed(3)
                    : "0.000"}
                  <small> Mbps</small>
                </strong>
              </div>

              <div className="network-stat">
                <span>Total Sent</span>

                <strong>
                  {network
                    ? (network.bytes_sent / 1024 / 1024).toFixed(2)
                    : "0.00"}
                  <small> MB</small>
                </strong>
              </div>

              <div className="network-stat">
                <span>Total Received</span>

                <strong>
                  {network
                    ? (network.bytes_received / 1024 / 1024).toFixed(2)
                    : "0.00"}
                  <small> MB</small>
                </strong>
              </div>
            </div>

            <div className="network-chart">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={networkHistory}>
                  <defs>
                    <linearGradient
                      id="uploadGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#d13d57"
                        stopOpacity={0.35}
                      />

                      <stop offset="100%" stopColor="#d13d57" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient
                      id="downloadGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#8e5260" stopOpacity={0.3} />

                      <stop offset="100%" stopColor="#8e5260" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#28161d" strokeDasharray="4 4" />

                  <XAxis
                    dataKey="time"
                    stroke="#80767c"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    stroke="#80767c"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#100c0f",
                      border: "1px solid #63202e",
                      borderRadius: "10px",
                      color: "#ffffff",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="upload"
                    stroke="#d13d57"
                    strokeWidth={2}
                    fill="url(#uploadGradient)"
                    dot={false}
                    isAnimationActive={false}
                  />

                  <Area
                    type="monotone"
                    dataKey="download"
                    stroke="#8e5260"
                    strokeWidth={2}
                    fill="url(#downloadGradient)"
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-legend">
              <span>
                <i className="legend-upload"></i>
                Upload
              </span>

              <span>
                <i className="legend-download"></i>
                Download
              </span>
            </div>
          </div>
        </section>

        {/* =========================
            PROCESS USAGE + TABLE
        ========================= */}

        <section className="bottom-grid">
          {/* PROCESS CHART */}

          <div className="chart-card process-chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Process Resource Usage</div>

                <div className="chart-subtitle">
                  Top processes by memory consumption
                </div>
              </div>

              <div className="chart-badge">LIVE</div>
            </div>

            <div className="process-chart">
              <ResponsiveContainer width="100%" height={330}>
                <BarChart
                  data={processChartData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 20,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid stroke="#28161d" strokeDasharray="4 4" />

                  <XAxis
                    type="number"
                    stroke="#80767c"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    stroke="#80767c"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#100c0f",
                      border: "1px solid #63202e",
                      borderRadius: "10px",
                      color: "#ffffff",
                    }}
                  />

                  <Bar
                    dataKey="memory"
                    fill="#b52d45"
                    radius={[0, 5, 5, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PROCESS TABLE */}

          <div className="placeholder-card processes-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Top Processes</div>

                <div className="chart-subtitle">Active Linux processes</div>
              </div>

              <div className="process-count">{processes.length}</div>
            </div>

            {processes.length > 0 ? (
              <div className="process-table">
                <div className="process-row process-header">
                  <span>PID</span>

                  <span>Process</span>

                  <span>CPU</span>

                  <span>Memory</span>
                </div>

                {processes.slice(0, 10).map((process) => (
                  <div className="process-row" key={process.pid}>
                    <span>{process.pid}</span>

                    <span className="process-name">
                      {process.name || "Unknown"}
                    </span>

                    <span>{process.cpu?.toFixed(1)}%</span>

                    <span>{process.memory?.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>Loading process information...</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
