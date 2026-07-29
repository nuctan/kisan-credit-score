import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
from groq import Groq

from data_loader import get_historical_averages
from scoring import get_ndvi_score, get_weather_score, get_soil_score, calculate_adjusted_revenue
from crop_succession import get_multiyear_crop_succession_plan
from trend_analytics import get_12month_ndvi_weather_trends
from schemes_rag import query_kisan_schemes
from auth import (
    register_user_python, 
    login_user_python, 
    get_user_profile_python, 
    update_farm_profile_python,
    decode_token
)

app = FastAPI(title="KrishiAI 100% Pure Python Unified Backend")

# Enable CORS for React Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq Client setup in Python
groq_api_key = os.getenv("GROQ_API_KEY", "")
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None

# Pydantic Schemas
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    fullName: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = ""

class LoginRequest(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: str

class ProfileUpdateRequest(BaseModel):
    state: Optional[str] = "Maharashtra"
    district: Optional[str] = ""
    crop: Optional[str] = ""
    areaHectares: Optional[float] = 0.0
    loanTenureYears: Optional[int] = 1
    startMonthIndex: Optional[int] = 10
    cropDurationMonths: Optional[int] = 4
    suggestedLoanLimit: Optional[float] = 0.0

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

class TrendRequest(BaseModel):
    district: str
    crop: Optional[str] = "Wheat"

class SchemesRAGRequest(BaseModel):
    query: Optional[str] = ""
    crop: Optional[str] = "Wheat"
    state: Optional[str] = "Maharashtra"
    lang: Optional[str] = "hi"

class ChatRequest(BaseModel):
    message: str
    chatId: Optional[str] = None
    landContext: Optional[Dict[str, Any]] = None
    lang: Optional[str] = "hi"

# Helper Dependency for Auth Token Verification
def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        return "admin_id" # Default fallback
    
    token = authorization.replace("Bearer ", "").strip()
    payload = decode_token(token)
    if not payload or "id" not in payload:
        return "admin_id"
    return payload["id"]

# --- AUTH ROUTES (100% PYTHON) ---

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    res = register_user_python(
        name=req.fullName or req.name,
        email=req.email,
        password=req.password,
        username=req.username,
        phone=req.phone
    )
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@app.post("/api/auth/login")
def login(req: LoginRequest):
    identifier = req.email or req.username or ""
    res = login_user_python(identifier=identifier, password=req.password)
    if "error" in res:
        raise HTTPException(status_code=401, detail=res["error"])
    return res

@app.get("/api/auth/profile")
def get_profile(authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    profile = get_user_profile_python(user_id)
    if "error" in profile:
        raise HTTPException(status_code=404, detail=profile["error"])
    return profile

@app.put("/api/auth/profile")
def update_profile(req: ProfileUpdateRequest, authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    res = update_farm_profile_python(user_id, req.model_dump())
    return res

# --- AI CHAT ROUTE WITH PYTHON GROQ & SCHEMES RAG ---

@app.post("/api/ai/chat")
def chat_with_ai(req: ChatRequest):
    lang = req.lang or "hi"
    user_msg = req.message
    ctx = req.landContext or {}

    inputs = ctx.get("inputs", {})
    pred = ctx.get("predictions", {})
    plan = ctx.get("one_year_succession_plan", {})
    area_ha = inputs.get("area_hectares", 2.5)

    # 1. Fetch Government Schemes RAG Context from Python RAG Engine
    rag_res = query_kisan_schemes(user_msg, inputs.get("crop", "Wheat"), inputs.get("state", "Maharashtra"), lang)
    python_rag_text = rag_res.get("rag_prompt_summary", "")

    # 2. Construct Dynamic Prompt
    if lang == "en":
        system_prompt = f"""You are KrishiAI — an expert Agricultural Risk, Credit Assessment & Government Schemes Assistant for Indian Farmers.
Respond in clear, friendly English.

[CONFIRMED FARMER FORM DATA]:
- Crop: {inputs.get('crop', 'N/A')}
- Location: {inputs.get('district', 'N/A')}, {inputs.get('state', 'N/A')}
- Land Area: {area_ha} Hectares
- Loan Tenure: {plan.get('loan_tenure_years', 1)} Year(s)

[ML CALCULATED LOAN ELIGIBILITY]:
- MAXIMUM SAFE LOAN LIMIT: ₹{pred.get('suggested_loan_limit_rs', 0):,}

[GOVERNMENT KISAN SCHEMES RAG CONTEXT (FROM PYTHON RAG ENGINE)]:
{python_rag_text}

STRICT INSTRUCTIONS:
1. NEVER ask for Crop name, Location, or Land Area. The farmer has ALREADY provided these!
2. Do NOT use markdown bold asterisks (**) in your output text. Write clean, natural plain text.
3. If asked "how much loan will i get?", state: "Based on your land details, you are eligible for a loan amount of ₹{pred.get('suggested_loan_limit_rs', 0):,}."
4. If asked about schemes or subsidies, use the Python RAG context to explain PM-Kisan, KCC, or PM-KUSUM application steps clearly."""
    else:
        system_prompt = f"""आप किसानAI हैं — भारतीय किसानों के लिए विशेषज्ञ कृषि ऋण मूल्यांकन एवं सरकारी योजना सहायक।
सरल और किसान-मित्र हिंदी भाषा में जवाब दें।

[डैशबोर्ड फ़ॉर्म से किसान का सत्यापित डेटा]:
- फसल: {inputs.get('crop', 'गेहूं')}
- स्थान: {inputs.get('district', 'अहिल्यानगर')}, {inputs.get('state', 'महाराष्ट्र')}
- खेत का क्षेत्रफल: {area_ha} हेक्टेयर

[सत्यापित ऋण पात्रता राशि]:
- स्वीकार्य अधिकतम सुरक्षित ऋण राशि: ₹{pred.get('suggested_loan_limit_rs', 0):,}

[सरकारी किसान योजनाएं RAG ज्ञान (पायथन RAG इंजन से)]:
{python_rag_text}

सख्त नियम:
1. किसान से कभी भी फसल, स्थान या खेत का क्षेत्रफल न पूछें!
2. अपने उत्तर में स्टार मार्क्स (**) का उपयोग बिल्कुल न करें। बिल्कुल साफ़ और सरल पाठ लिखें।
3. जब भी किसान ऋण की मात्रा पूछे, तो कहें: "आपके भूमि विवरण के अनुसार, आप ₹{pred.get('suggested_loan_limit_rs', 0):,} की ऋण राशि के लिए पात्र हैं।"
4. यदि किसान सरकारी योजनाओं, सब्सिडी, पीएम-किसान या केसीसी के बारे में पूछे, तो ऊपर दिए गए पायथन RAG ज्ञान का उपयोग करें।"""

    # 3. Call Groq API via Python SDK if key available
    if groq_client:
        try:
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_msg}
                ],
                temperature=0.5,
                max_tokens=600
            )
            raw_reply = completion.choices[0].message.content or ""
            clean_reply = raw_reply.replace("**", "")
            return {"chatId": req.chatId or "chat_python_1", "reply": clean_reply}
        except Exception as e:
            print("Groq API Error:", e)

    # Fallback response
    loan_amt = pred.get("suggested_loan_limit_rs", 353607)
    if lang == "en":
        reply = f"Based on your land details ({area_ha} Hectares), you are eligible for a loan amount of ₹{loan_amt:,}."
    else:
        reply = f"आपके भूमि विवरण ({area_ha} हेक्टेयर) के अनुसार, आप ₹{loan_amt:,} की ऋण राशि के लिए पात्र हैं।"

    return {"chatId": req.chatId or "chat_python_1", "reply": reply}

# --- ML ANALYSIS & TELEMETRY ROUTES ---

@app.post("/api/ai/analyze")
@app.post("/api/predict-revenue")
def predict_revenue(req: PredictionRequest):
    historical_data = get_historical_averages(req.state, req.crop)
    yield_per_hectare = historical_data["historical_yield_tonnes_per_hectare"]
    price_per_quintal = historical_data["price_rs_per_quintal"]
    
    base_revenue = req.area_hectares * yield_per_hectare * 10 * price_per_quintal
    
    ndvi_data = get_ndvi_score(req.lat, req.lon, req.crop)
    weather_data = get_weather_score(req.lat, req.lon)
    soil_data = get_soil_score(req.state, req.district)
    
    adjusted_revenue = calculate_adjusted_revenue(
        base_revenue, 
        ndvi_data["score"], 
        weather_data["score"], 
        soil_data["score"]
    )
    
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

@app.post("/api/ndvi-weather-trends")
def get_trends(req: TrendRequest):
    return get_12month_ndvi_weather_trends(req.district, req.crop)

@app.post("/api/kisan-schemes")
def get_schemes(req: SchemesRAGRequest):
    return query_kisan_schemes(req.query, req.crop, req.state, req.lang)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
