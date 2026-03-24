import { XMLParser } from "fast-xml-parser";
import { CODIGOS_ERROR_SUNAT } from "./error-codes.ts";

// ─── Configuración del parser XML ────────────────────────────────────────────

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
  isArray: (_name, jpath, _isLeafNode, _isAttribute) => {
    const arrayPaths = [
      "Invoice.InvoiceLine",
      "CreditNote.CreditNoteLine",
      "DebitNote.DebitNoteLine",
      "Invoice.TaxTotal",
      "Invoice.TaxTotal.TaxSubtotal",
      "CreditNote.TaxTotal",
      "DebitNote.TaxTotal",
      "Invoice.AllowanceCharge",
      "Invoice.AdditionalDocumentReference",
      "DespatchAdvice.DespatchLine",
    ];
    return arrayPaths.includes(String(jpath));
  },
});

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ErrorValidacionXml {
  codigo: number;
  mensaje: string;
  tag?: string;
}

interface ResultadoValidacionXml {
  valido: boolean;
  tipoDocumento: string | null;
  errores: ErrorValidacionXml[];
  advertencias: ErrorValidacionXml[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function obtenerValor(obj: unknown, path: string): unknown {
  const partes = path.split(".");
  let actual: unknown = obj;
  for (const parte of partes) {
    if (actual == null || typeof actual !== "object") return undefined;
    actual = (actual as Record<string, unknown>)[parte];
  }
  return actual;
}

/**
 * Obtiene el mensaje del catálogo CODIGOS_ERROR_SUNAT por código.
 * Si no existe, retorna un mensaje genérico.
 */
function msg(codigo: number): string {
  return (CODIGOS_ERROR_SUNAT as Record<number, string>)[codigo]
    ?? `Error SUNAT código ${codigo}`;
}

function agregarError(
  lista: ErrorValidacionXml[],
  codigo: number,
  tag?: string
): void {
  lista.push({ codigo, mensaje: msg(codigo), tag });
}

// ─── Validaciones comunes ────────────────────────────────────────────────────

function validarTagsComunes(
  doc: Record<string, unknown>,
  root: string,
  errores: ErrorValidacionXml[],
  advertencias: ErrorValidacionXml[]
): void {
  // UBLVersionID (2074, 2075)
  const ublVersion = obtenerValor(doc, `${root}.UBLVersionID`);
  if (!ublVersion) {
    agregarError(errores, 2075, "UBLVersionID");
  } else if (String(ublVersion) !== "2.1" && String(ublVersion) !== "2.0" && String(ublVersion) !== "2") {
    agregarError(errores, 2074, "UBLVersionID");
  }

  // CustomizationID (2072, 2073)
  const customization = obtenerValor(doc, `${root}.CustomizationID`);
  if (!customization) {
    agregarError(errores, 2073, "CustomizationID");
  } else if (String(customization) !== "2.0" && String(customization) !== "1.0" && String(customization) !== "2" && String(customization) !== "1") {
    agregarError(errores, 2072, "CustomizationID");
  }

  // IssueDate (1009, 1010, 1011)
  const issueDate = obtenerValor(doc, `${root}.IssueDate`);
  if (!issueDate) {
    agregarError(errores, 1010, "IssueDate");
  } else if (typeof issueDate === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
    agregarError(errores, 1009, "IssueDate");
  } else if (typeof issueDate === "string" && isNaN(Date.parse(issueDate))) {
    agregarError(errores, 1011, "IssueDate");
  }

  // DocumentCurrencyCode (2069, 2070)
  const currency = obtenerValor(doc, `${root}.DocumentCurrencyCode`);
  if (!currency) {
    agregarError(errores, 2070, "DocumentCurrencyCode");
  } else if (typeof currency === "string" && !/^[A-Z]{3}$/.test(currency)) {
    agregarError(errores, 2069, "DocumentCurrencyCode");
  }

  // ID (1001, 1002)
  const id = obtenerValor(doc, `${root}.ID`);
  if (!id) {
    agregarError(errores, 1002, "ID");
  } else if (typeof id === "string" && !/^[A-Z0-9]{4}-\d{1,8}$/.test(id)) {
    agregarError(errores, 1001, "ID");
  }

  // Emisor - AccountingSupplierParty
  const emisorRuc = obtenerValor(doc, `${root}.AccountingSupplierParty.CustomerAssignedAccountID`)
    ?? obtenerValor(doc, `${root}.AccountingSupplierParty.Party.PartyIdentification.ID`);
  if (!emisorRuc) {
    agregarError(errores, 1006, "AccountingSupplierParty");
  } else if (typeof emisorRuc === "string" && !/^\d{11}$/.test(emisorRuc)) {
    agregarError(errores, 1005, "CustomerAssignedAccountID");
  }

  const emisorNombre = obtenerValor(doc, `${root}.AccountingSupplierParty.Party.PartyLegalEntity.RegistrationName`)
    ?? obtenerValor(doc, `${root}.AccountingSupplierParty.Party.PartyName.Name`);
  if (!emisorNombre) {
    agregarError(errores, 1037, "RegistrationName");
  }

  // Receptor - AccountingCustomerParty
  const receptorId = obtenerValor(doc, `${root}.AccountingCustomerParty.CustomerAssignedAccountID`)
    ?? obtenerValor(doc, `${root}.AccountingCustomerParty.Party.PartyIdentification.ID`);
  if (!receptorId) {
    agregarError(errores, 2014, "AccountingCustomerParty");
  }

  const receptorTipoDoc = obtenerValor(doc, `${root}.AccountingCustomerParty.AdditionalAccountID`)
    ?? obtenerValor(doc, `${root}.AccountingCustomerParty.Party.PartyIdentification.ID.@_schemeID`);
  if (!receptorTipoDoc) {
    agregarError(errores, 2015, "AdditionalAccountID");
  }

  const receptorNombre = obtenerValor(doc, `${root}.AccountingCustomerParty.Party.PartyLegalEntity.RegistrationName`)
    ?? obtenerValor(doc, `${root}.AccountingCustomerParty.Party.PartyName.Name`);
  if (!receptorNombre) {
    agregarError(advertencias, 2021, "RegistrationName");
  }

  // Firma digital (2076, 1059)
  const signature = obtenerValor(doc, `${root}.Signature`);
  if (!signature) {
    agregarError(errores, 1059, "Signature");
  } else {
    const sigId = obtenerValor(doc, `${root}.Signature.ID`);
    if (!sigId) {
      agregarError(errores, 2076, "Signature.ID");
    }
  }

  // UBLExtensions - firma digital XML
  const extensions = obtenerValor(doc, `${root}.UBLExtensions`);
  if (!extensions) {
    agregarError(advertencias, 2085, "UBLExtensions");
  }
}

// ─── Validación de líneas de detalle ─────────────────────────────────────────

function validarLineasDetalle(
  lineas: unknown,
  tipoLinea: string,
  errores: ErrorValidacionXml[],
  advertencias: ErrorValidacionXml[]
): void {
  if (!lineas || !Array.isArray(lineas) || lineas.length === 0) {
    agregarError(errores, 2024, tipoLinea);
    return;
  }

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i] as Record<string, unknown>;
    const lineaNum = i + 1;
    const prefix = `${tipoLinea}[${lineaNum}]`;

    // ID del ítem
    const lineaId = linea["ID"];
    if (!lineaId) {
      agregarError(errores, 2023, `${prefix}.ID`);
    }

    // Cantidad
    const cantidad = tipoLinea === "InvoiceLine"
      ? linea["InvoicedQuantity"]
      : tipoLinea === "CreditNoteLine"
        ? linea["CreditedQuantity"]
        : linea["DebitedQuantity"];

    if (cantidad == null) {
      agregarError(errores, 2024, `${prefix}.Quantity`);
    }

    // Descripción
    const descripcion = obtenerValor(linea, "Item.Description")
      ?? obtenerValor(linea, "Item.Name");
    if (!descripcion) {
      agregarError(errores, 2026, `${prefix}.Item.Description`);
    }

    // Precio unitario
    const precio = obtenerValor(linea, "Price.PriceAmount");
    if (precio == null) {
      agregarError(errores, 2068, `${prefix}.Price.PriceAmount`);
    }

    // LineExtensionAmount
    const lineExtAmount = linea["LineExtensionAmount"];
    if (lineExtAmount == null) {
      agregarError(errores, 2032, `${prefix}.LineExtensionAmount`);
    }

    // TaxTotal del ítem
    const taxTotal = linea["TaxTotal"];
    if (!taxTotal) {
      agregarError(errores, 2034, `${prefix}.TaxTotal`);
    } else {
      const taxAmount = obtenerValor(taxTotal, "TaxAmount");
      if (taxAmount == null) {
        agregarError(errores, 2033, `${prefix}.TaxTotal.TaxAmount`);
      }

      // TaxScheme
      const taxSchemeId = obtenerValor(taxTotal, "TaxSubtotal.TaxCategory.TaxScheme.ID")
        ?? obtenerValor(taxTotal, "0.TaxSubtotal.TaxCategory.TaxScheme.ID");
      if (!taxSchemeId) {
        agregarError(advertencias, 2037, `${prefix}.TaxScheme.ID`);
      }
    }
  }
}

// ─── Validación de totales ───────────────────────────────────────────────────

function validarTotales(
  doc: Record<string, unknown>,
  root: string,
  totalPath: string,
  errores: ErrorValidacionXml[],
  _advertencias: ErrorValidacionXml[]
): void {
  // PayableAmount
  const payableAmount = obtenerValor(doc, `${root}.${totalPath}.PayableAmount`);
  if (payableAmount == null) {
    agregarError(errores, 2063, `${totalPath}.PayableAmount`);
  }

  // TaxTotal global
  const taxTotal = obtenerValor(doc, `${root}.TaxTotal`);
  if (!taxTotal) {
    agregarError(errores, 2049, "TaxTotal");
  } else {
    const globalTaxAmount = Array.isArray(taxTotal)
      ? obtenerValor(taxTotal[0], "TaxAmount")
      : obtenerValor(taxTotal as Record<string, unknown>, "TaxAmount");
    if (globalTaxAmount == null) {
      agregarError(errores, 2048, "TaxTotal.TaxAmount");
    }
  }
}

// ─── Validador principal ─────────────────────────────────────────────────────

export function validarXml(xmlContent: string): ResultadoValidacionXml {
  const errores: ErrorValidacionXml[] = [];
  const advertencias: ErrorValidacionXml[] = [];

  // Parsear XML
  let doc: Record<string, unknown>;
  try {
    doc = xmlParser.parse(xmlContent) as Record<string, unknown>;
  } catch {
    return {
      valido: false,
      tipoDocumento: null,
      errores: [{ codigo: 306, mensaje: msg(306) }],
      advertencias: [],
    };
  }

  if (!doc || typeof doc !== "object") {
    return {
      valido: false,
      tipoDocumento: null,
      errores: [{ codigo: 300, mensaje: msg(300) }],
      advertencias: [],
    };
  }

  // Detectar tipo de documento por el tag raíz
  let root: string;
  let tipoDocumento: string;
  let totalPath: string;
  let lineTag: string;

  if ("Invoice" in doc) {
    root = "Invoice";
    tipoDocumento = "Factura/Boleta";
    totalPath = "LegalMonetaryTotal";
    lineTag = "InvoiceLine";
  } else if ("CreditNote" in doc) {
    root = "CreditNote";
    tipoDocumento = "Nota de Crédito";
    totalPath = "LegalMonetaryTotal";
    lineTag = "CreditNoteLine";
  } else if ("DebitNote" in doc) {
    root = "DebitNote";
    tipoDocumento = "Nota de Débito";
    totalPath = "RequestedMonetaryTotal";
    lineTag = "DebitNoteLine";
  } else if ("DespatchAdvice" in doc) {
    root = "DespatchAdvice";
    tipoDocumento = "Guía de Remisión";
    totalPath = "";
    lineTag = "DespatchLine";
  } else {
    return {
      valido: false,
      tipoDocumento: null,
      errores: [{ codigo: 301, mensaje: msg(301) }],
      advertencias: [],
    };
  }

  const docRoot = doc[root] as Record<string, unknown>;

  // Validar tags comunes (aplica a todos menos guía)
  if (root !== "DespatchAdvice") {
    validarTagsComunes(doc, root, errores, advertencias);
    validarLineasDetalle(
      docRoot[lineTag] as unknown,
      lineTag,
      errores,
      advertencias
    );
    validarTotales(doc, root, totalPath, errores, advertencias);
  }

  // Validaciones específicas por tipo
  if (root === "CreditNote" || root === "DebitNote") {
    validarNotaCredDeb(docRoot, root, errores);
  }

  if (root === "DespatchAdvice") {
    validarGuiaRemision(docRoot, errores, advertencias);
  }

  return {
    valido: errores.length === 0,
    tipoDocumento,
    errores,
    advertencias,
  };
}

// ─── Validaciones específicas Nota de Crédito / Débito ───────────────────────

function validarNotaCredDeb(
  doc: Record<string, unknown>,
  root: string,
  errores: ErrorValidacionXml[]
): void {
  // DiscrepancyResponse
  const discrepancy = doc["DiscrepancyResponse"];
  if (!discrepancy) {
    agregarError(errores, 2414, "DiscrepancyResponse");
  } else {
    const responseCode = obtenerValor(discrepancy, "ResponseCode");
    if (!responseCode) {
      agregarError(errores, root === "CreditNote" ? 2128 : 2173, "ResponseCode");
    }
    const description = obtenerValor(discrepancy, "Description");
    if (!description) {
      agregarError(errores, root === "CreditNote" ? 2136 : 2175, "Description");
    }
  }

  // BillingReference (documento afectado)
  const billingRef = doc["BillingReference"];
  if (!billingRef) {
    agregarError(errores, root === "CreditNote" ? 2118 : 2206, "BillingReference");
  } else {
    const refId = obtenerValor(billingRef, "InvoiceDocumentReference.ID");
    if (!refId) {
      agregarError(errores, root === "CreditNote" ? 2126 : 2171, "ReferenceID");
    }
  }
}

// ─── Validaciones específicas Guía de Remisión ──────────────────────────────

function validarGuiaRemision(
  doc: Record<string, unknown>,
  errores: ErrorValidacionXml[],
  advertencias: ErrorValidacionXml[]
): void {
  // ID
  const id = doc["ID"];
  if (!id) {
    agregarError(errores, 1002, "ID");
  }

  // DespatchAdviceTypeCode
  const typeCode = doc["DespatchAdviceTypeCode"];
  if (!typeCode) {
    agregarError(errores, 1050, "DespatchAdviceTypeCode");
  } else if (typeCode !== "09" && typeCode !== "31") {
    agregarError(errores, 1051, "DespatchAdviceTypeCode");
  }

  // Shipment
  const shipment = doc["Shipment"] as Record<string, unknown> | undefined;
  if (!shipment) {
    agregarError(errores, 1062, "Shipment");
    return;
  }

  // HandlingCode (motivo de traslado)
  const handlingCode = shipment["HandlingCode"];
  if (!handlingCode) {
    agregarError(errores, 1062, "HandlingCode");
  }

  // TransportModeCode
  const transportMode = obtenerValor(shipment, "ShipmentStage.TransportModeCode");
  if (!transportMode) {
    agregarError(errores, 1065, "TransportModeCode");
  }

  // Fecha de inicio de traslado
  const startDate = obtenerValor(shipment, "ShipmentStage.TransitPeriod.StartDate");
  if (!startDate) {
    agregarError(errores, 1069, "StartDate");
  } else if (typeof startDate === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    agregarError(errores, 1070, "StartDate");
  }

  // Punto de llegada
  const llegada = obtenerValor(shipment, "Delivery.DeliveryAddress")
    ?? obtenerValor(shipment, "Delivery.DeliveryLocation.Address");
  if (!llegada) {
    agregarError(advertencias, 1074, "Delivery.DeliveryAddress");
  }

  // Punto de partida
  const partida = obtenerValor(shipment, "Despatch.DespatchAddress")
    ?? obtenerValor(shipment, "OriginAddress");
  if (!partida) {
    agregarError(advertencias, 1075, "Despatch.DespatchAddress");
  }

  // Líneas de detalle
  const lineas = doc["DespatchLine"];
  if (!lineas) {
    agregarError(errores, 1064, "DespatchLine");
  }
}
