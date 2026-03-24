import {
  parsearNombreArchivo,
  nombreArchivoXmlSchema,
  nombreArchivoZipSchema,
  validarCoincidenciaNombres,
  validarRucEnNombre,
  validarXml,
} from "./index.ts";

// ═══════════════════════════════════════════════════════════════════════════════
// 1. VALIDADOR DE NOMBRES DE ARCHIVO
// ═══════════════════════════════════════════════════════════════════════════════
console.log("═".repeat(70));
console.log("  PRUEBAS DEL VALIDADOR DE NOMBRES DE ARCHIVO");
console.log("═".repeat(70));

// ── Casos válidos ──
const casosValidos = [
  "20123456789-01-F001-00000001.xml", // Factura
  "20123456789-01-F001-00000001.zip", // Factura ZIP
  "20123456789-03-B001-00000001.xml", // Boleta
  "20123456789-07-F001-00000001.xml", // Nota de Crédito
  "20123456789-08-F001-00000001.xml", // Nota de Débito
  "20123456789-09-T001-00000001.xml", // Guía de Remisión
  "20123456789-20-R001-00000001.xml", // Retención
  "20123456789-40-P001-00000001.xml", // Percepción
  "20123456789-RC-20240315-00001.xml", // Resumen
  "20123456789-RA-20240315-00001.xml", // Baja
];

console.log("\nCASOS VÁLIDOS:");
for (const nombre of casosValidos) {
  try {
    const resultado = parsearNombreArchivo(nombre);
    console.log(`  ${nombre}`);
    console.log(
      `    → Tipo: ${resultado.tipo}${resultado.tipo === "cpe" ? ` (${resultado.tipoDocumentoDescripcion})` : ""}`,
    );
    console.log(`    → RUC: ${resultado.ruc}`);
  } catch (e: any) {
    console.log(`  ${nombre} → ERROR: ${e.message}`);
  }
}

// ── Casos inválidos ──
const casosInvalidos = [
  "12345-01-F001-00000001.xml", // RUC corto
  "20123456789-01-B001-00000001.xml", // Serie B en factura
  "20123456789-99-F001-00000001.xml", // Tipo doc inválido
  "archivo_random.xml", // Formato libre
  "20123456789-RC-20241301-00001.xml", // Fecha inválida (mes 13)
];

console.log("\nCASOS INVÁLIDOS:");
for (const nombre of casosInvalidos) {
  try {
    parsearNombreArchivo(nombre);
    console.log(`  ${nombre} → Pasó (no debería)`);
  } catch (e: any) {
    console.log(`  ${nombre}`);
    console.log(`    → Error: ${e.message}`);
  }
}

// ── Schemas Zod ──
console.log("\nVALIDACIÓN CON ZOD SCHEMA:");
const resultZod1 = nombreArchivoXmlSchema.safeParse(
  "20123456789-01-F001-00000001.xml",
);
console.log(`  XML válido:   ${resultZod1.success ? "PASS" : "FAIL"}`);
if (resultZod1.success) console.log(`    → ${JSON.stringify(resultZod1.data)}`);

const resultZod2 = nombreArchivoXmlSchema.safeParse("archivo_malo.xml");
console.log(
  `  XML inválido: ${resultZod2.success ? "PASS" : "FAIL (esperado)"}`,
);
if (!resultZod2.success)
  console.log(`    → ${resultZod2.error.issues[0]?.message}`);

const resultZod3 = nombreArchivoZipSchema.safeParse(
  "20123456789-01-F001-00000001.zip",
);
console.log(`  ZIP válido:   ${resultZod3.success ? "PASS" : "FAIL"}`);

// ── Coincidencia de nombres ──
console.log("\nCOINCIDENCIA ZIP/XML:");
const coincide = validarCoincidenciaNombres(
  "20123456789-01-F001-00000001.zip",
  "20123456789-01-F001-00000001.xml",
);
console.log(`  ZIP y XML coinciden: ${coincide ? "PASS" : "FAIL"}`);

const noCoincide = validarCoincidenciaNombres(
  "20123456789-01-F001-00000001.zip",
  "20123456789-01-F001-00000002.xml",
);
console.log(
  `  ZIP y XML no coinciden: ${!noCoincide ? "PASS (correcto)" : "FAIL"}`,
);

// ── Validar RUC en nombre ──
console.log("\nVALIDAR RUC EN NOMBRE:");
const rucOk = validarRucEnNombre(
  "20123456789-01-F001-00000001.xml",
  "20123456789",
);
console.log(`  RUC coincide: ${rucOk ? "PASS" : "FAIL"}`);

const rucMal = validarRucEnNombre(
  "20123456789-01-F001-00000001.xml",
  "20999999999",
);
console.log(`  RUC no coincide: ${!rucMal ? "PASS (correcto)" : "FAIL"}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. VALIDADOR DE ESTRUCTURA XML
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n" + "═".repeat(70));
console.log("  PRUEBAS DEL VALIDADOR DE ESTRUCTURA XML");
console.log("═".repeat(70));

// ── Factura válida (estructura mínima) ──
const facturaValida = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent/>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>F001-00000001</cbc:ID>
  <cbc:IssueDate>2024-03-15</cbc:IssueDate>
  <cbc:DocumentCurrencyCode>PEN</cbc:DocumentCurrencyCode>
  <cac:Signature>
    <cbc:ID>SIG-001</cbc:ID>
  </cac:Signature>
  <cac:AccountingSupplierParty>
    <cbc:CustomerAssignedAccountID>20123456789</cbc:CustomerAssignedAccountID>
    <cac:Party>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>MI EMPRESA SAC</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cbc:CustomerAssignedAccountID>20987654321</cbc:CustomerAssignedAccountID>
    <cbc:AdditionalAccountID>6</cbc:AdditionalAccountID>
    <cac:Party>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>CLIENTE SAC</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="PEN">18.00</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxAmount currencyID="PEN">18.00</cbc:TaxAmount>
      <cac:TaxCategory>
        <cac:TaxScheme>
          <cbc:ID>1000</cbc:ID>
          <cbc:Name>IGV</cbc:Name>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:PayableAmount currencyID="PEN">118.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="NIU">1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="PEN">100.00</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="PEN">18.00</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cac:TaxCategory>
          <cac:TaxScheme>
            <cbc:ID>1000</cbc:ID>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>Servicio de consultoría</cbc:Description>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="PEN">100.00</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

console.log("\nFACTURA VÁLIDA:");
const res1 = validarXml(facturaValida);
console.log(`  Válido: ${res1.valido ? "PASS" : "FAIL"}`);
console.log(`  Tipo: ${res1.tipoDocumento}`);
console.log(`  Errores: ${res1.errores.length}`);
console.log(`  Advertencias: ${res1.advertencias.length}`);
if (res1.errores.length > 0) {
  for (const err of res1.errores) {
    console.log(`    [${err.codigo}] ${err.mensaje} (tag: ${err.tag})`);
  }
}

// ── XML con tags faltantes ──
const facturaIncompleta = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:IssueDate>2024-13-45</cbc:IssueDate>
</Invoice>`;

console.log("\nFACTURA INCOMPLETA (sin emisor, receptor, firma, etc.):");
const res2 = validarXml(facturaIncompleta);
console.log(`  Válido: ${res2.valido ? "PASS" : "FAIL (esperado)"}`);
console.log(`  Tipo: ${res2.tipoDocumento}`);
console.log(`  Errores encontrados: ${res2.errores.length}`);
for (const err of res2.errores) {
  console.log(`    [${err.codigo}] ${err.mensaje}`);
}

// ── XML no parseable ──
console.log("\nXML MAL FORMADO:");
const res3 = validarXml("<esto no es xml válido<<<>>>");
console.log(`  Válido: ${res3.valido ? "PASS" : "FAIL (esperado)"}`);
console.log(
  `  Error: [${res3.errores[0]?.codigo}] ${res3.errores[0]?.mensaje}`,
);

// ── Nota de Crédito ──
const notaCredito = `<?xml version="1.0" encoding="UTF-8"?>
<CreditNote>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>F001-00000001</cbc:ID>
  <cbc:IssueDate>2024-03-15</cbc:IssueDate>
  <cbc:DocumentCurrencyCode>PEN</cbc:DocumentCurrencyCode>
  <cac:Signature><cbc:ID>SIG-001</cbc:ID></cac:Signature>
  <cac:AccountingSupplierParty>
    <cbc:CustomerAssignedAccountID>20123456789</cbc:CustomerAssignedAccountID>
    <cac:Party><cac:PartyLegalEntity><cbc:RegistrationName>EMPRESA</cbc:RegistrationName></cac:PartyLegalEntity></cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cbc:CustomerAssignedAccountID>20987654321</cbc:CustomerAssignedAccountID>
    <cbc:AdditionalAccountID>6</cbc:AdditionalAccountID>
  </cac:AccountingCustomerParty>
  <cac:DiscrepancyResponse>
    <cbc:ResponseCode>01</cbc:ResponseCode>
    <cbc:Description>Anulación de la operación</cbc:Description>
  </cac:DiscrepancyResponse>
  <cac:BillingReference>
    <cac:InvoiceDocumentReference>
      <cbc:ID>F001-00000001</cbc:ID>
    </cac:InvoiceDocumentReference>
  </cac:BillingReference>
  <cac:TaxTotal><cbc:TaxAmount>18.00</cbc:TaxAmount></cac:TaxTotal>
  <cac:LegalMonetaryTotal><cbc:PayableAmount>118.00</cbc:PayableAmount></cac:LegalMonetaryTotal>
  <cac:CreditNoteLine>
    <cbc:ID>1</cbc:ID>
    <cbc:CreditedQuantity>1</cbc:CreditedQuantity>
    <cbc:LineExtensionAmount>100.00</cbc:LineExtensionAmount>
    <cac:TaxTotal><cbc:TaxAmount>18.00</cbc:TaxAmount></cac:TaxTotal>
    <cac:Item><cbc:Description>Producto</cbc:Description></cac:Item>
    <cac:Price><cbc:PriceAmount>100.00</cbc:PriceAmount></cac:Price>
  </cac:CreditNoteLine>
</CreditNote>`;

console.log("\nNOTA DE CRÉDITO:");
const res4 = validarXml(notaCredito);
console.log(`  Válido: ${res4.valido ? "PASS" : "FAIL"}`);
console.log(`  Tipo: ${res4.tipoDocumento}`);
console.log(`  Errores: ${res4.errores.length}`);
if (res4.errores.length > 0) {
  for (const err of res4.errores) {
    console.log(`    [${err.codigo}] ${err.mensaje}`);
  }
}

// ── Nota de Crédito sin DiscrepancyResponse ──
const ncSinDiscrepancy = `<?xml version="1.0" encoding="UTF-8"?>
<CreditNote>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>F001-00000001</cbc:ID>
  <cbc:IssueDate>2024-03-15</cbc:IssueDate>
  <cbc:DocumentCurrencyCode>PEN</cbc:DocumentCurrencyCode>
  <cac:Signature><cbc:ID>SIG</cbc:ID></cac:Signature>
  <cac:AccountingSupplierParty>
    <cbc:CustomerAssignedAccountID>20123456789</cbc:CustomerAssignedAccountID>
    <cac:Party><cac:PartyLegalEntity><cbc:RegistrationName>EMPRESA</cbc:RegistrationName></cac:PartyLegalEntity></cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cbc:CustomerAssignedAccountID>20987654321</cbc:CustomerAssignedAccountID>
    <cbc:AdditionalAccountID>6</cbc:AdditionalAccountID>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal><cbc:TaxAmount>18.00</cbc:TaxAmount></cac:TaxTotal>
  <cac:LegalMonetaryTotal><cbc:PayableAmount>118.00</cbc:PayableAmount></cac:LegalMonetaryTotal>
  <cac:CreditNoteLine>
    <cbc:ID>1</cbc:ID>
    <cbc:CreditedQuantity>1</cbc:CreditedQuantity>
    <cbc:LineExtensionAmount>100.00</cbc:LineExtensionAmount>
    <cac:TaxTotal><cbc:TaxAmount>18.00</cbc:TaxAmount></cac:TaxTotal>
    <cac:Item><cbc:Description>Producto</cbc:Description></cac:Item>
    <cac:Price><cbc:PriceAmount>100.00</cbc:PriceAmount></cac:Price>
  </cac:CreditNoteLine>
</CreditNote>`;

console.log("\nNOTA DE CRÉDITO SIN DISCREPANCY NI BILLING REFERENCE:");
const res5 = validarXml(ncSinDiscrepancy);
console.log(`  Válido: ${res5.valido ? "PASS" : "FAIL (esperado)"}`);
for (const err of res5.errores) {
  console.log(`    [${err.codigo}] ${err.mensaje}`);
}

// ── XML sin tag raíz reconocido ──
console.log("\nXML SIN TAG RAIZ SUNAT:");
const res6 = validarXml(
  `<?xml version="1.0"?><DocumentoDesconocido></DocumentoDesconocido>`,
);
console.log(`  Valido: ${res6.valido ? "PASS" : "FAIL (esperado)"}`);
console.log(
  `  Error: [${res6.errores[0]?.codigo}] ${res6.errores[0]?.mensaje}`,
);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CATALOGOS SUNAT Y CALCULO DE IMPUESTOS
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n" + "=".repeat(70));
console.log("  PRUEBAS DE CATALOGOS SUNAT Y CALCULO DE IMPUESTOS");
console.log("=".repeat(70));

import {
  CATALOGO_05_TRIBUTOS,
  CATALOGO_06_DOCUMENTOS_IDENTIDAD,
  CATALOGO_07_AFECTACION_IGV,
  codigoTributoSchema,
  codigoAfectacionIGVSchema,
  codigoDocIdentidadSchema,
  validarDocumentoIdentidad,
  redondeoSunat,
  calcularImpuestoItem,
  obtenerCodigosUNECE,
  esGravado,
  esExonerado,
  esInafecto,
  esExportacion,
  esOperacionGratuita,
  UNECE_5153,
  UNECE_5305,
} from "./index.ts";

// ── Catalogo 05: Tributos ──
console.log("\nCATALOGO 05 - TRIBUTOS:");
for (const [codigo, tributo] of Object.entries(CATALOGO_05_TRIBUTOS)) {
  console.log(
    `  [${codigo}] ${tributo.nombre} - ${tributo.descripcion} (UN/ECE 5153: ${tributo.codigoUNECE_5153}, 5305: ${tributo.codigoUNECE_5305})`,
  );
}

console.log("\n  Validacion Zod esquemas tributos:");
const t1 = codigoTributoSchema.safeParse("1000");
console.log(`    IGV (1000): ${t1.success ? "PASS" : "FAIL"}`);
const t2 = codigoTributoSchema.safeParse("9999");
console.log(`    OTROS (9999): ${t2.success ? "PASS" : "FAIL"}`);
const t3 = codigoAfectacionIGVSchema.safeParse("10");
console.log(`    Afectación (10): ${t3.success ? "PASS" : "FAIL"}`);
const t4 = codigoDocIdentidadSchema.safeParse("6");
console.log(`    Doc Identidad (6): ${t4.success ? "PASS" : "FAIL"}`);

// ── Catalogo 06: Documentos de Identidad ──
console.log("\nCATALOGO 06 - DOCUMENTOS DE IDENTIDAD:");
for (const [codigo, doc] of Object.entries(CATALOGO_06_DOCUMENTOS_IDENTIDAD)) {
  console.log(
    `  [${codigo}] ${doc.descripcion}${doc.longitud ? ` (max: ${doc.longitud} chars)` : ""}`,
  );
}

console.log("\n  Validacion de documentos:");
const d1 = validarDocumentoIdentidad("1", "12345678");
console.log(
  `    DNI 12345678: ${d1.valido ? "PASS" : "FAIL"} ${d1.errores.join(", ")}`,
);
const d2 = validarDocumentoIdentidad("1", "123");
console.log(
  `    DNI 123: ${!d2.valido ? "PASS (rechazado)" : "FAIL"} - ${d2.errores.join(", ")}`,
);
const d3 = validarDocumentoIdentidad("6", "20123456789");
console.log(
  `    RUC 20123456789: ${d3.valido ? "PASS" : "FAIL"} ${d3.errores.join(", ")}`,
);
const d4 = validarDocumentoIdentidad("6", "99123456789");
console.log(
  `    RUC 99123456789: ${!d4.valido ? "PASS (rechazado)" : "FAIL"} - ${d4.errores.join(", ")}`,
);
const d5 = validarDocumentoIdentidad("7", "AB1234567890");
console.log(
  `    Pasaporte AB1234567890: ${d5.valido ? "PASS" : "FAIL"} ${d5.errores.join(", ")}`,
);
const d6 = validarDocumentoIdentidad("X", "123");
console.log(
  `    Tipo X (invalido): ${!d6.valido ? "PASS (rechazado)" : "FAIL"} - ${d6.errores.join(", ")}`,
);

// ── Catalogo 07: Afectacion IGV ──
console.log("\nCATALOGO 07 - AFECTACION IGV:");
for (const [codigo, aff] of Object.entries(CATALOGO_07_AFECTACION_IGV)) {
  console.log(
    `  [${codigo}] ${aff.descripcion} → tributo: ${aff.tributo}, gratuita: ${aff.gratuita}`,
  );
}

console.log("\n  Helpers de clasificacion:");
console.log(`    esGravado("10"):     ${esGravado("10") ? "PASS" : "FAIL"}`);
console.log(`    esGravado("20"):     ${!esGravado("20") ? "PASS" : "FAIL"}`);
console.log(`    esExonerado("20"):   ${esExonerado("20") ? "PASS" : "FAIL"}`);
console.log(`    esInafecto("30"):    ${esInafecto("30") ? "PASS" : "FAIL"}`);
console.log(
  `    esExportacion("40"): ${esExportacion("40") ? "PASS" : "FAIL"}`,
);
console.log(
  `    esOperacionGratuita("11"): ${esOperacionGratuita("11") ? "PASS" : "FAIL"}`,
);
console.log(
  `    esOperacionGratuita("10"): ${!esOperacionGratuita("10") ? "PASS" : "FAIL"}`,
);

// ── Codigos UN/ECE 5153 y 5305 ──
console.log("\nCODIGOS UN/ECE:");
console.log("  5153 (Duty/tax/fee type):");
for (const [cod, desc] of Object.entries(UNECE_5153)) {
  console.log(`    [${cod}] ${desc}`);
}
console.log("  5305 (Duty/tax/fee category):");
for (const [cod, desc] of Object.entries(UNECE_5305)) {
  console.log(`    [${cod}] ${desc}`);
}

console.log("\n  Mapeo afectacion → UN/ECE:");
const u1 = obtenerCodigosUNECE("10");
console.log(
  `    Gravado (10) → 5153: ${u1.codigoUNECE_5153}, 5305: ${u1.codigoUNECE_5305}, tributo: ${u1.nombreTributo}`,
);
const u2 = obtenerCodigosUNECE("20");
console.log(
  `    Exonerado (20) → 5153: ${u2.codigoUNECE_5153}, 5305: ${u2.codigoUNECE_5305}, tributo: ${u2.nombreTributo}`,
);
const u3 = obtenerCodigosUNECE("30");
console.log(
  `    Inafecto (30) → 5153: ${u3.codigoUNECE_5153}, 5305: ${u3.codigoUNECE_5305}, tributo: ${u3.nombreTributo}`,
);
const u4 = obtenerCodigosUNECE("40");
console.log(
  `    Exportacion (40) → 5153: ${u4.codigoUNECE_5153}, 5305: ${u4.codigoUNECE_5305}, tributo: ${u4.nombreTributo}`,
);

// ── Redondeo Bancario ──
console.log("\nREDONDEO BANCARIO SUNAT:");
const casosRedondeo = [
  { valor: 1.255, esperado: 1.26, nota: "1.255 → 1.26 (redondea al par)" },
  { valor: 1.245, esperado: 1.24, nota: "1.245 → 1.24 (redondea al par)" },
  { valor: 1.235, esperado: 1.24, nota: "1.235 → 1.24 (redondea al par)" },
  { valor: 1.225, esperado: 1.22, nota: "1.225 → 1.22 (redondea al par)" },
  {
    valor: 100.126,
    esperado: 100.13,
    nota: "100.126 → 100.13 (redondeo normal)",
  },
  {
    valor: 100.124,
    esperado: 100.12,
    nota: "100.124 → 100.12 (redondeo normal)",
  },
  { valor: 18.0, esperado: 18.0, nota: "18.00 → 18.00 (sin cambio)" },
];
for (const caso of casosRedondeo) {
  const resultado = redondeoSunat(caso.valor);
  const ok = resultado === caso.esperado;
  console.log(`  ${caso.nota}: ${ok ? "PASS" : `FAIL (obtuvo ${resultado})`}`);
}

// ── Calculo de Impuestos ──
console.log("\nCALCULO DE IMPUESTOS:");

// Caso 1: Producto gravado con IGV 18%
const calc1 = calcularImpuestoItem({
  cantidad: 10,
  valorUnitario: 100,
  codigoAfectacionIGV: "10",
});
console.log("  Caso 1: 10 x S/100.00 (Gravado IGV 18%)");
console.log(
  `    Valor venta: S/ ${calc1.valorVenta.toFixed(2)} ${calc1.valorVenta === 1000 ? "PASS" : "FAIL"}`,
);
console.log(
  `    IGV (18%):   S/ ${calc1.montoIGV.toFixed(2)} ${calc1.montoIGV === 180 ? "PASS" : "FAIL"}`,
);
console.log(
  `    Total:       S/ ${calc1.precioVenta.toFixed(2)} ${calc1.precioVenta === 1180 ? "PASS" : "FAIL"}`,
);
console.log(
  `    Gratuita:    ${calc1.esGratuita === false ? "PASS (no)" : "FAIL"}`,
);

// Caso 2: IVAP 4%
const calc2 = calcularImpuestoItem({
  cantidad: 50,
  valorUnitario: 2.5,
  codigoAfectacionIGV: "17",
});
console.log("\n  Caso 2: 50 x S/2.50 (IVAP 4%)");
console.log(
  `    Valor venta: S/ ${calc2.valorVenta.toFixed(2)} ${calc2.valorVenta === 125 ? "PASS" : "FAIL"}`,
);
console.log(
  `    IVAP (4%):   S/ ${calc2.montoIGV.toFixed(2)} ${calc2.montoIGV === 5 ? "PASS" : "FAIL"}`,
);
console.log(
  `    Tributo:     ${calc2.codigoTributo} ${calc2.codigoTributo === "1016" ? "PASS" : "FAIL"}`,
);

// Caso 3: Exonerado
const calc3 = calcularImpuestoItem({
  cantidad: 5,
  valorUnitario: 200,
  codigoAfectacionIGV: "20",
});
console.log("\n  Caso 3: 5 x S/200.00 (Exonerado)");
console.log(
  `    Valor venta: S/ ${calc3.valorVenta.toFixed(2)} ${calc3.valorVenta === 1000 ? "PASS" : "FAIL"}`,
);
console.log(
  `    IGV:         S/ ${calc3.montoIGV.toFixed(2)} ${calc3.montoIGV === 0 ? "PASS (0)" : "FAIL"}`,
);
console.log(
  `    Tributo:     ${calc3.codigoTributo} ${calc3.codigoTributo === "9997" ? "PASS" : "FAIL"}`,
);

// Caso 4: Con ICBPER (bolsas plastico)
const calc4 = calcularImpuestoItem({
  cantidad: 3,
  valorUnitario: 10,
  codigoAfectacionIGV: "10",
  cantidadBolsas: 3,
});
console.log("\n  Caso 4: 3 x S/10.00 + 3 bolsas ICBPER");
console.log(`    Valor venta: S/ ${calc4.valorVenta.toFixed(2)}`);
console.log(`    IGV:         S/ ${calc4.montoIGV.toFixed(2)}`);
console.log(
  `    ICBPER:      S/ ${calc4.montoICBPER.toFixed(2)} ${calc4.montoICBPER === 1.5 ? "PASS" : "FAIL"}`,
);
console.log(`    Total:       S/ ${calc4.importeTotal.toFixed(2)}`);

// Caso 5: Gratuito
const calc5 = calcularImpuestoItem({
  cantidad: 1,
  valorUnitario: 50,
  codigoAfectacionIGV: "11",
});
console.log("\n  Caso 5: 1 x S/50.00 (Retiro por premio - gravado gratuito)");
console.log(`    Es gratuita: ${calc5.esGratuita ? "PASS (si)" : "FAIL"}`);
console.log(
  `    Tributo:     ${calc5.codigoTributo} ${calc5.codigoTributo === "1000" ? "PASS" : "FAIL"}`,
);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. NUMERO A LETRAS
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n" + "=".repeat(70));
console.log("  PRUEBAS DE NUMERO A LETRAS");
console.log("=".repeat(70));

import { numeroALetras } from "./index.ts";

const casosLetras = [
  { monto: 0, esperado: "CERO CON 00/100 SOLES" },
  { monto: 1, esperado: "UN CON 00/100 SOL" },
  { monto: 10, esperado: "DIEZ CON 00/100 SOLES" },
  { monto: 15, esperado: "QUINCE CON 00/100 SOLES" },
  { monto: 21, esperado: "VEINTIUN CON 00/100 SOLES" },
  { monto: 42, esperado: "CUARENTA Y DOS CON 00/100 SOLES" },
  { monto: 100, esperado: "CIEN CON 00/100 SOLES" },
  { monto: 101, esperado: "CIENTO UN CON 00/100 SOLES" },
  { monto: 236, esperado: "DOSCIENTOS TREINTA Y SEIS CON 00/100 SOLES" },
  { monto: 500, esperado: "QUINIENTOS CON 00/100 SOLES" },
  { monto: 999, esperado: "NOVECIENTOS NOVENTA Y NUEVE CON 00/100 SOLES" },
  { monto: 1000, esperado: "MIL CON 00/100 SOLES" },
  { monto: 1001, esperado: "MIL UN CON 00/100 SOLES" },
  { monto: 1180.5, esperado: "MIL CIENTO OCHENTA CON 50/100 SOLES" },
  { monto: 2500.75, esperado: "DOS MIL QUINIENTOS CON 75/100 SOLES" },
  { monto: 10000, esperado: "DIEZ MIL CON 00/100 SOLES" },
  { monto: 15600.99, esperado: "QUINCE MIL SEISCIENTOS CON 99/100 SOLES" },
  { monto: 100000, esperado: "CIEN MIL CON 00/100 SOLES" },
  { monto: 1000000, esperado: "UN MILLON CON 00/100 SOLES" },
  { monto: 2500000, esperado: "DOS MILLONES QUINIENTOS MIL CON 00/100 SOLES" },
];

console.log("\nConversion SOLES (PEN):");
for (const caso of casosLetras) {
  const resultado = numeroALetras(caso.monto);
  const ok = resultado === caso.esperado;
  console.log(`  ${caso.monto.toFixed(2)} → ${resultado}`);
  if (!ok) {
    console.log(`    FAIL - Esperado: ${caso.esperado}`);
  }
}

console.log("\nConversion DOLARES (USD):");
const usd1 = numeroALetras(1500.99, { moneda: "USD" });
console.log(`  1500.99 → ${usd1}`);
const usd2 = numeroALetras(1, { moneda: "USD" });
console.log(`  1.00 → ${usd2}`);

console.log("\nConversion EUROS (EUR):");
const eur1 = numeroALetras(3200, { moneda: "EUR" });
console.log(`  3200.00 → ${eur1}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. TIPO DE CAMBIO
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n" + "=".repeat(70));
console.log("  PRUEBAS DE TIPO DE CAMBIO (PEN / USD)");
console.log("=".repeat(70));

import { solesADolares, dolaresASoles } from "./index.ts";

const tc = 3.80;
const soles = 1000;
const dolares = 500;

console.log(`\nTipo de Cambio: S/ ${tc.toFixed(2)} por Dólar`);

const aDolares = solesADolares(soles, { tipoCambio: tc });
console.log(`\nSoles a Dólares:`);
console.log(`  S/ ${soles.toFixed(2)} → $ ${aDolares.toFixed(2)}`);
console.log(`  S/ 118.00 → $ ${solesADolares(118, { tipoCambio: tc }).toFixed(2)} (redondeado)`);

const aSoles = dolaresASoles(dolares, { tipoCambio: tc });
console.log(`\nDólares a Soles:`);
console.log(`  $ ${dolares.toFixed(2)} → S/ ${aSoles.toFixed(2)}`);
console.log(`  $ 99.99 → S/ ${dolaresASoles(99.99, { tipoCambio: tc }).toFixed(2)}`);


console.log("\n" + "=".repeat(70));
console.log("  PRUEBAS COMPLETADAS");
console.log("=".repeat(70));
