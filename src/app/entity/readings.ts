import { Component, input } from '@angular/core';
import { HoverExpand } from '../ui/hover-expand';
import type { Reading } from './insights';

/** The year's conclusions as panels: each shows its figure, and the open one explains it. */
@Component({
  selector: 'app-readings',
  imports: [HoverExpand],
  template: `
    <app-hover-expand [items]="readings()">
      <ng-template let-reading let-index="index" let-open="open">
        <article class="reading" [class.open]="open">
          <div class="headline">
            <p class="eyebrow">0{{ index + 1 }} · {{ reading.title }}</p>
            <p class="figure">{{ reading.figure }}</p>
            <p class="caption">{{ reading.caption }}</p>
          </div>
          <div class="detail">
            <p>{{ reading.detail }}</p>
            <small>Cómo se calcula: {{ reading.basis }}</small>
          </div>
        </article>
      </ng-template>
    </app-hover-expand>
  `,
  styles: `
    /* Two fixed tracks, so the text does not reflow while a panel grows: a closed panel only shows the first. */
    .reading {
      display: grid;
      grid-template: minmax(0, 1fr) / 196px minmax(300px, 1fr);
      gap: 24px;
      height: 300px;
      padding: 20px;
      background: var(--surface);
      border: 1px solid var(--line);
      transition: background 0.35s, color 0.35s;
    }
    .reading.open { color: var(--page); background: var(--accent); border-color: var(--accent); }
    .headline { display: flex; flex-direction: column; }
    p { margin: 0; }
    .open .eyebrow { color: inherit; }
    .figure {
      margin-top: auto;
      font-size: 3.4rem;
      font-weight: 800;
      font-stretch: 75%;
      line-height: 0.9;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      color: var(--accent);
      white-space: nowrap;
    }
    .open .figure { color: inherit; }
    /* Room for three lines, so every panel's figure sits at the same height whatever its caption. */
    .caption { margin-top: 8px; min-height: 3.9em; font-size: 0.92rem; line-height: 1.3; }
    .detail { display: flex; flex-direction: column; gap: 14px; opacity: 0; transition: opacity 0.1s; }
    .open .detail { opacity: 1; transition: opacity 0.3s 0.2s; }
    .detail p { font-size: 1rem; line-height: 1.4; }
    small { margin-top: auto; font-family: var(--mono); font-size: 0.68rem; line-height: 1.5; opacity: 0.75; }

    @media (max-width: 960px) {
      .reading { grid-template: auto / minmax(0, 1fr); gap: 16px; height: auto; }
      .figure { margin-top: 14px; }
      .caption { min-height: 0; }
      .detail { opacity: 1; }
    }
  `,
})
export class Readings {
  readonly readings = input.required<Reading[]>();
}
