/*
 * g12-bsp.js — Guia: BSP Tree (Binary Space Partitioning).
 * Escolha de planos, classificação frente(+)/trás(−) pela normal, construção
 * recursiva da árvore e travessia trás-para-frente (algoritmo do pintor).
 *
 * Visual: SVG (svg.line/arrow/circle/text) + EX.Diagram.tree (edgeLabel +/−).
 */
(function () {
  "use strict";
  var EX = window.EX;

  // Cena top-down: 3 objetos.
  var A = [120, 150], Bp = [330, 110], C = [350, 220];

  function obj(svg, p, n, color) {
    svg.circle(p[0], p[1], 15, { fill: color || "var(--green)", stroke: "var(--ink)", strokeWidth: 1.5 });
    svg.text(p[0], p[1], n, { size: 14, color: "var(--bg)", weight: 800 });
  }
  function plane(svg, p, q, mid, nrm, name) {
    svg.line(p[0], p[1], q[0], q[1], { stroke: "var(--accent)", strokeWidth: 2.5 });
    svg.arrow(mid[0], mid[1], mid[0] + nrm[0], mid[1] + nrm[1], { color: "var(--orange)", head: 9, strokeWidth: 2 });
    svg.text(p[0], p[1] - 10, name, { size: 14, weight: 700, color: "var(--accent)" });
  }

  function tree() {
    return {
      id: "p1", label: "p₁",
      children: [
        { id: "A", label: "A", edgeLabel: "−" },
        {
          id: "p2", label: "p₂", edgeLabel: "+",
          children: [
            { id: "B", label: "B", edgeLabel: "+" },
            { id: "C", label: "C", edgeLabel: "−" },
          ],
        },
      ],
    };
  }

  function build() {
    return [
      {
        title: "Ordenar profundidade de uma vez por todas",
        body:
          "<p>Para desenhar superfícies na ordem certa (de trás para frente) sem recalcular tudo a " +
          "cada quadro, a <b>BSP</b> particiona o espaço com <b>planos</b> e guarda o resultado numa " +
          "árvore binária.</p>" +
          "<p>Montada uma vez, ela serve para <b>qualquer</b> ponto de vista — só muda como a " +
          "percorremos.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(480, 300);
            obj(svg, A, "A"); obj(svg, Bp, "B"); obj(svg, C, "C");
          },
        },
      },
      {
        title: "Um plano + a normal classificam tudo",
        body:
          "<p>Escolhemos um plano <code>p₁</code> com uma <b>normal</b> (seta laranja). A normal define " +
          "o lado <b>frente (+)</b>; o oposto é <b>trás (−)</b>.</p>" +
          "<p>Cada objeto cai de um lado: <span class='no'>A</span> fica <b>atrás</b> (−); " +
          "<span class='ok'>B</span> e <span class='ok'>C</span> ficam <b>à frente</b> (+). É só testar " +
          "de que lado do plano está cada objeto.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(480, 300);
            plane(svg, [240, 30], [240, 270], [240, 150], [26, 0], "p₁");
            obj(svg, A, "A", "var(--red)");
            obj(svg, Bp, "B"); obj(svg, C, "C");
          },
        },
      },
      {
        title: "Recursão em cada lado",
        body:
          "<p>O lado de trás de <code>p₁</code> só tem A → vira <b>folha</b>. O lado da frente ainda " +
          "tem B e C, então escolhemos outro plano <code>p₂</code> ali e repetimos:</p>" +
          "<ul><li><span class='ok'>B</span> à frente de p₂ (+);</li>" +
          "<li><span class='no'>C</span> atrás de p₂ (−).</li></ul>" +
          "<p>Sem mais mistura → todas folhas. A recursão termina.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(480, 300);
            plane(svg, [240, 30], [240, 270], [240, 150], [26, 0], "p₁");
            plane(svg, [250, 165], [470, 165], [360, 165], [0, -24], "p₂");
            obj(svg, A, "A", "var(--red)");
            obj(svg, Bp, "B"); obj(svg, C, "C");
          },
        },
      },
      {
        title: "A árvore BSP",
        body:
          "<p>Planos viram <b>nós internos</b>; objetos viram <b>folhas</b>. As arestas marcam o lado: " +
          "<code>+</code> (frente, lado da normal) e <code>−</code> (trás).</p>" +
          "<p>Aqui: raiz <code>p₁</code> → (− : A) e (+ : <code>p₂</code> → (+ : B), (− : C)).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(560, 300);
            EX.Diagram.tree(svg, tree(), { nodeShape: "box", highlight: ["p1", "p2"], view: [560, 300] });
          },
        },
      },
      {
        title: "Para que serve: o algoritmo do pintor",
        body:
          "<p>Dado o observador, percorra a árvore <b>trás-para-frente</b>: em cada nó, desenhe " +
          "primeiro o lado <b>oposto</b> ao olho, depois o plano, depois o lado do olho.</p>" +
          "<p>Resultado: as superfícies saem na ordem de profundidade <b>correta</b>, sem z-buffer. " +
          "Como a árvore é fixa, isso funciona para qualquer ângulo — só o sentido da travessia muda.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(480, 300);
            plane(svg, [240, 30], [240, 270], [240, 150], [26, 0], "p₁");
            obj(svg, A, "A", "var(--red)"); obj(svg, Bp, "B"); obj(svg, C, "C");
            svg.circle(440, 150, 10, { fill: "var(--ink)", stroke: "var(--yellow)", strokeWidth: 2 });
            svg.text(440, 178, "olho", { size: 12, color: "var(--yellow)", weight: 700 });
          },
        },
      },
      {
        title: "Comparação e armadilhas",
        body: "<p>Características importantes da BSP:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.prosCons(host, {
              pros: [
                "Pré-computada uma vez, serve para qualquer câmera",
                "Ordem de profundidade correta sem z-buffer",
                "Boa para cenas estáticas (níveis de jogos clássicos)",
              ],
              cons: [
                "A árvore NÃO é única: depende dos planos escolhidos",
                "Um plano pode cortar um objeto em dois (split) e crescer a árvore",
                "Cenas dinâmicas exigem reconstrução",
              ],
            });
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Cada plano parte o espaço em <b>frente/trás</b> pela normal; percorrer a árvore na " +
                "ordem certa dá a visibilidade.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g12-bsp",
    num: "⋔",
    subject: "Computação Gráfica",
    section: "Sólidos",
    title: "BSP Tree",
    type: "conceitual",
    tags: ["sólidos", "bsp", "particionamento"],
    hubDesc: "Planos, classificação frente(+)/trás(−) pela normal e travessia (algoritmo do pintor).",
    statement:
      "Entenda a BSP Tree: a escolha de planos, a classificação dos objetos frente/trás em relação às " +
      "normais, a construção recursiva da árvore e seu uso para ordenação por profundidade.",
    parts: [{ label: "Guia", build: build }],
  });
})();
