import os
import urllib.parse
import subprocess

instance_name = os.getenv("RED_INSTANCE_NAME", "renderbot")
uri = os.getenv("POSTGRES_URI")

if not os.path.exists(f"/app/data/{instance_name}"):
    print(f"Setting up new Red-DiscordBot instance: {instance_name}")
    if uri:
        print("Detected POSTGRES_URI! Parsing credentials...")
        parsed = urllib.parse.urlparse(uri)
        cmd = [
            "redbot-setup", "--instance-name", instance_name, "--no-prompt",
            "--backend", "postgres",
            "--db-user", parsed.username,
            "--db-password", parsed.password,
            "--db-host", parsed.hostname,
            "--db-port", str(parsed.port or 5432),
            "--db-name", parsed.path.lstrip('/')
        ]
    else:
        print("No database URI provided. Defaulting to local JSON storage.")
        cmd = [
            "redbot-setup", "--instance-name", instance_name,
            "--data-path", f"/app/data/{instance_name}",
            "--no-prompt", "--backend", "json"
        ]
    
    # Hide password in logs
    log_cmd = list(cmd)
    if "--db-password" in log_cmd:
        idx = log_cmd.index("--db-password")
        log_cmd[idx + 1] = "********"
    print(f"Running setup: {' '.join(log_cmd)}")
    
    subprocess.run(cmd, check=True)
else:
    print(f"Instance {instance_name} already configured.")
