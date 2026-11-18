import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { agrupar, coincideBusqueda, crearCsv } from "./admin-listas";

describe("Gestión de listas", () => {
  test("editar o borrar adultas incluye las dos confirmaciones y duplicados de la misma persona", () => {
    const personas = agrupar([
      { id: "seguro-1", nombre: "Ana", dni: "12345678", documento: "seguro", created_at: "2026-11-01" },
      { id: "reglamento-1", nombre: "Ana", dni: "12345678", documento: "reglamento", created_at: "2026-11-02" },
      { id: "seguro-2", nombre: "Ana", dni: "12345678", documento: "seguro", created_at: "2026-11-03" },
      { id: "otra", nombre: "Ana", dni: "87654321", documento: "seguro", created_at: "2026-11-03" },
    ]);
    assert.equal(personas.length, 2);
    const primera = personas[0];
    assert.ok(primera);
    assert.deepEqual(primera.ids, ["seguro-1", "reglamento-1", "seguro-2"]);
    assert.equal(primera.seguro, "2026-11-03");
    assert.equal(primera.reglamento, "2026-11-02");
  });
  test("buscar encuentra nombres con acentos y DNI con puntos", () => {
    assert.equal(coincideBusqueda("maria", "María López", "12.345.678"), true);
    assert.equal(coincideBusqueda("12345678", "María López", "12.345.678"), true);
    assert.equal(coincideBusqueda("99999999", "María López", "12.345.678"), false);
  });
  test("CSV conserva valores y neutraliza fórmulas", () => {
    assert.equal(crearCsv([["Nombre", "DNI"], ['Ana "López"', "12345678"], ["=1+1", null]]), '\uFEFF"Nombre";"DNI"\r\n"Ana ""López""";"12345678"\r\n"\'=1+1";""');
  });
});