// The API the end-to-end tests run against: the real secop-api with one thing replaced, datos.gov.co.
// Routing, validation, the cache, CORS and the modality lookup are the code that is deployed; only the
// government portal is a fake, which answers each query from the five contracts below.
//
//   node e2e/api.mts       needs the secop-api repository next to this one, or SECOP_API_DIR

import { createServer } from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const api = resolve(process.env.SECOP_API_DIR ?? "../secop-api");
const load = (file: string) => import(pathToFileURL(resolve(api, file)).href);
const { createApp } = await load("src/app.ts");
const { Directory, mergeDirectory } = await load("src/entities.ts");

type Contract = { id: string; signed: string; modality: string; value: number; supplier: string; object: string };

const contracts: Contract[] = [
  { id: "1", signed: "2024-03-05", modality: "Contratación directa", value: 4e9, supplier: "ACME SAS", object: "Mantenimiento de la malla vial" },
  { id: "2", signed: "2024-06-18", modality: "Licitación pública", value: 3e9, supplier: "OBRAS DEL VALLE SAS", object: "Construcción de un parque" },
  { id: "3", signed: "2024-09-02", modality: "Contratación directa", value: 2e9, supplier: "PAPELERIA EL PUNTO", object: "Suministro de papelería" },
  // A value typed with eleven zeros too many, like the real one in Medellín's 2019 data.
  { id: "4", signed: "2019-02-11", modality: "Contratación directa", value: 7.6e20, supplier: "CONSORCIO MAL DIGITADO", object: "Prestación de servicios" },
  { id: "5", signed: "2019-05-20", modality: "Contratación directa", value: 5e9, supplier: "ACME SAS", object: "Interventoría" },
];

const directory = new Directory(mergeDirectory([
  { nit_entidad: "890905211", nombre_entidad: "DISTRITO DE MEDELLIN", departamento: "Antioquia", orden: "Territorial", contratos: "5" },
  { nit_entidad: "800194096", nombre_entidad: "INSTITUTO DE DEPORTES Y RECREACION DE MEDELLIN", departamento: "Antioquia", orden: "Territorial", contratos: "2" },
]));

const sum = (rows: Contract[]) => rows.reduce((total, row) => total + row.value, 0);

/** Answers a SoQL query the way the portal would: by the shape of its $select, filtered by its $where. */
const fakeDatosGovCo = (async (input: string | URL | Request) => {
  const soql = new URL(String(input)).searchParams;
  const select = soql.get("$select") ?? "";
  const where = soql.get("$where") ?? "";
  const year = where.match(/fecha_de_firma >= '(\d{4})-/)?.[1];
  const modality = where.match(/modalidad_de_contratacion = '(.*)'$/)?.[1].replaceAll("''", "'");
  const found = contracts.filter((row) =>
    (!year || row.signed.startsWith(year)) && (modality === undefined || row.modality === modality));
  const grouped = (key: (row: Contract) => string) =>
    Object.entries(Object.groupBy(found, key)).map(([name, rows]) => ({ name, rows: rows! }))
      .sort((a, b) => sum(b.rows) - sum(a.rows));
  const totals = (rows: Contract[]) => ({ contratos: String(rows.length), total: String(sum(rows)) });

  const answer =
    select.startsWith("date_extract_y") ? grouped((row) => row.signed.slice(0, 4))
        .map(({ name, rows }) => ({ anio: name, ...totals(rows) })).sort((a, b) => Number(a.anio) - Number(b.anio))
    : select.includes("count(distinct") ? [{ ...totals(found), mayor: String(Math.max(0, ...found.map((row) => row.value))),
        proveedores: String(new Set(found.map((row) => row.supplier)).size) }]
    : select.includes("max(proveedor_adjudicado)") ? grouped((row) => row.supplier)
        .map(({ name, rows }) => ({ proveedor: name, ...totals(rows) }))
    : select.includes("as modalidad") ? grouped((row) => row.modality)
        .map(({ name, rows }) => ({ modalidad: name, ...totals(rows) }))
    : select.includes("as mes") ? grouped((row) => String(Number(row.signed.slice(5, 7))))
        .map(({ name, rows }) => ({ mes: name, ...totals(rows) }))
    : found.toSorted((a, b) => b.value - a.value).map((row) => ({
        id_contrato: `CO1.PCCNTR.${row.id}`, referencia_del_contrato: `REF-${row.id}`, objeto_del_contrato: row.object,
        proveedor_adjudicado: row.supplier, valor_del_contrato: String(row.value), fecha_de_firma: `${row.signed}T00:00:00.000`,
        estado_contrato: "En ejecución", modalidad_de_contratacion: row.modality, tipo_de_contrato: "Obra",
        urlproceso: { url: `https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=${row.id}` },
      }));
  return new Response(JSON.stringify(answer), { status: 200 });
}) as typeof fetch;

createServer(createApp({ directory, fetch: fakeDatosGovCo })).listen(3000, () => {
  console.log(`secop-api from ${api} on http://localhost:3000, with a fake datos.gov.co`);
});
