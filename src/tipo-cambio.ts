// ═══════════════════════════════════════════════════════════════════════════════
// Conversión de Moneda y Tipo de Cambio SUNAT
// ═══════════════════════════════════════════════════════════════════════════════

import { redondeoSunat } from "./catalogos-sunat.ts";

export interface OpcionesConversionMoneda {
  /** 
   * Tipo de cambio aplicable. 
   * - Para facturar en Dólares montos que estaban en Soles, SUNAT exige usar el Tipo de Cambio VENTA.
   * - Para registrar compras en Dólares a Soles, SUNAT exige usar el Tipo de Cambio COMPRA (generalmente).
   * - La SUNAT publica el tipo de cambio diariamente.
   */
  tipoCambio: number;
}

/**
 * Convierte un monto de Soles (PEN) a Dólares (USD) o cualquier divisa 
 * usando el tipo de cambio proporcionado.
 * 
 * Fórmula: Monto en USD = Monto en PEN / Tipo de Cambio
 * Redondeado a 2 decimales según estándar SUNAT.
 */
export function solesADolares(montoSoles: number, opciones: OpcionesConversionMoneda): number {
  if (opciones.tipoCambio <= 0) {
    throw new Error("El tipo de cambio debe ser mayor a 0");
  }
  
  const convertido = montoSoles / opciones.tipoCambio;
  return redondeoSunat(convertido, 2);
}

/**
 * Convierte un monto de Dólares (USD) o cualquier divisa a Soles (PEN) 
 * usando el tipo de cambio proporcionado.
 * 
 * Fórmula: Monto en PEN = Monto en USD * Tipo de Cambio
 * Redondeado a 2 decimales según estándar SUNAT.
 */
export function dolaresASoles(montoDolares: number, opciones: OpcionesConversionMoneda): number {
  if (opciones.tipoCambio <= 0) {
    throw new Error("El tipo de cambio debe ser mayor a 0");
  }

  const convertido = montoDolares * opciones.tipoCambio;
  return redondeoSunat(convertido, 2);
}
