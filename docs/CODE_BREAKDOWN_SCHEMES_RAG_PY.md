# Line-by-Line Code Breakdown: `ml_service/schemes_rag.py`

## File Overview
- **File Location**: `ml_service/schemes_rag.py`
- **Total Lines**: 137
- **Purpose**: Acts as the Knowledge Base and Retrieval-Augmented Generation (RAG) search engine for official Indian government agricultural schemes (PM-KISAN, KCC, PMFBY, PM-KUSUM, Soil Health Card, SMAM, Karjmukti).

---

## Detailed Line-by-Line Explanation

```python
1: import re
```
- **Line 1**: Imports regular expression module for string cleaning.

```python
3: KISAN_GOVT_SCHEMES = [
4:     {
5:         "id": "pm_kisan",
6:         "title_hi": "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
7:         "title_en": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
8:         "benefit_hi": "₹6,000 प्रति वर्ष (₹2,000 की 3 किस्तों में सीधे बैंक खाते में)।",
9:         "benefit_en": "₹6,000 per year direct income support in 3 equal installments of ₹2,000.",
10:        "eligibility_hi": "सभी पात्र भूमिधारक किसान परिवार जिनके पास कृषि योग्य भूमि है।",
11:        "eligibility_en": "All landholding farmer families having cultivable land.",
12:        "apply_steps_hi": "pmkisan.gov.in पर e-KYC करें या नजदीकी CSC केंद्र से आधार लिंक कराएं।",
13:        "apply_steps_en": "Complete e-KYC on pmkisan.gov.in or link Aadhaar via nearest CSC center.",
14:        "keywords": ["pm kisan", "6000", "kist", "samman", "pmkisan", "income support", "direct benefit", "डीबीटी"]
15:     },
```
- **Lines 3–15**: Defines entry for **PM-KISAN Scheme**:
  - `id`: Unique policy identifier key.
  - `title_hi` & `title_en`: Multilingual scheme titles.
  - `benefit_hi` & `benefit_en`: Financial benefit rules (₹6,000/year in 3 installments of ₹2,000).
  - `eligibility`: Landholding farmer qualifications.
  - `apply_steps`: Online application instructions (`pmkisan.gov.in`).
  - `keywords`: Token array used by RAG search algorithm.

```python
16:     { "id": "kcc_scheme", ... "keywords": ["kcc", "credit card", "loan", "interest", "subvention", "ऋण", "ब्याज", "केसीसी"] },
28:     { "id": "pmfby_insurance", ... "keywords": ["insurance", "fasal bima", "pmfby", "crop loss", "bima", "बीमा", "फसल नुकसान"] },
40:     { "id": "pm_kusum", ... "keywords": ["kusum", "solar", "pump", "irrigation", "solapump", "सोलर", "पंप", "सिंचाई"] },
52:     { "id": "soil_health_card", ... "keywords": ["soil", "soil health", "card", "fertilizer", "npk", "मिट्टी", "उर्वरक", "मृदा"] },
64:     { "id": "smam_machinery", ... "keywords": ["smam", "tractor", "machinery", "subsidy", "implements", "ट्रैक्टर", "यंत्र", "सब्सिडी"] },
77:     { "id": "maharashtra_karjmukti", ... "keywords": ["karjmukti", "loan waiver", "maharashtra", "shetkari", "कर्जमुक्ती", "माफी", "50000"] }
```
- **Lines 16–88**: Defines structured metadata dictionaries for KCC (4% effective loan rate), PMFBY (1.5–2% premium insurance), PM-KUSUM (60-90% solar pump subsidy), Soil Health Card (free N-P-K testing), SMAM (40-50% tractor subsidy), and Maharashtra Karjmukti (₹2 lakh loan waiver).

---

### Function 2: `query_kisan_schemes` (Lines 90-136) — Core RAG Search Engine

```python
90: def query_kisan_schemes(user_query: str = "", crop: str = "", state: str = "Maharashtra", lang: str = "hi"):
95:     query_lower = (user_query + " " + crop + " " + state).lower()
```
- **Lines 90–95**: Accepts user prompt string, crop name, state, and target language. Concatenates parameters into lowercased search vector `query_lower`.

```python
97:     matched_schemes = []
98:     for scheme in KISAN_GOVT_SCHEMES:
99:         score = 0
100:        for kw in scheme["keywords"]:
101:            if kw in query_lower:
102:                score += 2
```
- **Lines 97–102**: **Keyword Overlap Scoring Algorithm**:
  Iterates across every scheme document in the knowledge base. Adds +2 relevance points for every matching keyword token found in `query_lower`:
  $$\text{Score}(Q, D_i) = \sum_{k \in \text{Keywords}(D_i)} 2 \cdot \mathbb{I}(k \in Q)$$

```python
105:        if "maharashtra" in state.lower() and scheme["id"] == "maharashtra_karjmukti":
106:            score += 3
107:        if ("pump" in query_lower or "water" in query_lower) and scheme["id"] == "pm_kusum":
108:            score += 4
109:        if ("insurance" in query_lower or "loss" in query_lower) and scheme["id"] == "pmfby_insurance":
110:            score += 4
111:        if ("loan" in query_lower or "credit" in query_lower) and scheme["id"] == "kcc_scheme":
112:            score += 3
```
- **Lines 105–112**: **Contextual Relevance Boosting Rules**:
  Adds bonus weight points (+3 to +4) if specific state or domain intent tokens ("pump", "insurance", "loan") match specialized scheme IDs.

```python
117:    matched_schemes.sort(key=lambda x: x[0], reverse=True)
119:    top_schemes = [item[1] for item in matched_schemes[:4]]
```
- **Lines 117–119**: Sorts scheme results in descending order of score and extracts top 4 most relevant scheme objects.

```python
123:    rag_prompt_text = "सरकार-किसान योजनाएं एवं सब्सिडी विवरण (Government Kisan Schemes RAG Knowledge Context):\n"
124:    for s in top_schemes:
125:        if lang == "en":
126:            rag_prompt_text += f"- {s['title_en']}: {s['benefit_en']} Eligibility: {s['eligibility_en']} Steps: {s['apply_steps_en']}\n"
127:        else:
128:            rag_prompt_text += f"- {s['title_hi']}: {s['benefit_hi']} पात्रता: {s['eligibility_hi']} आवेदन: {s['apply_steps_hi']}\n"
```
- **Lines 123–129**: Assembles a concise RAG text summary payload containing title, benefits, eligibility criteria, and application steps.

```python
130:    return {
131:        "status": "success",
132:        "total_schemes_available": len(KISAN_GOVT_SCHEMES),
133:        "query": user_query,
134:        "matched_schemes": top_schemes,
135:        "rag_prompt_summary": rag_prompt_text
136:    }
```
- **Lines 130–136**: Returns structured JSON containing query string, matched schemes list, and `rag_prompt_summary` text ready for LLM system prompt injection in `main.py`.
