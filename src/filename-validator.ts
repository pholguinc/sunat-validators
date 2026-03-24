import { z } from "zod";

// ─── Catálogo 01 SUNAT — Tipo de documento ───────────────────────────────────
const TIPOS_DOCUMENTO = {
  "01": "Factura",
  "03": "Boleta de Venta",
  "07": "Nota de Crédito",
  "08": "Nota de Débito",
  "09": "Guía de Remisión Remitente",
  "20": "Comprobante de Retención",
  "31": "Guía de Remisión Transportista",
  "40": "Comprobante de Percepción",
} as const;

export type TipoDocumento = keyof typeof TIPOS_DOCUMENTO;

// ─── Patrones de nombre de archivo SUNAT ──────────────────────────────────────

// Factura/Boleta/NC/ND/GR: {RUC}-{TIPO}-{SERIE}-{CORRELATIVO}
// Ejemplo: 20123456789-01-F001-00000001
const PATRON_CPE = /^(\d{11})-(01|03|07|08|09|20|31|40)-([A-Z0-9]{4})-(\d{1,8})$/;

// Resumen de Boletas: {RUC}-RC-{YYYYMMDD}-{CORRELATIVO}
const PATRON_RESUMEN = /^(\d{11})-RC-(\d{8})-(\d{1,5})$/;

// Comunicación de Baja: {RUC}-RA-{YYYYMMDD}-{CORRELATIVO}
const PATRON_BAJA = /^(\d{11})-RA-(\d{8})-(\d{1,5})$/;

// Resumen de Reversiones: {RUC}-RR-{YYYYMMDD}-{CORRELATIVO}
const PATRON_REVERSION = /^(\d{11})-RR-(\d{8})-(\d{1,5})$/;

// ─── Tipos de resultado ──────────────────────────────────────────────────────

interface NombreCPEParseado {
  tipo: "cpe";
  ruc: string;
  tipoDocumento: TipoDocumento;
  tipoDocumentoDescripcion: string;
  serie: string;
  correlativo: string;
}

interface NombreResumenParseado {
  tipo: "resumen";
  ruc: string;
  fecha: string;
  correlativo: string;
}

interface NombreBajaParseado {
  tipo: "baja";
  ruc: string;
  fecha: string;
  correlativo: string;
}

interface NombreReversionParseado {
  tipo: "reversion";
  ruc: string;
  fecha: string;
  correlativo: string;
}

export type NombreArchivoParseado =
  | NombreCPEParseado
  | NombreResumenParseado
  | NombreBajaParseado
  | NombreReversionParseado;

// ─── Validaciones de serie según tipo de documento ───────────────────────────

function validarSerieParaTipo(serie: string, tipoDoc: string): string | null {
  switch (tipoDoc) {
    case "01": // Factura
    case "07": // NC sobre factura
    case "08": // ND sobre factura
      if (!serie.startsWith("F") && !serie.startsWith("E")) {
        return `Serie para ${TIPOS_DOCUMENTO[tipoDoc as TipoDocumento]} debe comenzar con F o E (recibido: ${serie})`;
      }
      break;
    case "03": // Boleta
      if (!serie.startsWith("B") && !serie.startsWith("EB")) {
        return `Serie para Boleta de Venta debe comenzar con B o EB (recibido: ${serie})`;
      }
      break;
    case "09": // Guía remitente
      if (!serie.startsWith("T") && serie !== "EG01") {
        return `Serie para Guía de Remisión Remitente debe comenzar con T o ser EG01 (recibido: ${serie})`;
      }
      break;
    case "20": // Retención
      if (!serie.startsWith("R")) {
        return `Serie para Comprobante de Retención debe comenzar con R (recibido: ${serie})`;
      }
      break;
    case "40": // Percepción
      if (!serie.startsWith("P")) {
        return `Serie para Comprobante de Percepción debe comenzar con P (recibido: ${serie})`;
      }
      break;
  }
  return null;
}

// ─── Función de validación de fecha YYYYMMDD ─────────────────────────────────

function esFechaValida(fechaStr: string): boolean {
  const anio = parseInt(fechaStr.substring(0, 4), 10);
  const mes = parseInt(fechaStr.substring(4, 6), 10);
  const dia = parseInt(fechaStr.substring(6, 8), 10);

  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return false;

  const fecha = new Date(anio, mes - 1, dia);
  return (
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia
  );
}

// ─── Función principal de parseo y validación ────────────────────────────────

export function parsearNombreArchivo(
  nombreArchivo: string
): NombreArchivoParseado {
  // Quitar extensión .xml o .zip
  const sinExtension = nombreArchivo.replace(/\.(xml|zip)$/i, "");

  // Intentar CPE: {RUC}-{TIPO}-{SERIE}-{CORRELATIVO}
  const matchCPE = sinExtension.match(PATRON_CPE);
  if (matchCPE) {
    const [, ruc, tipoDoc, serie, correlativo] = matchCPE;
    if (!ruc || !tipoDoc || !serie || !correlativo) {
      throw new Error("No se pudo extraer los datos del nombre del archivo");
    }

    const errorSerie = validarSerieParaTipo(serie, tipoDoc);
    if (errorSerie) {
      throw new Error(errorSerie);
    }

    return {
      tipo: "cpe",
      ruc,
      tipoDocumento: tipoDoc as TipoDocumento,
      tipoDocumentoDescripcion:
        TIPOS_DOCUMENTO[tipoDoc as TipoDocumento],
      serie,
      correlativo,
    };
  }

  // Intentar Resumen: {RUC}-RC-{FECHA}-{CORRELATIVO}
  const matchResumen = sinExtension.match(PATRON_RESUMEN);
  if (matchResumen) {
    const [, ruc, fecha, correlativo] = matchResumen;
    if (!ruc || !fecha || !correlativo) {
      throw new Error("No se pudo extraer los datos del resumen");
    }
    if (!esFechaValida(fecha)) {
      throw new Error(
        `La fecha del resumen no es válida: ${fecha}`
      );
    }
    return { tipo: "resumen", ruc, fecha, correlativo };
  }

  // Intentar Baja: {RUC}-RA-{FECHA}-{CORRELATIVO}
  const matchBaja = sinExtension.match(PATRON_BAJA);
  if (matchBaja) {
    const [, ruc, fecha, correlativo] = matchBaja;
    if (!ruc || !fecha || !correlativo) {
      throw new Error("No se pudo extraer los datos de la comunicación de baja");
    }
    if (!esFechaValida(fecha)) {
      throw new Error(
        `La fecha de la comunicación de baja no es válida: ${fecha}`
      );
    }
    return { tipo: "baja", ruc, fecha, correlativo };
  }

  // Intentar Reversión: {RUC}-RR-{FECHA}-{CORRELATIVO}
  const matchReversion = sinExtension.match(PATRON_REVERSION);
  if (matchReversion) {
    const [, ruc, fecha, correlativo] = matchReversion;
    if (!ruc || !fecha || !correlativo) {
      throw new Error("No se pudo extraer los datos del resumen de reversiones");
    }
    if (!esFechaValida(fecha)) {
      throw new Error(
        `La fecha del resumen de reversiones no es válida: ${fecha}`
      );
    }
    return { tipo: "reversion", ruc, fecha, correlativo };
  }

  throw new Error(
    "El nombre del archivo no cumple con ningún formato SUNAT válido. " +
      "Formatos esperados: {RUC}-{TIPO}-{SERIE}-{CORRELATIVO}, " +
      "{RUC}-RC-{FECHA}-{CORRELATIVO}, {RUC}-RA-{FECHA}-{CORRELATIVO}"
  );
}

// ─── Schemas Zod ─────────────────────────────────────────────────────────────

export const nombreArchivoXmlSchema = z
  .string()
  .regex(/\.xml$/i, "El archivo debe tener extensión .xml")
  .refine(
    (nombre) => {
      try {
        parsearNombreArchivo(nombre);
        return true;
      } catch {
        return false;
      }
    },
    "El nombre del archivo XML no cumple con el formato SUNAT"
  )
  .transform((nombre) => parsearNombreArchivo(nombre));

export const nombreArchivoZipSchema = z
  .string()
  .regex(/\.zip$/i, "El archivo debe tener extensión .zip")
  .refine(
    (nombre) => {
      try {
        parsearNombreArchivo(nombre);
        return true;
      } catch {
        return false;
      }
    },
    "El nombre del archivo ZIP no cumple con el formato SUNAT"
  )
  .transform((nombre) => parsearNombreArchivo(nombre));

/**
 * Valida que el nombre del XML coincida con el nombre del ZIP.
 * Código de error SUNAT: 161
 */
export function validarCoincidenciaNombres(
  nombreZip: string,
  nombreXml: string
): boolean {
  const baseZip = nombreZip.replace(/\.zip$/i, "");
  const baseXml = nombreXml.replace(/\.xml$/i, "");
  return baseZip === baseXml;
}

/**
 * Valida que el RUC del nombre del archivo coincida con un RUC dado.
 * Código de error SUNAT: 154, 1034
 */
export function validarRucEnNombre(
  nombreArchivo: string,
  rucEsperado: string
): boolean {
  const parseado = parsearNombreArchivo(nombreArchivo);
  return parseado.ruc === rucEsperado;
}
