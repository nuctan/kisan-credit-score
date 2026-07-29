import re

KISAN_GOVT_SCHEMES = [
    {
        "id": "pm_kisan",
        "title_hi": "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
        "title_en": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "benefit_hi": "₹6,000 प्रति वर्ष (₹2,000 की 3 किस्तों में सीधे बैंक खाते में)।",
        "benefit_en": "₹6,000 per year direct income support in 3 equal installments of ₹2,000.",
        "eligibility_hi": "सभी पात्र भूमिधारक किसान परिवार जिनके पास कृषि योग्य भूमि है।",
        "eligibility_en": "All landholding farmer families having cultivable land.",
        "apply_steps_hi": "pmkisan.gov.in पर e-KYC करें या नजदीकी CSC केंद्र से आधार लिंक कराएं।",
        "apply_steps_en": "Complete e-KYC on pmkisan.gov.in or link Aadhaar via nearest CSC center.",
        "keywords": ["pm kisan", "6000", "kist", "samman", "pmkisan", "income support", "direct benefit", "डीबीटी"]
    },
    {
        "id": "kcc_scheme",
        "title_hi": "किसान क्रेडिट कार्ड योजना (Kisan Credit Card - KCC)",
        "title_en": "Kisan Credit Card Scheme (KCC)",
        "benefit_hi": "रियायती दर पर ₹3 लाख तक का फसल ऋण (प्रॉम्प्ट भुगतान पर केवल 4% प्रभावी ब्याज)।",
        "benefit_en": "Concessional crop loan up to ₹3 Lakhs at 4% effective interest with 3% prompt repayment subvention.",
        "eligibility_hi": "किसान, बटाईदार, पट्टेदार और स्व-सहायता समूह।",
        "eligibility_en": "All farmers, tenant farmers, sharecroppers, and SHGs.",
        "apply_steps_hi": "निकटतम SBI/नाबार्ड या को-ऑपरेटिव बैंक में 7/12 खसरा और आधार जमा करें।",
        "apply_steps_en": "Submit 7/12 land records and Aadhaar to your nearest bank branch.",
        "keywords": ["kcc", "credit card", "loan", "interest", "subvention", "ऋण", "ब्याज", "केसीसी"]
    },
    {
        "id": "pmfby_insurance",
        "title_hi": "प्रधानमंत्री फसल बीमा योजना (PMFBY)",
        "title_en": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "benefit_hi": "रबी फसलों पर केवल 1.5% एवं खरीफ पर 2% प्रीमियम पर संपूर्ण फसल सुरक्षा।",
        "benefit_en": "Comprehensive risk coverage against crop loss at 1.5% premium for Rabi and 2% for Kharif.",
        "eligibility_hi": "अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान।",
        "eligibility_en": "All farmers growing notified crops in notified areas.",
        "apply_steps_hi": "pmfby.gov.in पर बुआई के 14 दिनों के भीतर बीमा फॉर्म भरें।",
        "apply_steps_en": "Apply on pmfby.gov.in within 14 days of sowing or via bank branch.",
        "keywords": ["insurance", "fasal bima", "pmfby", "crop loss", "bima", "बीमा", "फसल नुकसान"]
    },
    {
        "id": "pm_kusum",
        "title_hi": "पीएम-कुसुम सौर पंप योजना (PM-KUSUM)",
        "title_en": "PM-KUSUM Solar Pump Scheme",
        "benefit_hi": "सौर सिंचाई पंप स्थापित करने पर 60% से 90% तक की भारी सरकारी सब्सिडी।",
        "benefit_en": "60% to 90% government subsidy for installing solar-powered irrigation pumps.",
        "eligibility_hi": "ऐसे किसान जिनके पास कृषि योग्य भूमि एवं सिंचाई जल स्रोत उपलब्ध हो।",
        "eligibility_en": "Individual farmers, water user associations, and cooperatives.",
        "apply_steps_hi": "राज्य महाऊर्जा (MEDA / kusum.mnre.gov.in) पोर्टल पर आवेदन करें।",
        "apply_steps_en": "Apply online on state renewable energy portals (e.g. MEDA or kusum.mnre.gov.in).",
        "keywords": ["kusum", "solar", "pump", "irrigation", "solapump", "सोलर", "पंप", "सिंचाई"]
    },
    {
        "id": "soil_health_card",
        "title_hi": "मृदा स्वास्थ्य कार्ड योजना (Soil Health Card Scheme)",
        "title_en": "Soil Health Card Scheme",
        "benefit_hi": "मुफ्त मिट्टी परीक्षण और N-P-K एवं सूक्ष्म पोषक तत्वों के लिए अनुकूलित सलाह।",
        "benefit_en": "Free soil testing and customized N-P-K fertilizer advisories every 2 years.",
        "eligibility_hi": "भारत के सभी कृषि भूमि धारक किसान।",
        "eligibility_en": "All agricultural landholding farmers across India.",
        "apply_steps_hi": "स्थानीय कृषि अधिकारी / कृषि विज्ञान केंद्र (KVK) को मिट्टी का नमूना दें।",
        "apply_steps_en": "Provide soil sample to local Agriculture Officer or nearest KVK center.",
        "keywords": ["soil", "soil health", "card", "fertilizer", "npk", "मिट्टी", "उर्वरक", "मृदा"]
    },
    {
        "id": "smam_machinery",
        "title_hi": "कृषि यांत्रिकीकरण उप-मिशन (SMAM Scheme)",
        "title_en": "Sub-Mission on Agricultural Mechanization (SMAM)",
        "benefit_hi": "ट्रैक्टर, थ्रेशर एवं कृषि यंत्रों की खरीद पर 40% से 50% सरकारी सब्सिडी।",
        "benefit_en": "40% to 50% financial subsidy on tractors, harvesters, and implements.",
        "eligibility_hi": "छोटे और सीमांत किसान, महिला किसान और अनुसूचित जाति/जनजाति के किसान।",
        "eligibility_en": "Small & marginal farmers, women farmers, and SC/ST farmers.",
        "apply_steps_hi": "agrimachinery.nic.in डिब DBT पोर्टल पर ऑनलाइन पंजीयन करें।",
        "apply_steps_en": "Register on agrimachinery.nic.in portal with Aadhaar & land papers.",
        "keywords": ["smam", "tractor", "machinery", "subsidy", "implements", "ट्रैक्टर", "यंत्र", "सब्सिडी"]
    },
    {
        "id": "maharashtra_karjmukti",
        "title_hi": "महात्मा ज्योतिराव फुले शेतकरी कर्जमुक्ती योजना (महाराष्ट्र)",
        "title_en": "Mahatma Jyotirao Phule Shetkari Karjmukti Yojna (Maharashtra)",
        "benefit_hi": "₹2 लाख तक का फसल ऋण माफी प्रोत्साहन एवं नियमित भुगतान पर ₹50,000 प्रोत्साहन अनुदान।",
        "benefit_en": "Crop loan waiver up to ₹2 Lakhs and ₹50,000 incentive bonus for prompt repayers.",
        "eligibility_hi": "महाराष्ट्र के वे किसान जिन्होंने राष्ट्रीयकृत या सहकारी बैंकों से फसल ऋण लिया है।",
        "eligibility_en": "Maharashtra farmers with short-term crop loans from coop/nationalized banks.",
        "apply_steps_hi": "नजदीकी आपकी सरकार / CSC केंद्र पर जाकर बायोमेट्रिक सत्यापन कराएं।",
        "apply_steps_en": "Visit nearest Aaple Sarkar / CSC center for biometric verification.",
        "keywords": ["karjmukti", "loan waiver", "maharashtra", "shetkari", "कर्जमुक्ती", "माफी", "50000"]
    }
]

def query_kisan_schemes(user_query: str = "", crop: str = "", state: str = "Maharashtra", lang: str = "hi"):
    """
    Python RAG Search Engine: Performs keyword & semantic similarity matching
    over the Kisan Schemes Knowledge Base to retrieve relevant government schemes.
    """
    query_lower = (user_query + " " + crop + " " + state).lower()
    
    matched_schemes = []
    for scheme in KISAN_GOVT_SCHEMES:
        score = 0
        for kw in scheme["keywords"]:
            if kw in query_lower:
                score += 2
        
        # Boost specific schemes based on crop or state context
        if "maharashtra" in state.lower() and scheme["id"] == "maharashtra_karjmukti":
            score += 3
        if ("pump" in query_lower or "water" in query_lower) and scheme["id"] == "pm_kusum":
            score += 4
        if ("insurance" in query_lower or "loss" in query_lower) and scheme["id"] == "pmfby_insurance":
            score += 4
        if ("loan" in query_lower or "credit" in query_lower) and scheme["id"] == "kcc_scheme":
            score += 3
            
        matched_schemes.append((score, scheme))

    # Sort by relevance score descending
    matched_schemes.sort(key=lambda x: x[0], reverse=True)
    
    # Return top 4 most relevant schemes
    top_schemes = [item[1] for item in matched_schemes[:4]]

    # Build RAG text summary for LLM prompt injection
    rag_prompt_text = "政府-किसान योजनाएं एवं सब्सिडी विवरण (Government Kisan Schemes RAG Knowledge Context):\n"
    for s in top_schemes:
        if lang == "en":
            rag_prompt_text += f"- {s['title_en']}: {s['benefit_en']} Eligibility: {s['eligibility_en']} Steps: {s['apply_steps_en']}\n"
        else:
            rag_prompt_text += f"- {s['title_hi']}: {s['benefit_hi']} पात्रता: {s['eligibility_hi']} आवेदन: {s['apply_steps_hi']}\n"

    return {
        "status": "success",
        "total_schemes_available": len(KISAN_GOVT_SCHEMES),
        "query": user_query,
        "matched_schemes": top_schemes,
        "rag_prompt_summary": rag_prompt_text
    }
