// What a year's figures say, in words. Pure functions: no Angular, no HTTP, so every sentence is tested.
// Each reading describes the data; none of them judges the entity.

import { formatCop, formatNumber, formatShare, NBSP, plural } from '../core/format';
import type { AwardMethod, Overview, YearTotals } from '../core/secop-api';

/** Above this share of a year's total, one contract is the story and the total cannot be read as spending. */
export const DOMINANT_SHARE = 0.5;

export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre',
                       'octubre', 'noviembre', 'diciembre'];
const QUARTERS = ['primer', 'segundo', 'tercer', 'cuarto'];

/** The four ways a contract is awarded, in plain words. The API says which one each modality is. */
export const METHODS: Record<AwardMethod, { name: string; phrase: string; meaning: string }> = {
  direct: {
    name: 'Contratación directa',
    phrase: 'por contratación directa',
    meaning: 'La entidad elige al contratista sin convocatoria pública. La ley lo permite en casos concretos: ' +
      'convenios entre entidades, servicios profesionales, urgencia o proveedor único.',
  },
  competitive: {
    name: 'Con competencia',
    phrase: 'en procesos con competencia',
    meaning: 'Varios proponentes compiten por el contrato: licitación pública, selección abreviada, concurso de ' +
      'méritos y mínima cuantía.',
  },
  special: {
    name: 'Régimen especial',
    phrase: 'bajo un régimen especial',
    meaning: 'La entidad o el contrato siguen reglas propias, fuera del estatuto general: empresas de servicios ' +
      'públicos, hospitales públicos, universidades.',
  },
  other: {
    name: 'Otras',
    phrase: 'por otras modalidades',
    meaning: 'Modalidades que no son una compra, como la venta de bienes del Estado, o que el registro no clasifica.',
  },
};

export type MethodShare = { method: AwardMethod; total: number; contracts: number };

/** One conclusion about the year: a figure, what it measures, the sentences behind it and how it was calculated. */
export type Reading = { title: string; figure: string; caption: string; detail: string; basis: string };

export type YearInContext = { overview: Overview; previous?: YearTotals; thisYear: number };

/** A change as people read it: "+18 %", "−5 %". */
export const signedShare = (ratio: number) => `${ratio >= 0 ? '+' : '−'}${formatNumber(Math.abs(100 * ratio))}${NBSP}%`;

/** True when a single contract explains at least half of the total, as a mistyped value does. */
export const dominated = ({ total, largest }: { total: number; largest: number }) =>
  total > 0 && largest / total >= DOMINANT_SHARE;

/**
 * How much a year's value changed against the previous one, as a ratio. Null when there is nothing to
 * compare with, and 'incomparable' when one contract dominates either year: that difference is a typo's.
 */
export function valueChange(overview: Overview, previous?: YearTotals): number | 'incomparable' | null {
  if (!previous || previous.total <= 0) return null;
  if (dominated(overview) || dominated(previous)) return 'incomparable';
  return (overview.total - previous.total) / previous.total;
}

/** The year's value and contracts by award method, largest first. */
export function awardShares(overview: Overview): MethodShare[] {
  const sums = new Map<AwardMethod, MethodShare>();
  for (const modality of overview.byModality) {
    const method = modality.method in METHODS ? modality.method : 'other'; // an older API sends no method
    const sum = sums.get(method) ?? { method, total: 0, contracts: 0 };
    sums.set(method, { method, total: sum.total + modality.total, contracts: sum.contracts + modality.contracts });
  }
  return [...sums.values()].sort((a, b) => b.total - a.total);
}

function againstPreviousYear({ overview, previous, thisYear }: YearInContext): Reading | null {
  const change = valueChange(overview, previous);
  if (change === null || !previous) return null;
  const title = `Frente a ${previous.year}`;
  const basis = 'Suma del valor de los contratos firmados cada año, sin borradores ni cancelados.';
  const counts = `Los contratos pasaron de ${formatNumber(previous.contracts)} a ${formatNumber(overview.contracts)}.`;
  if (change === 'incomparable') {
    return {
      title, basis, figure: 'N/C', caption: 'los totales no se pueden comparar',
      detail: 'En uno de los dos años un solo contrato explica más de la mitad del total, así que la diferencia ' +
        `de valor no describe a la entidad. ${counts}`,
    };
  }
  const unfinished = overview.year === thisYear
    ? ` ${overview.year} aún no termina: la comparación es contra un año completo.` : '';
  return {
    title, basis, figure: signedShare(change), caption: `${change >= 0 ? 'más' : 'menos'} valor contratado`,
    detail: `En ${overview.year} se firmaron ${formatCop(overview.total)}; en ${previous.year}, ` +
      `${formatCop(previous.total)}. ${counts}${unfinished}`,
  };
}

function concentration({ overview }: YearInContext): Reading | null {
  const [first] = overview.topSuppliers;
  if (!first || overview.total <= 0) return null;
  const shown = overview.topSuppliers.length;
  const top = overview.topSuppliers.reduce((sum, supplier) => sum + supplier.total, 0);
  const share = formatShare(top, overview.total);
  const scope = overview.suppliers > shown
    ? `De ${plural(overview.suppliers, 'contratista')}, los ${shown} mayores suman el ${share} del valor de ${overview.year}.`
    : `En ${overview.year} hubo ${plural(overview.suppliers, 'contratista')}.`;
  return {
    title: 'Concentración', figure: share,
    caption: shown === 1 ? 'del valor, en un contratista' : `del valor, en ${shown} contratistas`,
    detail: `${scope} El primero, ${first.name}, tiene el ${formatShare(first.total, overview.total, 1)} ` +
      `en ${plural(first.contracts, 'contrato')}.`,
    basis: 'Los contratistas se agrupan por su documento, porque sus nombres se digitan de formas distintas.',
  };
}

function awarding({ overview }: YearInContext): Reading | null {
  const [lead, ...rest] = awardShares(overview);
  if (!lead || overview.total <= 0) return null;
  const others = rest.filter((share) => share.total > 0)
    .map((share) => `${formatShare(share.total, overview.total)} ${METHODS[share.method].phrase}`);
  return {
    title: 'Cómo se adjudicó', figure: formatShare(lead.total, overview.total),
    caption: `del valor, ${METHODS[lead.method].phrase}`,
    detail: `Son ${formatNumber(lead.contracts)} de los ${plural(overview.contracts, 'contrato')}. ` +
      METHODS[lead.method].meaning + (others.length ? ` El resto: ${others.join(', ')}.` : ''),
    basis: 'Cada modalidad del registro se agrupa según cómo se elige al contratista.',
  };
}

function timing({ overview }: YearInContext): Reading | null {
  if (overview.total <= 0) return null;
  const peak = overview.byMonth.reduce((best, month) => (month.total > best.total ? month : best));
  const quarters = QUARTERS.map((_, q) =>
    overview.byMonth.slice(q * 3, q * 3 + 3).reduce((sum, month) => sum + month.total, 0));
  const strongest = quarters.indexOf(Math.max(...quarters));
  const name = MONTHS[peak.month - 1];
  return {
    title: 'Cuándo se firmó', figure: name.slice(0, 3), caption: 'fue el mes con más valor firmado',
    detail: `En ${name} se firmaron ${formatCop(peak.total)}, el ${formatShare(peak.total, overview.total)} del año, ` +
      `en ${plural(peak.contracts, 'contrato')}. El ${QUARTERS[strongest]} trimestre fue el más fuerte, con el ` +
      `${formatShare(quarters[strongest], overview.total)}.`,
    basis: 'Según la fecha de firma de cada contrato.',
  };
}

/** A new reading is one more function in this list; the page shows whatever applies to the year. */
const RULES = [againstPreviousYear, concentration, awarding, timing];

export const readingsOf = (year: YearInContext): Reading[] => RULES.flatMap((rule) => rule(year) ?? []);
