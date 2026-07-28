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
    const { message, chatId, landContext } = req.body;
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

    // Dynamic Context Injection for ML Data
    let dynamicSystemPrompt = SYSTEM_PROMPT;
    if (landContext) {
      dynamicSystemPrompt += `\n\n[सिस्टम अपडेट]: किसान ने अपनी जमीन का डेटा प्रदान किया है। 
      अनुमानित आय: ₹${landContext.predictions?.adjusted_estimated_revenue_rs || 'N/A'} 
      जोखिम स्तर: ${landContext.predictions?.risk_level || 'N/A'}
      NDVI स्कोर: ${landContext.ai_scores?.ndvi?.score || 'N/A'}
      मौसम: ${landContext.ai_scores?.weather?.description || 'N/A'}
      इस डेटा का उपयोग करके किसान को सलाह दें।`;
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
    const { state, district, crop, area_hectares, lat, lon } = req.body;
    
    // Call the Python FastAPI ML Microservice
    const mlResponse = await axios.post('http://127.0.0.1:8000/api/predict-revenue', {
      state,
      district,
      crop,
      area_hectares,
      lat,
      lon
    });

    res.json(mlResponse.data);
  } catch (error) {
    console.error('ML Service Error:', error.message);
    res.status(500).json({ message: 'Error analyzing land via ML service', error: error.message });
  }
};
