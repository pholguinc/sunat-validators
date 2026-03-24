<div align="center">

# @pholguinc/sunat-validators

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zod](https://img.shields.io/badge/Zod-4.x-3E67B1?logo=zod&logoColor=white)](https://zod.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![SUNAT](https://img.shields.io/badge/SUNAT-Peru-D91E18)](https://www.sunat.gob.pe/)
[![UBL 2.1](https://img.shields.io/badge/UBL-2.1-00A499)](http://www.oasis-open.org/committees/ubl/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Librería completa de validadores para facturación electrónica SUNAT Perú usando [Zod](https://zod.dev). Incluye validación de RUC/DNI, nombres de archivo, estructura XML UBL 2.1, catálogos tributarios y cálculo de impuestos.

</div>

---

## Instalación

```bash
npm install @pholguinc/sunat-validators zod
# o
bun add @pholguinc/sunat-validators zod
```

> `zod` es una peer dependency — debes instalarlo junto al paquete.

---

## Características

| Módulo | Descripción |
|---|---|
| **RUC / DNI** | Validación con dígito verificador oficial SUNAT |
| **Nombre de archivo** | Parseo y validación de nombres ZIP/XML según convención SUNAT |
| **Estructura XML** | Validador UBL 2.1 con +800 códigos de error oficiales |
| **Catálogo 05** | Tributos: IGV, IVAP, ISC, ICBPER, Exportación, Exonerado, Inafecto |
| **Catálogo 06** | 11 tipos de documentos de identidad soportados |
| **Catálogo 07** | Afectación IGV: todos los códigos (10–40) |
| **Cálculo impuestos** | IGV (18%), IVAP (4%), ISC, ICBPER (S/ 0.50) con redondeo bancario |
| **UN/ECE** | Códigos 5153 (tipo tributo) y 5305 (categoría tributo) |
| **Números a letras** | Función oficial de monto a texto con soporte PEN, USD, EUR |
| **Tipo de cambio** | Conversión USD ↔ PEN aplicando redondeo oficial SUNAT |

---

## Uso

### Validar RUC

```ts
import { rucSchema } from "@pholguinc/sunat-validators";

const ruc = rucSchema.parse("20100070970");

const result = rucSchema.safeParse("99999999999");
if (!result.success) {
  console.error(result.error.issues[0].message);
}
```

### Validar nombre de archivo SUNAT

```ts
import {
  parsearNombreArchivo,
  nombreArchivoXmlSchema,
  nombreArchivoZipSchema,
} from "@pholguinc/sunat-validators";

// Parsear y validar
const info = parsearNombreArchivo("20123456789-01-F001-00000001.xml");
// → { tipo: "cpe", ruc: "20123456789", tipoDocumento: "01", serie: "F001", ... }

// Con Zod schema
const result = nombreArchivoXmlSchema.safeParse("20123456789-01-F001-00000001.xml");
```

### Validar estructura XML (UBL 2.1)

```ts
import { validarXml } from "@pholguinc/sunat-validators";

const xmlString = fs.readFileSync("factura.xml", "utf-8");
const resultado = validarXml(xmlString);

if (!resultado.valido) {
  for (const error of resultado.errores) {
    console.log(`[${error.codigo}] ${error.mensaje}`);
    // → [2075] El XML no contiene el tag UBLVersionID
  }
}
```

### Catálogos SUNAT

```ts
import {
  CATALOGO_05_TRIBUTOS,
  CATALOGO_06_DOCUMENTOS_IDENTIDAD,
  CATALOGO_07_AFECTACION_IGV,
  codigoTributoSchema,
  codigoAfectacionIGVSchema,
  validarDocumentoIdentidad,
} from "@pholguinc/sunat-validators";

// Validar tipo de tributo
codigoTributoSchema.parse("1000"); // IGV

// Validar documento de identidad
const res = validarDocumentoIdentidad("1", "12345678"); // DNI
// → { valido: true, errores: [] }

// Consultar catálogo
const igv = CATALOGO_05_TRIBUTOS["1000"];
// → { nombre: "IGV", tasa: 0.18, codigoUNECE_5153: "VAT", codigoUNECE_5305: "S" }
```

### Cálculo de impuestos

```ts
import {
  calcularImpuestoItem,
  redondeoSunat,
  obtenerCodigosUNECE,
} from "@pholguinc/sunat-validators";

// Calcular IGV de un ítem
const resultado = calcularImpuestoItem({
  cantidad: 10,
  valorUnitario: 100,
  codigoAfectacionIGV: "10", // Gravado
});
// → { valorVenta: 1000, montoIGV: 180, precioVenta: 1180, ... }

// IVAP (arroz pilado)
const arroz = calcularImpuestoItem({
  cantidad: 50,
  valorUnitario: 2.50,
  codigoAfectacionIGV: "17", // IVAP 4%
});

// Con ICBPER (bolsas de plástico)
const conBolsas = calcularImpuestoItem({
  cantidad: 3,
  valorUnitario: 10,
  codigoAfectacionIGV: "10",
  cantidadBolsas: 3, // S/ 0.50 por bolsa
});

// Redondeo bancario SUNAT
redondeoSunat(1.255); // → 1.26
redondeoSunat(1.245); // → 1.24

// Obtener códigos UN/ECE
const unece = obtenerCodigosUNECE("10");
// → { codigoUNECE_5153: "VAT", codigoUNECE_5305: "S", nombreTributo: "IGV" }
```

### Números a Letras

Convierte importes a su representación legal requerida por SUNAT (incluye decimales como `XX/100`).

```ts
import { numeroALetras } from "@pholguinc/sunat-validators";

numeroALetras(236);
// → "DOSCIENTOS TREINTA Y SEIS CON 00/100 SOLES"

numeroALetras(1180.50);
// → "MIL CIENTO OCHENTA CON 50/100 SOLES"

// Soporte para otras monedas (USD, EUR)
numeroALetras(1500.99, { moneda: "USD" });
// → "MIL QUINIENTOS CON 99/100 DOLARES AMERICANOS"
```

### Tipo de Cambio

Convierte montos de Soles a Dólares y viceversa, usando el tipo de cambio oficial de SUNAT y su redondeo estricto.

```ts
import { solesADolares, dolaresASoles } from "@pholguinc/sunat-validators";

const tipoCambio = 3.80; // Ej: TC Venta SUNAT

solesADolares(1000, { tipoCambio });
// → 263.16

dolaresASoles(500, { tipoCambio });
// → 1900.00
```

### Helpers de clasificación

```ts
import {
  esGravado,
  esExonerado,
  esInafecto,
  esExportacion,
  esOperacionGratuita,
} from "@pholguinc/sunat-validators";

esGravado("10");           // true
esExonerado("20");         // true
esInafecto("30");          // true
esExportacion("40");       // true
esOperacionGratuita("11"); // true (retiro por premio)
esOperacionGratuita("10"); // false (operación onerosa)
```

---

## Tipos TypeScript

```ts
import type {
  Ruc,
  Dni,
  Linea,
  NombreArchivoParseado,
  ErrorValidacionXml,
  CodigoErrorSunat,
  CodigoTributo,
  CodigoAfectacionIGV,
  CodigoDocIdentidad,
  CodigoUNECE5153,
  CodigoUNECE5305,
  ResultadoCalculoImpuesto,
  OpcionesCalculoItem,
} from "@pholguinc/sunat-validators";
```

---

## Validaciones del RUC

| Regla | Detalle |
|---|---|
| Longitud | Exactamente 11 dígitos numéricos |
| Prefijo | `10` (persona natural) · `20` (persona jurídica) |
| Dígito verificador | Algoritmo oficial SUNAT |

---

## Catálogo 05 — Tributos

| Código | Nombre | Tasa | UN/ECE 5153 | UN/ECE 5305 |
|---|---|---|---|---|
| 1000 | IGV | 18% | VAT | S |
| 1016 | IVAP | 4% | VAT | S |
| 2000 | ISC | Variable | EXC | S |
| 7152 | ICBPER | S/ 0.50/bolsa | OTH | S |
| 9995 | Exportación | 0% | FRE | G |
| 9996 | Gratuito | 0% | FRE | Z |
| 9997 | Exonerado | 0% | VAT | E |
| 9998 | Inafecto | 0% | FRE | O |
| 9999 | Otros | Variable | OTH | S |

---

## Catálogo 06 — Documentos de Identidad

| Código | Tipo | Longitud |
|---|---|---|
| 0 | Doc. Trib. No Domiciliado sin RUC | — |
| 1 | DNI | 8 |
| 4 | Carnet de Extranjería | 12 |
| 6 | RUC | 11 |
| 7 | Pasaporte | 12 |
| A | Cédula Diplomática | 15 |
| B | Doc. Identidad País Residencia | 15 |
| C | TIN (PP.NN.) | 15 |
| D | IN (PP.JJ.) | 15 |
| E | TAM | 15 |
| - | Varios (Boletas < S/700) | — |

---

## Ejecutar pruebas

```bash
bun run src/test-validators.ts
```

---

## Changelog

### v0.1.0 (2026-03-24)

**Lanzamiento inicial** con validación completa para facturación electrónica SUNAT.

#### Módulos incluidos

- **error-codes.ts** — +800 códigos de error oficiales SUNAT (100–4112)
- **filename-validator.ts** — Validación de nombres ZIP/XML según convención SUNAT
  - Soporte para CPE (01, 03, 07, 08, 09, 20, 40), Resúmenes (RC) y Bajas (RA)
  - Validación de prefijos de serie por tipo de documento
  - Zod schemas: `nombreArchivoXmlSchema`, `nombreArchivoZipSchema`
  - Funciones: `parsearNombreArchivo`, `validarCoincidenciaNombres`, `validarRucEnNombre`
- **xml-validator.ts** — Validador de estructura XML UBL 2.1
  - Validación de: UBLVersionID, CustomizationID, IssueDate, DocumentCurrencyCode
  - Emisor/Receptor: CustomerAssignedAccountID, RegistrationName, AdditionalAccountID
  - Firma digital, TaxTotal, LegalMonetaryTotal, líneas de detalle
  - Soporte para: Facturas, Boletas, Notas de Crédito/Débito, Guías de Remisión
  - Mensajes de error desde catálogo centralizado CODIGOS_ERROR_SUNAT
- **catalogos-sunat.ts** — Catálogos tributarios completos
  - Catálogo 05: 9 tributos (IGV, IVAP, ISC, ICBPER, EXP, GRA, EXO, INA, OTROS)
  - Catálogo 06: 11 tipos de documentos de identidad con validación por tipo
  - Catálogo 07: 19 códigos de afectación IGV (gravado, exonerado, inafecto, exportación)
  - Códigos UN/ECE 5153 y 5305 mapeados a cada tributo
  - Cálculo de impuestos con redondeo bancario (half-even)
  - Funciones helper: `esGravado`, `esExonerado`, `esInafecto`, `esExportacion`, `esOperacionGratuita`
- **numero-a-letras.ts** — Conversión de importes a texto
  - Función `numeroALetras(monto, opciones)` para conversión SUNAT (ej. "CIEN CON 00/100 SOLES")
  - Soporte hasta billones y múltiples monedas (PEN, USD, EUR)
- **tipo-cambio.ts** — Conversión de monedas 
  - Funciones `solesADolares(monto, { tipoCambio })` y `dolaresASoles`
  - Incluye redondeo estricto SUNAT a 2 decimales
- **index.ts** — Barrel file principal

#### Dependencias

- `zod` >= 3.0.0 (peer dependency)
- `fast-xml-parser` ^5.5.9

---

## Licencia

MIT
