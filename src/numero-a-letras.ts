// ═══════════════════════════════════════════════════════════════════════════════
// Convertidor de números a letras - Formato SUNAT
// Ejemplo: 236.00 → "DOSCIENTOS TREINTA Y SEIS CON 00/100 SOLES"
// ═══════════════════════════════════════════════════════════════════════════════

const UNIDADES = [
  "", "UN", "DOS", "TRES", "CUATRO", "CINCO",
  "SEIS", "SIETE", "OCHO", "NUEVE",
] as const;

const ESPECIALES = [
  "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE",
  "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE",
] as const;

const DECENAS = [
  "", "", "VEINTI", "TREINTA", "CUARENTA", "CINCUENTA",
  "SESENTA", "SETENTA", "OCHENTA", "NOVENTA",
] as const;

const CENTENAS = [
  "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
  "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS",
] as const;

/**
 * Convierte un número de 0 a 999 en palabras.
 */
function centenasALetras(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "CIEN";

  const centena = Math.floor(n / 100);
  const resto = n % 100;

  let resultado = CENTENAS[centena] ?? "";

  if (resto === 0) return resultado;

  if (resultado) resultado += " ";

  if (resto <= 20) {
    if (resto <= 9) {
      resultado += UNIDADES[resto];
    } else {
      resultado += ESPECIALES[resto - 10];
    }
  } else {
    const decena = Math.floor(resto / 10);
    const unidad = resto % 10;

    if (decena === 2 && unidad > 0) {
      // VEINTI + UNO, VEINTI + DOS, etc.
      resultado += DECENAS[2] + UNIDADES[unidad];
    } else if (unidad === 0) {
      resultado += DECENAS[decena];
    } else {
      resultado += DECENAS[decena] + " Y " + UNIDADES[unidad];
    }
  }

  return resultado;
}

/**
 * Convierte la parte entera de un número en palabras.
 * Soporta hasta 999,999,999,999 (billones).
 */
function enteroALetras(n: number): string {
  if (n === 0) return "CERO";
  if (n === 1) return "UN";

  let resultado = "";

  // Miles de millones (billones en español americano)
  const milesMillones = Math.floor(n / 1_000_000_000);
  if (milesMillones > 0) {
    if (milesMillones === 1) {
      resultado += "UN MIL ";
    } else {
      resultado += centenasALetras(milesMillones) + " MIL ";
    }
  }

  // Millones
  const millones = Math.floor((n % 1_000_000_000) / 1_000_000);
  if (millones > 0) {
    if (millones === 1) {
      resultado += "UN MILLON ";
    } else {
      resultado += centenasALetras(millones) + " MILLONES ";
    }
  }

  // Miles
  const miles = Math.floor((n % 1_000_000) / 1_000);
  if (miles > 0) {
    if (miles === 1) {
      resultado += "MIL ";
    } else {
      resultado += centenasALetras(miles) + " MIL ";
    }
  }

  // Unidades
  const unidades = n % 1_000;
  if (unidades > 0) {
    resultado += centenasALetras(unidades);
  }

  return resultado.trim();
}

export type MonedaSunat = "PEN" | "USD" | "EUR";

const NOMBRES_MONEDA: Record<MonedaSunat, { singular: string; plural: string }> = {
  PEN: { singular: "SOL", plural: "SOLES" },
  USD: { singular: "DOLAR AMERICANO", plural: "DOLARES AMERICANOS" },
  EUR: { singular: "EURO", plural: "EUROS" },
};

export interface OpcionesNumeroALetras {
  /** Código de moneda ISO 4217 (PEN, USD, EUR). Default: "PEN" */
  moneda?: MonedaSunat;
}

/**
 * Convierte un monto numérico a su representación en letras según formato SUNAT.
 *
 * @example
 * numeroALetras(236)
 * // → "DOSCIENTOS TREINTA Y SEIS CON 00/100 SOLES"
 *
 * numeroALetras(1180.50)
 * // → "MIL CIENTO OCHENTA CON 50/100 SOLES"
 *
 * numeroALetras(1500.99, { moneda: "USD" })
 * // → "MIL QUINIENTOS CON 99/100 DOLARES AMERICANOS"
 *
 * numeroALetras(1)
 * // → "UN CON 00/100 SOL"
 */
export function numeroALetras(monto: number, opciones?: OpcionesNumeroALetras): string {
  const moneda = opciones?.moneda ?? "PEN";

  if (monto < 0) {
    return "MENOS " + numeroALetras(Math.abs(monto), opciones);
  }

  if (!Number.isFinite(monto)) {
    throw new Error("El monto debe ser un número finito");
  }

  // Separar parte entera y decimal
  const parteEntera = Math.floor(monto);
  const centavos = Math.round((monto - parteEntera) * 100);

  // Convertir la parte entera a letras
  const letras = enteroALetras(parteEntera);

  // Formatear centavos como XX/100
  const centavosStr = centavos.toString().padStart(2, "0");

  // Nombre de la moneda (singular o plural)
  const nombreMoneda = NOMBRES_MONEDA[moneda];
  const monedaStr = parteEntera === 1 && centavos === 0
    ? nombreMoneda.singular
    : nombreMoneda.plural;

  return `${letras} CON ${centavosStr}/100 ${monedaStr}`;
}
