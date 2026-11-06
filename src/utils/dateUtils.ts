/**
 * Date formatting utilities for Cortex
 * Strictly formats all dates to dd-mm-aaaa or dd/mm/aaaa
 */

export function formatDateBR(dateStr: string, separator: '/' | '-' = '/'): string {
  if (!dateStr) return '';
  // If already in dd/mm/aaaa or dd-mm-aaaa
  if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(dateStr)) {
    return dateStr.replace(/[/-]/g, separator);
  }

  // Handle YYYY-MM-DD
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${d}${separator}${m}${separator}${y}`;
  }

  // Fallback to Date object parsing
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}${separator}${month}${separator}${year}`;
    }
  } catch (e) {
    // Return original if parsing fails
  }

  return dateStr;
}

export function getTodayBR(separator: '/' | '-' = '/'): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}${separator}${month}${separator}${year}`;
}
