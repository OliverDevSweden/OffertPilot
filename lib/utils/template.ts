import { TemplateContext } from '@/types';

export function substituteTemplate(template: string, context: TemplateContext): string {
  let result = template;
  
  // Replace {namn} - if no name, use "Hej!" for greetings
  if (context.namn) {
    result = result.replace(/{namn}/g, context.namn);
  } else {
    // Replace "Hej {namn}," with "Hej!" if no name
    result = result.replace(/Hej {namn},?/g, 'Hej!');
    result = result.replace(/{namn}/g, '');
  }
  
  // Replace {tjänst}
  if (context.tjänst) {
    result = result.replace(/{tjänst}/g, context.tjänst);
  } else {
    result = result.replace(/{tjänst}/g, 'städtjänster');
  }
  
  // Replace {signatur}
  result = result.replace(/{signatur}/g, context.signatur || '');
  
  // Replace {company_name}
  if (context.company_name) {
    result = result.replace(/{company_name}/g, context.company_name);
  }
  
  // Clean up extra whitespace
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.trim();
  
  return result;
}

export function extractNameFromEmail(email: string): string | undefined {
  // Simple extraction - you can enhance this
  const localPart = email.split('@')[0];
  const parts = localPart.split(/[._-]/);
  
  if (parts.length >= 2) {
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }
  
  return undefined;
}

export function normalizeEmailForMatching(email: string): string {
  return email.toLowerCase().trim();
}

export function extractThreadId(subject: string): string | null {
  // Look for Re: or Fwd: patterns
  const match = subject.match(/Re:|RE:|Fwd:|FWD:/);
  if (match) {
    return subject.replace(/Re:|RE:|Fwd:|FWD:/g, '').trim();
  }
  return subject;
}
