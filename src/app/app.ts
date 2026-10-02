import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NumPipe } from './core/format';
import { SecopApi } from './core/secop-api';
import { ProgressiveBlur } from './ui/progressive-blur';
import { ScrollProgress } from './ui/scroll-progress';

/** The frame around every page: the brand, the entity search and the note about what the data covers. */
@Component({
  imports: [RouterOutlet, RouterLink, NumPipe, ProgressiveBlur, ScrollProgress],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly query = signal('');
  private readonly term = signal(''); // the query, once the user pauses typing
  private timer?: ReturnType<typeof setTimeout>;

  protected readonly results = inject(SecopApi).search(this.term);

  protected type(value: string): void {
    this.query.set(value);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.term.set(value.trim()), 200);
  }

  protected clear(): void {
    clearTimeout(this.timer);
    this.query.set('');
    this.term.set('');
  }
}
