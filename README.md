# 🐧 Linux System Monitor Dashboard

A real-time Linux system monitoring dashboard built with **Python, Flask, psutil, React, and Recharts**.

The application collects system-level metrics from a Linux environment and presents them through an interactive web dashboard.

---

## 🚀 Features

- 📊 Real-time CPU usage monitoring
- 🧠 Real-time memory usage monitoring
- 💾 Disk usage monitoring
- 🌐 Network traffic monitoring
- ⚙️ Running process monitoring
- 📈 Live performance charts
- 📋 Top process resource usage
- 🔄 Automatic data refresh
- 🐧 Linux system-level monitoring

---

## 🛠️ Tech Stack

### Backend
- Python
- Flask
- Flask-CORS
- psutil

### Frontend
- React
- Vite
- Recharts
- CSS

### Environment
- Linux / WSL2
- Git
- GitHub

---

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│        React Frontend        │
│      Vite + Recharts         │
└──────────────┬───────────────┘
               │
               │ HTTP API
               ▼
┌──────────────────────────────┐
│       Flask Backend          │
│          Python              │
└──────────────┬───────────────┘
               │
               │ psutil
               ▼
┌──────────────────────────────┐
│       Linux System           │
│ CPU • RAM • Disk • Network   │
│          Processes           │
└──────────────────────────────┘

linux-monitor/
│
├── backend/
│   ├── app.py
│   ├── monitor.py
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
