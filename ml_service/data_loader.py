import pandas as pd
import os
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

def load_crop_yield_data():
    """Loads and returns the crop yield dataset."""
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, 'Crop Yeild Data(1).csv'))
        # Standardize column names
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

def get_historical_averages(state: str, crop: str):
    """
    Given a state and a crop, returns the historical average yield and recent price.
    """
    yield_df = load_crop_yield_data()
    price_df = load_mandi_price_data()
    
    avg_yield = 0.0
    current_price_per_quintal = 0.0
    
    # 1. Calculate Average Yield
    if not yield_df.empty:
        # Match case-insensitive
        mask = (
            (yield_df['state'].str.lower() == state.lower()) &
            (yield_df['crop'].str.lower() == crop.lower())
        )
        filtered_yield = yield_df[mask]
        
        if not filtered_yield.empty:
            avg_yield = filtered_yield['yield'].mean()
        else:
            # Fallback to national average for crop if state data is missing
            fallback_mask = yield_df['crop'].str.lower() == crop.lower()
            fallback_yield = yield_df[fallback_mask]
            if not fallback_yield.empty:
                avg_yield = fallback_yield['yield'].mean()

    # 2. Get most recent Price
    if not price_df.empty:
        # The modal price column might have a complex name based on date range
        price_col = [col for col in price_df.columns if 'modal price' in col]
        if price_col:
            # We will just take the average price of the most recent entries
            mask = (
                (price_df['state'].str.lower() == state.lower()) &
                (price_df['commodity'].str.lower() == crop.lower())
            )
            filtered_price = price_df[mask]
            if not filtered_price.empty:
                current_price_per_quintal = filtered_price[price_col[0]].mean()
                
    # Fallback to some sensible defaults if data is totally missing
    if pd.isna(avg_yield) or avg_yield == 0.0:
        avg_yield = 2.0  # e.g., 2 tonnes per hectare
        
    if pd.isna(current_price_per_quintal) or current_price_per_quintal == 0.0:
        current_price_per_quintal = 2200.0  # Rs per quintal
        
    return {
        "historical_yield_tonnes_per_hectare": round(float(avg_yield), 2),
        "price_rs_per_quintal": round(float(current_price_per_quintal), 2)
    }
