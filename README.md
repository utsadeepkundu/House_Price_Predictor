# 🏠 Real Estate Price & Rent Predictor

A machine learning based web application for predicting **house prices** and **rental values** using property information.

The project combines a **React + Vite frontend**, **FastAPI backend**, and **Scikit-learn machine learning models** to provide real-time predictions through an interactive web interface.

---

## 🚀 Features

### 🏠 House Price Prediction

Predict the estimated property price using features such as:

- City
- Locality
- Locality Tier
- Property Type
- BHK
- Bathrooms
- Balconies
- Built-up Area
- Carpet Area
- Floor Number
- Total Floors
- Facing
- Furnishing Status
- Property Age
- Parking Spaces
- Transaction Type

The prediction is returned in **lakhs**.

### 🏢 Rent Prediction

Estimate rental value based on:

- Property Area

The current rent model uses a **Linear Regression** model trained on the available rental dataset.

### 💻 Interactive Web Interface

- Modern dark-themed UI
- House Price Prediction
- Rent Prediction
- Land Price section prepared for future development
- Dynamic locality selection based on city
- Input validation
- Real-time prediction through FastAPI

---

## 🧠 Machine Learning

### House Price Model

**Algorithm:** Linear Regression

**Target:**
`price_in_lakhs`

The final house price model was retrained using the combined training and validation dataset.

### Rent Model

**Algorithm:** Linear Regression

**Input:**
`area`

**Target:**
`rent`

> Note: The current rent dataset contains only area and rent, so the rent model is intentionally a simple area-based prediction model.

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3

### Backend

- Python
- FastAPI
- Uvicorn
- Pandas

### Machine Learning

- Scikit-learn
- NumPy
- Joblib

### Development & Deployment

- Git
- GitHub
- Vercel

---

## 📁 Project Structure

```text
real-estate-predictor/
│
├── api/
│   ├── __init__.py
│   └── index.py
│
├── models/
│   ├── house_price_model.pkl
│   └── rent_model.pkl
│
├── public/
│   ├── model_metadata.json
│   ├── location_mapping.json
│   └── rent_metadata.json
│
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── requirements.txt
└── vite.config.js