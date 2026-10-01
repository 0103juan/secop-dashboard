import { Pipe, PipeTransform } from '@angular/core';

export const formatNumber = (value: number, digits = 0) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: digits }).format(value);

/**
 * Colombian pesos the way people say them: "$4,3 billones", "$491 mil millones", "$12,5 millones".
 * In Spanish a "billón" is a million millions (1e12), not the English billion.
 */
export function formatCop(value: number): string {
  if (value >= 1e12) return `$${formatNumber(value / 1e12, value >= 1e13 ? 0 : 1)} billones`;
  if (value >= 1e9) return `$${formatNumber(value / 1e9, value >= 1e10 ? 0 : 1)} mil millones`;
  if (value >= 1e6) return `$${formatNumber(value / 1e6, value >= 1e7 ? 0 : 1)} millones`;
  return `$${formatNumber(value)}`;
}

@Pipe({ name: 'cop' })
export class CopPipe implements PipeTransform {
  transform = formatCop;
}

@Pipe({ name: 'num' })
export class NumPipe implements PipeTransform {
  transform = formatNumber;
}
