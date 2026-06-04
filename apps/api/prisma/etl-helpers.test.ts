import { describe, it, expect } from "vitest";
import {
  parseIsoDate, parseMixedDate,
  isRead, normalizeKind,
  parseAmount, normalizeRefundStatus,
} from "./etl-helpers";

// ── parseIsoDate ─────────────────────────────────────────────────────────────
describe("parseIsoDate", () => {
  it("parsea fecha ISO válida", () => {
    const d = parseIsoDate("2025-01-15");
    expect(d).toBeInstanceOf(Date);
    expect(d!.toISOString()).toContain("2025-01-15");
  });
  it("retorna null para string vacío", () => { expect(parseIsoDate("")).toBeNull(); });
  it("retorna null para null / undefined", () => {
    expect(parseIsoDate(null)).toBeNull();
    expect(parseIsoDate(undefined)).toBeNull();
  });
  it("retorna null para string inválido", () => { expect(parseIsoDate("no-es-fecha")).toBeNull(); });
});

// ── parseMixedDate ────────────────────────────────────────────────────────────
describe("parseMixedDate", () => {
  it("parsea formato ISO 'YYYY-MM-DD'", () => {
    const d = parseMixedDate("2025-04-04");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getFullYear()).toBe(2025);
  });
  it("parsea formato 'DD/MM/YYYY'", () => {
    const d = parseMixedDate("02/02/2025");
    expect(d!.getUTCFullYear()).toBe(2025);
    expect(d!.getUTCMonth()).toBe(1);
    expect(d!.getUTCDate()).toBe(2);
  });
  it("parsea epoch unix en segundos", () => {
    const d = parseMixedDate("1735862400");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getFullYear()).toBe(2025);
  });
  it("parsea datetime 'YYYY-MM-DD HH:MM:SS'", () => {
    const d = parseMixedDate("2025-04-04 09:30:00");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getUTCFullYear()).toBe(2025);
  });
  it("retorna null para vacío / null", () => {
    expect(parseMixedDate("")).toBeNull();
    expect(parseMixedDate(null)).toBeNull();
  });
});

// ── isRead ───────────────────────────────────────────────────────────────────
describe("isRead", () => {
  it.each([["read", true], ["READ", true], ["leido", true]])("'%s' → true", (l, e) => {
    expect(isRead(l)).toBe(e);
  });
  it("'unread' → false", () => { expect(isRead("unread")).toBe(false); });
  it("null/vacío → true", () => {
    expect(isRead(null)).toBe(true);
    expect(isRead("")).toBe(true);
  });
});

// ── normalizeKind ─────────────────────────────────────────────────────────────
describe("normalizeKind", () => {
  it.each(["info", "warn", "alert", "system", "marketing"])("conserva '%s'", (k) => {
    expect(normalizeKind(k)).toBe(k);
  });
  it("normaliza a minúsculas", () => { expect(normalizeKind("WARN")).toBe("warn"); });
  it("desconocido → 'info'", () => {
    expect(normalizeKind("desconocido")).toBe("info");
    expect(normalizeKind(null)).toBe("info");
  });
});

// ── parseAmount ───────────────────────────────────────────────────────────────
describe("parseAmount", () => {
  it("parsea string numérico", () => { expect(parseAmount("3335.5")).toBe(3335.5); });
  it("parsea número entero como string", () => { expect(parseAmount("1000.0")).toBe(1000); });
  it("acepta coma decimal", () => { expect(parseAmount("1.234,56")).toBeNull(); }); // no soportado → null
  it("retorna null para null/vacío", () => {
    expect(parseAmount(null)).toBeNull();
    expect(parseAmount("")).toBeNull();
    expect(parseAmount(undefined)).toBeNull();
  });
  it("retorna null para texto no numérico", () => { expect(parseAmount("no-es-numero")).toBeNull(); });
});

// ── normalizeRefundStatus ─────────────────────────────────────────────────────
describe("normalizeRefundStatus", () => {
  it.each([
    ["Approved", "approved"], ["aprobada", "approved"],
    ["done", "done"],
    ["pending", "pending"], ["Pending", "pending"], ["pendiente", "pending"],
    ["rejected", "rejected"],
  ])("'%s' → '%s'", (input, expected) => {
    expect(normalizeRefundStatus(input)).toBe(expected);
  });
  it("valor desconocido → 'pending'", () => {
    expect(normalizeRefundStatus("otro")).toBe("pending");
    expect(normalizeRefundStatus(null)).toBe("pending");
  });
});
