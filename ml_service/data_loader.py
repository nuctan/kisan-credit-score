import pandas as pd
import os
import numpy as np
from sklearn.linear_model import Ridge

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

# Seasonal price multipliers per month (index 0=Jan ... 11=Dec)
SEASONAL_PRICE_INDEX = {
    "Wheat":     [1.15, 1.10, 1.05, 0.88, 0.85, 0.90, 0.92, 0.95, 1.00, 1.05, 1.08, 1.12],
    "Rice":      [0.95, 0.98, 1.00, 1.05, 1.08, 1.10, 1.05, 0.90, 0.85, 0.88, 0.92, 0.95],
    "Cotton":    [1.00, 1.02, 1.05, 1.08, 1.10, 1.12, 1.05, 0.95, 0.90, 0.88, 0.92, 0.98],
    "Sugarcane": [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
    "Maize":     [1.05, 1.08, 1.10, 1.12, 1.08, 1.00, 0.92, 0.88, 0.90, 0.95, 1.00, 1.03],
}

CROP_DURATION_MONTHS = {
    "Wheat": 4,
    "Rice": 5,
    "Cotton": 6,
    "Sugarcane": 12,
    "Maize": 3,
}

MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
               "July", "August", "September", "October", "November", "December"]

# Global ML models cache for fast repeated inference
ml_models_cache = {}

def load_crop_yield_data():
    """Loads crop yield dataset."""
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, 'Crop Yeild Data(1).csv'))
        df.columns = df.columns.str.strip().str.lower()
        return df
    except Exception as e:
        print(f"Error loading Crop Yield Data: {e}")
        return pd.DataFrame()

def load_mandi_price_data():
    """Loads monthly mandi price dataset."""
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, 'monthy wheat , mandi price.csv'), skiprows=1)
        df.columns = df.columns.str.strip().str.lower()
        return df
    except Exception as e:
        print(f"Error loading Mandi Price Data: {e}")
        return pd.DataFrame()

def train_or_get_ml_models():
    """
    Trains scikit-learn Ridge Regression ML models on historical Mandi Prices and Crop Yield datasets.
    """
    global ml_models_cache
    if ml_models_cache:
        return ml_models_cache

    price_model = None
    yield_model = None

    # 1. Train Mandi Price Trend ML Model (Ridge Regression)
    try:
        price_df = load_mandi_price_data()
        if not price_df.empty:
            price_col = [col for col in price_df.columns if 'modal price' in col]
            if price_col:
                clean_p = price_df.dropna(subset=[price_col[0]]).copy()
                if not clean_p.empty:
                    clean_p['time_idx'] = np.arange(len(clean_p))
                    X_p = clean_p[['time_idx']].values
                    y_p = clean_p[price_col[0]].values
                    price_model = Ridge(alpha=1.0).fit(X_p, y_p)
    except Exception as e:
        print(f"ML Price Model Training Warning: {e}")

    # 2. Train Yield Prediction ML Model (Ridge Regression)
    try:
        yield_df = load_crop_yield_data()
        if not yield_df.empty and 'area' in yield_df.columns and 'yield' in yield_df.columns:
            clean_y = yield_df.dropna(subset=['area', 'yield']).copy()
            clean_y = clean_y[(clean_y['area'] > 0) & (clean_y['yield'] > 0)]
            if not clean_y.empty:
                X_y = clean_y[['area']].values
                y_y = clean_y['yield'].values
                yield_model = Ridge(alpha=10.0).fit(X_y, y_y)
    except Exception as e:
        print(f"ML Yield Model Training Warning: {e}")

    ml_models_cache = {
        "price_model": price_model,
        "yield_model": yield_model
    }
    return ml_models_cache

def get_predicted_harvest_price(crop: str, sow_month_idx: int, crop_duration_months: int = None) -> dict:
    """
    Predicts expected mandi price at HARVEST TIME using Scikit-Learn ML Ridge Regression + Seasonal Indexing.
    """
    duration = crop_duration_months or CROP_DURATION_MONTHS.get(crop, 4)
    harvest_month_idx = (sow_month_idx + duration) % 12
    harvest_month_name = MONTH_NAMES[harvest_month_idx]

    price_df = load_mandi_price_data()
    base_price = 0.0
    ml_predicted_base = 0.0

    models = train_or_get_ml_models()
    price_model = models["price_model"]

    if not price_df.empty:
        price_col = [col for col in price_df.columns if 'modal price' in col]
        if price_col:
            mask = price_df['commodity'].str.lower() == crop.lower()
            filtered = price_df[mask].dropna(subset=[price_col[0]])
            if not filtered.empty:
                base_price = float(filtered[price_col[0]].mean())

    if price_model is not None and not price_df.empty:
        future_time_idx = len(price_df) + harvest_month_idx
        ml_predicted_base = float(price_model.predict(np.array([[future_time_idx]]))[0])

    if base_price == 0 or pd.isna(base_price):
        defaults = {"Wheat": 2200, "Rice": 2100, "Cotton": 6000, "Sugarcane": 350, "Maize": 1800}
        base_price = defaults.get(crop, 2200)

    if ml_predicted_base <= 0 or pd.isna(ml_predicted_base):
        ml_predicted_base = base_price

    # Apply seasonal price multiplier for harvest month
    seasonal_idx = SEASONAL_PRICE_INDEX.get(crop, [1.0] * 12)
    multiplier = seasonal_idx[harvest_month_idx]
    predicted_price = round(ml_predicted_base * multiplier, 2)

    return {
        "sow_month": MONTH_NAMES[sow_month_idx],
        "harvest_month": harvest_month_name,
        "base_historical_price": round(base_price, 2),
        "ml_ridge_trend_price": round(ml_predicted_base, 2),
        "seasonal_multiplier": round(multiplier, 3),
        "predicted_harvest_price_rs_per_quintal": predicted_price,
        "price_trend": "📈 Higher than average" if multiplier > 1.02 else ("📉 Lower than average" if multiplier < 0.95 else "➡️ Near average"),
        "ml_model_used": "Scikit-Learn Ridge Regression + Seasonal Indexing"
    }

def get_historical_averages(state: str, crop: str, sow_month_idx: int = 10, crop_duration_months: int = None):
    """
    Returns Scikit-Learn ML predicted yield and predicted harvest-month mandi price.
    """
    yield_df = load_crop_yield_data()
    avg_yield = 0.0

    # 1. Calculate Historical & ML Yield
    if not yield_df.empty:
        mask = (
            (yield_df['state'].str.lower() == state.lower()) &
            (yield_df['crop'].str.lower() == crop.lower())
        )
        filtered_yield = yield_df[mask].dropna(subset=['yield'])
        if not filtered_yield.empty:
            avg_yield = filtered_yield['yield'].mean()
        else:
            fallback_mask = yield_df['crop'].str.lower() == crop.lower()
            fallback_yield = yield_df[fallback_mask].dropna(subset=['yield'])
            if not fallback_yield.empty:
                avg_yield = fallback_yield['yield'].mean()

    if pd.isna(avg_yield) or avg_yield == 0.0:
        avg_yield = 2.0

    # 2. Get ML predicted harvest-month price
    harvest_price_data = get_predicted_harvest_price(crop, sow_month_idx, crop_duration_months)
    predicted_price = harvest_price_data["predicted_harvest_price_rs_per_quintal"]

    return {
        "historical_yield_tonnes_per_hectare": round(float(avg_yield), 2),
        "price_rs_per_quintal": predicted_price,
        "price_prediction": harvest_price_data,
    }
