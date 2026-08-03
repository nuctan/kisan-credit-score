# Document 4: AI Chatbot — RAG Engine, Groq LLaMA 3.3 & Government Schemes

---

## 4.1 Why a Normal AI Would Be Wrong Here

If you ask ChatGPT "What is the KCC interest rate?" it might say **7%** — which is incorrect. The correct answer is effectively **4%** (after the government's 3% prompt-repayment subvention).

This is called a **hallucination** — the AI generates a statistically plausible but factually wrong answer because it has no access to verified data.

In a fintech product for farmers, a hallucinated loan rate or scheme benefit could cause serious financial harm.

**Solution: RAG (Retrieval-Augmented Generation)**

---

## 4.2 What Is RAG? — Simple Explanation

RAG means before sending the farmer's question to the AI, we:

1. **Search** a verified database of government scheme rules
2. **Retrieve** the relevant facts
3. **Inject** those facts into the AI's prompt
4. **Instruct** the AI to answer using ONLY those facts

```
Farmer asks: "How to get KCC loan for my Wheat?"
          ↓
RAG Engine searches: keywords = ["kcc", "loan", "wheat"]
          ↓
Finds: KCC scheme doc → "₹3 lakh at 4% effective interest, submit 7/12 to bank"
          ↓
Injects into prompt → LLaMA 3.3 reads it and answers accurately
          ↓
Response: "For your 2.5 Ha Wheat farm in Nashik, you can apply for KCC
           at your nearest SBI/cooperative bank with your 7/12 land record..."
```

The AI cannot make up a wrong number because the correct number is literally in its prompt.

---

## 4.3 How Data Is Put Into the RAG Engine

This is a very common interview question. Here is the exact answer:

**The RAG knowledge base in KisanAI is a hardcoded Python list of dictionaries in `schemes_rag.py`.**

Each scheme is stored as a structured object:

```python
# From ml_service/schemes_rag.py — exact structure:
KISAN_GOVT_SCHEMES = [
    {
        "id": "pm_kisan",
        "title_hi": "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
        "title_en": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "benefit_hi": "₹6,000 प्रति वर्ष (₹2,000 की 3 किस्तों में सीधे बैंक खाते में)।",
        "benefit_en": "₹6,000 per year direct income support in 3 equal installments of ₹2,000.",
        "eligibility_hi": "सभी पात्र भूमिधारक किसान परिवार।",
        "eligibility_en": "All landholding farmer families having cultivable land.",
        "apply_steps_hi": "pmkisan.gov.in पर e-KYC करें या नजदीकी CSC केंद्र से आधार लिंक कराएं।",
        "apply_steps_en": "Complete e-KYC on pmkisan.gov.in or link Aadhaar via nearest CSC center.",
        "keywords": ["pm kisan", "6000", "kist", "samman", "pmkisan", "income support"]
    },
    {
        "id": "kcc_scheme",
        ...
    },
    # ... 5 more schemes
]
```

**Why hardcoded and not a database?**
- Government scheme rules change rarely (once or twice a year)
- A Python dictionary is instantaneous to search (no network call, no latency)
- Easy to update — just edit the list in one file and restart the server
- For a hackathon/academic project, this is the correct pragmatic approach

**To add a new scheme**, you just add a new dictionary to the `KISAN_GOVT_SCHEMES` list with the same fields.

---

## 4.4 How the RAG Search Works — The Algorithm

**File:** `ml_service/schemes_rag.py` — function `query_kisan_schemes()`

```python
def query_kisan_schemes(user_query, crop, state, lang):
    query_lower = (user_query + " " + crop + " " + state).lower()

    matched_schemes = []
    for scheme in KISAN_GOVT_SCHEMES:
        score = 0

        # Keyword overlap scoring
        for keyword in scheme["keywords"]:
            if keyword in query_lower:
                score += 2          # +2 for each matching keyword

        # Context boosting rules
        if "maharashtra" in state.lower() and scheme["id"] == "maharashtra_karjmukti":
            score += 3              # Boost Maharashtra-specific scheme
        if "pump" in query_lower or "water" in query_lower:
            score += 4              # Boost PM-KUSUM solar pump
        if "insurance" in query_lower or "loss" in query_lower:
            score += 4              # Boost PMFBY crop insurance
        if "loan" in query_lower or "credit" in query_lower:
            score += 3              # Boost KCC loan scheme

        matched_schemes.append((score, scheme))

    # Sort by score, highest first → pick top 4
    matched_schemes.sort(key=lambda x: x[0], reverse=True)
    top_4 = [item[1] for item in matched_schemes[:4]]
```

**Scoring Example:**
- Farmer asks: *"How to apply for loan for my Wheat farm?"*
- Query tokens: `["loan", "apply", "wheat", "farm"]`
- KCC scheme keywords: `["kcc", "credit card", "loan", "interest"]`
- Match: `"loan"` → score = 2, plus context boost for "loan" → score = 5
- KCC ranks #1 → injected into prompt

---

## 4.5 The 7 Government Schemes in the Knowledge Base

| ID | Scheme | Benefit |
|---|---|---|
| `pm_kisan` | PM-KISAN | ₹6,000/year in 3 installments of ₹2,000 |
| `kcc_scheme` | Kisan Credit Card (KCC) | Crop loan up to ₹3 lakh at 4% effective interest |
| `pmfby_insurance` | PM Fasal Bima Yojana | Crop insurance at 1.5% (Rabi) / 2% (Kharif) premium |
| `pm_kusum` | PM-KUSUM Solar | 60–90% subsidy on solar irrigation pumps |
| `soil_health_card` | Soil Health Card | Free N-P-K soil testing every 2 years |
| `smam_machinery` | SMAM Machinery | 40–50% subsidy on tractors and farm equipment |
| `maharashtra_karjmukti` | Maharashtra Karjmukti | Loan waiver up to ₹2 lakh + ₹50,000 bonus |

---

## 4.6 Groq LLaMA 3.3 70B — The AI Model

**What is LLaMA 3.3 70B?**
- Meta's open-weights Large Language Model with **70 billion parameters**
- One of the most capable publicly available AI models
- Open-source — anyone can use it for free

**What is Groq?**
- Groq is a hardware company that built the **LPU (Language Processing Unit)**
- Unlike GPUs (which use slow external HBM memory), Groq LPUs use **fast on-chip SRAM**
- Result: LLaMA 3.3 70B runs at **>300 tokens/second** — nearly 10x faster than GPU inference
- The farmer's chatbot responds in **~300ms** (feels instant)

**Why not OpenAI/ChatGPT?**
- GPT-4 costs money per token (API billing)
- Groq has a free tier sufficient for this project
- LLaMA 3.3 70B is comparable in quality to GPT-4 for Indian agricultural context

---

## 4.7 The Complete System Prompt Structure

Before every chat message, the Python server builds this prompt:

```python
system_prompt = f"""
You are KrishiAI — expert Agricultural Risk & Credit Assessment Assistant for Indian Farmers.
Respond in clear, friendly English.        ← Language set by lang param

[CONFIRMED FARMER FORM DATA]:
- Crop: {crop}                             ← From farmer's form inputs
- Location: {district}, {state}
- Land Area: {area_ha} Hectares
- Loan Tenure: {tenure} Year(s)

[ML CALCULATED LOAN ELIGIBILITY]:
- MAXIMUM SAFE LOAN LIMIT: ₹{loan_cap}    ← From credit scoring engine

[GOVERNMENT KISAN SCHEMES RAG CONTEXT]:
{rag_text}                                 ← Top 4 matching schemes injected here

STRICT INSTRUCTIONS:
1. NEVER ask for Crop, Location, or Area — farmer already provided these.
2. Do NOT use markdown bold asterisks (**) in your output.
3. If asked about loan amount, state the exact ₹{loan_cap} figure.
"""
```

**Why is this powerful?**
The AI knows:
- Exactly who this farmer is and what their land produces
- The mathematically safe loan limit (from Document 3)
- The exact government scheme rules (from RAG)

So it can answer questions like:
- *"Am I eligible for KCC?"* → Yes, checks eligibility criteria against their profile
- *"How much loan can I get?"* → States the exact calculated figure
- *"What is PMFBY?"* → Explains from RAG context accurately

---

## 4.8 Fallback When Groq API Is Unavailable

If the Groq API key is missing or the network is down, the chatbot gracefully falls back:

```python
# From main.py — Groq fallback logic:
if not groq_client:
    # Return pre-computed answer from form data alone
    reply = f"Based on your land details ({area_ha} Hectares),
              you are eligible for a loan amount of ₹{loan_amt:,}."
    return {"chatId": "chat_python_1", "reply": reply}
```

The app never crashes — it always gives the farmer some useful information.
