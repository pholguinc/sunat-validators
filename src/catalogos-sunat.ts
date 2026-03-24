import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════════
// Catálogo 05 SUNAT — Códigos de Tributos
// ═══════════════════════════════════════════════════════════════════════════════

export const CATALOGO_05_TRIBUTOS = {
  "1000": {
    nombre: "IGV",
    descripcion: "Impuesto General a las Ventas",
    codigoInternacional: "VAT",
    codigoUNECE_5153: "VAT",
    codigoUNECE_5305: "S",
    tasa: 0.18,
  },
  "1016": {
    nombre: "IVAP",
    descripcion: "Impuesto a la Venta Arroz Pilado",
    codigoInternacional: "VAT",
    codigoUNECE_5153: "VAT",
    codigoUNECE_5305: "S",
    tasa: 0.04,
  },
  "2000": {
    nombre: "ISC",
    descripcion: "Impuesto Selectivo al Consumo",
    codigoInternacional: "EXC",
    codigoUNECE_5153: "EXC",
    codigoUNECE_5305: "S",
    tasa: null, // Variable según producto
  },
  "7152": {
    nombre: "ICBPER",
    descripcion: "Impuesto al Consumo de las Bolsas de Plástico",
    codigoInternacional: "OTH",
    codigoUNECE_5153: "OTH",
    codigoUNECE_5305: "S",
    montoFijo: 0.50, // S/ 0.50 por bolsa (2024)
  },
  "9995": {
    nombre: "EXP",
    descripcion: "Exportación",
    codigoInternacional: "FRE",
    codigoUNECE_5153: "FRE",
    codigoUNECE_5305: "G",
    tasa: 0,
  },
  "9996": {
    nombre: "GRA",
    descripcion: "Gratuito",
    codigoInternacional: "FRE",
    codigoUNECE_5153: "FRE",
    codigoUNECE_5305: "Z",
    tasa: 0,
  },
  "9997": {
    nombre: "EXO",
    descripcion: "Exonerado",
    codigoInternacional: "VAT",
    codigoUNECE_5153: "VAT",
    codigoUNECE_5305: "E",
    tasa: 0,
  },
  "9998": {
    nombre: "INA",
    descripcion: "Inafecto",
    codigoInternacional: "FRE",
    codigoUNECE_5153: "FRE",
    codigoUNECE_5305: "O",
    tasa: 0,
  },
  "9999": {
    nombre: "OTROS",
    descripcion: "Otros tributos",
    codigoInternacional: "OTH",
    codigoUNECE_5153: "OTH",
    codigoUNECE_5305: "S",
    tasa: null,
  },
} as const;

export type CodigoTributo = keyof typeof CATALOGO_05_TRIBUTOS;

const codigosTributoValidos = Object.keys(CATALOGO_05_TRIBUTOS) as CodigoTributo[];

export const codigoTributoSchema = z.enum(
  codigosTributoValidos as [CodigoTributo, ...CodigoTributo[]],
  { message: "Código de tributo inválido (Catálogo 05 SUNAT)" }
);

// ═══════════════════════════════════════════════════════════════════════════════
// Catálogo 07 SUNAT — Tipo de Afectación del IGV (completo)
// ═══════════════════════════════════════════════════════════════════════════════

export const CATALOGO_07_AFECTACION_IGV = {
  // ── Gravado ──
  "10": { descripcion: "Gravado - Operación Onerosa", tributo: "1000", letra: "S", onerosa: true, gratuita: false },
  "11": { descripcion: "Gravado - Retiro por premio", tributo: "1000", letra: "S", onerosa: false, gratuita: true },
  "12": { descripcion: "Gravado - Retiro por donación", tributo: "1000", letra: "S", onerosa: false, gratuita: true },
  "13": { descripcion: "Gravado - Retiro", tributo: "1000", letra: "S", onerosa: false, gratuita: true },
  "14": { descripcion: "Gravado - Retiro por publicidad", tributo: "1000", letra: "S", onerosa: false, gratuita: true },
  "15": { descripcion: "Gravado - Bonificaciones", tributo: "1000", letra: "S", onerosa: false, gratuita: true },
  "16": { descripcion: "Gravado - Retiro por entrega a trabajadores", tributo: "1000", letra: "S", onerosa: false, gratuita: true },
  "17": { descripcion: "Gravado - IVAP", tributo: "1016", letra: "S", onerosa: true, gratuita: false },
  // ── Exonerado ──
  "20": { descripcion: "Exonerado - Operación Onerosa", tributo: "9997", letra: "E", onerosa: true, gratuita: false },
  "21": { descripcion: "Exonerado - Transferencia gratuita", tributo: "9997", letra: "E", onerosa: false, gratuita: true },
  // ── Inafecto ──
  "30": { descripcion: "Inafecto - Operación Onerosa", tributo: "9998", letra: "O", onerosa: true, gratuita: false },
  "31": { descripcion: "Inafecto - Retiro por bonificación", tributo: "9998", letra: "O", onerosa: false, gratuita: true },
  "32": { descripcion: "Inafecto - Retiro", tributo: "9998", letra: "O", onerosa: false, gratuita: true },
  "33": { descripcion: "Inafecto - Retiro por muestras médicas", tributo: "9998", letra: "O", onerosa: false, gratuita: true },
  "34": { descripcion: "Inafecto - Transferencia a título gratuito", tributo: "9998", letra: "O", onerosa: false, gratuita: true },
  "35": { descripcion: "Inafecto - Retiro por convenio colectivo", tributo: "9998", letra: "O", onerosa: false, gratuita: true },
  "36": { descripcion: "Inafecto - Retiro por premio", tributo: "9998", letra: "O", onerosa: false, gratuita: true },
  "37": { descripcion: "Inafecto - Retiro por publicidad", tributo: "9998", letra: "O", onerosa: false, gratuita: true },
  // ── Exportación ──
  "40": { descripcion: "Exportación", tributo: "9995", letra: "G", onerosa: true, gratuita: false },
} as const;

export type CodigoAfectacionIGV = keyof typeof CATALOGO_07_AFECTACION_IGV;

const codigosAfectacionValidos = Object.keys(CATALOGO_07_AFECTACION_IGV) as CodigoAfectacionIGV[];

export const codigoAfectacionIGVSchema = z.enum(
  codigosAfectacionValidos as [CodigoAfectacionIGV, ...CodigoAfectacionIGV[]],
  { message: "Código de afectación IGV inválido (Catálogo 07 SUNAT)" }
);

// ═══════════════════════════════════════════════════════════════════════════════
// Catálogo 06 SUNAT — Documentos de Identidad
// ═══════════════════════════════════════════════════════════════════════════════

export const CATALOGO_06_DOCUMENTOS_IDENTIDAD = {
  "0": { descripcion: "Documento Nacional de Identidad (DOC.TRIB.NO.DOM.SIN.RUC)", longitud: null },
  "1": { descripcion: "Documento Nacional de Identidad (DNI)", longitud: 8 },
  "4": { descripcion: "Carnet de Extranjería", longitud: 12 },
  "6": { descripcion: "Registro Único de Contribuyentes (RUC)", longitud: 11 },
  "7": { descripcion: "Pasaporte", longitud: 12 },
  "A": { descripcion: "Cédula Diplomática de Identidad", longitud: 15 },
  "B": { descripcion: "Documento de Identidad País de Residencia - No domiciliados", longitud: 15 },
  "C": { descripcion: "Tax Identification Number (TIN) – Doc Trib PP.NN.", longitud: 15 },
  "D": { descripcion: "Identification Number (IN) – Doc Trib PP.JJ.", longitud: 15 },
  "E": { descripcion: "Tarjeta Andina de Migración (TAM)", longitud: 15 },
  "-": { descripcion: "Varios (ventas menores a S/ 700 - Boletas)", longitud: null },
} as const;

export type CodigoDocIdentidad = keyof typeof CATALOGO_06_DOCUMENTOS_IDENTIDAD;

const codigosDocIdentidadValidos = Object.keys(CATALOGO_06_DOCUMENTOS_IDENTIDAD) as CodigoDocIdentidad[];

export const codigoDocIdentidadSchema = z.enum(
  codigosDocIdentidadValidos as [CodigoDocIdentidad, ...CodigoDocIdentidad[]],
  { message: "Código de tipo de documento de identidad inválido (Catálogo 06 SUNAT)" }
);

/**
 * Valida un número de documento contra su tipo.
 * Verifica longitud donde aplica y formato (RUC = 11 dígitos, DNI = 8 dígitos, etc.)
 */
export function validarDocumentoIdentidad(
  tipoDoc: string,
  numeroDoc: string
): { valido: boolean; errores: string[] } {
  const errores: string[] = [];
  const tipo = CATALOGO_06_DOCUMENTOS_IDENTIDAD[tipoDoc as CodigoDocIdentidad];

  if (!tipo) {
    errores.push(`Tipo de documento "${tipoDoc}" no reconocido (Catálogo 06 SUNAT)`);
    return { valido: false, errores };
  }

  if (!numeroDoc || numeroDoc.trim() === "") {
    errores.push("El número de documento no puede estar vacío");
    return { valido: false, errores };
  }

  // Validaciones específicas por tipo
  switch (tipoDoc) {
    case "1": // DNI
      if (!/^\d{8}$/.test(numeroDoc)) {
        errores.push("El DNI debe contener exactamente 8 dígitos numéricos");
      }
      break;
    case "6": // RUC
      if (!/^\d{11}$/.test(numeroDoc)) {
        errores.push("El RUC debe contener exactamente 11 dígitos numéricos");
      } else if (!["10", "15", "17", "20"].some((p) => numeroDoc.startsWith(p))) {
        errores.push("El RUC debe comenzar con 10, 15, 17 o 20");
      }
      break;
    default:
      if (tipo.longitud !== null && numeroDoc.length > tipo.longitud) {
        errores.push(`El documento tipo ${tipo.descripcion} no debe exceder ${tipo.longitud} caracteres`);
      }
  }

  return { valido: errores.length === 0, errores };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Códigos UN/ECE 5153 y 5305
// ═══════════════════════════════════════════════════════════════════════════════

/** UN/ECE 5153 - Duty/tax/fee type name code (usado en TaxScheme) */
export const UNECE_5153 = {
  VAT: "Value Added Tax (IVA/IGV)",
  EXC: "Excise Duty (ISC)",
  FRE: "Free (Gratuito/Exportación/Inafecto)",
  OTH: "Other taxes (ICBPER/Otros)",
} as const;

export type CodigoUNECE5153 = keyof typeof UNECE_5153;

export const codigoUNECE5153Schema = z.enum(
  Object.keys(UNECE_5153) as [CodigoUNECE5153, ...CodigoUNECE5153[]],
  { message: "Código UN/ECE 5153 inválido" }
);

/** UN/ECE 5305 - Duty/tax/fee category code (usado en TaxCategory) */
export const UNECE_5305 = {
  S: "Standard rate (Gravado)",
  E: "Exempt from tax (Exonerado)",
  O: "Services outside scope of tax (Inafecto)",
  G: "Free export item, tax not charged (Exportación)",
  Z: "Zero rated goods (Gratuito)",
} as const;

export type CodigoUNECE5305 = keyof typeof UNECE_5305;

export const codigoUNECE5305Schema = z.enum(
  Object.keys(UNECE_5305) as [CodigoUNECE5305, ...CodigoUNECE5305[]],
  { message: "Código UN/ECE 5305 inválido" }
);

// ═══════════════════════════════════════════════════════════════════════════════
// Cálculo de Impuestos
// ═══════════════════════════════════════════════════════════════════════════════

/** Redondeo bancario SUNAT: 2 decimales, redondeo half-even (banker's rounding) */
export function redondeoSunat(valor: number, decimales: number = 2): number {
  const factor = Math.pow(10, decimales);
  const shifted = valor * factor;
  const truncated = Math.trunc(shifted);
  const remainder = shifted - truncated;

  // Redondeo bancario: si el resto es exactamente 0.5, redondea al par más cercano
  if (Math.abs(remainder - 0.5) < 1e-10) {
    return (truncated % 2 === 0 ? truncated : truncated + 1) / factor;
  }

  return Math.round(shifted) / factor;
}

export interface ResultadoCalculoImpuesto {
  /** Valor de venta (base imponible) */
  valorVenta: number;
  /** Monto del IGV/IVAP */
  montoIGV: number;
  /** Monto del ISC (si aplica) */
  montoISC: number;
  /** Monto del ICBPER (si aplica) */
  montoICBPER: number;
  /** Otros cargos */
  otrosCargos: number;
  /** Precio de venta (incluye IGV) */
  precioVenta: number;
  /** Importe total */
  importeTotal: number;
  /** Tasa de IGV aplicada */
  tasaIGV: number;
  /** Tributo aplicado según Catálogo 05 */
  codigoTributo: string;
  /** Es operación gratuita */
  esGratuita: boolean;
}

export interface OpcionesCalculoItem {
  /** Cantidad del ítem */
  cantidad: number;
  /** Valor unitario (sin IGV) */
  valorUnitario: number;
  /** Código de afectación IGV (Catálogo 07) */
  codigoAfectacionIGV: CodigoAfectacionIGV;
  /** Monto ISC por ítem (opcional) */
  montoISCUnitario?: number;
  /** Cantidad de bolsas de plástico para ICBPER (opcional) */
  cantidadBolsas?: number;
  /** Monto fijo ICBPER por bolsa (default: 0.50) */
  montoICBPERUnitario?: number;
}

/**
 * Calcula los impuestos de un ítem según las reglas SUNAT.
 * Aplica redondeo bancario en cada paso intermedio.
 */
export function calcularImpuestoItem(opciones: OpcionesCalculoItem): ResultadoCalculoImpuesto {
  const {
    cantidad,
    valorUnitario,
    codigoAfectacionIGV,
    montoISCUnitario = 0,
    cantidadBolsas = 0,
    montoICBPERUnitario = 0.50,
  } = opciones;

  const afectacion = CATALOGO_07_AFECTACION_IGV[codigoAfectacionIGV];
  const codigoTributo = afectacion.tributo;
  const esGratuita = afectacion.gratuita;

  // Base imponible
  const valorVenta = redondeoSunat(cantidad * valorUnitario);

  // ISC (se suma a la base para el IGV)
  const montoISC = redondeoSunat(cantidad * montoISCUnitario);

  // Base para IGV (valor venta + ISC)
  const baseIGV = valorVenta + montoISC;

  // Tasa de IGV según tributo
  let tasaIGV = 0;
  if (codigoTributo === "1000") {
    tasaIGV = CATALOGO_05_TRIBUTOS["1000"].tasa; // 18%
  } else if (codigoTributo === "1016") {
    tasaIGV = CATALOGO_05_TRIBUTOS["1016"].tasa; // 4% IVAP
  }

  // Monto IGV
  const montoIGV = redondeoSunat(baseIGV * tasaIGV);

  // ICBPER (monto fijo por bolsa)
  const montoICBPER = redondeoSunat(cantidadBolsas * montoICBPERUnitario);

  // Precio de venta unitario (incluye IGV)
  const precioVenta = redondeoSunat(valorVenta + montoIGV);

  // Importe total
  const importeTotal = redondeoSunat(precioVenta + montoISC + montoICBPER);

  return {
    valorVenta,
    montoIGV,
    montoISC,
    montoICBPER,
    otrosCargos: 0,
    precioVenta,
    importeTotal,
    tasaIGV,
    codigoTributo,
    esGratuita,
  };
}

/**
 * Dado un código de afectación IGV, retorna los códigos UN/ECE 5153 y 5305 correspondientes.
 */
export function obtenerCodigosUNECE(codigoAfectacion: CodigoAfectacionIGV): {
  tributo: string;
  nombreTributo: string;
  codigoUNECE_5153: CodigoUNECE5153;
  codigoUNECE_5305: CodigoUNECE5305;
} {
  const afectacion = CATALOGO_07_AFECTACION_IGV[codigoAfectacion];
  const tributo = CATALOGO_05_TRIBUTOS[afectacion.tributo as CodigoTributo];

  return {
    tributo: afectacion.tributo,
    nombreTributo: tributo.nombre,
    codigoUNECE_5153: tributo.codigoUNECE_5153 as CodigoUNECE5153,
    codigoUNECE_5305: tributo.codigoUNECE_5305 as CodigoUNECE5305,
  };
}

/**
 * Determina si un código de afectación es gravado con IGV.
 */
export function esGravado(codigo: CodigoAfectacionIGV): boolean {
  return codigo.startsWith("1");
}

/**
 * Determina si un código de afectación es exonerado.
 */
export function esExonerado(codigo: CodigoAfectacionIGV): boolean {
  return codigo.startsWith("2");
}

/**
 * Determina si un código de afectación es inafecto.
 */
export function esInafecto(codigo: CodigoAfectacionIGV): boolean {
  return codigo.startsWith("3");
}

/**
 * Determina si un código de afectación es exportación.
 */
export function esExportacion(codigo: CodigoAfectacionIGV): boolean {
  return codigo === "40";
}

/**
 * Determina si un código de afectación corresponde a operación gratuita.
 */
export function esOperacionGratuita(codigo: CodigoAfectacionIGV): boolean {
  return CATALOGO_07_AFECTACION_IGV[codigo].gratuita;
}
