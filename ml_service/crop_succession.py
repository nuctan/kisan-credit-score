MONTH_NAMES = [
    "जनवरी (January)", "फ़रवरी (February)", "मार्च (March)", "अप्रैल (April)",
    "मई (May)", "जून (June)", "जुलाई (July)", "अगस्त (August)",
    "सितंबर (September)", "अक्टूबर (October)", "नवंबर (November)", "दिसंबर (December)"
]

def get_multiyear_crop_succession_plan(
    current_crop: str, 
    area_hectares: float, 
    current_crop_revenue: float,
    loan_tenure_years: int = 1,
    start_month_index: int = 10, # default November (0-indexed 10)
    current_crop_duration: int = 4
):
    """
    Calculates a multi-year (1, 2, 3, or 5 Year) crop succession and revenue plan.
    Takes into account the exact sowing start month and current crop duration.
    """
    total_months = loan_tenure_years * 12
    crop_lower = current_crop.lower()
    
    # 1. Harvest month index for current crop
    first_harvest_month_idx = (start_month_index + current_crop_duration) % 12
    
    succession_cycles = []
    
    # Cycle 1: Current Crop
    succession_cycles.append({
        "cycle_number": 1,
        "year": 1,
        "period": f"महीने 1 - {current_crop_duration} ({MONTH_NAMES[start_month_index]} से {MONTH_NAMES[first_harvest_month_idx]})",
        "crop": f"{current_crop} (वर्तमान फसल)",
        "duration_months": current_crop_duration,
        "harvest_month": MONTH_NAMES[first_harvest_month_idx],
        "estimated_revenue_rs": round(current_crop_revenue, 2),
        "soil_impact": "मुख्य फसल पैदावार",
        "status": "वर्तमान में उगाई जा रही है"
    })

    remaining_months = total_months - current_crop_duration
    current_month_cursor = first_harvest_month_idx
    cycle_counter = 2
    
    # Succession Pool based on crop rotation science
    rotation_pool = [
        {"crop": "मूंग दलहन (Mung Bean / Pulses)", "rev_per_ha": 38000, "duration": 3, "impact": "मिट्टी में नाइट्रोजन निर्धारण (N-Fixation)"},
        {"crop": "धान / मक्का (Paddy / Maize)", "rev_per_ha": 86000, "duration": 5, "impact": "उच्च मानसून पैदावार"},
        {"crop": "गेहूं / सरसों (Wheat / Mustard)", "rev_per_ha": 82000, "duration": 4, "impact": "रबी सीजन उच्च बाजार मूल्य"},
        {"crop": "सूरजमुखी / सब्जियां (Sunflower / Vegetables)", "rev_per_ha": 45000, "duration": 3, "impact": "त्वरित नकद आय एवं नमी संरक्षण"}
    ]
    
    pool_idx = 0
    while remaining_months > 0:
        rot = rotation_pool[pool_idx % len(rotation_pool)]
        duration = min(rot["duration"], remaining_months)
        end_month_idx = (current_month_cursor + duration) % 12
        year_num = ((total_months - remaining_months) // 12) + 1
        
        cycle_rev = round(area_hectares * rot["rev_per_ha"] * (1 + (year_num * 0.03)), 2)
        
        succession_cycles.append({
            "cycle_number": cycle_counter,
            "year": year_num,
            "period": f"वर्ष {year_num} - {MONTH_NAMES[current_month_cursor]} से {MONTH_NAMES[end_month_idx]}",
            "crop": rot["crop"],
            "duration_months": duration,
            "harvest_month": MONTH_NAMES[end_month_idx],
            "estimated_revenue_rs": cycle_rev,
            "soil_impact": rot["impact"],
            "status": f"अनुशंसित फसल उत्तराधिकार #{cycle_counter - 1}"
        })
        
        remaining_months -= duration
        current_month_cursor = end_month_idx
        pool_idx += 1
        cycle_counter += 1

    total_combined_revenue = sum(c["estimated_revenue_rs"] for c in succession_cycles)
    # Safe loan eligibility cap based on multi-year loan tenure
    safe_loan_cap = round(total_combined_revenue * 0.55, 2)

    return {
        "loan_tenure_years": loan_tenure_years,
        "total_loan_months": total_months,
        "start_month": MONTH_NAMES[start_month_index],
        "current_crop_duration_months": current_crop_duration,
        "succession_cycles": succession_cycles,
        "total_annual_combined_revenue_rs": round(total_combined_revenue, 2),
        "one_year_loan_eligibility_cap_rs": safe_loan_cap,
        "repayment_capacity_score": "उच्च (High Repayment Capacity)" if safe_loan_cap > 150000 else "सामान्य"
    }
