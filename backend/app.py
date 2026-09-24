from flask import Flask, jsonify
from flask_cors import CORS
import psutil

app = Flask(__name__)
CORS(app)


@app.route("/api/system")
def system_stats():
    cpu = psutil.cpu_percent(interval=0.5)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    return jsonify({
        "cpu": cpu,
        "memory": memory.percent,
        "disk": disk.percent
    })

@app.route("/api/network")
def network_stats():
    network = psutil.net_io_counters()

    return jsonify({
        "bytes_sent": network.bytes_sent,
        "bytes_received": network.bytes_recv
    })

@app.route("/api/processes")
def process_stats():
    processes = []

    for process in psutil.process_iter(
        ["pid", "name", "cpu_percent", "memory_percent"]
    ):
        try:
            processes.append({
                "pid": process.info["pid"],
                "name": process.info["name"],
                "cpu": process.info["cpu_percent"],
                "memory": process.info["memory_percent"]
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    return jsonify(processes)


if __name__ == "__main__":
    app.run(debug=True)