import { describe, it, expect } from "vitest";
import { parseIsoDate, parseMixedDate, isRead, normalizeKind } from "./etl-helpers";

// ── parseIsoDate ─────────────────────────────────────────────────────────────
describe("parseIsoDate", () => {
  it("parsea fecha ISO válida", () => {
    const d = parseIsoDate("2025-01-15");
    expect(d).toBeInstanceOf(Date);
    expect(d!.toISOString()).toContain("2025-01-15");
  });

  it("retorna null para string vacío", () => {
    expect(parseIsoDate("")).toBeNull();
  });

  it("retorna null para null / undefined", () => {
    expect(parseIsoDate(null)).toBeNull();
    expect(parseIsoDate(undefined)).toBeNull();
  });

  it("retorna null para string inválido", () => {
    expect(parseIsoDate("no-es-fecha")).toBeNull();
  });
});

// ── parseMixedDate ────────────────────────────────────────────────────────────
describe("parseMixedDate", () => {
  it("parsea formato ISO 'YYYY-MM-DD'", () => {
    const d = parseMixedDate("2025-04-04");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getFullYear()).toBe(2025);
    expect(d!.getMonth()).toBe(3); // abril = 3
  });

  it("parsea formato 'DD/MM/YYYY'", () => {
    const d = parseMixedDate("02/02/2025");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getUTCFullYear()).toBe(2025);
    expect(d!.getUTCMonth()).toBe(1); // febrero = 1
    expect(d!.getUTCDate()).toBe(2);
  });

  it("parsea epoch unix en segundos", () => {
    // 1735862400 = 2025-01-03 (aprox)
    const d = parseMixedDate("1735862400");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getFullYear()).toBe(2025);
  });

  it("retorna null para vacío / null", () => {
    expect(parseMixedDate("")).toBeNull();
    expect(parseMixedDate(null)).toBeNull();
  });

  it("retorna null para string inválido", () => {
    expect(parseMixedDate("no-es-fecha")).toBeNull();
  });
});

// ── isRead ───────────────────────────────────────────────────────────────────
describe("isRead", () => {
  it.each([
    ["read", true],
    ["READ", true],
    ["leido", true],
  ])("'%s' → true (leída)", (legacy, expected) => {
    expect(isRead(legacy)).toBe(expected);
  });

  it("'unread' → false (no leída)", () => {
    expect(isRead("unread")).toBe(false);
  });

  it("valor vacío/null → true (seguro por defecto = leída)", () => {
    expect(isRead(null)).toBe(true);
    expect(isRead("")).toBe(true);
  });
});

// ── normalizeKind ─────────────────────────────────────────────────────────────
describe("normalizeKind", () => {
  it.each(["info", "warn", "alert", "system", "marketing"])(
    "conserva el kind válido '%s'",
    (kind) => {
      expect(normalizeKind(kind)).toBe(kind);
    },
  );

  it("normaliza a minúsculas", () => {
    expect(normalizeKind("WARN")).toBe("warn");
  });

  it("kind desconocido cae a 'info'", () => {
    expect(normalizeKind("desconocido")).toBe("info");
    expect(normalizeKind(null)).toBe("info");
    expect(normalizeKind(undefined)).toBe("info");
  });
});
