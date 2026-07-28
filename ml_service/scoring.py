import random

def get_ndvi_score(lat: float, lon: float, crop: str) -> dict:
    """
    Mock function to calculate NDVI Score based on Lat/Lon.
    In the future, this will call Sentinel-2 or Google Earth Engine APIs.
    """
    # Returns a multiplier (e.g., 1.0 = normal, 1.1 = good vegetation, 0.8 = poor)
    # Mock logic based on some pseudo-randomness for demonstration
    base_score = random.uniform(0.85, 1.15)
    return {
        "score": round(base_score, 2),
        "description": "Vegetation health is " + ("good" if base_score > 1.0 else "below average")
    }

def get_weather_score(lat: float, lon: float) -> dict:
    """
    Mock function to calculate Weather Risk Score based on Lat/Lon.
    In the future, this will call the IMD /api/v1/cityforecastloc endpoint.
    """
    # Returns a multiplier
    base_score = random.uniform(0.90, 1.10)
    return {
        "score": round(base_score, 2),
        "description": "Favorable weather predicted" if base_score > 1.0 else "Risk of adverse weather"
    }

def get_soil_score(state: str, district: str) -> dict:
    """
    Mock function to calculate Soil Quality Score based on regional N-P-K data.
    """
    base_score = random.uniform(0.95, 1.05)
    return {
        "score": round(base_score, 2),
        "description": "Optimal soil nutrients" if base_score > 1.0 else "Slight nutrient deficiency"
    }

def calculate_adjusted_revenue(base_revenue: float, ndvi: float, weather: float, soil: float) -> float:
    """
    Combines the base revenue with the various AI/ML scores.
    """
    # Simple weighted multiplier for now
    composite_multiplier = (ndvi * 0.5) + (weather * 0.3) + (soil * 0.2)
    return round(base_revenue * composite_multiplier, 2)
