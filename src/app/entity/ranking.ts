import { Component, computed, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { CopPipe } from '../core/format';

/** One row of a ranking. With `filter`, the label is a link that narrows the page to that row. */
export type RankedItem = {
  label: string;
  value: number;
  caption: string;
  filter?: { query: Params; selected: boolean; hint: string };
};

/** Rows ranked by a peso value, each with a bar relative to the largest. It knows nothing about what they are. */
@Component({
  selector: 'app-ranking',
  imports: [RouterLink, CopPipe],
  template: `
    <ol>
      @for (item of items(); track $index) {
        <li>
          <div class="label">
            @if (item.filter; as filter) {
              <a
                [routerLink]="[]"
                [queryParams]="filter.query"
                [class.selected]="filter.selected"
                [attr.aria-current]="filter.selected ? 'true' : null"
                [title]="filter.hint"
              >{{ item.label }}</a>
            } @else {
              <span>{{ item.label }}</span>
            }
            <strong>{{ item.value | cop }}</strong>
          </div>
          <div class="track"><div [style.width.%]="(100 * item.value) / largest()"></div></div>
          <small>{{ item.caption }}</small>
        </li>
      }
    </ol>
  `,
  styles: `
    ol { display: grid; gap: 14px; margin: 0; padding: 0; list-style: none; }
    .label { display: flex; justify-content: space-between; gap: 12px; font-size: 0.92rem; }
    .label strong { font-family: var(--mono); font-size: 0.8rem; white-space: nowrap; }
    a { color: var(--ink); text-decoration: underline dotted var(--muted); text-underline-offset: 4px; }
    a:hover, a.selected { color: var(--accent); text-decoration-color: var(--accent); }
    .track { height: 5px; margin: 6px 0 4px; background: var(--line); }
    .track div { height: 100%; min-width: 3px; background: var(--accent); }
    small {
      display: block;
      font-family: var(--mono);
      font-size: 0.64rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
    }
  `,
})
export class Ranking {
  readonly items = input.required<RankedItem[]>();
  /** The value a full bar stands for. Defaults to the largest row; two lists that continue each other share one. */
  readonly scale = input<number>();
  protected readonly largest = computed(() => this.scale() || Math.max(1, ...this.items().map((item) => item.value)));
}
