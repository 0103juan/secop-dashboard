import { formatCop } from '../core/format';
import type { Overview, YearTotals } from '../core/secop-api';
import { awardShares, readingsOf, valueChange } from './insights';

const months = (totals: Record<number, number>) =>
  Array.from({ length: 12 }, (_, i) => ({ month: i + 1, contracts: totals[i + 1] ? 4 : 0, total: totals[i + 1] ?? 0 }));

const overview: Overview = {
  nit: 890905211, year: 2024, contracts: 200, total: 10e9, largest: 2e9, suppliers: 150,
  topSuppliers: [{ name: 'ACME SAS', contracts: 1, total: 2e9 }, { name: 'OBRAS SAS', contracts: 3, total: 1e9 }],
  byModality: [
    { modality: 'Contratación directa', method: 'direct', contracts: 150, total: 5e9 },
    { modality: 'Licitación pública', method: 'competitive', contracts: 10, total: 3e9 },
    { modality: 'Contratación Directa (con ofertas)', method: 'direct', contracts: 30, total: 1e9 },
    { modality: 'Contratación régimen especial', method: 'special', contracts: 10, total: 1e9 },
  ],
  byMonth: months({ 1: 1e9, 11: 6e9, 12: 3e9 }),
};
const previous: YearTotals = { year: 2023, contracts: 250, total: 8e9, largest: 1e9 };
/** The readings with ordinary spaces: percentages are written with a non-breaking one. */
const read = (year: Partial<Parameters<typeof readingsOf>[0]> = {}) =>
  readingsOf({ overview, previous, thisYear: 2026, ...year }).map((reading) =>
    Object.fromEntries(Object.entries(reading).map(([key, value]) => [key, value.replaceAll(' ', ' ')])) as typeof reading);
const titled = (readings: ReturnType<typeof read>, title: string) => readings.find((reading) => reading.title === title);

describe('formatCop', () => {
  it('says amounts the Colombian way, where a billón is a million millions', () => {
    expect(formatCop(4_307_107_568_617.5)).toBe('$4,3 billones');
    expect(formatCop(491_372_098_658)).toBe('$491 mil millones');
    expect(formatCop(1_250_000_000)).toBe('$1,3 mil millones');
    expect(formatCop(12_500_000)).toBe('$13 millones');
    expect(formatCop(2_500_000)).toBe('$2,5 millones');
    expect(formatCop(850_000)).toBe('$850.000');
  });
});

describe('the readings of a year', () => {
  it('compares the value with the previous year and gives both figures', () => {
    const reading = titled(read(), 'Frente a 2023')!;
    expect(reading.figure).toBe('+25 %');
    expect(reading.caption).toBe('más valor contratado');
    expect(reading.detail).toContain('En 2024 se firmaron $10 mil millones; en 2023, $8 mil millones.');
    expect(reading.detail).toContain('Los contratos pasaron de 250 a 200.');
  });

  it('refuses to compare when one contract explains either year, as a mistyped value does', () => {
    const mistyped = { ...previous, total: 7.6e20, largest: 7.6e20 - 5e9 };
    expect(valueChange(overview, mistyped)).toBe('incomparable');
    const reading = titled(read({ previous: mistyped }), 'Frente a 2023')!;
    expect(reading.figure).toBe('N/C');
    expect(reading.detail).toContain('un solo contrato explica más de la mitad del total');
  });

  it('says the year is not over when it is the current one, and skips the comparison when there is none to make', () => {
    expect(titled(read({ thisYear: 2024 }), 'Frente a 2023')!.detail).toContain('2024 aún no termina');
    expect(read({ previous: undefined }).map((reading) => reading.title))
      .toEqual(['Concentración', 'Cómo se adjudicó', 'Cuándo se firmó']);
  });

  it('measures how much of the value the largest suppliers hold', () => {
    const reading = titled(read(), 'Concentración')!;
    expect(reading.figure).toBe('30 %');
    expect(reading.detail).toContain('De 150 contratistas, los 2 mayores suman el 30 % del valor de 2024.');
    expect(reading.detail).toContain('El primero, ACME SAS, tiene el 20 % en 1 contrato.');
  });

  it('groups modalities by how the contract is awarded, however the register spells them', () => {
    expect(awardShares(overview)).toEqual([
      { method: 'direct', total: 6e9, contracts: 180 },
      { method: 'competitive', total: 3e9, contracts: 10 },
      { method: 'special', total: 1e9, contracts: 10 },
    ]);
    const reading = titled(read(), 'Cómo se adjudicó')!;
    expect(reading.figure).toBe('60 %');
    expect(reading.caption).toBe('del valor, por contratación directa');
    expect(reading.detail).toContain('Son 180 de los 200 contratos.');
    expect(reading.detail).toContain('El resto: 30 % en procesos con competencia, 10 % bajo un régimen especial.');
  });

  it('names the month and the quarter with the most value signed', () => {
    const reading = titled(read(), 'Cuándo se firmó')!;
    expect(reading.figure).toBe('nov');
    expect(reading.detail).toContain('En noviembre se firmaron $6 mil millones, el 60 % del año, en 4 contratos.');
    expect(reading.detail).toContain('El cuarto trimestre fue el más fuerte, con el 90 %.');
  });

  it('has nothing to say about a year without contracts', () => {
    const empty = { ...overview, contracts: 0, total: 0, largest: 0, suppliers: 0, topSuppliers: [], byModality: [], byMonth: months({}) };
    expect(readingsOf({ overview: empty, thisYear: 2026 })).toEqual([]);
  });
});
