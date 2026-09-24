from pathlib import Path

from fastapi.staticfiles import StaticFiles

from api.index import app

BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR / "dist"

if DIST_DIR.exists():
    app.mount(
        "/",
        StaticFiles(
            directory=DIST_DIR,
            html=True
        ),
        name="frontend"
    )