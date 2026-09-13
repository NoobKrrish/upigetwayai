export function sanitizeString(str: string): string {
  if (!str) return '';
  return str.replace(/[^\w\s-]/gi, '').trim();
}

export function sanitizeAmount(amount: number): number {
  if (isNaN(amount) || amount <= 0) return 0;
  return Math.round(amount * 100) / 100;
}

export function sanitizePspError(err: any): string {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  return err.message || JSON.stringify(err);
}

