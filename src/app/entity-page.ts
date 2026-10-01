import { httpResource } from '@angular/common/http';
import { Component, computed, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API_URL, ContractPage, EntityDetail, Overview } from './api';
import { CopPipe, NumPipe } from './cop.pipe';

/** Above this share of the year's total, one contract is the story and the total needs a warning. */
export const DOMINANT_SHARE = 0.5;

@Component({
  selector: 'app-entity-page',
  imports: [RouterLink, CopPipe, NumPipe],
  templateUrl: './entity-page.html',
  styleUrl: './entity-page.css',
})
export class EntityPage {
  readonly nit = input.required<string>(); // route parameter
  readonly year = input<string>(); // ?year= query parameter

  protected readonly months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  private readonly base = computed(() => `${API_URL}/entities/${encodeURIComponent(this.nit())}`);

  protected readonly entity = httpResource<EntityDetail>(() => this.base());

  /** The year in the URL, or the latest year the entity has contracts in. */
  protected readonly selectedYear = computed(() => {
    const asked = Number(this.year());
    if (asked) return asked;
    return this.entity.hasValue() ? this.entity.value().years.at(-1)?.year : undefined;
  });

  /** Goes back to the first page whenever the entity or the year changes. */
  protected readonly page = linkedSignal({
    source: () => `${this.nit()}/${this.selectedYear()}`,
    computation: () => 1,
  });

  protected readonly overview = httpResource<Overview>(() => {
    const year = this.selectedYear();
    return year ? { url: `${this.base()}/overview`, params: { year } } : undefined;
  });

  protected readonly contracts = httpResource<ContractPage>(() => {
    const year = this.selectedYear();
    return year ? { url: `${this.base()}/contracts`, params: { year, page: this.page() } } : undefined;
  });

  protected readonly busiestYear = computed(() =>
    this.entity.hasValue() ? Math.max(1, ...this.entity.value().years.map((y) => y.contracts)) : 1,
  );

  protected readonly busiestMonth = computed(() =>
    this.overview.hasValue() ? Math.max(1, ...this.overview.value().byMonth.map((m) => m.total)) : 1,
  );

  /**
   * Contract values are typed by hand in SECOP and some are wrong by orders of magnitude.
   * When a single contract explains most of the year, say so instead of printing the total as fact.
   */
  protected readonly dominantShare = computed(() => {
    if (!this.overview.hasValue()) return 0;
    const { largest, total } = this.overview.value();
    return total > 0 && largest / total >= DOMINANT_SHARE ? largest / total : 0;
  });
}
