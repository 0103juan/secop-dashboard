import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NumPipe } from '../core/format';
import type { YearTotals } from '../core/secop-api';

/** The entity's years as bars, as tall as their number of contracts. Each one is a link to that year. */
@Component({
  selector: 'app-year-picker',
  imports: [RouterLink, NumPipe],
  template: `
    <p class="eyebrow">Contratos firmados cada año · elige un año</p>
    <nav class="years" aria-label="Año de firma">
      @for (y of years(); track y.year) {
        <a
          [routerLink]="[]"
          [queryParams]="{ year: y.year }"
          [class.selected]="y.year === selected()"
          [attr.aria-current]="y.year === selected() ? 'true' : null"
          [title]="(y.contracts | num) + ' contratos'"
        >
          <span class="bar" [style.height.%]="(100 * y.contracts) / busiest()"></span>
          {{ y.year }}
        </a>
      } @empty {
        <p class="state">Esta entidad no tiene contratos firmados en SECOP II.</p>
      }
    </nav>
  `,
  styles: `
    :host { display: block; }
    .eyebrow { margin: 0 0 10px; }
    .years { display: flex; gap: 3px; overflow-x: auto; padding-bottom: 4px; }
    a {
      display: flex;
      flex: 1 1 0;
      min-width: 26px; /* twelve years still fit across a phone */
      flex-direction: column;
      justify-content: flex-end;
      height: 96px;
      text-align: center;
      font-family: var(--mono);
      font-size: clamp(0.62rem, 2.4vw, 0.74rem);
      color: var(--muted);
      text-decoration: none;
    }
    .bar { display: block; min-height: 3px; margin-bottom: 6px; background: var(--line); transition: background 0.2s; }
    a:hover .bar { background: var(--muted); }
    a.selected { font-weight: 700; color: var(--accent); }
    a.selected .bar { background: var(--accent); }
  `,
})
export class YearPicker {
  readonly years = input.required<YearTotals[]>();
  readonly selected = input<number>();
  protected readonly busiest = computed(() => Math.max(1, ...this.years().map((year) => year.contracts)));
}
