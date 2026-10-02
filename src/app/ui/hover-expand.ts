import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, input, model, TemplateRef } from '@angular/core';

/**
 * A row of panels: the one under the pointer (or the one tapped or focused) grows and the others
 * narrow. What a panel shows is the template given as content, which receives the item and whether
 * it is the open one. On a narrow screen the panels stack and none is narrowed.
 *
 * Ported to Angular from Skiper 52 (HoverExpand_001) by @gurvinder-singh02, https://skiper-ui.com.
 * The original is React and framer-motion; here the growth is a CSS transition on flex-grow.
 * Free to use with attribution to Skiper UI.
 */
@Component({
  selector: 'app-hover-expand',
  imports: [NgTemplateOutlet],
  template: `
    @for (item of items(); track $index) {
      <div
        class="panel"
        tabindex="0"
        [class.open]="open() === $index"
        (mouseenter)="open.set($index)"
        (focus)="open.set($index)"
        (click)="open.set($index)"
      >
        <ng-container
          [ngTemplateOutlet]="panel()"
          [ngTemplateOutletContext]="{ $implicit: item, index: $index, open: open() === $index }"
        />
      </div>
    }
  `,
  styles: `
    :host { display: flex; gap: 4px; }
    .panel {
      flex: 2 1 0;
      min-width: 0;
      overflow: hidden;
      cursor: pointer;
      transition: flex-grow 0.35s ease-in-out;
    }
    .panel.open { flex-grow: 5; cursor: default; }
    .panel:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }

    @media (max-width: 960px) {
      :host { flex-direction: column; }
      .panel, .panel.open { flex: none; cursor: default; }
    }
    @media (prefers-reduced-motion: reduce) {
      .panel { transition: none; }
    }
  `,
})
export class HoverExpand<T> {
  readonly items = input.required<T[]>();
  /** Index of the open panel. */
  readonly open = model(0);
  protected readonly panel = contentChild.required(TemplateRef);
}
