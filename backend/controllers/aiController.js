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

const SYSTEM_PROMPT = `आप किसानAI हैं — एक कृषि ऋण मूल्यांकन सहायक। आपका काम किसानों की फसल की कीमत और ऋण चुकाने की क्षमता का अनुमान लगाना है।

आपको उपयोगकर्ता से निम्नलिखित जानकारी इकट्ठी करनी है:
- नाम
- राज्य और जिला
- खेत का क्षेत्रफल (बीघा या हेक्टेयर में)
- कौन सी फसल उगा रहे हैं
- सिंचाई का साधन (नहर, बोरवेल, बारिश आदि)
- मिट्टी का प्रकार (अगर पता हो)
- कितना ऋण चाहिए (रुपये में)

नियम:
1. हमेशा हिंदी में जवाब दें। सरल और किसान-मित्र भाषा का उपयोग करें।
2. एक बार में एक या दो सवाल पूछें ताकि बातचीत स्वाभाविक रहे।
3. केवल कृषि, फसल, मौसम, मिट्टी, ऋण मूल्यांकन और खेती से संबंधित विषयों पर बात करें।
4. अगर उपयोगकर्ता असंबंधित सवाल पूछे, तो विनम्रता से कहें: "मैं केवल कृषि ऋण मूल्यांकन और फसल विश्लेषण में मदद कर सकता हूँ।"
5. जब सभी जानकारी मिल जाए, तो एक सारांश दें जिसमें शामिल हो:
   - अनुमानित उपज (क्विंटल/हेक्टेयर)
   - अनुमानित आय (₹ में)
   - ऋण चुकाने की संभावना
   - जोखिम स्तर (कम/मध्यम/उच्च)
6. कभी भी ऋण स्वीकृति की गारंटी न दें। स्पष्ट करें कि ये अनुमान हैं।
7. किसान को "आप" कहकर संबोधित करें, सम्मान से बात करें।
8. अगर उपयोगकर्ता अंग्रेजी में बात करे, तो भी हिंदी में जवाब दें लेकिन कुछ अंग्रेजी शब्द ठीक हैं।`;

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
      // Verify chat ownership
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

    // Dynamic Language Prompt & Context Injection
    const isEnglish = lang === 'en';
    let dynamicSystemPrompt = isEnglish
      ? `You are KrishiAI — an expert Agricultural Risk & Credit Assessment Assistant for Indian Farmers. 
      Your task is to clearly explain loan eligibility limits, crop yield predictions, weather risks, and crop succession strategies.
      Always state the exact maximum loan eligibility amount in your first line when land data is available.`
      : `आप किसानAI हैं — एक विशेषज्ञ कृषि ऋण मूल्यांकन सहायक। आपका काम किसानों को उनकी फसल की पैदावार, ऋण पात्रता राशि और फसल उत्तराधिकार योजना के बारे में विस्तार से समझाना है।
      जब जमीन का विश्लेषण उपलब्ध हो, तो अपनी पहली पंक्ति में ही किसान को उनकी स्वीकार्य अधिकतम ऋण राशि (₹) स्पष्ट रूप से बताएं।`;

    if (landContext) {
      const pred = landContext.predictions || {};
      const scores = landContext.ai_scores || {};
      const plan = landContext.one_year_succession_plan || {};

      if (isEnglish) {
        dynamicSystemPrompt += `\n\n[SYSTEM DATA - FARMLAND TELEMETRY]:
        - Current Crop Revenue: ₹${pred.adjusted_estimated_revenue_rs || 'N/A'}
        - Loan Tenure: ${plan.loan_tenure_years || 1} Year(s)
        - Total Loan Tenure Combined Revenue: ₹${pred.total_1year_combined_revenue_rs || 'N/A'}
        - MAXIMUM SAFE LOAN ELIGIBILITY CAP (60% Rule): ₹${pred.suggested_loan_limit_rs || 'N/A'}
        - Risk Level: ${pred.risk_level || 'Medium'}
        - NDVI Vegetation Score: ${scores.ndvi?.score || 'N/A'}
        - IMD Weather: ${scores.weather?.description || 'N/A'}
        
        INSTRUCTIONS FOR YOUR RESPONSE:
        1. Begin immediately by stating: "Maximum Loan Amount You Can Receive: ₹${pred.suggested_loan_limit_rs?.toLocaleString('en-IN') || 'N/A'}"
        2. Explain the month-by-month crop succession strategy (e.g. Sowing in ${plan.start_month || 'November'}, harvest month, and succession crops).
        3. Answer any questions the farmer has about repayment or weather risks politely and clearly.`;
      } else {
        dynamicSystemPrompt += `\n\n[सिस्टम डेटा - भूमि व सैटेलाइट विश्लेषण]:
        - वर्तमान फसल आय: ₹${pred.adjusted_estimated_revenue_rs || 'N/A'}
        - ऋण अवधि: ${plan.loan_tenure_years || 1} वर्ष
        - कुल ऋण अवधि संयुक्त आय: ₹${pred.total_1year_combined_revenue_rs || 'N/A'}
        - स्वीकार्य अधिकतम सुरक्षित ऋण राशि (60% नियम): ₹${pred.suggested_loan_limit_rs || 'N/A'}
        - जोखिम स्तर: ${pred.risk_level || 'मध्यम'}
        - NDVI वनस्पति स्वास्थ्य: ${scores.ndvi?.score || 'N/A'}
        - IMD मौसम: ${scores.weather?.description || 'N/A'}
        
        उत्तर देने के लिए निर्देश:
        1. अपनी बात तुरंत इस प्रकार शुरू करें: "आपकी स्वीकार्य अधिकतम ऋण राशि: ₹${pred.suggested_loan_limit_rs?.toLocaleString('en-IN') || 'N/A'}"
        2. किसान को महीने-दर-महीने कटाई और उत्तराधिकार फसल योजना (${plan.start_month || 'नवंबर'} से बुआई, कटाई महीना व अगली फसल) समझाएं।
        3. किसान के हर सवाल का जवाब विनम्रता और स्पष्टता से दें।`;
      }
    }

    // Construct full prompt for Groq
    const apiMessages = [
      { role: 'system', content: dynamicSystemPrompt },
      ...messagesHistory
    ];

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'dummy_key') {
      // Save the chat but return a placeholder response
      const placeholderReply = 'The Groq API key is not configured yet. Please add a valid GROQ_API_KEY to the .env file to enable AI responses.';
      chat.messages.push({ role: 'assistant', content: placeholderReply });
      await chat.save();
      return res.json({ chatId: chat._id, reply: placeholderReply });
    }

    // Call Groq API
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      messages: apiMessages,
      model: "llama-3.1-8b-instant", 
      temperature: 0.7,
      max_tokens: 512,
    });

    const aiResponse = completion.choices[0].message.content;

    // Save AI response
    chat.messages.push({ role: 'assistant', content: aiResponse });
    await chat.save();

    res.json({
      chatId: chat._id,
      reply: aiResponse
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'Error processing chat', error: error.message });
  }
};

// Get all chats for current user
exports.getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id })
      .select('_id status createdAt messages')
      .sort({ updatedAt: -1 });

    // Return a summary of each chat (first user message as title)
    const chatSummaries = chats.map(chat => {
      const firstUserMsg = chat.messages.find(m => m.role === 'user');
      return {
        _id: chat._id,
        title: firstUserMsg ? firstUserMsg.content.substring(0, 50) : 'New Assessment',
        status: chat.status,
        messageCount: chat.messages.length,
        createdAt: chat.createdAt,
      };
    });

    res.json(chatSummaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single chat by ID
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    if (chat.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
