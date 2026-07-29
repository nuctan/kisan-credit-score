const Chat = require('../models/Chat');
const axios = require('axios');

let groq = null;

const getGroqClient = () => {
  if (!groq) {
    const Groq = require('groq-sdk');
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

exports.chatWithAI = async (req, res) => {
  try {
    const { message, chatId, landContext, lang } = req.body;
    const userId = req.user.id;

    let chat;
    let messagesHistory = [];

    // Check if chat exists, if not create one
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      if (chat.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this chat' });
      }
      messagesHistory = chat.messages.map(msg => ({ role: msg.role, content: msg.content }));
    } else {
      chat = new Chat({ user: userId, messages: [] });
    }

    // Add new user message
    messagesHistory.push({ role: 'user', content: message });
    chat.messages.push({ role: 'user', content: message });

    // Language Detection: Check if language is explicit English OR message contains English words
    const userMsgLower = message.toLowerCase();
    const containsEnglish = /[a-zA-Z]{3,}/.test(userMsgLower);
    const respondInEnglish = lang === 'en' || containsEnglish;

    // Extract Land & Calculation Details from Context
    const pred = landContext?.predictions || {};
    const scores = landContext?.ai_scores || {};
    const plan = landContext?.one_year_succession_plan || {};
    const inputs = landContext?.inputs || {};

    // Calculate fallback estimated loan limit if not computed yet
    const areaHa = parseFloat(inputs.area_hectares) || 2.5;
    const fallbackLoanCap = Math.round(areaHa * 3.5 * 10 * 2275 * 2.2 * 0.60);
    const loanEligibilityAmount = pred.suggested_loan_limit_rs || fallbackLoanCap;

    let dynamicSystemPrompt = respondInEnglish
      ? `You are KrishiAI — an expert Agricultural Risk & Credit Assessment Assistant for Indian Farmers.
      Respond in clear, friendly English.
            [CONFIRMED FARMER FORM DATA]:
        - Crop: ${inputs.crop || 'N/A'}
        - Location: ${inputs.district || 'N/A'}, ${inputs.state || 'N/A'}
        - Land Area: ${inputs.area_hectares || 'N/A'} Hectares
        - Loan Tenure: ${plan.loan_tenure_years || 1} Year(s)
        - Sowing Month: ${plan.start_month || 'N/A'}
        - Next Crop Sowing Decision: ${plan.next_crop_decision?.recommended_next_crop || 'Summer Mung Bean'} in ${plan.next_crop_decision?.recommended_next_sow_date || 'May First Week'}
        
        [ML TELEMETRY & CALCULATIONS]:
        - Current Crop Revenue: ₹${pred.adjusted_estimated_revenue_rs || 'N/A'}
        - Total Loan Tenure Combined Revenue: ₹${pred.total_1year_combined_revenue_rs || 'N/A'}
        - MAXIMUM SAFE LOAN ELIGIBILITY CAP (60% Rule): ₹${pred.suggested_loan_limit_rs || 'N/A'}
        - Risk Level: ${pred.risk_level || 'Medium'}
        - NDVI Score: ${scores.ndvi?.score || 'N/A'}
        - IMD Weather: ${scores.weather?.description || 'N/A'}
        
        INSTRUCTIONS FOR YOUR RESPONSE:
        1. Acknowledge their form details and state immediately: "Based on your land details, you are eligible for a loan amount of ₹${pred.suggested_loan_limit_rs?.toLocaleString('en-IN') || 'N/A'}"
        2. Explicitly state the recommended next crop and exact sowing date (e.g. "Sow ${plan.next_crop_decision?.recommended_next_crop || 'Summer Mung Bean'} in ${plan.next_crop_decision?.recommended_next_sow_date || 'May'}").
        3. Do NOT ask for crop, state, or area. Ask if they want assistance with PM Fasal Bima crop insurance, SBI/NABARD KCC application, or irrigation optimization.`
      
      : `आप किसानAI हैं — भारतीय किसानों के लिए विशेषज्ञ कृषि ऋण मूल्यांकन सहायक।
      सरल और किसान-मित्र हिंदी भाषा में जवाब दें।
      
      [डैशबोर्ड फ़ॉर्म से किसान का सत्यापित डेटा]:
      - फसल: ${inputs.crop || 'गेहूं'}
      - स्थान: ${inputs.district || 'अहिल्यानगर'}, ${inputs.state || 'महाराष्ट्र'}
      - खेत का क्षेत्रफल: ${areaHa} हेक्टेयर (~${(areaHa * 3.95).toFixed(1)} बीघा)
      - ऋण अवधि: ${plan.loan_tenure_years || 1} वर्ष
      - बुआई का महीना: ${plan.start_month || 'नवंबर'}
      
      [सत्यापित ऋण पात्रता राशि]:
      - स्वीकार्य अधिकतम सुरक्षित ऋण राशि: ₹${loanEligibilityAmount.toLocaleString('en-IN')}
      
      सख्त नियम:
      1. किसान से कभी भी फसल, स्थान, खेत का क्षेत्रफल या ऋण की अवधि न पूछें! किसान यह जानकारी फ़ॉर्म में भर चुका है।
      2. जब भी किसान ऋण की मात्रा पूछे, तो स्पष्ट रूप से कहें:
         "आपके भूमि विवरण (${inputs.crop || 'गेहूं'}, ${areaHa} हेक्टेयर) के अनुसार, **आप ₹${loanEligibilityAmount.toLocaleString('en-IN')} की ऋण राशि के लिए पात्र हैं (You are eligible for loan amount ₹${loanEligibilityAmount.toLocaleString('en-IN')})।**"
      3. महीने-दर-महीने कटाई और उत्तराधिकार फसल योजना समझाएं।
      4. पूछें कि क्या वे केसीसी बैंक आवेदन (स्टेट बैंक/नाबार्ड), पीएम फसल बीमा योजना या सिंचाई में मदद चाहते हैं।`;

    // Construct full prompt for Groq
    const apiMessages = [
      { role: 'system', content: dynamicSystemPrompt },
      ...messagesHistory
    ];

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'dummy_key') {
      const placeholderReply = respondInEnglish
        ? `Based on your land details (${inputs.crop || 'Wheat'} on ${areaHa} Ha), **you are eligible for a loan amount of ₹${loanEligibilityAmount.toLocaleString('en-IN')}**.`
        : `आपके भूमि विवरण (${inputs.crop || 'गेहूं'}, ${areaHa} हेक्टेयर) के अनुसार, **आप ₹${loanEligibilityAmount.toLocaleString('en-IN')} की ऋण राशि के लिए पात्र हैं (You are eligible for loan amount ₹${loanEligibilityAmount.toLocaleString('en-IN')})।**`;

      chat.messages.push({ role: 'assistant', content: placeholderReply });
      await chat.save();
      return res.json({ chatId: chat._id, reply: placeholderReply });
    }

    // Call Groq API
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: apiMessages,
      temperature: 0.5,
      max_tokens: 600,
    });

    const aiReply = completion.choices[0]?.message?.content || (
      respondInEnglish
        ? `Based on your land details, **you are eligible for a loan amount of ₹${loanEligibilityAmount.toLocaleString('en-IN')}**.`
        : `आपके भूमि विवरण के अनुसार, **आप ₹${loanEligibilityAmount.toLocaleString('en-IN')} की ऋण राशि के लिए पात्र हैं।**`
    );

    chat.messages.push({ role: 'assistant', content: aiReply });
    await chat.save();

    res.json({ chatId: chat._id, reply: aiReply });
  } catch (error) {
    console.error('Groq AI Error:', error);

    // Fallback response if Groq API fails or hits rate limits
    const { landContext, lang, message } = req.body;
    const areaHa = parseFloat(landContext?.inputs?.area_hectares) || 2.5;
    const fallbackLoanCap = Math.round(areaHa * 3.5 * 10 * 2275 * 2.2 * 0.60);
    const loanAmt = landContext?.predictions?.suggested_loan_limit_rs || fallbackLoanCap;

    const containsEng = /[a-zA-Z]{3,}/.test((message || '').toLowerCase());
    const isEng = lang === 'en' || containsEng;

    const fallbackReply = isEng
      ? `Based on your land details (${areaHa} Hectares), **you are eligible for a loan amount of ₹${loanAmt.toLocaleString('en-IN')}**.`
      : `आपके भूमि विवरण (${areaHa} हेक्टेयर) के अनुसार, **आप ₹${loanAmt.toLocaleString('en-IN')} की ऋण राशि के लिए पात्र हैं।**`;

    res.json({ chatId: req.body.chatId, reply: fallbackReply });
  }
};

// Analyze Land via Python ML Service
exports.analyzeLand = async (req, res) => {
  try {
    const { state, district, crop, area_hectares, lat, lon, loan_tenure_years, start_month_index, current_crop_duration } = req.body;
    
    // Call the Python FastAPI ML Microservice
    const mlResponse = await axios.post('http://127.0.0.1:8000/api/predict-revenue', {
      state,
      district,
      crop,
      area_hectares,
      lat,
      lon,
      loan_tenure_years: loan_tenure_years || 1,
      start_month_index: start_month_index !== undefined ? start_month_index : 10,
      current_crop_duration: current_crop_duration || 4
    });

    res.json(mlResponse.data);
  } catch (error) {
    console.error('ML Service Error:', error.message);
    res.status(500).json({ message: 'Error analyzing land via ML service', error: error.message });
  }
};

// Get user chat history
exports.getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history', error: error.message });
  }
};

// Get single chat by ID
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat', error: error.message });
  }
};
