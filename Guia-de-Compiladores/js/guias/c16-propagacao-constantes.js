/*
 * c16-propagacao-constantes.js — Guia: Propagação de constantes (análise de fluxo de dados).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "Propagar constantes pelo programa todo",
        "A otimização local vê um bloco; a <b>análise de fluxo de dados</b> propaga fatos pelo " +
          "<b>grafo de fluxo de controle</b> (CFG) inteiro. Para constantes, o fato é: “que valor cada " +
          "variável tem aqui?”.",
        C.codeHtml("cada variável, em cada ponto, recebe um valor abstrato:\n   uma constante (ex.: 4)\n   ou  ⊤  (\"top\": não se sabe / não-constante)")
      ),
      C.domStep(
        "O lattice e a junção",
        "Os valores formam um <b>lattice</b>. O passo crucial é o <b>encontro</b> (junção) onde caminhos " +
          "do CFG se reúnem: combinam-se os valores vindos de cada caminho.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Regra da junção</div>" +
          "<ul>" +
          "<li>mesmo valor em todos os caminhos → mantém a <b>constante</b>;</li>" +
          "<li>valores <b>diferentes</b> (ou algum ⊤) → vira <b>⊤</b> (não-constante).</li>" +
          "</ul></div>"
      ),
      {
        title: "Exemplo: um if e a junção",
        body:
          "<p>Os dois ramos definem variáveis; no ponto <code>?</code> (junção) aplicamos a regra:</p>" +
          "<ul><li><b>X = 4</b>: ambos os ramos atribuem 4 → constante;</li>" +
          "<li><b>Y = ⊤</b>: só o ramo esquerdo define Y → desconhecido no outro caminho;</li>" +
          "<li><b>Z = 5</b>: vem de antes do if, igual nos dois → constante.</li></ul>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.flow(svg, {
              w: 660, h: 360,
              nodes: [
                { id: "e", x: 250, y: 24, w: 170, h: 50, lines: ["Z := 5", "C > 0"] },
                { id: "l", x: 90, y: 140, w: 170, h: 56, lines: ["Y := 1", "X := 4"] },
                { id: "r", x: 420, y: 140, w: 150, h: 50, lines: ["X := 4"] },
                { id: "j", x: 210, y: 270, w: 240, h: 70, lines: ["?  X = 4", "Y = ⊤", "Z = 5"], active: true },
              ],
              edges: [
                { from: "e", to: "l" }, { from: "e", to: "r" },
                { from: "l", to: "j" }, { from: "r", to: "j" },
              ],
            });
          },
        },
      },
      {
        title: "Com loops: iterar até o ponto fixo",
        body:
          "<p>Uma <b>back-edge</b> (aresta de retorno do loop) faz a análise <b>recircular</b>. " +
          "Repete-se a propagação até nada mudar (<b>ponto fixo</b>). Quando uma variável passa a " +
          "depender de um valor que ela mesma alimenta no loop, ela <b>perde a constância</b> e vira " +
          "<code>⊤</code>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.flow(svg, {
              w: 620, h: 360,
              nodes: [
                { id: "h", x: 220, y: 30, w: 180, h: 50, lines: ["X := 4 ; B > 0"] },
                { id: "b", x: 220, y: 160, w: 200, h: 56, lines: ["X := Z + 3", "Z := X + 6"], active: true },
                { id: "o", x: 220, y: 290, w: 180, h: 44, lines: ["saída: X = ⊤"] },
              ],
              edges: [
                { from: "h", to: "b" },
                { from: "b", to: "o" },
                { from: "b", to: "h", curve: 120, color: "var(--red)", label: "back-edge" },
              ],
            });
          },
        },
      },
      C.domStep(
        "Resumo",
        "Propagação de constantes é o exemplo canônico de análise de fluxo de dados.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Propague valores pelo CFG; na <b>junção</b>, valores divergentes viram <b>⊤</b>; com loops, " +
          "<b>itere até o ponto fixo</b>.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c16-propagacao-constantes",
    num: "⊤",
    subject: "Compiladores",
    section: "Otimização",
    title: "Propagação de constantes",
    type: "conceitual",
    hubDesc: "Fluxo de dados no CFG; lattice com ⊤; junção de caminhos; ponto fixo em loops.",
    statement:
      "Entenda a propagação de constantes como análise de fluxo de dados: o lattice com ⊤, a regra de " +
      "junção nos pontos de encontro e a iteração até o ponto fixo em loops.",
    parts: [{ label: "Guia", build: build }],
  });
})();
