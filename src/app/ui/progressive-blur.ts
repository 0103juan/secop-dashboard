import { Component, input } from '@angular/core';

/**
 * A band below a sticky bar where the content scrolling behind fades and blurs away, instead of being
 * cut by a hard edge.
 *
 * Ported to Angular from Skiper 41 (progressive blur) by @gurvinder-singh02, https://skiper-ui.com.
 * Free to use with attribution to Skiper UI.
 */
@Component({
  selector: 'app-progressive-blur',
  template: '',
  host: {
    'aria-hidden': 'true',
    '[style.height]': 'height()',
    '[style.backdrop-filter]': '"blur(" + blur() + ")"',
    '[style.-webkit-backdrop-filter]': '"blur(" + blur() + ")"',
  },
  styles: `
    :host {
      display: block;
      pointer-events: none;
      user-select: none;
      background: linear-gradient(to top, transparent, var(--page));
      mask-image: linear-gradient(to bottom, #000 50%, transparent);
    }
  `,
})
export class ProgressiveBlur {
  readonly height = input('64px');
  readonly blur = input('6px');
}
