import { Component, computed, input } from '@angular/core';
import { formatShare } from '../core/format';
import { METHODS, MethodShare } from './insights';

/** How the year's value was awarded: one bar split by method, and what each method means. */
@Component({
  selector: 'app-award-methods',
  template: `
    <div class="bar" role="img" [attr.aria-label]="summary()">
      @for (row of rows(); track row.method) {
        <span [class]="row.method" [style.flex-grow]="row.total"></span>
      }
    </div>
    <dl>
      @for (row of rows(); track row.method) {
        <div>
          <dt><i [class]="row.method"></i>{{ row.name }}<strong>{{ row.share }}</strong></dt>
          <dd>{{ row.meaning }}</dd>
        </div>
      }
    </dl>
  `,
  styles: `
    .bar { display: flex; gap: 2px; height: 22px; }
    .bar span { flex-basis: 0; min-width: 3px; }
    .direct { background: var(--accent); }
    .competitive { background: var(--ink); }
    .special { background: var(--muted); }
    .other { background: #55554f; }
    dl { display: grid; gap: 12px; margin: 16px 0 0; }
    dt { display: flex; align-items: center; gap: 8px; font-size: 0.92rem; font-weight: 600; }
    dt i { flex: none; width: 10px; height: 10px; }
    dt strong { margin-left: auto; font-family: var(--mono); font-size: 0.8rem; }
    dd { margin: 3px 0 0 18px; font-size: 0.82rem; line-height: 1.4; color: var(--muted); }
  `,
})
export class AwardMethods {
  readonly shares = input.required<MethodShare[]>();
  readonly total = input.required<number>();

  protected readonly rows = computed(() =>
    this.shares().filter((share) => share.total > 0)
      .map((share) => ({ ...share, ...METHODS[share.method], share: formatShare(share.total, this.total()) })));
  protected readonly summary = computed(() => this.rows().map((row) => `${row.name}: ${row.share}`).join(', '));
}
