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
    :host { display: block; padding-top: 6vh; }
    h1 {
      margin: 0 0 24px; max-width: 14ch; font-size: clamp(3rem, 11vw, 9rem); font-weight: 800; font-stretch: 75%;
      line-height: 0.86; letter-spacing: -0.03em; text-transform: uppercase;
    }
    p { max-width: 60ch; color: var(--muted); font-size: 1.15rem; }
    .examples {
      display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 32px;
      font-family: var(--mono); font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.1em;
    }
    .examples a { padding: 9px 14px; border: 1px solid var(--line); color: var(--ink); text-decoration: none; }
    .examples a:hover { color: var(--page); background: var(--accent); border-color: var(--accent); }
  `,
})
export class Home {
  protected readonly examples = [
    { nit: 890905211, name: 'Distrito de Medellín' },
    { nit: 899999001, name: 'Ministerio de Educación' },
    { nit: 890102018, name: 'Distrito de Barranquilla' },
  ];
}
