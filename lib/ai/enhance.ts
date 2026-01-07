import OpenAI from 'openai';
import { EmailEnhancementContext } from '@/types';

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance && process.env.OPENAI_API_KEY) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  if (!openaiInstance) {
    throw new Error('OpenAI not initialized - OPENAI_API_KEY missing');
  }
  return openaiInstance;
}

export async function enhanceEmail(
  subject: string,
  body: string,
  context: EmailEnhancementContext
): Promise<{ subject: string; body: string }> {
  try {
    const prompt = `Du är en assistent som förbättrar e-posttexter för en städfirma i Sverige. 

Din uppgift är att göra följande text mer professionell och naturlig, MEN:
- Lägg ALDRIG till ny information som priser, datum eller fakta som inte finns i originalet
- Behåll alla placeholders som {namn}, {tjänst}, {signatur}
- Skriv på svenska
- Var personlig men professionell
- Behåll samma längd och ton

Original ämnesrad: ${subject}
Original meddelande: ${body}

Kontext (använd INTE denna info för att hitta på nya fakta, endast för att förstå sammanhanget):
- Företag: ${context.company_name || 'Städfirma'}
- Tjänst: ${context.tjänst || 'städtjänster'}

Returnera JSON med denna exakta struktur:
{
  "subject": "förbättrad ämnesrad",
  "body": "förbättrad brödtext"
}`;

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du är en professionell e-postskrivare för svenska företag. Du förbättrar text men lägger ALDRIG till påhittad information.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      subject: result.subject || subject,
      body: result.body || body,
    };
  } catch (error) {
    console.error('Error enhancing email with OpenAI:', error);
    // Return original on error
    return { subject, body };
  }
}
