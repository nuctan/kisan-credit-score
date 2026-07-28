def get_1year_crop_succession_plan(current_crop: str, area_hectares: float, current_crop_revenue: float):
    """
    Calculates a 12-Month Crop Succession Plan for a 1-Year Loan Cycle.
    If the current crop (e.g. Wheat) is harvested in ~3-4 months, it predicts 
    what can be grown in the remaining months (Summer + Monsoon) to maximize 
    annual income and soil health.
    """
    crop_lower = current_crop.lower()

    # Pre-defined succession mapping based on Indian agricultural zones
    if "wheat" in crop_lower or "गेहूं" in crop_lower:
        succession_cycles = [
          {
            "cycle_number": 1,
            "period": "महीने 1 - 4 (रबी - Winter)",
            "crop": "गेहूं (Wheat - वर्तमान फसल)",
            "duration_months": 4,
            "harvest_month": "अप्रैल (April)",
            "estimated_revenue_rs": round(current_crop_revenue, 2),
            "soil_impact": "उच्च बाजार मांग, संतुलित पोषक तत्व खपत",
            "status": "वर्तमान में उगाई जा रही है"
          },
          {
            "cycle_number": 2,
            "period": "महीने 5 - 7 (जायद - Summer)",
            "crop": "मूंग दलहन (Mung Bean / Summer Pulses)",
            "duration_months": 3,
            "harvest_month": "जुलाई (July)",
            "estimated_revenue_rs": round(area_hectares * 38000 * 1.05, 2),
            "soil_impact": "मिट्टी में प्राकृतिक नाइट्रोजन निर्धारण (N-Fixation)",
            "status": "कटाई पश्चात अनुशंसित उत्तराधिकारी फसल 1"
          },
          {
            "cycle_number": 3,
            "period": "महीने 8 - 12 (खरीफ - Monsoon)",
            "crop": "धान / मक्का (Paddy / Maize)",
            "duration_months": 5,
            "harvest_month": "नवंबर (November)",
            "estimated_revenue_rs": round(area_hectares * 85000 * 1.08, 2),
            "soil_impact": "उच्च पैदावार, भरपूर मानसून वर्षा का उपयोग",
            "status": "अनुशंसित उत्तराधिकारी फसल 2"
          }
        ]
    elif "rice" in crop_lower or " धान" in crop_lower or "चावल" in crop_lower:
        succession_cycles = [
          {
            "cycle_number": 1,
            "period": "महीने 1 - 5 (खरीफ - Monsoon)",
            "crop": "धान (Rice - वर्तमान फसल)",
            "duration_months": 5,
            "harvest_month": "नवंबर (November)",
            "estimated_revenue_rs": round(current_crop_revenue, 2),
            "soil_impact": "उच्च जल खपत, भरपूर मानसून उपयोग",
            "status": "वर्तमान में उगाई जा रही है"
          },
          {
            "cycle_number": 2,
            "period": "महीने 6 - 9 (रबी - Winter)",
            "crop": "गेहूं / चना (Wheat / Chickpea)",
            "duration_months": 4,
            "harvest_month": "मार्च (March)",
            "estimated_revenue_rs": round(area_hectares * 78000 * 1.05, 2),
            "soil_impact": "मिट्टी की नमी का उपयोग एवं बाजार मांग",
            "status": "कटाई पश्चात अनुशंसित उत्तराधिकारी फसल 1"
          },
          {
            "cycle_number": 3,
            "period": "महीने 10 - 12 (जायद - Summer)",
            "crop": "सूरजमुखी / सब्जियां (Sunflower / Vegetables)",
            "duration_months": 3,
            "harvest_month": "जून (June)",
            "estimated_revenue_rs": round(area_hectares * 42000 * 1.02, 2),
            "soil_impact": "त्वरित नकद आय एवं नमी संरक्षण",
            "status": "अनुशंसित उत्तराधिकारी फसल 2"
          }
        ]
    else: # Cotton / Sugarcane / Default
        succession_cycles = [
          {
            "cycle_number": 1,
            "period": "महीने 1 - 5 (वर्तमान सीजन)",
            "crop": f"{current_crop} (वर्तमान फसल)",
            "duration_months": 5,
            "harvest_month": "नवंबर (November)",
            "estimated_revenue_rs": round(current_crop_revenue, 2),
            "soil_impact": "मुख्य नकदी फसल आय",
            "status": "वर्तमान में उगाई जा रही है"
          },
          {
            "cycle_number": 2,
            "period": "महीने 6 - 9 (अगला सीजन)",
            "crop": "चना / सरसों (Chickpea / Mustard)",
            "duration_months": 4,
            "harvest_month": "मार्च (March)",
            "estimated_revenue_rs": round(area_hectares * 65000 * 1.04, 2),
            "soil_impact": "उर्वरता संतुलन एवं तिलहन मांग",
            "status": "कटाई पश्चात अनुशंसित उत्तराधिकारी फसल 1"
          },
          {
            "cycle_number": 3,
            "period": "महीने 10 - 12 (ग्रीष्म सीजन)",
            "crop": "हरे चारे / दलहन (Fodder / Pulses)",
            "duration_months": 3,
            "harvest_month": "जून (June)",
            "estimated_revenue_rs": round(area_hectares * 35000 * 1.02, 2),
            "soil_impact": "जैविक कार्बन वृद्धि",
            "status": "अनुशंसित उत्तराधिकारी फसल 2"
          }
        ]

    total_1year_revenue = sum(c["estimated_revenue_rs"] for c in succession_cycles)
    one_year_loan_limit = round(total_1year_revenue * 0.60, 2)

    return {
        "loan_tenure_months": 12,
        "succession_cycles": succession_cycles,
        "total_1year_combined_revenue_rs": round(total_1year_revenue, 2),
        "one_year_loan_eligibility_cap_rs": one_year_loan_limit,
        "repayment_capacity_score": "उत्कृष्ट (High Repayment Capacity)" if total_1year_revenue > 200000 else "सामान्य"
    }
