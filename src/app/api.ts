// The contract with secop-api.
// On a developer's machine the dashboard talks to a local API; anywhere else, to the deployed one.
// Set this to the address Render gives the service (it looks like https://secop-api-xxxx.onrender.com).
// While it is empty, the published dashboard has no API to call and says so.
const DEPLOYED_API = '';
export const API_URL = location.hostname === 'localhost' ? 'http://localhost:3000' : DEPLOYED_API;

export type Entity = { nit: number; name: string; department: string; level: string; contracts: number };
export type EntityDetail = Entity & { years: { year: number; contracts: number; total: number }[] };

export type Overview = {
  nit: number;
  year: number;
  contracts: number;
  total: number;
  largest: number;
  suppliers: number;
  topSuppliers: { name: string; contracts: number; total: number }[];
  byModality: { modality: string; contracts: number; total: number }[];
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
export type ContractPage = { page: number; hasMore: boolean; items: Contract[] };
