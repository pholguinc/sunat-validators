import { z } from "zod";

// ─── Re-exportar validadores ─────────────────────────────────────────────────
export {
  parsearNombreArchivo,
  nombreArchivoXmlSchema,
  nombreArchivoZipSchema,
  validarCoincidenciaNombres,
  validarRucEnNombre,
} from "./filename-validator.ts";
export type { NombreArchivoParseado } from "./filename-validator.ts";

export { validarXml } from "./xml-validator.ts";
export type { ErrorValidacionXml } from "./xml-validator.ts";

export { numeroALetras } from "./numero-a-letras.ts";
export type { MonedaSunat, OpcionesNumeroALetras } from "./numero-a-letras.ts";

// ─── Re-exportar catálogos SUNAT ─────────────────────────────────────────────
export {
  // Catálogo 05 - Tributos
  CATALOGO_05_TRIBUTOS,
  codigoTributoSchema,
  // Catálogo 06 - Documentos de identidad
  CATALOGO_06_DOCUMENTOS_IDENTIDAD,
  codigoDocIdentidadSchema,
  validarDocumentoIdentidad,
  // Catálogo 07 - Afectación IGV
  CATALOGO_07_AFECTACION_IGV,
  codigoAfectacionIGVSchema,
  // UN/ECE
  UNECE_5153,
  codigoUNECE5153Schema,
  UNECE_5305,
  codigoUNECE5305Schema,
  obtenerCodigosUNECE,
  // Cálculo de impuestos
  redondeoSunat,
  calcularImpuestoItem,
  // Helpers
  esGravado,
  esExonerado,
  esInafecto,
  esExportacion,
  esOperacionGratuita,
} from "./catalogos-sunat.ts";
export type {
  CodigoTributo,
  CodigoAfectacionIGV,
  CodigoDocIdentidad,
  CodigoUNECE5153,
  CodigoUNECE5305,
  ResultadoCalculoImpuesto,
  OpcionesCalculoItem,
} from "./catalogos-sunat.ts";

// ─── Algoritmo oficial SUNAT para validar el dígito verificador del RUC ──────
function isValidRucCheckDigit(ruc: string): boolean {
  const factors = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const digits = ruc.split("").map(Number);

  const sum = factors.reduce(
    (acc, factor, i) => acc + factor * (digits[i] ?? 0),
    0,
  );
  const raw = 11 - (sum % 11);
  const checkDigit = raw === 10 ? 0 : raw === 11 ? 1 : raw;

  return checkDigit === digits[10];
}

const VALID_RUC_PREFIXES = ["10", "20"];

export const rucSchema = z
  .string()
  .regex(/^\d{11}$/, "El RUC debe contener exactamente 11 dígitos numéricos")
  .refine(
    (ruc) => VALID_RUC_PREFIXES.some((prefix) => ruc.startsWith(prefix)),
    "El RUC debe comenzar con 10 (persona natural) o 20 (persona jurídica)",
  )
  .refine(isValidRucCheckDigit, "El dígito verificador del RUC no es válido");

export type Ruc = z.infer<typeof rucSchema>;

// ─── Validador de DNI peruano ─────────────────────────────────────────────────
export const dniSchema = z
  .string()
  .regex(/^\d{8}$/, "El DNI debe contener exactamente 8 dígitos numéricos");

export type Dni = z.infer<typeof dniSchema>;

// ─── Catálogo 03 SUNAT — Unidad de medida ────────────────────────────────────
const UNIDADES_MEDIDA = [
  "NIU",
  "ZZ",
  "KGM",
  "GRM",
  "LTR",
  "MLT",
  "MTR",
  "CMT",
  "MMT",
  "MTK",
  "MTQ",
  "HUR",
  "MIN",
  "DAY",
  "MON",
  "ANN",
  "TNE",
  "BX",
  "BO",
  "BG",
  "DR",
] as const;

export const lineaSchema = z.object({
  codigoProducto: z.string().optional(),
  descripcion: z.string().min(1, "La descripción es obligatoria"),
  cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
  precioUnitario: z.number().positive("El precio unitario debe ser mayor a 0"),
  unidadMedida: z.enum(UNIDADES_MEDIDA, {
    error: `Unidad de medida inválida (Catálogo 03 SUNAT)`,
  }),
  tipoAfectacionIGV: z.string().optional(),
});

export type Linea = z.infer<typeof lineaSchema>;

// ─── Re-exportar códigos de error ────────────────────────────────────────────
export { CODIGOS_ERROR_SUNAT, codigoErrorSunatSchema } from "./error-codes.ts";
export type { CodigoErrorSunat } from "./error-codes.ts";

// ─── Re-exportar tipo de cambio ──────────────────────────────────────────────
export { solesADolares, dolaresASoles } from "./tipo-cambio.ts";
export type { OpcionesConversionMoneda } from "./tipo-cambio.ts";
