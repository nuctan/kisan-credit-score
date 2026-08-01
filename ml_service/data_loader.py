import pandas as pd
import os
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

# Seasonal price multipliers per month (index 0=Jan ... 11=Dec)
# Based on Indian agricultural market seasonal patterns
# Prices are typically higher post-harvest (scarcity) and lower at harvest peak
SEASONAL_PRICE_INDEX = {
    "Wheat":     [1.15, 1.10, 1.05, 0.88, 0.85, 0.90, 0.92, 0.95, 1.00, 1.05, 1.08, 1.12],
    "Rice":      [0.95, 0.98, 1.00, 1.05, 1.08, 1.10, 1.05, 0.90, 0.85, 0.88, 0.92, 0.95],
    "Cotton":    [1.00, 1.02, 1.05, 1.08, 1.10, 1.12, 1.05, 0.95, 0.90, 0.88, 0.92, 0.98],
    "Sugarcane": [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],  # Fixed price
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

def load_crop_yield_data():
    """Loads and returns the crop yield dataset."""
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, 'Crop Yeild Data(1).csv'))
        df.columns = df.columns.str.strip().str.lower()
        return df
    except Exception as e:
        print(f"Error loading Crop Yield Data: {e}")
        return pd.DataFrame()

def load_mandi_price_data():
    """Loads and returns the monthly mandi price dataset."""
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, 'monthy wheat , mandi price.csv'), skiprows=1)
        df.columns = df.columns.str.strip().str.lower()
        return df
    except Exception as e:
        print(f"Error loading Mandi Price Data: {e}")
        return pd.DataFrame()

def get_predicted_harvest_price(crop: str, sow_month_idx: int, crop_duration_months: int = None) -> dict:
    """
    Predicts the expected mandi price at HARVEST TIME based on sowing month.
    If farmer plants Wheat in November (idx=10), duration=4 months → harvests in March (idx=2).
    Returns predicted price and harvest month name.
    """
    duration = crop_duration_months or CROP_DURATION_MONTHS.get(crop, 4)
    harvest_month_idx = (sow_month_idx + duration) % 12
    harvest_month_name = MONTH_NAMES[harvest_month_idx]

    # Get base historical price
    price_df = load_mandi_price_data()
    base_price = 0.0
    if not price_df.empty:
        price_col = [col for col in price_df.columns if 'modal price' in col]
        if price_col:
            mask = price_df['commodity'].str.lower() == crop.lower()
            filtered = price_df[mask]
            if not filtered.empty:
                base_price = float(filtered[price_col[0]].mean())

    if base_price == 0 or pd.isna(base_price):
        # Sensible defaults
        defaults = {"Wheat": 2200, "Rice": 2100, "Cotton": 6000, "Sugarcane": 350, "Maize": 1800}
        base_price = defaults.get(crop, 2200)

    # Apply seasonal price multiplier for harvest month
    seasonal_idx = SEASONAL_PRICE_INDEX.get(crop, [1.0] * 12)
    multiplier = seasonal_idx[harvest_month_idx]
    predicted_price = round(base_price * multiplier, 2)

    return {
        "sow_month": MONTH_NAMES[sow_month_idx],
        "harvest_month": harvest_month_name,
        "base_historical_price": round(base_price, 2),
        "seasonal_multiplier": round(multiplier, 3),
        "predicted_harvest_price_rs_per_quintal": predicted_price,
        "price_trend": "📈 Higher than average" if multiplier > 1.02 else ("📉 Lower than average" if multiplier < 0.95 else "➡️ Near average"),
    }

def get_historical_averages(state: str, crop: str, sow_month_idx: int = 10, crop_duration_months: int = None):
    """
    Given a state and a crop, returns the historical average yield and
    PREDICTED harvest-month price (not just static average).
    """
    yield_df = load_crop_yield_data()

    avg_yield = 0.0

    # 1. Calculate Average Yield
    if not yield_df.empty:
        mask = (
            (yield_df['state'].str.lower() == state.lower()) &
            (yield_df['crop'].str.lower() == crop.lower())
        )
        filtered_yield = yield_df[mask]
        if not filtered_yield.empty:
            avg_yield = filtered_yield['yield'].mean()
        else:
            fallback_mask = yield_df['crop'].str.lower() == crop.lower()
            fallback_yield = yield_df[fallback_mask]
            if not fallback_yield.empty:
                avg_yield = fallback_yield['yield'].mean()

    if pd.isna(avg_yield) or avg_yield == 0.0:
        avg_yield = 2.0

    # 2. Get PREDICTED harvest-month price
    harvest_price_data = get_predicted_harvest_price(crop, sow_month_idx, crop_duration_months)
    predicted_price = harvest_price_data["predicted_harvest_price_rs_per_quintal"]

    return {
        "historical_yield_tonnes_per_hectare": round(float(avg_yield), 2),
        "price_rs_per_quintal": predicted_price,
        "price_prediction": harvest_price_data,
    }
