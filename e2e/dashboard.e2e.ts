import { expect, test } from '@playwright/test';

// A real browser, the dashboard as served by `ng serve`, and the real secop-api (see api.mts).
const ENTITY = '/#/entidad/890905211';
const rows = 'tbody tr';
const total = '.kpis div:first-child strong';

test('search an entity, read its latest year and filter the contracts by modality', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Buscar una entidad pública').fill('medellin'); // no accent, lower case
  await page.getByRole('link', { name: /DISTRITO DE MEDELLIN/ }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('DISTRITO DE MEDELLIN');
  await expect(page.locator('.years a.selected')).toContainText('2024');
  await expect(page.locator(total)).toHaveText('$9 mil millones');
  await expect(page.getByRole('note')).toHaveCount(0); // no single contract dominates 2024, so no warning
  await expect(page.locator(rows)).toHaveCount(3);
  await expect(page.locator(rows).first()).toContainText('ACME SAS'); // largest first

  await page.getByRole('link', { name: 'Licitación pública' }).click();
  await expect(page).toHaveURL(/year=2024&modality=Licitaci/);
  await expect(page.locator(rows)).toHaveCount(1);
  await expect(page.locator(rows)).toContainText('OBRAS DEL VALLE SAS');
  await expect(page.locator(total)).toHaveText('$9 mil millones'); // the filter narrows the table, not the year's total

  await page.getByRole('link', { name: /Quitar filtro/ }).click();
  await expect(page).not.toHaveURL(/modality/);
  await expect(page.locator(rows)).toHaveCount(3);
});

test('the year is explained: what the figures say, how the money was awarded and when', async ({ page }) => {
  await page.goto(`${ENTITY}?year=2024`);
  await expect(page.locator('.lead')).toHaveText('En 2024 esta entidad firmó 3 contratos por $9 mil millones con 3 contratistas.');

  // The fixture has no contracts in 2023, so there is nothing to compare 2024 with and that reading is left out.
  const readings = page.locator('.reading');
  await expect(readings.locator('.eyebrow')).toHaveText(['01 · Concentración', '02 · Cómo se adjudicó', '03 · Cuándo se firmó']);
  await expect(readings.nth(0)).toHaveClass(/open/);
  await expect(readings.nth(0)).toContainText('El primero, ACME SAS, tiene el 44,4 % en 1 contrato.');

  // The API classified both modalities; 6 of the 9 thousand millions were awarded directly.
  await readings.nth(1).hover();
  await expect(readings.nth(1)).toHaveClass(/open/);
  await expect(readings.nth(1).locator('.figure')).toHaveText('67 %');
  await expect(readings.nth(1)).toContainText('El resto: 33 % en procesos con competencia.');
  await expect(page.locator('app-award-methods dt')).toHaveText(['Contratación directa67 %', 'Con competencia33 %']);

  await expect(page.locator('app-month-chart .peak')).toContainText('mar'); // the 4 thousand millions signed in March
  await expect(page.locator('app-month-chart .peak')).toContainText('$4 mil millones');
});

test('a filtered view is a link that can be shared, and changing year drops the filter', async ({ page }) => {
  await page.goto(`${ENTITY}?year=2024&modality=${encodeURIComponent('Contratación directa')}`);
  await expect(page.locator('.filter')).toContainText('Solo Contratación directa');
  await expect(page.locator(rows)).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Contratación directa' })).toHaveAttribute('aria-current', 'true');

  await page.locator('.years a', { hasText: '2019' }).click();
  await expect(page).toHaveURL(/year=2019$/);
  await expect(page.locator('.filter')).toHaveCount(0);
});

test('a year explained by one mistyped contract carries a warning', async ({ page }) => {
  await page.goto(`${ENTITY}?year=2019`);
  const warning = page.getByRole('note');
  await expect(warning).toContainText('Un solo contrato explica el 100 % del total de 2019');
  await expect(warning).toContainText('el total sería $5 mil millones');
  await expect(page.locator('.lead')).toContainText('El valor registrado no se puede leer como gasto.');
  await expect(page.locator('.kpis div:first-child p')).toHaveText('Sin el contrato mayor: $5 mil millones');
  await expect(page.locator(rows).first()).toContainText('CONSORCIO MAL DIGITADO');
});

test('a modality the entity does not have is refused by the API, not answered with every contract', async ({ page }) => {
  const refused = page.waitForResponse((response) => response.url().includes('/contracts') && response.status() === 400);
  await page.goto(`${ENTITY}?year=2024&modality=${encodeURIComponent("x' OR '1'='1")}`);
  await refused;
  await expect(page.getByText('No se pudieron cargar los contratos.')).toBeVisible();
  await expect(page.locator(rows)).toHaveCount(0);
});

test('contracts link back to SECOP and nowhere else', async ({ page }) => {
  await page.goto(`${ENTITY}?year=2024`);
  const links = page.locator(`${rows} a`);
  await expect(links).toHaveCount(3);
  for (const href of await links.evaluateAll((all) => all.map((a) => (a as HTMLAnchorElement).href))) {
    expect(href).toMatch(/^https:\/\/community\.secop\.gov\.co\//);
  }
});
