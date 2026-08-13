import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(date)) return '-';
  return format(date, 'dd MMM yyyy', { locale: id });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(date)) return '-';
  return format(date, 'dd MMM yyyy, HH:mm', { locale: id });
}

export function timeAgo(value: string | Date): string {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return formatDistanceToNowStrict(date, { addSuffix: true, locale: id });
}

export function initials(fullName?: string | null): string {
  if (!fullName) return '?';
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function numberWithDots(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}
