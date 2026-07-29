"""
Real NDVI Service using Sentinel Hub Process API
Fetches actual Sentinel-2 L2A satellite band data for a given lat/lon
and calculates true NDVI = (B08 - B04) / (B08 + B04)
"""

import os
import json
import time
import numpy as np
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

SENTINELHUB_CLIENT_ID = os.getenv("SENTINELHUB_CLIENT_ID", "")
SENTINELHUB_CLIENT_SECRET = os.getenv("SENTINELHUB_CLIENT_SECRET", "")

# Simple JSON file cache to avoid repeated API calls for same area
CACHE_FILE = os.path.join(os.path.dirname(__file__), "ndvi_cache.json")

def _load_cache():
    try:
        with open(CACHE_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def _save_cache(cache: dict):
    try:
        with open(CACHE_FILE, "w") as f:
            json.dump(cache, f, indent=2)
    except Exception:
        pass

def _cache_key(lat: float, lon: float) -> str:
    """Round to 2 decimal places for ~1km grid cell cache key"""
    return f"{round(lat, 2)}_{round(lon, 2)}"

def _get_ndvi_label(ndvi: float) -> str:
    if ndvi >= 0.7:
        return "Dense, healthy vegetation — Excellent crop health 🌿"
    elif ndvi >= 0.5:
        return "Good vegetation cover — Healthy growing crop 🌱"
    elif ndvi >= 0.3:
        return "Moderate vegetation — Crop growing, needs attention 🌾"
    elif ndvi >= 0.1:
        return "Sparse vegetation — Early growth or thin cover 🟡"
    else:
        return "Bare / fallow land — No active crop detected 🟤"

def get_real_ndvi(lat: float, lon: float) -> dict:
    """
    Fetches real NDVI from Sentinel Hub Sentinel-2 L2A imagery.
    Returns NDVI value, band values, and health description.
    Falls back to deterministic estimate if API unavailable.
    """

    # Check cache first (valid for 7 days)
    cache = _load_cache()
    cache_key = _cache_key(lat, lon)

    if cache_key in cache:
        entry = cache[cache_key]
        age_days = (time.time() - entry.get("timestamp", 0)) / 86400
        if age_days < 7:
            print(f"✅ NDVI Cache Hit for ({lat}, {lon}): NDVI = {entry['ndvi']}")
            return entry

    # Try real Sentinel Hub API
    if SENTINELHUB_CLIENT_ID and SENTINELHUB_CLIENT_SECRET:
        try:
            result = _fetch_sentinelhub_ndvi(lat, lon)
            if result and result.get("ndvi") is not None:
                result["timestamp"] = time.time()
                result["source"] = "Sentinel-2 L2A (Real Satellite)"
                cache[cache_key] = result
                _save_cache(cache)
                print(f"🛰️ Real Sentinel-2 NDVI for ({lat}, {lon}): {result['ndvi']}")
                return result
        except Exception as e:
            print(f"⚠️ Sentinel Hub API error: {e}. Using fallback estimate.")

    # Fallback: deterministic estimate
    return _fallback_ndvi(lat, lon)

def _fetch_sentinelhub_ndvi(lat: float, lon: float) -> dict:
    """
    Calls Sentinel Hub Process API to get real B04 + B08 values
    and computes NDVI for the given coordinate.
    """
    from sentinelhub import (
        SHConfig, SentinelHubRequest, DataCollection,
        MimeType, BBox, CRS, bbox_to_dimensions
    )

    # Load saved profile credentials
    try:
        config = SHConfig(profile="myprofile")
    except Exception:
        config = SHConfig()
        config.sh_client_id = SENTINELHUB_CLIENT_ID
        config.sh_client_secret = SENTINELHUB_CLIENT_SECRET
        config.sh_base_url = "https://services.sentinel-hub.com"

    # Create a small bounding box (~1km x 1km) around the coordinate
    delta = 0.005  # ~0.5km in each direction
    bbox = BBox(
        bbox=[lon - delta, lat - delta, lon + delta, lat + delta],
        crs=CRS.WGS84
    )
    size = bbox_to_dimensions(bbox, resolution=60)  # 60m resolution

    # EvalScript: returns B04 (Red) and B08 (NIR) raw reflectance values
    evalscript = """
    //VERSION=3
    function setup() {
        return {
            input: [{ bands: ["B04", "B08", "SCL"] }],
            output: { bands: 3, sampleType: "FLOAT32" }
        };
    }
    function evaluatePixel(sample) {
        // SCL band: 4=vegetation, 5=bare soil, 6=water, 8-10=cloud
        // Mask clouds (SCL 8,9,10 = cloud shadow, cloud medium, cloud high)
        if (sample.SCL >= 8 && sample.SCL <= 10) {
            return [-9999, -9999, -9999];
        }
        return [sample.B04, sample.B08, sample.SCL];
    }
    """

    # Date range: last 45 days for best chance of cloud-free scene
    end_date = datetime.now()
    start_date = end_date - timedelta(days=45)

    request = SentinelHubRequest(
        evalscript=evalscript,
        input_data=[
            SentinelHubRequest.input_data(
                data_collection=DataCollection.SENTINEL2_L2A,
                time_interval=(start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")),
                mosaicking_order="leastCC"  # Least cloud cover first
            )
        ],
        responses=[SentinelHubRequest.output_response("default", MimeType.TIFF)],
        bbox=bbox,
        size=size,
        config=config
    )

    data = request.get_data()[0]  # numpy array shape (H, W, 3)

    # Get center pixel values (most representative of the target coordinate)
    h, w = data.shape[:2]
    center_y, center_x = h // 2, w // 2

    # Get a 3x3 window around center and take median (removes noise)
    window = data[
        max(0, center_y-1):center_y+2,
        max(0, center_x-1):center_x+2,
        :
    ]

    b04_values = window[:, :, 0].flatten()
    b08_values = window[:, :, 1].flatten()

    # Remove cloud-masked pixels (-9999)
    valid_mask = b04_values > 0
    if valid_mask.sum() == 0:
        raise ValueError("All pixels cloudy in this time range")

    b04 = float(np.median(b04_values[valid_mask]))
    b08 = float(np.median(b08_values[valid_mask]))

    # Calculate real NDVI
    if (b08 + b04) == 0:
        ndvi = 0.0
    else:
        ndvi = (b08 - b04) / (b08 + b04)

    ndvi = round(float(ndvi), 4)
    b04_display = round(b04 * 10000)  # Convert to DN (digital number) for display
    b08_display = round(b08 * 10000)

    return {
        "ndvi": ndvi,
        "b04_red": b04_display,
        "b08_nir": b08_display,
        "label": _get_ndvi_label(ndvi),
        "score": round(min(1.2, max(0.7, 0.85 + ndvi * 0.35)), 2),  # Convert to ML score multiplier
        "description": f"Real Sentinel-2 NDVI: {ndvi} — {_get_ndvi_label(ndvi)}"
    }

def _fallback_ndvi(lat: float, lon: float) -> dict:
    """Deterministic fallback estimate when API is unavailable"""
    coord_seed = (abs(lat) * 1000 + abs(lon) * 100) % 100
    ndvi = round(0.35 + (coord_seed / 250.0), 4)
    ndvi = min(0.75, max(0.25, ndvi))

    b04_sim = int(800 + (coord_seed * 3))
    b08_sim = int(b04_sim + (ndvi * 5000))

    return {
        "ndvi": ndvi,
        "b04_red": b04_sim,
        "b08_nir": b08_sim,
        "label": _get_ndvi_label(ndvi),
        "score": round(min(1.2, max(0.7, 0.85 + ndvi * 0.35)), 2),
        "description": f"Estimated NDVI: {ndvi} (Satellite unavailable — using fallback)",
        "source": "Fallback Estimate",
        "timestamp": time.time()
    }
