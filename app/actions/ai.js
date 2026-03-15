'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCustomerById, addNote } from './customer';
import { generateText } from '@/lib/gemini';

export async function generateAISummary(customerId) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  try {
    const customerData = await getCustomerById(customerId);
    const notesText = customerData.notes?.map(n => n.text).join(' | ') || 'אין הערות';
    
    const prompt = `
      Summarize this customer's situation in exactly 2 sentences and suggest the next best action for the sales agent.
      Reply ONLY in Hebrew.
      
      Customer Details:
      Name: ${customerData.name}
      Status: ${customerData.status}
      Notes: ${notesText}
    `;

    const summaryResponse = await generateText(prompt);
    
    const formattedSummary = `🤖 **תובנת בינה מלאכותית (Gemini):**\n${summaryResponse}`;

    // Automatically add this as a note
    await addNote(customerId, formattedSummary);

    return { success: true, summary: formattedSummary };
  } catch (error) {
    console.error("AI Summary error:", error);
    return { success: false, error: 'Failed to generate AI summary' };
  }
}

export async function generateWhatsAppMessage(customerId) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  try {
    const customerData = await getCustomerById(customerId);
    const notesText = customerData.notes?.map(n => n.text).join(' | ') || 'אין הערות';
    
    const prompt = `
      Draft a polite, professional, and short WhatsApp message to this customer based on their current status and recent notes.
      Reply ONLY with the drafted message in Hebrew. Do not include any explanations or quotes.
      
      Customer Details:
      Name: ${customerData.name}
      Status: ${customerData.status}
      Notes: ${notesText}
    `;

    const messageResponse = await generateText(prompt);

    return { success: true, message: messageResponse.trim() };
  } catch (error) {
    console.error("AI WhatsApp error:", error);
    return { success: false, error: 'Failed to draft WhatsApp message' };
  }
}
