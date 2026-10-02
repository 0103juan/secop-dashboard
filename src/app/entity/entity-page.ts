import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CopPipe, formatShare, NumPipe, plural } from '../core/format';
import { SecopApi } from '../core/secop-api';
import { AwardMethods } from './award-methods';
import { ContractTable } from './contract-table';
import { awardShares, DOMINANT_SHARE, METHODS, readingsOf } from './insights';
import { KpiStrip } from './kpi-strip';
import { MonthChart } from './month-chart';
import { RankedItem, Ranking } from './ranking';
import { Readings } from './readings';
import { YearPicker } from './year-picker';

/** Modalities listed before the rest fold away, so this card stays about as tall as its neighbour. */
const MODALITIES_SHOWN = 5;

/**
 * One entity in one year. This component only reads the URL, asks the API and lays the page out;
 * what the figures mean is in insights.ts and how each block looks is in its own component.
 */
@Component({
  selector: 'app-entity-page',
  imports: [RouterLink, CopPipe, NumPipe, YearPicker, KpiStrip, Readings, Ranking, AwardMethods, MonthChart, ContractTable],
  templateUrl: './entity-page.html',
  styleUrl: './entity-page.css',
})
export class EntityPage {
  readonly nit = input.required<string>(); // route parameter
  readonly year = input<string>(); // ?year= query parameter
  readonly modality = input<string>(); // ?modality= query parameter: only that modality's contracts

  private readonly api = inject(SecopApi);

  protected readonly entity = this.api.entity(this.nit);

  /** The year in the URL, or the latest year the entity has contracts in. */
  protected readonly selectedYear = computed(() => {
    const asked = Number(this.year());
    if (asked) return asked;
    return this.entity.hasValue() ? this.entity.value().years.at(-1)?.year : undefined;
  });

  /** Goes back to the first page whenever the entity, the year or the modality changes. */
  protected readonly page = linkedSignal({
    source: () => `${this.nit()}/${this.selectedYear()}/${this.modality()}`,
    computation: () => 1,
  });

  protected readonly overview = this.api.overview(this.nit, this.selectedYear);

  protected readonly contracts = this.api.contracts(this.nit, () => {
    const year = this.selectedYear();
    return year ? { year, page: this.page(), modality: this.modality() } : undefined;
  });

  /** The calendar year before the selected one, when the entity signed contracts in it. */
  protected readonly previousYear = computed(() => {
    const year = this.selectedYear();
    return this.entity.hasValue() ? this.entity.value().years.find((y) => y.year === Number(year) - 1) : undefined;
  });

  /**
   * Contract values are typed by hand in SECOP and some are wrong by orders of magnitude.
   * When a single contract explains most of the year, say so instead of printing the total as fact.
   */
  protected readonly dominantShare = computed(() => {
    if (!this.overview.hasValue()) return 0;
    const { largest, total } = this.overview.value();
    return total > 0 && largest / total >= DOMINANT_SHARE ? largest / total : 0;
  });

  protected readonly readings = computed(() =>
    this.overview.hasValue()
      ? readingsOf({ overview: this.overview.value(), previous: this.previousYear(), thisYear: new Date().getFullYear() })
      : []);

  protected readonly awardShares = computed(() => (this.overview.hasValue() ? awardShares(this.overview.value()) : []));

  protected readonly suppliers = computed<RankedItem[]>(() => {
    if (!this.overview.hasValue()) return [];
    const { topSuppliers, total } = this.overview.value();
    return topSuppliers.map((supplier) => ({
      label: supplier.name, value: supplier.total,
      caption: `${plural(supplier.contracts, 'contrato')} · ${formatShare(supplier.total, total, 1)} del total`,
    }));
  });

  private readonly modalities = computed<RankedItem[]>(() => {
    if (!this.overview.hasValue()) return [];
    const { byModality, year } = this.overview.value();
    return byModality.map(({ modality, method, contracts, total }) => {
      const selected = modality === this.modality();
      return {
        label: modality, value: total,
        caption: `${plural(contracts, 'contrato')} · ${(METHODS[method] ?? METHODS.other).name}`,
        // Year links replace the query, so changing year drops a modality that year may not have.
        filter: { query: { year, modality: selected ? null : modality }, selected, hint: 'Ver solo los contratos de esta modalidad' },
      };
    });
  });
  protected readonly mainModalities = computed(() => this.modalities().slice(0, MODALITIES_SHOWN));
  protected readonly otherModalities = computed(() => this.modalities().slice(MODALITIES_SHOWN));
  /** The folded list opens by itself when the modality in the URL is inside it. */
  protected readonly otherSelected = computed(() => this.otherModalities().some((item) => item.filter?.selected));
}
