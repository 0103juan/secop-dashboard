import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL, EntityDetail, Overview } from '../core/secop-api';
import { EntityPage } from './entity-page';

const API = 'http://api.test';
const entity: EntityDetail = {
  nit: 890905211, name: 'DISTRITO DE MEDELLIN', department: 'Antioquia', level: 'Territorial', contracts: 300,
  years: [{ year: 2023, contracts: 100, total: 6e9, largest: 1e9 }, { year: 2024, contracts: 200, total: 9e9, largest: 1e9 }],
};
const overview: Overview = {
  nit: 890905211, year: 2024, contracts: 200, total: 9e9, largest: 1e9, suppliers: 150,
  topSuppliers: [{ name: 'ACME SAS', contracts: 3, total: 2e9 }],
  byModality: [{ modality: 'Contratación directa', method: 'direct', contracts: 200, total: 9e9 }],
  byMonth: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, contracts: 0, total: 0 })),
};
const text = (element: Element | null | undefined) => element?.textContent?.replace(/\s+/g, ' ').trim();

describe('EntityPage', () => {
  async function render(year: string | undefined, yearOverview: Overview, modality?: string) {
    TestBed.configureTestingModule({
      // The page depends on a base URL it is given, not on where it happens to be served from.
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: API }],
    });
    const fixture = TestBed.createComponent(EntityPage);
    fixture.componentRef.setInput('nit', '890905211');
    fixture.componentRef.setInput('year', year);
    fixture.componentRef.setInput('modality', modality);
    const http = TestBed.inject(HttpTestingController);
    const base = `${API}/entities/890905211`;

    // Not whenStable(): the page is not stable while a request it made is still open.
    const settle = async () => {
      await new Promise((resolve) => setTimeout(resolve));
      TestBed.tick();
    };
    await settle();
    http.expectOne(base).flush(entity);
    await settle();
    http.expectOne(`${base}/overview?year=${yearOverview.year}`).flush(yearOverview);
    http
      .expectOne((request) =>
        request.url === `${base}/contracts` &&
        request.params.get('year') === String(yearOverview.year) &&
        request.params.get('page') === '1' &&
        request.params.get('modality') === (modality ?? null))
      .flush({ page: 1, modality: modality ?? null, hasMore: false, items: [] });
    await fixture.whenStable();
    http.verify();
    return fixture.nativeElement as HTMLElement;
  }

  it('opens on the latest year with data when the URL names none, and says what the year amounts to', async () => {
    const page = await render(undefined, overview);
    expect(page.querySelector('.years a.selected')?.textContent).toContain('2024');
    expect(text(page.querySelector('.lead'))).toBe('En 2024 esta entidad firmó 200 contratos por $9 mil millones con 150 contratistas.');
    expect(text(page.querySelector('.kpis strong'))).toBe('$9 mil millones');
    expect(text(page.querySelector('.kpis p'))).toBe('+50 % frente a 2023');
    expect(page.querySelector('.warning')).toBeNull();
  });

  it('explains the figures: one reading per conclusion, each with how it was calculated', async () => {
    const page = await render('2024', overview);
    const readings = [...page.querySelectorAll('.reading')].map((reading) => text(reading.querySelector('.eyebrow')));
    expect(readings).toEqual(['01 · Frente a 2023', '02 · Concentración', '03 · Cómo se adjudicó', '04 · Cuándo se firmó']);
    expect(text(page.querySelector('.reading.open .figure'))).toBe('+50 %');
    expect(text(page.querySelector('.reading small'))).toContain('Cómo se calcula:');
    expect(text(page.querySelector('app-award-methods dt'))).toBe('Contratación directa100 %');
  });

  it('warns when one contract explains most of the year, as a mistyped value does', async () => {
    const page = await render('2023', { ...overview, year: 2023, total: 7.6e20, largest: 7.6e20 - 5e9 });
    const warning = page.querySelector('.warning')?.textContent ?? '';
    expect(warning).toContain('Un solo contrato explica el 100 % del total de 2023');
    expect(warning).toContain('$5 mil millones'); // what the total would be without it
  });

  it('asks only for the contracts of the modality in the URL, and says so', async () => {
    const page = await render('2024', overview, 'Contratación directa');
    expect(page.querySelector('.label a.selected')?.textContent).toBe('Contratación directa');
    expect(page.querySelector('.filter')?.textContent).toContain('Solo Contratación directa');
  });
});
