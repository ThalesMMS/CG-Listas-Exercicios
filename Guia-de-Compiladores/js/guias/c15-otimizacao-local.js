/*
 * c15-otimizacao-local.js — Guia: Otimização local (bloco básico).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.codeStep({
        title: "Otimizar dentro de um bloco básico",
        body: "Um <b>bloco básico</b> é uma sequência reta de instruções (sem desvios no meio). " +
          "Assuma que só <code>g</code> e <code>x</code> são usados fora dele:",
        code:
          "a := 1\n" +
          "b := 3\n" +
          "c := a + x\n" +
          "d := a * 3\n" +
          "e := b * 3\n" +
          "f := a + b\n" +
          "g := e - f",
        lang: "text",
      }),
      C.domStep(
        "Propagação de constantes e cópia",
        "Se uma variável tem valor <b>conhecido e único</b> naquele ponto, substitua-a por esse valor. " +
          "Aqui <code>a = 1</code> e <code>b = 3</code> propagam para baixo:",
        C.codeHtml("d := a * 3  →  d := 1 * 3  →  d := 3\ne := b * 3  →  e := 3 * 3  →  e := 9\nf := a + b  →  f := 1 + 3  →  f := 4\ng := e - f  →  g := 9 - 4  →  g := 5")
      ),
      C.domStep(
        "Subexpressões comuns e código morto",
        "Outras duas otimizações clássicas:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Duas regras</div>" +
          "<ul>" +
          "<li><b>Subexpressões comuns</b>: se um cálculo idêntico já foi feito e os operandos não " +
          "mudaram, reaproveite o resultado em vez de recalcular;</li>" +
          "<li><b>Código morto</b>: remova atribuições cujo resultado <b>nunca é usado</b>. Como " +
          "<code>c</code> não é referenciado fora, <code>c := a + x</code> pode sair.</li>" +
          "</ul></div>"
      ),
      C.tableStep({
        title: "Quais otimizações são válidas (Lista C, Q5)",
        body: "Cuidado com as inválidas — elas mudam o resultado:",
        headers: ["proposta", "válida?", "por quê"],
        rows: [
          ["linha 3 (c) é removida", "sim", "código morto: c não é usado fora"],
          ["o bloco reduz a g := 5", "sim", "tudo é constante após propagar"],
          ["linha 4 vira d := a * b", "não", "era a * 3, não a * b"],
          ["linha 5 vira e := d", "não", "d = 3 e e = 9 (expressões diferentes)"],
        ],
      }),
      C.domStep(
        "Resumo",
        "Encadeando otimizações válidas, o bloco inteiro colapsa em <code>g := 5</code>.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Propague o que é constante, reaproveite cálculos repetidos e <b>apague o que ninguém usa</b> " +
          "— sempre preservando o efeito observável (aqui, o valor de g).</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c15-otimizacao-local",
    num: "Opt",
    subject: "Compiladores",
    section: "Otimização",
    title: "Otimização local (bloco básico)",
    type: "computacional",
    hubDesc: "Propagação de constantes/cópia, subexpressões comuns e eliminação de código morto.",
    statement:
      "Entenda as otimizações locais de um bloco básico: propagação de constantes e cópia, eliminação " +
      "de subexpressões comuns e de código morto.",
    parts: [{ label: "Guia", build: build }],
  });
})();
