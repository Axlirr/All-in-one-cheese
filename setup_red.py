import os
import urllib.parse
import json
from pathlib import Path

instance_name = os.getenv("RED_INSTANCE_NAME", "renderbot")
uri = os.getenv("POSTGRES_URI")

config_dir = Path.home() / ".config" / "Red-DiscordBot"
config_file = config_dir / "config.json"

if not config_file.exists():
    print(f"Setting up new Red-DiscordBot instance: {instance_name}")
    config_dir.mkdir(parents=True, exist_ok=True)
    
    data_path = f"/app/data/{instance_name}"
    os.makedirs(data_path, exist_ok=True)

    config = {
        instance_name: {
            "DATA_PATH": data_path,
            "COG_PATH_APPEND": "cogs",
            "CORE_PATH_APPEND": "core"
        }
    }

    if uri:
        print("Detected POSTGRES_URI! Parsing credentials...")
        parsed = urllib.parse.urlparse(uri)
        config[instance_name]["STORAGE_TYPE"] = "Postgres"
        config[instance_name]["STORAGE_DETAILS"] = {
            "driver": "postgres",
            "host": parsed.hostname,
            "port": parsed.port or 5432,
            "user": parsed.username,
            "password": parsed.password,
            "database": parsed.path.lstrip('/')
        }
    else:
        print("No database URI provided. Defaulting to local JSON storage.")
        config[instance_name]["STORAGE_TYPE"] = "JSON"
        config[instance_name]["STORAGE_DETAILS"] = {}

    with open(config_file, "w") as f:
        json.dump(config, f, indent=4)
        
    print("Config file successfully generated.")
else:
    print(f"Instance {instance_name} already configured.")
