/*
 * c18-rig-coloracao.js — Guia: Alocação de registradores (RIG + coloração de grafos).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  var NODES = {
    a: { x: 280, y: 60 }, b: { x: 420, y: 130 }, c: { x: 420, y: 270 },
    d: { x: 280, y: 340 }, e: { x: 140, y: 270 }, f: { x: 140, y: 130 },
  };
  var EDGES = [["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"], ["e", "f"], ["f", "a"], ["a", "d"]];

  function build() {
    return [
      {
        title: "Registradores são poucos; temporários são muitos",
        body:
          "<p>O programa usa muitos temporários, mas a CPU tem poucos registradores. Dois temporários " +
          "<b>vivos ao mesmo tempo</b> não podem usar o mesmo registrador — isso é uma " +
          "<b>interferência</b>, uma <b>aresta</b> no <b>grafo de interferência (RIG)</b>.</p>" +
          "<p>Alocar registradores = <b>colorir</b> o RIG com k cores (k = nº de registradores), sem " +
          "duas pontas de uma aresta com a mesma cor.</p>",
        visual: { type: "svg", draw: function (svg) { C.rig(svg, { nodes: NODES, edges: EDGES }); } },
      },
      {
        title: "Coloração mínima",
        body:
          "<p>Quantas cores (registradores) bastam? Este RIG é <b>bipartido</b> (um anel par + a " +
          "diagonal a–d), então <b>2 cores</b> resolvem: <span class='accent'>{a, c, e}</span> e " +
          "<span class='ok'>{b, d, f}</span> são conjuntos independentes; toda aresta cruza entre os " +
          "dois grupos.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.rig(svg, {
              nodes: NODES, edges: EDGES,
              colors: { a: "var(--accent)", c: "var(--accent)", e: "var(--accent)", b: "var(--green)", d: "var(--green)", f: "var(--green)" },
            });
          },
        },
      },
      C.domStep(
        "Heurística de simplificação (Kempe/Chaitin)",
        "Para k registradores, há um truque guloso: um nó com <b>grau &lt; k</b> sempre poderá ser " +
          "colorido <em>depois</em> (sobra cor para ele). Então:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Simplify</div>" +
          "<ol>" +
          "<li>remova repetidamente um nó de <b>grau &lt; k</b> e empilhe-o;</li>" +
          "<li>se todos saírem → o grafo é <b>k-colorível</b>;</li>" +
          "<li>recoloque na ordem <b>inversa</b>, dando a cada um uma cor livre.</li>" +
          "</ol>" +
          "<p>Com k = 3 neste grafo, uma ordem válida de remoção é " +
          "<code>b, c, e, f, a, d</code> (cada um com grau &lt; 3 ao sair).</p></div>"
      ),
      C.tableStep({
        title: "Quando trava: derramamento (spill)",
        body: "Se todos os nós restantes têm grau ≥ k, escolhe-se um para <b>derramar</b> (guardar na " +
          "memória). Pega-se o de <b>menor custo</b> = nº de usos − nº de conflitos + (5 se está em loop):",
        headers: ["nó", "usos", "conflitos", "loop", "custo"],
        rows: [
          ["A", "4", "1", "+5", "8"],
          ["B", "3", "1", "+5", "7"],
          ["C", "3", "2", "+5", "6"],
          ["D", "1", "0", "0", "1  ← derrama (menor)"],
        ],
      }),
      C.domStep(
        "Resumo",
        "RIG + coloração transformam alocação de registradores num problema de grafos.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Interferência vira aresta; <b>colorir com k cores</b> = alocar k registradores. Remova nós " +
          "de grau &lt; k; se travar, <b>derrame</b> o de menor custo.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c18-rig-coloracao",
    num: "RIG",
    subject: "Compiladores",
    section: "Alocação de Registradores",
    title: "RIG e coloração de grafos",
    type: "computacional",
    hubDesc: "Interferência → aresta; colorir com k cores = k registradores; simplificação e spill.",
    statement:
      "Entenda a alocação de registradores por coloração: o grafo de interferência (RIG), a coloração " +
      "com k cores, a heurística de simplificação e o derramamento (spill) de menor custo.",
    parts: [{ label: "Guia", build: build }],
  });
})();
