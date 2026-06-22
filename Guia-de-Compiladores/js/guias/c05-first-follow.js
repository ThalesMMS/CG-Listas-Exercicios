/*
 * c05-first-follow.js — Guia: conjuntos FIRST e FOLLOW.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;
  var G = EX.GuiaC;

  function build() {
    return [
      G.gstep(
        "Para que servem FIRST e FOLLOW",
        "Para montar a tabela preditiva precisamos saber, para cada produção, <b>com quais terminais " +
          "ela pode começar</b> (FIRST) e — quando uma produção pode sumir (λ) — <b>o que pode vir " +
          "logo depois</b> de um não-terminal (FOLLOW). Trabalharemos com esta gramática:",
        ["S → ( T", "T → C A | )", "A → ; B | )", "B → C A | )", "C → 0 | 1 | S"]
      ),
      C.domStep(
        "Regras de FIRST",
        "FIRST(α) = os terminais que podem iniciar uma string derivada de α.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Como calcular FIRST(X)</div>" +
          "<ul>" +
          "<li>terminal <code>a</code>: FIRST = <code>{a}</code>;</li>" +
          "<li>produção <code>A → X₁ X₂ …</code>: junte FIRST(X₁); se <code>X₁ ⇒ λ</code>, junte também " +
          "FIRST(X₂), e assim por diante;</li>" +
          "<li><code>λ ∈ FIRST(A)</code> se <b>toda</b> a produção pode derivar λ.</li>" +
          "</ul></div>"
      ),
      C.tableStep({
        title: "FIRST — exemplo",
        body: "Note a propagação: como <code>C → S</code>, FIRST(C) herda FIRST(S) = { ( }; e " +
          "<code>T → C A | )</code> herda FIRST(C) e ainda ganha o terminal <code>)</code>.",
        headers: ["não-terminal", "FIRST"],
        rows: [
          ["S", "{ ( }"],
          ["T", "{ ), 0, 1, ( }"],
          ["A", "{ ;, ) }"],
          ["B", "{ ), 0, 1, ( }"],
          ["C", "{ 0, 1, ( }"],
        ],
      }),
      C.domStep(
        "Regras de FOLLOW",
        "FOLLOW(A) = os terminais que podem aparecer <b>imediatamente depois</b> de A em alguma " +
          "derivação. Só importa de verdade quando A pode derivar λ.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Como calcular FOLLOW(A)</div>" +
          "<ul>" +
          "<li><code>$</code> (fim) ∈ FOLLOW(símbolo inicial);</li>" +
          "<li>em <code>B → α A β</code>: junte <code>FIRST(β) − {λ}</code> a FOLLOW(A);</li>" +
          "<li>se <code>β ⇒ λ</code> (ou A está no fim), junte <b>FOLLOW(B)</b> a FOLLOW(A).</li>" +
          "</ul></div>"
      ),
      C.tableStep({
        title: "FOLLOW — exemplo",
        body: "Como <code>C</code> aparece em <code>T → C A</code> e <code>B → C A</code>, FOLLOW(C) " +
          "recebe FIRST(A) = { ;, ) }.",
        headers: ["não-terminal", "FOLLOW"],
        rows: [
          ["S", "{ $, ;, ) }"],
          ["T", "{ $, ;, ) }"],
          ["A", "{ $, ;, ) }"],
          ["B", "{ $, ;, ) }"],
          ["C", "{ ;, ) }"],
        ],
      }),
      C.tableStep({
        title: "Quando há λ: o caso interessante",
        body: "Em <code>A → x C B y</code>, <code>B → z | λ</code>, <code>C → y | B x</code>: como " +
          "<code>B</code> pode ser λ, FIRST(C) ganha o <code>x</code> de <code>B x</code> (além de y, z). " +
          "É a λ que faz FIRST/FOLLOW “vazarem”.",
        headers: ["não-terminal", "FIRST", "FOLLOW"],
        rows: [
          ["A", "{ x }", "{ }"],
          ["B", "{ z, λ }", "{ x, y }"],
          ["C", "{ x, y, z }", "{ y, z }"],
        ],
      }),
      C.domStep(
        "Resumo",
        "FIRST e FOLLOW alimentam a construção da tabela LL(1) (próximo guia).",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "FIRST = “por onde a produção <b>começa</b>”; FOLLOW = “o que pode vir <b>depois</b>” — " +
          "essencial só quando a produção pode <b>desaparecer</b> (λ).</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c05-first-follow",
    num: "F/F",
    subject: "Compiladores",
    section: "Análise Sintática LL(1)",
    title: "Conjuntos FIRST e FOLLOW",
    type: "computacional",
    hubDesc: "Regras de FIRST/FOLLOW, propagação por λ e os conjuntos das gramáticas da Lista A.",
    statement:
      "Entenda os conjuntos FIRST e FOLLOW: suas regras de cálculo, a propagação quando há produções " +
      "λ, e como eles preparam a construção da tabela LL(1).",
    parts: [{ label: "Guia", build: build }],
  });
})();
