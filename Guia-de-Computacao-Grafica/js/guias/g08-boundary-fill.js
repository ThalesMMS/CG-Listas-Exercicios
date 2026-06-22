/*
 * g08-boundary-fill.js — Guia: Boundary Fill (preenchimento por fronteira).
 * Espalha a partir de uma semente até encontrar a COR DE BORDA. Conectividade
 * 4 vs 8 e por que ela muda o resultado. Comparação com Flood Fill.
 *
 * Reusa EX.Raster.flood (BFS) para gerar a ordem de visita.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  var BNDS = { xmin: 0, xmax: 13, ymin: 0, ymax: 9 };
  var B = [BNDS.xmin, BNDS.xmax, BNDS.ymin, BNDS.ymax];
  var SEED = { x: 6, y: 4 };

  // Borda retangular (perímetro de [2..11]x[2..7]).
  var border = [];
  (function () {
    for (var x = 2; x <= 11; x++) {
      border.push([x, 2]);
      border.push([x, 7]);
    }
    for (var y = 3; y <= 6; y++) {
      border.push([2, y]);
      border.push([11, y]);
    }
  })();
  var blocked = {};
  border.forEach(function (c) {
    blocked[c[0] + "," + c[1]] = true;
  });
  var order = EX.Raster.flood(SEED, blocked, BNDS, 4);

  function drawBorder(plane) {
    border.forEach(function (c) {
      plane.pixel(c[0], c[1], { fill: COL.redSoft, stroke: COL.red });
    });
  }
  function frame(plane, count) {
    drawBorder(plane);
    for (var k = 0; k < count && k < order.length; k++) {
      plane.pixel(order[k].x, order[k].y, { fill: COL.accentSoft, stroke: COL.accent });
    }
    plane.pixel(SEED.x, SEED.y, { fill: COL.greenSoft, stroke: COL.green });
  }

  function build() {
    var steps = [];

    steps.push({
      title: "Pintar uma região já desenhada",
      body:
        "<p>Imagine um contorno fechado já na tela (a <span class='no'>borda</span>, em vermelho) e " +
        "queremos pintar o <b>interior</b>. Não temos a lista dos pixels internos — só um ponto de " +
        "partida, a <span class='ok'>semente</span>.</p>" +
        "<p>Boundary Fill resolve “de dentro para fora”: a partir da semente, espalha a cor até " +
        "<b>esbarrar na cor de borda</b>.</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          drawBorder(plane);
          plane.pixel(SEED.x, SEED.y, { fill: COL.greenSoft, stroke: COL.green, label: "•" });
        },
      },
    });

    steps.push({
      title: "A regra: espalhe até a cor de borda",
      body:
        "<p>Visite a semente, pinte-a e empilhe/enfileire os <b>vizinhos</b>. Para cada vizinho:</p>" +
        "<ul><li>se já é a <span class='no'>cor de borda</span> → <b>pare</b> ali (é a parede);</li>" +
        "<li>se já foi pintado → ignore;</li>" +
        "<li>senão → pinte e continue por ele.</li></ul>" +
        "<p>O critério de parada é a <b>cor da borda</b> — note: o interior pode ter qualquer cor, " +
        "contanto que não seja a da borda. (É essa a diferença para o Flood Fill.)</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          frame(plane, 0);
        },
      },
    });

    steps.push({
      title: "Conectividade 4 ou 8",
      body:
        "<p>“Vizinho” pode significar duas coisas:</p>" +
        "<ul><li><b>4-conex</b>: só ortogonais (↑ ↓ ← →).</li>" +
        "<li><b>8-conex</b>: ortogonais <em>e</em> diagonais.</li></ul>" +
        "<p>Importa de verdade: com 8-conex o preenchimento <b>vaza</b> por aberturas diagonais de 1 " +
        "pixel na borda; com 4-conex, não. Bordas pensadas para 4-conex precisam ser " +
        "<b>8-conexas</b> (sem furos diagonais) — e vice-versa.</p>",
      visual: {
        type: "plane",
        bounds: [-4, 4, -4, 4],
        draw: function (plane) {
          plane.pixel(0, 0, { fill: COL.greenSoft, stroke: COL.green, label: "c" });
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            plane.pixel(d[0], d[1], { fill: COL.accentSoft, stroke: COL.accent, label: "4" });
          });
          [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (d) {
            plane.pixel(d[0], d[1], { fill: COL.purpleSoft || "rgba(183,148,246,0.18)", stroke: COL.purple, label: "8" });
          });
        },
      },
    });

    var FRAMES = 6;
    for (var f = 1; f <= FRAMES; f++) {
      (function (count, idx) {
        steps.push({
          title: "Preenchendo… (" + Math.min(count, order.length) + "/" + order.length + ")",
          body:
            "<p>A frente de preenchimento avança a partir da semente (BFS, 4-conex), " +
            (idx === FRAMES
              ? "até <b>todo o interior</b> estar pintado. A borda conteve a tinta."
              : "parando sempre que toca a borda.") +
            "</p>",
          visual: {
            type: "plane",
            bounds: B,
            draw: function (plane) {
              frame(plane, count);
            },
          },
        });
      })(Math.round((order.length * f) / FRAMES), f);
    }

    steps.push(
      EX.Slides.comparison({
        title: "Boundary Fill × Flood Fill",
        intro: "<p>Parecidos no mecanismo (espalhar por vizinhos), diferentes no <b>critério de parada</b>:</p>",
        headers: ["", "Boundary Fill", "Flood Fill"],
        rows: [
          ["Para quando…", "acha a cor de BORDA", "acha cor ≠ cor antiga"],
          ["Interior", "pode ter cores variadas", "deve ser uma cor só"],
          ["Precisa saber", "a cor da borda", "a cor a substituir"],
          ["Uso típico", "contorno desenhado", "balde de tinta"],
        ],
      })
    );

    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Borda com furo</b>: se o contorno não é fechado (na conectividade usada), a tinta " +
        "<b>vaza</b> para fora.</li>" +
        "<li><b>Recursão</b>: a versão recursiva ingênua estoura a pilha em áreas grandes — prefira " +
        "uma fila/pilha explícita (como aqui).</li>" +
        "<li><b>Semente fora</b> da região pinta o lugar errado.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Em uma frase",
            html: "Espalhe a partir da semente; a <b>cor da borda</b> é a cerca que segura a tinta.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g08-boundary-fill",
    num: "▣",
    subject: "Computação Gráfica",
    section: "Preenchimento",
    title: "Boundary Fill",
    type: "computacional",
    tags: ["preenchimento", "fill", "semente"],
    hubDesc: "Espalha da semente até a cor de borda; conectividade 4/8; vs Flood Fill.",
    statement:
      "Entenda o Boundary Fill: preenchimento a partir de uma semente até encontrar a cor de borda, " +
      "com conectividade 4 ou 8, e a diferença para o Flood Fill.",
    parts: [{ label: "Guia", build: build }],
  });
})();
