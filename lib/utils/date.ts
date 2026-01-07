export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTimeUntil = (date: string | Date): string => {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  
  if (diff < 0) return 'Försenat';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `Om ${days} dag${days > 1 ? 'ar' : ''}`;
  if (hours > 0) return `Om ${hours} timm${hours > 1 ? 'ar' : 'e'}`;
  
  return 'Snart';
};
