import { Component, computed, input } from '@angular/core';

/**
 * Text that rolls upward letter by letter when the link or button around it is hovered or focused,
 * replaced by a copy coming from below.
 *
 * Ported to Angular from Skiper 58 (navigation text roll) by @gurvinder-singh02, https://skiper-ui.com.
 * The original is React and framer-motion; here the motion is CSS transitions with a per-letter delay.
 * Free to use with attribution to Skiper UI.
 */
@Component({
  selector: 'app-text-roll',
  template: `
    <span class="line">
      @for (letter of letters(); track $index) {<span [style.--i]="$index">{{ letter }}</span>}
    </span>
    <span class="line copy" aria-hidden="true">
      @for (letter of letters(); track $index) {<span [style.--i]="$index">{{ letter }}</span>}
    </span>
  `,
  styles: `
    :host {
      position: relative;
      display: inline-block;
      overflow: hidden;
      /* The line box must be taller than the glyphs, or the hidden copy peeks in from below. */
      line-height: 1.35;
      white-space: pre;
      vertical-align: bottom;
    }
    .line { display: block; }
    .copy { position: absolute; inset: 0; }
    .line span {
      display: inline-block;
      transition: transform 0.3s ease-in-out calc(var(--i) * 30ms);
    }
    .copy span { transform: translateY(100%); }

    :host-context(a:hover) .line:not(.copy) span,
    :host-context(a:focus-visible) .line:not(.copy) span,
    :host-context(button:hover:not(:disabled)) .line:not(.copy) span,
    :host-context(button:focus-visible) .line:not(.copy) span { transform: translateY(-100%); }

    :host-context(a:hover) .copy span,
    :host-context(a:focus-visible) .copy span,
    :host-context(button:hover:not(:disabled)) .copy span,
    :host-context(button:focus-visible) .copy span { transform: translateY(0); }

    @media (prefers-reduced-motion: reduce) {
      .line span { transition: none; }
    }
  `,
})
export class TextRoll {
  readonly text = input.required<string>();
  protected readonly letters = computed(() => [...this.text()]);
}
