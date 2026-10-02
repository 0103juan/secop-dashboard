import { Component, computed, input } from '@angular/core';
import { copParts, formatCop, formatNumber, formatShare } from '../core/format';
import type { Overview, YearTotals } from '../core/secop-api';
import { dominated, signedShare, valueChange } from './insights';

type Cell = { label: string; amount: string; unit: string; note: string };

/** The year's four headline figures, each with one line that puts it in context. */
@Component({
  selector: 'app-kpi-strip',
  template: `
    <section class="kpis">
      @for (cell of cells(); track cell.label) {
        <div>
          <span class="eyebrow">{{ cell.label }}</span>
          <strong>{{ cell.amount }} <small>{{ cell.unit }}</small></strong>
          <p>{{ cell.note }}</p>
        </div>
      }
    </section>
  `,
  styles: `
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1px;
      background: var(--line);
      border: 1px solid var(--line);
    }
    .kpis div { display: grid; grid-template-rows: auto 1fr auto; gap: 10px; padding: 18px 20px; background: var(--page); }
    /* The figure and its unit share one line, so the four cells keep the same height. */
    strong {
      align-self: end;
      font-size: clamp(2rem, 3.6vw, 3rem);
      font-weight: 800;
      font-stretch: 75%;
      line-height: 0.9;
      letter-spacing: -0.02em;
      white-space: nowrap;
    }
    small { font-family: var(--mono); font-size: 0.72rem; font-weight: 500; letter-spacing: 0.02em; color: var(--muted); }
    .kpis div:first-child strong { color: var(--accent); }
    p { margin: 0; font-size: 0.86rem; color: var(--muted); }
    @media (max-width: 860px) {
      .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
  `,
})
export class KpiStrip {
  readonly overview = input.required<Overview>();
  readonly previous = input<YearTotals>();

  protected readonly cells = computed<Cell[]>(() => {
    const o = this.overview();
    const p = this.previous();
    const change = valueChange(o, p);
    return [
      // A total explained by one contract is what the register says, not what the entity spent.
      dominated(o)
        ? { label: `Valor registrado en ${o.year}`, ...copParts(o.total), note: `Sin el contrato mayor: ${formatCop(o.total - o.largest)}` }
        : {
            label: `Valor contratado en ${o.year}`, ...copParts(o.total),
            note: change === null ? 'Sin año anterior con el que comparar'
              : change === 'incomparable' ? `No comparable con ${p!.year}`
              : `${signedShare(change)} frente a ${p!.year}`,
          },
      {
        label: 'Contratos firmados', amount: formatNumber(o.contracts), unit: '',
        note: p?.contracts ? `${signedShare((o.contracts - p.contracts) / p.contracts)} frente a ${p.year}`
          : 'Sin año anterior con el que comparar',
      },
      {
        label: 'Contratistas distintos', amount: formatNumber(o.suppliers), unit: '',
        note: `${formatNumber(o.suppliers ? o.contracts / o.suppliers : 0, 1)} contratos por contratista`,
      },
      { label: 'Contrato más grande', ...copParts(o.largest), note: `${formatShare(o.largest, o.total, 1)} del valor del año` },
    ];
  });
}
