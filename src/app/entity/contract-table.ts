import { Component, input, output } from '@angular/core';
import { CopPipe } from '../core/format';
import type { ContractPage } from '../core/secop-api';
import { TextRoll } from '../ui/text-roll';

/** One page of contracts and its pager. A table on a wide screen; one block per contract on a phone. */
@Component({
  selector: 'app-contract-table',
  imports: [CopPipe, TextRoll],
  template: `
    <table>
      <thead>
        <tr><th>Firma</th><th>Objeto</th><th>Contratista</th><th>Modalidad</th><th class="money">Valor</th><th></th></tr>
      </thead>
      <tbody>
        @for (contract of page().items; track contract.id) {
          <tr>
            <td class="date">{{ contract.signedOn }}</td>
            <td class="what"><p class="object" [title]="contract.object">{{ contract.object }}</p></td>
            <td class="who">{{ contract.supplier }}</td>
            <td class="how">{{ contract.modality }}<small>{{ contract.status }}</small></td>
            <td class="money">{{ contract.value | cop }}</td>
            <td class="source">
              @if (contract.url) {
                <a [href]="contract.url" target="_blank" rel="noopener">Ver en SECOP ↗</a>
              }
            </td>
          </tr>
        }
      </tbody>
    </table>
    <div class="pager">
      <button type="button" [disabled]="page().page === 1" (click)="pageChange.emit(page().page - 1)">
        <app-text-roll text="← Anterior" />
      </button>
      <span>Página {{ page().page }}</span>
      <button type="button" [disabled]="!page().hasMore" (click)="pageChange.emit(page().page + 1)">
        <app-text-roll text="Siguiente →" />
      </button>
    </div>
  `,
  styles: `
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    th, small, .pager {
      font-family: var(--mono);
      font-size: 0.68rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
    }
    th { padding: 0 10px 10px; text-align: left; border-bottom: 1px solid var(--line); }
    td { padding: 12px 10px; vertical-align: top; border-bottom: 1px solid var(--line); }
    tbody tr:hover { background: var(--page); }
    small { display: block; margin-top: 2px; font-size: 0.62rem; }
    .date { font-family: var(--mono); font-size: 0.78rem; color: var(--muted); white-space: nowrap; }
    .money { text-align: right; }
    td.money { font-family: var(--mono); font-size: 0.82rem; font-weight: 700; white-space: nowrap; }
    .source { white-space: nowrap; }
    .source a { font-family: var(--mono); font-size: 0.72rem; }
    .object {
      display: -webkit-box;
      max-width: 44ch;
      margin: 0;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      text-transform: lowercase;
    }
    .object::first-letter { text-transform: uppercase; }

    .pager { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 18px; }
    button {
      padding: 8px 14px;
      font: inherit;
      text-transform: inherit;
      letter-spacing: inherit;
      color: var(--ink);
      background: transparent;
      border: 1px solid var(--line);
      border-radius: 0;
      cursor: pointer;
    }
    button:hover:not(:disabled) { color: var(--page); background: var(--accent); border-color: var(--accent); }
    button:disabled { opacity: 0.4; cursor: default; }

    /* On a phone six columns do not fit: each contract becomes a block, date and value on its first line. */
    @media (max-width: 760px) {
      thead { display: none; }
      tr {
        display: grid;
        grid-template: 'date money' 'what what' 'who who' 'how source' / minmax(0, 1fr) auto;
        gap: 6px 12px;
        padding: 16px 0;
        border-bottom: 1px solid var(--line);
      }
      td { padding: 0; border: 0; }
      .date { grid-area: date; }
      .money { grid-area: money; }
      .what { grid-area: what; }
      .who { grid-area: who; font-size: 0.8rem; color: var(--muted); }
      .how { grid-area: how; font-size: 0.8rem; }
      .source { grid-area: source; align-self: end; }
      .object { max-width: none; }
    }
  `,
})
export class ContractTable {
  readonly page = input.required<ContractPage>();
  readonly pageChange = output<number>();
}
