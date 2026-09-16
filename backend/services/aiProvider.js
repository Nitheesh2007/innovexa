const { fallbackChat } = require('./aiFallbackService');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

exports.askAI = async (message, context) => {
  const provider = process.env.AI_PROVIDER || 'none';
  
  const systemPrompt = `You are StockFlow AI, a Smart AI-Powered Inventory Management Assistant. 
Here is the user's inventory context: ${JSON.stringify(context)}.
Use this data to answer the user's query intelligently. Be concise and professional.`;

  try {
    if (provider === 'openai' && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key') {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        model: "gpt-3.5-turbo",
      });
      return { response: completion.choices[0].message.content, provider: 'openai' };
    } 
    
    if (provider === 'gemini' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key') {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `${systemPrompt}\nUser Query: ${message}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return { response: response.text(), provider: 'gemini' };
    }

    // Fallback if keys are not set or provider is none
    const fallbackResponse = await fallbackChat(message);
    return { response: fallbackResponse, provider: 'fallback' };

  } catch (error) {
    console.error("AI Provider error, using fallback:", error);
    const fallbackResponse = await fallbackChat(message);
    return { response: fallbackResponse, provider: 'fallback' };
  }
};
