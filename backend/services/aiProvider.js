const { fallbackChat } = require('./aiFallbackService');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

exports.askAI = async (message, context) => {
  const provider = process.env.AI_PROVIDER || 'none';
  
  const systemPrompt = `You are StockFlow AI, a Smart AI-Powered Inventory & Business Management Assistant. 
The backend has actively parsed the user's query and queried the MongoDB database on your behalf.
Here is the exact, real-time database context you requested to answer this query: 
${JSON.stringify(context, null, 2)}

STRICT RULES:
1. ONLY use the data provided in the context object above. DO NOT invent, guess, or hallucinate numbers, prices, or product names.
2. If the context object is empty or doesn't contain the answer to the user's question, politely state that you do not have that data right now.
3. Be concise, professional, and mathematically accurate.
4. ALWAYS end your response with exactly 3 highly relevant follow-up questions the user can ask you next. 
Format the follow-up questions at the very end of your message exactly like this:
SUGGESTIONS: [Question 1] | [Question 2] | [Question 3]`;

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
      const rawRes = completion.choices[0].message.content;
      return parseLLMResponse(rawRes, 'openai');
    } 
    
    if (provider === 'gemini' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key') {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `${systemPrompt}\nUser Query: ${message}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawRes = response.text();
      return parseLLMResponse(rawRes, 'gemini');
    }

    // Fallback if keys are not set or provider is none
    const fallbackResponse = await fallbackChat(message, context);
    return { response: fallbackResponse.text, suggestions: fallbackResponse.suggestions, provider: 'fallback' };

  } catch (error) {
    console.error("AI Provider error, using fallback:", error);
    const fallbackResponse = await fallbackChat(message, context);
    return { response: fallbackResponse.text, suggestions: fallbackResponse.suggestions, provider: 'fallback' };
  }
};

function parseLLMResponse(rawText, provider) {
  let responseText = rawText;
  let suggestions = ["Calculate the total financial value of all active inventory.", "Show me all products that are currently critically low in stock.", "What are the pending orders?"];
  
  const suggestionsMatch = rawText.match(/SUGGESTIONS:\s*(.*)/is);
  if (suggestionsMatch && suggestionsMatch[1]) {
    const s = suggestionsMatch[1].split('|').map(x => x.trim()).filter(x => x);
    if (s.length > 0) {
      suggestions = s;
    }
    // Remove the suggestions block from the main response
    responseText = rawText.replace(/SUGGESTIONS:\s*(.*)/is, '').trim();
  }
  
  return { response: responseText, suggestions, provider };
}
