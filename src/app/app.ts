import { httpResource } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { API_URL, Entity } from './api';
import { NumPipe } from './cop.pipe';

@Component({
  imports: [RouterOutlet, RouterLink, NumPipe],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly query = signal('');
  private readonly term = signal(''); // the query, once the user pauses typing
  private timer?: ReturnType<typeof setTimeout>;

  protected readonly results = httpResource<{ items: Entity[] }>(() =>
    this.term().length >= 3 ? { url: `${API_URL}/entities`, params: { q: this.term() } } : undefined,
  );

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
