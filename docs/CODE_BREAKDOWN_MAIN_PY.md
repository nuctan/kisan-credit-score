# Line-by-Line Code Breakdown: `ml_service/main.py`

## File Overview
- **File Location**: `ml_service/main.py`
- **Total Lines**: 308
- **Purpose**: Central FastAPI (ASGI) application server bootstrapping API routes, enforcing Pydantic request body validation, handling authentication dependencies, executing Groq LLaMA 3.3 AI system prompting, and orchestrating ML scoring controllers.

---

## Detailed Line-by-Line Explanation

```python
5: from fastapi import FastAPI, Header, HTTPException
6: from fastapi.middleware.cors import CORSMiddleware
7: from pydantic import BaseModel
10: from groq import Groq
```
- **Lines 5–10**: Imports core FastAPI framework components, CORS middleware, Pydantic data validation schemas, and Groq LPU Python SDK client.

```python
12: from data_loader import get_historical_averages
13: from scoring import get_ndvi_score, get_weather_score, get_soil_score, calculate_adjusted_revenue
14: from crop_succession import get_multiyear_crop_succession_plan
15: from trend_analytics import get_12month_ndvi_weather_trends
16: from schemes_rag import query_kisan_schemes
```
- **Lines 12–16**: Imports all internal domain controllers (Mandi pricing, Risk Weighting, Crop Succession, Satellite Trends, Government Schemes RAG).

```python
25: app = FastAPI(title="KrishiAI 100% Pure Python Unified Backend")
28: app.add_middleware(
29:     CORSMiddleware,
30:     allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
31: )
```
- **Lines 25–34**: Instantiates FastAPI app and registers Cross-Origin Resource Sharing (CORS) middleware to accept HTTP requests from React Vite (`http://localhost:3000`).

```python
37: groq_api_key = os.getenv("GROQ_API_KEY", "")
38: groq_client = Groq(api_key=groq_api_key) if groq_api_key else None
```
- **Lines 37–38**: Initializes Groq SDK client using `GROQ_API_KEY` from `.env`.

---

### Pydantic Validation Schemas (Lines 40-90)

```python
64: class PredictionRequest(BaseModel):
65:     state: str
66:     district: str
67:     crop: str
68:     area_hectares: float
69:     lat: float
70:     lon: float
71:     loan_tenure_years: Optional[int] = 1
72:     start_month_index: Optional[int] = 10
73:     current_crop_duration: Optional[int] = 4
```
- **Lines 64–73**: Defines strict JSON payload type validation for `/api/ai/analyze` POST requests.

---

### AI Chat & Prompt Assembly Controller (Lines 141-224)

```python
141: @app.post("/api/ai/chat")
142: def chat_with_ai(req: ChatRequest):
153:     rag_res = query_kisan_schemes(user_msg, inputs.get("crop", "Wheat"), inputs.get("state", "Maharashtra"), lang)
154:     python_rag_text = rag_res.get("rag_prompt_summary", "")
```
- **Lines 141–154**: Executes keyword RAG search in `schemes_rag.py` to retrieve matching government schemes text.

```python
157:     system_prompt = f"""You are KrishiAI — an expert Agricultural Risk, Credit Assessment & Government Schemes Assistant for Indian Farmers.
162: - Crop: {inputs.get('crop', 'N/A')}
163: - Location: {inputs.get('district', 'N/A')}, {inputs.get('state', 'N/A')}
164: - Land Area: {area_ha} Hectares
168: - MAXIMUM SAFE LOAN LIMIT: ₹{pred.get('suggested_loan_limit_rs', 0):,}
171: [GOVERNMENT KISAN SCHEMES RAG CONTEXT]:
172: {python_rag_text}
173: STRICT INSTRUCTIONS:
174: 1. NEVER ask for Crop, Location, or Area — farmer already provided these.
175: 2. Do NOT use markdown bold asterisks (**) in output.
```
- **Lines 157–178**: **System Prompt Synthesis**:
  Combines confirmed form inputs, ML-calculated loan cap, and retrieved RAG scheme facts. Forces LLM to stay grounded and eliminate hallucinations.

```python
185:     if groq_client:
186:         completion = groq_client.chat.completions.create(
187:             model="llama-3.3-70b-versatile",
188:             messages=[
189:                 {"role": "system", "content": system_prompt},
190:                 {"role": "user", "content": user_msg}
191:             ],
192:             temperature=0.2, max_tokens=600
193:         )
194:         reply = completion.choices[0].message.content
```
- **Lines 185–194**: Dispatches system prompt and user query to Groq LPU executing **Meta LLaMA 3.3 70B** (`llama-3.3-70b-versatile`) with low temperature `0.2` for precise factual adherence.

---

### Main Revenue Prediction & Scoring Route (Lines 228-296)

```python
228: @app.post("/api/ai/analyze")
236:     historical_data = get_historical_averages(req.state, req.crop, sow_month_idx=start_month_idx, crop_duration_months=crop_duration)
245:     base_revenue = req.area_hectares * yield_per_hectare * 10 * price_per_quintal
247:     ndvi_data = get_ndvi_score(req.lat, req.lon, req.crop)
248:     weather_data = get_weather_score(req.lat, req.lon)
249:     soil_data = get_soil_score(req.state, req.district)
251:     adjusted_revenue = calculate_adjusted_revenue(base_revenue, ndvi_data["score"], weather_data["score"], soil_data["score"])
258:     succession_plan = get_multiyear_crop_succession_plan(req.crop, req.area_hectares, adjusted_revenue, loan_tenure_years=tenure_years...)
```
- **Lines 228–258**: **Main ML Execution Flow**:
  1. Queries baseline historical yield & harvest-month mandi price.
  2. Computes Base Revenue ($10 \times \text{Yield} \times \text{Price}$).
  3. Queries Sentinel-2 satellite NDVI, IMD weather, and soil quality.
  4. RunsComposite Risk Multiplier formula ($0.45\cdot\text{NDVI} + 0.35\cdot\text{Weather} + 0.20\cdot\text{Soil}$).
  5. Computes multi-year rotation succession schedule and 60% DSCR safe loan limit cap.

```python
306: if __name__ == "__main__":
307:     uvicorn.run(app, host="0.0.0.0", port=8000)
```
- **Lines 306–308**: Launches Uvicorn ASGI Web Server listening on port `8000`.
