import psutil

# CPU
cpu = psutil.cpu_percent(interval=1)

# Memory
memory = psutil.virtual_memory()

# Disk
disk = psutil.disk_usage("/")

# Network
network = psutil.net_io_counters()

# Processes
processes = list(psutil.process_iter(
    ["pid", "name", "cpu_percent", "memory_percent"]
))

print("========== LINUX SYSTEM MONITOR ==========")

print("\nSYSTEM")
print("-------------------------------------------")
print(f"CPU Usage     : {cpu}%")
print(f"RAM Usage     : {memory.percent}%")
print(f"RAM Available : {memory.available / (1024 ** 3):.2f} GB")
print(f"Disk Usage    : {disk.percent}%")

print("\nNETWORK")
print("-------------------------------------------")
print(f"Data Sent     : {network.bytes_sent / (1024 ** 2):.2f} MB")
print(f"Data Received : {network.bytes_recv / (1024 ** 2):.2f} MB")

print("\nRUNNING PROCESSES")
print("-------------------------------------------")

for process in processes[:10]:
    print(
        f"PID: {process.info['pid']} | "
        f"Name: {process.info['name']}"
    )