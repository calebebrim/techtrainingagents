# Tiltfile to mirror the Makefile workflows with live local dev servers.
# It keeps the backend GraphQL API and the Vite frontend running under Tilt.

def load_env_file(path):
    contents = str(read_file(path, default=""))
    if contents == "":
        return {}

    env = {}
    for raw_line in contents.splitlines():
        line = raw_line.strip()
        if line == "" or line.startswith("#"):
            continue
        key_value = line.split("=", 1)
        if len(key_value) != 2:
            continue
        key = key_value[0].strip()
        value = key_value[1].strip()
        if len(value) >= 2 and value[0] == value[-1] and (value.startswith("\"") or value.startswith("'")):
            value = value[1:-1]
        env[key] = value
    return env


def merge_envs(env_list):
    merged = {}
    for env in env_list:
        for key, value in env.items():
            if value == None:
                continue
            if value == "":
                continue
            if value == True:
                merged[key] = "true"
            elif value == False:
                merged[key] = "false"
            else:
                merged[key] = str(value)
    return merged


env_vars = {}
env_vars.update(load_env_file(".env"))
env_vars.update(load_env_file(".env.local"))
if len(env_vars.keys()) == 0:
    print("No .env or .env.local found. Using sane defaults for Tilt resources.")


default_backend_url = env_vars.get("BACKEND_URL", "http://localhost:4000")
npm_bin = env_vars.get("NPM", "npm")

frontend_env = merge_envs([
    {
        "NODE_ENV": env_vars.get("FRONTEND_NODE_ENV", env_vars.get("NODE_ENV", "development")),
        "VITE_BACKEND_URL": env_vars.get("VITE_BACKEND_URL", default_backend_url),
        "VITE_GOOGLE_CLIENT_ID": env_vars.get("VITE_GOOGLE_CLIENT_ID"),
        "VITE_ALLOWED_HOSTS": env_vars.get("VITE_ALLOWED_HOSTS", "localhost"),
    }
])

backend_env = merge_envs([
    {
        "NODE_ENV": env_vars.get("NODE_ENV", "development"),
        "PORT": env_vars.get("PORT", "4000"),
        "AUTH_JWT_SECRET": env_vars.get("AUTH_JWT_SECRET", "change-me-in-development"),
        "GOOGLE_CLIENT_ID": env_vars.get("GOOGLE_CLIENT_ID"),
        "GOOGLE_CLIENT_SECRET": env_vars.get("GOOGLE_CLIENT_SECRET"),
        "SYNC_DB": env_vars.get("SYNC_DB"),
    }
])

frontend_dev_script = env_vars.get("FRONTEND_DEV_SCRIPT", "dev")
backend_start_script = env_vars.get("BACKEND_START_SCRIPT", "dev")

frontend_deps = [
    "frontend/package.json",
    "frontend/vite.config.ts",
    "frontend/tsconfig.json",
    "frontend/src",
    "frontend/public",
    ".env.local",
]

backend_deps = [
    "backend/package.json",
    "backend/src",
    ".env.local",
]

# Frontend: follow the same command as the Makefile start target.
local_resource(
    name="frontend",
    serve_dir="frontend",
    serve_env=frontend_env,
    serve_cmd=npm_bin + " run " + frontend_dev_script,
    deps=frontend_deps,
    readiness_probe=probe(
      period_secs=15,
      http_get=http_get_action(port=3000, path="/health")
   ),
)

# Backend: follow the Makefile start target with the same environment variables.
local_resource(
    name="backend",
    serve_dir="backend",
    serve_env=backend_env,
    serve_cmd=npm_bin + " run " + backend_start_script,
    readiness_probe=probe(
      period_secs=15,
      http_get=http_get_action(port=4000, path="/health")
   ),
    deps=backend_deps
)

# Manual helper to recreate the SQLite dev database (equivalent to `make db-init`).
db_init_env = merge_envs([backend_env, {"NODE_ENV": "development"}])
local_resource(
    name="db-init",
    cmd="rm -f data/dev.sqlite && " + npm_bin + " run migrate && " + npm_bin + " run seed",
    dir="backend",
    env=db_init_env,
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=False,
    labels=["database"],
)
