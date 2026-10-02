import { Pipe, PipeTransform } from '@angular/core';

export const formatNumber = (value: number, digits = 0) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: digits }).format(value);

/**
 * Colombian pesos the way people say them, as a figure and its unit: "$4,3" + "billones",
 * "$491" + "mil millones". In Spanish a "billón" is a million millions (1e12), not the English billion.
 */
export function copParts(value: number): { amount: string; unit: string } {
  const scaled = (divisor: number, unit: string) => ({
    amount: `$${formatNumber(value / divisor, value >= divisor * 10 ? 0 : 1)}`,
    unit,
  });
  if (value >= 1e12) return scaled(1e12, 'billones');
  if (value >= 1e9) return scaled(1e9, 'mil millones');
  if (value >= 1e6) return scaled(1e6, 'millones');
  return { amount: `$${formatNumber(value)}`, unit: '' };
}

export function formatCop(value: number): string {
  const { amount, unit } = copParts(value);
  return unit ? `${amount} ${unit}` : amount;
}

/** A non-breaking space, so a line never ends between a number and its "%". */
export const NBSP = ' ';

/** A share as people read it: "11,4 %". Zero when there is no whole to divide by. */
export const formatShare = (part: number, whole: number, digits = 0) =>
  `${formatNumber(whole > 0 ? (100 * part) / whole : 0, digits)}${NBSP}%`;

/** A count with its noun: "1 contrato", "2.316 contratos". */
export const plural = (count: number, noun: string) => `${formatNumber(count)} ${noun}${count === 1 ? '' : 's'}`;

@Pipe({ name: 'cop' })
export class CopPipe implements PipeTransform {
  transform = formatCop;
}

@Pipe({ name: 'num' })
export class NumPipe implements PipeTransform {
  transform = formatNumber;
}
