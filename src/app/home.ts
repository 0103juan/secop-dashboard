import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LinePath } from './ui/line-path';
import { TextRoll } from './ui/text-roll';

@Component({
  selector: 'app-home',
  imports: [RouterLink, LinePath, TextRoll],
  template: `
    <app-line-path class="line" />
    <h1>¿En qué gasta una entidad pública?</h1>
    <p>
      Busca cualquier entidad del Estado colombiano y lee su año: cuánto contrató, con quién, cómo eligió a sus
      contratistas y en qué meses firmó. Cada cifra viene explicada y cada contrato enlaza a su expediente en SECOP II.
    </p>
    <p class="examples">
      Prueba con:
      @for (example of examples; track example.nit) {
        <a [routerLink]="['/entidad', example.nit]"><app-text-roll [text]="example.name" /></a>
      }
    </p>
    <ul class="answers">
      @for (answer of answers; track answer.question) {
        <li>
          <strong>{{ answer.question }}</strong>
          {{ answer.how }}
        </li>
      }
    </ul>
  `,
  styles: `
    :host { position: relative; display: block; padding-top: 6vh; }
    .line { position: absolute; top: -40px; right: -6%; z-index: -1; width: min(46vw, 620px); opacity: 0.9; }
    h1 {
      margin: 0 0 24px; max-width: 14ch; font-size: clamp(3rem, 11vw, 9rem); font-weight: 800; font-stretch: 75%;
      line-height: 0.86; letter-spacing: -0.03em; text-transform: uppercase;
    }
    p { max-width: 60ch; color: var(--muted); font-size: 1.15rem; }
    .examples {
      max-width: none; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 32px;
      font-family: var(--mono); font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.1em;
    }
    .examples a { padding: 9px 14px; border: 1px solid var(--line); color: var(--ink); background: var(--page); text-decoration: none; }
    .examples a:hover, .examples a:focus-visible { color: var(--page); background: var(--accent); border-color: var(--accent); }
    .answers {
      display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; margin: 56px 0 0; padding: 0;
      list-style: none; background: var(--line); border: 1px solid var(--line);
    }
    .answers li { padding: 18px 20px; font-size: 0.9rem; color: var(--muted); background: var(--page); }
    .answers strong {
      display: block; margin-bottom: 8px; font-size: 1.25rem; font-weight: 800; font-stretch: 75%; line-height: 1;
      text-transform: uppercase; color: var(--ink);
    }
    @media (max-width: 860px) {
      .answers { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .line { opacity: 0.35; }
    }
  `,
})
export class Home {
  protected readonly examples = [
    { nit: 890905211, name: 'Distrito de Medellín' },
    { nit: 899999001, name: 'Ministerio de Educación' },
    { nit: 890102018, name: 'Distrito de Barranquilla' },
  ];

  /** What an entity's page answers, in the order it answers it. */
  protected readonly answers = [
    { question: '¿Cuánto?', how: 'El valor y el número de contratos del año, frente al año anterior.' },
    { question: '¿A quién?', how: 'Los mayores contratistas y cuánto del total concentran.' },
    { question: '¿Cómo?', how: 'Qué parte se adjudicó por contratación directa y qué parte con competencia.' },
    { question: '¿Cuándo?', how: 'El valor firmado mes a mes y el contrato detrás de cada cifra.' },
  ];
}
