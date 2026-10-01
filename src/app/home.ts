import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <h1>¿En qué gasta una entidad pública?</h1>
    <p>
      Busca cualquier entidad del Estado colombiano y mira cuánto contrató cada año, con quién, por qué
      modalidad y qué contratos firmó. Cada contrato enlaza a su expediente en SECOP II.
    </p>
    <p class="examples">
      Prueba con:
      @for (example of examples; track example.nit) {
        <a [routerLink]="['/entidad', example.nit]">{{ example.name }}</a>
      }
    </p>
  `,
  styles: `
    :host { display: block; max-width: 640px; padding-top: 8vh; }
    h1 { margin: 0 0 12px; font-size: clamp(1.8rem, 5vw, 2.6rem); line-height: 1.1; letter-spacing: -0.02em; }
    p { color: var(--muted); font-size: 1.05rem; }
    .examples { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 0.95rem; }
    .examples a {
      padding: 6px 12px; border: 1px solid var(--line); border-radius: 999px;
      background: var(--surface); text-decoration: none;
    }
  `,
})
export class Home {
  protected readonly examples = [
    { nit: 890905211, name: 'Distrito de Medellín' },
    { nit: 899999001, name: 'Ministerio de Educación' },
    { nit: 890102018, name: 'Distrito de Barranquilla' },
  ];
}
