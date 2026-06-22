/*
 * c09-regras-tipo.js — Guia: Regras de inferência de tipos (boas regras + ambiente do Let).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "Provar o tipo de uma expressão",
        "O type checker prova julgamentos da forma <code>O, M, C ⊢ e : T</code> — “no ambiente de " +
          "variáveis O, com métodos M, na classe C, a expressão <b>e</b> tem tipo <b>T</b>”. As " +
          "<b>regras de inferência</b> têm premissas em cima e a conclusão embaixo:",
        C.codeHtml("   O,M,C ⊢ e1 : Int    O,M,C ⊢ e2 : Int\n   ----------------------------------------   [Soma]\n          O,M,C ⊢ e1 + e2 : Int")
      ),
      C.domStep(
        "Regras 'boas' (corretas)",
        "Uma regra é <b>boa</b> se for <em>sólida</em>: sempre que ela conclui <code>e : T</code>, a " +
          "execução de <code>e</code> realmente produz um valor de tipo <code>T</code>. Senão, o " +
          "compilador “mente” sobre o tipo e o programa pode quebrar em runtime.",
        ""
      ),
      C.tableStep({
        title: "Avaliando quatro regras (Lista B)",
        body: "Confira se o tipo concluído bate com o que a operação realmente devolve:",
        headers: ["regra", "conclui", "veredito"],
        rows: [
          ["Sequência { e₁;…;eₙ }", "tipo de eₙ", "boa — o bloco vale a última expressão"],
          ["Comparação  e₁ < e₂", "Int", "ruim — < devolve Bool, não Int"],
          ["Divisão  e₁ / e₂", "Bool", "ruim — / devolve Int, não Bool"],
          ["isvoid(e)", "Bool", "boa — testa qualquer valor e devolve Bool"],
        ],
      }),
      {
        title: "Ambientes: a regra do Let",
        body:
          "<p>Em <code>let x : T₁ &lt;- e₁ in e₂</code>, <b>quando</b> a variável <code>x</code> existe? " +
          "O inicializador <code>e₁</code> roda <b>antes</b> de <code>x</code> entrar em escopo — então " +
          "<code>e₁</code> usa o ambiente <b>O</b> (sem x). Já <code>e₂</code> usa <b>O[T₁/x]</b> " +
          "(com x). O inicializador não pode enxergar a variável que está declarando.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(680, 200);
            C.box(svg, 40, 70, 150, 56, ["O", "(sem x)"], { fill: "var(--bg-soft)", stroke: "var(--border)", mono: false });
            svg.arrow(192, 98, 250, 98, { color: "var(--yellow)", strokeWidth: 3, head: 10 });
            C.box(svg, 256, 70, 170, 56, ["e₁ usa O"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)" });
            svg.arrow(428, 98, 486, 98, { color: "var(--green)", strokeWidth: 3, head: 10 });
            C.box(svg, 492, 70, 170, 56, ["e₂ usa O[T₁/x]"], { fill: "var(--green-soft)", stroke: "var(--green)" });
          },
        },
      },
      C.domStep(
        "A regra Let completa",
        "Juntando: o tipo do inicializador deve <b>conformar</b> ao declarado (<code>T₁' ≤ T₁</code>), " +
          "e o corpo é tipado no ambiente estendido. O resultado é o tipo do corpo.",
        C.codeHtml("O,M,C ⊢ e1 : T1'     T1' ≤ T1     O[T1/x],M,C ⊢ e2 : T2\n-----------------------------------------------------------  [Let-Init]\n        O,M,C ⊢ (let x : T1 <- e1 in e2) : T2")
      ),
      C.domStep(
        "Resumo",
        "Regras de inferência são o “contrato” do type checker.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Uma regra boa é <b>sólida</b> (o tipo concluído é o tipo real). E <b>ambientes</b> controlam " +
          "o escopo: no Let, <code>e₁</code> usa O; <code>e₂</code> usa O[T₁/x].</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c09-regras-tipo",
    num: "⊢",
    subject: "Compiladores",
    section: "Análise Semântica",
    title: "Regras de inferência de tipos",
    type: "conceitual",
    hubDesc: "Julgamentos O,M,C ⊢ e:T; regras sólidas (boas); ambientes e a regra do Let.",
    statement:
      "Entenda as regras de inferência de tipos: a notação de julgamentos, o que torna uma regra " +
      "'boa' (sólida) e o papel dos ambientes na regra do Let.",
    parts: [{ label: "Guia", build: build }],
  });
})();
