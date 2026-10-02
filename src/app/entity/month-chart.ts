import { Component, computed, input } from '@angular/core';
import { formatCop, formatNumber } from '../core/format';
import type { Overview } from '../core/secop-api';
import { MONTHS } from './insights';

/** The value signed in each month as twelve bars; the tallest is the accent and carries its amount. */
@Component({
  selector: 'app-month-chart',
  template: `
    <ol>
      @for (bar of bars(); track bar.name) {
        <li [class]="bar.side" [class.peak]="bar.peak" [title]="bar.title">
          <span class="value">{{ bar.peak ? bar.amount : '' }}</span>
          <span class="bar" [style.height.%]="bar.height"></span>
          <span class="month">{{ bar.name }}</span>
          <span class="count">{{ bar.contracts }}</span>
        </li>
      }
    </ol>
    <p>Bajo cada mes, el número de contratos firmados.</p>
  `,
  styles: `
    ol { display: flex; gap: 4px; height: 210px; margin: 0; padding: 0; list-style: none; }
    li {
      display: flex;
      flex: 1 1 0;
      min-width: 0;
      flex-direction: column;
      justify-content: flex-end;
      text-align: center;
      font-family: var(--mono);
      font-size: clamp(0.58rem, 1.9vw, 0.72rem);
      color: var(--muted);
    }
    .bar { display: block; min-height: 3px; margin: 6px 0; background: #55554f; }
    /* The peak's amount is wider than its bar: it spills to the side that has room. */
    .value { display: flex; justify-content: center; white-space: nowrap; font-weight: 700; color: var(--accent); }
    .left .value { justify-content: flex-start; }
    .right .value { justify-content: flex-end; }
    .peak .bar { background: var(--accent); }
    .peak .month { font-weight: 700; color: var(--accent); }
    .month { text-transform: capitalize; }
    .count { color: var(--ink); }
    p { margin: 12px 0 0; font-family: var(--mono); font-size: 0.68rem; color: var(--muted); }
  `,
})
export class MonthChart {
  readonly months = input.required<Overview['byMonth']>();

  protected readonly bars = computed(() => {
    const months = this.months();
    const highest = Math.max(1, ...months.map((month) => month.total));
    return months.map((month, i) => ({
      side: i < 3 ? 'left' : i > 8 ? 'right' : '',
      name: MONTHS[month.month - 1].slice(0, 3),
      amount: formatCop(month.total),
      contracts: formatNumber(month.contracts),
      // The bar leaves room above it for the peak's amount and below it for the two labels.
      height: (72 * month.total) / highest,
      peak: month.total === highest,
      title: `${MONTHS[month.month - 1]}: ${formatCop(month.total)} en ${formatNumber(month.contracts)} contratos`,
    }));
  });
}
