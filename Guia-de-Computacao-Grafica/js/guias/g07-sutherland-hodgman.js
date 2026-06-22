/*
 * g07-sutherland-hodgman.js — Guia: recorte de POLÍGONOS por Sutherland-Hodgman.
 * Recorte borda a borda (pipeline de 4 estágios), a regra entrada/saída dos
 * vértices e a atualização da lista de vértices. Comparação com Weiler-Atherton.
 *
 * Reusa window.ALG.sutherlandHodgman (traço exato com frações).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var ALG = window.ALG;
  var COL = EX.CartesianPlane.COLORS;

  var W = { xmin: -2, xmax: 5, ymin: 1, ymax: 6 };
  var POLY = [
    { x: 0, y: 2 },
    { x: 8, y: 4 },
    { x: 3, y: 9 },
  ];
  var BOUNDS = [-3, 10, -1, 11];

  function pts(poly) {
    return poly.map(function (p) {
      return [p.x.num ? p.x.num() : p.x, p.y.num ? p.y.num() : p.y];
    });
  }
  function win(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, { fill: COL.accentSoft, stroke: COL.accent });
    plane.text(W.xmin, W.ymax, "janela", { color: COL.accent, dx: 2, dy: -6 });
  }
  function listStr(poly) {
    return poly
      .map(function (p) {
        return "(" + p.x.str() + ", " + p.y.str() + ")";
      })
      .join(", ");
  }

  function build() {
    var steps = [];
    var res = ALG.sutherlandHodgman(POLY, W);

    // 1) Motivação
    steps.push({
      title: "Recortar um polígono inteiro",
      body:
        "<p>Recortar segmentos soltos é fácil; recortar um <b>polígono</b> exige que a saída ainda " +
        "seja um <b>contorno fechado</b> — com vértices novos onde ele cruza a janela.</p>" +
        "<p>A sacada de Sutherland-Hodgman: não recorte contra a janela toda de uma vez. Recorte " +
        "contra <b>uma borda por vez</b>, em sequência — esquerda, direita, inferior, superior. " +
        "Cada estágio recebe um polígono e devolve outro, já aparado naquela borda.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.polygon(pts(POLY), { stroke: COL.yellow, fill: "rgba(255,209,102,0.12)", lineWidth: 2 });
          POLY.forEach(function (p, i) {
            plane.point(p.x, p.y, { color: COL.yellow, radius: 4, label: "ABC"[i] });
          });
        },
      },
    });

    // 2) A regra entrada/saída
    steps.push({
      title: "A regra dos vértices (entrada/saída)",
      body:
        "<p>Em cada borda, percorremos as arestas <code>S → P</code> do polígono e olhamos se cada " +
        "ponta está <b>dentro</b> ou <b>fora</b> daquela borda. São só 4 casos — a coluna “emite” diz " +
        "o que vai para a nova lista de vértices.</p>" +
        "<p>O segredo está nos cruzamentos: quando a aresta atravessa a borda, criamos um " +
        "<b>vértice novo</b> na interseção <code>I</code>. É isso que mantém o contorno fechado.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.table(host, {
            headers: ["aresta S → P", "emite"],
            rows: [
              ["dentro → dentro", "P"],
              ["dentro → fora", "I (interseção)"],
              ["fora → dentro", "I e depois P"],
              ["fora → fora", "— (nada)"],
            ],
          });
        },
      },
    });

    // 3..n) Animação por borda
    res.steps.forEach(function (st) {
      if (st.type === "init") {
        steps.push({
          title: "Lista inicial",
          body: "<p>Começamos com os vértices do polígono:</p><p class='formula'>[" + listStr(st.poly) + "]</p>",
          visual: {
            type: "plane",
            bounds: BOUNDS,
            draw: function (plane) {
              win(plane);
              plane.polygon(pts(st.poly), { stroke: COL.yellow, fill: "rgba(255,209,102,0.12)", lineWidth: 2 });
            },
          },
        });
      } else if (st.type === "clip") {
        var after = pts(st.poly);
        steps.push({
          title: "Recorte pela borda " + st.label,
          body:
            "<p>Aplicando a regra a cada aresta contra a fronteira <span class='hl'>" +
            st.label +
            "</span>, a lista passa a ter <b>" +
            st.poly.length +
            " vértices</b>:</p>" +
            "<p class='formula'>[" +
            listStr(st.poly) +
            "]</p>" +
            (st.before.length !== st.poly.length
              ? "<p>Vértices fora foram trocados por interseções na borda.</p>"
              : "<p>Nada cruzou esta borda: a lista não mudou.</p>"),
          visual: {
            type: "plane",
            bounds: BOUNDS,
            draw: function (plane) {
              win(plane);
              plane.polygon(pts(st.before), { stroke: COL.muted, dashed: true, fill: false, lineWidth: 1.5 });
              if (after.length)
                plane.polygon(after, { stroke: COL.green, fill: COL.greenSoft, lineWidth: 2.5 });
              after.forEach(function (p) {
                plane.point(p[0], p[1], { color: COL.green, radius: 3 });
              });
            },
          },
        });
      }
    });

    // n+1) Resultado
    steps.push({
      title: "Polígono recortado",
      body:
        "<p>Depois das 4 bordas, sobra o polígono inteiramente <b>dentro</b> da janela — com os " +
        "vértices originais que couberam e os novos vértices nas interseções.</p>" +
        "<p>Quatro passadas simples resolveram um recorte que, de cara, parecia complicado.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.polygon(pts(POLY), { stroke: COL.muted, dashed: true, fill: false, lineWidth: 1.5 });
          plane.polygon(pts(res.result), { stroke: COL.green, fill: COL.greenSoft, lineWidth: 3 });
        },
      },
    });

    // n+2) Comparação / limites
    steps.push({
      title: "Quando ele basta (e quando não)",
      body:
        "<p>Sutherland-Hodgman é perfeito para recortar contra uma <b>janela convexa</b> (o caso " +
        "usual: um retângulo). Mas tem um limite famoso com polígonos <b>côncavos</b>.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.prosCons(host, {
            pros: [
              "Simples: 4 estágios iguais em sequência",
              "Saída sempre é um polígono fechado",
              "Ótimo para janela retangular (convexa)",
            ],
            cons: [
              "Polígono côncavo pode gerar arestas degeneradas ligando partes separadas",
              "Para recorte contra polígono qualquer, usa-se Weiler-Atherton",
            ],
          });
        },
      },
    });

    // n+3) Armadilhas
    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Aresta de fechamento</b>: o último vértice liga de volta ao primeiro — não esqueça " +
        "essa aresta ao percorrer a lista.</li>" +
        "<li><b>Ordem das bordas</b> não muda o resultado final, mas muda as listas intermediárias.</li>" +
        "<li><b>Lista vazia</b>: se o polígono está todo fora de uma borda, o estágio devolve [] e " +
        "acabou (nada visível).</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Ideia-chave",
            html:
              "Um recorte difícil (polígono × janela) vira <b>quatro recortes fáceis</b> " +
              "(polígono × uma reta), encadeados.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g07-sutherland-hodgman",
    num: "⬠",
    subject: "Computação Gráfica",
    section: "Recorte",
    title: "Sutherland-Hodgman (recorte de polígonos)",
    type: "computacional",
    tags: ["recorte", "clipping", "polígono"],
    hubDesc: "Recorte borda a borda, regra entrada/saída dos vértices e lista de saída.",
    statement:
      "Entenda o recorte de polígonos por Sutherland-Hodgman: o recorte borda a borda, a análise de " +
      "entrada/saída dos vértices, o cálculo das interseções e a atualização da lista de vértices.",
    parts: [{ label: "Guia", build: build }],
  });
})();
