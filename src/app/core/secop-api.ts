// The contract with secop-api, and the only place that knows its URLs.

import { httpResource } from '@angular/common/http';
import { inject, Injectable, InjectionToken, Injector } from '@angular/core';

/** Where the API lives: a local one on a developer's machine, the deployed one anywhere else. */
export const API_BASE_URL = new InjectionToken<string>('secop-api base URL', {
  providedIn: 'root',
  factory: () => (location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://secop-api-i89q.onrender.com'),
});

export type Entity = { nit: number; name: string; department: string; level: string; contracts: number };
/** A year's count and value. `largest` is its biggest single contract, which is how a mistyped value shows. */
export type YearTotals = { year: number; contracts: number; total: number; largest: number };
export type EntityDetail = Entity & { years: YearTotals[] };

/** How a modality awards a contract; the API classifies each modality into one of these. */
export type AwardMethod = 'direct' | 'competitive' | 'special' | 'other';

export type Overview = {
  nit: number;
  year: number;
  contracts: number;
  total: number;
  largest: number;
  suppliers: number;
  topSuppliers: { name: string; contracts: number; total: number }[];
  byModality: { modality: string; method: AwardMethod; contracts: number; total: number }[];
  byMonth: { month: number; contracts: number; total: number }[];
};

export type Contract = {
  id: string;
  reference: string;
  object: string;
  supplier: string;
  value: number;
  signedOn: string;
  status: string;
  modality: string;
  type: string;
  url: string | null;
};
export type ContractPage = { page: number; modality: string | null; hasMore: boolean; items: Contract[] };
export type ContractQuery = { year: number; page: number; modality?: string };

/**
 * Each method returns a resource that follows the signals it is given: it reloads when they change
 * and stays idle while they return undefined. Components depend on this class, not on HTTP.
 */
@Injectable({ providedIn: 'root' })
export class SecopApi {
  private readonly base = inject(API_BASE_URL);
  private readonly injector = inject(Injector);

  search(term: () => string) {
    return httpResource<{ items: Entity[] }>(
      () => (term().length >= 3 ? { url: `${this.base}/entities`, params: { q: term() } } : undefined),
      { injector: this.injector },
    );
  }

  entity(nit: () => string) {
    return httpResource<EntityDetail>(() => this.entityUrl(nit()), { injector: this.injector });
  }

  overview(nit: () => string, year: () => number | undefined) {
    return httpResource<Overview>(
      () => {
        const asked = year();
        return asked ? { url: `${this.entityUrl(nit())}/overview`, params: { year: asked } } : undefined;
      },
      { injector: this.injector },
    );
  }

  contracts(nit: () => string, query: () => ContractQuery | undefined) {
    return httpResource<ContractPage>(
      () => {
        const asked = query();
        if (!asked) return undefined;
        const { modality, ...rest } = asked;
        return { url: `${this.entityUrl(nit())}/contracts`, params: modality ? { ...rest, modality } : rest };
      },
      { injector: this.injector },
    );
  }

  private entityUrl(nit: string): string {
    return `${this.base}/entities/${encodeURIComponent(nit)}`;
  }
}
