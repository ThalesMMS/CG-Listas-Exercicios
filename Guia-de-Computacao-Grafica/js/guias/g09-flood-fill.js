/*
 * g09-flood-fill.js — Guia: Flood Fill (balde de tinta).
 * Recolore uma região conectada de UMA cor a partir de uma semente; o critério
 * de parada é a COR ANTIGA (não a cor de borda). Conectividade 4/8 e comparação
 * com Boundary Fill.
 *
 * Reusa EX.Raster.flood (BFS).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  var BNDS = { xmin: 0, xmax: 13, ymin: 0, ymax: 9 };
  var B = [BNDS.xmin, BNDS.xmax, BNDS.ymin, BNDS.ymax];
  var SEED = { x: 6, y: 4 };

  // Região de "cor antiga" = interior [3..10]x[3..6]; tudo o mais bloqueia.
  var region = [];
  for (var x = 3; x <= 10; x++) for (var y = 3; y <= 6; y++) region.push([x, y]);
  var inRegion = {};
  region.forEach(function (c) { inRegion[c[0] + "," + c[1]] = true; });
  var blocked = {};
  for (var bx = BNDS.xmin; bx <= BNDS.xmax; bx++)
    for (var by = BNDS.ymin; by <= BNDS.ymax; by++)
      if (!inRegion[bx + "," + by]) blocked[bx + "," + by] = true;
  var order = EX.Raster.flood(SEED, blocked, BNDS, 4);

  function frame(plane, count) {
    // contorno do interior (referência da "cor antiga")
    region.forEach(function (c) {
      plane.pixel(c[0], c[1], { fill: "rgba(120,130,150,0.20)", stroke: COL.muted });
    });
    for (var k = 0; k < count && k < order.length; k++) {
      plane.pixel(order[k].x, order[k].y, { fill: COL.greenSoft, stroke: COL.green });
    }
    plane.pixel(SEED.x, SEED.y, { fill: COL.greenSoft, stroke: COL.green, label: "•" });
  }

  function build() {
    var steps = [];

    steps.push({
      title: "O balde de tinta",
      body:
        "<p>Você clica numa área de cor uniforme e ela toda muda de cor — é o Flood Fill, o " +
        "“balde de tinta” dos editores.</p>" +
        "<p>A região (em cinza) tem <b>uma cor só</b>; a semente marca onde clicamos. A tinta nova se " +
        "espalha por toda a mancha conectada que compartilha aquela cor.</p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { frame(plane, 0); } },
    });

    steps.push({
      title: "A regra: troque a cor antiga pela nova",
      body:
        "<p>Guarde a <b>cor antiga</b> = cor da semente. Então, espalhando por vizinhos:</p>" +
        "<ul><li>se o vizinho tem a <span class='hl'>cor antiga</span> → repinte e continue;</li>" +
        "<li>se tem <b>qualquer outra cor</b> → pare (é fronteira da mancha).</li></ul>" +
        "<p>Aqui o limite não é uma “cor de borda” específica: é <b>tudo que não seja a cor antiga</b>. " +
        "Por isso a região a recolorir precisa ser de uma cor homogênea.</p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { frame(plane, 0); } },
    });

    steps.push({
      title: "Conectividade 4 ou 8",
      body:
        "<p>Como no Boundary Fill, “vizinho” pode ser <b>4-conex</b> (ortogonais) ou <b>8-conex</b> " +
        "(incluindo diagonais). Com 8-conex, manchas que se tocam só pela quina são tratadas como " +
        "<b>uma só</b>; com 4-conex, ficam separadas.</p>",
      visual: {
        type: "plane",
        bounds: [-4, 4, -4, 4],
        draw: function (plane) {
          plane.pixel(0, 0, { fill: COL.greenSoft, stroke: COL.green, label: "c" });
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            plane.pixel(d[0], d[1], { fill: COL.accentSoft, stroke: COL.accent, label: "4" });
          });
          [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (d) {
            plane.pixel(d[0], d[1], { fill: "rgba(183,148,246,0.18)", stroke: COL.purple, label: "8" });
          });
        },
      },
    });

    var FRAMES = 6;
    for (var f = 1; f <= FRAMES; f++) {
      (function (count, idx) {
        steps.push({
          title: "Recolorindo… (" + Math.min(count, order.length) + "/" + order.length + ")",
          body:
            "<p>A nova cor toma a mancha a partir da semente (BFS, 4-conex), " +
            (idx === FRAMES
              ? "até <b>toda a região de cor antiga</b> ter sido trocada."
              : "sempre só onde encontra a <b>cor antiga</b>.") +
            "</p>",
          visual: { type: "plane", bounds: B, draw: function (plane) { frame(plane, count); } },
        });
      })(Math.round((order.length * f) / FRAMES), f);
    }

    steps.push(
      EX.Slides.comparison({
        title: "Flood Fill × Boundary Fill",
        intro: "<p>Mesmo motor (BFS/DFS por vizinhos); muda <b>o que faz parar</b>:</p>",
        headers: ["", "Flood Fill", "Boundary Fill"],
        rows: [
          ["Para quando…", "cor ≠ cor antiga", "acha a cor de BORDA"],
          ["Região", "precisa ser uma cor só", "interior pode variar"],
          ["Conhece", "a cor a substituir", "a cor da borda"],
          ["Metáfora", "balde de tinta", "cerca em volta da tinta"],
        ],
      })
    );

    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Bordas suavizadas</b> (antialiasing): pixels de cor intermediária não batem com a " +
        "cor antiga e deixam uma “franja” não pintada.</li>" +
        "<li><b>Comparação por tolerância</b>: editores aceitam cores “quase iguais” para contornar " +
        "isso.</li>" +
        "<li><b>Recursão</b>: use fila/pilha explícita para não estourar a pilha.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Em uma frase",
            html: "Espalhe a partir da semente trocando <b>a cor antiga</b> pela nova; pare em qualquer outra cor.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g09-flood-fill",
    num: "▦",
    subject: "Computação Gráfica",
    section: "Preenchimento",
    title: "Flood Fill",
    type: "computacional",
    tags: ["preenchimento", "fill", "semente"],
    hubDesc: "Recolore uma região de uma cor a partir da semente; conectividade 4/8; vs Boundary Fill.",
    statement:
      "Entenda o Flood Fill: recoloração de uma região conectada de mesma cor a partir de uma semente, " +
      "com conectividade 4 ou 8, e a diferença para o Boundary Fill.",
    parts: [{ label: "Guia", build: build }],
  });
})();
