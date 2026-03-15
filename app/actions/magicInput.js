'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function processMagicInput(text) {
  if (!text || text.trim() === '') {
    return { success: false, error: 'נא להזין טקסט' };
  }

  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'Unauthorized' };

  await dbConnect();
  try {
    const user = await User.findById(session.user.id);
    const apiKey = user?.geminiApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return { success: false, error: 'לא מוגדר מפתח API ל-Gemini במסך ההגדרות' };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Extract contact information from the following Hebrew text. 
    Return ONLY a valid JSON object with EXACTLY these keys: "name", "phone", "email". 
    If a field is missing or cannot be inferred clearly, use an empty string "" as its value.
    No other text or markdown block formatting. Just pure JSON.
    Example output: {"name": "דני צבי", "phone": "050-1234567", "email": "dani@example.com"}
    
    Input Text:
    "${text}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      // Remove possible markdown formatting from Gemini response
      let pureJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const extractedData = JSON.parse(pureJson);
      
      return { success: true, data: extractedData };
    } catch (parseError) {
      console.error("Gemini Parsing Error: ", responseText);
      return { success: false, error: 'שגיאה בפענוח הנתונים שחזרו מהמודל המלאכותי' };
    }

  } catch (error) {
    console.error('Magic Input Error:', error);
    return { success: false, error: 'שגיאה בתקשורת מול גוגל Gemini' };
  }
}
