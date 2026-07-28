from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import uvicorn
from data_loader import get_historical_averages
from scoring import get_ndvi_score, get_weather_score, get_soil_score, calculate_adjusted_revenue
from crop_succession import get_multiyear_crop_succession_plan

app = FastAPI(title="KrishiAI ML Service")

class PredictionRequest(BaseModel):
    state: str
    district: str
    crop: str
    area_hectares: float
    lat: float
    lon: float
    loan_tenure_years: Optional[int] = 1
    start_month_index: Optional[int] = 10
    current_crop_duration: Optional[int] = 4

@app.post("/api/predict-revenue")
def predict_revenue(req: PredictionRequest):
    # 1. Fetch historical data from Pandas pipeline
    historical_data = get_historical_averages(req.state, req.crop)
    yield_per_hectare = historical_data["historical_yield_tonnes_per_hectare"]
    price_per_quintal = historical_data["price_rs_per_quintal"]
    
    # Base calculation: Area * Yield(Tonnes) * 10 (Quintals/Tonne) * Price
    base_revenue = req.area_hectares * yield_per_hectare * 10 * price_per_quintal
    
    # 2. Get ML Scores & Telemetry
    ndvi_data = get_ndvi_score(req.lat, req.lon, req.crop)
    weather_data = get_weather_score(req.lat, req.lon)
    soil_data = get_soil_score(req.state, req.district)
    
    # 3. Calculate Adjusted Revenue for current crop
    adjusted_revenue = calculate_adjusted_revenue(
        base_revenue, 
        ndvi_data["score"], 
        weather_data["score"], 
        soil_data["score"]
    )
    
    # 4. Calculate Multi-Year Loan Cycle Crop Succession Plan
    tenure_years = req.loan_tenure_years or 1
    start_month_idx = req.start_month_index if req.start_month_index is not None else 10
    crop_duration = req.current_crop_duration or 4

    succession_plan = get_multiyear_crop_succession_plan(
        req.crop, 
        req.area_hectares, 
        adjusted_revenue,
        loan_tenure_years=tenure_years,
        start_month_index=start_month_idx,
        current_crop_duration=crop_duration
    )

    # 5. Calculate Risk Category
    composite_multiplier = adjusted_revenue / base_revenue if base_revenue > 0 else 1.0
    if composite_multiplier > 1.05:
        risk_level = "Low"
    elif composite_multiplier < 0.90:
        risk_level = "High"
    else:
        risk_level = "Medium"

    return {
        "status": "success",
        "inputs": req.model_dump(),
        "baseline_metrics": {
            "historical_yield_tonnes_per_hectare": yield_per_hectare,
            "market_price_rs_per_quintal": price_per_quintal,
            "base_estimated_revenue_rs": round(base_revenue, 2)
        },
        "ai_scores": {
            "ndvi": ndvi_data,
            "weather": weather_data,
            "soil": soil_data
        },
        "predictions": {
            "adjusted_estimated_revenue_rs": adjusted_revenue,
            "risk_level": risk_level,
            "suggested_loan_limit_rs": succession_plan["one_year_loan_eligibility_cap_rs"],
            "total_1year_combined_revenue_rs": succession_plan["total_annual_combined_revenue_rs"]
        },
        "one_year_succession_plan": succession_plan
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
