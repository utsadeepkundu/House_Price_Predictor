from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# ======================================================
# PATHS
# ======================================================

BASE_DIR = Path(__file__).resolve().parent.parent

HOUSE_MODEL_PATH = BASE_DIR / "models" / "house_price_model.pkl"
RENT_MODEL_PATH = BASE_DIR / "models" / "rent_model.pkl"


# ======================================================
# LOAD HOUSE MODEL
# ======================================================

try:
    house_model = joblib.load(HOUSE_MODEL_PATH)
    print("House price model loaded successfully.")
except Exception as e:
    raise RuntimeError(
        f"Failed to load house price model: {e}"
    )


# ======================================================
# LOAD RENT MODEL
# ======================================================

try:
    rent_model = joblib.load(RENT_MODEL_PATH)
    print("Rent model loaded successfully.")
except Exception as e:
    raise RuntimeError(
        f"Failed to load rent model: {e}"
    )


# ======================================================
# FASTAPI APPLICATION
# ======================================================

app = FastAPI(
    title="Real Estate Predictor API",
    description="House price and rent prediction API",
    version="1.1.0"
)


# ======================================================
# CORS
# ======================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ======================================================
# HOUSE REQUEST MODEL
# ======================================================

class HousePredictionRequest(BaseModel):
    city: str
    locality: str
    locality_tier: str
    property_type: str
    bhk: int
    bathrooms: int
    balconies: int
    built_up_area: float
    carpet_area: float
    floor_number: int
    total_floors: int
    facing: str
    furnishing_status: str
    property_age: int
    parking_spaces: int
    transaction_type: str


# ======================================================
# RENT REQUEST MODEL
# ======================================================

class RentPredictionRequest(BaseModel):
    area: float


# ======================================================
# BASIC ROUTES
# ======================================================

@app.get("/api")
def home():
    return {
        "message": "Real Estate Predictor API is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "house_model": "loaded",
        "rent_model": "loaded"
    }


# ======================================================
# HOUSE PRICE PREDICTION
# ======================================================

@app.post("/api/predict/house")
def predict_house(data: HousePredictionRequest):

    try:
        input_data = pd.DataFrame([
            {
                "city": data.city,
                "locality": data.locality,
                "locality_tier": data.locality_tier,
                "property_type": data.property_type,
                "bhk": data.bhk,
                "bathrooms": data.bathrooms,
                "balconies": data.balconies,
                "built_up_area": data.built_up_area,
                "carpet_area": data.carpet_area,
                "floor_number": data.floor_number,
                "total_floors": data.total_floors,
                "facing": data.facing,
                "furnishing_status": data.furnishing_status,
                "property_age": data.property_age,
                "parking_spaces": data.parking_spaces,
                "transaction_type": data.transaction_type,
            }
        ])

        prediction = house_model.predict(input_data)[0]

        return {
            "success": True,
            "predicted_price_lakhs": round(float(prediction), 2)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ======================================================
# RENT PREDICTION
# ======================================================

@app.post("/api/predict/rent")
def predict_rent(data: RentPredictionRequest):

    try:
        input_data = pd.DataFrame({
            "area": [data.area]
        })

        prediction = rent_model.predict(input_data)[0]

        return {
            "success": True,
            "predicted_rent": round(float(prediction), 2)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
