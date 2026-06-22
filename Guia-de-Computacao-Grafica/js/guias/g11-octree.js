/*
 * g11-octree.js — Guia: Octree (subdivisão espacial recursiva).
 * Intuição via quadtree (2D), critério de homogeneidade (cheio/vazio/parcial) e
 * a árvore de octantes em 3D. Comparação com a grade uniforme de voxels.
 *
 * Visual: SVG (svg.rect/polygon/text) + EX.Diagram.tree.
 */
(function () {
  "use strict";
  var EX = window.EX;

  // Quadrado com estado: "full" | "empty" | "partial".
  function quad(svg, x, y, s, state) {
    if (state === "partial") {
      var h = s / 2;
      var sub = [["full", 0, 0], ["empty", 1, 0], ["empty", 0, 1], ["full", 1, 1]];
      sub.forEach(function (q) {
        quad(svg, x + q[1] * h, y + q[2] * h, h, q[0]);
      });
      return;
    }
    svg.rect(x, y, s, s, {
      fill: state === "full" ? "var(--accent)" : "var(--bg-soft)",
      stroke: "var(--ink)",
      strokeWidth: 1.5,
    });
  }

  // Cubo isométrico simples (3 faces).
  function cube(svg, cx, cy) {
    var top = [[cx, cy - 56], [cx + 58, cy - 22], [cx, cy + 12], [cx - 58, cy - 22]];
    var left = [[cx - 58, cy - 22], [cx, cy + 12], [cx, cy + 80], [cx - 58, cy + 46]];
    var right = [[cx + 58, cy - 22], [cx, cy + 12], [cx, cy + 80], [cx + 58, cy + 46]];
    svg.polygon(top, { fill: "var(--accent)", opacity: 0.95, stroke: "var(--ink)", strokeWidth: 1.5 });
    svg.polygon(left, { fill: "var(--accent)", opacity: 0.5, stroke: "var(--ink)", strokeWidth: 1.5 });
    svg.polygon(right, { fill: "var(--accent)", opacity: 0.32, stroke: "var(--ink)", strokeWidth: 1.5 });
  }

  // Árvore de octantes do exemplo 4³ (0,1,2,3,4,6 cheios; 5,7 vazios).
  function octantTree() {
    var empty = { 5: 1, 7: 1 };
    var ch = [];
    for (var n = 0; n <= 7; n++) ch.push({ id: "o" + n, label: n + (empty[n] ? " □" : " ■") });
    return { id: "r", label: "4³", children: ch };
  }

  function build() {
    return [
      {
        title: "Guardar só onde há detalhe",
        body:
          "<p>Representar um sólido por uma grade cheia de <b>voxels</b> gasta memória " +
          "<code>O(n³)</code> — mesmo em regiões enormes e uniformes (todo cheio ou todo vazio).</p>" +
          "<p>A <b>octree</b> subdivide o espaço <b>só onde ele não é uniforme</b>. Regiões homogêneas " +
          "viram uma única folha; regiões mistas continuam sendo divididas.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 200);
            svg.rect(40, 40, 120, 120, { fill: "var(--accent)", opacity: 0.5, stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(100, 175, "1 folha", { size: 12, color: "var(--ink-dim)" });
            for (var i = 0; i < 6; i++)
              for (var j = 0; j < 6; j++)
                svg.rect(210 + i * 20, 40 + j * 20, 20, 20, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1 });
            svg.text(270, 175, "36 voxels", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Intuição em 2D: a quadtree",
        body:
          "<p>Em 2D, cada quadrado se divide em <b>4</b> (quadtree). A regra é recursiva:</p>" +
          "<ul>" +
          "<li><b>homogêneo</b> (todo cheio ou todo vazio) → vira <b>folha</b>, para de dividir;</li>" +
          "<li><b>parcial</b> (mistura) → <b>subdivide</b> em 4 e repete em cada um.</li>" +
          "</ul>" +
          "<p>Ao lado: o quadrante superior-esquerdo é <b>parcial</b>, então foi subdividido; os outros " +
          "três eram homogêneos e pararam.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(320, 320);
            quad(svg, 20, 20, 140, "partial");
            quad(svg, 160, 20, 140, "full");
            quad(svg, 20, 160, 140, "empty");
            quad(svg, 160, 160, 140, "full");
          },
        },
      },
      {
        title: "Os três estados",
        body:
          "<p>Cada nó é classificado por <b>homogeneidade</b>:</p>" +
          "<ul>" +
          "<li><span class='accent'>■ cheio</span> — folha;</li>" +
          "<li><span class='muted'>□ vazio</span> — folha;</li>" +
          "<li><b>◧ parcial</b> — nó interno: subdivide.</li>" +
          "</ul>" +
          "<p>A recursão para quando tudo é folha — ou quando se atinge a <b>resolução máxima</b> " +
          "(o tamanho de um voxel). A profundidade da árvore = nível de detalhe.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 140);
            svg.rect(30, 30, 80, 80, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(70, 125, "■ cheio", { size: 12, color: "var(--ink-dim)" });
            svg.rect(140, 30, 80, 80, { fill: "var(--bg-soft)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(180, 125, "□ vazio", { size: 12, color: "var(--ink-dim)" });
            quad(svg, 250, 30, 80, "partial");
            svg.text(290, 125, "◧ parcial", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Octree = a mesma ideia em 3D",
        body:
          "<p>Em 3D cada cubo se divide em <b>8 octantes</b>. O índice de um octante combina os bits de " +
          "posição em cada eixo:</p>" +
          "<div class='formula'>índice = x′ + 2·y′ + 4·z′    (x′, y′, z′ ∈ {0, 1})</div>" +
          "<p>Considere um bloco <b>4³</b> cheio, com um <b>entalhe</b> de 2 voxels no canto " +
          "superior — ele torna o cubo <b>heterogêneo</b>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(300, 220);
            cube(svg, 150, 110);
            svg.text(150, 205, "bloco 4³ com entalhe", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "A árvore do exemplo",
        body:
          "<p>A raiz <code>4³</code> é heterogênea → divide em 8. Classificando cada octante:</p>" +
          "<ul>" +
          "<li>octantes <b>0, 1, 2, 3, 4, 6</b> → <span class='accent'>cheios ■</span>;</li>" +
          "<li>octantes <b>5, 7</b> → <span class='no'>vazios □</span> (o entalhe).</li>" +
          "</ul>" +
          "<p>Todos os 8 ficaram homogêneos → a árvore tem <b>profundidade 1</b>. Se algum fosse " +
          "parcial, ele viraria um nó interno e subdividiria de novo.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(640, 320);
            EX.Diagram.tree(svg, octantTree(), { nodeShape: "circle", highlight: ["o5", "o7"], view: [640, 320] });
          },
        },
      },
      {
        title: "Comparação e resumo",
        body:
          "<p>Octree × grade de voxels:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.prosCons(host, {
              pros: [
                "Memória adaptativa: gasta só onde há detalhe",
                "Consultas espaciais rápidas (descarta ramos homogêneos)",
                "Níveis de detalhe naturais (profundidade variável)",
              ],
              cons: [
                "Travessia/atualização mais complexas que um array",
                "Cenas muito irregulares se aproximam do custo dos voxels",
              ],
            });
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Subdivida <b>só o heterogêneo</b>; o homogêneo vira uma folha. Em 3D, 8 filhos por nó.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g11-octree",
    num: "⊞",
    subject: "Computação Gráfica",
    section: "Sólidos",
    title: "Octree",
    type: "conceitual",
    tags: ["sólidos", "octree", "subdivisão"],
    hubDesc: "Subdivisão recursiva: homogêneo vira folha, parcial subdivide; 8 octantes em 3D.",
    statement:
      "Entenda a Octree: subdivisão espacial recursiva e montagem da árvore conforme a homogeneidade " +
      "(cheio/vazio/parcial) dos voxels, com o índice de octantes e a comparação com a grade uniforme.",
    parts: [{ label: "Guia", build: build }],
  });
})();
