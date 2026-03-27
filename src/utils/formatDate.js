import { format, parseISO } from 'date-fns';

export const formatDate = (date, pattern = 'MMM d, yyyy') => {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    return format(d, pattern);
  } catch {
    return '—';
  }
};

export const formatDateLong = (date) => formatDate(date, 'MMMM d, yyyy');
