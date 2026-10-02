import { Component, computed, signal } from '@angular/core';

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A small ring in the corner that fills as the page scrolls and shows the percentage on hover.
 * It can be dragged out of the way.
 *
 * Ported to Angular from Skiper 89 (draggable scroll progress) by @gurvinder-singh02, https://skiper-ui.com.
 * The original is React and motion; here scroll and drag are plain listeners feeding signals.
 * Free to use with attribution to Skiper UI.
 */
@Component({
  selector: 'app-scroll-progress',
  template: `
    <span class="percent">{{ percent() }} %</span>
    <svg viewBox="0 0 48 48" role="presentation">
      <circle cx="24" cy="24" [attr.r]="radius" class="rail" />
      <circle cx="24" cy="24" [attr.r]="radius" class="fill" [attr.stroke-dasharray]="circumference" [attr.stroke-dashoffset]="offset()" />
    </svg>
  `,
  host: {
    'aria-hidden': 'true',
    '[style.transform]': '"translate(" + moved().x + "px, " + moved().y + "px)"',
    '(window:scroll)': 'measure()',
    '(window:resize)': 'measure()',
    '(pointerdown)': 'grab($event)',
    '(pointermove)': 'drag($event)',
    '(pointerup)': 'release()',
    '(pointercancel)': 'release()',
  },
  styles: `
    :host {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 20;
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      color: var(--accent);
      background: color-mix(in srgb, var(--page) 40%, transparent);
      border: 1px solid var(--line);
      backdrop-filter: blur(8px);
      cursor: grab;
      touch-action: none;
    }
    :host(:active) { cursor: grabbing; }
    svg { width: 40px; height: 40px; }
    circle { fill: none; stroke: currentColor; stroke-width: 3; }
    .rail { opacity: 0.2; }
    .fill { transform: rotate(-90deg); transform-origin: 50% 50%; }
    .percent {
      position: absolute;
      bottom: calc(100% + 6px);
      font-family: var(--mono);
      font-size: 0.7rem;
      color: var(--muted);
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.2s;
    }
    :host(:hover) .percent { opacity: 1; }
    @media (max-width: 720px) {
      :host { display: none; }
    }
  `,
})
export class ScrollProgress {
  protected readonly radius = RADIUS;
  protected readonly circumference = CIRCUMFERENCE;

  private readonly progress = signal(0); // 0 at the top of the page, 1 at the bottom
  protected readonly percent = computed(() => Math.round(100 * this.progress()));
  protected readonly offset = computed(() => CIRCUMFERENCE * (1 - this.progress()));

  protected readonly moved = signal({ x: 0, y: 0 });
  private grabbed?: { pointerX: number; pointerY: number; x: number; y: number };

  protected measure(): void {
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    this.progress.set(scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 0);
  }

  protected grab(event: PointerEvent): void {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.grabbed = { pointerX: event.clientX, pointerY: event.clientY, ...this.moved() };
  }

  protected drag(event: PointerEvent): void {
    if (!this.grabbed) return;
    const { pointerX, pointerY, x, y } = this.grabbed;
    this.moved.set({ x: x + event.clientX - pointerX, y: y + event.clientY - pointerY });
  }

  protected release(): void {
    this.grabbed = undefined;
  }
}
