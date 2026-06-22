import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const path = "Guia-de-Compiladores/index.html";

assert.ok(existsSync(path), `${path} should exist`);

const html = readFileSync(path, "utf8");
const rootIndex = readFileSync("index.html", "utf8");

assert.ok(html.includes("<title>Guia de Compiladores</title>"), "page title should name the guide");
assert.match(html, /<h1[^>]*>Guia de Compiladores<\/h1>/, "main heading should name the guide");
assert.ok(html.includes("../portal.css"), "placeholder should reuse the root portal CSS");
assert.ok(html.includes("../portal.js"), "placeholder should reuse the root portal JS");
assert.ok(html.includes('href="../index.html"'), "placeholder should link back to the root index");
assert.ok(
  rootIndex.includes('href="Guia-de-Compiladores/index.html"'),
  "root index should link to the compilers guide",
);
assert.ok(
  rootIndex.includes("<h2>Guia de Compiladores</h2>"),
  "root index should display the compilers guide card",
);

console.log("Guia-de-Compiladores placeholder checks passed.");
