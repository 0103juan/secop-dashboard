import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_URL, EntityDetail, Overview } from './api';
import { formatCop } from './cop.pipe';
import { EntityPage } from './entity-page';

const entity: EntityDetail = {
  nit: 890905211, name: 'DISTRITO DE MEDELLIN', department: 'Antioquia', level: 'Territorial', contracts: 300,
  years: [{ year: 2023, contracts: 100, total: 5e9 }, { year: 2024, contracts: 200, total: 9e9 }],
};
const overview: Overview = {
  nit: 890905211, year: 2024, contracts: 200, total: 9e9, largest: 1e9, suppliers: 150,
  topSuppliers: [{ name: 'ACME SAS', contracts: 3, total: 2e9 }],
  byModality: [{ modality: 'Contratación directa', contracts: 200, total: 9e9 }],
  byMonth: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, contracts: 0, total: 0 })),
};

describe('formatCop', () => {
  it('says amounts the Colombian way, where a billón is a million millions', () => {
    expect(formatCop(4_307_107_568_617.5)).toBe('$4,3 billones');
    expect(formatCop(491_372_098_658)).toBe('$491 mil millones');
    expect(formatCop(1_250_000_000)).toBe('$1,3 mil millones');
    expect(formatCop(12_500_000)).toBe('$13 millones');
    expect(formatCop(2_500_000)).toBe('$2,5 millones');
    expect(formatCop(850_000)).toBe('$850.000');
  });
});

describe('EntityPage', () => {
  async function render(year: string | undefined, yearOverview: Overview, modality?: string) {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    const fixture = TestBed.createComponent(EntityPage);
    fixture.componentRef.setInput('nit', '890905211');
    fixture.componentRef.setInput('year', year);
    fixture.componentRef.setInput('modality', modality);
    const http = TestBed.inject(HttpTestingController);
    const base = `${API_URL}/entities/890905211`;

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

  it('opens on the latest year with data when the URL names none', async () => {
    const page = await render(undefined, overview);
    expect(page.querySelector('.years a.selected')?.textContent).toContain('2024');
    expect(page.querySelector('.kpis strong')?.textContent).toBe('$9 mil millones');
    expect(page.querySelector('.warning')).toBeNull();
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
