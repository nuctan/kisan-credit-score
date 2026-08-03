# KisanAI — Project Documentation Index

## What This Project Is
KisanAI is an agricultural fintech platform that uses satellite data, machine learning, and AI to calculate accurate loan eligibility for Indian farmers — without any physical farm visits.

## Documentation Files (Read in Order)

| # | File | What It Covers |
|---|---|---|
| 1 | [01_PROJECT_OVERVIEW.md](./01_PROJECT_OVERVIEW.md) | What the project does, the problem it solves, team contributions |
| 2 | [02_MAP_AND_SATELLITE.md](./02_MAP_AND_SATELLITE.md) | Leaflet, Esri, Sentinel Hub, NDVI — the entire mapping & satellite system |
| 3 | [03_CREDIT_SCORING_ENGINE.md](./03_CREDIT_SCORING_ENGINE.md) | How the loan amount is calculated — all formulas step by step |
| 4 | [04_AI_CHATBOT_AND_RAG.md](./04_AI_CHATBOT_AND_RAG.md) | Groq LLaMA 3.3, RAG, government schemes knowledge base |
| 5 | [05_TECH_STACK_AND_ARCHITECTURE.md](./05_TECH_STACK_AND_ARCHITECTURE.md) | Full stack: React, FastAPI, MongoDB, APIs — complete system diagram |

## Quick Interview Answers

**"Are you using Google Maps?"**
> No. We use Leaflet (open-source map engine) + Esri imagery (free satellite photos) for the visual map. Sentinel Hub is used in the backend to calculate the NDVI crop health score.

**"What is NDVI?"**
> Normalized Difference Vegetation Index. Formula: `(NIR - Red) / (NIR + Red)`. It measures crop health from satellite data. Score above 0.65 = excellent crop, below 0.4 = stress.

**"How is the loan calculated?"**
> Area × Yield × Predicted Harvest Price → adjusted by satellite NDVI (45%), weather (35%), soil (20%) → multi-year succession revenue → capped at 60% for safety.

**"What AI model are you using?"**
> Meta LLaMA 3.3 70B, hosted on Groq LPU hardware. RAG (Retrieval-Augmented Generation) injects government scheme facts into the prompt to prevent hallucinations.
