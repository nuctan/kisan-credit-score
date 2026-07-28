export const translations = {
  hi: {
    title: 'किसानAI',
    subtitle: 'Sentinel-2 मैप व बहु-वर्षीय ऋण चक्र फसल उत्तराधिकार प्रणाली',
    dashboardTab: '📊 डैशबोर्ड व नक्शा',
    chatTab: '💬 AI सहायक',
    logout: 'लॉग आउट',
    farmer: 'किसान',
    
    // Step 1: Input Details
    enterDetailsTitle: 'फसल, समय अवधि एवं ऋण की अवधि दर्ज करें',
    step1: 'चरण 1 / 2',
    state: 'राज्य (State)',
    district: 'जिला (District)',
    crop: 'फसल (Crop)',
    areaHectares: 'क्षेत्रफल (हेक्टेयर)',
    areaBigha: 'क्षेत्रफल (बीघा)',
    calculatedFromMap: 'मानचित्र से स्वचालित गणना',
    loanTenure: 'ऋण की अवधि (Loan Tenure)',
    startMonth: 'बुवाई का महीना (Sowing Month)',
    cropDuration: 'फसल अवधि (Crop Duration)',
    oneYear: '1 वर्ष (1 Year)',
    twoYears: '2 वर्ष (2 Years)',
    threeYears: '3 वर्ष (3 Years)',
    fiveYears: '5 वर्ष (5 Years)',
    months: 'महीने (Months)',

    wheat: 'गेहूं (Wheat)',
    rice: 'चावल / धान (Rice)',
    cotton: 'कपास (Cotton)',
    sugarcane: 'गन्ना (Sugarcane)',
    maize: 'मक्का (Maize)',

    // Step 2: Map
    mapTitle: 'Sentinel-2 मैप पर खेत की सीमा (Polygon) चुनें',
    analyzingText: '⚡ ML इंजन व IMD डेटा विश्लेषण कर रहा है...',
    satelliteView: '🛰️ Sentinel-2 HD View',
    streetView: '🗺️ स्ट्रीट व्यू',
    selectedGps: 'GPS स्थान',
    calculatedArea: 'गणित क्षेत्रफल (Area)',
    clearPolygon: '🧹 सीमा साफ़ करें',
    confirmLand: '🎯 इस भूमि का विश्लेषण करें (Analyze Land)',
    drawInstruction: 'खेत के चारों ओर बिंदु (Points) बनाकर सीमा खींचें',

    // Analysis Cards
    landAnalysisTitle: 'भूमि एवं फसल विश्लेषण (Land & Telemetry Report)',
    remoteSensingSubtitle: 'Sentinel-2 व IMD डेटा पर आधारित रिमोट सेंसिंग रिपोर्ट',
    activeReport: 'सक्रिय रिपोर्ट',
    ndviTitle: 'वनस्पति स्वास्थ्य (NDVI)',
    weatherTitle: 'मौसम पूर्वानुमान (IMD)',
    soilTitle: 'मिट्टी की गुणवत्ता (N-P-K)',
    baselineYieldTitle: 'ऐतिहासिक औसत उपज',
    perHectare: 'टन/हेक्टेयर',
    mandiPrice: 'मंडी भाव',
    perQuintal: 'रुपये/क्विंटल',

    // Multi-Year Succession
    successionTitle: 'ऋण चक्र एवं फसल उत्तराधिकार रिपोर्ट (Multi-Year Crop Succession Plan)',
    successionSubtitle: 'बुआई के महीने से फसल चक्र व बचे हुए ऋण अवधि का संपूर्ण आय नियोजन',
    total1YearRev: 'ऋण अवधि की कुल संयुक्त आय',
    harvestMonth: 'कटाई',
    estRevenue: 'अनुमानित आय',
    repaymentLogicTitle: 'ऋण चुकाने की क्षमता का विश्लेषण:',

    // Financial & Credit Limit
    financialTitle: 'अनुमानित आय एवं ऋण पात्रता रिपोर्ट',
    financialSubtitle: 'फसल पैदावार और बाजार मूल्यों पर आधारित वित्तीय विश्लेषण',
    riskLevel: 'जोखिम स्तर',
    currentCropRev: 'वर्तमान फसल से अनुमानित आय',
    futureCycleRev: 'भावी चक्रों की अनुमानित आय',
    totalExpectedRev: 'कुल अपेक्षित आय (Total Revenue)',
    safeCreditCap: 'अनुशंसित अधिकतम सुरक्षित ऋण सीमा (Safe Credit Limit Cap)',
    safeCreditDesc: 'आय की 55-60% सुरक्षित सीमा के आधार पर बैंक स्वीकृति हेतु उपयुक्त',

    // Actions & Reports
    downloadPdf: '📄 बैंक ऋण रिपोर्ट डाउनलोड करें (Download Official PDF Report)',
    cropRotationTitle: 'फसल चक्र व वार्षिक आय योजक (Crop Rotation Planner)',
    expertTip: 'कृषि विशेषज्ञ सुझाव:',

    // AI Chat Assistant
    chatHeader: 'किसानAI सहायक चैट',
    chatPlaceholder: 'फसल, आय या ऋण से जुड़ें सवाल पूछें...',
    chatSending: '🌾 AI सोच रहा है...',
    chatDisclaimer: 'किसानAI अनुमान गलत हो सकते हैं। वित्तीय निर्णय लेने से पहले सत्यापित करें।'
  },
  en: {
    title: 'KrishiAI',
    subtitle: 'Sentinel-2 Satellite Map & Multi-Year Loan Cycle Crop Succession Platform',
    dashboardTab: '📊 Dashboard & Map',
    chatTab: '💬 AI Assistant',
    logout: 'Sign Out',
    farmer: 'Farmer',

    // Step 1: Input Details
    enterDetailsTitle: 'Enter Crop Details, Timing & Loan Tenure',
    step1: 'Step 1 / 2',
    state: 'State',
    district: 'District',
    crop: 'Select Crop',
    areaHectares: 'Area (Hectares)',
    areaBigha: 'Area (Bigha)',
    calculatedFromMap: 'Auto-calculated from Map',
    loanTenure: 'Loan Tenure Duration',
    startMonth: 'Sowing Start Month',
    cropDuration: 'Current Crop Duration',
    oneYear: '1 Year',
    twoYears: '2 Years',
    threeYears: '3 Years',
    fiveYears: '5 Years',
    months: 'Months',

    wheat: 'Wheat',
    rice: 'Rice / Paddy',
    cotton: 'Cotton',
    sugarcane: 'Sugarcane',
    maize: 'Maize',

    // Step 2: Map
    mapTitle: 'Select Land Boundary (Polygon) on Sentinel-2 Map',
    analyzingText: '⚡ Analyzing ML Engine & IMD Climate Data...',
    satelliteView: '🛰️ Sentinel-2 HD View',
    streetView: '🗺️ Street View',
    selectedGps: 'GPS Coordinates',
    calculatedArea: 'Calculated Field Area',
    clearPolygon: '🧹 Clear Boundary',
    confirmLand: '🎯 Analyze Selected Farmland',
    drawInstruction: 'Click on the map to draw points around your farm boundary',

    // Analysis Cards
    landAnalysisTitle: 'Land & Telemetry Analysis Report',
    remoteSensingSubtitle: 'Remote sensing report based on Sentinel-2 satellite & IMD data',
    activeReport: 'Active Report',
    ndviTitle: 'Vegetation Health (NDVI)',
    weatherTitle: 'Weather Forecast (IMD)',
    soilTitle: 'Soil Quality (N-P-K)',
    baselineYieldTitle: 'Historical Avg Yield',
    perHectare: 'Tonnes/Hectare',
    mandiPrice: 'Mandi Price',
    perQuintal: 'Rs/Quintal',

    // Multi-Year Succession
    successionTitle: 'Loan Cycle & Multi-Year Crop Succession Plan',
    successionSubtitle: 'Complete multi-year crop succession strategy from sowing date through full loan tenure',
    total1YearRev: 'Total Loan Tenure Combined Income',
    harvestMonth: 'Harvest',
    estRevenue: 'Estimated Revenue',
    repaymentLogicTitle: 'Loan Repayment Capacity Analysis:',

    // Financial & Credit Limit
    financialTitle: 'Estimated Income & Loan Eligibility Report',
    financialSubtitle: 'Financial evaluation based on crop yield and market prices',
    riskLevel: 'Risk Level',
    currentCropRev: 'Current Crop Estimated Income',
    futureCycleRev: 'Projected Income (Future Cycles)',
    totalExpectedRev: 'Total Expected Revenue',
    safeCreditCap: 'Maximum Safe Credit Limit Cap (55-60% Rule)',
    safeCreditDesc: 'Recommended bank loan limit based on safe repayment capacity',

    // Actions & Reports
    downloadPdf: '📄 Download Official Bank Credit Report (PDF)',
    cropRotationTitle: 'Multi-Season Crop Rotation Planner',
    expertTip: 'Agronomy Expert Advice:',

    // AI Chat Assistant
    chatHeader: 'KrishiAI Assistant Chat',
    chatPlaceholder: 'Ask any questions about crop yield, loan limit, or weather...',
    chatSending: '🌾 AI is thinking...',
    chatDisclaimer: 'KrishiAI estimates are projections. Verify before final financial decisions.'
  }
};
