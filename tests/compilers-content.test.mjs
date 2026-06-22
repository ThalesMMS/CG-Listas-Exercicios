/*
 * compilers-content.test.mjs — Correctness checks for the Compiladores listas
 * and guides, beyond "it renders". Each block maps to a GitHub issue and asserts
 * the *content* is right (grammars productive, sets complete, terminology sound),
 * plus that list and guide stay in sync.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(p, "utf8");
// Normalize grammar notation so ASCII (lista) and Unicode (guia) compare equal.
const norm = (s) =>
  s.replace(/→/g, "->").replace(/∗/g, "*").replace(/′/g, "'").replace(/λ/g, "lambda").replace(/\s+/g, "");

/* ───────────────────────── issue #4: Lista A Q4 / Guia c03 ─────────────────────────
 * Grammar must be productive (has base cases) and the left-factoring must preserve
 * the language. We prove the latter exactly: inlining the fresh non-terminals S'/P'
 * back into the factored grammar must reproduce the original production set.
 */
{
  // Corrected ORIGINAL grammar (productions as arrays of symbols; [] = λ).
  const ORIG = {
    S: [["S", "+", "S"], ["S", "+", "P"], ["P"]],
    P: [["P", "*", "P"], ["P", "*", "I"], ["I"]],
    I: [["-", "I"], ["(", "S", ")"], ["D"]],
    D: [["0"], ["1", "N"]],
    N: [["0"], ["1"], ["N", "N"], []],
  };
  // Corrected FACTORED grammar (Sp = S', Pp = P').
  const FACT = {
    S: [["S", "+", "Sp"], ["P"]],
    Sp: [["S"], ["P"]],
    P: [["P", "*", "Pp"], ["I"]],
    Pp: [["P"], ["I"]],
    I: [["-", "I"], ["(", "S", ")"], ["D"]],
    D: [["0"], ["1", "N"]],
    N: [["0"], ["1"], ["N", "N"], []],
  };

  const isNT = (g, sym) => Object.prototype.hasOwnProperty.call(g, sym);

  // Productive non-terminals (standard fixpoint).
  function productive(g) {
    const prod = new Set();
    let changed = true;
    while (changed) {
      changed = false;
      for (const nt of Object.keys(g)) {
        if (prod.has(nt)) continue;
        if (g[nt].some((rhs) => rhs.every((sym) => !isNT(g, sym) || prod.has(sym)))) {
          prod.add(nt);
          changed = true;
        }
      }
    }
    return prod;
  }

  const prodOrig = productive(ORIG);
  for (const nt of Object.keys(ORIG)) {
    assert.ok(prodOrig.has(nt), `#4: original grammar non-terminal ${nt} must be productive (have a base case)`);
  }

  // One explicit leftmost terminal derivation, choosing the shortest expansion.
  function minLen(g) {
    const m = {};
    for (const nt of Object.keys(g)) m[nt] = Infinity;
    let changed = true;
    while (changed) {
      changed = false;
      for (const nt of Object.keys(g)) {
        for (const rhs of g[nt]) {
          const len = rhs.reduce((a, sym) => a + (isNT(g, sym) ? m[sym] : 1), 0);
          if (len < m[nt]) { m[nt] = len; changed = true; }
        }
      }
    }
    return m;
  }
  function deriveOne(g, start) {
    const m = minLen(g);
    let form = [start];
    const steps = [start];
    let guard = 0;
    while (form.some((sym) => isNT(g, sym))) {
      if (++guard > 100) throw new Error("derivation did not terminate");
      const i = form.findIndex((sym) => isNT(g, sym));
      const nt = form[i];
      // pick the production minimizing resulting minimum length
      const best = g[nt].reduce((a, b) => {
        const la = a.reduce((s, x) => s + (isNT(g, x) ? m[x] : 1), 0);
        const lb = b.reduce((s, x) => s + (isNT(g, x) ? m[x] : 1), 0);
        return lb < la ? b : a;
      });
      form = form.slice(0, i).concat(best, form.slice(i + 1));
      steps.push(form.join(" ") || "λ");
    }
    return { string: form.join(""), steps };
  }
  const der = deriveOne(ORIG, "S");
  assert.ok(der.string.length > 0, "#4: original grammar derives a non-empty terminal string");
  assert.equal(der.string, "0", `#4: shortest S derivation is the terminal "0" (got ${der.string})`);

  // Exact language preservation: inline the fresh non-terminals (Sp, Pp) and the
  // factored grammar must equal the original, set-for-set.
  function inline(g, fresh) {
    const out = {};
    for (const nt of Object.keys(g)) {
      if (fresh.includes(nt)) continue;
      out[nt] = [];
      for (const rhs of g[nt]) {
        let forms = [[]];
        for (const sym of rhs) {
          if (fresh.includes(sym)) {
            forms = forms.flatMap((f) => g[sym].map((alt) => f.concat(alt)));
          } else {
            forms = forms.map((f) => f.concat(sym));
          }
        }
        out[nt].push(...forms);
      }
    }
    return out;
  }
  const key = (g) =>
    Object.keys(g).sort().map((nt) => nt + ":" + g[nt].map((r) => r.join(" ")).sort().join("|")).join(";");
  assert.equal(
    key(inline(FACT, ["Sp", "Pp"])),
    key(ORIG),
    "#4: un-factoring S'/P' must reproduce the original grammar exactly (language preserved)",
  );

  // List and guide must show the same corrected grammar, and drop the false claim
  // that factoring alone yields LL(1)/disjoint FIRST.
  const listA = read("Compiladores-Lista-A/js/questions/compiladores/lista-a.js");
  const c03 = read("Guia-de-Compiladores/js/guias/c03-fatoracao.js");
  for (const [label, txt] of [["lista A Q4", listA], ["guia c03", c03]]) {
    const n = norm(txt);
    assert.ok(n.includes("S->S+S|S+P|P"), `#4: ${label} shows original S with base case |P`);
    assert.ok(n.includes("P->P*P|P*I|I"), `#4: ${label} shows original P with base case |I`);
    assert.ok(n.includes("S->S+S'|P"), `#4: ${label} shows factored S keeping |P`);
    assert.ok(n.includes("P->P*P'|I"), `#4: ${label} shows factored P keeping |I`);
  }
  assert.ok(
    !/primeiros símbolos distintos/.test(c03) && !/condição necessária para LL\(1\)/.test(c03),
    "#4: guia c03 no longer claims factoring guarantees disjoint FIRST / LL(1)",
  );
  assert.ok(/não garante/.test(c03) && /distintas/.test(c03), "#4: guia c03 states the correct caveat");
  assert.ok(/nao garante/.test(listA) && /FIRST disjuntos nem LL\(1\)/.test(listA), "#4: lista A Q4 states the correct caveat");
}

console.log("Compilers content checks passed.");
