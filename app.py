from pathlib import Path

from fastapi.staticfiles import StaticFiles

from api.index import app


# Project root
BASE_DIR = Path(__file__).resolve().parent

# React production build
DIST_DIR = BASE_DIR / "dist"

# Serve the React/Vite frontend
# API routes from api/index.py are already registered before this mount.
if DIST_DIR.exists():
    app.mount(
        "/",
        StaticFiles(
            directory=DIST_DIR,
            html=True
        ),
        name="frontend"
    )