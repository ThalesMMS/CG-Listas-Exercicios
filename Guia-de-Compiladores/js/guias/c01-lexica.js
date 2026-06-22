/*
 * c01-lexica.js — Guia: Análise léxica (scanner Flex-like).
 * Tokenização por maximal munch (maior casamento) + prioridade de regras.
 * Reusa EX.Compilers (kit): tape, tableStep, domStep.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "Quebrar a entrada em tokens",
        "O analisador léxico lê os caracteres e os agrupa em <b>tokens</b> (lexemas + categoria). " +
          "O problema central: quando <b>várias regras</b> podem casar a partir da posição atual, " +
          "qual usar e <b>quanto consumir</b>?",
        "<p>Especificação de exemplo (Flex-like):</p>" +
          C.codeHtml("c*b     { print \"X\" }\nac      { print \"Y\" }\nc*ac*   { print \"Z\" }") +
          "<p>Entrada: <code>cbaccacacccbbcccbaccac</code> &nbsp;→&nbsp; saída: <b>XZYZXXXZY</b></p>"
      ),
      C.domStep(
        "Regra 1 — maximal munch (maior casamento)",
        "A cada passo, o scanner consome o <b>maior prefixo</b> que casa <em>alguma</em> regra. " +
          "Por quê? Senão <code>ac</code> seria sempre preferido a <code>acc</code>, e identificadores " +
          "como <code>conta</code> virariam <code>c</code>+<code>onta</code>. O léxico quer a maior " +
          "“mordida” possível.",
        C.codeHtml("posição em ...accac...\n  ac     casa  (regra ac)        → 2 chars\n  acc    casa  (regra c*ac*)     → 3 chars  ✓ vence (maior)")
      ),
      C.domStep(
        "Regra 2 — prioridade (ordem das regras)",
        "Quando duas regras casam o <b>mesmo tamanho</b>, vence a que aparece <b>primeiro</b> na " +
          "especificação. É assim que palavras-chave (listadas antes) ganham de identificadores " +
          "genéricos com o mesmo lexema.",
        C.codeHtml("posição em ...ac (fim) ...\n  ac     (regra 2)  → 2 chars\n  c*ac*  (regra 3)  → 2 chars   empate!\n  → vence a regra de MENOR número: ac (Y)")
      ),
      C.tableStep({
        title: "Trace completo",
        body: "Aplicando maior-casamento + prioridade, da esquerda para a direita:",
        headers: ["#", "prefixo", "regra", "saída", "por quê"],
        rows: [
          ["1", "cb", "c*b (1)", "X", "maior casamento no início"],
          ["2", "acc", "c*ac* (3)", "Z", "acc (3) > ac (2)"],
          ["3", "ac", "ac (2)", "Y", "empate em 2 → regra 2"],
          ["4", "accc", "c*ac* (3)", "Z", "maior casamento"],
          ["5", "b", "c*b (1)", "X", "c* vazio + b"],
          ["6", "b", "c*b (1)", "X", "—"],
          ["7", "cccb", "c*b (1)", "X", "c* = ccc"],
          ["8", "acc", "c*ac* (3)", "Z", "maior casamento"],
          ["9", "ac", "ac (2)", "Y", "empate → regra 2"],
        ],
      }),
      {
        title: "A fita de tokens",
        body: "Cada mordida vira um token (lexema em cima, categoria embaixo). A saída concatena as ações: <b>XZYZXXXZY</b>.",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.tape(svg, [
              { lexeme: "cb", label: "X" },
              { lexeme: "acc", label: "Z" },
              { lexeme: "ac", label: "Y" },
              { lexeme: "accc", label: "Z" },
              { lexeme: "b", label: "X" },
            ], { active: 1 });
          },
        },
      },
      C.domStep(
        "Armadilhas e resumo",
        "Os dois critérios juntos resolvem toda a ambiguidade do scanner.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em duas regras</div>" +
          "<ul><li><b>Maior casamento</b> primeiro (maximal munch);</li>" +
          "<li><b>empate</b> → a regra listada <b>antes</b> vence.</li></ul>" +
          "<p>Cuidado: <code>c*</code> pode casar <b>vazio</b>, então <code>c*b</code> casa um " +
          "simples <code>b</code>. E reordenar as regras muda a saída.</p></div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c01-lexica",
    num: "Léx",
    subject: "Compiladores",
    section: "Análise Léxica",
    title: "Análise léxica (maximal munch)",
    type: "computacional",
    hubDesc: "Tokenização por maior casamento + prioridade de regras; trace de um scanner Flex-like.",
    statement:
      "Entenda como um analisador léxico Flex-like decide a tokenização: a regra do maior casamento " +
      "(maximal munch) e o desempate por ordem das regras.",
    parts: [{ label: "Guia", build: build }],
  });
})();
